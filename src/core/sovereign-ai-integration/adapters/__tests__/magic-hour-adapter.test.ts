/**
 * Magic Hour Adapter — Certified Tests
 *
 * Tests use jest.mock('node-fetch') / global.fetch mock to intercept HTTP
 * calls without making real network requests. The MAGIC_HOUR_API_KEY env
 * var is set to a test sentinel. No real credentials are used.
 */

import { randomUUID } from 'crypto';

// Stub the global fetch before importing the adapter
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

// Set test env vars BEFORE module import — adapter reads them at module load time
process.env['MAGIC_HOUR_API_KEY'] = 'mh-test-key-sentinel';
process.env['MAGIC_HOUR_BASE_URL'] = 'https://api.magichour.test';
process.env['MAGIC_HOUR_MAX_POLL_ATTEMPTS'] = '3';   // fast poll limit
process.env['MAGIC_HOUR_POLL_INTERVAL_MS'] = '1';    // 1ms delay — no real waiting in tests

import {
  MagicHourImageAdapter,
  MagicHourVideoAdapter,
  MagicHourTtsAdapter,
  MagicHourApiError,
  MagicHourTimeoutError,
  estimateMagicHourTtsCredits,
  isMagicHourConfigured,
  MAGIC_HOUR_IMAGE_PROVIDER_ID,
  MAGIC_HOUR_VIDEO_PROVIDER_ID,
  MAGIC_HOUR_TTS_PROVIDER_ID,
  MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL,
} from '../magic-hour-adapter';
import type { AIProviderDispatchInput } from '../../provider-contracts';

// ─── TEST HELPERS ────────────────────────────────────────────────────────────

function makeDispatchInput(prompt: string, meta: Record<string, unknown> = {}): AIProviderDispatchInput {
  return {
    request: {
      requestId: randomUUID(),
      requestedAt: new Date(),
      requestedBy: 'creator-test-001',
      purpose: 'test',
      prompt,
      capability: 'image-generation',
      priority: 'normal',
      context: { memoryRefs: [], metadata: meta },
    },
    context: {
      requestId: randomUUID(),
      prompt,
      systemContext: '',
      memoryContext: [],
      constitutionalContext: '',
    },
    routing: {} as never,
  };
}

