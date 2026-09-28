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
  // CORRECTED twice, both times because the guard read less of the file than
  // the browser does: first it read only the FIRST block for a selector, and
  // the rule asked about lived in the second; then it demanded `selector {`
  // and could not see a rule written as `.a,\n.b {` — which is how the
  // scroll-end gutter is written, since it is the same rule for both rails.
  // A guard that parses CSS more narrowly than a browser reports repairs as
  // missing and invites someone to "fix" a file that was already correct.
  const blocks: string[] = [];
  // `selectorList { declarations }`. A block whose body contains braces — a
  // @media wrapper — simply does not match, and the rules inside it do, which
  // is what a check about a selector wants.
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const inList = m[1]!.split(',').some((s) => s.trim() === selector);
    if (inList) blocks.push(m[2]!);
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

  it('a rail ends clear of what floats over it', () => {
    // MEASURED only once the rails scrolled, which is the only reason it
    // could be measured: «؟ كيف تعمل هذه الحجرة» is fixed at the chamber's
    // bottom with z-index 900, and the produce act newly placed at the rail's
    // end landed underneath it at 125% and 150% — present, visible, and
    // unpressable, which is «لا يوجد زرّ» one layer further in.
    for (const sel of ['.ras-panel-left', '.ras-panel-right']) {
      expect(block(code, sel)).toContain('padding-block-end');
    }
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

describe('1b · a rail’s height is a budget, and the list has a floor', () => {
  const code = strip(CSS);

  it('the assets header may shrink — it used to take everything first', () => {
    // MEASURED: `.panel-header` was 861px inside a 668px rail (129%), because
    // `flex-shrink: 0` is an instruction to take its full height before
    // anything else is served. `.queue-container` is `flex: 1 1 0%` and was
    // therefore served nothing: the Creator's 37 assets began at y≈920 in a
    // 720px window. Even at 1440×900 only 60px of a 148px card showed.
    const rule = block(code, '.ras-panel-left > .panel-header');
    expect(rule).toContain('flex: 0 1 auto');
    expect(rule).toContain('min-height: 0');
    expect(rule).toMatch(/max-height:\s*\d+%/);
    expect(rule).toContain('overflow-y: auto');
  });

  it('and the list is guaranteed a floor it cannot be pushed below', () => {
    const rule = block(code, '.ras-panel-left > .queue-container');
    expect(rule).toMatch(/min-height:\s*\d+px/);
    const floor = Number(/min-height:\s*(\d+)px/.exec(rule)![1]);
    // Roughly one whole asset card (148px measured). Below that the list
    // stops being a list and becomes the sliver in the Founder's photograph.
    expect(floor).toBeGreaterThanOrEqual(150);
  });

  it('the header’s cap tightens as the screen shortens, never loosens', () => {
    const caps = [...code.matchAll(/max-height:\s*(\d+)%/g)].map((m) => Number(m[1]));
    expect(caps.length).toBeGreaterThanOrEqual(3);
    // 55% at any height, 52% under 820px, 48% under 700px.
    expect(Math.min(...caps)).toBeLessThanOrEqual(48);
    expect(Math.max(...caps)).toBeLessThanOrEqual(55);
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

describe('2b · every workspace this room has can be reached', () => {
  it('the five tabs wrap instead of hiding past an invisible edge', () => {
    // MEASURED on the live release, in a 278px rail holding 362px of names:
    // الترجمة and المشروع were cut off at EVERY size, full screen included,
    // and unclickable at 125% and 150%. The bar scrolled horizontally with
    // `scrollbar-width: none`, so nothing on the surface said they existed —
    // two of this room's five workspaces a Creator did not have.
    const rule = block(strip(CSS), '.ras-tab-bar');
    expect(rule).toContain('flex-wrap: wrap');
    expect(rule).not.toContain('overflow-x: auto');
    expect(rule).not.toContain('scrollbar-width: none');
  });

  it('and the page still declares all five', () => {
    for (const tab of ['canvas', 'direction', 'audio', 'subtitles', 'project']) {
      expect(PAGE).toContain(`activeWorkspaceTab === '${tab}'`);
    }
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
