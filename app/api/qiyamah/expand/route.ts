/**
 * AZMA OS — QIYAMAH: IDEA-TO-PROMPT CONSTRUCTION
 *
 * Receives the Creator's simple idea and the chosen visual style, then
 * returns a structured, production-ready sovereign prompt.
 *
 * CONSTRUCTION MODE — "draft":
 * This endpoint uses a deterministic, style-aware construction function.
 * No AI provider is called here. The response always carries
 * constructionMode: 'draft' so the client can label it honestly.
 *
 * Per the Chief Architect's Provider Truth Rule: this must never claim
 * AI reasoning. The label "صياغة أولية" (initial draft) is correct and
 * honest.
 *
 * PROVIDER NEUTRALITY: when a text-generation provider is added to the
 * orchestrator in a future Ministry, this route is the ONLY entry point
 * that needs to change — the client contract (idea + style → prompt) is
 * stable regardless of construction method.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

// ─── Style vocabulary ─────────────────────────────────────────────────────────
// AVAILABLE styles — fully operational, accepted by this route.
// Each entry adds an opening visual context (prefix) and a closing technical
// parameter string (suffix) that together produce a production-ready prompt
// from the Creator's plain-language idea.

export const STYLE_VOCABULARY: Record<string, { prefix: string; suffix: string }> = {
  cinematic: {
    prefix: 'مشهد سينمائي بكاميرا 35mm، ',
    suffix: '، إضاءة درامية سينمائية، بؤرة عميقة، إطار ملحمي، ألوان سينمائية غنية',
  },
  realistic: {
    prefix: 'تصوير فوتوغرافي فائق الدقة 8K، ',
    suffix: '، تفاصيل مذهلة، إضاءة احترافية، واقعية مطبعية، جودة إنتاج عالية',
  },
  advertising: {
    prefix: 'تصوير إعلاني احترافي، ',
    suffix: '، إضاءة استوديو سينمائية، تكوين تجاري فاخر، جودة طباعية عالية',
  },
  documentary: {
    prefix: 'توثيق بصري أصيل، ',
    suffix: '، ضوء طبيعي، رصد واقعي، تكوين كلاسيكي، أرشيفي',
  },
  creative: {
    prefix: 'تعبير فني إبداعي، ',
    suffix: '، أسلوب بصري مميز، ألوان جريئة، تكوين مبتكر، طاقة فنية عالية',
  },
};

// LOCKED styles — visible in the UI as "قريبًا" but must never enter
// the construction or generation pipeline. Any submission of a locked
// style is rejected here, not silently fallen back to cinematic, so
// the server is an honest last line of defense matching the UI's state.
export const LOCKED_STYLES = new Set([
  'scifi', 'animation', 'fantasy', 'portrait', 'fashion',
  'architecture', 'historical', 'abstract',
]);

function buildSovereignPrompt(idea: string, style: string): string {
  const vocab = STYLE_VOCABULARY[style] ?? STYLE_VOCABULARY['cinematic'];
  return `${vocab.prefix}${idea.trim()}${vocab.suffix}`;
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

  const idea  = (body as { idea?: unknown })?.idea;
  const style = (body as { style?: unknown })?.style;

  if (typeof idea !== 'string' || idea.trim().length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', message: 'A non-empty idea is required.' },
      { status: 400 },
    );
  }

  if (idea.trim().length > 500) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', message: 'Idea exceeds the maximum length of 500 characters.' },
      { status: 400 },
    );
  }

  if (typeof style === 'string' && LOCKED_STYLES.has(style)) {
    return NextResponse.json(
      { status: 'failed', reason: 'locked-style', message: 'هذا الأسلوب غير متاح حاليًا.' },
      { status: 400 },
    );
  }

  const resolvedStyle = typeof style === 'string' && style in STYLE_VOCABULARY ? style : 'cinematic';
  const prompt = buildSovereignPrompt(idea, resolvedStyle);

  return NextResponse.json({
    status: 'succeeded',
    prompt,
    constructionMode: 'draft',
  });
}
