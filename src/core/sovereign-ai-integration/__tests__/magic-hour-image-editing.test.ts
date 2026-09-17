/**
 * AZMA OS — Phase D: the image-editing seam.
 *
 * ─── WHY THE NETWORK IS MOCKED HERE, AND WHY THAT IS NOT A CHEAT ────────────
 *
 *   The directive says a test resting on a mock does not prove a real result.
 *   It does not, and this file does not claim to. The REAL capability was
 *   proven by a live end-to-end call against a production asset, recorded in
 *   the module's own header and in the Phase D report:
 *
 *     source 1,960,954 bytes  sha256 0ab57f32f4389268…
 *     result 1,804,819 bytes  sha256 144445c76165cea3…
 *
 *   What this file holds is the CONTRACT around that call — the upload/submit/
 *   poll/download sequence, and every refusal. Those must run on every commit,
 *   and a suite that spends provider credits and minutes of wall time on every
 *   commit would be abandoned within a week. This repository already carries
 *   three network-dependent suites that fail at random; adding a fourth that
 *   also costs money would be the wrong lesson learned twice.
 *
 *   The one thing a mock must never be used to assert is that bytes changed.
 *   That assertion lives in sovereign-asset-mutation.test.ts, where real byte
 *   arrays are hashed — and in the live measurement above.
 */

import {
  editImageViaProvider,
  imageEditingIsConfigured,
  ImageEditError,
} from '../adapters/magic-hour-image-editing';

const SOURCE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const PRODUCED = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 8, 7, 6]);

const realFetch = global.fetch;
let originalKey: string | undefined;

beforeEach(() => {
  originalKey = process.env.MAGIC_HOUR_API_KEY;
  process.env.MAGIC_HOUR_API_KEY = 'test-credential';
});
afterEach(() => {
  global.fetch = realFetch;
  if (originalKey === undefined) delete process.env.MAGIC_HOUR_API_KEY;
  else process.env.MAGIC_HOUR_API_KEY = originalKey;
});

/** A stand-in engine that follows the contract measured against the real one. */
function engine(behaviour: {
  uploadStatus?: number;
  putStatus?: number;
  submitStatus?: number;
  states?: string[];
  downloadStatus?: number;
  omitDownloadUrl?: boolean;
} = {}) {
  const states = behaviour.states ?? ['complete'];
  let polls = 0;
  const seen: string[] = [];

  global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    seen.push(`${init?.method ?? 'GET'} ${url.replace(/^https?:\/\/[^/]+/, '')}`);

    if (url.includes('/v1/files/upload-urls')) {
      const status = behaviour.uploadStatus ?? 200;
      return new Response(
        JSON.stringify({ items: [{ upload_url: 'https://cdn.example/put', file_path: 'api-assets/x/1' }] }),
        { status },
      );
    }
    if (url.includes('cdn.example/put')) {
      return new Response(null, { status: behaviour.putStatus ?? 200 });
    }
    if (url.includes('/v1/ai-image-editor')) {
      const status = behaviour.submitStatus ?? 200;
      return new Response(JSON.stringify({ id: 'job-1', credits_charged: 50 }), { status });
    }
    if (url.includes('/v1/image-projects/')) {
      const state = states[Math.min(polls, states.length - 1)];
      polls += 1;
      return new Response(JSON.stringify({
        id: 'job-1', status: state, credits_charged: 50,
        downloads: behaviour.omitDownloadUrl ? [] : [{ url: 'https://cdn.example/result.png' }],
      }), { status: 200 });
    }
    if (url.includes('cdn.example/result.png')) {
      const status = behaviour.downloadStatus ?? 200;
      return new Response(status === 200 ? new Uint8Array(PRODUCED) : null, {
        status, headers: { 'content-type': 'image/png' },
      });
    }
    return new Response(null, { status: 404 });
  }) as typeof fetch;

  return { seen: () => seen };
}

