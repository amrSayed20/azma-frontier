/**
 * MINISTRY IV — SOVEREIGN MIXING ENGINE: proves the full mixing chain end-to-end.
 *
 * Scope:
 * 1. AudioMixingDirective (extended with fadeInSeconds/fadeOutSeconds) survives
 *    UPDATE_ADVANCED_DIRECTIVE('audio') through AssemblyRuntime into canvas state.
 * 2. SET_TRACK_VOLUME sets AssemblyTrack.trackVolumeDb through the same
 *    AssemblyRuntime path.
 * 3. PrePublishingBoundary.compileMixPlan() produces a real CompiledMixPlan
 *    with correct nodeMixes and trackMixes extracted from canvas state.
 * 4. All three Sovereign Voice Asset types (imported/TTS-generated/cloned)
 *    produce mix state through the same UPDATE_ADVANCED_DIRECTIVE('audio') path.
 * 5. Muted tracks are excluded from nodeMixes, never from trackMixes.
 *
 * Only the persistent-storage DB layer is mocked, matching the established
 * pattern in pre-publishing-boundary.test.ts and sovereign-vault-manager.test.ts.
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
import type {
  AddNodePayload,
  UpdateNodeAdvancedPayload,
  SetTrackVolumePayload,
} from '../assembly-directive-payloads';
import type { AudioMixingDirective } from '../assembly-directive-payloads';
import { toDirectionDecision } from '../direction-workspace-constitution';

const mockGetVaultAsset = getVaultAsset as jest.Mock;

function makeVaultAsset(assetId: string, metadata: VaultAsset['metadata'] = {}): VaultAsset {
  return {
    assetId,
    subscriberTenantId: 'tenant-1',
    originatingOperationId: 'op-1',
    capabilityTarget: CapabilityTarget.AUDIO,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: `/uploads/${assetId}.mp3`,
    metadata,
    createdAt: 1,
    updatedAt: 1,
  };
}

function makeCanvas(): SovereignCanvas {
  return {
    canvasId: 'canvas-mix',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    title: 'Mix Test Canvas',
    tracks: [{ trackId: 'track-1', trackName: 'Audio', isMuted: false, isHidden: false, nodes: [] }],
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('Ministry IV — Sovereign Mixing Engine: state mutations', () => {
  const stateManager = new RasAlAmrStateManager();
  const runtime = new AssemblyRuntime(stateManager);

  it('AudioMixingDirective with fade fields survives UPDATE_ADVANCED_DIRECTIVE(\'audio\') through AssemblyRuntime into canvas state', () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'voice-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const mixDirective: AudioMixingDirective = {
      volumeDb: -6,
      panCenter: 0.2,
      isMuted: false,
      fadeInSeconds: 1.5,
      fadeOutSeconds: 0.75,
    };

    const applyMix: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'audio',
      directivePayload: mixDirective,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applyMix));

    const stored = canvas.tracks[0].nodes[0].customDirectives?.audio as AudioMixingDirective;
    expect(stored.volumeDb).toBe(-6);
    expect(stored.panCenter).toBe(0.2);
    expect(stored.isMuted).toBe(false);
    expect(stored.fadeInSeconds).toBe(1.5);
    expect(stored.fadeOutSeconds).toBe(0.75);
  });

  it('SET_TRACK_VOLUME sets trackVolumeDb on the target track through AssemblyRuntime', () => {
    let canvas = makeCanvas();

    const setVol: SetTrackVolumePayload = {
      actionType: CanvasActionType.SET_TRACK_VOLUME,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      volumeDb: -12,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', setVol));

    expect(canvas.tracks[0].trackVolumeDb).toBe(-12);
  });

  it('SET_TRACK_VOLUME for a non-existent track no-ops safely — canvas unchanged', () => {
    const canvas = makeCanvas();

    const setVol: SetTrackVolumePayload = {
      actionType: CanvasActionType.SET_TRACK_VOLUME,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-does-not-exist',
      volumeDb: -20,
    };
    const result = runtime.execute(canvas, toDirectionDecision('manual-director', setVol));

    expect(result.tracks[0].trackVolumeDb).toBeUndefined();
  });

  it('SET_TRACK_VOLUME can update trackVolumeDb to 0 dB (explicit unity after a prior attenuation)', () => {
    let canvas = makeCanvas();

    const attenuate: SetTrackVolumePayload = {
      actionType: CanvasActionType.SET_TRACK_VOLUME,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      volumeDb: -18,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', attenuate));
    expect(canvas.tracks[0].trackVolumeDb).toBe(-18);

    const restore: SetTrackVolumePayload = {
      actionType: CanvasActionType.SET_TRACK_VOLUME,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      volumeDb: 0,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', restore));
    expect(canvas.tracks[0].trackVolumeDb).toBe(0);
  });
});

describe('Ministry IV — Sovereign Mixing Engine: CompiledMixPlan compilation', () => {
  const stateManager = new RasAlAmrStateManager();
  const runtime = new AssemblyRuntime(stateManager);
  const vaultManager = new SovereignVaultManager();
  const rehydrationBridge = new VaultRehydrationBridge(vaultManager);
  const boundary = new PrePublishingBoundary(rehydrationBridge);

  beforeEach(() => {
    mockGetVaultAsset.mockReset();
    mockGetVaultAsset.mockImplementation((_db: unknown, assetId: string) => makeVaultAsset(assetId));
  });

  it('compileForPublishing produces a mixPlan with correct nodeMix for a node with a full AudioMixingDirective', async () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'narrator-voice',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const directive: AudioMixingDirective = {
      volumeDb: -3,
      panCenter: -0.1,
      isMuted: false,
      fadeInSeconds: 2,
      fadeOutSeconds: 1,
    };
    const applyMix: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetNodeId: nodeId,
      targetTrackId: 'track-1',
      directiveKey: 'audio',
      directivePayload: directive,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applyMix));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');
    const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === nodeId);

    expect(nodeMix).toBeDefined();
    expect(nodeMix?.volumeDb).toBe(-3);
    expect(nodeMix?.panCenter).toBe(-0.1);
    expect(nodeMix?.isMuted).toBe(false);
    expect(nodeMix?.fadeInSeconds).toBe(2);
    expect(nodeMix?.fadeOutSeconds).toBe(1);
    expect(nodeMix?.trackId).toBe('track-1');
  });

  it('compileForPublishing resolves absent AudioMixingDirective to honest zero-defaults — no node is silently excluded', async () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'ambient-bg',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    expect(graph.mixPlan.nodeMixes).toHaveLength(1);
    const nodeMix = graph.mixPlan.nodeMixes[0];
    expect(nodeMix.volumeDb).toBe(0);
    expect(nodeMix.panCenter).toBe(0);
    expect(nodeMix.isMuted).toBe(false);
    expect(nodeMix.fadeInSeconds).toBeUndefined();
    expect(nodeMix.fadeOutSeconds).toBeUndefined();
  });

  it('compileForPublishing includes every track in trackMixes, including the track-level fader from SET_TRACK_VOLUME', async () => {
    let canvas = makeCanvas();

    const addNode: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'music-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));

    const setVol: SetTrackVolumePayload = {
      actionType: CanvasActionType.SET_TRACK_VOLUME,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      volumeDb: -9,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', setVol));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    expect(graph.mixPlan.trackMixes).toHaveLength(1);
    const trackMix = graph.mixPlan.trackMixes[0];
    expect(trackMix.trackId).toBe('track-1');
    expect(trackMix.trackVolumeDb).toBe(-9);
    expect(trackMix.isMuted).toBe(false);
  });

  it('muted track nodes are excluded from nodeMixes; the muted track still appears in trackMixes', async () => {
    let canvas: SovereignCanvas = {
      ...makeCanvas(),
      tracks: [
        { trackId: 'track-active', trackName: 'Active Audio', isMuted: false, isHidden: false, nodes: [] },
        { trackId: 'track-muted', trackName: 'Muted Music', isMuted: true, isHidden: false, nodes: [] },
      ],
    };

    const addToActive: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-active',
      vaultAssetId: 'voice-active',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addToActive));

    const addToMuted: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-muted',
      vaultAssetId: 'music-muted',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addToMuted));

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    // Only the active track's node appears in nodeMixes
    expect(graph.mixPlan.nodeMixes).toHaveLength(1);
    expect(graph.mixPlan.nodeMixes[0].trackId).toBe('track-active');

    // Both tracks appear in trackMixes (export layer must know about the muted fader)
    expect(graph.mixPlan.trackMixes).toHaveLength(2);
    const mutedTrackMix = graph.mixPlan.trackMixes.find((t) => t.trackId === 'track-muted');
    expect(mutedTrackMix?.isMuted).toBe(true);
  });

  it('all three Sovereign Voice Asset types (imported, TTS-generated, cloned) produce nodeMix entries through the same UPDATE_ADVANCED_DIRECTIVE(\'audio\') path', async () => {
    // The vault layer carries the type distinction (metadata.isVoiceAsset / isClonedVoice).
    // From the state manager's and compilation layer's perspective, they are all
    // CapabilityTarget.AUDIO nodes — same path, same mix plan entry, zero differentiation.
    mockGetVaultAsset.mockImplementation((_db: unknown, assetId: string) => {
      const metaMap: Record<string, VaultAsset['metadata']> = {
        'imported-voice': { isVoiceAsset: true, voiceDisplayName: 'Imported Narrator' },
        'tts-voice': { isVoiceAsset: true, voiceDisplayName: 'TTS Nova', providerId: 'openai-tts-1' },
        'cloned-voice': { isVoiceAsset: true, isClonedVoice: true, voiceDisplayName: 'Cloned Commander', clonedVoiceProviderId: 'abc-123' },
      };
      return makeVaultAsset(assetId, metaMap[assetId] ?? {});
    });

    let canvas = makeCanvas();

    for (const assetId of ['imported-voice', 'tts-voice', 'cloned-voice']) {
      const addNode: AddNodePayload = {
        actionType: CanvasActionType.ADD_NODE,
        canvasId: canvas.canvasId,
        subscriberTenantId: canvas.subscriberTenantId,
        targetTrackId: 'track-1',
        vaultAssetId: assetId,
        assetFamily: AssetFamily.MEDIA,
        capabilityOrigin: CapabilityTarget.AUDIO,
      };
      canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNode));
    }

    // Apply a real AudioMixingDirective to each node
    for (const node of canvas.tracks[0].nodes) {
      const directive: AudioMixingDirective = { volumeDb: -6, panCenter: 0, isMuted: false };
      const applyMix: UpdateNodeAdvancedPayload = {
        actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
        canvasId: canvas.canvasId,
        subscriberTenantId: canvas.subscriberTenantId,
        targetNodeId: node.nodeId,
        targetTrackId: 'track-1',
        directiveKey: 'audio',
        directivePayload: directive,
      };
      canvas = runtime.execute(canvas, toDirectionDecision('manual-director', applyMix));
    }

    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    // All three voice types produce exactly one nodeMix each — same path
    expect(graph.mixPlan.nodeMixes).toHaveLength(3);
    for (const nodeMix of graph.mixPlan.nodeMixes) {
      expect(nodeMix.volumeDb).toBe(-6);
      expect(nodeMix.trackId).toBe('track-1');
    }
  });
});
