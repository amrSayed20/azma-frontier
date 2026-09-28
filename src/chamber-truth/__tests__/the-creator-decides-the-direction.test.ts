/**
 * AZMA OS — رأس الأمر, 2026-09-28: «المخرج ملتزم بتوجيه قديم … ولا يقبل حذف
 * التوجيه القديم وادخال توجيهات جديده».
 *
 * It was one line: `formalGoal ?? syntheticGoal`. An asset's `metadata.goalId`,
 * written the day it came from الحُجّة الدامغة, won unconditionally — and the
 * object carrying the Creator's typed words was only BUILT when no formal goal
 * existed, so on an old asset those words could not reach the Director at all.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PAGE = readFileSync(join(process.cwd(), 'app/ras-amr/page.tsx'), 'utf8');

it('what the Creator says now outranks a goal recorded then', () => {
  expect(PAGE).toContain('const goalToUse = typedGoal ?? formalGoal ?? undefined;');
  // And it is built whenever it exists, not only when no formal goal does.
  expect(PAGE).not.toContain('!formalGoal && _desc');
});

it('the governing goal can be seen and released', () => {
  expect(PAGE).toContain('setReleasedGoalId(activeGoalId)');
  // …and a released goal is not fetched back on the next render.
  expect(PAGE).toContain('if (activeGoalId === releasedGoalId)');
});

it('the room no longer calls the Creator’s words a reference', () => {
  // «النية المكتوبة تعمل كمرجع إضافي» was accurate about a Director that
  // ignored them. Saying it now would be false; saying it then was the defect.
  expect(PAGE).not.toContain('النية المكتوبة تعمل كمرجع إضافي');
});
