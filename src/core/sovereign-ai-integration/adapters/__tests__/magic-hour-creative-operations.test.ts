/**
 * AZMA OS — THE FOUR CREATIVE OPERATIONS · CONTRACT TESTS, 2026-10-11.
 *
 * `global.fetch` is replaced throughout, so NOT ONE TEST reaches a provider,
 * submits a job, or consumes a credit. What is exercised is the real request
 * construction, the real async job mapping, the real retrieval, and the real
 * failure handling — against a double that answers exactly as the provider's
 * own measured validator does.
 */

import {
  removeBackgroundViaProvider, lipSyncViaProvider, talkingPhotoViaProvider,
  faceSwapViaProvider, faceSwapIsPermitted,
  uploadMedia, creativeOperationsAreConfigured,
  CREATIVE_ENDPOINT, CREATIVE_PROVIDER_ID, CREATIVE_READINESS, readinessOf,
  LIP_SYNC_GENERATION_MODE, LIP_SYNC_MODE_ALTERNATIVE, LIP_SYNC_MODE_COST_IS_MEASURED,
  TALKING_PHOTO_GENERATION_MODE,
  FACE_SWAP_STYLE_VERSION, FACE_SWAP_FACE_MODE, CREATIVE_DURATION_BOUND,
  CREATIVE_PROVIDER_CEILING,
} from '../magic-hour-creative-operations';
import { ImageEditError } from '../magic-hour-image-editing';
import {
  LIKENESS_POLICY_VERSION, requiresLikenessAcknowledgment,
} from '../../../../vault/likeness-acknowledgment';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
const MP4 = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112]);
const MP3 = Buffer.from([0x49, 0x44, 0x33, 3, 0, 0, 0, 0]);

const real = global.fetch;
let calls: { url: string; method: string; body: unknown }[] = [];

/** Answers the whole dance: upload slot → PUT → submit → poll → download. */
function engineThatSucceeds(outBytes = PNG, mime = 'image/png', credits: number | null = 7) {
  let polls = 0;
  global.fetch = (async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    let body: unknown = null;
    try { body = init?.body ? JSON.parse(String(init.body)) : null; } catch { body = '(binary)'; }
    calls.push({ url, method: init?.method ?? 'GET', body });

    if (url.endsWith('/v1/files/upload-urls')) {
      return new Response(JSON.stringify({
        items: [{ upload_url: 'https://upload.example/slot', file_path: 'api-assets/x' }],
      }), { status: 200 });
    }
    if (url === 'https://upload.example/slot') return new Response('', { status: 200 });
    if (/\/v1\/(image-background-remover|lip-sync|face-swap|ai-talking-photo)$/.test(url)) {
      return new Response(JSON.stringify({ id: 'job-1', status: 'queued' }), { status: 200 });
    }
    if (/\/v1\/(image|video)-projects\/job-1$/.test(url)) {
      polls += 1;
      // The first poll is deliberately NOT complete: submission is not
      // completion, and a path that returned on the first answer would be
      // reporting a success for work that had not happened.
      return new Response(JSON.stringify(polls < 2
        ? { id: 'job-1', status: 'rendering' }
        : { id: 'job-1', status: 'complete', credits_charged: credits,
            downloads: [{ url: 'https://cdn.example/out' }] }), { status: 200 });
    }
    if (url === 'https://cdn.example/out') {
      return new Response(new Uint8Array(outBytes), {
        status: 200, headers: { 'content-type': `${mime}; charset=binary` },
      });
    }
    return new Response('unexpected', { status: 500 });
  }) as typeof fetch;
}

beforeEach(() => { calls = []; process.env.MAGIC_HOUR_API_KEY = 'test-key'; });
afterEach(() => { global.fetch = real; delete process.env.MAGIC_HOUR_API_KEY; });

