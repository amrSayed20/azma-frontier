/**
 * AZMA OS — Ras Al-Amr: Storyboard World (the chamber's second path)
 *
 * A storyboard project is a real SovereignCanvas of type NARRATIVE — the
 * contract's own home for "Scripts, Storyboards" — saved through the same
 * canvas repository as every montage project. Nothing new is stored outside
 * the existing contract:
 *
 *   - each scene is an AssemblyTrack (a NARRATIVE track is "a Story Sequence"
 *     by its own doc comment); track order is scene order, trackName its title;
 *   - a scene's assets are ordinary AssemblyNodes — pure references to the
 *     Sovereign Vault, so removing a scene or an asset from the project never
 *     touches the Vault;
 *   - each scene's description, duration and incoming transition live in
 *     `globalDirectives.storyboard`, keyed by trackId.
 *
 * The path stays separate from montage: a storyboard never writes the montage
 * session canvas. When its scenes are ready, `storyboardToProductionCanvas`
 * lays them out as a CINEMATIC timeline that the chamber's own MP4 render
 * path consumes unchanged.
 *
 * Pure: no I/O, no DOM.
 */

import { CanvasType, type AssemblyNode, type AssemblyTrack, type SovereignCanvas } from './assembly-contracts';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../vault/sovereign-vault-types';
import { DEFAULT_CROSSFADE_SECONDS } from './cinematic-timing';

export const STORYBOARD_CANVAS_PREFIX = 'storyboard_';
export const DEFAULT_SCENE_SECONDS = 4;
export const MIN_SCENE_SECONDS = 1;
export const MAX_SCENE_SECONDS = 120;

export type SceneTransition = 'cut' | 'crossfade';

export interface StoryboardSceneDirective {
  description: string;
  durationSeconds: number;
  transitionIn: SceneTransition;
}

export interface StoryboardDirective {
  version: 1;
  scenes: Record<string, StoryboardSceneDirective>;
}

export interface StoryboardScene extends StoryboardSceneDirective {
  sceneId: string;
  title: string;
  nodes: readonly AssemblyNode[];
}

/** The facts the storyboard needs from a Vault asset. */
export interface StoryboardAssetRef {
  assetId: string;
  assetFamily: AssetFamily;
  capabilityTarget: CapabilityTarget;
}

export function isStoryboardCanvasId(canvasId: string): boolean {
  return canvasId.startsWith(STORYBOARD_CANVAS_PREFIX);
}

export function isStoryboardCanvas(canvas: Pick<SovereignCanvas, 'canvasId' | 'canvasType'>): boolean {
  return canvas.canvasType === CanvasType.NARRATIVE && isStoryboardCanvasId(canvas.canvasId);
}

function randomId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function clampSceneSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_SCENE_SECONDS;
  return Math.min(MAX_SCENE_SECONDS, Math.max(MIN_SCENE_SECONDS, Math.round(seconds * 10) / 10));
}

function readDirective(canvas: SovereignCanvas): StoryboardDirective {
  const raw = canvas.globalDirectives?.storyboard as Partial<StoryboardDirective> | undefined;
  return { version: 1, scenes: raw?.scenes && typeof raw.scenes === 'object' ? raw.scenes : {} };
}

/** A scene's directive, with honest defaults for scenes saved without one. */
function sceneDirectiveOf(directive: StoryboardDirective, trackId: string): StoryboardSceneDirective {
  const stored = directive.scenes[trackId];
  return {
    description: typeof stored?.description === 'string' ? stored.description : '',
    durationSeconds: clampSceneSeconds(stored?.durationSeconds ?? DEFAULT_SCENE_SECONDS),
    transitionIn: stored?.transitionIn === 'crossfade' ? 'crossfade' : 'cut',
  };
}

function withDirective(canvas: SovereignCanvas, tracks: AssemblyTrack[], scenes: Record<string, StoryboardSceneDirective>, now: number): SovereignCanvas {
  return {
    ...canvas,
    tracks,
    globalDirectives: { ...(canvas.globalDirectives ?? {}), storyboard: { version: 1, scenes } satisfies StoryboardDirective },
    updatedAt: now,
  };
}

export function createStoryboardProject(title: string, now: number, id: string = randomId()): SovereignCanvas {
  return {
    canvasId: `${STORYBOARD_CANVAS_PREFIX}${id}`,
    // Overwritten server-side with the session-verified tenant on every save.
    subscriberTenantId: 'pending-server-verification',
    canvasType: CanvasType.NARRATIVE,
    title: title.trim() || 'استوري بورد جديد',
    tracks: [],
    globalDirectives: { storyboard: { version: 1, scenes: {} } satisfies StoryboardDirective },
    createdAt: now,
    updatedAt: now,
  };
}

