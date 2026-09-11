/**
 * PACKAGE XL — SOVEREIGN DIRECTOR EXECUTION BRIDGE
 * POST /api/ras-amr/director
 *
 * PACKAGE XL-A — GEMINI PROVIDER BINDING
 * The AZMA Intent Interpreter: the only server-side boundary between
 * the Creator's natural language and the typed DirectorPlan contract.
 *
 * Provider binding: Google Gemini (gemini-2.0-flash) via REST API.
 * The provider is replaceable — changing it must never require
 * rebuilding the DirectorPlan contract, Sovereign Director, or
 * Scene Executor.
 *
 * Security discipline:
 * - GEMINI_API_KEY is read server-side only; never returned to client.
 * - Provider never receives raw asset IDs or storage URIs — only
 *   client-assigned semantic labels (VISUAL_1, VIDEO_1,
 *   AUDIO_NARRATION, AUDIO_MUSIC, ...).
 * - subscriberTenantId verified via session cookie before any AI call.
 * - Response carries only the DirectorPlan — no provider metadata,
 *   no model version details, no job IDs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import type {
  DirectorPlan,
  DirectorInterpretRequest,
  ProductionAssetContext,
  TemplateGrammar,
} from '../../../../src/chambers/ras-al-amr/director-plan-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY غير مُهيَّأ على الخادم');
  return key;
}

function buildSystemPrompt(assets: ProductionAssetContext[], templateGrammar?: TemplateGrammar): string {
  const assetLines = assets
    .map((a) => {
      const typeLabel =
        a.capabilityTarget === 'VISUAL' ? 'صورة' :
        a.capabilityTarget === 'MOTION' ? 'فيديو' : 'صوت';
      const dur = a.durationSeconds ? ` · ${a.durationSeconds}ث` : '';
      // Voice hint: tells the interpreter this is a narration/voice-over asset,
      // distinguishing it from background music or generic sound effects.
      const voiceHint = a.isVoiceAsset ? ' [صوت سردي / تعليق صوتي]' : '';
      return `  - ${a.label}: ${typeLabel} (${a.name}${dur}${voiceHint})`;
    })
    .join('\n');

  // REPAIR #8 — TEMPLATE GRAMMAR: inject the selected template's production
  // rhythm as a planning guide. The template is advisory, not a hard slot count.
  let templateSection = '';
  if (templateGrammar) {
    const slotLines = templateGrammar.slotDurations
      .map((dur, i) => {
        const role = templateGrammar.slotRoles?.[i] ?? `موضع ${i + 1}`;
        return `    موضع ${i + 1}: ${role} — ${dur}ث`;
      })
      .join('\n');
    const transLabel = templateGrammar.transitionPreference === 'crossfade'
      ? `تلاشي متبادل (${templateGrammar.transitionDurationSeconds ?? 0.7}ث)`
      : 'قطع مباشر';
    templateSection = `
قالب الإنتاج المختار: ${templateGrammar.name} (${templateGrammar.domain})
إيقاع القالب الموجَّه (وسِّع أو قلِّص حسب الأصول المتاحة — ليس قيداً صارماً):
${slotLines}
تفضيل الانتقال: ${transLabel}
`;
  }

  return `أنت مُفسِّر النية السيادي لنظام AZMA OS للإخراج السينمائي. مهمتك الوحيدة: تحويل نية الخالق إلى خطة إخراج منظمة تعتمد حصراً على الأصول المتاحة.

الأصول المتاحة في مشهد الإنتاج الحالي:
${assetLines}
${templateSection}
قواعد حصرية لا استثناء فيها:
1. استخدم فقط التسميات المذكورة أعلاه في visualSequence و audioTracks — لا تخترع تسميات.
2. visualSequence: الأصول المرئية فقط (النوع "صورة" أو "فيديو").
3. audioTracks: الأصول الصوتية فقط (النوع "صوت").
4. الأصول المسماة AUDIO_NARRATION مخصصة للتعليق الصوتي (دور "narration")؛ الأصول المسماة AUDIO_MUSIC مخصصة للموسيقى الخلفية (دور "background").
5. إذا طُلبت أصول غير موجودة، دوِّنها في unresolvedInstructions ولا تضعها في الخطة.
6. transitionType: "crossfade" للمشاهد الهادئة، "cut" للمشاهد الديناميكية.
7. durationSeconds لكل عنصر مرئي: اقترح قيماً منطقية بين 2 و 8 ثوانٍ ما لم يطلب الخالق توقيتاً محدداً.
8. confidence: نسبة ثقتك من 0 إلى 1.
9. الرد بـ JSON صرف بلا شرح.

الشكل المطلوب بالضبط:
{
  "purpose": "وصف قصير بالعربية للغرض من المشهد",
  "visualSequence": [
    {"assetLabel": "VISUAL_1", "durationSeconds": 4, "role": "hook"}
  ],
  "audioTracks": [
    {"assetLabel": "AUDIO_NARRATION", "role": "narration", "startSeconds": 0, "volumeDb": 0}
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
        .filter((s) => {
          const slot = s as Record<string, unknown>;
          return typeof slot.assetLabel === 'string' && availableLabels.has(slot.assetLabel);
        })
        .map((s) => {
          const slot = s as Record<string, unknown>;
          return {
            assetLabel: slot.assetLabel as string,
            durationSeconds: typeof slot.durationSeconds === 'number'
              ? Math.max(1, Math.min(30, slot.durationSeconds))
              : 4,
            role: slot.role as DirectorPlan['visualSequence'][0]['role'],
          };
        })
    : [];

  const audioTracks = Array.isArray(r.audioTracks)
    ? r.audioTracks
        .filter((a) => {
          const track = a as Record<string, unknown>;
          return typeof track.assetLabel === 'string' && availableLabels.has(track.assetLabel);
        })
        .map((a) => {
          const track = a as Record<string, unknown>;
          return {
            assetLabel: track.assetLabel as string,
            role: (typeof track.role === 'string' ? track.role : 'narration') as DirectorPlan['audioTracks'][0]['role'],
            startSeconds: typeof track.startSeconds === 'number' ? track.startSeconds : 0,
            volumeDb: typeof track.volumeDb === 'number' ? track.volumeDb : 0,
          };
        })
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
    transitionDurationSeconds: typeof r.transitionDurationSeconds === 'number'
      ? r.transitionDurationSeconds
      : 0.7,
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

  const { intent, productionAssets, templateGrammar } = body;

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

  let apiKey: string;
  try {
    apiKey = getGeminiApiKey();
  } catch (err) {
    return NextResponse.json(
      { status: 'failed', reason: 'provider-not-configured', message: err instanceof Error ? err.message : 'المفسِّر غير مُهيَّأ' },
      { status: 503 },
    );
  }

  try {
    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(productionAssets, templateGrammar as TemplateGrammar | undefined) }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: intent.trim() }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text().catch(() => '');
      throw new Error(`Gemini responded with ${geminiResponse.status}${errBody ? `: ${errBody.slice(0, 200)}` : ''}`);
    }

    const geminiData = await geminiResponse.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) throw new Error('لم تصل استجابة من Gemini');

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
