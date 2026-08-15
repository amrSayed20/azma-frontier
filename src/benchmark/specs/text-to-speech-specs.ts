import { BenchmarkSpec } from '../benchmark-types';
import { SPEC_VERSIONS } from '../benchmark-version';

const V = SPEC_VERSIONS['text-to-speech'];

// Section 5: intelligibility, naturalness, emotional expression,
// Arabic pronunciation, dialect handling, voice identity consistency,
// latency, usable production quality.

export const TEXT_TO_SPEECH_SPECS: readonly BenchmarkSpec[] = [
  {
    testId: 'tts-001',
    version: V,
    capability: 'text-to-speech',
    name: 'English Naturalness — Narrative Prose',
    description: 'Evaluates prosody, pacing, and naturalness on a descriptive English literary passage.',
    scoringDimensions: ['intelligibility', 'naturalness', 'productionQuality'],
    input: {
      prompt: 'The ancient city rose from the desert floor as if conjured from silence. Its towers, worn smooth by centuries of wind, cast long shadows across the market square where merchants once traded silks and stories in equal measure.',
      parameters: { language: 'en', style: 'narration', speed: 1.0 },
    },
    evaluationGuidance: 'intelligibility: every word clearly articulated. naturalness: sentence rhythm appropriate to literary prose, pause placement at commas and period, no robotic inflection. productionQuality: clean audio, no artifacts, broadcast-ready level.',
  },
  {
    testId: 'tts-002',
    version: V,
    capability: 'text-to-speech',
    name: 'Arabic Pronunciation — Standard Literary Arabic',
    description: 'Evaluates Arabic phoneme accuracy and prosodic correctness on a standard Modern Standard Arabic passage.',
    scoringDimensions: ['intelligibility', 'arabicPronunciation', 'naturalness', 'productionQuality'],
    input: {
      prompt: 'في قلب الصحراء، تقف المدينة القديمة شامخةً كأنها نُسجت من صمت الأزمنة. أبراجها المصقولة بالرياح تُلقي ظلالاً طويلة على الساحة التجارية العريقة.',
      parameters: { language: 'ar', style: 'narration', speed: 1.0 },
    },
    evaluationGuidance: 'arabicPronunciation: correct pharyngeal (ع، ح) production, emphatic consonants (ص، ق، ط), correct long/short vowel distinction, correct shadda doubling. intelligibility: fully comprehensible to a native MSA listener. naturalness: Arabic sentence rhythm and intonation pattern.',
  },
  {
    testId: 'tts-003',
    version: V,
    capability: 'text-to-speech',
    name: 'Emotional Expression — Contrast',
    description: 'Evaluates ability to render clearly contrasting emotional registers within a single passage.',
    scoringDimensions: ['emotionalExpression', 'naturalness', 'intelligibility', 'productionQuality'],
    input: {
      prompt: "We won! The championship is ours — this is the moment everything we worked for has come together! [PAUSE] But today in the stands, we remember Khalid, who could not be here to celebrate with us.",
      parameters: { language: 'en', style: 'expressive', pauseMarker: '[PAUSE]', speed: 1.0 },
    },
    evaluationGuidance: 'emotionalExpression: clear prosodic contrast between the excited first sentence (higher pitch, faster tempo) and the solemn second sentence (lower pitch, slower tempo, quieter). naturalness: smooth emotional transition at [PAUSE] without abrupt discontinuity.',
  },
  {
    testId: 'tts-004',
    version: V,
    capability: 'text-to-speech',
    name: 'Technical Vocabulary — Intelligibility Under Jargon',
    description: 'Evaluates intelligibility on domain-specific compound technical vocabulary.',
    scoringDimensions: ['intelligibility', 'naturalness', 'productionQuality'],
    input: {
      prompt: 'The sovereign orchestration layer integrates constitutional routing with provider-selection telemetry. Each AIProviderAdapter descriptor exposes a costProfile containing inputUnitCost and outputUnitCost denominated in USD.',
      parameters: { language: 'en', style: 'informational', speed: 0.95 },
    },
    evaluationGuidance: 'intelligibility: correct pronunciation of all technical terms (AIProviderAdapter, outputUnitCost, costProfile), correct compound noun stress. naturalness: appropriate emphasis without over-stressing individual tokens.',
  },
  {
    testId: 'tts-005',
    version: V,
    capability: 'text-to-speech',
    name: 'Production Quality — Long-Form Audiobook',
    description: 'Evaluates sustained audio quality, consistency, and prosodic coherence over a multi-sentence passage.',
    scoringDimensions: ['productionQuality', 'intelligibility', 'naturalness', 'emotionalExpression'],
    input: {
      prompt: 'Chapter One: The Departure. It was not the kind of morning that invites hesitation. The air carried the smell of rain that had not yet arrived, and the streets were empty in that particular way that precedes something significant. She checked her bag once, then again, then closed the door behind her. The decision had already been made; what remained was simply the act of beginning.',
      parameters: { language: 'en', style: 'audiobook', speed: 0.98 },
    },
    evaluationGuidance: 'productionQuality: consistent volume, no clicks or breath artifacts, broadcast-ready clarity for the full duration. intelligibility: every sentence clear and unambiguous. naturalness: sustained prosodic coherence from chapter heading to final sentence, appropriate literary reading style.',
  },
];
