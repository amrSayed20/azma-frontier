import { CanvasType } from '../assembly-contracts';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../../vault/sovereign-vault-types';
import {
  addScene,
  assessStoryboardReadiness,
  attachAsset,
  createStoryboardProject,
  detachAsset,
  isStoryboardCanvas,
  moveScene,
  readScenes,
  removeScene,
  storyboardToProductionCanvas,
  updateScene,
  MAX_SCENE_SECONDS,
} from '../storyboard';

const image = (assetId: string) => ({ assetId, assetFamily: AssetFamily.MEDIA, capabilityTarget: CapabilityTarget.VISUAL });
const video = (assetId: string) => ({ assetId, assetFamily: AssetFamily.MEDIA, capabilityTarget: CapabilityTarget.MOTION });
const sound = (assetId: string) => ({ assetId, assetFamily: AssetFamily.MEDIA, capabilityTarget: CapabilityTarget.AUDIO });

function threeScenes() {
  let canvas = createStoryboardProject('إطلاق', 1, 'p1');
  const a = addScene(canvas, { title: 'الافتتاح', description: 'شروق' }, 2, 'a');
  const b = addScene(a.canvas, { title: 'الذروة', description: 'المنتج', durationSeconds: 6 }, 3, 'b');
  const c = addScene(b.canvas, { title: 'الختام', description: '' }, 4, 'c');
  canvas = c.canvas;
  return { canvas, ids: [a.sceneId, b.sceneId, c.sceneId] };
}

describe('storyboard project — a real NARRATIVE canvas', () => {
  it('creates a storyboard canvas that is never mistaken for montage', () => {
    const project = createStoryboardProject('  ', 10, 'x1');
    expect(project.canvasId).toBe('storyboard_x1');
    expect(project.canvasType).toBe(CanvasType.NARRATIVE);
    expect(project.title).toBe('استوري بورد جديد');
    expect(isStoryboardCanvas(project)).toBe(true);
    expect(isStoryboardCanvas({ canvasId: 'canvas_narrative_session', canvasType: CanvasType.CINEMATIC })).toBe(false);
  });

  it('adds, edits, reorders and removes scenes, keeping descriptions with their scene', () => {
    const { canvas, ids } = threeScenes();
    expect(readScenes(canvas).map((s) => s.title)).toEqual(['الافتتاح', 'الذروة', 'الختام']);
    expect(readScenes(canvas)[0].transitionIn).toBe('cut');
    expect(readScenes(canvas)[1].transitionIn).toBe('crossfade');

    const edited = updateScene(canvas, ids[2], { description: 'الشعار يظهر', durationSeconds: 999 }, 5);
    expect(readScenes(edited)[2]).toMatchObject({ description: 'الشعار يظهر', durationSeconds: MAX_SCENE_SECONDS });

    const moved = moveScene(edited, ids[2], 'up', 6);
    expect(readScenes(moved).map((s) => s.sceneId)).toEqual([ids[0], ids[2], ids[1]]);
    expect(readScenes(moved)[1].description).toBe('الشعار يظهر');
    expect(moveScene(moved, ids[0], 'up', 7)).toBe(moved);

    const removed = removeScene(moved, ids[2], 8);
    expect(readScenes(removed).map((s) => s.sceneId)).toEqual([ids[0], ids[1]]);
    expect((removed.globalDirectives?.storyboard as { scenes: Record<string, unknown> }).scenes[ids[2]]).toBeUndefined();
    expect(removed.updatedAt).toBe(8);
  });

  it('restores scenes saved without a directive with honest defaults', () => {
    const { canvas } = threeScenes();
    const legacy = { ...canvas, globalDirectives: undefined };
    expect(readScenes(legacy).map((s) => [s.description, s.durationSeconds, s.transitionIn])).toEqual([
      ['', 4, 'cut'], ['', 4, 'cut'], ['', 4, 'cut'],
    ]);
  });

  it('attaching and detaching only edits references — the asset itself is untouched', () => {
    const { canvas, ids } = threeScenes();
    const withImage = attachAsset(canvas, ids[0], image('img-1'), 5, 'n1');
    const withTwo = attachAsset(withImage.canvas, ids[0], video('vid-1'), 6, 'n2');
    expect(readScenes(withTwo.canvas)[0].nodes.map((n) => n.assetId)).toEqual(['img-1', 'vid-1']);
    const detached = detachAsset(withTwo.canvas, ids[0], withImage.nodeId, 7);
    expect(readScenes(detached)[0].nodes.map((n) => n.assetId)).toEqual(['vid-1']);
  });
});

describe('storyboard readiness', () => {
  it('blocks production until every scene has a visual still held by the Vault', () => {
    const { canvas, ids } = threeScenes();
    const empty = assessStoryboardReadiness(createStoryboardProject('x', 1, 'e'), new Set());
    expect(empty.blocking.map((i) => i.kind)).toEqual(['no-scenes']);

    let project = attachAsset(canvas, ids[0], image('img-1'), 5, 'n1').canvas;
    project = attachAsset(project, ids[1], sound('voice-1'), 5, 'n2').canvas;
    project = attachAsset(project, ids[2], image('gone'), 5, 'n3').canvas;
    const r = assessStoryboardReadiness(project, new Set(['img-1', 'voice-1']));
    expect(r.ready).toBe(false);
    expect(r.blocking.map((i) => `${i.kind}:${i.sceneId}`)).toEqual([
      `scene-without-visual:${ids[1]}`,
      `missing-asset:${ids[2]}`,
      `scene-without-visual:${ids[2]}`,
    ]);
    expect(r.warnings.map((i) => i.kind)).toEqual(['empty-description']);
    expect(r.totalDurationSeconds).toBe(14);
  });
});

describe('storyboard → production canvas for the MP4 path', () => {
  it('plays scenes back to back, shares a scene between its visuals, and never sequences sound as a scene', () => {
    const { canvas, ids } = threeScenes();
    let project = attachAsset(canvas, ids[0], image('img-1'), 5, 'a1').canvas;
    project = attachAsset(project, ids[0], sound('music'), 5, 'a2').canvas;
    project = attachAsset(project, ids[1], image('img-2'), 5, 'b1').canvas;
    project = attachAsset(project, ids[1], video('clip'), 5, 'b2').canvas;
    project = attachAsset(project, ids[2], image('img-3'), 5, 'c1').canvas;

    const production = storyboardToProductionCanvas(project);
    expect(production.canvasType).toBe(CanvasType.CINEMATIC);
    expect(production.canvasId).toBe(project.canvasId);
    const timing = production.tracks[0].nodes.map((n) => [n.assetId, n.temporal?.globalStartTimeSeconds, n.temporal?.playDurationSeconds, n.temporal?.transitionInType ?? 'cut']);
    expect(timing).toEqual([
      ['img-1', 0, 4, 'cut'],
      ['img-2', 4, 3, 'crossfade'],
      ['clip', 7, 3, 'cut'],
      ['img-3', 10, 4, 'crossfade'],
      ['music', 0, 4, 'cut'],
    ]);
  });

  it('honours a scene switched to a cut', () => {
    const { canvas, ids } = threeScenes();
    let project = attachAsset(canvas, ids[0], image('img-1'), 5, 'a1').canvas;
    project = attachAsset(project, ids[1], image('img-2'), 5, 'b1').canvas;
    project = updateScene(project, ids[1], { transitionIn: 'cut' }, 6);
    expect(storyboardToProductionCanvas(project).tracks[0].nodes[1].temporal?.transitionInType).toBeUndefined();
  });
});
