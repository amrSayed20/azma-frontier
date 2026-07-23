/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * Construction Phase IV — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase IV ("The Constitutional Heart — The Birth of
 * Al-Wateen").
 *
 * NAMING COLLISION FLAGGED, not silently merged: a pre-existing module,
 * src/orchestrator/al-watin/ (note: "Al-Watin," built in an earlier,
 * pre-Sovereign-Body campaign), already exists and is registered as
 * Architectural Debt (Constitutional Nervous System's Al-Wateen organ
 * entry, Phase I, marked "implemented-but-unreachable"). Reading it
 * confirms it is real business/orchestration code — a "materialization
 * ecosystem" dispatching AI-provider fleet operations, managing an
 * operation ledger, and resolving async provider webhooks
 * (al-watin-bootstrapper.ts). This directly contradicts THIS chapter's
 * constitutional definition of Al-Wateen ("shall never execute
 * orchestration... its responsibility is continuity alone") — the old
 * al-watin module is not a dormant implementation of this organ, it is a
 * different constitutional concept that happens to share a similar name.
 * This phase does NOT reuse, wrap, or repurpose it. Al-Wateen (the Heart)
 * is built fresh here, in src/sovereign-heart/, faithful to this
 * chapter's actual definition.
 *
 * UPDATE (later the same day, Constitutional Directive following this
 * phase's Certification): the old module was renamed to
 * src/orchestrator/fleet-materialization/ (class AlWatinRuntime →
 * FleetMaterializationRuntime) — behavior preserved exactly, only its
 * name changed, so it can no longer be confused with this organ.
 */

// ── Constitutional Rhythm ──────────────────────────────────────────────────
// Named by this phase's Primary Objectives ("Construct the Constitutional
// Rhythm"). No vision article specifies exact timing values — these are
// engineering defaults, disclosed as such, not dictated by constitutional
// authority.

export interface ConstitutionalRhythm {
  readonly beatIntervalMs: number;
  /** How long an organ may go without reporting any signal before its continuity is recorded as "silent." A fact, never a judgment (Al-Wateen never decides what silence MEANS). */
  readonly silenceThresholdMs: number;
}

// ── Constitutional Continuity ──────────────────────────────────────────────

export type OrganContinuityStatus = 'continuous' | 'silent' | 'never-observed';

export interface OrganContinuityRecord {
  readonly organId: string;
  readonly lastSeenAt: string | null;
  readonly status: OrganContinuityStatus;
}

// ── Constitutional Heartbeat ───────────────────────────────────────────────

export interface HeartbeatState {
  readonly awake: boolean;
  readonly beatCount: number;
  readonly lastBeatAt: string | null;
  readonly startedAt: string | null;
}
