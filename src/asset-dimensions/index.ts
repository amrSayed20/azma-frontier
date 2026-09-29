/**
 * AZMA OS — an asset knows its own size.
 *
 * The one input `src/sovereign-model-selection/platform-adapter.ts` has always
 * required and never had. See read-dimensions.ts for why the bytes are the
 * only source accepted.
 */
export { readDimensions, detectFormat } from './read-dimensions';
export type { PixelDimensions, AssetImageFormat } from './read-dimensions';
export { toAspectRatio, CANONICAL_FAMILIES, FAMILY_TOLERANCE } from './aspect-ratio';
export { resolveAssetShape, resolveAssetShapes } from './resolve-asset-dimensions';
export type { AssetShape } from './resolve-asset-dimensions';
