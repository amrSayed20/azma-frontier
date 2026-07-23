/**
 * AZMA OS — SOVEREIGN OPERATIONAL ENTRY LAYER
 * PLACEHOLDER — NOT REAL FLEET DISPATCH/LEDGER INFRASTRUCTURE
 * (Construction ID MAG-LB-001, Vault-sharing updated by MAG-LB-003)
 *
 * NAMING NOTE (Construction Phase IV Constitutional Directive,
 * 2026-07-12): this file's own name and internal identifiers
 * (UnbuiltAlWatinCompositionError, createUnbuiltAlWatinPlaceholder) still
 * reference "Al-Watin," the pre-Sovereign-Body name for the fleet
 * dispatch/ledger system this placeholder stands in for
 * (src/orchestrator/fleet-materialization/, renamed from al-watin this
 * same phase). "Al-Wateen" is now permanently reserved for the
 * Sovereign Body's Constitutional Heart (src/sovereign-heart/) — a
 * different, unrelated organ. This file's own identifiers were
 * deliberately left unrenamed here: the authorizing directive named only
 * src/orchestrator/al-watin/ itself, and renaming this file would also
 * require touching composition.ts's import of it, expanding scope beyond
 * what was authorized. Flagged as optional future cleanup, not assumed
 * included.
 *
 * FlattenedRenderingBridge (Makman Al-Ghayah, Package II) requires a real
 * FleetDispatcher (src/orchestrator/fleet-materialization/fleet/fleet-dispatcher.ts)
 * in its constructor. No real IFleetRegistry (provider adapters) or
 * ILedgerManager composition exists anywhere in this repository — a
 * platform-level gap already disclosed since MAG-LF-001. Those two
 * remain placeholders below; every one of their methods throws loudly if
 * actually invoked, rather than fabricating a successful result.
 *
 * VAULT MANAGER IS NO LONGER A PLACEHOLDER (MAG-LB-003): FleetDispatcher's
 * IVaultManager is now the same real SovereignVaultManager instance RAS AL
 * AMR's VaultRehydrationBridge reads from (see composition.ts) — the
 * minimum bridge required so that whatever FleetDispatcher.resolveOperation()
 * eventually deposits becomes visible to RAS AL AMR's compilation with no
 * manual intervention. This does not make FleetDispatcher itself real:
 * executeMaterialization() still cannot succeed without a real
 * IFleetRegistry/ILedgerManager, which remain this file's disclosed,
 * unresolved gap.
 */

import type { OperationLedgerEntry } from '../orchestrator/fleet-materialization/ledger/operation-ledger-types';
import type { IFleetRegistry, IProviderAdapter } from '../orchestrator/fleet-materialization/fleet/fleet-types';
import type { ILedgerManager, IVaultManager } from '../orchestrator/fleet-materialization/fleet/fleet-dispatcher';
import { FleetDispatcher } from '../orchestrator/fleet-materialization/fleet/fleet-dispatcher';

class UnbuiltAlWatinCompositionError extends Error {
  constructor(operation: string) {
    super(`Al-Watin dispatch/ledger composition is not built (platform-level gap, disclosed since MAG-LF-001). [${operation}] cannot proceed — this placeholder exists only to satisfy a constructor type for code paths that never call it.`);
    this.name = 'UnbuiltAlWatinCompositionError';
  }
}

class PlaceholderFleetRegistry implements IFleetRegistry {
  public getAdaptersForCapability(): IProviderAdapter[] {
    return [];
  }
  public registerAdapter(): void {
    throw new UnbuiltAlWatinCompositionError('FleetRegistry.registerAdapter');
  }
  public removeAdapter(): void {
    throw new UnbuiltAlWatinCompositionError('FleetRegistry.removeAdapter');
  }
}

class PlaceholderLedgerManager implements ILedgerManager {
  public createEntry(): Promise<OperationLedgerEntry> {
    throw new UnbuiltAlWatinCompositionError('LedgerManager.createEntry');
  }
  public updateState(): Promise<void> {
    throw new UnbuiltAlWatinCompositionError('LedgerManager.updateState');
  }
  public getEntry(): Promise<OperationLedgerEntry> {
    throw new UnbuiltAlWatinCompositionError('LedgerManager.getEntry');
  }
}

/**
 * Constructs a FleetDispatcher whose FleetRegistry/LedgerManager remain
 * unbuilt placeholders (throw if invoked), but whose VaultManager is the
 * real, shared instance passed in — so any asset it successfully deposits
 * (once real dispatch/ledger composition exists) is immediately visible
 * to RAS AL AMR's compilation pipeline. Do not "improve" the two
 * remaining placeholders here; they are a disclosed gap, not a
 * foundation to build on without separate authorization.
 */
export function createUnbuiltAlWatinPlaceholder(vaultManager: IVaultManager): FleetDispatcher {
  return new FleetDispatcher(
    new PlaceholderFleetRegistry(),
    new PlaceholderLedgerManager(),
    vaultManager,
  );
}
