/**
 * AZMA OS — THE SOVEREIGN CONSTRUCTION CONSTITUTION
 * Constitutional Architectural Debt Register (Construction ID SCD-003)
 *
 * Authority: "The Sovereign Construction Constitution," Chapter IX ("The
 * Constitutional Law of Architectural Debt") — Article II ("every
 * Architectural Debt shall be registered... nothing shall be postponed
 * informally"), Article VI (classification), Article VII (priority).
 *
 * This file is NOT part of the Sovereign Capability Diwan (src/
 * sovereign-capability/) — the Diwan governs Creator-visible abilities;
 * this registers UNREACHED IMPLEMENTATION discovered while excavating
 * the Diwan's capabilities, which is a different constitutional concern
 * entirely (Ch. IX, not the Diwan Dossier). Per this campaign's explicit
 * instruction: registered only. Not restored. Not activated. Not
 * removed.
 *
 * Six classifications exist per Ch. IX Art. VI: Launch Debt, Evolution
 * Debt, Restoration Debt, Research Debt, Experience Debt, Infrastructure
 * Debt. Five priorities exist per Art. VII: Critical, High, Normal,
 * Strategic, Future. No other classification/priority values are used.
 */

export type ArchitecturalDebtClassification =
  | 'Launch Debt'
  | 'Evolution Debt'
  | 'Restoration Debt'
  | 'Research Debt'
  | 'Experience Debt'
  | 'Infrastructure Debt';

export type ArchitecturalDebtPriority = 'Critical' | 'High' | 'Normal' | 'Strategic' | 'Future';

export interface ArchitecturalDebtItem {
  readonly item: string;
  readonly classification: ArchitecturalDebtClassification;
  readonly priority: ArchitecturalDebtPriority;
  readonly origin: string;
  readonly registeredAt: string;
}

export const ARCHITECTURAL_DEBT: readonly ArchitecturalDebtItem[] = [
  {
    item:
      'A parallel "Sovereign OS Runtime" adapter/bootstrap scaffold — src/core/azma-os-runtime/, ' +
      'src/core/chamber-integration/adapters/{ras-al-amr,qiyamah,hujjah-al-damighah}-adapter.ts, ' +
      'src/orchestrator/fleet-materialization/fleet-materialization-bootstrapper.ts (renamed from ' +
      'al-watin/al-watin-bootstrapper.ts during Construction Phase IV, 2026-07-12 — see ' +
      'src/sovereign-heart/PHASE_IV_ENGINEERING_REVIEW.ts) — an elaborately-built kernel-simulation ' +
      'layer wrapping 3 of the 5 Sovereign Chambers. Confirmed reachable only from its own test file ' +
      '(azma-os-operational-verification.test.ts); zero callers exist anywhere under app/.',
    classification: 'Infrastructure Debt',
    priority: 'Future',
    origin:
      'Discovered during the Sovereign Capability Diwan\'s Campaign B (SCD-002) exhaustive per-chamber ' +
      'source-tree excavation, while tracing every external import of ras-al-amr and qiyamah-chamber to ' +
      'confirm no real Creator-visible capability had been missed.',
    registeredAt: '2026-07-12',
  },
  {
    item:
      'An orphaned "knowledge-*-engine" family under src/chambers/hujjah-al-damighah/ (~90 files: ' +
      'knowledge audit/cache/orchestrator/runtime/registry/indexer/router/memory-*/snapshot/freeze ' +
      'engines, a duplicate repository-manager.ts, verdict-engine.ts, confidence-engine.ts, ' +
      'knowledge-dna-engine.ts, chronology-engine.ts, dispatch-engine.ts, cross-reference-engine.ts, ' +
      'knowledge-graph-engine.ts, workspace/). Imports only itself; never reached from the chamber\'s ' +
      'live page or its one real Server Action (runInvestigation).',
    classification: 'Infrastructure Debt',
    priority: 'Future',
    origin:
      'Discovered during the same SCD-002 excavation, after correcting an initial (wrong) assumption ' +
      'that hujjah-al-damighah had no separate src/chambers/ business-logic directory at all.',
    registeredAt: '2026-07-12',
  },
  {
    item:
      'SovereignVaultManager.depositAsset() (src/vault/sovereign-vault-manager.ts) has zero reachable ' +
      'callers anywhere in the repository. Its only possible caller, FleetDispatcher.resolveOperation(), ' +
      'is itself never invoked by anything reachable from a live route (its sole real caller, ' +
      'AsynchronousResolutionGateway, is only ever instantiated inside FleetMaterializationRuntime.bootstrap() ' +
      '(renamed from AlWatinRuntime during Construction Phase IV, 2026-07-12), which ' +
      'nothing under app/ calls). No real path currently exists for any asset to enter the backend Vault ' +
      'that Ras Al-Amr\'s compile capability later reads from.',
    classification: 'Launch Debt',
    priority: 'High',
    origin:
      'Discovered during SCD-002\'s deep verification of sovereign-vault-palace backend reachability, ' +
      'while confirming whether the Vault Palace frontend\'s disconnection from SovereignVaultManager was ' +
      'the only gap, or whether the backend itself was also unreachable end-to-end.',
    registeredAt: '2026-07-12',
  },
] as const;
