/**
 * AZMA OS — Phase 3B Package I: Vault Palace Presentation Layer
 *
 * Pure mapping functions extracted from the Vault Palace page for
 * testability. No React dependency, no side effects.
 */

import type { VaultAsset } from './sovereign-vault-types';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';

export type AssetMediaType = 'image' | 'video' | 'audio';

/**
 * Every asset is filed by what it actually is. Images, video and audio used to
 * collapse into one vault while nine others stood empty, so a Creator looking
 * for a single recording had to search a pile of unrelated media.
 *
 * The vault ids are deliberately left alone. They key the stored buckets, and
 * renaming them would orphan everything a Creator has already filed; only the
 * Arabic names the Creator reads were changed to match these contents.
 *   audiovisual -> خزنة الأصوات    creative -> خزنة الصور    memories -> خزنة المشاهد
 */
export function capabilityTargetToVaultId(target: CapabilityTarget): string {
  switch (target) {
    case CapabilityTarget.AUDIO:
      return 'audiovisual';
    case CapabilityTarget.VISUAL:
      return 'creative';
    case CapabilityTarget.MOTION:
      return 'memories';
    case CapabilityTarget.WRITING:
    case CapabilityTarget.DIRECTORIAL:
      return 'documents';
    default:
      return 'creative';
  }
}

export function detectMediaType(target: CapabilityTarget): AssetMediaType | undefined {
  switch (target) {
    case CapabilityTarget.VISUAL: return 'image';
    case CapabilityTarget.MOTION: return 'video';
    case CapabilityTarget.AUDIO:  return 'audio';
    default:                       return undefined;
  }
}

export interface TreasureMapping {
  readonly titleAr:   string;
  readonly vaultId:   string;
  readonly origin:    string;
  readonly preview:   string;
  readonly mediaUrl:  string | undefined;
  readonly mediaType: AssetMediaType | undefined;
}

export function mapVaultAssetToTreasure(asset: VaultAsset): TreasureMapping {
  const prompt    = typeof asset.metadata.generationPrompt === 'string'
    ? asset.metadata.generationPrompt : null;
  const style     = typeof asset.metadata.generationStyle === 'string'
    ? asset.metadata.generationStyle : null;
  const isUpload  = asset.metadata.providerId === 'creator-upload';
  const mediaType = detectMediaType(asset.capabilityTarget);

  return {
    titleAr:   prompt ? prompt.slice(0, 80) : (isUpload ? 'أصل مرفوع' : 'أصل مُولَّد'),
    vaultId:   capabilityTargetToVaultId(asset.capabilityTarget),
    origin:    isUpload ? 'رفع سيادي' : 'حجرة القيامة',
    preview:   style ?? (isUpload ? 'أصل مرفوع من جهازك' : 'أصل حقيقي من القيامة'),
    mediaUrl:  asset.secureStorageUri || undefined,
    mediaType,
  };
}
