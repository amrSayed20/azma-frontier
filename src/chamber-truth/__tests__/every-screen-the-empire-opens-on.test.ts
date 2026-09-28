/**
 * AZMA OS — «اختبر جميع الشاشات».
 *
 * Every room on thirteen screens — phones portrait and landscape, a tablet
 * both ways, the laptops people own, the viewports browser zoom produces, and
 * a 1920×1080 desktop. 117 measurements, 0 failed.
 *
 * ─── WHAT IT FOUND, AND WHAT EACH ONE ACTUALLY WAS ──────────────────────────
 *
 *   قلب الإمبراطورية forced the page to scroll SIDEWAYS on ALL THIRTEEN
 *   screens, desktop included, and ميزان القيمة on every phone. Neither was a
 *   layout decision: both rooms ran on `box-sizing: content-box`, where
 *   padding is ADDED to a `width: 100%` element. SEVEN stylesheets in this
 *   repository each declare `border-box` for themselves; globals.css declared
 *   none, so the two rooms that never wrote their own copy were exactly the
 *   two that overflowed.
 *
 *   الحجّة الدامغة trapped its tongue selector — 162px on a 360px phone, 70px
 *   in landscape, nothing on a tablet, which is why it had never been seen.
 *   `align-items: center` on a fixed full-screen flex box pushes a too-tall
 *   child ABOVE the container's top edge, and an overflow starting at a
 *   negative offset cannot be scrolled to. Same shape as the Palace's keypad.
 *
 *   And the same few SHARED controls were under the 44px touch floor in every
 *   room at once, because they are the same controls: the demonstration
 *   button, the exit, the vault's two entry methods.
 *
 * ─── AND THE AUDIT ITSELF LIED FIRST ────────────────────────────────────────
 *
 *   Its first run threw on all 117 pages — `page.evaluate` takes ONE argument
 *   and it was passed two — and printed «كل الحجرات سليمة على كل الشاشات»,
 *   because the findings list stayed empty while nothing had been measured.
 *   It counts what it measured now and refuses to report clean while any
 *   measurement failed.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const strip = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

function block(css: string, selector: string): string {
  const blocks: string[] = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[1]!.split(',').some((s) => s.trim() === selector)) blocks.push(m[2]!);
  }
  if (blocks.length === 0) throw new Error(`selector not found: ${selector}`);
  return blocks.join('\n');
}

const GLOBALS = read('app/globals.css');

describe('1 · the Empire has one box model, written down once', () => {
  it('globals.css declares the baseline', () => {
    const code = strip(GLOBALS);
    expect(code).toMatch(/\*,\s*\*::before,\s*\*::after\s*\{[^}]*box-sizing:\s*border-box/);
  });

  it('and it is the same value the seven rooms had each written for themselves', () => {
    // A rule repeated in seven places and absent from the eighth is not a
    // style; it is a fact about the platform nobody had written down. The
    // seven are unaffected — they already set this value.
    const roomsThatDeclaredItAlready = [
      'app/ras-amr/ras-amr.css',
      'app/qiyamah-chamber/qiyamah-chamber.css',
      'app/hujjah-al-damighah/hujjah-al-damighah.css',
      'app/sovereign-vault-palace/sovereign-vault.css',
      'app/sovereign-vault/sovereign-vault.css',
      'app/makman-al-ghayah/makman-al-ghayah.css',
      'app/creator-access.css',
    ];
    for (const f of roomsThatDeclaredItAlready) {
      expect(read(f)).toContain('box-sizing: border-box');
    }
  });
});

describe('2 · a centred overlay yields to the edges instead of overrunning them', () => {
  it('الحجّة الدامغة’s tongue selector scrolls, and centres by margin', () => {
    const css = strip(read('app/hujjah-al-damighah/hujjah-al-damighah.css'));
    const outer = block(css, '.tongue-selector');
    expect(outer).toContain('overflow-y: auto');
    // `align-items: center` is what pushed the child above the top edge.
    expect(outer).not.toContain('align-items: center');
    const inner = block(css, '.tongue-selector-inner');
    expect(inner).toContain('margin: auto');
    expect(inner).toContain('flex-shrink: 0');
  });

  it('and the Palace’s gate — the same shape — is still held', () => {
    const css = strip(read('app/sovereign-vault-palace/sovereign-vault.css'));
    expect(block(css, '.palace-gate')).toContain('flex-shrink: 0');
  });
});

describe('3 · one touch floor, asked of the device and not the screen size', () => {
  const code = strip(GLOBALS);

  it('is declared under `pointer: coarse`', () => {
    // A width breakpoint cannot tell a 1180px tablet that is touched from a
    // 960px zoomed laptop that is not.
    expect(code).toMatch(/@media \(pointer: coarse\)/);
  });

  it('gives interactive controls the 44px both Apple and Google publish', () => {
    const at = code.indexOf('@media (pointer: coarse)');
    const rule = code.slice(at, code.indexOf('}', code.indexOf('min-height', at)));
    expect(rule).toContain('min-height: 44px');
    for (const sel of ['button', 'a[href]', '[role="button"]']) {
      expect(rule).toContain(sel);
    }
  });

  it('and imposes no BLANKET width, because width was almost never the failure', () => {
    // Measured: these are wide buttons with tight vertical padding. A blanket
    // min-width would stretch every deliberately narrow control in a row.
    //
    // TIGHTENED after re-measuring: three round controls DO fail on width, and
    // they are named one by one below rather than served by widening
    // everything. So the blanket list must still carry no min-width, and the
    // check now reads that list precisely instead of a character count.
    const at = code.indexOf('@media (pointer: coarse)');
    const blanket = code.slice(at, code.indexOf('}', code.indexOf('min-height', at)));
    expect(blanket).toContain('button');
    expect(blanket).not.toContain('min-width');
  });

  it('nothing changes for a mouse', () => {
    expect(code).not.toMatch(/@media \(max-width[^)]*\)\s*\{[^}]*min-height:\s*44px/);
  });
});

describe('3b · the two the height rule could not reach', () => {
  const code = strip(GLOBALS);

  it('the companion’s three modes are round, so they are named by width too', () => {
    // Re-measured after the height rule shipped: 22×44 and 26×44. The height
    // WORKED; the failure is width. They are the only circular controls in the
    // Empire, which is why a blanket `min-width` was refused — it would have
    // stretched every deliberately narrow control in a row to serve three.
    const at = code.indexOf('.companion-mode-btn');
    expect(at).toBeGreaterThan(code.indexOf('@media (pointer: coarse)'));
    const rule = code.slice(at, code.indexOf('}', at));
    expect(rule).toContain('min-width: 44px');
    expect(rule).toContain('height: 44px');
  });

  it('their rule is written in six other places, and this is the one about touch', () => {
    // Six copies carried one defect. Recorded so the count cannot grow
    // unnoticed, and so nobody "fixes" one copy and believes it done.
    const copies = [
      'src/imperial-experience-engine/experiences/arrival/arrival.css',
      'src/imperial-experience-engine/experiences/login/login-experience.css',
      'src/imperial-experience-engine/experiences/signup/signup-experience.css',
      'app/hujjah-al-damighah/hujjah-al-damighah.css',
      'app/imperial-foyer/imperial-foyer.css',
      'app/sovereign-vault-palace/sovereign-vault.css',
    ];
    for (const f of copies) expect(read(f)).toContain('.companion-mode-btn');
    expect(copies).toHaveLength(6);
  });

  it('an inline link is given a box before it is given a height', () => {
    // `min-height` does not apply to an inline element. The rule matched
    // «وثّق حسابك» and did nothing at all — a selector that matches is
    // not a rule that applies.
    const at = code.indexOf('.balance-package-shut a');
    expect(at).toBeGreaterThan(-1);
    const rule = code.slice(at, code.indexOf('}', at));
    expect(rule).toContain('display: inline-block');
    expect(rule).toContain('min-height: 44px');
  });
});

describe('4 · the audit refuses to report a health it did not measure', () => {
  const AUDIT = read('scripts/screen-audit-all.mjs');

  it('counts what it measured against what it expected', () => {
    expect(AUDIT).toContain('let measured = 0;');
    expect(AUDIT).toContain('measured += 1;');
    expect(AUDIT).toContain('const expected = SCREENS.length * CHAMBERS.length;');
  });

  it('records every measurement it could not make', () => {
    expect(AUDIT).toContain('failures.push(');
  });

  it('and cannot print a clean bill while any measurement failed', () => {
    expect(AUDIT).toContain('if (findings.length === 0 && failures.length === 0)');
    expect(AUDIT).toContain('لكنّ القياس ناقص، فلا حكم');
  });
});
