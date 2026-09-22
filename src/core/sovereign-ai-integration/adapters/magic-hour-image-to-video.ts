/**
 * AZMA OS — Magic Hour Provider Binding
 * Image → video: a still brought into motion.
 *
 * ─── WHAT THIS IS ────────────────────────────────────────────────────────────
 *
 *   The replaceable provider binding behind the sovereign capability
 *   `animate-asset` (Chamber Truth, Qiyamah). The capability is AZMA's; this
 *   file is how Magic Hour happens to perform it today. Nothing here decides
 *   whether a Creator may animate — the route and Chamber Truth do.
 *
 * ─── VERIFIED 2026-09-22 (docs.magichour.ai) ─────────────────────────────────
 *
 *   POST /v1/image-to-video
 *     assets.image_file_path   required — the uploaded source
 *     end_seconds              required — output duration
 *     style.prompt             the motion instruction
 *     model                    enum: default, ltx-2, ltx-2.3, ltx-2.5,
 *                              minimax-h3, wan-2.2, wan-3.0, seedance-1.5,
 *                              seedance-2.0, seedance-2.0-mini, seedance-2.5,
 *                              kling-1.6, kling-2.5, kling-2.5-audio,
 *                              kling-2.6, kling-3.0, gemini-omni-1.1,
 *                              veo3.1, veo3.1-lite, veo3.1-audio, sora-2
 *     resolution, aspect_ratio, audio, name — optional
 *   → { id, credits_charged }
 *   GET /v1/video-projects/{id}
 *     status: draft | queued | rendering | complete | error | canceled
 *     downloads[]: { url, expires_at } when complete
 *     error: { code, message } when it failed
 *
 *   No Grok identifier exists in that enum. Grok is NOT available through
 *   this binding, and nothing here pretends otherwise.
 *
 *   Which of the enum's models AZMA is allowed to send is not this file's
 *   decision either: the video model fleet (sovereign-model-selection) says
 *   which are authorized and active, and the route asks the selector.
 */

import {
  authHeaders,
  engineBase,
  uploadSource,
  ImageEditError,
} from './magic-hour-image-editing';

export const IMAGE_TO_VIDEO_PROVIDER_ID = 'magic-hour-image-to-video' as const;

export interface AnimatedVideoResult {
  readonly bytes: Buffer;
  readonly mimeType: string;
  readonly creditsCharged: number | null;
  readonly providerId: typeof IMAGE_TO_VIDEO_PROVIDER_ID;
  /** The exact model string this binding sent — recorded as executed. */
  readonly providerModelId: string;
  readonly providerJobId: string;
  readonly fps: number | null;
  readonly width: number | null;
  readonly height: number | null;
}

interface VideoJobResponse {
  readonly id?: string;
  readonly status?: string;
  readonly credits_charged?: number;
  readonly downloads?: { readonly url?: string }[];
  readonly error?: { code?: string; message?: string } | null;
  readonly fps?: number;
  readonly width?: number;
  readonly height?: number;
}

export interface AnimateOptions {
  /** The exact provider model id, from the fleet's verified providerModelId. Required — never defaulted. */
  readonly providerModelId: string;
  readonly endSeconds: number;
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
}

/**
 * Animate a source image into a video. Throws ImageEditError (the shared
 * rejection vocabulary of this provider's bindings) with the provider's own
 * words trimmed in, so the route can name the stage that failed.
 */
export async function animateImageViaProvider(
  sourceBytes: Buffer,
  sourceExtension: string,
  instruction: string,
  options: AnimateOptions,
): Promise<AnimatedVideoResult> {
  if (!options.providerModelId) throw new ImageEditError('SUBMIT_FAILED', 'no provider model was chosen for the animation');
  const headers = authHeaders();
  const filePath = await uploadSource(sourceBytes, sourceExtension);

  const submitted = await fetch(`${engineBase()}/v1/image-to-video`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'azma-sovereign-animate',
      model: options.providerModelId,
      end_seconds: options.endSeconds,
      style: { prompt: instruction },
      assets: { image_file_path: filePath },
    }),
  });
  if (!submitted.ok) {
    if (submitted.status === 402) throw new ImageEditError('NO_CREDIT', 'the video engine has no remaining credit');
    let words = '';
    try { words = ((await submitted.json()) as { message?: string }).message?.slice(0, 200) ?? ''; } catch { /* no body */ }
    throw new ImageEditError('SUBMIT_FAILED', `image-to-video returned HTTP ${submitted.status}${words ? `: ${words}` : ''}`);
  }
  const job = (await submitted.json()) as VideoJobResponse;
  if (!job.id) throw new ImageEditError('SUBMIT_FAILED', 'the engine returned no job id');

  // Video renders take minutes, not seconds.
  const timeoutMs = options.timeoutMs ?? 600_000;
  const intervalMs = options.pollIntervalMs ?? 5_000;
  const deadline = Date.now() + timeoutMs;
  let finished: VideoJobResponse | null = null;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const polled = await fetch(`${engineBase()}/v1/video-projects/${job.id}`, { headers });
    if (!polled.ok) continue;
    const state = (await polled.json()) as VideoJobResponse;
    if (state.status === 'complete') { finished = state; break; }
    if (state.status === 'error' || state.status === 'canceled') {
      const words = state.error?.message ? `: ${state.error.message.slice(0, 200)}` : '';
      throw new ImageEditError('RENDER_FAILED', `the engine reported '${state.status}'${words}`);
    }
  }
  if (!finished) throw new ImageEditError('TIMED_OUT', `no result within ${timeoutMs}ms`);

  const url = finished.downloads?.[0]?.url;
  if (!url) throw new ImageEditError('NO_OUTPUT', 'the completed job carried no result');
  const downloaded = await fetch(url);
  if (!downloaded.ok) throw new ImageEditError('NO_OUTPUT', `download returned HTTP ${downloaded.status}`);

  return {
    bytes: Buffer.from(await downloaded.arrayBuffer()),
    mimeType: downloaded.headers.get('content-type')?.split(';')[0]?.trim() ?? 'application/octet-stream',
    creditsCharged: typeof finished.credits_charged === 'number' ? finished.credits_charged : null,
    providerId: IMAGE_TO_VIDEO_PROVIDER_ID,
    providerModelId: options.providerModelId,
    providerJobId: job.id,
    fps: typeof finished.fps === 'number' ? finished.fps : null,
    width: typeof finished.width === 'number' ? finished.width : null,
    height: typeof finished.height === 'number' ? finished.height : null,
  };
}

/** Whether the video engine has a credential. Read before offering the ability. */
export function imageToVideoIsConfigured(): boolean {
  return typeof process.env.MAGIC_HOUR_API_KEY === 'string' && process.env.MAGIC_HOUR_API_KEY.length > 0;
}
