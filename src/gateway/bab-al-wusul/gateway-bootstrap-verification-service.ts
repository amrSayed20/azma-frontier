/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/gateway-bootstrap-verification-service.ts
 * * The Gateway Bootstrap Verification Service.
 * Acts as the constitutional notary during system startup. Validates the integrity 
 * of the assembled gateway, compares mounted handlers against the official route 
 * registry, and certifies whether the perimeter is eligible to go ONLINE.
 * * Enforces Constraint 5: Strict Architectural Isolation by executing verification
 * logic entirely independent of routing or business operations.
 */

import { 
  GatewayBootstrapVerification, 
  GatewayTopologyReport, 
  RouteTopologyEntry 
} from './gateway-topology-contracts';
import { ChamberRouteRegistry } from './chamber-route-registry';
import { ITraceIdGenerator } from './perimeter-enforcer';

export class GatewayBootstrapVerificationService {
  constructor(private readonly traceIdGenerator: ITraceIdGenerator) {}

  /**
   * Performs the official integrity audit of the Omni-Gateway post-assembly.
   * Generates the immutable genesis artifact detailing exactly what capabilities 
   * are exposed to the perimeter.
   * * @param mountedHandlers A map of the internal chambers successfully bound to the router.
   * @param isPerimeterEnforcerActive Boolean indicating the cryptographic firewall is armed.
   * @param isOmniRouterActive Boolean indicating the dispatch mechanism is initialized.
   * @returns The immutable bootstrap verification artifact.
   */
  public generateVerificationReport(
    mountedHandlers: Map<string, unknown>,
    isPerimeterEnforcerActive: boolean,
    isOmniRouterActive: boolean
  ): GatewayBootstrapVerification {
    
    const topologyReport = this.compileTopologyReport(mountedHandlers);

    return {
      bootTimestampMs: Date.now(),
      isPerimeterEnforcerActive,
      isOmniRouterActive,
      topologyReport,
      verifiedTraceId: this.traceIdGenerator.generate() // The Genesis Trace ID
    };
  }

  /**
   * Evaluates the verification report to determine if the gateway is constitutionally 
   * permitted to accept external traffic.
   * * @param report The verification report generated during bootstrap.
   * @returns True if the gateway meets sovereign security and routing requirements.
   */
  public isEligibleForOnlineState(report: GatewayBootstrapVerification): boolean {
    // 1. Cryptographic perimeter MUST be active
    if (!report.isPerimeterEnforcerActive) return false;

    // 2. Dispatch mechanism MUST be active
    if (!report.isOmniRouterActive) return false;

    // 3. The registry MUST contain definitions (prevents empty boot)
    if (report.topologyReport.totalRegisteredRoutes === 0) return false;

    // Note: We do NOT fail eligibility if `missingRoutes` > 0.
    // Given the current Frontend state (disconnected/missing chambers), 
    // partial deployment of backend handlers is architecturally valid and expected.
    return true;
  }

  // ==========================================
  // INTERNAL AUDITING LOGIC
  // ==========================================

  private compileTopologyReport(mountedHandlers: Map<string, unknown>): GatewayTopologyReport {
    const allRoutes = ChamberRouteRegistry.getAllRoutes();
    const mountedRoutes = Array.from(mountedHandlers.keys());

    const routes: RouteTopologyEntry[] = allRoutes.map(routePath => {
      const handler = mountedHandlers.get(routePath);
      return {
        routePath,
        isMounted: mountedRoutes.includes(routePath),
        // Capture the class name of the handler for diagnostic clarity
        handlerType: handler ? (handler as any).constructor?.name : undefined
      };
    });

    return {
      totalRegisteredRoutes: allRoutes.length,
      routes,
      // Explicitly identify constitutionally defined routes that lack an active execution chamber
      missingRoutes: allRoutes.filter(route => !mountedRoutes.includes(route))
    };
  }
}