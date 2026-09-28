/**
 * AZMA OS — the foot of the Imperial Gate, 2026-09-28.
 *
 *   FOUNDER: «ضع في هذه الصفحه بطاقه السياسات وكذلك بطاقه الميزان», then
 *   «الغ بطاقه الميزان واستكمل بطاقه السياسات فقط».
 *
 *   One card stands at the door, and it carries no cost truth at all.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ARRIVAL = readFileSync(
  join(process.cwd(), 'src/imperial-experience-engine/experiences/arrival/ArrivalExperience.tsx'),
  'utf8',
);
const CSS = readFileSync(
  join(process.cwd(), 'src/imperial-experience-engine/experiences/arrival/arrival.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

it('the door carries a way to the policies, and no ledger at all', () => {
  expect(ARRIVAL).toContain('href="/policies"');
  expect(ARRIVAL).not.toContain('href="/sovereign-balance"');
});

it('and it speaks the visitor\'s own tongue, not one fixed language', () => {
  // The gate is the one surface that genuinely speaks more than one.
  expect(ARRIVAL).toContain("t(dict, 'gate.policiesName')");
});

it('the removed card left no words behind in either dictionary', () => {
  for (const f of ['ar', 'en']) {
    const dict = readFileSync(join(process.cwd(), `src/creator-language/dictionary/${f}.ts`), 'utf8');
    expect(dict).not.toContain('gate.balanceName');
  }
});

it('the glyph beside each name is painted with a token that exists', () => {
  // `--azma-gold` is not defined anywhere; the scale is --azma-gold-1..8.
  const at = CSS.indexOf('.arrival-ledger-glyph');
  expect(CSS.slice(at, CSS.indexOf('}', at))).not.toMatch(/var\(--azma-gold\)/);
});
