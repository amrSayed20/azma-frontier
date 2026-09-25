'use server';

import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage/db';
import { createStoryboard, addScene } from '@/src/persistent-storage/sovereign-project-repository';
import { composeSceneStructure } from '@/src/chambers/hujjah-al-damighah/sovereign-language-bridge';

/**
 * AZMA OS — رأس الأمر: the Creator writes what they want, and gets scenes.
 *
 * ─── WHAT THE FOUNDER FOUND MISSING ──────────────────────────────────────────
 *
 *   «كما أنني لا أجد حقلاً لإنشاء الاستوري بورد — يجب أن يجد المنشئ حقلاً
 *   لكتابة مراده ووضع الفكرة والمواصفات وضغط زر الإنشاء» — 2026-09-25.
 *
 *   MEASURED walking the Chamber that day: رأس الأمر had exactly one text
 *   field in the whole room, and it was for naming a track group. A Creator
 *   could direct scenes that arrived from somewhere else and could not state
 *   an idea of their own.
 *
 * ─── WHY THIS CONNECTS RATHER THAN BUILDS ────────────────────────────────────
 *
 *   Every part of the road already existed and none of them met. The scene
 *   composition is الحُجّة الدامغة's, `createStoryboard` and `addScene` are the
 *   Empire's own repository, and the storyboard → film production was proven
 *   end to end earlier the same day. What was missing was the first step: a
 *   Creator saying what they want. With it, a written idea reaches a finished
 *   film down a road that is already measured.
 *
 * ─── WHY IT IMPORTS ANOTHER CHAMBER'S BRIDGE ─────────────────────────────────
 *
 *   No other module outside الحُجّة الدامغة imports it, so this is the first.
 *   The alternative was a second scene composition, which would be a second
 *   authority on what a scene is — forbidden. The bridge is the Empire's
 *   language service and happens to live in that Chamber's folder; the
 *   composition it performs is one act with two sources, and `source` is what
 *   tells it which. If a third consumer appears, the bridge should move to a
 *   shared home rather than be copied.
 */

const SESSION_COOKIE = 'azma_session';

/** A scene as the Chamber shows it back — the Creator's half only. */
export interface BriefScene {
  readonly order: number;
  readonly seenAr: string;
  readonly saidAr: string;
}

export type BriefOutcome =
  | {
      readonly ok: true;
      readonly storyboardId: string;
      readonly scenes: readonly BriefScene[];
    }
  | { readonly ok: false; readonly messageAr: string };

/**
 * Turn a written idea into an ordered storyboard the Chamber can produce.
 *
 * `specificationsAr` is optional and is treated as binding when present: it is
 * what the Creator asked for, not a hint. The composition is told to obey it
 * literally and to fill only what it is silent about.
 */
export async function composeStoryboardFromBrief(input: {
  ideaAr: string;
  specificationsAr?: string;
  sceneCount?: number;
}): Promise<BriefOutcome> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };
  }

  const idea = input.ideaAr.trim();
  if (idea.length < 8) {
    // Said plainly, because a Creator who wrote three words needs to be told
    // what is short about them, not that something "failed".
    return { ok: false, messageAr: 'اكتب فكرتك في جملةٍ أو أكثر حتى تُفكَّك إلى مشاهد.' };
  }

  const specifications = (input.specificationsAr ?? '').trim();

  const composed = await composeSceneStructure({
    source: 'creative-brief',
    query: idea,
    answerAr: specifications.length > 0 ? specifications : undefined,
    evidenceTexts: [],
    sceneCount: input.sceneCount,
  });

  if (composed.scenes.length === 0) {
    // Each failure says something true and none of them names a provider.
    const spoken =
      composed.failure === 'NOT_A_STRUCTURE' ? 'لم تتحوّل الفكرة إلى مشاهد مرتّبة. أعد صياغتها بتفصيلٍ أوضح.'
      : composed.failure === 'TIMED_OUT'   ? 'استغرق التفكيك أطول من المتاح. أعد المحاولة.'
      : composed.failure === 'REFUSED'     ? 'رُفضت صياغة الفكرة كما كُتبت. أعد صياغتها.'
      : composed.failure === 'EMPTY'       ? 'لم يعد من التفكيك شيء. أعد المحاولة.'
      : composed.failure === 'UNREACHABLE' ? 'لم يكتمل الاتّصال بالتفكيك. أعد المحاولة.'
      : composed.failure === 'NO_KEY'      ? 'تفكيك الفكر إلى مشاهد غير مهيّأ في الإمبراطوريّة بعد.'
      :                                      'تعذّر تفكيك الفكرة إلى مشاهد الآن.';
    return { ok: false, messageAr: spoken };
  }

  const db = getDb();
  const storyboard = createStoryboard(db, {
    ownerId: session.creatorId,
    title: idea.slice(0, 80),
  });

  const kept: BriefScene[] = [];
  for (const [index, scene] of composed.scenes.entries()) {
    const added = addScene(db, {
      storyboardId: storyboard.storyboardId,
      ownerId: session.creatorId,
      description: scene.seenAr,
      directionNotes: scene.saidAr,
      // The visual half the production obeys. Never returned to the Creator —
      // `seenAr` is the half that is theirs.
      visualSearchEn: scene.searchEn,
      order: index + 1,
    });
    if (added.ok) {
      kept.push({ order: index + 1, seenAr: scene.seenAr, saidAr: scene.saidAr });
    }
  }

  if (kept.length === 0) {
    return { ok: false, messageAr: 'تعذّر حفظ المشاهد. أعد المحاولة.' };
  }

  return { ok: true, storyboardId: storyboard.storyboardId, scenes: kept };
}
