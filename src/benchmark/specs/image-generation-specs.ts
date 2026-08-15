import { BenchmarkSpec } from '../benchmark-types';
import { SPEC_VERSIONS } from '../benchmark-version';

const V = SPEC_VERSIONS['image-generation'];

// Sections 3 + 7: photorealism, micro-detail, prompt adherence,
// complex composition, cinematic lighting, camera angle interpretation,
// character consistency, reference adherence, typography,
// fine-detail preservation, resolution / usable output quality.

export const IMAGE_GENERATION_SPECS: readonly BenchmarkSpec[] = [
  {
    testId: 'img-gen-001',
    version: V,
    capability: 'image-generation',
    name: 'Photorealism — Portrait',
    description: 'Evaluates photorealistic human portrait rendering with correct lighting and depth of field.',
    scoringDimensions: ['photorealism', 'detail', 'promptAdherence', 'resolution'],
    input: {
      prompt: 'A photorealistic portrait of an elderly man with deeply weathered features in soft morning light. Shallow depth of field, 85mm lens equivalent. Neutral background, no props, no text.',
      parameters: { aspectRatio: '1:1' },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'photorealism: skin texture, subsurface scattering, believable depth of field. detail: pores, individual hair strands, eye catchlights. promptAdherence: age, light direction, clean background. resolution: sharpness and file usability at output size.',
  },
  {
    testId: 'img-gen-002',
    version: V,
    capability: 'image-generation',
    name: 'Micro-Detail — Mechanical Watch Movement',
    description: 'Evaluates fine-detail rendering on a complex mechanical subject requiring high-precision spatial accuracy.',
    scoringDimensions: ['detail', 'photorealism', 'promptAdherence', 'resolution'],
    input: {
      prompt: 'Extreme macro photograph of a mechanical watch movement. Individual gears, escapement wheel, pallet fork, and mainspring in sharp focus. Dark background, studio rim lighting, photorealistic.',
      parameters: { aspectRatio: '1:1' },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'detail: individual gear teeth, screw threads, jewel inserts, surface finish of brass components. photorealism: metallic reflectance, specular highlights. promptAdherence: correct mechanical components present, correct perspective.',
  },
  {
    testId: 'img-gen-003',
    version: V,
    capability: 'image-generation',
    name: 'Complex Composition — Crowded Scene',
    description: 'Evaluates compositional ability and prompt adherence with a high-element-density scene.',
    scoringDimensions: ['promptAdherence', 'detail', 'consistency', 'resolution'],
    input: {
      prompt: 'A bustling Middle Eastern souk at golden hour. Dozens of merchants and buyers in traditional clothing, intricate fabric stalls draped with textiles, hanging lanterns, terracotta pots, cobblestone ground. Atmospheric haze in the distance. Wide establishing shot.',
      parameters: { aspectRatio: '16:9' },
      resolution: '1280x720',
    },
    evaluationGuidance: 'promptAdherence: souk elements present, golden-hour color tone, clothing authenticity. detail: individual stall elements, crowd density and variety. consistency: coherent perspective and lighting across the full scene.',
  },
  {
    testId: 'img-gen-004',
    version: V,
    capability: 'image-generation',
    name: 'Cinematic Lighting — Sunset Silhouette',
    description: 'Evaluates dramatic atmospheric rendering and cinematic lighting interpretation.',
    scoringDimensions: ['photorealism', 'promptAdherence', 'detail', 'resolution'],
    input: {
      prompt: 'Silhouette of a lone figure standing on the crest of a sand dune at sunset. Volumetric light rays pierce through deep orange and violet clouds. Cinematic 2.39:1 aspect ratio. No detail visible in the figure — pure silhouette.',
      parameters: { style: 'cinematic', aspectRatio: '21:9' },
      resolution: '1344x576',
    },
    evaluationGuidance: 'photorealism: sky gradient realism, volumetric ray quality, sand texture. promptAdherence: pure silhouette (no face/body detail), dune crest position, correct color palette. detail: cloud formations, dune edge sharpness.',
  },
  {
    testId: 'img-gen-005',
    version: V,
    capability: 'image-generation',
    name: 'Camera Angle — Overhead Symmetry',
    description: 'Evaluates correct interpretation of an unusual camera angle and symmetric compositional instruction.',
    scoringDimensions: ['promptAdherence', 'consistency', 'detail', 'resolution'],
    input: {
      prompt: "Perfectly symmetrical bird's-eye view looking straight down into a circular library. Thousands of books on curved spiral shelves radiating from a central reading floor. Marble tiles, reading lamps, dramatic overhead lighting. No people.",
      parameters: { aspectRatio: '1:1' },
      resolution: '1024x1024',
    },
    evaluationGuidance: "promptAdherence: correct overhead (90°) perspective, circular layout, books visible, no people. consistency: radial symmetry maintained across the full frame, coherent perspective throughout. detail: individual book spines, shelf geometry.",
  },
  {
    testId: 'img-gen-006',
    version: V,
    capability: 'image-generation',
    name: 'Typography — Arabic Calligraphy',
    description: 'Evaluates ability to render legible Arabic script with correct letterforms.',
    scoringDimensions: ['typography', 'promptAdherence', 'detail', 'photorealism'],
    input: {
      prompt: 'A vintage Arabic calligraphy poster on aged parchment. The text "بسم الله الرحمن الرحيم" in ornate Thuluth script. Gold leaf decorative geometric border. Museum-quality presentation. Warm sepia tones.',
      parameters: { style: 'vintage', aspectRatio: '3:4' },
      resolution: '768x1024',
    },
    evaluationGuidance: 'typography: Arabic letter legibility, correct Thuluth proportions, accurate letterform connections, correct right-to-left baseline. promptAdherence: parchment texture, gold border, warm palette. detail: border ornament complexity, ink stroke variation.',
  },
  {
    testId: 'img-gen-007',
    version: V,
    capability: 'image-generation',
    name: 'Reference Adherence — Minimal Product Shot',
    description: 'Evaluates strict compositional brief adherence for product photography.',
    scoringDimensions: ['promptAdherence', 'photorealism', 'detail', 'resolution'],
    input: {
      prompt: 'Clean product photograph. A single matte black ceramic coffee mug, perfectly centered on a white Carrara marble surface. Soft diffused light from the upper left. Subtle diffuse shadow only directly beneath the mug. No props, no steam, no text, no reflections in the background.',
      parameters: { aspectRatio: '1:1' },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'promptAdherence: strict centering, correct light direction, single shadow only, no extraneous elements. photorealism: ceramic matte finish, marble vein patterns. detail: handle geometry, rim edge sharpness, glaze texture.',
  },
  {
    testId: 'img-gen-008',
    version: V,
    capability: 'image-generation',
    name: 'Fine-Detail Preservation — Embroidered Textile',
    description: 'Evaluates fine pattern consistency and thread-level detail on a complex textile subject.',
    scoringDimensions: ['detail', 'photorealism', 'consistency', 'resolution'],
    input: {
      prompt: 'Studio close-up of an intricately embroidered silk kaftan. Gold and deep navy geometric arabesque pattern. Individual thread texture clearly visible. Flat-lay composition on matte white surface. Even lighting, no shadows.',
      parameters: { aspectRatio: '3:4' },
      resolution: '768x1024',
    },
    evaluationGuidance: 'detail: individual thread visibility and embroidery stitch type differentiation. consistency: pattern regularity and geometric accuracy across the fabric. photorealism: silk sheen, thread dimensionality and shadow under individual stitches.',
  },
];