/** The project's scenes, in order. */
export function readScenes(canvas: SovereignCanvas): StoryboardScene[] {
  const directive = readDirective(canvas);
  return canvas.tracks.map((track) => ({
    sceneId: track.trackId,
    title: track.trackName,
    nodes: track.nodes,
    ...sceneDirectiveOf(directive, track.trackId),
  }));
}

export function addScene(
  canvas: SovereignCanvas,
  scene: { title?: string; description?: string; durationSeconds?: number; transitionIn?: SceneTransition },
  now: number,
  id: string = randomId(),
): { canvas: SovereignCanvas; sceneId: string } {
  const sceneId = `scene_${id}`;
  const directive = readDirective(canvas);
  const track: AssemblyTrack = {
    trackId: sceneId,
    trackName: scene.title?.trim() || `المشهد ${canvas.tracks.length + 1}`,
    isMuted: false,
    isHidden: false,
    nodes: [],
  };
  const scenes = {
    ...directive.scenes,
    [sceneId]: {
      description: scene.description ?? '',
      durationSeconds: clampSceneSeconds(scene.durationSeconds ?? DEFAULT_SCENE_SECONDS),
      transitionIn: scene.transitionIn ?? (canvas.tracks.length > 0 ? 'crossfade' : 'cut'),
    },
  };
  return { canvas: withDirective(canvas, [...canvas.tracks, track], scenes, now), sceneId };
}

export function updateScene(
  canvas: SovereignCanvas,
  sceneId: string,
  patch: { title?: string; description?: string; durationSeconds?: number; transitionIn?: SceneTransition },
  now: number,
): SovereignCanvas {
  if (!canvas.tracks.some((t) => t.trackId === sceneId)) return canvas;
  const directive = readDirective(canvas);
  const current = sceneDirectiveOf(directive, sceneId);
  const tracks = canvas.tracks.map((t) =>
    t.trackId === sceneId && patch.title !== undefined ? { ...t, trackName: patch.title } : t,
  );
  const next: StoryboardSceneDirective = {
    description: patch.description ?? current.description,
    durationSeconds: patch.durationSeconds !== undefined ? clampSceneSeconds(patch.durationSeconds) : current.durationSeconds,
    transitionIn: patch.transitionIn ?? current.transitionIn,
  };
  return withDirective(canvas, tracks, { ...directive.scenes, [sceneId]: next }, now);
}

export function moveScene(canvas: SovereignCanvas, sceneId: string, direction: 'up' | 'down', now: number): SovereignCanvas {
  const index = canvas.tracks.findIndex((t) => t.trackId === sceneId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= canvas.tracks.length) return canvas;
  const tracks = [...canvas.tracks];
  [tracks[index], tracks[target]] = [tracks[target], tracks[index]];
  return withDirective(canvas, tracks, readDirective(canvas).scenes, now);
}

/** Removes the scene from the project only — its assets stay in the Vault. */
export function removeScene(canvas: SovereignCanvas, sceneId: string, now: number): SovereignCanvas {
  if (!canvas.tracks.some((t) => t.trackId === sceneId)) return canvas;
  const scenes = { ...readDirective(canvas).scenes };
  delete scenes[sceneId];
  return withDirective(canvas, canvas.tracks.filter((t) => t.trackId !== sceneId), scenes, now);
}

export function attachAsset(
  canvas: SovereignCanvas,
  sceneId: string,
  asset: StoryboardAssetRef,
  now: number,
  id: string = randomId(),
): { canvas: SovereignCanvas; nodeId: string } {
  const nodeId = `sbnode_${id}`;
  const node: AssemblyNode = {
    nodeId,
    assetId: asset.assetId,
    assetFamily: asset.assetFamily,
    capabilityOrigin: asset.capabilityTarget,
  };
  const tracks = canvas.tracks.map((t) => (t.trackId === sceneId ? { ...t, nodes: [...t.nodes, node] } : t));
  return { canvas: withDirective(canvas, tracks, readDirective(canvas).scenes, now), nodeId };
}

/** Removes the asset reference from the scene only — never from the Vault. */
export function detachAsset(canvas: SovereignCanvas, sceneId: string, nodeId: string, now: number): SovereignCanvas {
  const tracks = canvas.tracks.map((t) =>
    t.trackId === sceneId ? { ...t, nodes: t.nodes.filter((n) => n.nodeId !== nodeId) } : t,
  );
  return withDirective(canvas, tracks, readDirective(canvas).scenes, now);
}

export function isSoundNode(node: Pick<AssemblyNode, 'capabilityOrigin'>): boolean {
  return node.capabilityOrigin === CapabilityTarget.AUDIO;
}

export function isVisualNode(node: Pick<AssemblyNode, 'capabilityOrigin' | 'assetFamily'>): boolean {
  return node.assetFamily === AssetFamily.MEDIA
    && (node.capabilityOrigin === CapabilityTarget.VISUAL || node.capabilityOrigin === CapabilityTarget.MOTION);
}