// ─────────────────────────────────────────────────────────────────────────────
describe('1 · background removal builds the request the provider demands', () => {
  it('uploads the image, submits one field, and returns BYTES', async () => {
    engineThatSucceeds();
    const r = await removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 });
    expect(Buffer.isBuffer(r.bytes)).toBe(true);
    expect(r.providerId).toBe(CREATIVE_PROVIDER_ID['background-removal']);
    expect(r.providerJobId).toBe('job-1');
    expect(r.creditsCharged).toBe(7);

    const submit = calls.find((c) => c.url.endsWith(CREATIVE_ENDPOINT['background-removal']))!;
    expect(submit.body).toEqual({ assets: { image_file_path: 'api-assets/x' } });
  });

  it('it never returns a URL — a URL cannot be hashed against its parent', async () => {
    engineThatSucceeds();
    const r = await removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 });
    expect(Object.keys(r)).not.toContain('url');
    expect(JSON.stringify(Object.keys(r))).not.toMatch(/url/i);
  });
});

describe('2 · lip sync carries both inputs and states its source', () => {
  it('uploads a video and an audio, and names video_source explicitly', async () => {
    engineThatSucceeds(MP4, 'video/mp4', 150);
    const r = await lipSyncViaProvider(MP4, '.mp4', MP3, '.mp3', 5, { pollIntervalMs: 1 });
    expect(r.mimeType).toBe('video/mp4');

    const submit = calls.find((c) => c.url.endsWith(CREATIVE_ENDPOINT['lip-sync']))!;
    expect(submit.body).toEqual({
      start_seconds: 0, end_seconds: 5,
      // The mode is STATED. It equals the provider's own default, and that is
      // the point: an unsent parameter is a decision nobody made, and this
      // one decides what a Creator is charged per frame.
      style: { generation_mode: LIP_SYNC_GENERATION_MODE },
      assets: { video_source: 'file', video_file_path: 'api-assets/x', audio_file_path: 'api-assets/x' },
    });
  });

  it("'youtube' is never sent — the Empire hands a provider no third party's URL", async () => {
    engineThatSucceeds(MP4, 'video/mp4');
    await lipSyncViaProvider(MP4, '.mp4', MP3, '.mp3', 5, { pollIntervalMs: 1 });
    expect(JSON.stringify(calls)).not.toContain('youtube');
  });

  it('a non-positive duration is refused before anything is uploaded', async () => {
    engineThatSucceeds();
    await expect(lipSyncViaProvider(MP4, '.mp4', MP3, '.mp3', 0, { pollIntervalMs: 1 }))
      .rejects.toThrow(/positive duration/);
    expect(calls).toHaveLength(0);
  });
});

describe('3 · talking photo is a different operation, not a renamed lip sync', () => {
  it('it submits to its own route with an image, not a video', async () => {
    engineThatSucceeds(MP4, 'video/mp4');
    await talkingPhotoViaProvider(PNG, '.png', MP3, '.mp3', 5, { pollIntervalMs: 1 });
    const submit = calls.find((c) => c.url.endsWith(CREATIVE_ENDPOINT['talking-photo']))!;
    expect(submit.body).toEqual({
      start_seconds: 0, end_seconds: 5,
      style: { generation_mode: TALKING_PHOTO_GENERATION_MODE },
      assets: { image_file_path: 'api-assets/x', audio_file_path: 'api-assets/x' },
    });
  });

  it('the two routes are genuinely different', () => {
    expect(CREATIVE_ENDPOINT['talking-photo']).not.toBe(CREATIVE_ENDPOINT['lip-sync']);
    expect(CREATIVE_PROVIDER_ID['talking-photo']).not.toBe(CREATIVE_PROVIDER_ID['lip-sync']);
  });
});

