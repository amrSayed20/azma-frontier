/**
 * A CARD DOES NOT PROMISE A BOARD THAT IS NOT THERE.
 *
 * ─── WHAT THE FOUNDER SAW, 2026-11-10 ───────────────────────────────────────
 *
 *   The «✦ عالَم الستوري بورد» card inside the montage room read:
 *
 *       «اكتب فكرتك في لوح «اكتب فكرتك» إلى يمينك — ثم قرّر مصدر صورة كلّ مشهد.»
 *
 *   The block it pointed at had been removed. MEASURED: `ideaToScenes` — the
 *   «اكتب فكرتك» board — is rendered in exactly ONE place in the whole
 *   chamber, inside StoryboardWorld. It is not on that screen at all.
 *
 *   «اما ان ينقلنا هذا الزر الى عالم الاستورى بورد بالفعل او يجب الا تكون
 *    موجوده فهي تعتبر كاذبه» — so the card was made true rather than removed:
 *   removing it would have stranded the scenes that arrive from the Chamber
 *   of Evidence, which that panel is the only reader of.
 *
 * ─── THE CLASS OF DEFECT ────────────────────────────────────────────────────
 *
 *   Nothing failed. No test went red, no type broke, no build complained —
 *   a sentence simply outlived the layout it was written for. Only an eye on
 *   the live page found it, which is why the guard reads the TEXT.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const RAW = readFileSync(
  join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'page.tsx'), 'utf8');

/**
 * What a Creator can actually SEE. The first version of this guard read the
 * whole file and failed on its own explanatory comment, which quotes the
 * false sentence — a guard that cannot tell a quotation from a promise would
 * have forced the repair to go undocumented to stay green.
 */
const CHAMBER = RAW.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('a card does not promise a board that is not there', () => {
  it('no surface still sends a Creator to a block on the right', () => {
    expect(CHAMBER).not.toContain('إلى يمينك');
  });

  it('and the storyboard card carries a real door to the workshop', () => {
    // «اما ان ينقلنا هذا الزر … بالفعل». A card that names a world must be
    // able to reach it, or it should not be there.
    const panel = CHAMBER.slice(CHAMBER.indexOf("{workMode === 'storyboard' && ("));
    const header = panel.slice(0, panel.indexOf('</header>'));
    expect(header).toContain("setCreationPhase('storyboard')");
  });

  it('the board it names is still rendered in exactly one place', () => {
    // The measurement the repair rests on. If a second copy ever appears,
    // «where the board is» stops being a single answer and this guard's
    // reasoning no longer holds.
    const rendered = CHAMBER.match(/ideaToScenes=\{ideaToScenes\}/g) ?? [];
    expect(rendered).toHaveLength(1);
  });

  it('and that door paints its own surface', () => {
    const css = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'ras-amr.css'), 'utf8');
    // MEASURED, and it caught a defect in this very repair: the shared
    // `.creator-action-btn` carries geometry ONLY — no background, no colour.
    // The gold surface lives in `.creator-action-primary`, and the first
    // draft of the door wore the geometry alone. A control given geometry
    // and nothing else inherits the browser's white.
    const panel = CHAMBER.slice(CHAMBER.indexOf("{workMode === 'storyboard' && ("));
    const header = panel.slice(0, panel.indexOf('</header>'));
    expect(header).toContain('creator-action-primary');
    const rule = css.slice(css.indexOf('.creator-action-primary'));
    expect(rule.slice(0, rule.indexOf('}'))).toMatch(/background/);
  });
});
