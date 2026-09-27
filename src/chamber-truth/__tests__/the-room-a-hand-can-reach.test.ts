/**
 * AZMA OS — رأس الأمر: a room a hand can actually reach.
 *
 * ─── THE FOUNDER'S WALK, 2026-09-28 ─────────────────────────────────────────
 *
 *   «هناك مشكلة zoom بالمتصفّح في أكثر من حجرة ومنهم رأس الأمر · القائمتان
 *    الجانبيتان الاسكرول متوقّف وباقي القائمة أسفل الشاشة · لا يوجد زرّ
 *    لإنتاج الأصل بعد ترتيبه · حقل توجيه المخرج لا يستجيب للكتابة · أخذتُ
 *    أصلاً من الخزانة لأذهب به إلى رأس الأمر فلم يأتِ هناك»
 *
 * ─── WHAT WAS MEASURED, AND WHY FOUR NOTES WERE ONE DEFECT ──────────────────
 *
 *   Browser zoom does not scale a page — it shrinks the CSS viewport. The
 *   chamber is `position: fixed; inset: 0` with a fixed header row and a
 *   160px timeline row, so the height zoom takes is paid by the rails; and
 *   both rails were `overflow: hidden` inside a body that is `overflow:
 *   hidden` too. Measured on the live release:
 *
 *       1440×900 (100%)   0px clipped
 *       1366×768          83px clipped, unreachable
 *       1152×720 (125%)  215px clipped, unreachable
 *        960×600 (150%)  335px clipped, unreachable
 *
 *   At 125% the director's own direction field sat at top=783px in a 720px
 *   window. «لا يستجيب للكتابة» was exact: it was not there to be typed into.
 *   Material arriving from الحُجّة الدامغة lands in that same field.
 *
 *   The two that were NOT the same defect: ✂ المونتاج offered no production
 *   act at all — the only control carrying the meaning was the name of the
 *   other mode — and a treasure arriving from the Palace with any optional
 *   field missing was dropped in silence.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const CSS = read('app/ras-amr/ras-amr.css');
const PAGE = read('app/ras-amr/page.tsx');

/** Comments are for engineers; rules about the room are checked on the room. */
const strip = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

/**
 * EVERY declaration block for a selector, joined.
 *
 * CORRECTED while writing this file: reading only the FIRST block made the
 * guard report `.ras-panel-right` as still clipping, because its first
 * appearance is the grid-placement one-liner and the rule it was asked about
 * lives in the second. A guard that reads one of two blocks is a guard that
 * can be satisfied — or fooled — by declaration order.
 */
function block(css: string, selector: string): string {
  const blocks: string[] = [];
  let from = 0;
  for (;;) {
    const at = css.indexOf(`${selector} {`, from);
    if (at === -1) break;
    const end = css.indexOf('}', at);
    blocks.push(css.slice(at, end));
    from = end + 1;
  }
  if (blocks.length === 0) throw new Error(`selector not found: ${selector}`);
  return blocks.join('\n');
}

describe('1 · both rails can be scrolled, at any zoom', () => {
  const code = strip(CSS);

  it.each(['.ras-panel-left', '.ras-panel-right'])('%s scrolls instead of clipping', (sel) => {
    const rule = block(code, sel);
    expect(rule).toContain('overflow-y: auto');
    // The old value, which is what made the fold unreachable.
    expect(rule).not.toMatch(/overflow:\s*hidden/);
  });

  it.each(['.ras-panel-left', '.ras-panel-right'])('%s may shrink, or its overflow never engages', (sel) => {
    // A grid item defaults to min-height:auto, refuses to shrink below its
    // content, and its own overflow-y then has nothing to scroll. This one
    // line is the difference between a rule that reads correctly and a rule
    // that works.
    expect(block(code, sel)).toContain('min-height: 0');
  });

  it('the chamber has a composition for a SHORT viewport, not only a narrow one', () => {
    // Every breakpoint the room had was a width. Zoom takes height too.
    expect(code).toMatch(/@media \(max-height: \d+px\)/);
    const heights = [...code.matchAll(/@media \(max-height: (\d+)px\)/g)].map((m) => Number(m[1]));
    expect(heights.length).toBeGreaterThanOrEqual(2);
    // 1152×720 is a 1440×900 screen at 125%. A composition must catch it.
    expect(Math.max(...heights)).toBeGreaterThanOrEqual(720);
  });
});