describe('4 · face swap is refused inside the path, not only at the door', () => {
  const DECLARED = { acknowledged: true, acknowledgedVersion: LIKENESS_POLICY_VERSION };

  it('permission is withheld when nothing was declared', () => {
    const p = faceSwapIsPermitted();
    expect(p.permitted).toBe(false);
  });

  it('and the refusal says possession is not consent', () => {
    const p = faceSwapIsPermitted();
    expect(p.permitted).toBe(false);
    if (p.permitted) return;
    expect(p.reasonEn).toMatch(/never read as consent/i);
  });

  it('calling it without a declaration throws before a single byte is uploaded', async () => {
    engineThatSucceeds();
    await expect(faceSwapViaProvider(MP4, '.mp4', PNG, '.png', 5, undefined, { pollIntervalMs: 1 }))
      .rejects.toThrow(/face-swap refused/);
    expect(calls).toHaveLength(0);
  });

  it('a declaration against other wording is not a declaration', async () => {
    engineThatSucceeds();
    await expect(faceSwapViaProvider(MP4, '.mp4', PNG, '.png', 5,
      { acknowledged: true, acknowledgedVersion: 'likeness-v0' }, { pollIntervalMs: 1 }))
      .rejects.toThrow(/face-swap refused/);
    expect(calls).toHaveLength(0);
  });

  it('with the Creator’s declaration the real path runs, and it is the measured route', async () => {
    engineThatSucceeds(MP4, 'video/mp4', 120);
    const out = await faceSwapViaProvider(MP4, '.mp4', PNG, '.png', 5, DECLARED, { pollIntervalMs: 1 });
    const submit = calls.find((c) => c.url.endsWith(CREATIVE_ENDPOINT['face-swap']))!;
    expect(submit.body).toEqual({
      start_seconds: 0, end_seconds: 5,
      style: { version: FACE_SWAP_STYLE_VERSION },
      assets: {
        video_source: 'file', video_file_path: 'api-assets/x', image_file_path: 'api-assets/x',
        face_swap_mode: FACE_SWAP_FACE_MODE,
      },
    });
    expect(out.creditsCharged).toBe(120);
  });

  it('possession of an image is never read as consent', () => {
    const src = require('fs').readFileSync(require('path').join(
      process.cwd(), 'src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations.ts'), 'utf8');
    // Nothing in the gate consults the asset, its owner, or its metadata.
    const gate = src.slice(src.indexOf('export function faceSwapIsPermitted'), src.indexOf('export async function faceSwapViaProvider'));
    expect(gate).not.toMatch(/asset|owner|metadata|creatorId/i);
  });
});

describe('5 · submission is not completion', () => {
  it('a job still rendering is polled, not returned', async () => {
    engineThatSucceeds();
    await removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 });
    const polls = calls.filter((c) => /\/v1\/image-projects\/job-1$/.test(c.url));
    expect(polls.length).toBeGreaterThanOrEqual(2);
  });

  it('a job that ends in error throws instead of returning a partial result', async () => {
    global.fetch = (async (input: unknown) => {
      const url = String(input);
      if (url.endsWith('/v1/files/upload-urls')) {
        return new Response(JSON.stringify({ items: [{ upload_url: 'https://u/s', file_path: 'p' }] }), { status: 200 });
      }
      if (url === 'https://u/s') return new Response('', { status: 200 });
      if (url.endsWith(CREATIVE_ENDPOINT['background-removal'])) {
        return new Response(JSON.stringify({ id: 'job-e', status: 'queued' }), { status: 200 });
      }
      return new Response(JSON.stringify({
        id: 'job-e', status: 'error', error: { message: 'the engine could not read the source' },
      }), { status: 200 });
    }) as typeof fetch;
    await expect(removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 }))
      .rejects.toThrow(/RENDER_FAILED/);
  });

  it('a job that never finishes times out rather than hanging or lying', async () => {
    global.fetch = (async (input: unknown) => {
      const url = String(input);
      if (url.endsWith('/v1/files/upload-urls')) {
        return new Response(JSON.stringify({ items: [{ upload_url: 'https://u/s', file_path: 'p' }] }), { status: 200 });
      }
      if (url === 'https://u/s') return new Response('', { status: 200 });
      if (url.endsWith(CREATIVE_ENDPOINT['background-removal'])) {
        return new Response(JSON.stringify({ id: 'job-t', status: 'queued' }), { status: 200 });
      }
      return new Response(JSON.stringify({ id: 'job-t', status: 'rendering' }), { status: 200 });
    }) as typeof fetch;
    await expect(removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1, timeoutMs: 30 }))
      .rejects.toThrow(/TIMED_OUT/);
  });
});