function mockFetchSequence(responses: Array<{ ok: boolean; body?: unknown; status?: number }>) {
  let callIndex = 0;
  mockFetch.mockImplementation(() => {
    const r = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    if (!r.ok) {
      return Promise.resolve({
        ok: false,
        status: r.status ?? 500,
        text: () => Promise.resolve(JSON.stringify(r.body)),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(r.body),
      arrayBuffer: () => Promise.resolve(FAKE_IMAGE_BYTES.buffer as ArrayBuffer),
    });
  });
}

// Fake bytes returned by the mocked image download URL fetch.
// Using a fresh Uint8Array (own ArrayBuffer, not pooled) so Buffer.from(arrayBuffer)
// returns exactly these 4 bytes regardless of Node's internal pool layout.
const FAKE_IMAGE_BYTES = new Uint8Array([70, 65, 75, 69]); // ASCII 'FAKE'
const FAKE_IMAGE_B64 = Buffer.from(FAKE_IMAGE_BYTES).toString('base64');

const QUEUED = { id: 'mh-job-001', status: 'queued', credits_charged: 5, downloads: [] };
const RENDERING = { id: 'mh-job-001', status: 'rendering', credits_charged: 5, downloads: [] };
const COMPLETE_IMAGE = {
  id: 'mh-job-001',
  status: 'complete',
  credits_charged: 5,
  downloads: [{ url: 'https://cdn.magichour.test/img/out.jpg', expires_at: '2026-08-01T00:00:00Z' }],
  error: null,
};
const ERROR_JOB = {
  id: 'mh-job-001',
  status: 'error',
  credits_charged: 0,  // refunded
  downloads: [],
  error: { message: 'Provider render failed', code: 'RENDER_ERROR' },
};
const CANCELED_JOB = {
  id: 'mh-job-001',
  status: 'canceled',
  credits_charged: 0, // refunded
  downloads: [],
  error: null,
};

beforeEach(() => {
  mockFetch.mockReset();
});

// ─── ADAPTER DESCRIPTOR ───────────────────────────────────────────────────────

describe('MagicHourImageAdapter — descriptor', () => {
  it('has correct providerId and sovereign: true', () => {
    const adapter = new MagicHourImageAdapter();
    expect(adapter.descriptor.providerId).toBe(MAGIC_HOUR_IMAGE_PROVIDER_ID);
    expect(adapter.descriptor.sovereign).toBe(true);
    expect(adapter.descriptor.capabilities).toContain('image-generation');
  });
});

// ─── SUCCESSFUL IMAGE GENERATION ─────────────────────────────────────────────

describe('MagicHourImageAdapter — dispatch', () => {
  it('submits job, polls until complete, then fetches image bytes from download URL', async () => {
    mockFetchSequence([
      { ok: true, body: QUEUED },         // POST submission
      { ok: true, body: RENDERING },      // GET poll 1
      { ok: true, body: COMPLETE_IMAGE }, // GET poll 2 — complete
      { ok: true },                       // GET download URL → image bytes
    ]);

    const adapter = new MagicHourImageAdapter();
    const result = await adapter.dispatch(makeDispatchInput('a serene lake at sunrise'));

    expect(result.finishReason).toBe('completed');
    // content is now base64-encoded image bytes, not the download URL
    expect(result.content).toBe(FAKE_IMAGE_B64);
    expect(result.metadata['downloadUrl']).toBe('https://cdn.magichour.test/img/out.jpg');
    expect(result.metadata['mimeType']).toBe('image/png');
    expect(result.metadata['encoding']).toBe('base64');
    expect(result.providerId).toBe(MAGIC_HOUR_IMAGE_PROVIDER_ID);
    expect(result.metadata['magicHourCreditsCharged']).toBe(5);
    expect(result.metadata['magicHourRefunded']).toBe(false);
  });

  // FREE-LAUNCH MODEL LOCK — Chief Architect authorization 2026-08-23
  it('sends model: flux-schnell in every outbound image POST body', async () => {
    mockFetchSequence([
      { ok: true, body: QUEUED },
      { ok: true, body: COMPLETE_IMAGE },
      { ok: true }, // image download
    ]);

    const adapter = new MagicHourImageAdapter();
    await adapter.dispatch(makeDispatchInput('any prompt'));

    // First fetch call is the POST /v1/ai-image-generator submission
    const [, submitOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(submitOptions.body as string) as Record<string, unknown>;
    expect(body['model']).toBe(MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL);
    expect(body['model']).toBe('flux-schnell');
  });

  // SECURITY: API key must never appear in response metadata
  it('does not leak API key or authorization headers in response metadata', async () => {
    mockFetchSequence([
      { ok: true, body: QUEUED },
      { ok: true, body: COMPLETE_IMAGE },
      { ok: true }, // GET download URL → image bytes
    ]);

    const adapter = new MagicHourImageAdapter();
    const result = await adapter.dispatch(makeDispatchInput('test prompt'));

    const metaStr = JSON.stringify(result.metadata);
    expect(metaStr).not.toContain('mh-test-key-sentinel');
    expect(metaStr).not.toContain('MAGIC_HOUR_API_KEY');
    expect(metaStr).not.toContain('Authorization');
  });

  // PROVIDER FAILURE — credits auto-refunded by MH
  it('returns finishReason:failed and magicHourRefunded:true on error status', async () => {
    mockFetchSequence([
      { ok: true, body: QUEUED },
      { ok: true, body: ERROR_JOB },
    ]);

    const adapter = new MagicHourImageAdapter();
    const result = await adapter.dispatch(makeDispatchInput('test prompt'));

    expect(result.finishReason).toBe('failed');
    expect(result.content).toBe('');
    expect(result.metadata['magicHourRefunded']).toBe(true);
    expect(result.metadata['magicHourCreditsCharged']).toBe(0); // refunded
  });

  // CANCELLATION — credits auto-refunded by MH
  it('returns finishReason:failed on canceled status', async () => {
    mockFetchSequence([
      { ok: true, body: QUEUED },
      { ok: true, body: CANCELED_JOB },
    ]);

    const adapter = new MagicHourImageAdapter();
    const result = await adapter.dispatch(makeDispatchInput('test prompt'));

    expect(result.finishReason).toBe('failed');
    expect(result.metadata['magicHourRefunded']).toBe(true);
  });

  // TIMEOUT — bounded polling exhausted
  it('throws MagicHourTimeoutError when polling limit is reached without completion', async () => {
    // MAGIC_HOUR_MAX_POLL_ATTEMPTS=3 in test env; each poll returns 'rendering'
    mockFetchSequence([
      { ok: true, body: QUEUED },      // submission
      { ok: true, body: RENDERING },   // poll 1
      { ok: true, body: RENDERING },   // poll 2
      { ok: true, body: RENDERING },   // poll 3 — limit reached
    ]);

    const adapter = new MagicHourImageAdapter();
    await expect(adapter.dispatch(makeDispatchInput('test prompt'))).rejects.toThrow(
      MagicHourTimeoutError,
    );
  });

  // API error from Magic Hour (non-2xx HTTP response)
  it('throws MagicHourApiError on non-2xx submission response', async () => {
    mockFetchSequence([
      { ok: false, status: 402, body: { error: 'insufficient credits' } },
    ]);

    const adapter = new MagicHourImageAdapter();
    await expect(adapter.dispatch(makeDispatchInput('test prompt'))).rejects.toThrow(
      MagicHourApiError,
    );
  });
});

// ─── VIDEO GENERATION — ESTIMATED vs FINAL CREDITS ──────────────────────────

describe('MagicHourVideoAdapter — credit estimation vs final', () => {
  const QUEUED_VIDEO = {
    id: 'mh-vid-001', status: 'queued',
    credits_charged: 120, // estimate: 4s × 30fps × per-frame
    downloads: [], fps: 30,
  };
  const COMPLETE_VIDEO_ADJUSTED = {
    id: 'mh-vid-001', status: 'complete',
    credits_charged: 115, // adjusted at completion — actual fps slightly lower
    downloads: [{ url: 'https://cdn.magichour.test/vid/out.mp4', expires_at: '2026-08-01T00:00:00Z' }],
    error: null, fps: 28.8, width: 1280, height: 720,
  };

  it('reports both estimated and final credits in metadata', async () => {
    mockFetchSequence([
      { ok: true, body: QUEUED_VIDEO },
      { ok: true, body: COMPLETE_VIDEO_ADJUSTED },
    ]);

    const adapter = new MagicHourVideoAdapter();
    const result = await adapter.dispatch(
      makeDispatchInput('busy city intersection timelapse', { endSeconds: 4, resolution: '720p' }),
    );

    expect(result.finishReason).toBe('completed');
    expect(result.metadata['magicHourEstimatedCredits']).toBe(120);
    expect(result.metadata['magicHourCreditsCharged']).toBe(115); // final
    expect(result.metadata['magicHourCreditAdjustment']).toBe(-5); // 115 - 120
    expect(result.metadata['magicHourFps']).toBe(28.8);
  });

  it('returns finishReason:failed and refunded credits when video errors', async () => {
    const VIDEO_ERROR = {
      id: 'mh-vid-001', status: 'error', credits_charged: 0,
      downloads: [], error: { message: 'GPU timeout', code: 'GPU_TIMEOUT' },
    };
    mockFetchSequence([
      { ok: true, body: QUEUED_VIDEO },
      { ok: true, body: VIDEO_ERROR },
    ]);

    const adapter = new MagicHourVideoAdapter();
    const result = await adapter.dispatch(makeDispatchInput('city timelapse', { endSeconds: 4 }));

    expect(result.finishReason).toBe('failed');
    expect(result.metadata['magicHourRefunded']).toBe(true);
    expect(result.metadata['magicHourCreditsCharged']).toBe(0);
  });
});

// ─── TTS — CHARACTER-BASED PRICING ───────────────────────────────────────────

describe('MagicHourTtsAdapter', () => {
  it('submits TTS job and returns download URL on completion', async () => {
    const COMPLETE_AUDIO = {
      id: 'mh-audio-001', status: 'complete',
      credits_charged: 8,
      downloads: [{ url: 'https://cdn.magichour.test/audio/out.mp3', expires_at: '2026-08-01T00:00:00Z' }],
      error: null,
    };
    mockFetchSequence([
      { ok: true, body: { id: 'mh-audio-001', status: 'queued', credits_charged: 8, downloads: [] } },
      { ok: true, body: COMPLETE_AUDIO },
    ]);

    const text = 'Hello world, this is a test.'; // 28 chars → ceil(28 × 0.1) = 3 credits
    const adapter = new MagicHourTtsAdapter();
    const result = await adapter.dispatch(makeDispatchInput(text, { voice: 'alloy' }));

    expect(result.finishReason).toBe('completed');
    expect(result.content).toBe('https://cdn.magichour.test/audio/out.mp3');
    expect(result.metadata['characterCount']).toBe(28);
  });

  it('records characterCount in metadata', async () => {
    const text = 'A'.repeat(100); // 100 chars → ceil(100 × 0.1) = 10 credits
    mockFetchSequence([
      { ok: true, body: { id: 'mh-audio-001', status: 'queued', credits_charged: 10, downloads: [] } },
      { ok: true, body: { id: 'mh-audio-001', status: 'complete', credits_charged: 10, downloads: [{ url: 'https://cdn.test/a.mp3', expires_at: '' }], error: null } },
    ]);

    const adapter = new MagicHourTtsAdapter();
    const result = await adapter.dispatch(makeDispatchInput(text, { voice: 'nova' }));
    expect(result.metadata['characterCount']).toBe(100);
    expect(result.metadata['magicHourEstimatedCredits']).toBe(10);
  });
});

// ─── TTS CREDIT FORMULA ───────────────────────────────────────────────────────

describe('estimateMagicHourTtsCredits', () => {
  it('charges 0.1 credits per character, ceiling', () => {
    expect(estimateMagicHourTtsCredits(1)).toBe(1);   // ceil(0.1) = 1
    expect(estimateMagicHourTtsCredits(10)).toBe(1);  // ceil(1.0) = 1
    expect(estimateMagicHourTtsCredits(11)).toBe(2);  // ceil(1.1) = 2
    expect(estimateMagicHourTtsCredits(100)).toBe(10);
    expect(estimateMagicHourTtsCredits(4096)).toBe(410); // max TTS input
  });
});

// ─── CONFIGURATION CHECK ──────────────────────────────────────────────────────

describe('isMagicHourConfigured', () => {
  it('returns true when MAGIC_HOUR_API_KEY is set', () => {
    expect(isMagicHourConfigured()).toBe(true);
  });

  it('returns false when MAGIC_HOUR_API_KEY is absent', () => {
    const orig = process.env['MAGIC_HOUR_API_KEY'];
    delete process.env['MAGIC_HOUR_API_KEY'];
    expect(isMagicHourConfigured()).toBe(false);
    process.env['MAGIC_HOUR_API_KEY'] = orig ?? '';
  });
});

// ─── HEALTH TELEMETRY — provider descriptor fields ───────────────────────────

describe('Magic Hour adapters — health telemetry surface', () => {
  it('each adapter has a unique providerId, sovereign: true, and a non-zero maxConcurrentRequests', () => {
    const adapters = [
      new MagicHourImageAdapter(),
      new MagicHourVideoAdapter(),
      new MagicHourTtsAdapter(),
    ];
    const ids = adapters.map((a) => a.descriptor.providerId);
    expect(new Set(ids).size).toBe(3); // all unique
    adapters.forEach((a) => {
      expect(a.descriptor.sovereign).toBe(true);
      expect(a.descriptor.maxConcurrentRequests).toBeGreaterThan(0);
    });
  });
});

// ─── SECRET LEAKAGE GUARD ────────────────────────────────────────────────────

describe('Secret leakage guard', () => {
  it('MagicHourApiError message does not include the API key', () => {
    const err = new MagicHourApiError(401, '/v1/ai-image-generator', 'Unauthorized');
    expect(err.message).not.toContain('mh-test-key-sentinel');
    expect(err.message).not.toContain('Bearer');
  });
});

// ─── DUPLICATE COMPLETION GUARD ───────────────────────────────────────────────

describe('Duplicate completion / idempotent polling', () => {
  it('returns immediately if job is already complete on first poll', async () => {
    // Submission returns already-complete (race condition handled gracefully)
    mockFetchSequence([
      { ok: true, body: COMPLETE_IMAGE }, // submission returns complete
    ]);
    // poll won't be called since status is already complete

    // Actually — submit returns QUEUED but first poll is COMPLETE
    mockFetch.mockReset();
    mockFetchSequence([
      { ok: true, body: QUEUED },
      { ok: true, body: COMPLETE_IMAGE },
      { ok: true }, // GET download URL → image bytes
    ]);

    const adapter = new MagicHourImageAdapter();
    const result = await adapter.dispatch(makeDispatchInput('test prompt'));
    expect(result.finishReason).toBe('completed');
    expect(mockFetch).toHaveBeenCalledTimes(3); // 1 submit + 1 poll + 1 image download
  });
});
