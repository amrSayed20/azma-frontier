/**
 * MINISTRY V — SOVEREIGN SUBTITLE SYSTEM: proves the full subtitle chain
 * end-to-end through the existing constitutional pipeline.
 *
 * Scope:
 * 1. UPDATE_ADVANCED_DIRECTIVE('subtitles') stores a SubtitleDirective in
 *    AssemblyNode.customDirectives.subtitles through AssemblyRuntime.
 * 2. PrePublishingBoundary.compileSubtitlePlan() produces absolute cue
 *    timings by adding the parent node's globalStartTimeSeconds to each
 *    relative cue start/end.
 * 3. Multiple Direction Nodes with subtitles → all cues merged and sorted
 *    by absoluteStartSeconds in the CompiledSubtitlePlan.
 * 4. Nodes without subtitles contribute no entries.
 * 5. Muted/hidden tracks are excluded from absoluteCues.
 * 6. A node with no temporal directive contributes cues anchored at 0.
 * 7. language is forwarded from SubtitleDirective onto CompiledSubtitleCue.
 *
 * Only the persistent-storage DB layer is mocked — matching the established
 * pattern in pre-publishing-boundary.test.ts.
 */
jest.mock('../../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  insertVaultAsset: jest.fn(),
  getVaultAsset: jest.fn(),
  listVaultAssetsForTenant: jest.fn(),
  linkGoalToVaultAsset: jest.fn(),
}));

import { getVaultAsset } from '../../../persistent-storage';
import { SovereignVaultManager } from '../../../vault/sovereign-vault-manager';
import { AssetFamily } from '../../../vault/sovereign-vault-types';
import type { VaultAsset } from '../../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';

import { PrePublishingBoundary } from '../pre-publishing-boundary';
import { VaultRehydrationBridge } from '../vault-rehydration-bridge';
import { AssemblyRuntime } from '../assembly-runtime';
import { RasAlAmrStateManager } from '../ras-al-amr-state-manager';
import { CanvasType } from '../assembly-contracts';
import type { SovereignCanvas } from '../assembly-contracts';
import { CanvasActionType } from '../assembly-directive-payloads';
import type { AddNodePayload, UpdateNodeAdvancedPayload, UpdateNodeTemporalPayload } from '../assembly-directive-payloads';
import type { SubtitleDirective } from '../subtitle-directive';
import { toDirectionDecision } from '../direction-workspace-constitution';

const mockGetVaultAsset = getVaultAsset as jest.Mock;

function makeVaultAsset(assetId: string): VaultAsset {
  return {
    assetId,
    subscriberTenantId: 'tenant-1',
    originatingOperationId: 'op-1',
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: `/uploads/${assetId}.png`,
    metadata: {},
    createdAt: 1,
    updatedAt: 1,
  };
}

function makeCanvas(): SovereignCanvas {
  return {
    canvasId: 'canvas-sub',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    title: 'Subtitle Test Canvas',
    tracks: [{ trackId: 'track-1', trackName: 'Main', isMuted: false, isHidden: false, nodes: [] }],
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('Ministry V — Sovereign Subtitle System: Direction State mutations', () => {
  const stateManager = new RasAlAmrStateManager();
  const runtime = new AssemblyRuntime(stateManager);

  it('UPDATE_ADVANCED_DIRECTIVE(\'subtitles\') stores SubtitleDirective in customDirectives.subtitles through AssemblyRuntime', () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'scene-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const directive: SubtitleDirective = {
      cues: [
        { cueId: 'cue-1', startSeconds: 1, endSeconds: 3, text: 'First line.' },
        { cueId: 'cue-2', startSeconds: 4, endSeconds: 6, text: 'Second line.' },
      ],
      language: 'ar',
    };

    const applySubtitles: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: directive,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applySubtitles));

    const stored = canvas.tracks[0].nodes[0].customDirectives?.subtitles as SubtitleDirective;
    expect(stored.cues).toHaveLength(2);
    expect(stored.cues[0].text).toBe('First line.');
    expect(stored.cues[1].text).toBe('Second line.');
    expect(stored.language).toBe('ar');
  });

  it('SubtitleDirective can be replaced by issuing a new UPDATE_ADVANCED_DIRECTIVE(\'subtitles\') — non-destructive to the Vault Asset', () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'scene-2',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const v1: SubtitleDirective = { cues: [{ cueId: 'c1', startSeconds: 0, endSeconds: 2, text: 'Draft.' }] };
    const applyV1: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: v1,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applyV1));

    const v2: SubtitleDirective = { cues: [{ cueId: 'c2', startSeconds: 0, endSeconds: 2, text: 'Final.' }] };
    const applyV2: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: v2,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applyV2));

    const stored = canvas.tracks[0].nodes[0].customDirectives?.subtitles as SubtitleDirective;
    expect(stored.cues[0].text).toBe('Final.');
  });
});

