/**
 * MINISTRY I — VOICE ECOSYSTEM: proves the real Voice Library query
 * (filterVoiceLibrary/isVoiceAsset) reuses the Vault's own asset shape
 * with no new storage — a "voice" is exactly a VaultAsset the Creator
 * explicitly marked as one, nothing more.
 */
import { isVoiceAsset, filterVoiceLibrary } from '../sovereign-vault-types';
import { AssetFamily } from '../sovereign-vault-types';
import type { VaultAsset } from '../sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';

function makeAsset(overrides: Partial<VaultAsset> = {}): VaultAsset {
  return {
    assetId: 'asset-1',
    subscriberTenantId: 'tenant-1',
    originatingOperationId: 'op-1',
    capabilityTarget: CapabilityTarget.AUDIO,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: 's3://bucket/asset-1.wav',
    metadata: {},
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('Ministry I — Voice Library', () => {
  it('recognizes a voice only when explicitly marked, never inferred from AssetFamily/CapabilityTarget alone', () => {
    const plainAudio = makeAsset({ assetId: 'plain-audio' });
    const markedVoice = makeAsset({ assetId: 'voice-1', metadata: { isVoiceAsset: true } });

    expect(isVoiceAsset(plainAudio)).toBe(false);
    expect(isVoiceAsset(markedVoice)).toBe(true);
  });

  it('filters the Voice Library down to only explicitly-marked voices, preserving order', () => {
    const assets = [
      makeAsset({ assetId: 'music-1' }),
      makeAsset({ assetId: 'voice-1', metadata: { isVoiceAsset: true, voiceDisplayName: 'Narrator' } }),
      makeAsset({ assetId: 'image-1', capabilityTarget: CapabilityTarget.VISUAL }),
      makeAsset({ assetId: 'voice-2', metadata: { isVoiceAsset: true } }),
    ];

    const library = filterVoiceLibrary(assets);

    expect(library.map((a) => a.assetId)).toEqual(['voice-1', 'voice-2']);
  });

  it('honestly returns an empty library when no asset has ever been marked a voice', () => {
    const assets = [makeAsset({ assetId: 'a' }), makeAsset({ assetId: 'b' })];
    expect(filterVoiceLibrary(assets)).toEqual([]);
  });
});

describe('Ministry III — Voice Cloning: cloned voices in the Voice Library', () => {
  it('a cloned voice (isVoiceAsset + isClonedVoice) appears in the Voice Library — same path as imported or TTS voices', () => {
    const clonedVoice = makeAsset({
      assetId: 'cloned-1',
      metadata: {
        isVoiceAsset: true,
        isClonedVoice: true,
        voiceDisplayName: 'Cloned Narrator',
        clonedVoiceProviderId: 'pNInz6obpgDQGcFmaJgB',
        providerId: 'voice-cloning-provider',
      },
    });

    expect(isVoiceAsset(clonedVoice)).toBe(true);
    expect(filterVoiceLibrary([clonedVoice])).toHaveLength(1);
  });

  it('cloned, imported, and TTS-generated voices all coexist in the same Voice Library without duplication', () => {
    const imported = makeAsset({ assetId: 'imp-1', metadata: { isVoiceAsset: true, voiceDisplayName: 'Imported' } });
    const tts = makeAsset({ assetId: 'tts-1', metadata: { isVoiceAsset: true, voiceDisplayName: 'TTS Nova', providerId: 'openai-tts-1' } });
    const cloned = makeAsset({ assetId: 'clone-1', metadata: { isVoiceAsset: true, isClonedVoice: true, voiceDisplayName: 'Cloned One', clonedVoiceProviderId: 'abc-123' } });
    const nonVoice = makeAsset({ assetId: 'music-1' });

    const library = filterVoiceLibrary([imported, tts, cloned, nonVoice]);

    expect(library.map((a) => a.assetId)).toEqual(['imp-1', 'tts-1', 'clone-1']);
  });

  it('clonedVoiceProviderId is optional on VaultAssetMetadata — absence does not break anything', () => {
    const voiceWithoutProviderId = makeAsset({
      assetId: 'clone-no-id',
      metadata: { isVoiceAsset: true, isClonedVoice: true },
    });
    expect(isVoiceAsset(voiceWithoutProviderId)).toBe(true);
  });
});
