/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * MAG-PKG-II — WORK PACKAGE E: EXTERNAL CHAMBER INTEGRATION ARCHITECTURE
 *
 * Architects Makman's constitutional integration with RAS AL AMR, Al Hujjah
 * Al-Damighah, Qiyamah, Sovereign Vault, and Platform Shared Engines.
 * Extends MAKMAN_RELATIONSHIP_MATRIX.ts (MAG-PKG-I) with the four fields
 * Work Package E requires: Receiving responsibility, Sending
 * responsibility, Transfer boundary, Constitutional ownership.
 */

export interface RasAlAmrMakmanExternalIntegration {
  readonly entity: string;
  readonly receivingResponsibility: string;
  readonly sendingResponsibility: string;
  readonly transferBoundary: string;
  readonly constitutionalOwnership: string;
}

export const MAKMAN_EXTERNAL_INTEGRATIONS: readonly RasAlAmrMakmanExternalIntegration[] = [
  {
    entity: 'RAS AL AMR',
    receivingResponsibility: 'Receive the finished creative work (CompiledAssemblyGraph) and the Goal at Handover.',
    sendingResponsibility: 'None currently — no file sends anything back to RAS AL AMR (verified: no import in either direction beyond rendering-bridge.ts\'s one-way consumption).',
    transferBoundary: 'rendering-bridge.ts\'s import of CompiledAssemblyGraph/CanvasType is the exact, sole transfer point. Everything on the RAS AL AMR side of that import belongs to RAS AL AMR; everything after it belongs to Makman.',
    constitutionalOwnership: 'ARTICLE IX / RAS AL AMR\'s own GOAL_OWNERSHIP: neither Chamber owns the Goal at any point; the Creator does throughout.',
  },
  {
    entity: 'Al Hujjah Al-Damighah',
    receivingResponsibility: 'Receive validated conclusions only (once KNOWLEDGE_RECEPTION_COMPONENT is built).',
    sendingResponsibility: 'None — Makman never discovers or sends knowledge.',
    transferBoundary: 'Not yet built — no code-level channel exists in either direction.',
    constitutionalOwnership: 'ARTICLE VI: knowledge creation belongs exclusively to Al Hujjah; Goal execution belongs exclusively to Makman. Two exclusive, non-overlapping domains.',
  },
  {
    entity: 'Qiyamah (rendering CapabilityTarget)',
    receivingResponsibility: 'Receive typed CapabilityTarget for rendering-bridge evaluation.',
    sendingResponsibility: 'None identified.',
    transferBoundary: 'rendering-bridge.ts\'s import from ../../core/sovereign-orchestrator/qiyamah-intent-types.',
    constitutionalOwnership: 'Qiyamah/Sovereign Orchestrator owns CapabilityTarget\'s definition; Makman only consumes the type.',
  },
  {
    entity: 'Qiyamah (billing-agent.ts / cost-agent.ts, pending migration)',
    receivingResponsibility: 'Will receive full architectural ownership of ECONOMIC_POLICY_COMPONENT once migration executes.',
    sendingResponsibility: 'N/A — this is an ownership transfer, not a data-sending relationship.',
    transferBoundary: 'AZMA_PHASE6_BOUNDARY_REPORT.md\'s Migration Recommendation, item 3 — the exact, already-documented boundary: everything in billing-agent.ts/cost-agent.ts moves from Qiyamah\'s physical location to Makman\'s.',
    constitutionalOwnership: 'Already resolved by the Phase 6 audit: Makman is the Architectural Owner today, regardless of current physical file location.',
  },
  {
    entity: 'Sovereign Vault',
    receivingResponsibility: 'Receive a flattenedVaultAssetId reference for delivery; never receive raw asset ownership.',
    sendingResponsibility: 'None — Makman does not send assets to the Vault in any file read; rendering-bridge.ts references an asset ID already deposited there (by Al-Watin, per its own header: "The final MP4/WAV deposited in the Vault").',
    transferBoundary: 'The flattenedVaultAssetId field itself — Makman holds a reference, the Vault holds the asset.',
    constitutionalOwnership: 'src/vault/sovereign-vault-manager.ts owns storage; Article I explicitly excludes storage from Makman\'s purpose.',
  },
  {
    entity: 'Platform Shared Engines (cross-chamber evidence bridge)',
    receivingResponsibility: 'Recognized as a valid targetChamber for ChamberExportPayload.',
    sendingResponsibility: 'None — no Makman file consumes or sends through this bridge yet.',
    transferBoundary: 'src/shared/contracts/bridge.types.ts, ChamberExportPayload.targetChamber — Makman is named but not yet an active participant.',
    constitutionalOwnership: 'Shared Engine-owned; Makman has no architectural claim over the bridge contract itself.',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFER BOUNDARY VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_EXTERNAL_INTEGRATION_CHECK = {
  method: 'Confirmed every integration has exactly one transfer boundary and one constitutional ownership statement — no entity is claimed by two different boundary definitions.',
  result: 'PASS',
  detail: '6 external integrations documented, each with a single, unambiguous transfer boundary. Two integrations (Al Hujjah, Platform Shared Engines active participation) have no code-level boundary yet — documented as not-yet-built, not invented.',
} as const;

export const RAS_AL_AMR_MAKMAN_EXTERNAL_INTEGRATION_ARCHITECTURE = {
  integrations: MAKMAN_EXTERNAL_INTEGRATIONS,
  check: MAKMAN_EXTERNAL_INTEGRATION_CHECK,
} as const;