describe('6 · failures are told apart, because their remedies differ', () => {
  const submitWith = (status: number) => {
    global.fetch = (async (input: unknown) => {
      const url = String(input);
      if (url.endsWith('/v1/files/upload-urls')) {
        return new Response(JSON.stringify({ items: [{ upload_url: 'https://u/s', file_path: 'p' }] }), { status: 200 });
      }
      if (url === 'https://u/s') return new Response('', { status: 200 });
      return new Response('', { status });
    }) as typeof fetch;
  };

  it('402 is the Empire’s own account, not the Creator’s request', async () => {
    submitWith(402);
    await expect(removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 }))
      .rejects.toThrow(/NO_CREDIT/);
  });

  it('any other refusal is a submission failure, named with its status', async () => {
    submitWith(503);
    await expect(removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 }))
      .rejects.toThrow(/SUBMIT_FAILED.*503/);
  });

  it('an absent credential refuses before the network is touched', async () => {
    delete process.env.MAGIC_HOUR_API_KEY;
    engineThatSucceeds();
    await expect(removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 }))
      .rejects.toThrow(/NO_CREDENTIAL/);
    expect(calls).toHaveLength(0);
    expect(creativeOperationsAreConfigured()).toBe(false);
  });
});

describe('7 · uploads carry the right kind, and refuse the wrong extension', () => {
  it('an audio extension is sent as audio, not as an image', async () => {
    engineThatSucceeds();
    await uploadMedia(MP3, '.mp3', 'audio');
    const slot = calls.find((c) => c.url.endsWith('/v1/files/upload-urls'))!;
    expect(slot.body).toEqual({ items: [{ extension: 'mp3', type: 'audio' }] });
  });

  it('a video extension is sent as video', async () => {
    engineThatSucceeds();
    await uploadMedia(MP4, 'mp4', 'video');
    const slot = calls.find((c) => c.url.endsWith('/v1/files/upload-urls'))!;
    expect(slot.body).toEqual({ items: [{ extension: 'mp4', type: 'video' }] });
  });

  it('an extension the engine does not read is refused by name', async () => {
    engineThatSucceeds();
    await expect(uploadMedia(PNG, '.exe', 'image')).rejects.toThrow(/UNSUPPORTED_EXTENSION/);
    await expect(uploadMedia(MP3, '.flac', 'audio')).rejects.toThrow(/UNSUPPORTED_EXTENSION/);
    expect(calls).toHaveLength(0);
  });

  it('a failed PUT is a failed upload, not a silent success', async () => {
    global.fetch = (async (input: unknown) => {
      const url = String(input);
      if (url.endsWith('/v1/files/upload-urls')) {
        return new Response(JSON.stringify({ items: [{ upload_url: 'https://u/s', file_path: 'p' }] }), { status: 200 });
      }
      return new Response('', { status: 403 });
    }) as typeof fetch;
    await expect(uploadMedia(PNG, '.png', 'image')).rejects.toThrow(/UPLOAD_FAILED/);
  });
});

