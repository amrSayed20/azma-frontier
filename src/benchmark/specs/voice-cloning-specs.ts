import { BenchmarkSpec } from '../benchmark-types';
import { SPEC_VERSIONS } from '../benchmark-version';

const V = SPEC_VERSIONS['voice-cloning'];

// Section 5: voice identity consistency, cloning fidelity, emotional range,
// cross-language capability, production quality.
// All specs require reference audio described in benchmark-fixtures.ts.
// No audio binary content is embedded in source.

export const VOICE_CLONING_SPECS: readonly BenchmarkSpec[] = [
  {
    testId: 'voice-clone-001',
    version: V,
    capability: 'voice-cloning',
    name: 'Voice Identity — Reference Fidelity',
    description: 'Evaluates how closely the cloned voice matches the reference speaker identity on new text.',
    scoringDimensions: ['voiceIdentityConsistency', 'cloningFidelity', 'intelligibility', 'productionQuality'],
    input: {
      prompt: 'Using the reference speaker voice, generate: "The sound of the ocean on a clear morning is unlike anything else in the world. It reminds you that some things remain constant, even when everything around you is not."',
      referenceDescription: 'ref-audio-neutral-en-v1: 30-second clean neutral-register English recording of the reference speaker.',
      parameters: { language: 'en', style: 'conversational', referenceRequired: true },
    },
    evaluationGuidance: 'voiceIdentityConsistency: pitch range, timbre, resonance, and speaking rhythm match the reference. cloningFidelity: perceptual similarity to reference speaker on new text. intelligibility: clear articulation of every word in the target text. productionQuality: clean audio, no synthesis artifacts.',
  },
  {
    testId: 'voice-clone-002',
    version: V,
    capability: 'voice-cloning',
    name: 'Cross-Language Voice Transfer',
    description: 'Evaluates voice identity preservation when the cloned voice speaks Arabic from an English reference.',
    scoringDimensions: ['voiceIdentityConsistency', 'cloningFidelity', 'arabicPronunciation', 'productionQuality'],
    input: {
      prompt: 'Using the reference speaker voice (English-language reference), generate the following in Arabic: "مرحباً بكم في الإمبراطورية السيادية. نسعى دائماً نحو التميز والإبداع في كل ما نقدمه."',
      referenceDescription: 'ref-audio-neutral-en-for-cross-language-v1: Same 30-second English recording as ref-audio-neutral-en-v1, used here for cross-language transfer evaluation.',
      parameters: { language: 'ar', style: 'formal', referenceLanguage: 'en', referenceRequired: true },
    },
    evaluationGuidance: 'voiceIdentityConsistency: recognizable vocal characteristics (pitch, timbre) preserved across the language change. arabicPronunciation: correct pharyngeal consonants, emphatic sounds, long/short vowel distinction. cloningFidelity: perceptual similarity to reference speaker despite the cross-language challenge.',
  },
  {
    testId: 'voice-clone-003',
    version: V,
    capability: 'voice-cloning',
    name: 'Emotional Range — Cloned Voice',
    description: 'Evaluates emotional expression range while the cloned voice maintains speaker identity.',
    scoringDimensions: ['emotionalExpression', 'voiceIdentityConsistency', 'cloningFidelity', 'naturalness'],
    input: {
      prompt: 'Using the reference speaker voice, generate two separate audio clips. Clip A (excited): "The results are in — we have achieved something extraordinary, and every one of you is part of this." Clip B (solemn): "We face a significant challenge. It will require our full focus and commitment over the coming months."',
      referenceDescription: 'ref-audio-neutral-en-v1: 30-second clean neutral-register English recording of the reference speaker.',
      parameters: { language: 'en', emotionalVariants: ['excited', 'solemn'], referenceRequired: true },
    },
    evaluationGuidance: 'emotionalExpression: clear prosodic contrast between Clip A (faster, higher pitch, louder) and Clip B (slower, lower pitch, quieter). voiceIdentityConsistency: speaker identity recognizable in both clips. naturalness: emotional rendering sounds authentic, not exaggerated.',
  },
  {
    testId: 'voice-clone-004',
    version: V,
    capability: 'voice-cloning',
    name: 'Production Quality — Long-Form Narration',
    description: 'Evaluates sustained voice quality and identity stability over a longer cloned narration passage.',
    scoringDimensions: ['productionQuality', 'voiceIdentityConsistency', 'intelligibility', 'naturalness'],
    input: {
      prompt: 'Using the reference speaker voice, generate: "The architecture of ambition is rarely visible from the outside. What appears as sudden success is almost always the final frame of a long, quiet effort — years of decisions made in private, without applause, without witnesses. The foundation is always invisible."',
      referenceDescription: 'ref-audio-neutral-en-v1: 30-second clean neutral-register English recording of the reference speaker.',
      parameters: { language: 'en', style: 'narration', referenceRequired: true },
    },
    evaluationGuidance: 'productionQuality: consistent volume, no synthesis artifacts, no glitches, broadcast-ready audio throughout the full passage. voiceIdentityConsistency: stable vocal character from first word to last. naturalness: smooth, literary narration pacing appropriate to the content.',
  },
];
