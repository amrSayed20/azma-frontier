/**
 * A TEMPLATE BECOMES SCENES IN THE PROJECT YOU HAVE OPEN.
 *
 * «المشكلة الحالية أن اعتماد القالب ينقل المبدع إلى شاشة المونتاج. ألغِ هذا
 *  الانقطاع» — the Founder, 2026-11-09.
 *
 * MEASURED before building: confirming a template called `handleSelectIntent`,
 * which moved the chamber to its montage workspace. A Creator building a
 * storyboard pressed «use this one» and arrived somewhere else, their scene
 * list behind them.
 *
 * These guards hold what adoption writes, what it refuses to destroy, and —
 * the point of the whole design — that one step back undoes it exactly,
 * because it travels through the same `commit` every other change does.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { adoptTemplateIntoProject, adoptionSceneCount, adoptionCuedCount } from '../template-adoption';
import type { AdoptableTemplate } from '../template-adoption';
import { createStoryboardProject, readScenes, addScene } from '../storyboard';
import { EMPTY_HISTORY, remember, stepBack, stepForward } from '../storyboard-history';

const clock = () => 1_700_000_000_000;

const TEMPLATE: AdoptableTemplate = {
  id: 'tpl-1',
  name: 'المشهد السينمائي',
  slotDurations: [4, 6, 5],
  slotRoles: ['الافتتاح', 'الذروة', 'الختام'],
  slotCues: ['لقطة واسعة للمكان', '', 'العلامة تظهر'],
  transitionPreference: 'crossfade',
};

describe('a template becomes scenes in the project you have open', () => {
  it('writes one scene per position, with the template’s own timing', () => {
    const adopted = adoptTemplateIntoProject(
      createStoryboardProject('فيلم', clock(), 'storyboard-t'), TEMPLATE, clock());
    const scenes = readScenes(adopted.canvas);

    expect(scenes).toHaveLength(3);
    expect(scenes.map((s) => s.durationSeconds)).toEqual([4, 6, 5]);
    expect(scenes.map((s) => s.title)).toEqual(['الافتتاح', 'الذروة', 'الختام']);
    expect(adopted.sceneIds).toHaveLength(3);
  });

  it('a film does not fade in from nothing', () => {
    // The first scene of an empty project cuts; every later one takes the
    // template's own join, which is the reason a template has one.
    const scenes = readScenes(adoptTemplateIntoProject(
      createStoryboardProject('فيلم', clock(), 'storyboard-t'), TEMPLATE, clock()).canvas);
    expect(scenes[0]!.transitionIn).toBe('cut');
    expect(scenes.slice(1).map((s) => s.transitionIn)).toEqual(['crossfade', 'crossfade']);
  });

  it('a position with no cue is left EMPTY, never filled with its own label', () => {
    // The workshop refuses to make a picture for a scene with no words, and
    // a label standing in for the Creator's intent would defeat that refusal
    // by handing the provider a role name as if it were a demand.
    const scenes = readScenes(adoptTemplateIntoProject(
      createStoryboardProject('فيلم', clock(), 'storyboard-t'), TEMPLATE, clock()).canvas);
    expect(scenes.map((s) => s.description)).toEqual(['لقطة واسعة للمكان', '', 'العلامة تظهر']);
    expect(adoptionCuedCount(TEMPLATE)).toBe(2);
    expect(adoptionSceneCount(TEMPLATE)).toBe(3);
  });

  it('it NEVER destroys work the Creator already has', () => {
    // An adoption that cleared the canvas would lose a film in one press.
    let base = createStoryboardProject('فيلم', clock(), 'storyboard-t');
    base = addScene(base, { description: 'مشهدي أنا' }, clock()).canvas;

    const adopted = adoptTemplateIntoProject(base, TEMPLATE, clock());
    const scenes = readScenes(adopted.canvas);
    expect(scenes).toHaveLength(4);
    expect(scenes[0]!.description).toBe('مشهدي أنا');
  });

  it('and ONE step back removes exactly what it added', () => {
    // Adoption returns a canvas like every other storyboard operation, so it
    // travels through the workshop's single `commit` — undo and redo cover it
    // with no line written for them.
    let base = createStoryboardProject('فيلم', clock(), 'storyboard-t');
    base = addScene(base, { description: 'مشهدي أنا' }, clock()).canvas;

    const adopted = adoptTemplateIntoProject(base, TEMPLATE, clock()).canvas;
    const back = stepBack(remember(EMPTY_HISTORY, base), adopted)!;
    expect(readScenes(back.canvas)).toHaveLength(1);
    expect(readScenes(back.canvas)[0]!.description).toBe('مشهدي أنا');

    // And adopting it again is a step forward, with nothing lost.
    const forward = stepForward(back.history, back.canvas)!;
    expect(readScenes(forward.canvas)).toHaveLength(4);
  });

  it('the shelf lives in the scene list, and adoption never leaves the workshop', () => {
    const root = join(__dirname, '..', '..', '..', '..');
    const workshop = readFileSync(join(root, 'app', 'ras-amr', 'storyboard', 'StoryboardWorld.tsx'), 'utf8');
    expect(workshop).toContain('<TemplateShelf');
    expect(workshop).toContain('commit(adoptTemplateIntoProject(base, template, clock()).canvas);');
    // The break being closed: adoption must not call the chamber's intent
    // road, which is what moved the Creator to the montage workspace.
    expect(workshop).not.toContain('handleSelectIntent');
  });

  it('adoption is refused while a picture is being made', () => {
    const workshop = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'storyboard', 'StoryboardWorld.tsx'), 'utf8');
    const handler = workshop.slice(workshop.indexOf('const handleAdoptTemplate'));
    expect(handler.slice(0, handler.indexOf('};'))).toContain('picturingSceneId');
  });

  it('every shelf control paints its own surface', () => {
    const css = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'storyboard', 'storyboard.css'), 'utf8');
    for (const cls of ['sb-shelf', 'sb-shelf-item', 'sb-shelf-frame', 'sb-shelf-media']) {
      const rule = css.slice(css.indexOf(`.${cls} {`));
      expect(rule.slice(0, rule.indexOf('}'))).toMatch(/background/);
    }
  });

  it('a clip is played and an empty position says so', () => {
    const shelf = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'storyboard', 'TemplateShelf.tsx'), 'utf8');
    // A frozen frame of a clip is a lie about what it is.
    expect(shelf).toContain('CapabilityTarget.MOTION');
    expect(shelf).toContain('<video');
    expect(shelf).toContain('موضعٌ فارغ');
  });
});