describe('8 · readiness claims exactly what was measured, and no more', () => {
  it('every operation records a probed route and an accepted credential', () => {
    for (const r of CREATIVE_READINESS) {
      expect(r.routeProbed).toBe(true);
      expect(r.credentialAccepted).toBe(true);
    }
  });

  it('NOT ONE claims production proof or a verified cost', () => {
    for (const r of CREATIVE_READINESS) {
      expect(r.productionProven).toBe(false);
      expect(r.costBasisVerified).toBe(false);
    }
  });

  it('face swap is the only one that demands the Creator’s declaration', () => {
    // It read `policyBlocked: ['face-swap']` until 2026-10-11, when the Chief
    // Architect ordered the safeguard itself. The absent-policy block is
    // closed by HIS ruling; what stands in its place is this requirement,
    // which is a different thing and is said separately.
    expect(CREATIVE_READINESS.filter((r) => r.requiresLikenessAcknowledgment)
      .map((r) => r.operation)).toEqual(['face-swap']);
  });

  it('and the requirement is read from one list, not restated per entry', () => {
    for (const r of CREATIVE_READINESS) {
      expect(r.requiresLikenessAcknowledgment)
        .toBe(requiresLikenessAcknowledgment(r.operation));
    }
  });

  it('every operation has a readiness record', () => {
    for (const op of ['background-removal', 'lip-sync', 'face-swap', 'talking-photo'] as const) {
      expect(readinessOf(op).operation).toBe(op);
    }
  });

  it('the module fabricates no id, no URL and no success', () => {
    const src = require('fs').readFileSync(require('path').join(
      process.cwd(), 'src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations.ts'), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/Date\.now\(\)\s*}/);
    expect(code).not.toMatch(/Math\.random\(\)/);
    expect(code).not.toMatch(/cdn\.azma/);
  });

  it('every error it raises is the existing adapter’s type — no second vocabulary', async () => {
    submitFailure();
    const err = await removeBackgroundViaProvider(PNG, '.png', { pollIntervalMs: 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(ImageEditError);
  });

  function submitFailure() {
    global.fetch = (async (input: unknown) => {
      const url = String(input);
      if (url.endsWith('/v1/files/upload-urls')) {
        return new Response(JSON.stringify({ items: [{ upload_url: 'https://u/s', file_path: 'p' }] }), { status: 200 });
      }
      if (url === 'https://u/s') return new Response('', { status: 200 });
      return new Response('', { status: 500 });
    }) as typeof fetch;
  }
});

describe('7 · the configuration is ours, and its price is known', () => {
  it('the talking photo mode is the one the provider bills at 48/second', () => {
    // It was unsent, so `realistic` was chosen by default and the worksheet
    // had priced `prompted` at 20 — a mode this Empire never sends.
    expect(TALKING_PHOTO_GENERATION_MODE).toBe('realistic');
  });

  it('the lip sync mode is the Architect’s `standard`, which bills 1 credit per frame', () => {
    // It was `lite` — the provider's fallback, inherited by omission. The
    // Architect ruled `standard` on 2026-10-12: better quality at a
    // DOCUMENTED-identical rate, with `lite` kept as the alternative.
    expect(LIP_SYNC_GENERATION_MODE).toBe('standard');
    expect(LIP_SYNC_MODE_ALTERNATIVE).toBe('lite');
  });

  it('and the equal rate is NOT claimed as measured', () => {
    expect(LIP_SYNC_MODE_COST_IS_MEASURED).toBe(false);
  });

  it('face swap never maps a face one by one, and never takes a third party URL', () => {
    expect(FACE_SWAP_FACE_MODE).toBe('all-faces');
    const src = require('fs').readFileSync(require('path').join(
      process.cwd(), 'src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations.ts'), 'utf8');
    expect(src).not.toMatch(/youtube_url/);
  });

  it('every duration bound names who set it', () => {
    for (const op of ['talking-photo', 'lip-sync', 'face-swap']) {
      const b = CREATIVE_DURATION_BOUND[op];
      expect(b.seconds).toBeGreaterThan(0);
      expect(['provider-documented', 'empire-guard']).toContain(b.source);
    }
  });

  it('NOT ONE offered bound is a provider maximum copied into an offer', () => {
    // It was, for one afternoon: talking photo offered the published 300
    // seconds, which at 48 credits/second is 14,400 — more than the whole
    // balance. A published ceiling is a fact about the engine; what the
    // chamber OFFERS is a priced decision, and these are ours.
    for (const op of ['talking-photo', 'lip-sync', 'face-swap']) {
      expect(CREATIVE_DURATION_BOUND[op].source).toBe('empire-guard');
    }
  });

  it('and the provider ceiling is still recorded — with what it would cost', () => {
    const tp = CREATIVE_PROVIDER_CEILING.find((c) => c.operation === 'talking-photo')!;
    expect(tp.maxSeconds).toBe(300);
    expect(tp.maxSecondsSource).toBe('provider-documented');
    expect(tp.ceilingCredits).toBe(14_400);
  });

  it('every ceiling either carries a number or says the provider published none', () => {
    for (const c of CREATIVE_PROVIDER_CEILING) {
      if (c.maxSeconds === null) expect(c.maxSecondsSource).toBe('not-stated');
      else expect(c.maxSecondsSource).toBe('provider-documented');
    }
  });
});
