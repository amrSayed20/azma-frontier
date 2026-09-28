/**
 * AZMA OS — «مشكلة zoom بالمتصفّح في أكثر من حجرة ومنهم رأس الأمر».
 *
 * رأس الأمر was measured and repaired first. «أكثر من حجرة» was a claim about
 * rooms nobody had asked, so every room was asked the same question at the
 * viewports browser zoom actually produces — 1152×720 and 960×600 are a
 * 1440×900 screen at 125% and 150%.
 *
 * ─── THE REGISTER, MEASURED ON THE LIVE RELEASE ─────────────────────────────
 *
 *   قلب الإمبراطورية   clean at every size
 *   القيامة            clean at every size
 *   مكمن الغاية        clean at every size
 *   المجلس الأعلى      clean at every size
 *   ميزان القيمة       clean at every size
 *
 *   الحجّة الدامغة     100%: clean · 125%:  59px trapped · 150%: 154px trapped
 *   قصر الخزانة        100%:  80px trapped · 125%: 40px · 150%: 40px
 *   الخزانة            five .gate-card, 50px each, at full size
 *
 * The Palace and the Vault clip at FULL SIZE — they were never a zoom defect
 * at all, and nobody reported them because what is missing is at the bottom,
 * where a room is expected to end.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const strip = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

/** Every declaration block whose selector list contains this exact selector. */
function block(css: string, selector: string): string {
  const blocks: string[] = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[1]!.split(',').some((s) => s.trim() === selector)) blocks.push(m[2]!);
  }
  if (blocks.length === 0) throw new Error(`selector not found: ${selector}`);
  return blocks.join('\n');
}

const ROOMS: readonly (readonly [string, string, string])[] = [
  ['الحجّة الدامغة', 'app/hujjah-al-damighah/hujjah-al-damighah.css', '.hujjah-viewport'],
  ['قصر الخزانة', 'app/sovereign-vault-palace/sovereign-vault.css', '.palace-viewport'],
];

describe('1 · a room pinned to the window can be scrolled inside', () => {
  it.each(ROOMS.map(([n, f, s]) => [n, f, s]))('%s — %s', (_name, file, selector) => {
    const rule = block(strip(read(file)), selector);
    // `position: fixed; inset: 0` pins the room to the window. Content that
    // outgrows the window then has nowhere to go, and the page cannot scroll
    // to it either.
    expect(rule).toContain('position: fixed');
    expect(rule).toContain('overflow-y: auto');
    expect(rule).not.toMatch(/overflow:\s*hidden/);
  });

  it.each(ROOMS.map(([n, f, s]) => [n, f, s]))('%s may shrink, or the rule never engages', (_name, file, selector) => {
    // A flex column child defaults to min-height: auto, refuses to shrink
    // below its content, and the overflow rule above it never engages.
    expect(block(strip(read(file)), selector)).toContain('min-height: 0');
  });
});

describe('2 · deliberate clipping is a decision, and stays one', () => {
  const CSS = read('app/sovereign-vault/sovereign-vault.css');

  it('the Vault’s gate cards keep their fixed height and their cut glow', () => {
    // CORRECTED THE SAME DAY IT WAS WRITTEN. The sweep reported five of these
    // trapping 50px and I changed `height: 160px` to `min-height` +
    // `height: auto`, reading the 50px as a description nobody could see.
    //
    // MEASURED inside a live card afterwards: the only overflowing child is
    // `.gate-portal-effect` — `position: absolute; bottom: -50px; height:
    // 100px`, an empty glow hung half outside the card FOR `overflow: hidden`
    // to cut. The card holds an icon and a name; both fit. The description
    // lives outside the card entirely.
    //
    // So this guard holds the card as it was designed, and the sweep was
    // corrected instead. A repair aimed at a measurement rather than at a
    // defect is a change to a certified surface bought with nothing.
    const rule = block(strip(CSS), '.gate-card');
    expect(rule).toContain('height: 160px');
    expect(rule).toContain('overflow: hidden');
    const glow = block(strip(CSS), '.gate-portal-effect');
    expect(glow).toContain('position: absolute');
    expect(glow).toContain('bottom: -50px');
  });

  it('the sweep no longer calls that decision a defect', () => {
    const audit = read('scripts/zoom-audit-all-chambers.mjs');
    expect(audit).toContain('inFlowOverflows');
    expect(audit).toContain("getComputedStyle(k).position === 'absolute'");
  });
});

describe('3 · the rooms already measured clean stay unpinned', () => {
  it.each([
    ['القيامة', 'app/qiyamah-chamber/qiyamah-chamber.css'],
    ['مكمن الغاية', 'app/makman-al-ghayah/makman-al-ghayah.css'],
  ])('%s does not lock the page against scrolling', (_name, file) => {
    // `body { overflow: hidden }` is what turns a tall room into a trap. Only
    // رأس الأمر declares it, and only because every one of its own regions
    // scrolls by itself.
    const css = strip(read(file));
    expect(css).not.toMatch(/body[^{]*\{[^}]*overflow:\s*hidden/);
  });

  it('رأس الأمر may lock the page, because each of its regions scrolls', () => {
    const css = strip(read('app/ras-amr/ras-amr.css'));
    expect(css).toMatch(/body:has\(\.ras-amr-viewport\)[^{]*\{[^}]*overflow:\s*hidden/);
    for (const sel of ['.ras-panel-left', '.ras-panel-right', '.ras-center']) {
      expect(block(css, sel)).toContain('overflow-y: auto');
    }
  });
});
