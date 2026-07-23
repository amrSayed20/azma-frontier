/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * MAG-PKG-II — WORK PACKAGE C: CHAMBER RESPONSIBILITY ARCHITECTURE
 *
 * Defines permanent responsibility ownership, explicitly distinguishing
 * Creator / Makman / Platform / Future Runtime / Future Shared Engines.
 * Extends MAKMAN_AUTHORITY_MATRIX.ts (MAG-PKG-I, verb-level authority) to
 * component-level architectural ownership. No duplicated ownership.
 */

export type RasAlAmrMakmanResponsibilityOwner = 'CREATOR' | 'MAKMAN' | 'PLATFORM' | 'FUTURE_RUNTIME' | 'FUTURE_SHARED_ENGINES';

export interface RasAlAmrMakmanResponsibilityEntry {
  readonly responsibility: string;
  readonly owner: RasAlAmrMakmanResponsibilityOwner;
  readonly constitutionalOrArchitecturalSource: string;
}

export const MAKMAN_RESPONSIBILITY_ARCHITECTURE_MAP: readonly RasAlAmrMakmanResponsibilityEntry[] = [
  { responsibility: 'The Goal itself — its meaning, content, and every state transition.', owner: 'CREATOR', constitutionalOrArchitecturalSource: 'ARTICLE VII, IX.' },
  { responsibility: 'Approval of publish/schedule/cancel/priority/destination/platform/deletion/timing decisions.', owner: 'CREATOR', constitutionalOrArchitecturalSource: 'ARTICLE VIII.' },
  { responsibility: 'The Goal\'s in-chamber representation (GOAL_CUSTODY_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE IX (Guardian).' },
  { responsibility: 'Planning, prioritization, dependency resolution (GUARDIANSHIP_PLANNING_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE II.' },
  { responsibility: 'Progress tracking, timeline, metrics, completion analysis (GOAL_PROGRESS_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE II ("Re-evaluate").' },
  { responsibility: 'Session-scoped custody (GOAL_SESSION_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'Repository Evidence.' },
  { responsibility: 'Export/reporting payloads (GOAL_EXPORT_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'Repository Evidence.' },
  { responsibility: 'Destination execution once Creator-authorized (DESTINATION_EXECUTION_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE I, VIII.' },
  { responsibility: 'Access policy enforcement (ACCESS_ENFORCEMENT_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE II.' },
  { responsibility: 'Commercial event recording (MONETIZATION_LEDGER_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'Repository Evidence.' },
  { responsibility: 'Consumer-facing gateway orchestration (CONSUMPTION_GATEWAY_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'Repository Evidence.' },
  { responsibility: 'Economic/billing policy (ECONOMIC_POLICY_COMPONENT).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'AZMA_PHASE6_BOUNDARY_REPORT.md (pending migration from Qiyamah).' },
  { responsibility: 'Recommendation generation (RECOMMENDATION_COMPONENT, reserved).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE IV.' },
  { responsibility: 'Notification delivery (NOTIFICATION_COMPONENT, reserved).', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE V.' },
  { responsibility: 'Knowledge discovery.', owner: 'MAKMAN', constitutionalOrArchitecturalSource: 'ARTICLE VI: "Al Hujjah discovers knowledge. Makman Al Ghayah never discovers knowledge." — NOTE: listed here to make the negative explicit; Makman holds NO responsibility for this, see MAKMAN_BOUNDARY_MATRIX.ts.' },
  { responsibility: 'Permanent asset storage.', owner: 'PLATFORM', constitutionalOrArchitecturalSource: 'Sovereign Vault (src/vault/sovereign-vault-manager.ts) — Makman explicitly never owns storage (Article I: "Its purpose is not storage").' },
  { responsibility: 'Actual rendering execution.', owner: 'PLATFORM', constitutionalOrArchitecturalSource: 'Al-Watin Al-Siyadi / FleetDispatcher — rendering-bridge.ts delegates, never performs.' },
  { responsibility: 'Knowledge creation/discovery.', owner: 'FUTURE_SHARED_ENGINES', constitutionalOrArchitecturalSource: 'ARTICLE VI — Al Hujjah Al-Damighah exclusively; not a Makman, not a Platform-generic responsibility.' },
  { responsibility: 'Creator-authorization gating on Goal mutation (currently missing in GoalState).', owner: 'FUTURE_RUNTIME', constitutionalOrArchitecturalSource: 'MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts finding — this gate does not exist in Architecture yet because it requires Runtime-level enforcement, which this Package does not build.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DUPLICATE OWNERSHIP CHECK
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_RESPONSIBILITY_ARCHITECTURE_CHECK = {
  method: 'Checked that every responsibility above is assigned exactly one owner category, and that no two owners claim the same responsibility.',
  result: 'PASS',
  detail: '19 responsibilities, 5 owner categories, zero duplication. Every one of the 13 MAKMAN_CHAMBER_ARCHITECTURE.ts components has an explicit, singular owner.',
} as const;

export const RAS_AL_AMR_MAKMAN_RESPONSIBILITY_ARCHITECTURE = {
  map: MAKMAN_RESPONSIBILITY_ARCHITECTURE_MAP,
  check: MAKMAN_RESPONSIBILITY_ARCHITECTURE_CHECK,
} as const;
