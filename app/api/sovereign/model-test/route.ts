import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyFounderSession } from '@/src/founder-access';
import { generateImage, generateVideo } from '@/src/qiyamah-generation';
import { IMAGE_MODEL_FLEET } from '@/src/sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/sovereign/model-test — Founder-gated controlled model test.
 *
 * ─── WHY THIS IS A SEPARATE SURFACE AND NOT A FIELD ON /generate ────────────
 *
 *   The Controlled Model Test Enablement order forbids exposing model choice
 *   as «a creator option, a public API capability, a UI selector, a persistent
 *   preference, a sovereign capability, a pricing option», and warns against
 *   relying on «the UI does not show it».
 *
 *   The strongest answer is not a check on the production route — it is that
 *   the production route never learns the field exists. `app/api/qiyamah/
 *   generate` does not read `testOnlyModelId`, does not forward it, and has no
 *   branch that could. A browser POSTing it there changes nothing, because
 *   nothing on that path looks for it. No hidden flag to be discovered, no
 *   condition to be defeated.
 *
 *   The override lives here instead, behind the Empire's already-certified
 *   Founder gate — «one authentication system, no competing Founder
 *   definition». No second authorization system was built.
 *
 * ─── WHAT IT WILL NOT DO ────────────────────────────────────────────────────
 *
 *   It resolves an AZMA FLEET ID, never a provider string, so no provider
 *   model can be injected. It does not consult the selector and does not widen
 *   its authorized pool, so naming a dormant binding here leaves that binding
 *   exactly as undispatchable by every ordinary path as it was before.
 *
 *   It cannot activate anything. `productionAuthorized` and `active` are read
 *   from the fleet source and are not writable through any request.
 *
 * ─── WHAT IT IS FOR ─────────────────────────────────────────────────────────
 *
 *   Exactly two controlled comparisons, each holding every variable fixed but
 *   the model: Nano Banana 2 against the Nano Banana Pro reference, and
 *   MiniMax H3 against the Seedance reference. The caller supplies the
 *   historical prompt verbatim; this route never composes or alters one.
 */
export async function POST(request: NextRequest) {
  const session = verifyFounderSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    // A non-Founder is told nothing about what lives here.
    return NextResponse.json({ status: 'failed', reason: 'not-found' }, { status: 404 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-input' }, { status: 400 });
  }

  const b = (body ?? {}) as {
    modelId?: unknown; prompt?: unknown; mediaType?: unknown;
    durationSeconds?: unknown; aspectRatio?: unknown; style?: unknown;
  };

  const modelId = typeof b.modelId === 'string' ? b.modelId.trim() : '';
  const prompt = typeof b.prompt === 'string' ? b.prompt : '';
  const mediaType = b.mediaType === 'video' ? 'video' : 'image';

  if (modelId.length === 0 || prompt.trim().length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', detail: 'modelId and prompt are required' },
      { status: 400 },
    );
  }

  // ── The registry is the only vocabulary ───────────────────────────────────
  //   A fleet id or nothing. 'minimax-h3-turbo', 'gpt-image-2' and every other
  //   provider string resolve to no entry and are refused here, before any
  //   provider is contacted.
  const fleet = mediaType === 'video' ? VIDEO_MODEL_FLEET : IMAGE_MODEL_FLEET;
  const entry = fleet.find((m) => m.modelId === modelId);
  if (!entry) {
    return NextResponse.json(
      { status: 'failed', reason: 'unknown-model', detail: `'${modelId}' is not a registered AZMA ${mediaType} binding` },
      { status: 400 },
    );
  }

  const operationId = randomUUID();

  // The prompt is passed through exactly as supplied. This route composes
  // nothing, expands nothing and appends nothing — the controlled experiment
  // depends on the historical text arriving unaltered.
  if (mediaType === 'video') {
    const durationSeconds = typeof b.durationSeconds === 'number' ? b.durationSeconds : 6;
    const result = await generateVideo({
      prompt,
      style: typeof b.style === 'string' ? b.style : undefined,
      durationSeconds,
      aspectRatio: typeof b.aspectRatio === 'string' ? b.aspectRatio : undefined,
      creatorId: session.creatorId,
      operationId,
      testOnlyModelId: entry.modelId,
    });
    return NextResponse.json({ ...result, operationId, testBinding: entry.modelId }, { status: 200 });
  }

  const result = await generateImage({
    prompt,
    style: typeof b.style === 'string' ? b.style : undefined,
    creatorId: session.creatorId,
    operationId,
    testOnlyModelId: entry.modelId,
  });
  return NextResponse.json({ ...result, operationId, testBinding: entry.modelId }, { status: 200 });
}
