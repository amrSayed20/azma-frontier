/**
 * AZMA OS — QIYAMAH: IDEA-TO-PROMPT CONSTRUCTION
 *
 * Supports two input modes:
 *
 *   mode: 'idea'     (default) — Creator provides a plain-language idea.
 *                               Qiyamah builds a production prompt from it.
 *                               Returns: { prompt, constructionMode: 'draft' }
 *
 *   mode: 'external' — Creator brings their own prompt verbatim.
 *                      Qiyamah presents a sovereign interpretation (reading).
 *                      Creator retains full choice of which prompt to generate.
 *                      Returns: { externalPrompt, qiyamahReading, constructionMode: 'interpretation' }
 *
 * All 13 styles are now operational. No style is locked or rejected.
 *
 * CONSTRUCTION MODE: this endpoint is deterministic — no AI provider is called.
 * The label 'draft' / 'interpretation' is honest about the construction method.
 *
 * PROVIDER NEUTRALITY: when a text-generation provider is added to the
 * orchestrator in a future Ministry, this route is the ONLY entry point
 * that needs to change — the client contract is stable regardless of method.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import {
  STYLE_SCAFFOLD,
  buildScaffoldedPrompt,
  resolveStyleId,
  validateBrief,
  briefContractFor,
  type QiyamahOperationId,
} from '../../../../src/qiyamah-generation/prompt-contract';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

// ─── Style vocabulary ─────────────────────────────────────────────────────────
//
//   IT NO LONGER LIVES HERE. The table moved to
//   `src/qiyamah-generation/prompt-contract.ts` because the cap that must
//   RESERVE room for the scaffold could not see the scaffold from here, and
//   two authorities for one number is how a brief that fits becomes a brief
//   that is refused. The name is re-exported so existing importers and tests
//   keep reading the same object they always read.
export const STYLE_VOCABULARY = STYLE_SCAFFOLD;

/**
 * Which operation this expansion is for.
 *
 * The cap is operation-aware now, so the route must be told. An absent value
 * means `image` — what every existing caller asks for, so no client breaks.
 */
function resolveOperation(raw: unknown, styleId: string): QiyamahOperationId {
  if (raw === 'video' || raw === 'infographic' || raw === 'image') return raw;
  // A Creator who chose the infographic style IS performing the infographic
  // act, whatever the caller forgot to send. The scaffold proves it: it is the
  // widest of the fourteen, and judging it as an image would reserve 65 fewer
  // characters than the provider will actually receive.
  return styleId === 'infographic' ? 'infographic' : 'image';
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to use Qiyamah.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const rawMode = (body as { mode?: unknown })?.mode;
  const mode: 'idea' | 'external' = rawMode === 'external' ? 'external' : 'idea';
  const style = (body as { style?: unknown })?.style;
  const resolvedStyle = resolveStyleId(typeof style === 'string' ? style : null);
  const operation = resolveOperation((body as { operation?: unknown })?.operation, resolvedStyle);

  // ── ONE GATE FOR BOTH MODES ───────────────────────────────────────────────
  //
  //   Until 2026-10-11 this route held TWO ceilings — 500 for an idea, 2000
  //   for a Creator's own prompt — and the generation service held a THIRD at
  //   1000. The widest sat in the middle, so a 1,200-character brief passed
  //   here, was shown back as a sovereign reading, and was refused at
  //   embodiment: the refusal arriving after the promise.
  //
  //   Both modes now ask the one contract, which reserves the scaffold INSIDE
  //   the cap. What passes here cannot be refused later for its length.
  const field = mode === 'external' ? 'externalPrompt' : 'idea';
  const raw = (body as Record<string, unknown>)?.[field];
  if (typeof raw !== 'string') {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', message: `A non-empty ${field} is required.` },
      { status: 400 },
    );
  }

  const verdict = validateBrief(operation, resolvedStyle, raw);
  if (!verdict.ok) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'invalid-input',
        // The Creator's language, with the remedy and whose limit it was.
        message: verdict.messageAr,
        // So a browser can render the ceiling without a second round trip,
        // and so the two can never disagree about what it is.
        contract: verdict.contract,
        overBy: verdict.overBy,
      },
      { status: 400 },
    );
  }

  const text = raw.trim();
  const contract = briefContractFor(operation, resolvedStyle);

  if (mode === 'external') {
    return NextResponse.json({
      status: 'succeeded',
      externalPrompt: text,
      qiyamahReading: buildScaffoldedPrompt(text, resolvedStyle),
      constructionMode: 'interpretation',
      contract,
    });
  }

  return NextResponse.json({
    status: 'succeeded',
    prompt: buildScaffoldedPrompt(text, resolvedStyle),
    constructionMode: 'draft',
    contract,
  });
}
