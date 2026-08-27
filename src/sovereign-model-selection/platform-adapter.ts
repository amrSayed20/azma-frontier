import type { MasterAssetAdaptability, PlatformDimensions } from './types';

// Known platform → canonical dimensions.
// The Creator selects a platform name; AZMA resolves the technical dimensions.
// aspectRatio:    what AZMA requests from the provider.
// resolutionHint: the preferred output resolution for this platform.
const PLATFORM_MAP: Readonly<Record<string, PlatformDimensions>> = {
  youtube:           { aspectRatio: '16:9', resolutionHint: '1080p', label: 'YouTube' },
  tiktok:            { aspectRatio: '9:16', resolutionHint: '1080p', label: 'TikTok' },
  instagram:         { aspectRatio: '1:1',  resolutionHint: '1k',    label: 'Instagram' },
  'instagram-story': { aspectRatio: '9:16', resolutionHint: '1080p', label: 'Instagram Story' },
  'instagram-reel':  { aspectRatio: '9:16', resolutionHint: '1080p', label: 'Instagram Reel' },
  facebook:          { aspectRatio: '16:9', resolutionHint: '1080p', label: 'Facebook' },
  x:                 { aspectRatio: '16:9', resolutionHint: '1k',    label: 'X (Twitter)' },
  twitter:           { aspectRatio: '16:9', resolutionHint: '1k',    label: 'X (Twitter)' },
  linkedin:          { aspectRatio: '16:9', resolutionHint: '1k',    label: 'LinkedIn' },
  snapchat:          { aspectRatio: '9:16', resolutionHint: '1080p', label: 'Snapchat' },
};

// Resolves a Creator-supplied platform name to canonical dimensions.
// Returns null when the platform is unknown — caller decides how to handle.
export function resolvePlatformDimensions(platformTarget: string): PlatformDimensions | null {
  return PLATFORM_MAP[platformTarget.toLowerCase()] ?? null;
}

// Returns the default aspect ratio for a platform target, or '16:9' when unknown/unspecified.
export function getDefaultAspectRatio(platformTarget?: string): string {
  if (!platformTarget) return '16:9';
  return PLATFORM_MAP[platformTarget.toLowerCase()]?.aspectRatio ?? '16:9';
}

/**
 * Determines whether an existing master asset can serve a target platform
 * without regenerating from the provider.
 *
 * Policy:
 *   Same aspect ratio             → direct-reuse  (no cost, no processing)
 *   Same orientation family       → crop-adapt    (reframing only; no new generation)
 *   Landscape ↔ portrait          → regenerate-required (composition change; new generation)
 *
 * Regeneration-required means a new paid execution must be priced and approved
 * before proceeding. AZMA must never silently regenerate.
 */
export function assessMasterAdaptability(
  masterAspectRatio: string,
  targetAspectRatio: string,
): MasterAssetAdaptability {
  if (masterAspectRatio === targetAspectRatio) return 'direct-reuse';

  const masterOrientation = getOrientation(masterAspectRatio);
  const targetOrientation = getOrientation(targetAspectRatio);

  if (masterOrientation === targetOrientation) return 'crop-adapt';

  // Orientation mismatch (landscape ↔ portrait, or either ↔ square) requires
  // regeneration to preserve compositional integrity.
  return 'regenerate-required';
}

function getOrientation(aspectRatio: string): 'landscape' | 'portrait' | 'square' {
  const parts = aspectRatio.split(':');
  const w = Number(parts[0]);
  const h = Number(parts[1]);
  if (!w || !h) return 'landscape';
  if (w > h) return 'landscape';
  if (w < h) return 'portrait';
  return 'square';
}
