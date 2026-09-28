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

it('the companion is placed by a side that follows the language, not a fixed one', () => {
  // `left` is the same corner the shared demonstration button takes in Arabic.
  const b = block('.makman-companion');
  expect(b).toContain('inset-inline-start');
  expect(b).not.toMatch(/(^|\s|;)left:/);
});
