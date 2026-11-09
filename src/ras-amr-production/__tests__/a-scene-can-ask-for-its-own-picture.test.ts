/**
 * A SCENE CAN ASK FOR ITS OWN PICTURE — in the world where the hand is.
 *
 * ─── THE DEFECT THAT WAS CAUGHT BEFORE A BUTTON WAS EVER DRAWN ──────────────
 *
 *   Ras Al Amr holds TWO storyboard worlds, and they are not the same one:
 *
 *     · `storyboards` / `storyboard_scenes` — DB rows the Chamber of Evidence
 *       writes, produced all at once by storyboard/[id]/produce
 *     · the CANVAS — what the Creator's own workshop opens, edits and saves,
 *       whose scenes are tracks with canvas scene ids
 *
 *   The first version of the per-scene road was built on the DB world. It
 *   type-checked, it was correct, and `StoryboardWorld.tsx` contains the
 *   string «storyboardId» exactly ZERO times — it would have been a door
 *   onto a wall. The guard below holds the world, not the logic, because the
 *   logic was never what was wrong.
 *
 * ─── AND WHAT THESE GUARDS DO NOT CLAIM ─────────────────────────────────────
 *
 *   Not that a picture was produced. These read source: which road exists,
 *   which world it is built on, whether the price reaches the button, and
 *   whether the key is spent once. The engines are proven on the live host,
 *   not here — and no test in this repository can prove a Creator understood
 *   the button, which is the Founder's own acceptance, not mine.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const ROAD = 'app/api/ras-amr/canvas/[canvasId]/scene/[sceneId]/picture/route.ts';
const WORKSHOP = 'app/ras-amr/storyboard/StoryboardWorld.tsx';

describe('a scene can ask for its own picture', () => {
  it('the road exists in the CANVAS world, the one the workshop opens', () => {
    expect(existsSync(join(ROOT, ROAD))).toBe(true);
    const road = read(ROAD);
    expect(road).toContain('loadCanvas');
    expect(road).toContain('readScenes');
    // And not the other world's readers, which no workshop hand reaches.
    expect(road).not.toContain('listScenes(');
  });

  it('and the workshop presses THAT road, with the canvas it has open', () => {
    const workshop = read(WORKSHOP);
    expect(workshop).toContain('/scene/${encodeURIComponent(sceneId)}/picture');
    expect(workshop).toContain('base.canvasId');
  });

  it('it commissions ONE scene — never the film', () => {
    // The Founder's fourth acceptance scenario: dislike one frame, replace
    // it, and leave every other scene exactly as it was.
    const road = read(ROAD);
    expect(road).toContain('demands: [{');
    expect(road).not.toContain('adapter.produce');
  });

  it('the price is on the button, before the press', () => {
    const workshop = read(WORKSHOP);
    expect(workshop).toContain('SCENE_PICTURE_UNITS_1K');
    expect(workshop).toMatch(/اصنع صورة هذا المشهد — \$\{SCENE_PICTURE_UNITS_1K/);
  });

  it('and the Empire’s cost never travels to the browser to show it', () => {
    // The price authority reaches the cost truth — provider credits and real
    // money. A client bundle that imported it to label a button would ship
    // that to every browser. The leaf the workshop imports has NO imports.
    const leaf = read('src/economy/pricing/creator-facing-prices.ts');
    expect(leaf).not.toMatch(/^import /m);
    const workshop = read(WORKSHOP);
    expect(workshop).not.toContain('sovereign-price-authority');
    expect(workshop).not.toContain('qiyamah-cost-truth');
  });

  it('the leaf’s figure is the authority’s own, not a number that drifted', () => {
    const { SCENE_PICTURE_UNITS_1K } = require('../../economy/pricing/creator-facing-prices');
    const { sovereignPriceFor, SCENE_CAPABILITY } = require('../../economy/pricing/sovereign-price-authority');
    const { resolutionForStyle } = require('../../sovereign-model-selection/intent-builder');
    expect(SCENE_PICTURE_UNITS_1K)
      .toBe(sovereignPriceFor(SCENE_CAPABILITY, resolutionForStyle(null)).unitsPerQuantity);
  });

  it('a press spends its key once, on its own road', () => {
    // Sharing the export's road would make a second press on a different act
    // read as a repeat of the first — answered, and never run.
    const workshop = read(WORKSHOP);
    expect(workshop).toContain("paidOperationHeaders('ras-amr:scene-picture')");
    expect(workshop).toContain("operationConcluded('ras-amr:scene-picture'");
  });

  it('every new control paints its own surface', () => {
    // Geometry without a background and a colour is the browser's white —
    // invisible to tsc, to every test but this one, and to a token sweep.
    const css = read('app/ras-amr/storyboard/storyboard.css');
    for (const cls of ['sb-btn-make', 'sb-scene-hint', 'sb-scene-error']) {
      const rule = css.slice(css.indexOf(`.${cls} {`));
      expect(rule.slice(0, rule.indexOf('}'))).toMatch(/background|color/);
    }
  });
});
