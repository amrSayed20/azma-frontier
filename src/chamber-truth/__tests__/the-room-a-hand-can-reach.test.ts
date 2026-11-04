/**
 * AZMA OS — رأس الأمر, 2026-09-28. One guard per defect the Founder reported.
 *
 *   ١ rails clipped 83–335px with no way to scroll
 *   ٢ the produce act existed only in the other mode
 *   ٣ an arriving treasure vanished in silence
 *   ٤ the ruler spoke Latin seconds
 *   ٥ the workspace content collapsed to 0px, taking the director's field
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const CSS = read('app/ras-amr/ras-amr.css');
const PAGE = read('app/ras-amr/page.tsx');

/** Declarations of every block whose selector list contains this selector. */
/** Comments first: a `{` inside one derails any regex that parses blocks. */
const bare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function rule(selector: string): string {
  const out: string[] = [];
  for (const m of bare(CSS).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[1]!.split(',').some((s) => s.trim() === selector)) out.push(m[2]!);
  }
  if (out.length === 0) throw new Error(`selector not found: ${selector}`);
  return out.join('\n');
}

describe('رأس الأمر', () => {
  // Browser zoom shrinks the viewport; the rails paid for it and could not
  // scroll. `min-height: 0` is what lets a grid item shrink far enough for its
  // own overflow to engage.
  it.each(['.ras-panel-left', '.ras-panel-right'])('%s scrolls and can shrink', (sel) => {
    expect(rule(sel)).toContain('overflow-y: auto');
    expect(rule(sel)).toContain('min-height: 0');
  });

  // The produce act came to rest under a floating help button at 125% and 150%.
  it('a rail ends clear of what floats over it', () => {
    expect(rule('.ras-panel-left')).toContain('padding-block-end');
  });

  // Squeezed to 0px on short screens, taking the director's field with it.
  it('the workspace content has a floor it cannot collapse below', () => {
    expect(Number(/min-height:\s*(\d+)px/.exec(rule('.ras-tab-content'))![1])).toBeGreaterThanOrEqual(120);
  });

  // The assets header took 861px of a 668px rail, leaving the list nothing.
  it('the assets header is capped so the list keeps room', () => {
    expect(rule('.ras-panel-left > .panel-header')).toMatch(/max-height:\s*\d+%/);
    expect(rule('.ras-panel-left > .queue-container')).toMatch(/min-height:\s*\d+px/);
  });

  // Every composition this room had was a WIDTH. Zoom takes height too.
  it('there is a composition for a short viewport', () => {
    expect(CSS).toMatch(/@media \(max-height: \d+px\)/);
  });

  // In ✂ المونتاج the only control carrying production meaning was the name of
  // the other mode. One definition, rendered in both places.
  it('the produce act is where the work is arranged, and defined once', () => {
    expect(PAGE).toContain("workMode === 'montage' && placedLayerCount > 0");
    expect(PAGE.match(/ras-film-btn/g)).toHaveLength(1);
  });

  // A treasure missing any optional field arrived nowhere, and said nothing.
  it('an incomplete arrival is named instead of dropped', () => {
    expect(PAGE).toContain('const missing = [');
    expect(PAGE).toContain('فلم يدخل المشهد');
  });

  // The notice belongs to the room, not to one tab.
  it('the arrival line is rendered once, at chamber level', () => {
    expect(PAGE.match(/\{demandNotice &&/g)).toHaveLength(1);
    expect(PAGE).toContain('className="ras-arrival-notice"');
  });

  // «0s 5s 10s» beside every number, in a room that writes «ث» everywhere else.
  it('seconds are written ث, including in tooltips', () => {
    expect(PAGE).toContain('<span>{tick}ث</span>');
    expect(PAGE).not.toMatch(/\$\{[A-Za-z + ]+\}s[^a-z]/);
  });
});

/**
 * 2026-10-21. «عند فتح حجرة رأس الأمر على الهاتف، تظهر الصورة فقط. لا يستطيع
 * المستخدم تمرير الصفحة أو الوصول إلى بقية الحقول.»
 *
 * Three rules written for the chamber as a FIXED surface stayed in force after
 * the phone turned it into a column that flows to ~2,600px. Measured on a true
 * touch context with real touch events, against a control page that scrolled:
 * 8/44 controls reachable at 320x568 and 11/44 at 390x844, against 44/44 once
 * the three were withdrawn. Each `it` below guards one of them.
 */
/**
 * 2026-10-24. «عند ضغط المستخدم على مشهد جديد… لا تُحذف الأصول من الخزانة
 * السيادية، ولا تُتلف الملفات الأصلية، ولا تُنشأ نسخ سيادية إضافية بلا داعٍ.»
 *
 * Walked by finger at 390×844 with two real assets on the canvas: the scene
 * emptied (2 layers and 2 timeline blocks → 0), the Vault stayed at 30 assets
 * with the same ids — including the two that had been in the scene — the 9
 * files on disk were untouched, and an asset was summoned and placed again.
 * These guard the two facts that make that outcome possible.
 */
describe('«مشهد جديد»', () => {
  // A canvas node holds an asset's ID, never the asset. Nothing is borrowed
  // from the Vault, so nothing has to be returned to it — and the chamber must
  // own no road that could destroy one.
  it('the chamber never asks for an asset to be destroyed', () => {
    expect(PAGE).not.toMatch(/method:\s*['"]DELETE['"]/);
    expect(PAGE).not.toMatch(/\/api\/vault\/assets\/[^'"`]*['"`],\s*\{[^}]*DELETE/);
  });

  // The old production must not come back on the next visit: the working draft
  // is overwritten with an empty canvas, and the production queue is emptied
  // in the same act.
  it('starting a new scene clears the draft and the queue, not the Vault', () => {
    const body = PAGE.slice(PAGE.indexOf('const handleNewScene'), PAGE.indexOf('const handleNewScene') + 3000);
    expect(body).toContain("canvasId: 'canvas_narrative_session'");
    expect(body).toContain('nodes: []');
    expect(body).toContain('setQueue([])');
    expect(body).toContain('setActiveAsset(null)');
    expect(body).not.toContain('DELETE');
  });
});

describe('رأس الأمر على الهاتف', () => {
  /** The declarations a selector carries INSIDE a given media condition. */
  const inMedia = (condition: string, selector: string): string => {
    const text = bare(CSS);
    const out: string[] = [];
    for (const m of text.matchAll(/@media\s*\(([^)]*)\)\s*\{/g)) {
      if (m[1]!.replace(/\s/g, '') !== condition.replace(/\s/g, '')) continue;
      let depth = 1;
      let i = m.index! + m[0].length;
      const start = i;
      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth += 1;
        else if (text[i] === '}') depth -= 1;
        i += 1;
      }
      const body = text.slice(start, i - 1);
      for (const r of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (r[1]!.split(',').some((x) => x.trim() === selector)) out.push(r[2]!);
      }
    }
    if (out.length === 0) throw new Error(`not declared under @media (${condition}): ${selector}`);
    return out.join('\n');
  };

  // The lock kept a second scrollbar from appearing behind a surface pinned to
  // `inset: 0`. In a column there is no such surface, and the lock is the wall.
  it('the document is not locked where the chamber flows', () => {
    expect(rule('body:has(.ras-amr-viewport)')).toContain('overflow: hidden');
    expect(inMedia('max-width: 399px', 'body:has(.ras-amr-viewport)')).toContain('overflow-y: auto');
  });

  // A rail that no longer scrolls must not keep the right to swallow a swipe.
  it('the rails stop being scrollers, and stop containing the gesture', () => {
    expect(inMedia('max-width: 399px', '.ras-panel-left')).toContain('overflow: visible');
    expect(inMedia('max-width: 399px', '.ras-panel-left')).toContain('overscroll-behavior: auto');
  });

  // The 55% cap divided a rail of fixed height. There is no rail to divide.
  it('the rail budget does not reach the phone column', () => {
    const phone = inMedia('max-width: 399px', '.ras-panel-left > .panel-header');
    expect(phone).toContain('max-height: none');
    expect(phone).toContain('overflow: visible');
  });

  /*  ── AND THE SAME CURE REACHES THE DESKTOP THE FOUNDER WORKS ON ──────
   *
   *    FOUND BY HIS HAND on the live release, 2026-11-04: «القائمة مختفية»,
   *    with his cursor photographed resting on TWO scrollbars side by side
   *    in the left rail. Between his two frames the thing that moved was
   *    the capped header — «ما الذي تريد أن» became «✦ أنشئ المشاهد» —
   *    while the asset list beneath it never moved.
   *
   *    The cause was already measured and written in this very file, at
   *    390×844: «a box with no scrolling left to do kept the gesture and
   *    passed nothing on». The cure was written with it — and scoped to
   *    `max-width: 399px`, so it never reached the rail a desktop uses.
   *
   *    These two cases are the cure travelling. They fail the moment it is
   *    scoped back to one breakpoint again.
   */
  it('the capped header passes the wheel on at EVERY width, not only on a phone', () => {
    // Unscoped: the base rule, which is what a desktop at any zoom gets.
    const header = rule('.ras-panel-left > .panel-header');
    expect(header).toContain('overscroll-behavior: auto');
    expect(header).not.toContain('overscroll-behavior: contain');

    // And the rail itself still contains the wheel, which is the boundary
    // that was ever actually needed — a wheel must not reach the page.
    expect(rule('.ras-panel-left')).toContain('overscroll-behavior: contain');
  });

  it('a rail too short to divide becomes ONE scroller, not two', () => {
    // 48% of a 560px viewport is a sliver no compose block fits in: the cap
    // buys the list nothing there and costs a second scrollbar inside a
    // letterbox. Browser zoom is how a desktop arrives — 150% of a 900px
    // window is a 600px viewport, 175% is 514px.
    const short = inMedia('max-height: 560px', '.ras-panel-left > .panel-header');
    expect(short).toContain('max-height: none');
    expect(short).toContain('overflow: visible');
    // And the floor goes with it: the list is no longer competing for height.
    expect(inMedia('max-height: 560px', '.ras-panel-left > .queue-container'))
      .toContain('min-height: 0');
  });
});
