/**
 * AZMA OS — SOVEREIGN OPERATIONAL ENTRY LAYER
 * COMPOSITION ROOT (server process singleton)
 * (Construction ID MAG-LB-001)
 *
 * Wires the already-certified Makman collaborators together exactly once
 * per server process, and constructs the one SOEL instance every route
 * under app/api/sovereign/entry/ shares.
 *
 * ENGINEERING DECISION, disclosed: MAG-LF-001's composeMakmanCommercialPipeline()
 * constructs its own internal MakmanPublicationRegistry rather than
 * accepting one — calling it here would create a second registry,
 * disconnected from the one MakmanGoalDistributionBridge writes
 * publications into, so a Goal submitted through submitCreatorGoal()
 * would never be found by requestConsumption(). To keep exactly one
 * shared registry, this file composes SovereignAccessPolicyEngine /
 * MonetizationLedgerGateway / PublicConsumptionBoundary directly,
 * mirroring composeMakmanCommercialPipeline()'s own internal wiring
 * exactly, without calling that function. MAG-LF-001's own file is
 * unmodified.
 *
 * Al-Watin composition remains an unbuilt platform-level gap (disclosed
 * since MAG-LF-001); see unbuilt-al-watin-placeholder.ts.
 *
 * EXTENDED (MAG-LB-002): also composes RAS AL AMR's compilation chain —
 * SovereignVaultManager → VaultRehydrationBridge → PrePublishingBoundary.
 * Unlike Al-Watin, every collaborator here is real: SovereignVaultManager
 * (src/vault/sovereign-vault-manager.ts) is a genuine, no-argument,
 * in-memory implementation of IVaultManager — no placeholder is needed.
 * See RAS_AL_AMR_ENTRY_ENGINEERING_REVIEW.ts for the one real operational
 * limitation this composition has (assets must already exist in this
 * same in-memory vault instance).
 *
 * BRIDGED (MAG-LB-003): vaultManager is now constructed once and shared
 * by BOTH FleetDispatcher (the currently certified asset-generation
 * flow's resolveOperation() deposit path, src/orchestrator/al-watin/fleet/fleet-dispatcher.ts)
 * and RAS AL AMR's VaultRehydrationBridge. Before this, they were two
 * separate SovereignVaultManager instances — anything Al-Watin deposited
 * would have been invisible to RAS AL AMR's compilation even once real
 * dispatch/ledger composition exists. Sharing the instance is the entire
 * bridge; no new business logic was introduced, and the Vault itself
 * remains the sole constitutional owner of every asset — neither
 * Al-Watin nor RAS AL AMR gains ownership, only shared read/write access
 * to one already-certified store.
 */

import { GoalState } from '../chambers/makman-al-ghayah/goal-state';
import {
  MakmanPublicationRegistry,
  MakmanGoalDistributionBridge,
} from '../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import { FlattenedRenderingBridge } from '../chambers/makman-al-ghayah/rendering-bridge';
import { SovereignAccessPolicyEngine } from '../chambers/makman-al-ghayah/access-policy-engine';
import { MonetizationLedgerGateway } from '../chambers/makman-al-ghayah/monetization-ledger-gateway';
import { PublicConsumptionBoundary } from '../chambers/makman-al-ghayah/consumption-boundary';
import { createUnbuiltAlWatinPlaceholder } from './unbuilt-al-watin-placeholder';
import { SovereignVaultManager } from '../vault/sovereign-vault-manager';
import { VaultRehydrationBridge } from '../chambers/ras-al-amr/vault-rehydration-bridge';
import { PrePublishingBoundary } from '../chambers/ras-al-amr/pre-publishing-boundary';
import { SovereignOperationalEntryLayer } from './soel';

/** The one Sovereign Vault instance for this server process — shared by Al-Watin's deposit path and RAS AL AMR's rehydration read path. See MAG-LB-003. */
const vaultManager = new SovereignVaultManager();

const goalState = new GoalState();
const publicationRegistry = new MakmanPublicationRegistry();
const renderingBridge = new FlattenedRenderingBridge(createUnbuiltAlWatinPlaceholder(vaultManager));
const bridge = new MakmanGoalDistributionBridge(publicationRegistry, renderingBridge);
const policyEngine = new SovereignAccessPolicyEngine();
const ledgerGateway = new MonetizationLedgerGateway();
const consumptionBoundary = new PublicConsumptionBoundary(
  publicationRegistry,
  policyEngine,
  ledgerGateway,
  renderingBridge,
);

const rehydrationBridge = new VaultRehydrationBridge(vaultManager);
const prePublishingBoundary = new PrePublishingBoundary(rehydrationBridge);

/** The single, server-process-lifetime SOEL instance every entry route calls. */
export const soel = new SovereignOperationalEntryLayer(goalState, bridge, consumptionBoundary, prePublishingBoundary);
