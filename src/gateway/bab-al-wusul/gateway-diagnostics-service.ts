/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/gateway-diagnostics-service.ts
 * * The Gateway Diagnostics Service.
 * Synthesizes live runtime telemetry, route topology, and operational states 
 * into standardized observability snapshots. Decouples monitoring from 
 * execution logic to maintain architectural isolation.
 */

import { 
  GatewayOperationalState, 
  GatewayHealthMetrics, 
  GatewayTopologyReport, 
  GatewayObservabilitySnapshot,
  RouteTopologyEntry
} from './gateway-topology-contracts';
import { ChamberRouteRegistry } from './chamber-route-registry';

// ==========================================
// 1. DIAGNOSTICS SERVICE
// ==========================================

export class GatewayDiagnosticsService {
  private readonly startTimeMs: number = Date.now();
  private activeRequests: number = 0;
  private perimeterRejections: number = 0;
  private state: GatewayOperationalState = GatewayOperationalState.BOOTSTRAPPING;

  /**
   * Updates internal metrics. 
   * Note: These are called by the OmniRouter and PerimeterEnforcer 
   * via non-blocking lifecycle hooks.
   */
  public incrementRequestCount(): void { this.activeRequests++; }
  public decrementRequestCount(): void { this.activeRequests--; }
  public incrementRejectionCount(): void { this.perimeterRejections++; }
  public updateOperationalState(newState: GatewayOperationalState): void { this.state = newState; }

  /**
   * Produces a live snapshot of the gateway's topology and health.
   * * @param mountedHandlers A map of all internal handlers currently active.
   */
  public generateObservabilitySnapshot(mountedHandlers: Map<string, unknown>): GatewayObservabilitySnapshot {
    return {
      gatewayId: 'bab-al-wusul-primary',
      state: this.state,
      health: this.getHealthMetrics(),
      topology: this.getTopologyReport(mountedHandlers),
      snapshotTimestampMs: Date.now()
    };
  }

  // ==========================================
  // INTERNAL COMPOSITION LOGIC
  // ==========================================

  private getHealthMetrics(): GatewayHealthMetrics {
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTimeMs) / 1000),
      activeRequests: this.activeRequests,
      perimeterRejections: this.perimeterRejections
    };
  }

  private getTopologyReport(mountedHandlers: Map<string, unknown>): GatewayTopologyReport {
    const allRoutes = ChamberRouteRegistry.getAllRoutes();
    const mountedRoutes = Array.from(mountedHandlers.keys());

    const routes: RouteTopologyEntry[] = allRoutes.map(routePath => ({
      routePath,
      isMounted: mountedRoutes.includes(routePath),
      handlerType: mountedHandlers.get(routePath)?.constructor.name
    }));

    return {
      totalRegisteredRoutes: allRoutes.length,
      routes,
      missingRoutes: allRoutes.filter(route => !mountedRoutes.includes(route))
    };
  }
}