describe('Ministry V — Sovereign Subtitle System: CompiledSubtitlePlan compilation', () => {
  const stateManager = new RasAlAmrStateManager();
  const runtime = new AssemblyRuntime(stateManager);
  const vaultManager = new SovereignVaultManager();
  const rehydrationBridge = new VaultRehydrationBridge(vaultManager);
  const boundary = new PrePublishingBoundary(rehydrationBridge);

  beforeEach(() => {
    mockGetVaultAsset.mockReset();
    mockGetVaultAsset.mockImplementation((_db: unknown, assetId: string) => makeVaultAsset(assetId));
  });

  it('compileForPublishing produces absoluteCues with timing derived from node globalStartTimeSeconds + cue relative start', async () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'clip-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    // Place node at 10 seconds on the timeline
    const setTemporal: UpdateNodeTemporalPayload = {
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      temporalUpdates: { globalStartTimeSeconds: 10, playDurationSeconds: 20 },
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', setTemporal));

    const directive: SubtitleDirective = {
      cues: [
        { cueId: 'c1', startSeconds: 2, endSeconds: 5, text: 'Scene opening.' },
        { cueId: 'c2', startSeconds: 8, endSeconds: 11, text: 'Scene middle.' },
      ],
    };
    const applySubtitles: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: directive,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applySubtitles));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    expect(graph.subtitlePlan.absoluteCues).toHaveLength(2);
    expect(graph.subtitlePlan.absoluteCues[0].absoluteStartSeconds).toBeCloseTo(12); // 10 + 2
    expect(graph.subtitlePlan.absoluteCues[0].absoluteEndSeconds).toBeCloseTo(15);   // 10 + 5
    expect(graph.subtitlePlan.absoluteCues[0].text).toBe('Scene opening.');
    expect(graph.subtitlePlan.absoluteCues[1].absoluteStartSeconds).toBeCloseTo(18); // 10 + 8
    expect(graph.subtitlePlan.absoluteCues[1].text).toBe('Scene middle.');
    expect(graph.subtitlePlan.absoluteCues[0].nodeId).toBe(nodeId);
    expect(graph.subtitlePlan.absoluteCues[0].trackId).toBe('track-1');
  });

  it('absoluteCues from multiple Direction Nodes are merged and sorted by absoluteStartSeconds', async () => {
    let canvas = makeCanvas();

    // Node A at 5 seconds on the timeline
    const addA: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'clip-a',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addA));
    const nodeAId = canvas.tracks[0].nodes[0].nodeId;

    // Node B at 0 seconds (earlier on the timeline, added after A)
    const addB: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'clip-b',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addB));
    const nodeBId = canvas.tracks[0].nodes[1].nodeId;

    const setTemporalA: UpdateNodeTemporalPayload = {
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeAId,
      targetTrackId: 'track-1',
      temporalUpdates: { globalStartTimeSeconds: 5, playDurationSeconds: 10 },
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', setTemporalA));

    const setTemporalB: UpdateNodeTemporalPayload = {
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeBId,
      targetTrackId: 'track-1',
      temporalUpdates: { globalStartTimeSeconds: 0, playDurationSeconds: 5 },
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', setTemporalB));

    const directiveA: SubtitleDirective = {
      cues: [{ cueId: 'cA', startSeconds: 1, endSeconds: 3, text: 'From A, late.' }],
    };
    const directiveB: SubtitleDirective = {
      cues: [{ cueId: 'cB', startSeconds: 1, endSeconds: 3, text: 'From B, early.' }],
    };

    const applyA: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeAId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: directiveA,
    };
    const applyB: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeBId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: directiveB,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applyA));
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applyB));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    // Two cues total, sorted by absolute start — B (0+1=1) before A (5+1=6)
    expect(graph.subtitlePlan.absoluteCues).toHaveLength(2);
    expect(graph.subtitlePlan.absoluteCues[0].absoluteStartSeconds).toBeCloseTo(1); // B: 0 + 1
    expect(graph.subtitlePlan.absoluteCues[0].text).toBe('From B, early.');
    expect(graph.subtitlePlan.absoluteCues[1].absoluteStartSeconds).toBeCloseTo(6); // A: 5 + 1
    expect(graph.subtitlePlan.absoluteCues[1].text).toBe('From A, late.');
  });

  it('a node with no SubtitleDirective contributes no entries to absoluteCues', async () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'no-subs',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');
    expect(graph.subtitlePlan.absoluteCues).toHaveLength(0);
  });

  it('muted track nodes are excluded from absoluteCues', async () => {
    const canvas: SovereignCanvas = {
      canvasId: 'canvas-sub',
      subscriberTenantId: 'tenant-1',
      canvasType: CanvasType.CINEMATIC,
      title: 'Muted Track Test',
      tracks: [
        {
          trackId: 'track-active',
          trackName: 'Active',
          isMuted: false,
          isHidden: false,
          nodes: [
            {
              nodeId: 'node-active',
              assetId: 'clip-active',
              assetFamily: AssetFamily.MEDIA,
              capabilityOrigin: CapabilityTarget.VISUAL,
              customDirectives: {
                subtitles: {
                  cues: [{ cueId: 'ca', startSeconds: 0, endSeconds: 2, text: 'Active cue.' }],
                } as SubtitleDirective,
              },
            },
          ],
        },
        {
          trackId: 'track-muted',
          trackName: 'Muted',
          isMuted: true,
          isHidden: false,
          nodes: [
            {
              nodeId: 'node-muted',
              assetId: 'clip-muted',
              assetFamily: AssetFamily.MEDIA,
              capabilityOrigin: CapabilityTarget.VISUAL,
              customDirectives: {
                subtitles: {
                  cues: [{ cueId: 'cm', startSeconds: 0, endSeconds: 2, text: 'Muted cue — must not appear.' }],
                } as SubtitleDirective,
              },
            },
          ],
        },
      ],
      createdAt: 0,
      updatedAt: 0,
    };

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    expect(graph.subtitlePlan.absoluteCues).toHaveLength(1);
    expect(graph.subtitlePlan.absoluteCues[0].text).toBe('Active cue.');
  });

  it('a node with no temporal directive contributes cues anchored at absolute 0', async () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'untimed',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const directive: SubtitleDirective = {
      cues: [{ cueId: 'cu', startSeconds: 3, endSeconds: 5, text: 'Untimed node cue.' }],
    };
    const apply: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: directive,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', apply));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    expect(graph.subtitlePlan.absoluteCues).toHaveLength(1);
    expect(graph.subtitlePlan.absoluteCues[0].absoluteStartSeconds).toBeCloseTo(3); // 0 + 3
    expect(graph.subtitlePlan.absoluteCues[0].absoluteEndSeconds).toBeCloseTo(5);
  });

  it('language from SubtitleDirective is forwarded to every CompiledSubtitleCue', async () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'arabic-clip',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const directive: SubtitleDirective = {
      cues: [{ cueId: 'c1', startSeconds: 0, endSeconds: 2, text: 'مرحباً بالعالم' }],
      language: 'ar',
    };
    const apply: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'subtitles',
      directivePayload: directive,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', apply));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    expect(graph.subtitlePlan.absoluteCues[0].language).toBe('ar');
  });
});
