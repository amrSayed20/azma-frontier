import type { GoldenReferenceAudioAsset } from './golden-asset-types';

const V = '1.0.0';

// Golden reference audio assets for all voice-cloning benchmark specs.
// Status: 'blocked' for all assets — explicit speaker authorization is required
// before any reference audio can be acquired or used. No binary audio is stored
// in source. No real person's voice may be used without written consent.
// These assets define WHAT is needed once authorization is obtained.

const BLOCKED_REASON =
  'No authorized reference speaker obtained. Requires explicit written consent from the speaker for benchmark evaluation use. Do not proceed until consent is documented and on file.';

export const VOICE_CLONING_GOLDEN_ASSETS: readonly GoldenReferenceAudioAsset[] = [
  {
    assetId: 'ga-voice-clone-001',
    assetVersion: V,
    domain: 'voice-cloning',
    testId: 'voice-clone-001',
    description: 'Reference audio specification for voice identity fidelity evaluation (English, neutral register)',
    intendedObjective: 'Measure how closely a cloned voice matches the reference speaker identity when generating new English text: pitch range, timbre, resonance, and speaking rhythm all evaluated.',
    permittedUsage: 'benchmark-only',
    status: 'blocked',
    blockedReason: BLOCKED_REASON,
    assetType: 'reference-audio',
    fixtureId: 'ref-audio-neutral-en-v1',
    speakerLanguage: 'en',
    requiredDurationSeconds: 30,
    requiredCharacteristics: [
      'Single adult speaker throughout — no speaker changes',
      'Neutral conversational register — no strong emotional performance',
      'Studio-quality recording: noise floor below -60 dBFS',
      'No background music, room reverb, or processing applied',
      'Natural speech rhythm — not read in an unnaturally slow or deliberate cadence',
    ],
    formatRequirements: { format: 'WAV', sampleRate: 44100, bitDepth: 16, channels: 1, durationSeconds: 30, maxFileSizeMB: 5 },
    speakerAuthorizationRequired: true,
    targetScript: 'The sound of the ocean on a clear morning is unlike anything else in the world. It reminds you that some things remain constant, even when everything around you is not.',
    evaluationDimensions: ['quality', 'consistency', 'realism', 'usefulness'],
    acquisitionGuidance: 'Obtain written consent from a willing speaker for benchmark evaluation purposes only. Record in a quiet room (below -60 dBFS noise floor) at 44100 Hz, 16-bit mono WAV. Clip to exactly 30 seconds. No processing. Store the consent document alongside the audio file. This same speaker must be used consistently across all voice-cloning golden assets.',
  },
  {
    assetId: 'ga-voice-clone-002',
    assetVersion: V,
    domain: 'voice-cloning',
    testId: 'voice-clone-002',
    description: 'Reference audio specification for cross-language voice transfer evaluation (English reference → Arabic output)',
    intendedObjective: 'Measure preservation of recognizable vocal characteristics (pitch, timbre) across a language boundary: English reference speaker identity survives in Arabic output.',
    permittedUsage: 'benchmark-only',
    status: 'blocked',
    blockedReason: BLOCKED_REASON,
    assetType: 'reference-audio',
    fixtureId: 'ref-audio-neutral-en-for-cross-language-v1',
    speakerLanguage: 'en',
    requiredDurationSeconds: 30,
    requiredCharacteristics: [
      'Same speaker as ref-audio-neutral-en-v1 (same recording session if possible)',
      'Identical quality requirements: neutral register, -60 dBFS noise floor, no processing',
      'May use the same WAV file as ref-audio-neutral-en-v1 — this fixture is listed separately only to document the cross-language dependency',
    ],
    formatRequirements: { format: 'WAV', sampleRate: 44100, bitDepth: 16, channels: 1, durationSeconds: 30, maxFileSizeMB: 5 },
    speakerAuthorizationRequired: true,
    targetScript: 'مرحباً بكم في الإمبراطورية السيادية. نسعى دائماً نحو التميز والإبداع في كل ما نقدمه.',
    evaluationDimensions: ['quality', 'consistency', 'realism', 'usefulness'],
    acquisitionGuidance: 'Use the same speaker and the same recording as ref-audio-neutral-en-v1. Consent obtained for ref-audio-neutral-en-v1 covers this fixture if the recording is shared. Store both under separate fixture identifiers but point them to the same physical file in the asset store.',
  },
  {
    assetId: 'ga-voice-clone-003',
    assetVersion: V,
    domain: 'voice-cloning',
    testId: 'voice-clone-003',
    description: 'Reference audio specification for emotional range evaluation in a cloned voice',
    intendedObjective: 'Measure whether a cloned voice can express two distinct emotional registers (excited vs. solemn) while maintaining speaker identity across both.',
    permittedUsage: 'benchmark-only',
    status: 'blocked',
    blockedReason: BLOCKED_REASON,
    assetType: 'reference-audio',
    fixtureId: 'ref-audio-neutral-en-v1',
    speakerLanguage: 'en',
    requiredDurationSeconds: 30,
    requiredCharacteristics: [
      'Same speaker as ref-audio-neutral-en-v1',
      'Neutral delivery in reference — emotional range is tested in the generated output, not the reference',
    ],
    formatRequirements: { format: 'WAV', sampleRate: 44100, bitDepth: 16, channels: 1, durationSeconds: 30, maxFileSizeMB: 5 },
    speakerAuthorizationRequired: true,
    targetScript: 'Clip A (excited): "The results are in — we have achieved something extraordinary, and every one of you is part of this." Clip B (solemn): "We face a significant challenge. It will require our full focus and commitment over the coming months."',
    evaluationDimensions: ['quality', 'consistency', 'realism', 'usefulness'],
    acquisitionGuidance: 'Same recording as ref-audio-neutral-en-v1. Consent obtained for that fixture covers this asset. Two separate output audio clips are expected from the provider: Clip A (excited delivery) and Clip B (solemn delivery). Both are evaluated for voice identity consistency and emotional contrast.',
  },
  {
    assetId: 'ga-voice-clone-004',
    assetVersion: V,
    domain: 'voice-cloning',
    testId: 'voice-clone-004',
    description: 'Reference audio specification for long-form narration stability evaluation in a cloned voice',
    intendedObjective: 'Measure sustained voice quality consistency and speaker identity stability over an extended narration — evaluating whether cloned identity drifts over sentence count.',
    permittedUsage: 'benchmark-only',
    status: 'blocked',
    blockedReason: BLOCKED_REASON,
    assetType: 'reference-audio',
    fixtureId: 'ref-audio-neutral-en-v1',
    speakerLanguage: 'en',
    requiredDurationSeconds: 30,
    requiredCharacteristics: [
      'Same speaker as ref-audio-neutral-en-v1',
      'Consistent quality across the full 30 seconds — no volume or tone variation in reference itself',
    ],
    formatRequirements: { format: 'WAV', sampleRate: 44100, bitDepth: 16, channels: 1, durationSeconds: 30, maxFileSizeMB: 5 },
    speakerAuthorizationRequired: true,
    targetScript: 'The architecture of ambition is rarely visible from the outside. What appears as sudden success is almost always the final frame of a long, quiet effort — years of decisions made in private, without applause, without witnesses. The foundation is always invisible.',
    evaluationDimensions: ['quality', 'consistency', 'realism', 'usefulness'],
    acquisitionGuidance: 'Same recording as ref-audio-neutral-en-v1. Consent obtained for that fixture covers this asset. The output narration is expected to be approximately 20–25 seconds. Evaluate consistency across the full duration rather than just the opening sentence.',
  },
];
