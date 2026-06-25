/**
 * AZMA OS - Phase 3: Execution Layer
 * File: src/orchestrator/al-watin/execution-router.ts
 * * The central execution bridge for Al-Watin Al-Siyadi.
 * * Enforces constitutional policy prior to any chamber activation.
 * * Maintains absolute multi-tenant isolation and stateless routing.
 */

import { 
  DirectorInput, 
  DirectorOutput, 
  ClearanceStatus 
} from '../../agents/director/director-types';
import { SovereignPolicyGuard } from './sovereign-policy-guard';
import { DirectorChamberController } from '../../chambers/director/director-chamber-controller';

export class ExecutionRouter {
  
  /**
   * Routes a verified Phase 2 planning payload into the Phase 3 Director Chamber.
   * This is the exclusive pathway from planning to directing.
   * * @param input The heavily typed payload containing PlannerOutput and ProjectDNA.
   * @returns A Promise resolving to the generated ProductionPackage, or a rejection error.
   */
  public static async routeToDirector(input: DirectorInput): Promise<DirectorOutput> {
    
    // 1. Multi-Tenant Architectural Verification
    // Ensure no payload enters the routing matrix without a definitive commercial subscriber ID.
    if (!input || !input.subscriberTenantId) {
      return {
        success: false,
        error: `ORCHESTRATOR ROUTING FAILURE: Payload rejected. Missing subscriberTenantId.`
      };
    }

    try {
      // 2. Sovereign Policy Interception
      // The router mandates policy evaluation BEFORE the destination chamber is ever contacted.
      const clearance = SovereignPolicyGuard.evaluatePayload(input);

      if (clearance.status !== ClearanceStatus.APPROVED) {
        return {
          success: false,
          error: `ORCHESTRATOR ROUTING HALTED: Payload failed Sovereign Policy Guard. Status: ${clearance.status}`
        };
      }

      // 3. Isolated Chamber Activation
      // The payload is clean. The router crosses the boundary and awakens the Chamber Controller.
      // Awaits asynchronously to ensure the main orchestration thread is never blocked.
      const directorResult = await DirectorChamberController.wake(input, clearance);

      // 4. Return to Orchestrator Core
      // The result (success or failure) is returned to the higher Al-Watin state manager
      // so it can eventually be routed to the Phase 4 Production Chambers.
      return directorResult;

    } catch (error) {
      // 5. Global Failsafe
      // Ensure that unexpected routing or chamber crashes do not bring down Al-Watin Al-Siyadi.
      return {
        success: false,
        error: `ORCHESTRATOR CATASTROPHIC EXCEPTION: Failed during routing to Director Chamber. ${(error as Error).message}`
      };
    }
  }
}