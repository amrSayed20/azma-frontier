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
