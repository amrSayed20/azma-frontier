import type { GoldenAsset, GoldenAssetDomain, GoldenAssetStatus } from './golden-asset-types';
import { IMAGE_GENERATION_GOLDEN_ASSETS } from './image-generation-assets';
import { IMAGE_EDITING_GOLDEN_ASSETS } from './image-editing-assets';
import { IMAGE_UPSCALING_GOLDEN_ASSETS } from './image-upscaling-assets';
import { VIDEO_GENERATION_GOLDEN_ASSETS } from './video-generation-assets';
import { TEXT_TO_SPEECH_GOLDEN_ASSETS } from './text-to-speech-assets';
import { VOICE_CLONING_GOLDEN_ASSETS } from './voice-cloning-assets';

export class GoldenAssetRegistry {
  private readonly assets = new Map<string, GoldenAsset>();

  register(asset: GoldenAsset): void {
    if (this.assets.has(asset.assetId)) {
      throw new Error(`GoldenAssetRegistry: duplicate assetId "${asset.assetId}"`);
    }
    this.assets.set(asset.assetId, asset);
  }

  get(assetId: string): GoldenAsset | undefined {
    return this.assets.get(assetId);
  }

  listAll(): readonly GoldenAsset[] {
    return Array.from(this.assets.values());
  }

  listByDomain(domain: GoldenAssetDomain): readonly GoldenAsset[] {
    return this.listAll().filter((a) => a.domain === domain);
  }

  listByTestId(testId: string): readonly GoldenAsset[] {
    return this.listAll().filter((a) => a.testId === testId);
  }

  listByStatus(status: GoldenAssetStatus): readonly GoldenAsset[] {
    return this.listAll().filter((a) => a.status === status);
  }

  count(): number {
    return this.assets.size;
  }
}

export function createDefaultGoldenAssetRegistry(): GoldenAssetRegistry {
  const registry = new GoldenAssetRegistry();
  const all: readonly GoldenAsset[] = [
    ...IMAGE_GENERATION_GOLDEN_ASSETS,
    ...IMAGE_EDITING_GOLDEN_ASSETS,
    ...IMAGE_UPSCALING_GOLDEN_ASSETS,
    ...VIDEO_GENERATION_GOLDEN_ASSETS,
    ...TEXT_TO_SPEECH_GOLDEN_ASSETS,
    ...VOICE_CLONING_GOLDEN_ASSETS,
  ];
  for (const asset of all) {
    registry.register(asset);
  }
  return registry;
}
