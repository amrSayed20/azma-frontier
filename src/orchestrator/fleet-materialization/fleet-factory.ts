/**
 * AZMA OS — Fleet Materialization Architecture
 * File: src/orchestrator/fleet-materialization/fleet-factory.ts
 *
 * MINISTRY VII — REAL FLEET INFRASTRUCTURE
 *
 * Synchronous factory for the Fleet runtime — used by composition.ts which
 * runs at module load time (Next.js server start) and cannot await.
 *
 * FleetMaterializationBootstrapper.bootstrap() (the async path) remains
 * unchanged and is used by the legacy bootstrapper. This factory is the
 * production composition path; the bootstrapper is preserved for alignment.
 *
 * buildFleetRuntime() returns both the FleetDispatcher (consumed by
 * FlattenedRenderingBridge) and the AsynchronousResolutionGateway (available
 * for future resolution routes — Ministry VIII or later).
 */

import { getDb } from '../../persistent-storage/db';
import type { IVaultManager } from './fleet/fleet-dispatcher';
import { FleetDispatcher } from './fleet/fleet-dispatcher';
import { FleetRegistry } from './fleet/fleet-registry';
import { OperationLedgerManager } from './ledger/operation-ledger-manager';
import { SecureContextHydrator } from './fleet/secure-context-hydrator';
import { NativeStructuralAdapter } from './fleet/adapters/native-structural-adapter';
import { CinematicAssemblyAdapter } from './fleet/adapters/cinematic-assembly-adapter';
import { AsynchronousResolutionGateway } from './fleet/asynchronous-resolution-gateway';

export interface FleetRuntime {
  readonly dispatcher: FleetDispatcher;
  readonly resolutionGateway: AsynchronousResolutionGateway;
}

/**
 * Builds the production Fleet runtime synchronously.
 * Adapters are registered via registerAdapterSync() using their static
 * CAPABILITIES declarations — no async getCapabilities() call needed.
 * The DatabaseSync instance is the shared singleton from getDb().
 */
export function buildFleetRuntime(vaultManager: IVaultManager): FleetRuntime {
  const db = getDb();
  const ledgerManager = new OperationLedgerManager(db);
  const contextHydrator = new SecureContextHydrator(vaultManager);
  const registry = new FleetRegistry();

  const nativeAdapter = new NativeStructuralAdapter(contextHydrator);
  const cinematicAdapter = new CinematicAssemblyAdapter(contextHydrator);

  registry.registerAdapterSync(nativeAdapter, NativeStructuralAdapter.CAPABILITIES);
  registry.registerAdapterSync(cinematicAdapter, CinematicAssemblyAdapter.CAPABILITIES);

  const dispatcher = new FleetDispatcher(registry, ledgerManager, vaultManager);
  const resolutionGateway = new AsynchronousResolutionGateway(dispatcher, ledgerManager);

  return { dispatcher, resolutionGateway };
}
