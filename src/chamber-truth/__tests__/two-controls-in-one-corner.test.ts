/**
 * AZMA OS — مكمن الغاية, reached for by hand on production, 2026-09-29.
 *
 *   «؟ كيف تعمل هذه الحجرة» was present, visible, enabled — and the click
 *   timed out. The companion sat over it. One control was placed logically
 *   and one physically, and in Arabic both resolve to the same corner.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const CSS = readFileSync(
  join(process.cwd(), 'src/imperial-experience-engine/experiences/makman-al-ghayah/makman-experience.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

function block(selector: string): string {
  const at = CSS.indexOf(`${selector} {`);
  return at === -1 ? '' : CSS.slice(at, CSS.indexOf('}', at));
}

it('the companion does not take the corner this chamber\'s explainer lands in', () => {
  // MEASURED: the button resolves to the LEFT here (its subtree is rtl inside
  // an ltr document), so the companion must not also be on the left. A
  // logical property cannot answer it — the two are logical about different
  // frames — so the side is physical and the measurement is recorded in CSS.
  const b = block('.makman-companion');
  expect(b).toMatch(/right:\s*30px/);
  expect(b).not.toMatch(/(^|\s|;)\s*left:/);
  expect(b).not.toContain('inset-inline-start');
});
