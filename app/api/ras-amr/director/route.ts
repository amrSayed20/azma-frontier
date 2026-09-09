/**
 * PACKAGE XL — SOVEREIGN DIRECTOR EXECUTION BRIDGE
 * POST /api/ras-amr/director
 *
 * The AZMA Intent Interpreter: the only server-side boundary between
 * the Creator's natural language and the typed DirectorPlan contract.
 *
 * Security discipline:
 * - OPENAI_API_KEY is read server-side only; never returned to client.
 * - Provider never receives raw asset IDs or storage URIs — only
 *   client-assigned labels (VISUAL_1, VIDEO_1, AUDIO_1, ...).
 * - subscriberTenantId verified via session cookie before any AI call.
 * - Response carries only the DirectorPlan — no provider metadata,
 *   no job IDs, no model version details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import OpenAI from 'openai';
import type {
  DirectorPlan,
  DirectorInterpretRequest,
  ProductionAssetContext,
} from '../../../../src/chambers/ras-al-amr/director-plan-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY غير مُهيَّأ على الخادم');
  if (!cachedClient) cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function buildSystemPrompt(assets: ProductionAssetContext[]): string {
  const assetLines = assets
    .map((a) => {
      const typeLabel =
        a.capabilityTarget === 'VISUAL' ? 'صورة' :
        a.capabilityTarget === 'MOTION' ? 'فيديو' : 'صوت';
      const dur = a.durationSeconds ? ` · ${a.durationSeconds}ث` : '';
      return `  - ${a.label}: ${typeLabel} (${a.name}${dur})`;
    })
    .join('\n');

  return `أنت مُفسِّر النية السيادي لنظام AZMA OS للإخراج السينمائي. مهمتك الوحيدة: تحويل نية الخالق إلى خطة إخراج منظمة تعتمد حصراً على الأصول المتاحة.

الأصول المتاحة في مشهد الإنتاج الحالي:
${assetLines}

قواعد حصرية لا استثناء فيها:
1. استخدم فقط التسميات المذكورة أعلاه في visualSequence و audioTracks — لا تخترع تسميات.
2. visualSequence: الأصول المرئية فقط (النوع "صورة" أو "فيديو").
3. audioTracks: الأصول الصوتية فقط (النوع "صوت").
4. إذا طُلبت أصول غير موجودة، دوِّنها في unresolvedInstructions ولا تضعها في الخطة.
5. transitionType: "crossfade" للمشاهد الهادئة، "cut" للمشاهد الديناميكية.
6. durationSeconds لكل عنصر مرئي: اقترح قيماً منطقية بين 2 و 8 ثوانٍ.
7. confidence: نسبة ثقتك من 0 إلى 1.
8. الرد بـ JSON صرف بلا شرح.

الشكل المطلوب بالضبط:
{
  "purpose": "وصف قصير بالعربية للغرض من المشهد",
  "visualSequence": [
    {"assetLabel": "VISUAL_1", "durationSeconds": 4, "role": "hook"}
  ],
  "audioTracks": [
    {"assetLabel": "AUDIO_1", "role": "narration", "startSeconds": 0, "volumeDb": 0}
  ],
  "videoPolicy": {"muteOriginalAudio": true},
  "transitionType": "crossfade",
  "transitionDurationSeconds": 0.7,
  "confidence": 0.9,
  "unresolvedInstructions": []
}`;
}

function sanitizePlan(raw: unknown, availableLabels: Set<string>): DirectorPlan {
  const r = raw as Record<string, unknown>;

  const visualSequence = Array.isArray(r.visualSequence)
    ? r.visualSequence
        .filter((s) => s && typeof (s as Record<string, unknown>).assetLabel === 'string' && availableLabels.has((s as Record<string, unknown>).assetLabel as string))
        .map((s) => ({
          assetLabel: (s as Record<string, unknown>).assetLabel as string,
          durationSeconds: typeof (s as Record<string, unknown>).durationSeconds === 'number' ? Math.max(1, Math.min(30, (s as Record<string, unknown>).durationSeconds as number)) : 4,
          role: (s as Record<string, unknown>).role as DirectorPlan['visualSequence'][0]['role'],
        }))
    : [];

  const audioTracks = Array.isArray(r.audioTracks)
    ? r.audioTracks
        .filter((a) => a && typeof (a as Record<string, unknown>).assetLabel === 'string' && availableLabels.has((a as Record<string, unknown>).assetLabel as string))
        .map((a) => ({
          assetLabel: (a as Record<string, unknown>).assetLabel as string,
          role: ((a as Record<string, unknown>).role as string ?? 'narration') as DirectorPlan['audioTracks'][0]['role'],
          startSeconds: typeof (a as Record<string, unknown>).startSeconds === 'number' ? (a as Record<string, unknown>).startSeconds as number : 0,
          volumeDb: typeof (a as Record<string, unknown>).volumeDb === 'number' ? (a as Record<string, unknown>).volumeDb as number : 0,
        }))
    : [];

  const videoPolicyRaw = r.videoPolicy as Record<string, unknown> | undefined;

  return {
    purpose: typeof r.purpose === 'string' && r.purpose.trim() ? r.purpose.trim() : 'مشهد مُخرَج',
    visualSequence,
    audioTracks,
    videoPolicy: {
      muteOriginalAudio: videoPolicyRaw?.muteOriginalAudio === true,
    },
    transitionType: r.transitionType === 'cut' ? 'cut' : 'crossfade',
    transitionDurationSeconds: typeof r.transitionDurationSeconds === 'number' ? r.transitionDurationSeconds : 0.7,
    confidence: typeof r.confidence === 'number' ? Math.max(0, Math.min(1, r.confidence)) : 0.8,
    unresolvedInstructions: Array.isArray(r.unresolvedInstructions)
      ? (r.unresolvedInstructions as unknown[]).filter((x) => typeof x === 'string') as string[]
      : [],
  };
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'تسجيل الدخول مطلوب' },
      { status: 401 },
    );
  }

  let body: DirectorInterpretRequest;
  try {
    body = await request.json() as DirectorInterpretRequest;
  } catch {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-request', message: 'الطلب غير صالح' },
      { status: 400 },
    );
  }

  const { intent, productionAssets } = body;

  if (!intent?.trim()) {
    return NextResponse.json(
      { status: 'failed', reason: 'missing-intent', message: 'النية مطلوبة' },
      { status: 400 },
    );
  }

  if (!Array.isArray(productionAssets) || productionAssets.length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'no-assets', message: 'لا توجد أصول في الإنتاج' },
      { status: 400 },
    );
  }

  const availableLabels = new Set(productionAssets.map((a) => a.label));

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(productionAssets) },
        { role: 'user', content: intent.trim() },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 800,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) throw new Error('لم تصل استجابة من المفسِّر');

    const parsed: unknown = JSON.parse(rawContent);
    const plan = sanitizePlan(parsed, availableLabels);

    return NextResponse.json({ status: 'succeeded', plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطأ في تفسير النية';
    return NextResponse.json(
      { status: 'failed', reason: 'interpreter-error', message },
      { status: 500 },
    );
  }
}
