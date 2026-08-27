import type { QualityTier, SovereignCreationIntent } from './types';
import { getDefaultAspectRatio } from './platform-adapter';

// ─── Style → quality tier ─────────────────────────────────────────────────────
//
// Maps the Creator-facing style ID (English internal key from STYLE_VOCABULARY)
// to the quality tier that best represents its creative demands.
//
// AZMA infers quality from style — the Creator chooses the style;
// AZMA derives what quality that style requires.
// The Creator does NOT set quality tier directly in the current Qiyamah UI.
// The architecture supports explicit quality override — pass qualityOverride to buildImageCreationIntent.

const STYLE_QUALITY_MAP: Readonly<Record<string, QualityTier>> = {
  advertising:  'ultra',
  realistic:    'high',
  portrait:     'high',
  cinematic:    'high',
  architecture: 'high',
  fashion:      'high',
  documentary:  'standard',
  historical:   'standard',
  scifi:        'standard',
  creative:     'standard',
  fantasy:      'standard',
  animation:    'standard',
  abstract:     'standard',
};

// Quality tier → default resolution.
// Reflects what each tier realistically demands at launch.
// 'ultra' requests 2k; the selector rejects the request if no 2k model is available
// rather than silently downgrading.
const QUALITY_RESOLUTION_MAP: Readonly<Record<QualityTier, string>> = {
  standard: '1k',
  high:     '1k',
  ultra:    '2k',
};

// Style → creative characteristic hints.
// Used by the selector to score models that declare matching characteristics.
const STYLE_CHARACTERISTIC_MAP: Readonly<Record<string, readonly string[]>> = {
  advertising:  ['product-clarity', 'studio-lighting', 'clean-background', 'commercial-grade'],
  realistic:    ['photo-accurate', 'natural-lighting', 'detail-fidelity', 'photorealistic'],
  portrait:     ['facial-realism', 'soft-lighting', 'depth-of-field', 'photorealistic'],
  cinematic:    ['film-look', 'color-grade', 'wide-angle', 'dramatic-lighting', 'photorealistic'],
  architecture: ['geometric-precision', 'natural-light', 'technical-fidelity', 'photorealistic'],
  fashion:      ['garment-detail', 'editorial-pose', 'studio-quality', 'photorealistic'],
  documentary:  ['authentic', 'natural-light', 'reportage'],
  historical:   ['period-accuracy', 'warm-tones', 'archival'],
  scifi:        ['futuristic', 'neon', 'creative-latitude'],
  creative:     ['artistic-freedom', 'bold-palette', 'expressive'],
  fantasy:      ['painterly', 'imaginative', 'magical'],
  animation:    ['illustrated', 'stylized', 'vibrant'],
  abstract:     ['non-representational', 'geometric', 'expressive'],
};

// ─── Public builders ──────────────────────────────────────────────────────────

/**
 * Builds a SovereignCreationIntent for an image generation request.
 *
 * @param prompt           - The final approved scene (from Qiyamah stage II)
 * @param style            - Creator-facing style ID (e.g. 'cinematic')
 * @param platformTarget   - Optional platform hint (e.g. 'Instagram')
 * @param qualityOverride  - Optional explicit quality override; defaults to style-derived tier
 */
export function buildImageCreationIntent(
  prompt: string,
  style: string | null | undefined,
  platformTarget?: string,
  qualityOverride?: QualityTier,
): SovereignCreationIntent {
  const resolvedStyle = style ?? '';
  const qualityRequirement = qualityOverride ?? STYLE_QUALITY_MAP[resolvedStyle] ?? 'standard';
  const resolution = QUALITY_RESOLUTION_MAP[qualityRequirement];
  const aspectRatio = getDefaultAspectRatio(platformTarget);

  return {
    mediaType: 'image',
    prompt,
    style: resolvedStyle,
    qualityRequirement,
    resolution,
    aspectRatio,
    characteristicHints: STYLE_CHARACTERISTIC_MAP[resolvedStyle] ?? [],
    platformTarget,
  };
}

/**
 * Builds a SovereignCreationIntent for a video generation request.
 *
 * @param prompt                        - The scene prompt
 * @param style                         - Creator-facing style ID
 * @param durationSeconds               - Requested video duration
 * @param platformTarget                - Optional platform (e.g. 'TikTok')
 * @param characterConsistencyRequired  - Whether character consistency is required
 * @param audioRequired                 - Whether audio is required
 * @param qualityOverride               - Optional explicit quality override
 */
export function buildVideoCreationIntent(
  prompt: string,
  style: string | null | undefined,
  durationSeconds: number,
  platformTarget?: string,
  characterConsistencyRequired?: boolean,
  audioRequired?: boolean,
  qualityOverride?: QualityTier,
): SovereignCreationIntent {
  const resolvedStyle = style ?? '';
  const qualityRequirement = qualityOverride ?? STYLE_QUALITY_MAP[resolvedStyle] ?? 'standard';
  // Video resolution is not derived from quality tier at this stage — it maps from platform.
  const resolution = platformTarget === 'youtube' || platformTarget === 'facebook' ? '1080p' : '720p';
  const aspectRatio = getDefaultAspectRatio(platformTarget);

  return {
    mediaType: 'video',
    prompt,
    style: resolvedStyle,
    qualityRequirement,
    resolution,
    aspectRatio,
    characteristicHints: STYLE_CHARACTERISTIC_MAP[resolvedStyle] ?? [],
    durationSeconds,
    platformTarget,
    characterConsistencyRequired,
    audioRequired,
  };
}

// Exported for tests.
export { STYLE_QUALITY_MAP, QUALITY_RESOLUTION_MAP, STYLE_CHARACTERISTIC_MAP };
