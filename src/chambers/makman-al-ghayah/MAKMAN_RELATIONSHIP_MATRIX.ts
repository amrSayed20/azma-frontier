/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * MAG-PKG-I — WORK PACKAGE C: CONSTITUTIONAL RELATIONSHIP MAP
 *
 * Documents the constitutional relationship between Makman Al-Ghayah and
 * every named chamber/Platform entity, per MAG-PKG-I's own requirement that
 * "Responsibilities shall never overlap." Extends
 * MAKMAN_AL_GHAYAH_SOVEREIGN_CHAMBER_REFERENCE.ts's chamberRelationships
 * section (which is preserved, not replaced) into one standalone matrix.
 */

export type RasAlAmrMakmanRelationshipKind = 'HANDOVER_SOURCE' | 'PENDING_MIGRATION_OWNER' | 'ASSET_DELIVERY_DEPENDENCY' | 'KNOWLEDGE_SOURCE' | 'NO_RELATIONSHIP' | 'PLATFORM_BRIDGE_NODE';

export interface RasAlAmrMakmanRelationshipEntry {
  readonly entity: string;
  readonly relationshipKind: RasAlAmrMakmanRelationshipKind;
  readonly makmanResponsibility: string;
  readonly otherPartyResponsibility: string;
  readonly overlapCheck: 'NO OVERLAP' | 'ANALYZED — SEE DETAIL';
  readonly constitutionalOrRepositorySource: string;
}

export const MAKMAN_CONSTITUTIONAL_RELATIONSHIP_MAP: readonly RasAlAmrMakmanRelationshipEntry[] = [
  {
    entity: 'RAS AL AMR',
    relationshipKind: 'HANDOVER_SOURCE',
    makmanResponsibility: 'Receive the Goal and finished creative work at Handover; guard, plan around, and (once Creator-authorized) distribute/monetize it.',
    otherPartyResponsibility: 'Prepare, certify, and finalize the creative work up to and including Export/Farewell (RAS AL AMR\'s own certified Package II chain); own the Goal\'s creative-preparation lifecycle (Declared through Active) via PACKAGE_III_EXECUTION_GOAL_MODEL.ts.',
    overlapCheck: 'NO OVERLAP',
    constitutionalOrRepositorySource: 'rendering-bridge.ts imports (CompiledAssemblyGraph, CanvasType); ARTICLE I / ARTICLE IX (Makman is Guardian, never author) vs. RAS AL AMR\'s own GOAL_OWNERSHIP (Creator owns, RAS AL AMR never owns) — both Chambers hold the identical non-ownership posture toward the same Goal, at different points in its life.',
  },
  {
    entity: 'Qiyamah (billing-agent.ts / cost-agent.ts, pending migration)',
    relationshipKind: 'PENDING_MIGRATION_OWNER',
    makmanResponsibility: 'Own economic/billing policy lifecycle (per AZMA_PHASE6_BOUNDARY_REPORT.md\'s Ownership Matrix) — not yet physically located here.',
    otherPartyResponsibility: 'Qiyamah currently hosts these files physically but does not architecturally own them.',
    overlapCheck: 'NO OVERLAP',
    constitutionalOrRepositorySource: 'AZMA_PHASE6_BOUNDARY_REPORT.md, Ownership Matrix: billing-agent.ts / cost-agent.ts — "Architectural Owner: Makman Al-Ghayah... Requires migration." No constitutional Article addresses this directly; it remains a Repository Evidence finding, not yet elevated to a named Article.',
  },
  {
    entity: 'Qiyamah (rendering, CapabilityTarget)',
    relationshipKind: 'ASSET_DELIVERY_DEPENDENCY',
    makmanResponsibility: 'Consume CapabilityTarget typing for rendering-bridge evaluation only.',
    otherPartyResponsibility: 'Qiyamah/Sovereign Orchestrator owns CapabilityTarget\'s definition.',
    overlapCheck: 'NO OVERLAP',
    constitutionalOrRepositorySource: 'rendering-bridge.ts imports CapabilityTarget from ../../core/sovereign-orchestrator/qiyamah-intent-types.',
  },
  {
    entity: 'Sovereign Vault',
    relationshipKind: 'ASSET_DELIVERY_DEPENDENCY',
    makmanResponsibility: 'Reference the Vault-deposited asset ID for delivery; never store the asset itself.',
    otherPartyResponsibility: 'Own permanent asset storage and ownership layer (src/vault/sovereign-vault-manager.ts).',
    overlapCheck: 'NO OVERLAP',
    constitutionalOrRepositorySource: 'consumption-boundary.ts, rendering-bridge.ts (flattenedVaultAssetId); monetization-ledger-gateway.ts ("Vault Ledgers").',
  },
  {
    entity: 'Al Hujjah Al-Damighah',
    relationshipKind: 'KNOWLEDGE_SOURCE',
    makmanResponsibility: 'Receive validated conclusions only; never discover knowledge itself; own Goal execution exclusively.',
    otherPartyResponsibility: 'Discover knowledge exclusively — Al Hujjah never executes a Goal.',
    overlapCheck: 'NO OVERLAP',
    constitutionalOrRepositorySource: 'ARTICLE VI (Relationship with Al Hujjah Al Damighah) — constitutionally established; not yet reflected in any code (no import exists in either direction as of this writing).',
  },
  {
    entity: 'Platform Shared Engines (general)',
    relationshipKind: 'PLATFORM_BRIDGE_NODE',
    makmanResponsibility: 'Participate as a recognized cross-chamber bridge target for evidence exchange.',
    otherPartyResponsibility: 'src/shared/contracts/bridge.types.ts owns the bridge contract itself.',
    overlapCheck: 'NO OVERLAP',
    constitutionalOrRepositorySource: 'src/shared/contracts/bridge.types.ts, ChamberExportPayload.targetChamber includes \'makman\'.',
  },
] as const;

export const MAKMAN_RELATIONSHIP_MATRIX_CHECK = {
  method: 'Checked every relationship entry for responsibility overlap with Makman\'s own responsibilities (Article I/VII/VIII) and with the other party\'s own certified responsibilities where known (RAS AL AMR\'s Package II/III chain, AZMA_PHASE6_BOUNDARY_REPORT.md).',
  result: 'PASS',
  detail: '6 relationships documented, zero overlaps found. The one pending-migration item (billing-agent.ts/cost-agent.ts) is a location gap, not a responsibility overlap — ownership is already unambiguous per the Phase 6 audit.',
} as const;

export const RAS_AL_AMR_MAKMAN_RELATIONSHIP_MATRIX = {
  map: MAKMAN_CONSTITUTIONAL_RELATIONSHIP_MAP,
  check: MAKMAN_RELATIONSHIP_MATRIX_CHECK,
} as const;
