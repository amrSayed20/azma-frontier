import { BenchmarkSpec } from '../benchmark-types';
import { SPEC_VERSIONS } from '../benchmark-version';

const V = SPEC_VERSIONS['image-upscaling'];

// Section 13: benchmark distinguishes generation resolution from post-generation
// refinement. These specs measure the refinement/upscaling/mastering layer
// independently from the generation layer.

export const IMAGE_UPSCALING_SPECS: readonly BenchmarkSpec[] = [
  {
    testId: 'img-up-001',
    version: V,
    capability: 'image-upscaling',
    name: '2x Resolution Enhancement',
    description: 'Evaluates resolution doubling quality with artifact suppression and fine-detail recovery.',
    scoringDimensions: ['resolution', 'detail', 'consistency', 'editingPrecision'],
    input: {
      prompt: 'Upscale the image to exactly 2× the original resolution (512×512 → 1024×1024). Recover fine detail lost to JPEG compression. Suppress blocking and ringing artifacts. Preserve original color profile, white balance, and composition exactly. Do not hallucinate detail not implied by the source.',
      referenceDescription: 'ref-img-compressed-portrait-v1: A 512×512 JPEG portrait at quality 60–70 with visible compression artifacts.',
      parameters: { scaleFactor: 2, artifactReduction: true, preserveColor: true, hallucination: 'none' },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'resolution: effective sharpness gain and JPEG artifact reduction measurable by visual inspection. detail: recovery of fine features (hair, fabric) not clearly visible in the source. consistency: no hallucinated features absent from source. editingPrecision: no ringing, no halo artifacts, no posterization.',
  },
  {
    testId: 'img-up-002',
    version: V,
    capability: 'image-upscaling',
    name: 'Adaptive Sharpening — Edge-Selective',
    description: 'Evaluates targeted sharpening without noise amplification or global artifact introduction.',
    scoringDimensions: ['detail', 'editingPrecision', 'consistency', 'resolution'],
    input: {
      prompt: 'Apply adaptive sharpening to edge regions only (treeline, branches, hard contours). Leave smooth-gradient areas (sky, open ground) completely unsharpened. Do not amplify existing film grain in any region. Do not introduce ringing artifacts at high-contrast boundaries.',
      referenceDescription: 'ref-img-landscape-grain-v1: A landscape with a sharp treeline foreground and soft sky, moderate film grain.',
      parameters: { sharpenMode: 'adaptive-edge', noisePreservation: true, ringingThreshold: 0 },
      resolution: '1024x768',
    },
    evaluationGuidance: 'detail: treeline and branch sharpness improvement. editingPrecision: absence of ringing at treeline boundary, no grain amplification in sky. consistency: coherent sharpness gradient between edge and smooth regions.',
  },
  {
    testId: 'img-up-003',
    version: V,
    capability: 'image-upscaling',
    name: 'Dynamic Range Recovery',
    description: 'Evaluates simultaneous shadow recovery and highlight recovery while maintaining natural tonal balance.',
    scoringDimensions: ['detail', 'photorealism', 'consistency', 'resolution'],
    input: {
      prompt: 'Recover shadow detail in the dark interior room and highlight detail in the blown-out window simultaneously. Map recovered tones into a natural-looking tonal range. Maintain balanced mid-tone exposure. Do not introduce HDR halo effects at the window frame boundary.',
      referenceDescription: 'ref-img-high-contrast-interior-v1: An interior photograph with clipped shadows and blown-out window highlights.',
      parameters: { editType: 'dynamic-range', shadowRecovery: true, highlightRecovery: true, haloSuppression: true },
      resolution: '1024x768',
    },
    evaluationGuidance: 'detail: shadow and highlight information recovered and visible. photorealism: natural-looking tonal compression without artificial HDR grunge effect. consistency: no halo ring around the window frame, uniform exposure transition.',
  },
];
