/**
 * Phase 3B Package I — N-1/N-2/N-3 Tests
 * Vault Palace presentation mapping: media preview and download target.
 */

import { mapVaultAssetToTreasure, detectMediaType, capabilityTargetToVaultId } from '../vault-palace-presentation';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../sovereign-vault-types';
import type { VaultAsset } from '../sovereign-vault-types';

function makeAsset(overrides: Partial<VaultAsset> = {}): VaultAsset {
  return {
    assetId:                 'asset-1',
    subscriberTenantId:      'creator-1',
    originatingOperationId:  'op-1',
    capabilityTarget:        CapabilityTarget.VISUAL,
    assetFamily:             AssetFamily.MEDIA,
    secureStorageUri:        '/generated-assets/abc.png',
    metadata:                { providerId: 'openai-gpt-image-1', generationPrompt: 'test prompt' },
    createdAt:               1000,
    updatedAt:               1000,
    ...overrides,
  };
}

// ── detectMediaType ────────────────────────────────────────────────────────

describe('detectMediaType', () => {
  it('image asset preview mapping: VISUAL → image', () => {
    expect(detectMediaType(CapabilityTarget.VISUAL)).toBe('image');
  });

  it('video asset preview mapping: MOTION → video', () => {
    expect(detectMediaType(CapabilityTarget.MOTION)).toBe('video');
  });

  it('audio asset preview mapping: AUDIO → audio', () => {
    expect(detectMediaType(CapabilityTarget.AUDIO)).toBe('audio');
  });

  it('returns undefined for WRITING (non-media, no playback element)', () => {
    expect(detectMediaType(CapabilityTarget.WRITING)).toBeUndefined();
  });

  it('returns undefined for DIRECTORIAL', () => {
    expect(detectMediaType(CapabilityTarget.DIRECTORIAL)).toBeUndefined();
  });
});

// ── capabilityTargetToVaultId ──────────────────────────────────────────────

describe('capabilityTargetToVaultId', () => {
  it('VISUAL maps to audiovisual vault', () => {
    expect(capabilityTargetToVaultId(CapabilityTarget.VISUAL)).toBe('audiovisual');
  });
  it('MOTION maps to audiovisual vault', () => {
    expect(capabilityTargetToVaultId(CapabilityTarget.MOTION)).toBe('audiovisual');
  });
  it('AUDIO maps to audiovisual vault', () => {
    expect(capabilityTargetToVaultId(CapabilityTarget.AUDIO)).toBe('audiovisual');
  });
  it('WRITING maps to documents vault', () => {
    expect(capabilityTargetToVaultId(CapabilityTarget.WRITING)).toBe('documents');
  });
});

// ── mapVaultAssetToTreasure ────────────────────────────────────────────────

describe('mapVaultAssetToTreasure — N-1: media URL and type', () => {
  it('image asset: mediaUrl and mediaType are populated', () => {
    const asset = makeAsset({
      capabilityTarget: CapabilityTarget.VISUAL,
      secureStorageUri: '/generated-assets/abc.png',
    });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.mediaUrl).toBe('/generated-assets/abc.png');
    expect(result.mediaType).toBe('image');
  });

  it('video asset: mediaUrl and mediaType are populated', () => {
    const asset = makeAsset({
      capabilityTarget: CapabilityTarget.MOTION,
      secureStorageUri: '/uploads/clip.mp4',
      metadata:         { providerId: 'creator-upload' },
    });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.mediaUrl).toBe('/uploads/clip.mp4');
    expect(result.mediaType).toBe('video');
  });

  it('audio asset: mediaUrl and mediaType are populated', () => {
    const asset = makeAsset({
      capabilityTarget: CapabilityTarget.AUDIO,
      secureStorageUri: '/uploads/sound.mp3',
      metadata:         { providerId: 'creator-upload' },
    });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.mediaUrl).toBe('/uploads/sound.mp3');
    expect(result.mediaType).toBe('audio');
  });

  it('missing/empty secureStorageUri: mediaUrl is undefined (unavailable state)', () => {
    const asset = makeAsset({ secureStorageUri: '' });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.mediaUrl).toBeUndefined();
  });
});

describe('mapVaultAssetToTreasure — N-2: real download target', () => {
  it('generated image: mediaUrl is the actual asset path (not metadata)', () => {
    const asset = makeAsset({ secureStorageUri: '/generated-assets/img.png' });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.mediaUrl).toBe('/generated-assets/img.png');
    expect(result.mediaUrl).not.toContain('json');
  });

  it('uploaded file: mediaUrl is the actual uploaded file path', () => {
    const asset = makeAsset({
      capabilityTarget: CapabilityTarget.AUDIO,
      secureStorageUri: '/uploads/voice.wav',
      metadata:         { providerId: 'creator-upload' },
    });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.mediaUrl).toBe('/uploads/voice.wav');
  });
});

describe('mapVaultAssetToTreasure — N-3: origin and metadata', () => {
  it('generated asset: origin identifies the generation chamber', () => {
    const asset = makeAsset({ metadata: { providerId: 'openai-gpt-image-1', generationPrompt: 'test' } });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.origin).toBe('حجرة القيامة');
  });

  it('uploaded asset: origin identifies the upload path', () => {
    const asset = makeAsset({ metadata: { providerId: 'creator-upload' } });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.origin).toBe('رفع سيادي');
  });

  it('generated asset with prompt: titleAr is the generation prompt', () => {
    const asset = makeAsset({ metadata: { providerId: 'openai-gpt-image-1', generationPrompt: 'a citadel at dawn' } });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.titleAr).toBe('a citadel at dawn');
  });

  it('generated asset without prompt: titleAr is default label', () => {
    const asset = makeAsset({ metadata: { providerId: 'openai-gpt-image-1' } });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.titleAr).toBe('أصل مُولَّد');
  });

  it('Creator isolation: two assets from different tenants map independently', () => {
    const a1 = makeAsset({ assetId: 'a1', subscriberTenantId: 'creator-1', secureStorageUri: '/uploads/a1.png' });
    const a2 = makeAsset({ assetId: 'a2', subscriberTenantId: 'creator-2', secureStorageUri: '/uploads/a2.png' });
    const r1 = mapVaultAssetToTreasure(a1);
    const r2 = mapVaultAssetToTreasure(a2);
    expect(r1.mediaUrl).toBe('/uploads/a1.png');
    expect(r2.mediaUrl).toBe('/uploads/a2.png');
    expect(r1.mediaUrl).not.toBe(r2.mediaUrl);
  });

  it('generated asset behavior unchanged: style is preserved in preview', () => {
    const asset = makeAsset({
      metadata: { providerId: 'openai-gpt-image-1', generationPrompt: 'test', generationStyle: 'cinematic' },
    });
    const result = mapVaultAssetToTreasure(asset);
    expect(result.preview).toBe('cinematic');
  });
});
