/**
 * PACKAGE XL — SOVEREIGN DIRECTOR EXECUTION BRIDGE
 * Director Plan contract: the typed boundary between the Intent Interpreter
 * (external AI provider) and the Scene Executor (AZMA state mutations).
 *
 * The Intent Interpreter converts natural creator language into this schema.
 * The Sovereign Director validates the schema against AZMA rules.
 * The Scene Executor builds the canvas from this contract using existing
 * RasAlAmrStateManager mutations — no new execution path.
 *
 * Provider-neutrality: this file has no import from any AI provider.
 * The actual provider call lives behind /api/ras-amr/director, server-side.
 */

/** How a visual asset should function within the scene sequence. */
export type VisualRole =
  | 'hook'      // Opening attention-grabber
  | 'reveal'    // Product / subject first reveal
  | 'detail'    // Close-up or supporting detail
  | 'main'      // Primary subject presence
  | 'hero'      // Dominant emotional peak
  | 'benefit'   // Functional or emotional benefit
  | 'support'   // Supporting b-roll or context
  | 'cta';      // Closing call-to-action

/** How an audio asset should function within the audio layer. */
export type AudioRole =
  | 'narration'         // Spoken voice-over
  | 'background_music'  // Ambient / underscore music
  | 'sound_effect'      // Point effect
  | 'dialogue'          // Speaker dialogue
  | 'voice';            // Generic voice asset

/** A single visual slot in the Director Plan's visual sequence. */
export interface VisualSlotPlan {
  /** Must match a label from ProductionAssetContext.label (e.g. "VISUAL_1", "VIDEO_2"). */
  assetLabel: string;
  /** Intended duration for this slot in seconds. */
  durationSeconds: number;
  role?: VisualRole;
}

/** A single audio assignment in the Director Plan. */
export interface AudioTrackPlan {
  /** Must match a label from ProductionAssetContext.label (e.g. "AUDIO_1"). */
  assetLabel: string;
  role: AudioRole;
  /** When this audio track begins, in seconds. */
  startSeconds: number;
  /** Volume adjustment in dB (0 = unity, negative = attenuation). */
  volumeDb?: number;
}

/**
 * The Director Plan contract — the typed output of the Intent Interpreter
 * and the typed input of the Scene Executor.
 *
 * All asset references use labels (VISUAL_1, VIDEO_1, AUDIO_1, ...) not
 * raw asset IDs. The Scene Executor resolves labels to IDs on the client
 * using the current production queue — provider never sees real asset IDs.
 */
export interface DirectorPlan {
  /** Short description of the scene's purpose (Arabic). */
  purpose: string;
  /** Ordered visual sequence — first item appears first on the timeline. */
  visualSequence: VisualSlotPlan[];
  /** Audio tracks to place on the timeline. */
  audioTracks: AudioTrackPlan[];
  /** Policy for video assets' original audio track. */
  videoPolicy: {
    /** When true, MOTION nodes have their original audio muted via AudioMixingDirective. */
    muteOriginalAudio: boolean;
  };
  transitionType: 'cut' | 'crossfade';
  transitionDurationSeconds?: number;
  /** 0–1 confidence estimate from the interpreter. */
  confidence: number;
  /** Instructions the interpreter could not satisfy given the available assets. */
  unresolvedInstructions: string[];
}

/**
 * Context passed to the server-side Intent Interpreter for each production
 * asset in the current session. Labels are assigned client-side before the
 * API call so the provider never receives raw asset IDs or URIs.
 */
export interface ProductionAssetContext {
  /** Client-assigned label: VISUAL_1, VIDEO_1, AUDIO_1, etc. */
  label: string;
  /** Asset capability family: "VISUAL", "MOTION", or "AUDIO". */
  capabilityTarget: string;
  /** Human-readable name from the queue item title. */
  name: string;
  /** Duration hint in seconds, if known. Omit when unknown. */
  durationSeconds?: number;
  /** True when the vault asset carries isVoiceAsset=true — distinguishes
   *  narration/TTS from background music or generic audio. */
  isVoiceAsset?: boolean;
}

/** Template production grammar passed to the server when a template is active. */
export interface TemplateGrammar {
  name: string;
  domain: string;
  transitionPreference: 'cut' | 'crossfade';
  transitionDurationSeconds?: number;
  slotDurations: number[];
  slotRoles?: string[];
}

/** The full request body sent to /api/ras-amr/director. */
export interface DirectorInterpretRequest {
  intent: string;
  productionAssets: ProductionAssetContext[];
  /** ID of the active template, if any. */
  templateId?: string;
  /** Full template grammar so the server can apply its rhythm as a planning guide. */
  templateGrammar?: TemplateGrammar;
}
