/**
 * AZMA OS — رأس الأمر: who decides what this scene is for.
 *
 * ─── THE FOUNDER, 2026-09-28 ────────────────────────────────────────────────
 *
 *   «ظهر حقل التوجيه بالفعل الآن، ولكن المخرج ملتزم بتوجيه قديم من الحجة
 *    الدامغة سابقاً ولا يبدأ في استلام التوجيه لأصل قديم · ولا يقبل حذف
 *    التوجيه القديم وادخال توجيهات جديده»
 *
 * ─── WHAT IT WAS, IN ONE LINE ───────────────────────────────────────────────
 *
 *       const goalToUse = formalGoal ?? syntheticGoal ?? undefined;
 *
 *   `formalGoal` comes from `activeVaultAsset.metadata.goalId` — written the
 *   day the asset arrived from الحُجّة الدامغة — and it won unconditionally.
 *   Worse, the synthetic goal carrying what the Creator typed was only BUILT
 *   when no formal goal existed, so on an old asset the typed intent could not
 *   reach the Director at all. The surface said so plainly and nobody read it
 *   as a defect: «النية المكتوبة تعمل كمرجع إضافي».
 *
 *   There was no control anywhere to see that goal, refuse it, or replace it.
 *   «الحجرة تقترح؛ والخالق وحده يقرّر» held for everything in this room except
 *   the one thing that decided what it would make.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const PAGE = read('app/ras-amr/page.tsx');
const CSS = read('app/ras-amr/ras-amr.css');

const strip = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

describe('1 · the Creator speaking now outranks a goal recorded then', () => {
  it('the typed intent is what the Director is given', () => {
    expect(strip(PAGE)).toContain('const goalToUse = typedGoal ?? formalGoal ?? undefined;');
    // The order that made the defect.
    expect(strip(PAGE)).not.toContain('formalGoal ?? syntheticGoal');
  });

  it('and it is built whenever it exists, not only when no formal goal does', () => {
    // `!formalGoal && _desc` is what made the typed words unreachable: the
    // object carrying them was never even constructed on an old asset.
    expect(strip(PAGE)).toContain('const typedGoal: FormalGoalContractView | null = _desc');
    expect(strip(PAGE)).not.toContain('!formalGoal && _desc');
  });

  it('a formal goal still governs a scene the Creator has said nothing about', () => {
    // Nothing is destroyed — that is the whole reason it was recorded. It
    // simply stops outranking the person in the room.
    expect(strip(PAGE)).toContain('typedGoal ?? formalGoal');
  });
});

describe('2 · a direction that governs can be seen, and let go', () => {
  it('the old goal is shown, in its own words', () => {
    expect(PAGE).toContain('className="creator-intent-formal"');
    expect(PAGE).toContain('{formalGoal.title || formalGoal.description}');
  });

  it('and there is a control that releases it', () => {
    expect(PAGE).toContain('className="creator-intent-release"');
    expect(PAGE).toContain('setReleasedGoalId(activeGoalId)');
    expect(PAGE).toContain('أطلِق الهدف السابق');
  });

  it('a released goal is not quietly fetched back', () => {
    // The fetch runs on `activeGoalId`; without this it would restore the
    // released goal on the next render and the release would read as a bug.
    expect(strip(PAGE)).toContain('if (activeGoalId === releasedGoalId)');
    expect(strip(PAGE)).toContain('}, [activeGoalId, releasedGoalId]);');
  });

  it('the release control is painted, not a bare rectangle', () => {
    for (const decl of ['background', 'border', 'color']) {
      expect(CSS.slice(CSS.indexOf('.creator-intent-release {'))).toContain(decl);
    }
  });
});

describe('3 · the room no longer tells the Creator their words are decoration', () => {
  it('«مرجع إضافي» is gone', () => {
    // It was accurate about a Director that ignored the typed intent. Saying
    // it now would be false, and saying it then was the defect in words.
    expect(PAGE).not.toContain('النية المكتوبة تعمل كمرجع إضافي');
  });

  it('and it states which of the two is actually in force', () => {
    expect(PAGE).toContain('المخرج الآلي يعمل بنيّتك المكتوبة');
    expect(PAGE).toContain('نيّتك تعلو عليه الآن');
    expect(PAGE).toContain('اكتب نيّتك فوقه، أو أطلقه');
  });
});
