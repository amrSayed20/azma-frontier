/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/gateway-activation-coordinator.ts
 * * The Gateway Activation Coordinator.
 * The constitutional governance authority for gateway startup. Consumes verification 
 * reports, makes the final authorization decision, and commands the Lifecycle Manager 
 * to open the perimeter if and only if all sovereign safety requirements are met.
 * * Enforces Constraint 5: Strict Architectural Isolation.
 */

import { GatewayBootstrapVerification } from './gateway-topology-contracts';
import { GatewayBootstrapVerificationService } from './gateway-bootstrap-verification-service';
import { GatewayLifecycleManager } from './gateway-lifecycle-manager';

// ==========================================
// 1. ACTIVATION CONTRACTS
// ==========================================

/**
 * The definitive, immutable record of the gateway's activation attempt.
 * This is the exact Genesis Event payload that will be emitted to the 
 * Sovereign Operation Ledger in future phases.
 */
export interface ActivationDecisionArtifact {
  readonly isActivated: boolean;
  readonly activationTimestampMs: number;
  readonly verificationReport: GatewayBootstrapVerification;
  readonly rejectionReason?: string;
}

// ==========================================
// 2. THE ACTIVATION COORDINATOR
// ==========================================

export class GatewayActivationCoordinator {
  constructor(
    private readonly lifecycleManager: GatewayLifecycleManager,
    private readonly verificationService: GatewayBootstrapVerificationService
  ) {}

  /**
   * Executes the final transition sequence from BOOTSTRAPPING to ONLINE.
   * Physically prevents perimeter activation if verification requirements fail.
   * * @param mountedHandlers A map of the internally wired execution chambers.
   * @param isPerimeterEnforcerActive Truth value indicating cryptographic readiness.
   * @param isOmniRouterActive Truth value indicating routing infrastructure readiness.
   * @returns The immutable ActivationDecisionArtifact detailing the final outcome.
   */
  public executeActivationSequence(
    mountedHandlers: Map<string, unknown>,
    isPerimeterEnforcerActive: boolean,
    isOmniRouterActive: boolean
  ): ActivationDecisionArtifact {
    
    // 1. Generate the Constitutional Audit Report
    const verificationReport = this.verificationService.generateVerificationReport(
      mountedHandlers,
      isPerimeterEnforcerActive,
      isOmniRouterActive
    );

    // 2. Evaluate Eligibility
    const isEligible = this.verificationService.isEligibleForOnlineState(verificationReport);

    // 3. Authorization & State Transition
    if (isEligible) {
      // Safely open the perimeter to the external UI
      this.lifecycleManager.activate();

      return {
        isActivated: true,
        activationTimestampMs: Date.now(),
        verificationReport
      };
    } else {
      // Explicitly block activation and force the system into Maintenance/Safe mode.
      // The gateway will reject all traffic structurally rather than silently failing.
      this.lifecycleManager.enableMaintenanceMode();

      return {
        isActivated: false,
        activationTimestampMs: Date.now(),
        verificationReport,
        rejectionReason: 'Gateway failed constitutional bootstrap verification. Required perimeter or routing infrastructure is inactive.'
      };
    }
  }
}