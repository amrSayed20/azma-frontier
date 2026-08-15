import { BenchmarkSpec } from '../benchmark-types';
import { SPEC_VERSIONS } from '../benchmark-version';

const V = SPEC_VERSIONS['image-editing'];

// Sections 3 + 7: editing precision, fine-detail preservation, consistency.
// All specs require reference images described in benchmark-fixtures.ts.

export const IMAGE_EDITING_SPECS: readonly BenchmarkSpec[] = [
  {
    testId: 'img-edit-001',
    version: V,
    capability: 'image-editing',
    name: 'Object Removal — Inpainting',
    description: 'Evaluates inpainting quality when removing a specified foreground object and reconstructing the hidden background.',
    scoringDimensions: ['editingPrecision', 'detail', 'consistency', 'promptAdherence'],
    input: {
      prompt: 'Remove the parked car from the foreground of the street scene. Reconstruct the cobblestone pavement beneath and around where the car stood, matching the texture, color, and mortar pattern of the surrounding cobblestones. The rest of the scene — pedestrians, buildings, sky — must remain completely unchanged.',
      referenceDescription: 'ref-img-street-cobblestone-v1: A daytime photograph of a narrow European cobblestone street with a single parked car in the foreground and pedestrians in the background.',
      parameters: { editType: 'inpainting', preserveBackground: true },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'editingPrecision: clean boundary, no ghost artifacts, correct mask coverage. detail: cobblestone reconstruction quality and mortar line continuity. consistency: seamless color, lighting, and blur-level match with surrounding area.',
  },
  {
    testId: 'img-edit-002',
    version: V,
    capability: 'image-editing',
    name: 'Style Transfer — Impressionist',
    description: 'Evaluates style application while preserving recognizable scene structure.',
    scoringDimensions: ['promptAdherence', 'consistency', 'editingPrecision', 'detail'],
    input: {
      prompt: 'Apply an impressionist oil painting style to the cityscape image: visible directional brushstrokes, soft color blending, warm-shifted palette. Building positions, skyline silhouette, river location, and overall composition must remain clearly recognizable. Do not alter the scene layout.',
      referenceDescription: 'ref-img-cityscape-v1: A daytime cityscape photograph of a recognizable skyline with a river in the foreground.',
      parameters: { editType: 'style-transfer', style: 'impressionist' },
      resolution: '1280x720',
    },
    evaluationGuidance: 'promptAdherence: impressionist characteristics present (brushstrokes, color blending). consistency: structural layout and landmark positions preserved. editingPrecision: balance between stylization and compositional fidelity.',
  },
  {
    testId: 'img-edit-003',
    version: V,
    capability: 'image-editing',
    name: 'Inpainting — Canvas Fill',
    description: 'Evaluates contextually appropriate content generation within a masked region.',
    scoringDimensions: ['editingPrecision', 'consistency', 'promptAdherence', 'detail'],
    input: {
      prompt: "Replace the blank white canvas on the easel with a realistic mountain landscape oil painting. The inserted painting must look like it belongs in the atelier: warm oil-on-canvas texture, consistent directional lighting from the window on the left, small visible brushstrokes. The easel frame and surrounding room must remain unchanged.",
      referenceDescription: "ref-img-atelier-v1: An artist's atelier with an easel holding a blank white canvas, natural window light from the left.",
      parameters: { editType: 'inpainting', maskTarget: 'canvas' },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'editingPrecision: clean canvas mask boundary, no overflow into the frame. consistency: lighting on the painted canvas matches window direction. promptAdherence: mountain landscape subject, oil painting texture, warm tones.',
  },
  {
    testId: 'img-edit-004',
    version: V,
    capability: 'image-editing',
    name: 'Color Correction — White Balance Shift',
    description: 'Evaluates targeted color temperature adjustment without structural degradation.',
    scoringDimensions: ['editingPrecision', 'consistency', 'detail', 'promptAdherence'],
    input: {
      prompt: 'Shift the white balance to approximately 6500K (warm/tungsten). Apply the change uniformly across the entire image. Do not increase sharpness, do not boost contrast, do not crush shadows, do not alter saturation. All fine structural detail, shadow gradients, and furniture edges must remain identical to the source.',
      referenceDescription: 'ref-img-cool-interior-v1: A cool-toned indoor photograph of a minimalist living room.',
      parameters: { editType: 'color-correction', targetColorTempK: 6500, preserveStructure: true },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'editingPrecision: target color temperature achieved without over-correction or hue shift artifacts. consistency: uniform color shift across all image regions. detail: shadow detail and fine texture preserved identically to source.',
  },
];
