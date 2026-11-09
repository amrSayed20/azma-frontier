/**
 * AZMA OS — RAS AL AMR: A TEMPLATE BECOMES SCENES IN THE PROJECT YOU HAVE OPEN.
 *
 * ─── THE BREAK THIS CLOSES ──────────────────────────────────────────────────
 *
 *   «المشكلة الحالية أن اعتماد القالب ينقل المبدع إلى شاشة المونتاج. ألغِ هذا
 *    الانقطاع في تجربة الاستخدام.» — the Founder, 2026-11-09.
 *
 *   MEASURED: confirming a template called `handleSelectIntent`, which moved
 *   the chamber to its montage workspace. A Creator building a storyboard
 *   pressed «use this one» and arrived somewhere else, with their scene list
 *   behind them.
 *
 *   A template is not a destination. It is a SHAPE — how many scenes, how
 *   long each runs, how they join, and what each one is for. All four of
 *   those are things a storyboard scene already holds, so adoption is simply
 *   writing them into the project the Creator already has open.
 *
 * ─── WHY IT APPENDS AND NEVER REPLACES ──────────────────────────────────────
 *
 *   An adoption that cleared the canvas would destroy work in one press, and
 *   the Creator would have no way back to it except a step that must then be
 *   perfect. Appending is reversible by its nature: the scenes are added, and
 *   ONE step back removes exactly them.
 *
 *   And because this returns a canvas like every other storyboard operation,
 *   it travels through the workshop's single `commit` — so undo and redo
 *   cover template adoption without one line written for them.
 *
 * ─── WHAT IT NEVER DOES ─────────────────────────────────────────────────────
 *
 *   It attaches no asset, calls no provider and holds no unit. A template
 *   says what a scene is FOR; what fills it is the Creator's own act, priced
 *   and gated where every other picture is.
 */
import type { SovereignCanvas } from './assembly-contracts';
import { addScene, readScenes } from './storyboard';

/**
 * The parts of a sovereign template that become scenes. Declared structurally
 * rather than imported from the chamber page: this module must stay pure, and
 * a template that grows a field it does not need here should not touch it.
 */
export interface AdoptableTemplate {
  readonly id: string;
  readonly name: string;
  readonly slotDurations: readonly number[];
  /** What each position IS — becomes the scene's title. */
  readonly slotRoles?: readonly string[];
  /** What belongs in each position — becomes the scene's description. */
  readonly slotCues?: readonly string[];
  readonly transitionPreference: 'cut' | 'crossfade';
}

export interface Adoption {
  readonly canvas: SovereignCanvas;
  /** The scenes this adoption created, in template order. */
  readonly sceneIds: readonly string[];
}

/**
 * Write a template's shape into the project the Creator has open.
 *
 * The first adopted scene keeps `cut` when the project was empty — a film
 * does not fade in from nothing. Every later scene takes the template's own
 * transition, which is the whole reason a template has one.
 */
export function adoptTemplateIntoProject(
  canvas: SovereignCanvas,
  template: AdoptableTemplate,
  now: number,
): Adoption {
  let next = canvas;
  const sceneIds: string[] = [];
  const startedEmpty = readScenes(canvas).length === 0;

  template.slotDurations.forEach((seconds, index) => {
    const isVeryFirst = startedEmpty && index === 0;
    const added = addScene(next, {
      title: template.slotRoles?.[index] ?? `موضع ${index + 1}`,
      // The cue is the Creator's starting words for this scene — and the one
      // thing the picture button needs before it will make anything. A slot
      // with no cue is left EMPTY rather than filled with a label, so the
      // workshop can tell them it is waiting for their words.
      description: template.slotCues?.[index] ?? '',
      durationSeconds: seconds,
      transitionIn: isVeryFirst ? 'cut' : template.transitionPreference,
    }, now);
    next = added.canvas;
    sceneIds.push(added.sceneId);
  });

  return { canvas: next, sceneIds };
}

/** How many scenes adopting this template will add. */
export function adoptionSceneCount(template: AdoptableTemplate): number {
  return template.slotDurations.length;
}

/** How many of its slots carry words a Creator can start from. */
export function adoptionCuedCount(template: AdoptableTemplate): number {
  return template.slotDurations
    .filter((_, i) => (template.slotCues?.[i] ?? '').trim().length > 0).length;
}