describe('2 · the act that finishes the work is where the work is done', () => {
  it('المونتاج offers the production act once something is placed', () => {
    expect(PAGE).toContain("workMode === 'montage' && placedLayerCount > 0");
    expect(PAGE).toContain("productionActs('montage')");
  });

  it('and it is the SAME definition as the one in ✦ الإنتاج', () => {
    // Two copies of a control that spends a Creator's Balance would drift on
    // when they may be pressed, and the Creator meets whichever they reach.
    expect(PAGE.match(/const productionActs =/g)).toHaveLength(1);
    expect(PAGE).toContain("productionActs('section')");
    expect(PAGE).toContain("disabled={isFilming || placedLayerCount === 0}");
    // One button element in the source, rendered in two places.
    expect(PAGE.match(/ras-film-btn/g)).toHaveLength(1);
  });

  it('an empty scene is not offered an act it cannot take', () => {
    expect(PAGE).toContain("'ضع أصلاً واحداً على الأقلّ في مشهدك أوّلاً'");
  });
});

describe('3 · nothing that crosses the door disappears in silence', () => {
  it('an incomplete treasure is named, with what it was missing', () => {
    expect(PAGE).toContain('const missing = [');
    for (const part of ['هويّة الأصل', 'ملفّ الأصل', 'نوع الأصل', 'قدرة الأصل']) {
      expect(PAGE).toContain(part);
    }
    expect(PAGE).toContain('فلم يدخل المشهد');
    // …and it says where the Creator's hand should go instead.
    expect(PAGE).toContain('استدعِه من «◆ استدعِ من الخزانة السيادية» في هذه الحجرة');
  });

  it('a successful arrival is announced too', () => {
    // It lands in a rail the Creator may not be looking at; an arrival nobody
    // is told about is indistinguishable from the silent loss.
    expect(PAGE).toContain('وهو الأصل النشط الآن');
  });

  it('an unreadable payload is still an arrival the Creator attempted', () => {
    expect(PAGE).not.toContain('} catch { /* malformed payload — show banner only */ }');
    expect(PAGE).toContain('بصيغةٍ لم نستطع قراءتها');
  });

  it('the arrival line belongs to the room, not to one tab', () => {
    expect(PAGE).toContain('className="ras-arrival-notice"');
    // It used to render beside the direction field — correct for a demand,
    // and invisible for everything else.
    expect(PAGE).not.toContain('<p className="creator-intent-notice">{demandNotice}</p>');
    expect(PAGE.match(/\{demandNotice &&/g)).toHaveLength(1);
  });

  it('and it neither moves the room nor sits on an unpainted ground', () => {
    const rule = block(strip(CSS), '.ras-arrival-notice');
    // Every row of the shell is explicitly assigned; a new grid child with no
    // grid-row opens an implicit fifth row and pushes the chamber upward.
    expect(rule).toContain('position: fixed');
    expect(rule).not.toContain('grid-column');
    // An overlay over a workspace must paint its own ground or the sentence
    // is unreadable against whatever is beneath it.
    expect(rule).toMatch(/background:\s*#[0-9a-f]{6}/i);
  });
});

describe('4 · the room speaks one tongue', () => {
  it('the timeline ruler says ث, not s', () => {
    expect(PAGE).toContain('<span>{tick}ث</span>');
    expect(PAGE).not.toContain('<span>{tick}s</span>');
  });

  it('and no tooltip smuggles the Latin unit back in', () => {
    // A title attribute is read by a Creator exactly as body text is — and
    // this caught one the first sweep missed: the AUDIO track's tooltip still
    // read «${start}s → ${start + dur}s (قص من ${trimStart}s)» after the
    // visual ruler had been corrected.
    expect(strip(PAGE)).not.toMatch(/\$\{[A-Za-z + ]+\}s[^a-z]/);
    // …and the check is meaningful: the interpolations themselves are still here.
    expect(strip(PAGE)).toContain('${start}ث');
  });
});
