/**
 * AZMA OS — SOVEREIGN CHAMBER MANIFEST
 * Constitutional Chamber Declarations
 *
 * Five honest Sovereign Chamber Manifests — one for every constitutional
 * chamber that is frozen and production-ready for the First Launch.
 *
 * Honesty rules:
 * - Only production-wired capabilities are listed.
 * - Nothing theoretical, reserved, or UI-only.
 * - Each 'capabilityId' cross-references the Sovereign Capability Diwan
 *   (src/sovereign-capability/diwan.ts) where the governance record
 *   exists. New IDs that are real but not yet in the Diwan are valid —
 *   the Manifest may declare production truth before the Diwan completes
 *   its certification process.
 * - constitutionalResponsibility quotes the CONTEXT_ROLES declaration
 *   from src/core/tongue/constitution.ts verbatim — that is the
 *   canonical source of each chamber's constitutional identity.
 */

import type { SovereignChamberManifest } from './types';

// ── Sovereign Vault Palace ─────────────────────────────────────────────────
// The Creator's permanent storage. Guards everything that endures.
// Production APIs: GET /api/vault/assets, POST /api/vault/assets/upload,
//   /generate-speech, /clone-voice, /import-subtitles

const SOVEREIGN_VAULT_PALACE_MANIFEST: SovereignChamberManifest = {
  chamberId: 'sovereign-vault-palace',
  constitutionalName: 'القصر السيادي — Sovereign Vault Palace',
  constitutionalResponsibility:
    'It protects. The Palace consciousness guards what endures.',
  capabilities: [
    {
      capabilityId: 'vault-list-assets',
      displayName: 'Browse Stored Assets',
      purpose:
        'Returns every asset the Creator owns, scoped to their tenant identity, for browsing in the Palace.',
      requiredInputs: [],
      optionalInputs: [],
      outputType: 'Array of VaultAsset records with metadata',
      preconditions: ['Creator is authenticated'],
      failureConditions: ['Session is invalid or expired'],
      interactionModes: ['browse'],
      operatingModes: ['explorer'],
    },
    {
      capabilityId: 'vault-upload-asset',
      displayName: 'Upload an Asset',
      purpose:
        'Accepts a binary file and stores it as a permanent Vault asset under the Creator\'s identity.',
      requiredInputs: [
        { name: 'file', type: 'file', description: 'The binary file to store' },
        { name: 'assetType', type: 'selection', description: 'Asset type: audio, image, subtitle, document' },
      ],
      optionalInputs: [
        { name: 'label', type: 'text', description: 'Human-readable label for the asset' },
      ],
      outputType: 'VaultAsset record with assigned assetId',
      preconditions: ['Creator is authenticated', 'File size within platform limits'],
      failureConditions: ['File too large', 'Unsupported file type', 'Storage limit reached'],
      interactionModes: ['browse'],
      operatingModes: ['guided', 'explorer'],
    },
    {
      capabilityId: 'vault-generate-speech-asset',
      displayName: 'Generate a Speech Asset',
      purpose:
        'Converts text to speech using the Creator\'s chosen voice and stores the resulting audio as a Vault asset.',
      requiredInputs: [
        { name: 'text', type: 'text', description: 'The text to convert to speech' },
        { name: 'voiceId', type: 'identifier', description: 'The Vault asset ID of the voice to use' },
      ],
      optionalInputs: [],
      outputType: 'VaultAsset record referencing the generated audio file',
      preconditions: ['Creator is authenticated', 'Referenced voice asset exists and is owned by this Creator'],
      failureConditions: ['Voice asset not found', 'TTS provider unavailable', 'Text too long for single request'],
      interactionModes: ['write'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'vault-clone-voice-asset',
      displayName: 'Clone a Voice',
      purpose:
        'Creates a cloned voice model from an uploaded audio sample and stores it as a Vault asset the Creator may use for speech generation.',
      requiredInputs: [
        { name: 'audioSample', type: 'file', description: 'Audio file of the voice to clone' },
      ],
      optionalInputs: [
        { name: 'voiceName', type: 'text', description: 'Name for the cloned voice model' },
      ],
      outputType: 'VaultAsset record referencing the cloned voice model',
      preconditions: ['Creator is authenticated', 'Audio sample meets minimum quality requirements'],
      failureConditions: ['Audio sample too short or too noisy', 'Voice cloning provider unavailable'],
      interactionModes: ['browse'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'vault-import-subtitles-asset',
      displayName: 'Import a Subtitle File',
      purpose:
        'Accepts a subtitle file and stores it as a Vault asset that can be assigned to a production node.',
      requiredInputs: [
        { name: 'subtitleFile', type: 'file', description: 'Subtitle file in SRT or VTT format' },
      ],
      optionalInputs: [],
      outputType: 'VaultAsset record referencing the subtitle file',
      preconditions: ['Creator is authenticated'],
      failureConditions: ['Invalid subtitle format', 'File could not be parsed'],
      interactionModes: ['browse'],
      operatingModes: ['guided'],
    },
  ],
  boundary: {
    canDo: [
      'Store, retrieve, and serve binary assets on behalf of a single Creator',
      'Accept uploads from the Creator directly (audio, image, subtitle, document)',
      'Produce speech audio from text using an assigned voice',
      'Produce a cloned voice model from an audio sample',
      'Guard all stored assets with Creator-scoped tenancy — one Creator cannot access another\'s',
    ],
    cannotDo: [
      'Transform or edit the content of a stored asset',
      'Generate images — image generation belongs to Qiyamah',
      'Produce cinematic direction or assembly — that belongs to Ras Al Amr',
      'Evaluate or reason about the quality of stored content',
    ],
    delegates: [
      { to: 'qiyamah-chamber', reason: 'Image generation is Qiyamah\'s constitutional responsibility' },
      { to: 'ras-amr', reason: 'Assembling stored assets into a production is Ras Al Amr\'s responsibility' },
    ],
  },
};

// ── Hujjah Al-Damighah ────────────────────────────────────────────────────
// The Empire's knowledge court. Reasons through evidence to a verdict.
// Production: full 7-stage constitutional chain
//   (Reception → Understanding → Investigation → Evidence →
//    Knowledge → Response → Export) via Server Action.
// Constitutionally frozen after commit a2e8632.

const HUJJAH_AL_DAMIGHAH_MANIFEST: SovereignChamberManifest = {
  chamberId: 'hujjah-al-damighah',
  constitutionalName: 'حجة الدامغة — Hujjah Al-Damighah',
  constitutionalResponsibility:
    'It reasons. The Hujjah consciousness builds the argument methodically.',
  capabilities: [
    {
      capabilityId: 'hujjah-investigate-a-question',
      displayName: 'Investigate a Question',
      purpose:
        'Accepts a question within a chosen knowledge domain and runs the full constitutional investigation chain, returning a collection of evidence items with confidence scores.',
      requiredInputs: [
        { name: 'query', type: 'text', description: 'The question or claim to investigate' },
        { name: 'category', type: 'selection', description: 'Knowledge domain (e.g. science, history, law, business, media, technology, philosophy, economics)' },
      ],
      optionalInputs: [],
      outputType:
        'InvestigationDTO: evidence items (text, context window, confidence score), total sources scanned, average evidence score',
      preconditions: ['Creator is authenticated', 'Query is non-empty'],
      failureConditions: [
        'Query rejected at the reception boundary (empty or malformed)',
        'Understanding stage cannot classify the inquiry type',
        'All knowledge providers are unavailable',
        'Session is invalid or expired',
      ],
      interactionModes: ['write', 'listen'],
      operatingModes: ['guided', 'explorer'],
    },
  ],
  boundary: {
    canDo: [
      'Accept a natural-language question and return evidence from real knowledge sources',
      'Run the full 7-stage constitutional investigation chain on every query',
      'Persist investigation results linked to a goal when invoked from Makman Al-Ghayah',
      'Support the Creator in three interaction modes: conversation, writing, and silent',
    ],
    cannotDo: [
      'Generate images or media — that belongs to Qiyamah',
      'Direct a production or manage creative assets — that belongs to Ras Al Amr',
      'Set goals or track purpose — that belongs to Makman Al-Ghayah',
      'Expose which knowledge providers or repositories supplied the evidence (Knowledge Source Abstraction Principle)',
      'Return a verdict without real evidence — honest null is returned when evidence is unavailable',
    ],
    delegates: [
      { to: 'sovereign-vault-palace', reason: 'Storing investigation results as permanent Vault assets' },
      { to: 'makman-al-ghayah', reason: 'Goal-linked investigation persistence is initiated by Makman' },
    ],
  },
};

// ── Qiyamah Chamber ────────────────────────────────────────────────────────
// The Empire's creative generation chamber. Gives form to imagination.
// Production: OpenAI gpt-image-1 behind billing gate.
//   Real route: POST /api/qiyamah/generate, GET /api/qiyamah/generations.

const QIYAMAH_CHAMBER_MANIFEST: SovereignChamberManifest = {
  chamberId: 'qiyamah-chamber',
  constitutionalName: 'حجرة القيامة — Qiyamah Chamber',
  constitutionalResponsibility:
    'It creates. The Qiyamah consciousness gives form to what the citizen imagines.',
  capabilities: [
    {
      capabilityId: 'qiyamah-generate-image',
      displayName: 'Generate an Image',
      purpose:
        'Accepts a text prompt and an optional visual style, generates an image via the platform\'s image provider, saves it to local storage, records the generation in the database, and deposits the resulting asset into the Creator\'s Sovereign Vault.',
      requiredInputs: [
        { name: 'prompt', type: 'text', description: 'What to create — the creative intention in natural language' },
      ],
      optionalInputs: [
        { name: 'style', type: 'selection', description: 'Visual style: vivid or natural' },
        { name: 'size', type: 'selection', description: 'Output dimensions: 1024x1024, 1792x1024, or 1024x1792' },
      ],
      outputType:
        'GenerationRecord: assetId in Vault, file path, prompt, style, dimensions, timestamp',
      preconditions: [
        'Creator is authenticated',
        'Creator has an active Stripe subscription OR role is founder',
        'OPENAI_API_KEY environment variable is present',
      ],
      failureConditions: [
        'No active subscription (402 Payment Required)',
        'Session is invalid or expired (401 Unauthorized)',
        'Image provider unavailable or rate-limited',
        'Prompt violates content policy',
      ],
      interactionModes: ['write', 'listen'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'qiyamah-list-generations',
      displayName: 'List Past Generations',
      purpose:
        'Returns every image generation record associated with the authenticated Creator, in reverse chronological order.',
      requiredInputs: [],
      optionalInputs: [],
      outputType: 'Array of GenerationRecord (assetId, prompt, style, createdAt)',
      preconditions: ['Creator is authenticated'],
      failureConditions: ['Session is invalid or expired'],
      interactionModes: ['browse'],
      operatingModes: ['explorer'],
    },
  ],
  boundary: {
    canDo: [
      'Generate images from natural-language prompts using the platform\'s approved image provider',
      'Record every generation in the database and deposit the result into the Creator\'s Vault',
      'Surface the Creator\'s past generations for review',
      'Gate generation behind an active subscription for Creator-role accounts',
    ],
    cannotDo: [
      'Generate video, audio, or text — only images are currently produced here',
      'Store results outside the Creator\'s own Vault tenancy',
      'Bypass the subscription gate for Creator-role accounts',
      'Perform knowledge investigation or evidence collection — that belongs to Hujjah',
    ],
    delegates: [
      { to: 'sovereign-vault-palace', reason: 'Every generated image is deposited into the Creator\'s Vault' },
    ],
  },
};

// ── Ras Al Amr ────────────────────────────────────────────────────────────
// The Sovereign Assembly Chamber. Governs cinematic direction and production.
// Production: Canvas CRUD + compile-to-assembly route.
//   Routes: GET/POST /api/ras-amr/canvas,
//           GET/PUT /api/ras-amr/canvas/[canvasId],
//           GET /api/ras-amr/resolution/[operationId],
//           POST /api/sovereign/entry/ras-al-amr/compile

const RAS_AL_AMR_MANIFEST: SovereignChamberManifest = {
  chamberId: 'ras-amr',
  constitutionalName: 'رأس الأمر — Ras Al Amr',
  constitutionalResponsibility:
    'It governs. The Ras Al-Amr consciousness speaks with sovereign authority.',
  capabilities: [
    {
      capabilityId: 'ras-amr-create-direction-canvas',
      displayName: 'Create a Direction Canvas',
      purpose:
        'Opens a new persistent canvas that the Director (Manual or Automatic) may use to build a multi-node cinematic production.',
      requiredInputs: [],
      optionalInputs: [
        { name: 'title', type: 'text', description: 'Optional working title for the canvas' },
      ],
      outputType: 'Canvas record with canvasId and initial empty node list',
      preconditions: ['Creator is authenticated'],
      failureConditions: ['Session is invalid or expired', 'Persistent storage unavailable'],
      interactionModes: ['browse'],
      operatingModes: ['guided', 'explorer'],
    },
    {
      capabilityId: 'ras-amr-read-direction-canvas',
      displayName: 'Read Direction Canvas State',
      purpose:
        'Returns the current state of an existing canvas: all nodes, their assigned voices and speech assets, and the canvas metadata.',
      requiredInputs: [
        { name: 'canvasId', type: 'identifier', description: 'The canvas to retrieve' },
      ],
      optionalInputs: [],
      outputType: 'Canvas record with full node list and all node metadata',
      preconditions: [
        'Creator is authenticated',
        'Canvas with canvasId exists and belongs to this Creator',
      ],
      failureConditions: ['Canvas not found', 'Canvas belongs to a different Creator'],
      interactionModes: ['browse'],
      operatingModes: ['guided', 'explorer'],
    },
    {
      capabilityId: 'ras-amr-update-direction-canvas',
      displayName: 'Update Direction Canvas',
      purpose:
        'Applies a new Directive from the Manual or Automatic Director to the canvas, mutating node state non-destructively.',
      requiredInputs: [
        { name: 'canvasId', type: 'identifier', description: 'The canvas to update' },
        { name: 'directive', type: 'text', description: 'The Director\'s instruction payload (structured JSON directive)' },
      ],
      optionalInputs: [],
      outputType: 'Updated canvas record reflecting the applied directive',
      preconditions: [
        'Creator is authenticated',
        'Canvas with canvasId exists and belongs to this Creator',
      ],
      failureConditions: [
        'Directive is malformed or violates canvas mutation rules',
        'Canvas not found',
      ],
      interactionModes: ['write'],
      operatingModes: ['guided', 'explorer'],
    },
    {
      capabilityId: 'ras-amr-compile-production-into-assembly',
      displayName: 'Compile Canvas into Assembly',
      purpose:
        'Runs the Assembly Runtime over the canvas, verifying every referenced Vault asset is owned by this Creator, then produces a locked, publish-ready assembly from the canvas nodes.',
      requiredInputs: [
        { name: 'canvasId', type: 'identifier', description: 'The canvas to compile' },
      ],
      optionalInputs: [],
      outputType: 'CompiledAssemblyGraph: locked assembly with all node tracks resolved',
      preconditions: [
        'Creator is authenticated',
        'Canvas is non-empty',
        'All referenced Vault assets are owned by this Creator',
      ],
      failureConditions: [
        'Canvas is empty — nothing to compile',
        'One or more referenced assets are missing or not owned by this Creator',
        'Assembly Runtime encounters a track conflict',
      ],
      interactionModes: ['browse'],
      operatingModes: ['guided'],
    },
  ],
  boundary: {
    canDo: [
      'Create, read, and update persistent cinematic direction canvases',
      'Accept directives from both the Manual Director (Creator-driven) and the Automatic Director (AI-driven)',
      'Compile a canvas into a locked, publish-ready assembly',
      'Assign voices from the Voice Library to individual canvas nodes',
      'Verify Vault asset ownership before allowing any asset into a compiled assembly',
    ],
    cannotDo: [
      'Generate images — that belongs to Qiyamah',
      'Store raw assets — binary storage belongs to the Sovereign Vault Palace',
      'Assess creative goals or track purpose — that belongs to Makman Al-Ghayah',
      'Conduct knowledge investigation — that belongs to Hujjah Al-Damighah',
      'Publish or distribute a completed production — distribution belongs to Makman Al-Ghayah',
    ],
    delegates: [
      { to: 'sovereign-vault-palace', reason: 'All binary assets (voice, audio, image) are retrieved from the Vault' },
      { to: 'makman-al-ghayah', reason: 'Distribution and goal-fulfillment assessment after compilation' },
    ],
  },
};

// ── Makman Al-Ghayah ──────────────────────────────────────────────────────
// The Sovereign Purpose Chamber. Reads patterns, defines goals, assesses
// fulfillment, and bridges creative production to real-world impact.
// Production: SOEL (Sovereign Operational Entry Layer) wires all routes.
//   Routes: GET/PUT /api/sovereign/entry/purpose,
//           GET/POST /api/sovereign/entry/creator-goal,
//           PUT /api/sovereign/entry/creator-goal/[goalId]/milestone,
//           PUT /api/sovereign/entry/creator-goal/[goalId]/success-criteria,
//           POST /api/sovereign/entry/consumption,
//           POST/GET /api/sovereign/entry/creator-goal/[goalId]/fulfillment-assessment,
//           GET /api/sovereign/entry/creator-goal/[goalId]/fulfillment-gap,
//           GET /api/sovereign/entry/creator-goal/[goalId]/gap-investigation,
//           GET/POST /api/sovereign/entry/creator-goal/[goalId]/knowledge-requests,
//           GET /api/sovereign/entry/creator-goal/[goalId]/knowledge-investigation

const MAKMAN_AL_GHAYAH_MANIFEST: SovereignChamberManifest = {
  chamberId: 'makman-al-ghayah',
  constitutionalName: 'مكمن الغاية — Makman Al-Ghayah',
  constitutionalResponsibility:
    'It strategizes. The Makman consciousness reads patterns and possibilities.',
  capabilities: [
    {
      capabilityId: 'makman-set-sovereign-purpose',
      displayName: 'Declare Sovereign Purpose',
      purpose:
        'Records the Creator\'s fundamental sovereign purpose statement — the single sentence that defines what they are building and why.',
      requiredInputs: [
        { name: 'purposeStatement', type: 'text', description: 'The Creator\'s fundamental purpose in their own words' },
      ],
      optionalInputs: [],
      outputType: 'Persisted sovereign purpose record linked to this Creator',
      preconditions: ['Creator is authenticated'],
      failureConditions: ['Session is invalid or expired', 'Purpose statement is empty'],
      interactionModes: ['write', 'listen'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'makman-register-milestone-goal',
      displayName: 'Register a Milestone Goal',
      purpose:
        'Creates a named goal under the Creator\'s sovereign purpose, optionally designated as a milestone, with a snapshot of the current purpose statement.',
      requiredInputs: [
        { name: 'goalName', type: 'text', description: 'The goal to achieve' },
      ],
      optionalInputs: [
        { name: 'isMilestone', type: 'selection', description: 'Whether this goal is a milestone goal (true/false)' },
      ],
      outputType: 'GoalContract record with goalId, purpose snapshot, and milestone flag',
      preconditions: ['Creator is authenticated', 'Sovereign purpose is already declared'],
      failureConditions: ['No sovereign purpose on record', 'Goal name is empty'],
      interactionModes: ['write', 'listen'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'makman-define-success-criteria',
      displayName: 'Define Success Criteria',
      purpose:
        'Sets the measurable success criteria for a goal — what the Creator will observe in the world to know the goal is fulfilled.',
      requiredInputs: [
        { name: 'goalId', type: 'identifier', description: 'The goal these criteria apply to' },
        { name: 'criteria', type: 'text', description: 'One or more success criteria statements' },
      ],
      optionalInputs: [],
      outputType: 'Updated GoalContract with SuccessCriterion records',
      preconditions: ['Creator is authenticated', 'Goal with goalId exists and belongs to this Creator'],
      failureConditions: ['Goal not found', 'No criteria provided'],
      interactionModes: ['write', 'listen'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'makman-record-observation',
      displayName: 'Record a Reality Observation',
      purpose:
        'Records a signal that a Creator\'s published work has been consumed — linking a publication to a goal so the fulfillment engine can measure real-world impact.',
      requiredInputs: [
        { name: 'publicationId', type: 'identifier', description: 'The published work that was consumed' },
      ],
      optionalInputs: [],
      outputType: 'Persisted observation signal linked to the goal via the cinematic ledger bridge',
      preconditions: [
        'Creator is authenticated',
        'publicationId exists in the cinematic_ledger and maps to a Creator goal',
      ],
      failureConditions: ['No goal found for this publication', 'Publication not in ledger'],
      interactionModes: ['browse'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'makman-assess-fulfillment',
      displayName: 'Assess Goal Fulfillment',
      purpose:
        'Runs the constitutional FulfillmentAssessment engine over all recorded observations for a goal, returning an honest 4-verdict outcome: FULFILLED, PARTIALLY_FULFILLED, ASSESSMENT_NOT_POSSIBLE, or UNFULFILLED.',
      requiredInputs: [
        { name: 'goalId', type: 'identifier', description: 'The goal to assess' },
      ],
      optionalInputs: [],
      outputType: 'FulfillmentAssessment: verdict, criterion-level results, confidence score',
      preconditions: [
        'Creator is authenticated',
        'Goal with goalId has defined success criteria',
      ],
      failureConditions: [
        'No success criteria defined for goal',
        'Goal not found or not owned by this Creator',
      ],
      interactionModes: ['browse'],
      operatingModes: ['guided'],
    },
    {
      capabilityId: 'makman-get-gap-report',
      displayName: 'Get Gap Report',
      purpose:
        'Derives and returns the fulfillment gap analysis for a goal — which criteria are unmet, what category of gap each represents (observation, fulfillment, or none), and whether investigation is needed.',
      requiredInputs: [
        { name: 'goalId', type: 'identifier', description: 'The goal to analyze' },
      ],
      optionalInputs: [],
      outputType: 'Array of CriterionFulfillmentGap with GapClass and gap category per criterion',
      preconditions: [
        'Creator is authenticated',
        'Goal has a fulfillment assessment on record',
      ],
      failureConditions: [
        'No fulfillment assessment found for goal',
        'Goal not found or not owned by this Creator',
      ],
      interactionModes: ['browse'],
      operatingModes: ['explorer'],
    },
    {
      capabilityId: 'makman-request-knowledge-investigation',
      displayName: 'Request Knowledge Investigation for Goal',
      purpose:
        'Retrieves the latest knowledge investigation results linked to a goal — running a new investigation via Hujjah Al-Damighah if the gap analysis determines one is needed.',
      requiredInputs: [
        { name: 'goalId', type: 'identifier', description: 'The goal requiring knowledge investigation' },
      ],
      optionalInputs: [],
      outputType: 'KnowledgeExportRecord array: evidence items scoped to this goal\'s knowledge gaps',
      preconditions: [
        'Creator is authenticated',
        'Goal has a gap report on record',
        'Gap classification indicates REQUIRES_INVESTIGATION for at least one criterion',
      ],
      failureConditions: [
        'No gap report found',
        'No investigation-requiring gaps identified',
        'Hujjah investigation chain unavailable',
      ],
      interactionModes: ['browse'],
      operatingModes: ['guided'],
    },
  ],
  boundary: {
    canDo: [
      'Record and retrieve the Creator\'s sovereign purpose',
      'Create and manage milestone goals under that purpose',
      'Define and store success criteria per goal',
      'Record reality observations linking publications to goals',
      'Run the FulfillmentAssessment engine and return honest verdicts',
      'Derive gap reports from assessment results',
      'Trigger knowledge investigation for goals with open gaps',
    ],
    cannotDo: [
      'Generate creative assets (images, audio, video) — that belongs to Qiyamah',
      'Conduct knowledge investigation directly — that is delegated to Hujjah Al-Damighah',
      'Assemble or compile productions — that belongs to Ras Al Amr',
      'Store binary assets — that belongs to the Sovereign Vault Palace',
      'Report a goal as fulfilled when real evidence of fulfillment is absent',
    ],
    delegates: [
      {
        to: 'hujjah-al-damighah',
        reason:
          'Knowledge investigation for goal gaps is conducted by Hujjah Al-Damighah via the constitutional chain (Reception → Export)',
      },
      {
        to: 'ras-amr',
        reason:
          'Production assembly for distribution is built and compiled by Ras Al Amr before Makman assesses its impact',
      },
    ],
  },
};

// ── Sovereign Chamber Registry ────────────────────────────────────────────

export const SOVEREIGN_CHAMBER_MANIFESTS: readonly SovereignChamberManifest[] = [
  SOVEREIGN_VAULT_PALACE_MANIFEST,
  HUJJAH_AL_DAMIGHAH_MANIFEST,
  QIYAMAH_CHAMBER_MANIFEST,
  RAS_AL_AMR_MANIFEST,
  MAKMAN_AL_GHAYAH_MANIFEST,
] as const;
