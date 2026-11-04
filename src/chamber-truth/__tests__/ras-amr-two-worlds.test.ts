/**
 * AZMA OS — رأس الأمر split into two worlds, 2026-09-28.
 *
 *   «رأس الأمر منقسمة إلى قسمين» — عالَم الستوري بورد, from an idea to scenes,
 *   and المونتاج, from assets to one film. It replaces «المونتاج» و«الإنتاج»,
 *   two names that both ended in an mp4.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PAGE = readFileSync(join(process.cwd(), 'app/ras-amr/page.tsx'), 'utf8');

it('the room has two worlds, and «الإنتاج» is no longer one of them', () => {
  expect(PAGE).toContain("useState<'storyboard' | 'montage'>");
  expect(PAGE).toContain("'✦ عالَم الستوري بورد'");
  expect(PAGE).not.toContain("'✦ الإنتاج'");
});

it('the scenes panel is in the storyboard world, not behind a montage tab', () => {
  // It used to render only under `montage + direction`, where a Creator had
  // to already know to look for it.
  const at = PAGE.indexOf("workMode === 'storyboard'");
  expect(at).toBeGreaterThan(-1);
  expect(PAGE.indexOf('data-testid="rasamr-storyboard"')).toBeGreaterThan(at);
});

it('the Director is one field over one state, rendered in both worlds', () => {
  // Two fields with two states would leave a Creator wondering which of their
  // instructions the Director obeyed.
  expect(PAGE.match(/const directorIntentField =/g)).toHaveLength(1);
  expect(PAGE).toContain("directorIntentField('storyboard')");
  expect(PAGE).toContain("directorIntentField('montage')");
});

it('a template proposes a direction and never erases one', () => {
  expect(PAGE).toContain('directorIntentPreset && !creatorDirectorIntent.trim()');
});

it('the two worlds say what they are, on the surface', () => {
  // The hint existed in a `title` attribute: invisible without a hover, and
  // invisible on a touch screen entirely. A stranger «لا يعرف شيئا عن
  // الامبراطوريه» cannot hover their way to an explanation.
  const at = PAGE.indexOf('className="ras-work-bar"');
  const bar = PAGE.slice(at, PAGE.indexOf('ras-tab-bar', at));
  expect(bar).toContain('className="ras-work-hint"');
  expect(bar).not.toContain('title={hint}');
});

it('and neither of them is cut off in a narrow rail', () => {
  // Renaming «✦ الإنتاج» (8 chars) to «✦ عالَم الستوري بورد» (19) pushed the
  // second button off the edge of a 220px rail: the Founder photographed
  // «✂ ال».
  const css = readFileSync(join(process.cwd(), 'app/ras-amr/ras-amr.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const at = css.indexOf('.ras-work-bar {');
  expect(css.slice(at, css.indexOf('}', at))).toContain('flex-wrap: wrap');
});

/*  ── AN IDEA BECOMES SCENES IN THE WORLD THAT KEEPS THEM ───────────────
 *
 *    RULED BY THE FOUNDER, 2026-11-04, after finding it by hand on the
 *    live release: «هذا القسم خاص بعالم الاستوري بورد ولا ينتمي إلى
 *    المونتاج… وأرى إزالته وليس تغطيته».
 *
 *    He was right at every point, and the code said so itself: the block
 *    sat in the MONTAGE rail, and its button created a storyboard and then
 *    called setWorkMode('storyboard') — it existed only to leave the room
 *    it stood in.
 *
 *    REMOVED, not hidden. Hiding it with a rule scoped to one view leaves
 *    it standing in the phone column, where the montage section can least
 *    afford the height — which is the Founder's own reason for insisting
 *    on removal, and the Empire's own law.
 */
it('the idea-to-scenes block is gone from the montage rail, not hidden in it', () => {
  const page = PAGE;
  const rail = page.slice(page.indexOf('<aside className="ras-panel-left'),
                          page.indexOf('<div className="queue-container'));

  // Not in the rail at all — neither the compose block nor its button.
  expect(rail).not.toContain('brief-compose');
  expect(rail).not.toContain('أنشئ المشاهد');

  // And not hidden there either: a removal that is really a stylesheet is
  // the thing the Founder forbade.
  const css = readFileSync(join(process.cwd(), 'app/ras-amr/ras-amr.css'), 'utf8');
  //   IT MEASURES WHAT IT CLAIMS. The first version of this line lost its
  //   backslashes on the way into the file and read `display:s*none`, which
  //   matches nothing ever written. It passed over a stylesheet that really
  //   did hide the block — and only putting the defect back revealed that the
  //   instrument, not the code, was the thing that was broken.
  const hidden = /\.brief-compose[^{]*\{[^}]*display:\s*none/.test(css);
  expect(hidden).toBe(false);
});

it('and it is rendered by the world that keeps the scenes', () => {
  const page = PAGE;
  const world = readFileSync(join(process.cwd(), 'app/ras-amr/storyboard/StoryboardWorld.tsx'), 'utf8');

  // Declared once in the chamber and handed over — the logic is unchanged,
  // only the room it is met in.
  expect(page).toContain('const ideaToScenes =');
  expect(page).toContain('ideaToScenes={ideaToScenes}');

  // And drawn in the storyboard world, above the hand-made scene.
  expect(world).toContain('{ideaToScenes}');
  expect(world.indexOf('{ideaToScenes}')).toBeLessThan(world.indexOf('＋ مشهد جديد'));
});
