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
 * EXTENDED (MAG-LB-002): also composes RAS AL AMR's compilation chain —
 * SovereignVaultManager → VaultRehydrationBridge → PrePublishingBoundary.
 * SovereignVaultManager is a genuine, no-argument, SQLite-backed
 * implementation of IVaultManager — no placeholder is needed.
 * See RAS_AL_AMR_ENTRY_ENGINEERING_REVIEW.ts for the one real operational
 * limitation this composition has (assets must already exist in this
 * same in-memory vault instance).
 *
 * BRIDGED (MAG-LB-003): vaultManager is now constructed once and shared
 * by BOTH FleetDispatcher (the dispatch path for CINEMATIC canvas exports,
 * src/orchestrator/fleet-materialization/fleet/fleet-dispatcher.ts)
 * and RAS AL AMR's VaultRehydrationBridge. Sharing the instance ensures
 * that assets Fleet deposits are immediately visible to RAS AL AMR's
 * compilation pipeline with no manual intervention.
 *
 * MINISTRY VII — REAL FLEET INFRASTRUCTURE: the former
 * createUnbuiltAlWatinPlaceholder() (unbuilt-al-watin-placeholder.ts,
 * now deleted) is replaced by buildFleetRuntime(vaultManager) —
 * a synchronous factory that wires real OperationLedgerManager (SQLite),
 * real FleetRegistry, NativeStructuralAdapter (WRITING/DIRECTORIAL), and
 * CinematicAssemblyAdapter (VISUAL). CINEMATIC canvas export no longer
 * unconditionally throws; it dispatches a real job, durably records it in
 * the operation_ledger table, and returns PROCESSING render state.
 * fleetRuntime is exported so future resolution routes can reach the
 * AsynchronousResolutionGateway without a second composition.
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
import { SovereignVaultManager } from '../vault/sovereign-vault-manager';
import { VaultRehydrationBridge } from '../chambers/ras-al-amr/vault-rehydration-bridge';
import { PrePublishingBoundary } from '../chambers/ras-al-amr/pre-publishing-boundary';
import { SovereignOperationalEntryLayer } from './soel';
import { buildFleetRuntime } from '../orchestrator/fleet-materialization/fleet-factory';

/** One Sovereign Vault instance for this server process — shared by Fleet's deposit path and RAS AL AMR's rehydration read path. See MAG-LB-003. */
const vaultManager = new SovereignVaultManager();

/** Real Fleet runtime: real OperationLedgerManager (SQLite) + FleetRegistry + adapters + AsynchronousResolutionGateway. See Ministry VII. */
export const fleetRuntime = buildFleetRuntime(vaultManager);

const goalState = new GoalState();
const publicationRegistry = new MakmanPublicationRegistry();
const renderingBridge = new FlattenedRenderingBridge(fleetRuntime.dispatcher);
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
