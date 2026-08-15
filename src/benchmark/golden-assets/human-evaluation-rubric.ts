import type { GoldenAssetDomain } from './golden-asset-types';

// Section 9 — Human Evaluation Rubric
// Provider-neutral form for manual output scoring.
// Evaluators must not know which provider produced the output being scored.
// Each dimension is scored independently on a 1–5 integer scale.
// No automatic AI evaluator at this stage — human judgment only.

export interface RubricAnchor {
  readonly score: 1 | 2 | 3 | 4 | 5;
  readonly label: string;
  readonly description: string;
}

export interface EvaluationDimension {
  readonly dimensionId: string;
  readonly displayName: string;
  readonly description: string;
  readonly applicableDomains: readonly GoldenAssetDomain[];
  readonly anchors: readonly RubricAnchor[];
}

export interface HumanEvaluationForm {
  readonly formId: string;
  readonly formVersion: string;
  readonly instructions: string;
  readonly providerBlindNote: string;
  readonly dimensions: readonly EvaluationDimension[];
}

// The seven evaluation dimensions required by the directive.
// applicableDomains controls which dimensions appear on the form for a given task.

export const EVALUATION_DIMENSIONS: readonly EvaluationDimension[] = [
  {
    dimensionId: 'quality',
    displayName: 'Overall Quality',
    description: 'The overall visual or audio quality of the output: absence of artifacts, production polish, and readiness for professional use.',
    applicableDomains: ['image-generation', 'image-editing', 'image-upscaling', 'video-generation', 'text-to-speech', 'voice-cloning'],
    anchors: [
      { score: 1, label: 'Unusable', description: 'Severe artifacts, distortion, or degradation. Completely unusable even for reference purposes.' },
      { score: 2, label: 'Poor', description: 'Notable quality defects visible throughout. Requires extensive post-processing to be useful.' },
      { score: 3, label: 'Acceptable', description: 'Adequate quality for ideation or draft use. Some artifacts or inconsistencies present but not severe.' },
      { score: 4, label: 'Good', description: 'Production-ready with minor imperfections. Creator-usable with light touch-up.' },
      { score: 5, label: 'Excellent', description: 'Broadcast or publication quality. No meaningful defects visible under standard review conditions.' },
    ],
  },
  {
    dimensionId: 'promptAdherence',
    displayName: 'Prompt Adherence',
    description: 'How precisely the output follows all specified requirements: elements present, constraints respected, and negative conditions (e.g., "no text", "no people") obeyed.',
    applicableDomains: ['image-generation', 'image-editing', 'image-upscaling', 'video-generation', 'text-to-speech', 'voice-cloning'],
    anchors: [
      { score: 1, label: 'Non-Compliant', description: 'Core prompt requirements missing or fundamentally wrong. The output does not address the task.' },
      { score: 2, label: 'Partial', description: 'Some required elements present but key constraints violated or missing.' },
      { score: 3, label: 'Moderate', description: 'Main elements present and roughly correct. Secondary requirements imprecise or partially honored.' },
      { score: 4, label: 'High', description: 'All primary requirements met correctly. Minor imprecision in secondary or stylistic requirements only.' },
      { score: 5, label: 'Exact', description: 'All specified elements, constraints, and negative conditions precisely honored. No deviation.' },
    ],
  },
  {
    dimensionId: 'detail',
    displayName: 'Fine Detail',
    description: 'The quality and accuracy of fine-grained elements: individual textures, micro-structures, type legibility, hair strands, gear teeth, thread stitches — as applicable to the task.',
    applicableDomains: ['image-generation', 'image-editing', 'image-upscaling', 'video-generation', 'text-to-speech', 'voice-cloning'],
    anchors: [
      { score: 1, label: 'None', description: 'No discernible fine detail. Surface appears smooth or uniformly blurred at close inspection.' },
      { score: 2, label: 'Limited', description: 'Major fine-structure elements absent or heavily degraded. Detail visible only at very coarse level.' },
      { score: 3, label: 'Adequate', description: 'Primary detail elements resolved. Micro-detail inconsistent or absent in places.' },
      { score: 4, label: 'Good', description: 'Most fine-structure detail visible and accurate. Isolated areas lack precision.' },
      { score: 5, label: 'Exceptional', description: 'Fine-grain elements clearly resolved: individual threads, hair strands, gear teeth, letterform strokes — as specified in the task.' },
    ],
  },
  {
    dimensionId: 'consistency',
    displayName: 'Internal Consistency',
    description: 'Coherence of lighting direction, color temperature, perspective, and visual grammar throughout the full output — no internal contradictions.',
    applicableDomains: ['image-generation', 'image-editing', 'image-upscaling', 'video-generation'],
    anchors: [
      { score: 1, label: 'Incoherent', description: 'Lighting, perspective, or color contradictions visible in most regions. Output appears composited from inconsistent parts.' },
      { score: 2, label: 'Major Issues', description: 'Clear consistency failures in one or more key areas (e.g., contradictory light directions, broken perspective).' },
      { score: 3, label: 'Generally Consistent', description: 'Mostly coherent with isolated contradictions that a non-specialist might miss.' },
      { score: 4, label: 'Consistent', description: 'Strong coherence throughout. Minor tension in at most one region.' },
      { score: 5, label: 'Fully Coherent', description: 'Lighting, color, and perspective form a completely unified whole. No inconsistencies.' },
    ],
  },
  {
    dimensionId: 'realism',
    displayName: 'Physical Realism',
    description: 'Perceptual plausibility of the output: does it obey the physical laws implied by the task (gravity, material properties, fluid dynamics, anatomical proportions)?',
    applicableDomains: ['image-generation', 'image-editing', 'image-upscaling', 'video-generation', 'text-to-speech', 'voice-cloning'],
    anchors: [
      { score: 1, label: 'Implausible', description: 'Clearly synthetic with obvious violations of physical reality. No attempt at plausibility.' },
      { score: 2, label: 'Major Failures', description: 'Physical implausibilities are immediately obvious (floating objects, impossible anatomical proportions, material contradiction).' },
      { score: 3, label: 'Plausible at a Glance', description: 'Appears real under casual viewing. Fails inspection at medium distance or over time.' },
      { score: 4, label: 'Realistic', description: 'Consistently plausible. Occasional minor detail that breaks strict physical reality under close inspection.' },
      { score: 5, label: 'Fully Plausible', description: 'Indistinguishable from a real-world capture (photograph, recording) in the relevant modality under normal review conditions.' },
    ],
  },
  {
    dimensionId: 'editingFidelity',
    displayName: 'Editing Fidelity',
    description: 'For editing and upscaling tasks: how faithfully all regions outside the specified edit mask or enhancement target are preserved. Not applicable to pure generation tasks.',
    applicableDomains: ['image-editing', 'image-upscaling', 'voice-cloning'],
    anchors: [
      { score: 1, label: 'Failed Preservation', description: 'Large regions outside the edit target are significantly modified or destroyed.' },
      { score: 2, label: 'Poor', description: 'Multiple unintended regions changed. Minimal fidelity to the source in unedited areas.' },
      { score: 3, label: 'Partial', description: 'Most unintended regions preserved. Some unwanted modifications visible in secondary areas.' },
      { score: 4, label: 'Good', description: 'Unintended regions preserved with high fidelity. Isolated minor unintended change in a non-critical area only.' },
      { score: 5, label: 'Exact Preservation', description: 'All elements outside the edit mask or target region are pixel-identical (or perceptually identical) to the source. No unwanted modifications.' },
    ],
  },
  {
    dimensionId: 'usefulness',
    displayName: 'Creator Usefulness',
    description: 'Would a working creator use this output in a real project? Integrates quality, adherence, and practical usability into a single production-readiness verdict.',
    applicableDomains: ['image-generation', 'image-editing', 'image-upscaling', 'video-generation', 'text-to-speech', 'voice-cloning'],
    anchors: [
      { score: 1, label: 'Discard', description: 'No use case; would be discarded immediately and the generation retried.' },
      { score: 2, label: 'Prototype Only', description: 'Usable only as a rough concept sketch. Would never appear in any deliverable.' },
      { score: 3, label: 'Conditional', description: 'Useful for internal review or low-fidelity mockup. Not suitable for client-facing or final production.' },
      { score: 4, label: 'Production-Ready', description: 'Usable in a final deliverable with light or no touch-up. A real creator would use this.' },
      { score: 5, label: 'Immediately Deployable', description: 'Zero post-processing needed. Could be delivered as-is to a client or published directly.' },
    ],
  },
];

export const HUMAN_EVALUATION_FORM: HumanEvaluationForm = {
  formId: 'sovereign-benchmark-human-eval-v1',
  formVersion: '1.0.0',
  instructions: [
    'Score each applicable dimension independently using the 1–5 scale.',
    'Read the task specification before scoring: what was the provider asked to do?',
    'Score what you see, not what you imagine the provider intended.',
    'Do not allow your opinion of one dimension to influence your score on another.',
    'If a dimension is marked N/A for this domain, skip it.',
    'Submit a brief written note for any score of 1 or 5 explaining the rationale.',
  ].join('\n'),
  providerBlindNote: 'IMPORTANT: You must not know which provider produced the output you are scoring. If the provider identity is visible (watermarks, file metadata, filename), report it to the benchmark coordinator and await de-identification before scoring.',
  dimensions: EVALUATION_DIMENSIONS,
};

// Convenience: look up which dimensions apply to a given domain
export function getDimensionsForDomain(domain: GoldenAssetDomain): readonly EvaluationDimension[] {
  return EVALUATION_DIMENSIONS.filter((d) => d.applicableDomains.includes(domain));
}
