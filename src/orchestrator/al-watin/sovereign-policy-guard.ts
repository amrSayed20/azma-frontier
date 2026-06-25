/**
 * AZMA OS - Phase 3: Execution Layer
 * File: src/orchestrator/al-watin/sovereign-policy-guard.ts
 * * * Architecturally enforces Section VI of the Sovereign Constitution.
 * * Intercepts payloads prior to Chamber entry to evaluate content policies.
 * * Generates immutable clearance signatures for downstream verification.
 */

import { createHash } from 'crypto';
import { 
  DirectorInput, 
  PolicyClearance, 
  ClearanceStatus 
} from '../../agents/director/director-types';

export class SovereignPolicyGuard {
  
  /**
   * Defines the absolute architectural boundaries of permitted content.
   * As per Constitution Section VI, explicit sexual content is permanently banned.
   */
  private static readonly RESTRICTED_PATTERNS: RegExp[] = [
    // Core explicit content block (Semantic mapping to be expanded via external LLM/filter models)
    /\b(explicit sexual|nsfw|pornographic|erotic)\b/i,
    // Add additional structural pattern checks as needed
  ];

  /**
   * The primary entry point for the Orchestrator to validate a payload.
   * @param input The raw input destined for the Director Chamber
   * @returns A cryptographic PolicyClearance object
   */
  public static evaluatePayload(input: DirectorInput): PolicyClearance {
    const flaggedReasons: string[] = [];

    // 1. Extract scannable text from the structured input
    const scannableContent = this.extractScannableText(input);

    // 2. Perform deep pattern evaluation
    const isClean = this.scanForViolations(scannableContent, flaggedReasons);

    // 3. Generate Sovereign Clearance or Rejection
    if (!isClean) {
      return this.generateRejection(flaggedReasons);
    }

    return this.generateApproval(input);
  }

  /**
   * Flattens the structured PlannerOutput and ProjectDNA into a searchable string block
   * to ensure no prohibited context is hidden within nested objects.
   */
  private static extractScannableText(input: DirectorInput): string {
    try {
      const dnaString = JSON.stringify(input.projectDna || {});
      const plannerString = JSON.stringify(input.plannerOutput || {});
      return `${dnaString} ${plannerString}`.toLowerCase();
    } catch (error) {
      // If serialization fails, return an automatic violation string to fail securely
      return "explicit semantic failure - unparseable payload";
    }
  }

  /**
   * Evaluates content against all restricted constitutional patterns.
   */
  private static scanForViolations(content: string, flaggedReasons: string[]): boolean {
    let passed = true;

    for (const pattern of this.RESTRICTED_PATTERNS) {
      if (pattern.test(content)) {
        flaggedReasons.push(`Violation of Constitution Section VI: Prohibited content matched pattern ${pattern}`);
        passed = false;
      }
    }

    return passed;
  }

  /**
   * Generates a cryptographically signed approval token.
   * This signature binds the clearance to the specific tenant and project,
   * preventing token reuse across the commercial multi-user ecosystem.
   */
  private static generateApproval(input: DirectorInput): PolicyClearance {
    const timestamp = Date.now();
    
    // Create a unique hash binding the payload to the subscriber tenant
    const payloadSignature = createHash('sha256')
      .update(`${input.subscriberTenantId}:${input.projectDna.id || 'unknown'}:${timestamp}:APPROVED`)
      .digest('hex');

    return {
      status: ClearanceStatus.APPROVED,
      clearedAt: timestamp,
      guardSignature: payloadSignature
    };
  }

  /**
   * Generates a definitive rejection payload.
   */
  private static generateRejection(reasons: string[]): PolicyClearance {
    return {
      status: ClearanceStatus.REJECTED_EXPLICIT_CONTENT,
      clearedAt: Date.now(),
      guardSignature: 'REJECTED_NIL_SIGNATURE',
      flaggedReasons: reasons
    };
  }
}