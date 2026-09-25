'use server';

import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage/db';
import { createStoryboard, addScene, listScenes, setScenePicturePlan } from '@/src/persistent-storage/sovereign-project-repository';
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

/** Who is asking. One way to know it, used by every action in this file. */
async function currentSession() {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  return sessionId ? verifySession(sessionId) : null;
}


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
  const session = await currentSession();
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
      // The author's decision about this picture, and the demand it implies.
      // Kept, not re-derived: the moment of deciding what is seen is the
      // moment the answer is known.
      sourcing: scene.sourcing,
      creationDemandAr: scene.creationDemandAr,
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


/**
 * The scenes of a storyboard, with the picture plan of each — as the Creator
 * must see them BEFORE anything is produced or paid for.
 *
 * ─── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 *   The Founder, 2026-09-25: رأس الأمر «لا يمنح الفرصة للمنشئ القادم إليه
 *   بمطالبة من الحجة أن يضيف أصولاً لهذه المطالبة من عنده... حتى إنه لا يسأل
 *   المبدع عن طلب أو مواصفات للمادة المولّدة قبل توليدها.»
 *
 *   Measured, and he was right: scenes arrived, the Creator pressed produce,
 *   and the Chamber decided by itself which pictures to buy and what to ask
 *   for — spending the Creator's credits on demands they had never read. The
 *   Chamber may propose. Only the Creator decides.
 */
export interface ScenePlanView {
  readonly sceneId: string;
  readonly order: number;
  /** What is seen, in the Creator's own words. */
  readonly seenAr: string;
  /** What is said over it. */
  readonly saidAr: string;
  readonly sourcing: 'stock' | 'generate' | 'creator-asset';
  /** The demand, when it is to be generated. Theirs to rewrite. */
  readonly creationDemandAr: string | null;
  /** Their own asset, when they chose one. */
  readonly visualAssetId: string | null;
}

export type ScenePlansOutcome =
  | { readonly ok: true; readonly scenes: readonly ScenePlanView[] }
  | { readonly ok: false; readonly messageAr: string };

export async function readScenePlans(storyboardId: string): Promise<ScenePlansOutcome> {
  const session = await currentSession();
  if (!session) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };

  const scenes = listScenes(getDb(), storyboardId, session.creatorId);
  if (scenes.length === 0) return { ok: false, messageAr: 'لا مشاهدَ في هذه المطالبة.' };

  return {
    ok: true,
    scenes: scenes.map((sc) => ({
      sceneId: sc.sceneId,
      order: sc.order,
      seenAr: sc.description,
      saidAr: sc.directionNotes ?? '',
      sourcing: sc.sourcing ?? 'stock',
      creationDemandAr: sc.creationDemandAr,
      visualAssetId: sc.visualAssetId,
    })),
  };
}

/** The Creator changes one scene's picture plan. Theirs to change, always. */
export async function setScenePlan(input: {
  sceneId: string;
  sourcing: 'stock' | 'generate' | 'creator-asset';
  creationDemandAr?: string | null;
  visualAssetId?: string | null;
}): Promise<{ ok: boolean; messageAr?: string }> {
  const session = await currentSession();
  if (!session) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };

  if (input.sourcing === 'generate' && (input.creationDemandAr ?? '').trim().length < 8) {
    // Said plainly rather than refused silently: a demand is what will be
    // made, and an empty one would spend their generation on nothing.
    return { ok: false, messageAr: 'اكتب ما تريد إنشاءه في هذا المشهد قبل توليده.' };
  }
  if (input.sourcing === 'creator-asset' && !input.visualAssetId) {
    return { ok: false, messageAr: 'اختر أصلاً من خزانتك لهذا المشهد.' };
  }

  const changed = setScenePicturePlan(getDb(), input.sceneId, session.creatorId, {
    sourcing: input.sourcing,
    creationDemandAr: input.creationDemandAr ?? null,
    visualAssetId: input.visualAssetId ?? null,
  });
  return changed ? { ok: true } : { ok: false, messageAr: 'لم يُحفظ التغيير. أعد المحاولة.' };
}