describe('Phase D — the image-editing contract', () => {
  it('follows upload → submit → poll → download, in that order', async () => {
    const probe = engine();
    const result = await editImageViaProvider(SOURCE, '.png', 'ضع دائرة حمراء', { pollIntervalMs: 1 });

    expect(result.bytes.equals(PRODUCED)).toBe(true);
    expect(result.mimeType).toBe('image/png');
    expect(result.creditsCharged).toBe(50);

    const calls = probe.seen();
    expect(calls[0]).toContain('/v1/files/upload-urls');
    expect(calls[1]).toContain('PUT');
    expect(calls[2]).toContain('/v1/ai-image-editor');
    expect(calls.some((c) => c.includes('/v1/image-projects/'))).toBe(true);
  });

  it('returns BYTES, never a URL — the anti-replay guard must be able to hash it', async () => {
    engine();
    const result = await editImageViaProvider(SOURCE, '.png', 'x', { pollIntervalMs: 1 });
    expect(Buffer.isBuffer(result.bytes)).toBe(true);
    expect(result.bytes.length).toBeGreaterThan(0);
  });

  it('waits through rendering rather than reporting a half-finished job', async () => {
    engine({ states: ['queued', 'rendering', 'rendering', 'complete'] });
    const result = await editImageViaProvider(SOURCE, '.png', 'x', { pollIntervalMs: 1 });
    expect(result.bytes.equals(PRODUCED)).toBe(true);
  });

  it('passes an Arabic instruction through unchanged', async () => {
    let sentPrompt: string | null = null;
    const base = engine();
    const wrapped = global.fetch;
    global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/v1/ai-image-editor') && typeof init?.body === 'string') {
        sentPrompt = JSON.parse(init.body).style.prompt;
      }
      return wrapped(input as RequestInfo, init);
    }) as typeof fetch;

    await editImageViaProvider(SOURCE, '.png', 'غيّر الخلفية إلى رفوف مكتبة خشبية', { pollIntervalMs: 1 });
    expect(sentPrompt).toBe('غيّر الخلفية إلى رفوف مكتبة خشبية');
    expect(base.seen().length).toBeGreaterThan(0);
  });

  describe('refusals — each surfaces, none is repaired silently', () => {
    it('refuses with no credential', async () => {
      delete process.env.MAGIC_HOUR_API_KEY;
      await expect(editImageViaProvider(SOURCE, '.png', 'x')).rejects.toMatchObject({ rejection: 'NO_CREDENTIAL' });
    });

    it('refuses an extension the engine does not read', async () => {
      engine();
      await expect(editImageViaProvider(SOURCE, '.svg', 'x'))
        .rejects.toMatchObject({ rejection: 'UNSUPPORTED_EXTENSION' });
    });

    it('accepts every extension the engine declared it reads', async () => {
      for (const ext of ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.avif', '.tiff', '.bmp']) {
        engine();
        await expect(editImageViaProvider(SOURCE, ext, 'x', { pollIntervalMs: 1 })).resolves.toBeDefined();
      }
    });

    it('refuses when the upload slot cannot be obtained', async () => {
      engine({ uploadStatus: 500 });
      await expect(editImageViaProvider(SOURCE, '.png', 'x')).rejects.toMatchObject({ rejection: 'UPLOAD_FAILED' });
    });

    it('refuses when the source cannot be delivered', async () => {
      engine({ putStatus: 403 });
      await expect(editImageViaProvider(SOURCE, '.png', 'x')).rejects.toMatchObject({ rejection: 'UPLOAD_FAILED' });
    });

    it('refuses when the job is not accepted', async () => {
      engine({ submitStatus: 422 });
      await expect(editImageViaProvider(SOURCE, '.png', 'x')).rejects.toMatchObject({ rejection: 'SUBMIT_FAILED' });
    });

    it('refuses when the engine reports an error state', async () => {
      engine({ states: ['rendering', 'error'] });
      await expect(editImageViaProvider(SOURCE, '.png', 'x', { pollIntervalMs: 1 }))
        .rejects.toMatchObject({ rejection: 'RENDER_FAILED' });
    });

    it('refuses when the engine never finishes', async () => {
      engine({ states: ['rendering'] });
      await expect(editImageViaProvider(SOURCE, '.png', 'x', { pollIntervalMs: 1, timeoutMs: 30 }))
        .rejects.toMatchObject({ rejection: 'TIMED_OUT' });
    });

    it('refuses a completed job that carries no result', async () => {
      engine({ omitDownloadUrl: true });
      await expect(editImageViaProvider(SOURCE, '.png', 'x', { pollIntervalMs: 1 }))
        .rejects.toMatchObject({ rejection: 'NO_OUTPUT' });
    });

    it('refuses when the result cannot be downloaded', async () => {
      engine({ downloadStatus: 404 });
      await expect(editImageViaProvider(SOURCE, '.png', 'x', { pollIntervalMs: 1 }))
        .rejects.toMatchObject({ rejection: 'NO_OUTPUT' });
    });

    it('every refusal is an ImageEditError, never a bare throw', async () => {
      engine({ submitStatus: 500 });
      await expect(editImageViaProvider(SOURCE, '.png', 'x')).rejects.toBeInstanceOf(ImageEditError);
    });
  });

  describe('capability is reported honestly', () => {
    it('is configured when a credential exists', () => {
      expect(imageEditingIsConfigured()).toBe(true);
    });

    it('is NOT configured when none does — the ability is never offered blind', () => {
      delete process.env.MAGIC_HOUR_API_KEY;
      expect(imageEditingIsConfigured()).toBe(false);
    });
  });
});