export type StoryboardIssueKind = 'no-scenes' | 'scene-without-visual' | 'missing-asset' | 'empty-description';

export interface StoryboardIssue {
  kind: StoryboardIssueKind;
  sceneId?: string;
  nodeId?: string;
  message: string;
}

export interface StoryboardReadiness {
  ready: boolean;
  blocking: StoryboardIssue[];
  warnings: StoryboardIssue[];
  totalDurationSeconds: number;
  sceneCount: number;
}

/**
 * Whether the storyboard can go to MP4 production. `vaultAssetIds` is the set
 * of assets the Creator's Vault still holds; a scene pointing at a removed
 * asset blocks production instead of rendering a hole.
 */
export function assessStoryboardReadiness(canvas: SovereignCanvas, vaultAssetIds: ReadonlySet<string>): StoryboardReadiness {
  const scenes = readScenes(canvas);
  const blocking: StoryboardIssue[] = [];
  const warnings: StoryboardIssue[] = [];
  if (scenes.length === 0) {
    blocking.push({ kind: 'no-scenes', message: 'أضف مشهدًا واحدًا على الأقل.' });
  }
  scenes.forEach((scene, index) => {
    const label = `المشهد ${index + 1}`;
    for (const node of scene.nodes) {
      if (!vaultAssetIds.has(node.assetId)) {
        blocking.push({ kind: 'missing-asset', sceneId: scene.sceneId, nodeId: node.nodeId, message: `${label}: أصل لم يعد في الخزانة السيادية.` });
      }
    }
    if (!scene.nodes.some((n) => isVisualNode(n) && vaultAssetIds.has(n.assetId))) {
      blocking.push({ kind: 'scene-without-visual', sceneId: scene.sceneId, message: `${label}: يحتاج صورة أو مقطع فيديو.` });
    }
    if (scene.description.trim() === '') {
      warnings.push({ kind: 'empty-description', sceneId: scene.sceneId, message: `${label}: بلا وصف.` });
    }
  });
  return {
    ready: blocking.length === 0,
    blocking,
    warnings,
    totalDurationSeconds: scenes.reduce((sum, s) => sum + s.durationSeconds, 0),
    sceneCount: scenes.length,
  };
}

/**
 * Lays the storyboard out as the CINEMATIC timeline the chamber's MP4 path
 * renders: scenes back to back for their own duration, a scene's visuals
 * sharing its time in order, its sound starting with it and cut at its end.
 * A scene's crossfade is applied to its first visual (never to the first
 * scene). The canvasId stays the storyboard's own, so the render is filed
 * under this project and never under the montage session.
 */
export function storyboardToProductionCanvas(canvas: SovereignCanvas): SovereignCanvas {
  const visualNodes: AssemblyNode[] = [];
  const soundNodes: AssemblyNode[] = [];
  let sceneStart = 0;
  readScenes(canvas).forEach((scene, sceneIndex) => {
    const visuals = scene.nodes.filter(isVisualNode);
    if (visuals.length === 0) return;
    const share = scene.durationSeconds / visuals.length;
    visuals.forEach((node, k) => {
      const fades = k === 0 && sceneIndex > 0 && scene.transitionIn === 'crossfade';
      visualNodes.push({
        nodeId: node.nodeId,
        assetId: node.assetId,
        assetFamily: node.assetFamily,
        capabilityOrigin: node.capabilityOrigin,
        temporal: {
          globalStartTimeSeconds: Math.round((sceneStart + k * share) * 1000) / 1000,
          playDurationSeconds: Math.round(share * 1000) / 1000,
          ...(fades
            ? { transitionInType: 'crossfade' as const, transitionInDurationSeconds: Math.min(DEFAULT_CROSSFADE_SECONDS, share / 2) }
            : {}),
        },
        spatial: { zIndex: 0, scaleX: 1, scaleY: 1, positionX: 0, positionY: 0, rotationDegrees: 0 },
      });
    });
    for (const node of scene.nodes.filter(isSoundNode)) {
      soundNodes.push({
        nodeId: node.nodeId,
        assetId: node.assetId,
        assetFamily: node.assetFamily,
        capabilityOrigin: node.capabilityOrigin,
        temporal: { globalStartTimeSeconds: sceneStart, playDurationSeconds: scene.durationSeconds },
      });
    }
    sceneStart += scene.durationSeconds;
  });
  return {
    canvasId: canvas.canvasId,
    subscriberTenantId: canvas.subscriberTenantId,
    canvasType: CanvasType.CINEMATIC,
    title: canvas.title,
    tracks: [{ trackId: 'track-1', trackName: 'المسار الرئيسي', isMuted: false, isHidden: false, nodes: [...visualNodes, ...soundNodes] }],
    createdAt: canvas.createdAt,
    updatedAt: canvas.updatedAt,
  };
}
