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
