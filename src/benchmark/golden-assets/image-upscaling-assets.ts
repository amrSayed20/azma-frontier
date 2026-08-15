import type { GoldenReferenceImageAsset } from './golden-asset-types';

const V = '1.0.0';

// Golden reference image assets for all image-upscaling benchmark specs.
// These tasks require an input image to process; binary is never stored in source.
// The critical evaluation distinction for upscaling: detail recovery is scored positively
// only for features demonstrably implied by the source — hallucinated detail disqualifies.

export const IMAGE_UPSCALING_GOLDEN_ASSETS: readonly GoldenReferenceImageAsset[] = [
  {
    assetId: 'ga-img-up-001',
    assetVersion: V,
    domain: 'image-upscaling',
    testId: 'img-up-001',
    description: 'Reference image spec for 2× resolution enhancement evaluation (compressed portrait)',
    intendedObjective: 'Measure JPEG artifact removal, resolution doubling quality, and strict anti-hallucination: recovered detail must be implied by the source, not invented.',
    permittedUsage: 'benchmark-only',
    status: 'ready',
    assetType: 'reference-image',
    fixtureId: 'ref-img-compressed-portrait-v1',
    imageDescription: 'A 512×512 JPEG portrait photograph at quality 60–70 with visible compression blocking and mosquito noise artifacts, particularly in hair, fabric, and facial edge regions.',
    requiredCharacteristics: [
      'Exact resolution: 512×512 pixels',
      'JPEG quality 60–70: visible 8×8 block artifacts in high-frequency areas',
      'Mosquito noise visible along high-contrast edges (hair, collar)',
      'Some fine detail (hair strands, fabric texture) visible but degraded',
      'No watermarks or overlay text',
    ],
    formatRequirements: { format: 'JPEG', exactResolution: '512x512', jpegQuality: '60–70', maxFileSizeMB: 1 },
    editInstruction: 'Upscale the image to exactly 2× the original resolution (512×512 → 1024×1024). Recover fine detail lost to JPEG compression. Suppress blocking and ringing artifacts. Preserve original color profile, white balance, and composition exactly. Do not hallucinate detail not implied by the source.',
    mustChange: [
      'Output resolution: must be 1024×1024',
      'JPEG blocking and mosquito artifacts: visibly reduced or eliminated',
      'Fine detail in hair and fabric: recovered where implied by source',
    ],
    mustNotChange: [
      'Color profile and white balance: pixel-level color accuracy preserved',
      'Subject identity and facial proportions',
      'Composition and framing',
      'Detail that does not exist in source: no invention of absent features',
    ],
    evaluationDimensions: ['quality', 'detail', 'consistency', 'realism', 'usefulness'],
    acquisitionGuidance: 'Use a CC0-licensed portrait photograph. Resize to exactly 512×512 using a bicubic or Lanczos filter. Save at JPEG quality 60–70 using any standard encoder (libjpeg or similar). Verify visible blocking artifacts in hair. Subject must include fine detail: hair, fabric, or similar texture that can be recovered. No watermarks.',
  },
  {
    assetId: 'ga-img-up-002',
    assetVersion: V,
    domain: 'image-upscaling',
    testId: 'img-up-002',
    description: 'Reference image spec for edge-selective adaptive sharpening evaluation (landscape with grain)',
    intendedObjective: 'Measure targeted sharpening precision: improve edge definition without amplifying noise in smooth regions or introducing ringing at high-contrast boundaries.',
    permittedUsage: 'benchmark-only',
    status: 'ready',
    assetType: 'reference-image',
    fixtureId: 'ref-img-landscape-grain-v1',
    imageDescription: 'A landscape photograph with a sharp foreground treeline and distinct branches against a soft, diffuse sky. Moderate film grain present throughout (equivalent to ISO 3200 or synthetic grain overlay).',
    requiredCharacteristics: [
      'Treeline and branches in sharp focus with clear, high-contrast edges',
      'Sky region soft and smooth with no hard texture',
      'Film grain visible across the full image (not just noise in shadows)',
      'Open ground or midfield region between treeline and sky',
      'No people, vehicles, or text',
    ],
    formatRequirements: { format: 'PNG or JPEG', minResolution: '1024x768', colorSpace: 'sRGB', maxFileSizeMB: 10 },
    editInstruction: 'Apply adaptive sharpening to edge regions only (treeline, branches, hard contours). Leave smooth-gradient areas (sky, open ground) completely unsharpened. Do not amplify existing film grain in any region. Do not introduce ringing artifacts at high-contrast boundaries.',
    mustChange: [
      'Treeline and branch edges: visibly sharper than source',
    ],
    mustNotChange: [
      'Sky region: texture and grain level identical to source',
      'Open ground region: grain level identical to source',
      'Film grain amplitude: must not be amplified anywhere',
      'High-contrast boundaries: no ringing or fringing introduced',
    ],
    evaluationDimensions: ['quality', 'detail', 'consistency', 'usefulness'],
    acquisitionGuidance: 'Use a CC0-licensed landscape photograph with a clearly defined treeline. Sky must be soft (no texture). If the image lacks film grain, apply a synthetic grain overlay at 3–5% amplitude uniformly before using as reference. Minimum 1024×768. No people, no watermarks.',
  },
  {
    assetId: 'ga-img-up-003',
    assetVersion: V,
    domain: 'image-upscaling',
    testId: 'img-up-003',
    description: 'Reference image spec for simultaneous shadow and highlight dynamic-range recovery (high-contrast interior)',
    intendedObjective: 'Measure ability to recover both clipped shadow and blown highlight detail simultaneously while maintaining natural tonal balance and no HDR halo artifacts.',
    permittedUsage: 'benchmark-only',
    status: 'ready',
    assetType: 'reference-image',
    fixtureId: 'ref-img-high-contrast-interior-v1',
    imageDescription: 'An interior room photographed without HDR. A large window in the background is blown out to pure white. The room interior in the foreground contains shadow areas clipped to near-black. A visible window frame provides the boundary between these extremes.',
    requiredCharacteristics: [
      'Window region measurably overexposed: histogram shows blown highlights (pure white)',
      'Interior shadow region measurably underexposed: histogram shows clipped shadows (pure black)',
      'Window frame visible as a high-contrast structural boundary',
      'No HDR or tone-mapping pre-processing applied to the source',
      'No people in frame',
    ],
    formatRequirements: { format: 'JPEG or RAW-derived JPEG', minResolution: '1024x768', maxFileSizeMB: 15 },
    editInstruction: 'Recover shadow detail in the dark interior room and highlight detail in the blown-out window simultaneously. Map recovered tones into a natural-looking tonal range. Maintain balanced mid-tone exposure. Do not introduce HDR halo effects at the window frame boundary.',
    mustChange: [
      'Shadow regions: detail visible that was clipped in source',
      'Highlight regions: detail visible that was blown in source',
      'Overall tonal range: expanded to reveal both extremes naturally',
    ],
    mustNotChange: [
      'Mid-tone exposure: must remain balanced — not over-brightened or darkened',
      'Window frame boundary: no glow, halo, or fringing introduced',
      'Composition and framing: pixel-exact',
    ],
    evaluationDimensions: ['quality', 'detail', 'consistency', 'realism', 'usefulness'],
    acquisitionGuidance: 'Use a CC0-licensed interior photograph taken without HDR processing. A bright window must be the dominant background element, blown out to pure white. Interior must have shadow areas clipped to near-black. Do not apply any tone-mapping before using as source. Minimum 1024×768. No people, no watermarks.',
  },
];
