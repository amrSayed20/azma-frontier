/**
 * AZMA OS — SOVEREIGN INTERACTION KERNEL
 * Constitutional Type Definitions
 *
 * The Kernel is the single constitutional entry point through which the
 * Empire understands what the Creator is asking. It reads every Sovereign
 * Chamber Manifest, resolves which chamber is responsible, which capability
 * matches, which inputs are required, and which interaction mode applies —
 * then returns a prepared InteractionSession.
 *
 * What the Kernel does NOT do:
 * - Invoke AI reasoning or embed any hardcoded chamber knowledge
 * - Execute capabilities, invoke chambers, or dispatch requests
 * - Apply business logic beyond what the manifests declare
 * - Make recommendations or offer Empire Voice
 *
 * All resolution is derived entirely from SOVEREIGN_CHAMBER_MANIFESTS.
 */

import type {
  ManifestChamberContext,
  ManifestInteractionMode,
  ManifestOperatingMode,
  ManifestInput,
  SovereignChamberCapability,
  SovereignChamberManifest,
} from '../sovereign-chamber-manifest';
import type { ImperialVoice } from '../imperial-voice';
import type { FirstConstitutionalMotion } from '../first-constitutional-motion';

// ── Kernel Intent ─────────────────────────────────────────────────────────
// Three constitutional ways a Creator can signal what they want.

export interface NavigateIntent {
  readonly kind: 'navigate';
  /** The chamber the Creator is navigating into. */
  readonly targetChamber: ManifestChamberContext;
  /** Optional: a specific capability within that chamber. When absent,
   *  the Kernel resolves the chamber's primary (first declared) capability. */
  readonly capabilityId?: string;
}

export interface TextIntent {
  readonly kind: 'text';
  /** The raw text the Creator typed. */
  readonly rawText: string;
  /** The interaction mode the Creator is currently operating in. */
  readonly preferredMode: ManifestInteractionMode;
}

export interface VoiceIntent {
  readonly kind: 'voice';
  /** The transcript of what the Creator said. Always resolved with 'listen' mode. */
  readonly transcript: string;
}

export type KernelIntent = NavigateIntent | TextIntent | VoiceIntent;

// ── Kernel Request ────────────────────────────────────────────────────────

export interface KernelRequest {
  readonly intent: KernelIntent;
}

// ── Resolution Result ─────────────────────────────────────────────────────

/** The Kernel's verdict on what to prepare. */
export type KernelSessionStatus =
  | 'RESOLVED'               // single clear match; session is ready
  | 'NEEDS_CLARIFICATION'    // two or more capabilities score equally; Creator must choose
  | 'NO_MATCHING_CAPABILITY'; // no capability in any manifest matched the request

/** A single capability as resolved from a manifest. */
export interface ResolvedCapability {
  readonly chamberId: ManifestChamberContext;
  readonly capabilityId: string;
  readonly capability: SovereignChamberCapability;
  readonly manifest: SovereignChamberManifest;
}

// ── Interaction Session ───────────────────────────────────────────────────
// The Kernel's only output. A prepared plan — never an execution command.

export interface InteractionSession {
  /** Ephemeral correlation ID. Never stored. */
  readonly sessionId: string;
  readonly status: KernelSessionStatus;
  /** Non-null only when status === 'RESOLVED'. */
  readonly resolvedCapability: ResolvedCapability | null;
  /** Non-empty only when status === 'NEEDS_CLARIFICATION'. */
  readonly candidates: readonly ResolvedCapability[];
  /** The interaction mode the Creator should enter. Null when unresolved. */
  readonly activeInteractionMode: ManifestInteractionMode | null;
  /** The operating mode the chamber will use. Null when unresolved. */
  readonly activeOperatingMode: ManifestOperatingMode | null;
  /** Inputs the Creator must supply before the capability can execute. */
  readonly requiredInputs: readonly ManifestInput[];
  /** Inputs the Creator may optionally supply. */
  readonly optionalInputs: readonly ManifestInput[];
  /** Conditions that must hold for the capability to succeed. */
  readonly preconditions: readonly string[];
  readonly preparedAt: string;
  /**
   * The Empire's voice for this session — composed from the resolved chamber
   * context and the Creator's citizen profile. Null when the Kernel could not
   * resolve a chamber (NEEDS_CLARIFICATION or NO_MATCHING_CAPABILITY).
   */
  readonly imperialVoice: ImperialVoice | null;
  /**
   * The full constitutional motion — only present for TextIntent and
   * VoiceIntent sessions where the Creator's raw expression was available.
   * Null for NavigateIntent (no raw text) and unresolved sessions.
   */
  readonly constitutionalMotion: FirstConstitutionalMotion | null;
}
