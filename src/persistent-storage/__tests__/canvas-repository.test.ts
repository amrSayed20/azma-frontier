/**
 * MINISTRY VI — SOVEREIGN PROJECT RESUME: proves the canvas repository
 * (saveCanvas, loadCanvas, listCanvasesForTenant) correctly durably
 * stores and restores a full SovereignCanvas, including all constitutional
 * sub-state (nodes with customDirectives, mixing, subtitles, voice
 * assignments, temporal/spatial directives, direction roles, emphasis,
 * lock state, track volume). Uses :memory: SQLite — same pattern as
 * every other repository test in this directory.
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { saveCanvas, loadCanvas, listCanvasesForTenant } from '../canvas-repository';
import { CanvasType } from '../../chambers/ras-al-amr/assembly-contracts';
import type { SovereignCanvas, AssemblyNode, AssemblyTrack } from '../../chambers/ras-al-amr/assembly-contracts';
import { AssetFamily } from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import type { AudioMixingDirective } from '../../chambers/ras-al-amr/assembly-directive-payloads';
import type { SubtitleDirective } from '../../chambers/ras-al-amr/subtitle-directive';

function makeNode(nodeId: string): AssemblyNode {
  return {
    nodeId,
    assetId: `asset-${nodeId}`,
    assetFamily: AssetFamily.MEDIA,
    capabilityOrigin: CapabilityTarget.VISUAL,
  };
}

function makeCanvas(overrides: Partial<SovereignCanvas> = {}): SovereignCanvas {
  return {
    canvasId: 'canvas-1',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    title: 'Test Project',
    tracks: [{ trackId: 'track-1', trackName: 'Main', isMuted: false, isHidden: false, nodes: [] }],
    createdAt: 1_000,
    updatedAt: 1_000,
    ...overrides,
  };
}

describe('Ministry VI — Sovereign Project Resume: canvas repository', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('saves and fully restores a SovereignCanvas — canvasId, title, canvasType, tracks, timestamps all preserved', () => {
    const canvas = makeCanvas();
    saveCanvas(db, canvas, 5_000);

    const restored = loadCanvas(db, 'canvas-1', 'tenant-1');
    expect(restored).toEqual(canvas);
  });

  it('restores all constitutional node sub-state: temporal, spatial, directionRole, isActive, directionEmphasis, isLocked, customDirectives', () => {
    const audio: AudioMixingDirective = { volumeDb: -6, panCenter: 0.3, isMuted: false, fadeInSeconds: 1.5 };
    const subtitles: SubtitleDirective = {
      cues: [{ cueId: 'c1', startSeconds: 0, endSeconds: 2, text: 'Hello.' }],
      language: 'ar',
    };
    const node: AssemblyNode = {
      nodeId: 'node-full',
      assetId: 'asset-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
      temporal: { globalStartTimeSeconds: 10, playDurationSeconds: 20 },
      spatial: { zIndex: 1, scaleX: 1, scaleY: 1, positionX: 0, positionY: 0, rotationDegrees: 0 },
      directionRole: 'NARRATION' as AssemblyNode['directionRole'],
      isActive: false,
      directionEmphasis: 'primary',
      isLocked: true,
      customDirectives: { audio, subtitles, voice: { vaultAssetId: 'voice-asset-1' } },
    };

    const canvas = makeCanvas({
      tracks: [{ trackId: 'track-1', trackName: 'Main', isMuted: false, isHidden: false, nodes: [node] }],
    });
    saveCanvas(db, canvas);

    const restored = loadCanvas(db, 'canvas-1', 'tenant-1');
    const restoredNode = restored?.tracks[0].nodes[0];
    expect(restoredNode?.temporal?.globalStartTimeSeconds).toBe(10);
    expect(restoredNode?.directionRole).toBe('NARRATION');
    expect(restoredNode?.isActive).toBe(false);
    expect(restoredNode?.directionEmphasis).toBe('primary');
    expect(restoredNode?.isLocked).toBe(true);
    const restoredAudio = restoredNode?.customDirectives?.audio as AudioMixingDirective;
    expect(restoredAudio.volumeDb).toBe(-6);
    expect(restoredAudio.fadeInSeconds).toBe(1.5);
    const restoredSubs = restoredNode?.customDirectives?.subtitles as SubtitleDirective;
    expect(restoredSubs.cues[0].text).toBe('Hello.');
    expect(restoredSubs.language).toBe('ar');
  });

  it('restores track-level state: isMuted, isHidden, trackVolumeDb', () => {
    const track: AssemblyTrack = {
      trackId: 'track-music',
      trackName: 'Music Layer',
      isMuted: true,
      isHidden: false,
      nodes: [],
      trackVolumeDb: -12,
    };

    const canvas = makeCanvas({ tracks: [track] });
    saveCanvas(db, canvas);

    const restored = loadCanvas(db, 'canvas-1', 'tenant-1');
    expect(restored?.tracks[0].isMuted).toBe(true);
    expect(restored?.tracks[0].trackVolumeDb).toBe(-12);
  });

  it('re-saving a canvas replaces the prior snapshot — upsert on canvasId, not insert+insert', () => {
    const v1 = makeCanvas({ title: 'Draft' });
    saveCanvas(db, v1);

    const v2 = makeCanvas({ title: 'Final', updatedAt: 2_000 });
    saveCanvas(db, v2);

    const restored = loadCanvas(db, 'canvas-1', 'tenant-1');
    expect(restored?.title).toBe('Final');
    expect(restored?.updatedAt).toBe(2_000);
  });

  it('loadCanvas returns null for a canvasId that does not exist', () => {
    expect(loadCanvas(db, 'no-such-canvas', 'tenant-1')).toBeNull();
  });

  it('loadCanvas returns null for a canvas that belongs to a different tenant — never exposes cross-tenant data', () => {
    const canvas = makeCanvas({ subscriberTenantId: 'tenant-owner' });
    saveCanvas(db, canvas);

    // tenant-attacker tries to load tenant-owner's canvas by guessing the id
    expect(loadCanvas(db, 'canvas-1', 'tenant-attacker')).toBeNull();
  });

  it('listCanvasesForTenant returns summaries for the given tenant, most recent first, never another tenant\'s canvases', () => {
    saveCanvas(db, makeCanvas({ canvasId: 'c1', title: 'First', subscriberTenantId: 'tenant-1' }), 1_000);
    saveCanvas(db, makeCanvas({ canvasId: 'c2', title: 'Second', subscriberTenantId: 'tenant-1' }), 3_000);
    saveCanvas(db, makeCanvas({ canvasId: 'c3', title: 'Other', subscriberTenantId: 'tenant-2' }), 2_000);

    const summaries = listCanvasesForTenant(db, 'tenant-1');

    expect(summaries.map((s) => s.canvasId)).toEqual(['c2', 'c1']);
    expect(summaries.every((s) => s.subscriberTenantId === 'tenant-1')).toBe(true);
  });

  it('listCanvasesForTenant returns empty for a tenant with no saved canvases', () => {
    expect(listCanvasesForTenant(db, 'nobody')).toEqual([]);
  });

  it('listCanvasesForTenant returns summaries without exposing full canvas JSON', () => {
    const canvas = makeCanvas({
      tracks: [
        {
          trackId: 't1',
          trackName: 'Main',
          isMuted: false,
          isHidden: false,
          nodes: [makeNode('node-1'), makeNode('node-2')],
        },
      ],
    });
    saveCanvas(db, canvas, 9_000);

    const summaries = listCanvasesForTenant(db, 'tenant-1');
    expect(summaries).toHaveLength(1);
    expect(summaries[0].canvasId).toBe('canvas-1');
    expect(summaries[0].title).toBe('Test Project');
    expect(summaries[0].canvasType).toBe(CanvasType.CINEMATIC);
    expect(summaries[0].savedAt).toBe(9_000);
    // No 'tracks' or 'canvas_json' on the summary
    expect('tracks' in summaries[0]).toBe(false);
  });

  it('multiple canvases for the same tenant are independently stored and loadable', () => {
    saveCanvas(db, makeCanvas({ canvasId: 'narrative-proj', canvasType: CanvasType.NARRATIVE, title: 'Script' }));
    saveCanvas(db, makeCanvas({ canvasId: 'cinematic-proj', canvasType: CanvasType.CINEMATIC, title: 'Film' }));

    const narrative = loadCanvas(db, 'narrative-proj', 'tenant-1');
    const cinematic = loadCanvas(db, 'cinematic-proj', 'tenant-1');

    expect(narrative?.canvasType).toBe(CanvasType.NARRATIVE);
    expect(cinematic?.canvasType).toBe(CanvasType.CINEMATIC);
    expect(narrative?.title).toBe('Script');
    expect(cinematic?.title).toBe('Film');
  });
});
