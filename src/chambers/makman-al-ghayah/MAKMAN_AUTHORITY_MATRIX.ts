/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * MAG-PKG-I — WORK PACKAGE D: SOVEREIGN AUTHORITY MATRIX
 *
 * Documents Creator Authority, Runtime Authority, Platform Authority,
 * Chamber Authority, and Forbidden Authority explicitly, per Articles II
 * and VII of the Constitutional Foundation V1.0. No authority duplication.
 */

export type RasAlAmrMakmanAuthorityCategory = 'CREATOR_AUTHORITY' | 'RUNTIME_AUTHORITY' | 'PLATFORM_AUTHORITY' | 'CHAMBER_AUTHORITY' | 'FORBIDDEN_AUTHORITY';

export interface RasAlAmrMakmanAuthorityEntry {
  readonly category: RasAlAmrMakmanAuthorityCategory;
  readonly holder: string;
  readonly grants: readonly string[];
  readonly constitutionalSource: string;
}

export const MAKMAN_SOVEREIGN_AUTHORITY_MATRIX: readonly RasAlAmrMakmanAuthorityEntry[] = [
  {
    category: 'CREATOR_AUTHORITY',
    holder: 'The Creator (Goal owner, publisher).',
    grants: [
      'Absolute, sovereign access to their own intellectual property regardless of any policy configuration (Publisher Absolute Override).',
      'Sole authority to approve: Publishing, Scheduling, Cancelling, Changing priorities, Changing destinations, Changing platforms, Deleting any Goal, Changing execution timing (Article VIII, exhaustive list of 8).',
      'Sole authority to choose the Goal\'s destination (Article I).',
      'Sole recipient of every recommendation and notification Makman produces (Articles IV, V).',
    ],
    constitutionalSource: 'ARTICLE II, ARTICLE VIII; access-policy-engine.ts, Publisher Absolute Override.',
  },
  {
    category: 'RUNTIME_AUTHORITY',
    holder: 'Makman Al-Ghayah\'s own deterministic evaluation mechanisms (access-policy-engine.ts, monetization-ledger-gateway.ts).',
    grants: [
      'Evaluate a consumer\'s access request against already-Creator-set policy.',
      'Record commercial events immutably.',
      'Decide dynamic-serve vs. hard-render, delegating actual rendering to Al-Watin.',
    ],
    constitutionalSource: 'ARTICLE II ("Observe. Analyze. Recommend. Warn. Re-evaluate. Plan. Protect."); access-policy-engine.ts, monetization-ledger-gateway.ts, rendering-bridge.ts.',
  },
  {
    category: 'PLATFORM_AUTHORITY',
    holder: 'Sovereign Vault (asset storage), Al-Watin Al-Siyadi / FleetDispatcher (actual rendering).',
    grants: [
      'Own and store the final rendered asset.',
      'Perform the actual rendering operation.',
    ],
    constitutionalSource: 'src/vault/sovereign-vault-manager.ts; rendering-bridge.ts delegation to FleetDispatcher. Makman never performs either itself (MAKMAN_CONSTITUTIONAL_BOUNDARIES.shallNever).',
  },
  {
    category: 'CHAMBER_AUTHORITY',
    holder: 'Makman Al-Ghayah as a whole.',
    grants: [
      'Plan, prioritize, and resolve dependencies among Goals prior to distribution.',
      'Wrap creative work in commercial/access-control terms once Creator-authorized.',
      'Guard the Goal continuously until Fulfilment, Cancellation, or explicit Creator instruction (Article X).',
    ],
    constitutionalSource: 'ARTICLE IX (Sovereign Custodian, never author/owner/ruler — Guardian only); ARTICLE X.',
  },
  {
    category: 'FORBIDDEN_AUTHORITY',
    holder: 'No one — these are prohibitions on Makman itself.',
    grants: [
      'Shall never own a Goal.',
      'Shall never rewrite a Goal.',
      'Shall never replace a Goal.',
      'Shall never cancel a Goal (without Creator authorization).',
      'Shall never publish without authorization.',
      'Shall never modify schedules without authorization.',
      'Shall never override Creator decisions.',
      'Shall never transfer Goal ownership.',
      'Shall never act outside the authority granted by the Creator.',
    ],
    constitutionalSource: 'ARTICLE VII (Forbidden Authority) — the complete, unabridged list, all 9 items.',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DUPLICATION CHECK
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_AUTHORITY_MATRIX_CHECK = {
  method: 'Checked that no single capability appears under two different authority categories.',
  result: 'PASS',
  detail: '5 categories, zero duplication. Note: Runtime Authority and Chamber Authority both describe Makman\'s own mechanisms at different granularity (Runtime = the deterministic evaluation itself; Chamber = the broader planning/guardianship role) — this is a layering, not a duplication, matching the same Runtime-vs-Chamber distinction RAS AL AMR\'s own Package II/III already established (RUNTIME.ts vs. IMPLEMENTATION.ts vs. the Chamber as a whole).',
} as const;

export const RAS_AL_AMR_MAKMAN_AUTHORITY_MATRIX = {
  matrix: MAKMAN_SOVEREIGN_AUTHORITY_MATRIX,
  check: MAKMAN_AUTHORITY_MATRIX_CHECK,
} as const;
