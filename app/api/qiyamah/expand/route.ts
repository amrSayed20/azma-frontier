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

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

// ─── Style vocabulary (all 13 styles) ─────────────────────────────────────────

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
  scifi: {
    prefix: 'مشهد خيال علمي مستقبلي، ',
    suffix: '، جوّ تكنولوجي متقدم، إضاءة نيون، ألوان كونية، تفاصيل مستقبلية دقيقة',
  },
  animation: {
    prefix: 'أسلوب أنيميشن احترافي، ',
    suffix: '، ألوان زاهية، خطوط واضحة، أسلوب فني متميز، جودة إنتاجية عالية',
  },
  fantasy: {
    prefix: 'عالم خيالي أسطوري، ',
    suffix: '، سحر وجمال بصري، ألوان ساحرة، تفاصيل خيالية، إضاءة درامية',
  },
  portrait: {
    prefix: 'بورتريه احترافي، ',
    suffix: '، إضاءة ناعمة، تركيز على التعبير الإنساني، جودة فوتوغرافية عالية',
  },
  fashion: {
    prefix: 'تصوير أزياء احترافي، ',
    suffix: '، إضاءة موضة راقية، تكوين بصري أنيق، جودة مجلة فاخرة',
  },
  architecture: {
    prefix: 'تصوير معماري احترافي، ',
    suffix: '، تكوين هندسي دقيق، إضاءة طبيعية، تفاصيل معمارية واضحة، جودة تقنية',
  },
  historical: {
    prefix: 'توثيق تاريخي بصري، ',
    suffix: '، نمط فني كلاسيكي، ألوان دافئة، تفاصيل حقبة زمنية، طابع أرشيفي',
  },
  abstract: {
    prefix: 'تعبير تجريدي بصري، ',
    suffix: '، أشكال هندسية ولونية حرة، إيقاع بصري، تكوين فني مبتكر، طاقة إبداعية',
  },
};

function buildSovereignPrompt(input: string, style: string): string {
  const vocab = STYLE_VOCABULARY[style] ?? STYLE_VOCABULARY['cinematic'];
  return `${vocab.prefix}${input.trim()}${vocab.suffix}`;
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
  const resolvedStyle = typeof style === 'string' && style in STYLE_VOCABULARY ? style : 'cinematic';

  // ── External prompt mode ────────────────────────────────────────────────────
  if (mode === 'external') {
    const externalPrompt = (body as { externalPrompt?: unknown })?.externalPrompt;
    if (typeof externalPrompt !== 'string' || externalPrompt.trim().length === 0) {
      return NextResponse.json(
        { status: 'failed', reason: 'invalid-input', message: 'A non-empty externalPrompt is required.' },
        { status: 400 },
      );
    }
    if (externalPrompt.trim().length > 2000) {
      return NextResponse.json(
        { status: 'failed', reason: 'invalid-input', message: 'External prompt exceeds the maximum length of 2000 characters.' },
        { status: 400 },
      );
    }
    const qiyamahReading = buildSovereignPrompt(externalPrompt.trim(), resolvedStyle);
    return NextResponse.json({
      status: 'succeeded',
      externalPrompt: externalPrompt.trim(),
      qiyamahReading,
      constructionMode: 'interpretation',
    });
  }

  // ── Idea mode (default) ─────────────────────────────────────────────────────
  const idea = (body as { idea?: unknown })?.idea;
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

  const prompt = buildSovereignPrompt(idea.trim(), resolvedStyle);
  return NextResponse.json({
    status: 'succeeded',
    prompt,
    constructionMode: 'draft',
  });
}
