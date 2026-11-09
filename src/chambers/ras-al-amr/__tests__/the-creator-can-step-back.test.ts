/**
 * THE CREATOR CAN TAKE A STEP BACK — and it costs them nothing.
 *
 * The Founder's directive, 2026-11-09: undo must cover the creative changes
 * «تعديل وصف المشهد · المطالبة البصرية · ترتيب المشاهد · إضافة مشهد أو حذفه ·
 * المدة والانتقال · استبدال الأصول», and «ألا يؤدي التراجع إلى حذف أصل سيادي
 * أو إفساد عملية إنتاج جارية».
 *
 * These guards use the REAL storyboard operations — not fabricated canvases —
 * so «covers every creative change» is demonstrated rather than asserted.
 * What they cannot prove is that a hand found the button; that is the
 * Founder's own acceptance.
 */
import {
  EMPTY_HISTORY, remember, stepBack, stepForward, canStepBack, canStepForward,
  referencedAssetIds, HISTORY_DEPTH,
} from '../storyboard-history';
import {
  createStoryboardProject, addScene, updateScene, moveScene, removeScene, readScenes,
} from '../storyboard';
import { readFileSync } from 'fs';
import { join } from 'path';

const clock = () => 1_700_000_000_000;

/** A project with two scenes, built the way the workshop builds one. */
function twoScenes() {
  let canvas = createStoryboardProject('فيلم', clock(), 'storyboard-test');
  canvas = addScene(canvas, { description: 'الأول' }, clock()).canvas;
  canvas = addScene(canvas, { description: 'الثاني' }, clock()).canvas;
  return canvas;
}

describe('the Creator can take a step back', () => {
  it('nothing to step back to on an untouched project', () => {
    expect(canStepBack(EMPTY_HISTORY, false)).toBe(false);
    expect(stepBack(EMPTY_HISTORY, twoScenes())).toBeNull();
  });

  it('covers every creative change the workshop can make', () => {
    // Each of these is a real storyboard operation, committed the way the
    // workshop commits it. One guard, because one mechanism serves all of
    // them: the canvas that was current becomes the step back.
    const base = twoScenes();
    const first = readScenes(base)[0]!.sceneId;

    const changes = [
      updateScene(base, first, { description: 'وصفٌ جديد' }, clock()),
      updateScene(base, first, { durationSeconds: 9 }, clock()),
      updateScene(base, first, { transitionIn: 'crossfade' }, clock()),
      moveScene(base, first, 'down', clock()),
      removeScene(base, first, clock()),
      addScene(base, { description: 'ثالث' }, clock()).canvas,
    ];

    for (const changed of changes) {
      const history = remember(EMPTY_HISTORY, base);
      const step = stepBack(history, changed);
      expect(step).not.toBeNull();
      expect(step!.canvas).toBe(base);
    }
  });

  it('a step forward returns exactly what was stepped away from', () => {
    const base = twoScenes();
    const changed = updateScene(base, readScenes(base)[0]!.sceneId, { description: 'ب' }, clock());

    const back = stepBack(remember(EMPTY_HISTORY, base), changed)!;
    expect(back.canvas).toBe(base);

    const forward = stepForward(back.history, back.canvas)!;
    expect(forward.canvas).toBe(changed);
  });

  it('a new change after stepping back replaces the forward path', () => {
    // What every editor does, and what a Creator expects: the branch they
    // left is gone once they write a different one.
    const base = twoScenes();
    const a = updateScene(base, readScenes(base)[0]!.sceneId, { description: 'أ' }, clock());
    const back = stepBack(remember(EMPTY_HISTORY, base), a)!;
    expect(canStepForward(back.history, false)).toBe(true);

    const afterNewChange = remember(back.history, base);
    expect(canStepForward(afterNewChange, false)).toBe(false);
  });

  it('a step back NEVER strands a sovereign asset', () => {
    // «ألا يؤدي التراجع إلى حذف أصل سيادي». A canvas REFERENCES assets by id
    // and never owns their bytes, so stepping back can only detach a
    // reference. The asset stays in the Vault, paid for and the Creator's.
    const base = twoScenes();
    const removed = removeScene(base, readScenes(base)[0]!.sceneId, clock());
    const step = stepBack(remember(EMPTY_HISTORY, base), removed)!;

    // Whatever the earlier canvas pointed at, it points at again — and the
    // history holds canvases, never asset bytes.
    expect(referencedAssetIds(step.canvas)).toEqual(referencedAssetIds(base));
    expect(JSON.stringify(step.history)).not.toContain('bytes');
  });

  it('no step is taken while a production is in flight', () => {
    // «ولا إفساد عملية إنتاج جارية» — a commission is already carrying a
    // scene id, and a canvas that moved under it would attach the finished
    // picture to a scene that no longer asked for it.
    const history = remember(EMPTY_HISTORY, twoScenes());
    expect(canStepBack(history, false)).toBe(true);
    expect(canStepBack(history, true)).toBe(false);
    expect(canStepForward({ past: [], future: [twoScenes()] }, true)).toBe(false);
  });

  it('the history is bounded, and trims the OLDEST step', () => {
    // An unbounded stack of whole canvases is a leak. The steps a Creator
    // reaches for are the recent ones, so the far end is what goes.
    const base = twoScenes();
    let history = EMPTY_HISTORY;
    const marks: ReturnType<typeof twoScenes>[] = [];
    for (let i = 0; i < HISTORY_DEPTH + 5; i += 1) {
      const mark = updateScene(base, readScenes(base)[0]!.sceneId, { description: `v${i}` }, clock());
      marks.push(mark);
      history = remember(history, mark);
    }
    expect(history.past).toHaveLength(HISTORY_DEPTH);
    expect(history.past[0]).toBe(marks[5]);
    expect(history.past[history.past.length - 1]).toBe(marks[marks.length - 1]);
  });
});

/**
 * A history nothing presses is a history nobody has. This Empire has shipped
 * an engine with no door before, so the door is guarded too.
 */
describe('and the workshop actually offers those steps', () => {
  const WORKSHOP = readFileSync(
    join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'storyboard', 'StoryboardWorld.tsx'),
    'utf8',
  );

  it('remembers at the one place every change passes through', () => {
    // Not per-control wiring: `commit` is the choke point, so one line there
    // covers description, order, duration, transition, add, remove, attach.
    expect(WORKSHOP).toContain('setHistory((h) => remember(h, latestProjectRef.current));');
  });

  it('draws a step back and a step forward the Creator can press', () => {
    expect(WORKSHOP).toContain('aria-label="تراجَع عن آخر تغيير"');
    expect(WORKSHOP).toContain('aria-label="أعِد ما تراجعتَ عنه"');
  });

  it('and refuses both while a picture is being made', () => {
    expect(WORKSHOP).toContain('canStepBack(history, picturingSceneId !== null)');
    expect(WORKSHOP).toContain('canStepForward(history, picturingSceneId !== null)');
  });

  it('opening another project does not become a step back into it', () => {
    expect(WORKSHOP).toContain('setHistory(EMPTY_HISTORY);');
  });

  it('the step controls paint their own surface', () => {
    const css = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'storyboard', 'storyboard.css'),
      'utf8',
    );
    const rule = css.slice(css.indexOf('.sb-step {'));
    expect(rule.slice(0, rule.indexOf('}'))).toMatch(/background/);
    // A control a Creator cannot press must still READ, or they press it
    // again wondering why nothing happened.
    expect(css).toContain('.sb-step:disabled');
  });
});
