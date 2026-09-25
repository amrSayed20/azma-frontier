import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage/db';
import { getStoryboard, listScenes } from '@/src/persistent-storage/sovereign-project-repository';
import {
  MoneyPrinterTurboAdapter,
  isMoneyPrinterTurboConfigured,
} from '@/src/external-providers/moneyprinterturbo/moneyprinterturbo-adapter';
import { depositProductionIntoVault } from '@/src/external-providers/moneyprinterturbo/moneyprinterturbo-vault-deposit';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/ras-amr/storyboard/[storyboardId]/produce
 *
 * ─── THE RULING THIS IMPLEMENTS ──────────────────────────────────────────────
 *
 *   «تفكيك الموضوع إلى مشاهد مطالبةٌ تكتبها الحُجّة الدامغة، ويُنتَج ويُجمَّع
 *   في رأس الأمر، والمزوّد المعزول يكون مخصّصاً لإنتاج الستوري بورد»
 *   — the Founder, 2026-09-25.
 *
 *   الحُجّة الدامغة writes the ordered scenes and stops. This is where they are
 *   produced, and the isolated provider is what produces them — dedicated to
 *   this work, as ruled. Measured on the server: the provider answers on
 *   127.0.0.1:8080 and has been up for eleven days, bound to the loopback
 *   interface alone and reachable from nowhere else. It was configured,
 *   running, and connected to no Chamber at all.
 *
 * ─── WHAT THE CREATOR IS NEVER TOLD ──────────────────────────────────────────
 *
 *   Not the provider's name, not its task id, not the stock library it draws
 *   from, not a host or a port. The Knowledge Source Abstraction Principle
 *   holds here exactly as it holds in the Chamber of Evidence: what returns is
 *   a sovereign asset in the Creator's Vault. Every failure below answers in
 *   Arabic and names nothing outside the Empire.
 *
 * ─── OWNERSHIP ───────────────────────────────────────────────────────────────
 *
 *   The storyboard is read scoped to this session's creator. A storyboard that
 *   is not theirs answers 404 — the same answer as one that does not exist, so
 *   an id cannot be probed for someone else's work.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ storyboardId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { storyboardId } = await context.params;
  const db = getDb();

  const storyboard = getStoryboard(db, storyboardId, session.creatorId);
  if (!storyboard) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا توجد مشاهدُ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  const scenes = listScenes(db, storyboardId, session.creatorId);
  if (scenes.length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'no-scenes', message: 'لا مشاهدَ في هذه المطالبة بعد.' },
      { status: 422 },
    );
  }

  if (!isMoneyPrinterTurboConfigured()) {
    // Truthful, and silent about which provider is missing.
    return NextResponse.json(
      { status: 'failed', reason: 'production-unavailable', message: 'إنتاج المشاهد غير مهيّأ في الإمبراطوريّة بعد.' },
      { status: 503 },
    );
  }

  // The narration the scenes already carry, in their own order. `direction_notes`
  // holds what is said over each scene; `description` holds what is seen. The
  // spoken line is the script — a storyboard narrated by its own stage
  // directions would describe the picture instead of telling the story.
  const narration = scenes
    .map((s) => (s.directionNotes ?? '').trim())
    .filter((line) => line.length > 0)
    .join(' ');
  const subject = narration.length > 0 ? narration : scenes.map((s) => s.description).join(' ');

  const productionRequest = {
    subject,
    language: 'ar',
    // MEASURED on the workshop 2026-09-25: with no voice named, the task
    // failed at «failed to synthesize audio; verify the selected voice and TTS
    // connectivity» — the adapter sends an empty voice_name and the engine has
    // no Arabic default to fall back on. Asked again with this voice, the same
    // workshop synthesized the same Arabic sentence and finished at progress
    // 100 with no error. A production that narrates Arabic must be told which
    // Arabic voice to narrate it in.
    voiceName: 'ar-EG-SalmaNeural-Female',
    paragraphCount: scenes.length,
    aspect: '16:9' as const,
    subtitlesEnabled: true,
    // MEASURED and recorded in the provider module: the default font renders
    // Arabic as disconnected boxes. A named Arabic face is not decoration here.
    fontName: 'NotoSansArabic-Regular.ttf',
  };

  try {
    const adapter = new MoneyPrinterTurboAdapter();
    if (!(await adapter.checkHealth())) {
      return NextResponse.json(
        { status: 'failed', reason: 'production-unreachable', message: 'ورشة الإنتاج لا تستجيب الآن. أعد المحاولة.' },
        { status: 503 },
      );
    }

    const production = await adapter.produce(productionRequest);
    const asset = await depositProductionIntoVault({
      creatorId: session.creatorId,
      production,
      request: productionRequest,
      generatedScript: subject,
    });

    return NextResponse.json({
      status: 'succeeded',
      storyboardId,
      sceneCount: scenes.length,
      assetId: asset.assetId,
      assetUrl: asset.secureStorageUri,
    });
  } catch (err) {
    // The engine's own words go to the trail an engineer reads; the Creator is
    // told what happened, in Arabic, with nothing outside the Empire named.
    console.error('[RasAmr] storyboard production failed:', err);
    return NextResponse.json(
      { status: 'failed', reason: 'production-failed', message: 'تعذّر إنتاج المشاهد. أعد المحاولة.' },
      { status: 422 },
    );
  }
}
