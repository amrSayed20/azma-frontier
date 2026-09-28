/**
 * AZMA OS — «اختبر جميع الشاشات», 2026-09-28. 117 measurements, 0 failed.
 *
 *   قلب الإمبراطورية scrolled SIDEWAYS on all thirteen screens, ميزان القيمة
 *   on every phone — both ran on `content-box`, where padding is added to a
 *   `width: 100%` element. Seven stylesheets each declared `border-box` for
 *   themselves; globals.css declared none, so the two rooms that never wrote
 *   their own copy were the two that overflowed.
 *
 *   And the same shared controls were under the 44px touch floor in every room
 *   at once, because they ARE the same controls.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const GLOBALS = read('app/globals.css');

it('the Empire has one box model, written down once', () => {
  expect(GLOBALS).toMatch(/\*,\s*\*::before,\s*\*::after\s*\{[^}]*box-sizing:\s*border-box/);
});

it('the touch floor is asked of the device, not the screen size', () => {
  // A width breakpoint cannot tell a touched 1180px tablet from a zoomed
  // 960px laptop.
  const at = GLOBALS.indexOf('@media (pointer: coarse)');
  expect(at).toBeGreaterThan(-1);
  expect(GLOBALS.slice(at, GLOBALS.indexOf('}', GLOBALS.indexOf('min-height', at)))).toContain('min-height: 44px');
});

it('the two the height rule could not reach are named', () => {
  // The companion's three modes are CIRCLES — height worked, width failed —
  // and `min-height` does not apply to an inline `<a>` at all.
  expect(GLOBALS).toContain('.companion-mode-btn');
  expect(GLOBALS).toContain('.balance-package-shut a');
});

it('a press is answered by the Empire, not by the browser', () => {
  // rgba(51, 181, 229, 0.4): Chrome's blue, drawn as a rectangle over a round
  // button. Refused platform-wide, and replaced rather than merely removed.
  expect(GLOBALS).toContain('-webkit-tap-highlight-color: transparent');
  expect(GLOBALS).toMatch(/:active[\s\S]{0,200}filter:/);
});

it('الحجّة الدامغة’s tongue selector yields to the edges', () => {
  // `align-items: center` on a fixed full-screen flex box pushes a too-tall
  // child ABOVE the top edge, and an overflow starting at a negative offset
  // cannot be scrolled to.
  const css = read('app/hujjah-al-damighah/hujjah-al-damighah.css');
  expect(css).toContain('.tongue-selector-inner');
  expect(/\.tongue-selector\s*\{[^}]*overflow-y:\s*auto/.test(css)).toBe(true);
});

it('the gate’s language switcher is in the flow, not positioned over the scene', () => {
  // `position: fixed` does NOT anchor to the viewport when an ancestor carries
  // a transform — and `.arrival` is transformed on every visit. It measured at
  // top=1198px in a 664px window, covering the companion and unclickable.
  const css = read('src/imperial-experience-engine/experiences/arrival/arrival.css');
  const at = css.indexOf('.arrival-language {');
  expect(css.slice(at, css.indexOf('}', at))).not.toContain('position: fixed');
});

it('the audit cannot report a health it did not measure', () => {
  // Its first run threw on all 117 pages and printed «كل الحجرات سليمة».
  const audit = read('scripts/screen-audit-all.mjs');
  expect(audit).toContain('failures.push(');
  expect(audit).toContain('if (findings.length === 0 && failures.length === 0)');
});
