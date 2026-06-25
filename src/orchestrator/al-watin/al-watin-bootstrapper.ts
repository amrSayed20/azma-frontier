/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/al-watin-bootstrapper.ts
 * 
 * The System Bootstrapper (Al-Watin Al-Siyadi Initialization).
 * The master executable file that wires all architectural components into 
 * a single, unified runtime instance ready for API and UI mounting.
 */

import { OperationLedgerManager } from './ledger/operation-ledger-manager';
import { SovereignVaultManager } from '../../vault/sovereign-vault-manager';
import { SecureContextHydrator } from './fleet/secure-context-hydrator';
import { FleetRegistry } from './fleet/fleet-registry';
import { NativeStructuralAdapter } from './fleet/adapters/native-structural-adapter';
import { FleetDispatcher } from './fleet/fleet-dispatcher';
import { QiyamahExecutionBoundary } from '../../core/chamber-integration/qiyamah-execution-boundary';
import { AsynchronousResolutionGateway } from './fleet/asynchronous-resolution-gateway';

/**
 * The sealed container holding the fully initialized AZMA OS materialization ecosystem.
 * This object is injected into the application's top-level HTTP/WebSocket controllers.
 */
export class AlWatinRuntime {
  public readonly qiyamahBoundary: QiyamahExecutionBoundary;
  public readonly resolutionGateway: AsynchronousResolutionGateway;
  
  // Exposing managers strictly for internal testing or advanced ecosystem access,
  // but they are fundamentally encapsulated by the boundaries during standard operations.
  public readonly vaultManager: SovereignVaultManager;
  public readonly ledgerManager: OperationLedgerManager;

  private constructor(
    qiyamahBoundary: QiyamahExecutionBoundary,
    resolutionGateway: AsynchronousResolutionGateway,
    vaultManager: SovereignVaultManager,
    ledgerManager: OperationLedgerManager
  ) {
    this.qiyamahBoundary = qiyamahBoundary;
    this.resolutionGateway = resolutionGateway;
    this.vaultManager = vaultManager;
    this.ledgerManager = ledgerManager;
  }

  /**
   * The master initialization sequence.
   * Instantiates the entire materialization infrastructure in strict topological order
   * based on exact architectural dependencies.
   */
  public static async bootstrap(): Promise<AlWatinRuntime> {
    
    // 1. Initialize Foundational State Managers (No external dependencies)
    const ledgerManager = new OperationLedgerManager();
    const vaultManager = new SovereignVaultManager();

    // 2. Initialize Security & Hydration Layer
    const contextHydrator = new SecureContextHydrator(vaultManager);

    // 3. Initialize Provider Ecosystem Memory
    const fleetRegistry = new FleetRegistry();
    
    // 4. Instantiate & Register Adapters
    // As the OS grows, future external adapters (Veo, ElevenLabs, etc.) will be 
    // initialized and registered here seamlessly.
    const nativeAdapter = new NativeStructuralAdapter(contextHydrator);
    await fleetRegistry.registerAdapter(nativeAdapter);

    // 5. Initialize Core Orchestration Loop
    const fleetDispatcher = new FleetDispatcher(
      fleetRegistry,
      ledgerManager,
      vaultManager
    );

    // 6. Initialize External Application Boundaries
    const qiyamahBoundary = new QiyamahExecutionBoundary(fleetDispatcher);
    const resolutionGateway = new AsynchronousResolutionGateway(fleetDispatcher, ledgerManager);

    // 7. Return the sealed runtime instance
    return new AlWatinRuntime(
      qiyamahBoundary,
      resolutionGateway,
      vaultManager,
      ledgerManager
    );
  }
} 