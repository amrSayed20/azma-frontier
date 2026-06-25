/**
 * AZMA OS - Phase 3: Execution Layer
 * File: src/chambers/director/director-chamber-controller.ts
 * * Official entry point to the Director Chamber.
 * * Enforces chamber isolation, independent policy verification, and pure delegation.
 * * Operates asynchronously to support the multi-tenant commercial architecture.
 */

import { 
  DirectorInput, 
  PolicyClearance, 
  DirectorOutput, 
  ClearanceStatus 
} from '../../agents/director/director-types';
import { DirectorEngine } from '../../agents/director/director-engine';

export class DirectorChamberController {
  
  /**
   * The exclusive entry point for Al-Watin Al-Siyadi to interact with the Director Agent.
   * Awakens the chamber, validates sovereign bounds, and delegates execution.
   * * @param input The strictly typed Phase 2 mapping payload.
   * @param clearance The immutable policy token from the SovereignPolicyGuard.
   * @returns A Promise resolving to the final DirectorOutput.
   */
  public static async wake(input: DirectorInput, clearance: PolicyClearance): Promise<DirectorOutput> {
    
    // 1. Chamber Isolation & Anti-Bypass Verification
    // The Chamber must independently verify that it is legally allowed to process this payload.
    const isAuthorized = this.verifySovereignClearance(clearance);
    if (!isAuthorized) {
      return {
        success: false,
        error: `CHAMBER LOCKDOWN: Unauthorized entry attempt. Policy clearance is invalid or rejected. Status: ${clearance?.status || 'MISSING'}`
      };
    }

    // 2. Multi-Tenant Input Validation
    if (!input || !input.subscriberTenantId) {
      return {
        success: false,
        error: `CHAMBER LOCKDOWN: Commercial boundary violation. Payload is missing subscriberTenantId.`
      };
    }

    try {
      // 3. Delegate to Specialized Agent (Director Engine)
      // The Chamber itself does not think; it merely awakens the specialized intellect.
      // This is wrapped in a Promise to simulate the asynchronous boundary required for scale.
      const output = await Promise.resolve(DirectorEngine.execute(input, clearance));
      
      return output;

    } catch (error) {
      // 4. Safe Failure State
      // Ensures that an internal agent failure does not collapse the central orchestrator.
      return {
        success: false,
        error: `CHAMBER CRASH: DirectorEngine execution failed. ${(error as Error).message}`
      };
    }
  }

  /**
   * Internal security mechanism to validate the integrity of the Policy Clearance token
   * before allowing the payload to reach the engine.
   */
  private static verifySovereignClearance(clearance: PolicyClearance): boolean {
    if (!clearance) return false;
    if (clearance.status !== ClearanceStatus.APPROVED) return false;
    if (!clearance.guardSignature || clearance.guardSignature === 'REJECTED_NIL_SIGNATURE') return false;
    
    return true;
  }
}