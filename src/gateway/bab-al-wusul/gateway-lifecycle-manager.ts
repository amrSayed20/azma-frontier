/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/gateway-lifecycle-manager.ts
 * * The Gateway Lifecycle Manager.
 * Orchestrates the operational state of the Omni-Gateway. Handles graceful 
 * shutdowns, maintenance mode enforcement, and orchestrates the live traffic 
 * flow between the external transport layer and the internal OmniGatewayEndpoint.
 */

import { GatewayOperationalState } from './gateway-topology-contracts';
import { UntrustedClientPayload, GatewayResponse } from './authentication-contracts';
import { OmniGatewayEndpoint } from './gateway-bootstrapper';
import { GatewayDiagnosticsService } from './gateway-diagnostics-service';

// ==========================================
// 1. LIFECYCLE CONFIGURATION
// ==========================================

export interface LifecycleConfiguration {
  readonly maxShutdownDrainTimeMs: number; // Maximum time to wait for active requests to finish before hard exit
}

// ==========================================
// 2. THE LIFECYCLE MANAGER
// ==========================================

export class GatewayLifecycleManager {
  private currentState: GatewayOperationalState = GatewayOperationalState.BOOTSTRAPPING;
  private activeTrafficCount: number = 0;

  constructor(
    private readonly endpoint: OmniGatewayEndpoint,
    private readonly diagnostics: GatewayDiagnosticsService,
    private readonly config: LifecycleConfiguration = { maxShutdownDrainTimeMs: 30000 }
  ) {
    this.updateState(GatewayOperationalState.BOOTSTRAPPING);
  }

  // ==========================================
  // OPERATIONAL STATE CONTROLS
  // ==========================================

  /**
   * Opens the perimeter to external traffic. 
   * Called automatically after the Bootstrapper successfully wires the handlers.
   */
  public activate(): void {
    if (this.currentState === GatewayOperationalState.ONLINE) return;
    this.updateState(GatewayOperationalState.ONLINE);
  }

  /**
   * Engages Maintenance Mode. 
   * Active requests finish naturally. New requests receive a standardized 503-style rejection.
   */
  public enableMaintenanceMode(): void {
    this.updateState(GatewayOperationalState.MAINTENANCE);
  }

  /**
   * Initiates a graceful shutdown of the gateway.
   * Stops accepting new traffic and waits for the active traffic count to reach zero.
   * * @returns A promise that resolves when the gateway is perfectly drained or the timeout is reached.
   */
  public async executeGracefulShutdown(): Promise<void> {
    this.updateState(GatewayOperationalState.OFFLINE);
    
    const startTime = Date.now();
    
    // Non-blocking drainage loop
    while (this.activeTrafficCount > 0) {
      if (Date.now() - startTime > this.config.maxShutdownDrainTimeMs) {
        // In a production environment, this event should be logged to the Sovereign Operation Ledger
        console.warn(`[Bab Al-Wusul] Shutdown timeout reached. Forcing termination of ${this.activeTrafficCount} active requests.`);
        break;
      }
      // Yield the event loop to allow pending requests to resolve
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // ==========================================
  // TRAFFIC INTERCEPTION & ROUTING
  // ==========================================

  /**
   * The master traffic entry point. 
   * External transport layers (Express, WebSockets) must call this method instead of 
   * communicating with the OmniGatewayEndpoint directly.
   */
  public async processTraffic<TPayload, TResponseData>(
    routePath: string,
    untrustedPayload: UntrustedClientPayload<TPayload>,
    rawAuthorizationHeader: string | undefined | null
  ): Promise<GatewayResponse<TResponseData>> {
    
    // 1. Boundary State Enforcement
    if (this.currentState === GatewayOperationalState.OFFLINE) {
      return this.buildSystemRejection('GATEWAY_OFFLINE', 'Bab Al-Wusul is currently offline and not accepting traffic.');
    }

    if (this.currentState === GatewayOperationalState.MAINTENANCE) {
      return this.buildSystemRejection('GATEWAY_MAINTENANCE', 'AZMA OS is currently undergoing sovereign maintenance. Please try again later.');
    }

    if (this.currentState === GatewayOperationalState.BOOTSTRAPPING) {
      return this.buildSystemRejection('GATEWAY_BOOTSTRAPPING', 'The gateway is still initializing internal chambers. Traffic temporarily rejected.');
    }

    // 2. Traffic Observability Wiring
    this.activeTrafficCount++;
    this.diagnostics.incrementRequestCount();

    try {
      // 3. Delegate to the strict execution boundary
      return await this.endpoint.processRequest<TPayload, TResponseData>(
        routePath,
        untrustedPayload,
        rawAuthorizationHeader
      );
    } finally {
      // 4. Guaranteed Drainage Cleanup
      this.activeTrafficCount--;
      this.diagnostics.decrementRequestCount();
    }
  }

  // ==========================================
  // INTERNAL UTILITIES
  // ==========================================

  private updateState(newState: GatewayOperationalState): void {
    this.currentState = newState;
    this.diagnostics.updateOperationalState(newState);
  }

  private buildSystemRejection(code: string, message: string): GatewayResponse<any> {
    return {
      success: false,
      error: { code, message },
      meta: {
        traceId: 'SYSTEM_BOUNDARY_REJECTION',
        processedAtMs: Date.now()
      }
    };
  }
}