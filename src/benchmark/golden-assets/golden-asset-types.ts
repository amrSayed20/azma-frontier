// Section A — versioned, provider-neutral type contracts for all golden benchmark assets.
// No binary content is embedded. Reference material is described and linked by fixtureId.

export type GoldenAssetDomain =
  | 'image-generation'
  | 'image-editing'
  | 'image-upscaling'
  | 'video-generation'
  | 'text-to-speech'
  | 'voice-cloning';

// ready               = specification complete; task runnable today
// blocked             = external material or consent not yet obtained
// pending-authorization = legal/safety review in progress
export type GoldenAssetStatus = 'ready' | 'blocked' | 'pending-authorization';

export type GoldenAssetPermittedUsage =
  | 'benchmark-only'    // internal provider evaluation only; never published
  | 'public-benchmark'; // input may be published alongside results

// Section E — mandatory metadata carried by every golden asset
export interface GoldenAssetMetadata {
  readonly assetId: string;
  readonly assetVersion: string;
  readonly domain: GoldenAssetDomain;
  readonly testId: string;          // links to BenchmarkSpec.testId in the spec registry
  readonly description: string;
  readonly intendedObjective: string;
  readonly permittedUsage: GoldenAssetPermittedUsage;
  readonly status: GoldenAssetStatus;
  readonly blockedReason?: string;  // required when status !== 'ready'
}

// Section B — canonical text prompt for generation-only tasks (image-gen, video-gen)
export interface GoldenPromptAsset extends GoldenAssetMetadata {
  readonly assetType: 'prompt';
  readonly canonicalPrompt: string;    // exact text delivered to every provider
  readonly promptLanguage: string;
  readonly outputDimensions?: string;  // e.g. '1024x1024'
  readonly aspectRatio?: string;
  readonly styleParameters: Readonly<Record<string, unknown>>;
  readonly evaluationDimensions: readonly string[];  // rubric dimensions applicable
  readonly failureConditions: readonly string[];     // outputs these qualities disqualify
}

// Section C — reference image specification for editing and upscaling tasks
// Binary content is never embedded; fixtureId points to BenchmarkReferenceFixture
export interface GoldenReferenceImageAsset extends GoldenAssetMetadata {
  readonly assetType: 'reference-image';
  readonly fixtureId: string;                        // BenchmarkReferenceFixture.fixtureId
  readonly imageDescription: string;
  readonly requiredCharacteristics: readonly string[];
  readonly formatRequirements: Readonly<Record<string, unknown>>;
  readonly editInstruction: string;                  // exact instruction sent to provider
  readonly mustChange: readonly string[];            // regions/elements that must be modified
  readonly mustNotChange: readonly string[];         // regions/elements that must be preserved
  readonly evaluationDimensions: readonly string[];
  readonly acquisitionGuidance: string;
}

// Section D — canonical TTS script; the exact text every TTS provider synthesizes
export interface GoldenTtsScriptAsset extends GoldenAssetMetadata {
  readonly assetType: 'tts-script';
  readonly canonicalScript: string;
  readonly scriptLanguage: string;   // BCP-47 language tag e.g. 'ar', 'ar-EG', 'en'
  readonly dialect?: string;         // free-form e.g. 'Egyptian Arabic (عامية مصرية)'
  readonly deliveryStyle: string;
  readonly estimatedDurationSeconds?: number;
  readonly pronunciationNotes?: string;
  readonly evaluationDimensions: readonly string[];
  readonly failureConditions: readonly string[];
}

// Section F — reference audio specification for voice cloning tasks
// Requires explicit speaker consent; never contains binary audio data in source
export interface GoldenReferenceAudioAsset extends GoldenAssetMetadata {
  readonly assetType: 'reference-audio';
  readonly fixtureId: string;                         // BenchmarkReferenceFixture.fixtureId
  readonly speakerLanguage: string;
  readonly requiredDurationSeconds: number;
  readonly requiredCharacteristics: readonly string[];
  readonly formatRequirements: Readonly<Record<string, unknown>>;
  readonly speakerAuthorizationRequired: true;        // always true; never override
  readonly targetScript: string;                      // the text to synthesize in the cloned voice
  readonly evaluationDimensions: readonly string[];
  readonly acquisitionGuidance: string;
}

export type GoldenAsset =
  | GoldenPromptAsset
  | GoldenReferenceImageAsset
  | GoldenReferenceAudioAsset
  | GoldenTtsScriptAsset;
