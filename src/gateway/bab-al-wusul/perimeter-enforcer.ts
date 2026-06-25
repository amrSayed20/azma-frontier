/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/perimeter-enforcer.ts
 * 
 * The Perimeter Enforcer (Authentication Middleware).
 * The physical execution boundary that intercepts untrusted traffic, 
 * validates cryptographic identity, and outputs isolated, verified 
 * routing envelopes for the internal chambers.
 */

import { 
  SovereignSessionContext, 
  UntrustedClientPayload, 
  VerifiedGatewayRequest 
} from './authentication-contracts';

// ==========================================
// 1. DEPENDENCY ABSTRACTIONS
// ==========================================

/**
 * Agnostic interface for the cryptographic token validation engine.
 * Decouples Bab Al-Wusul from specific providers (Auth0, Firebase, custom JWT).
 */
export interface ITokenVerifier {
  verifyToken(rawToken: string): Promise<SovereignSessionContext>;
}

/**
 * Helper interface for generating secure, unique trace IDs for the Operation Ledger.
 */
export interface ITraceIdGenerator {
  generate(): string;
}

// ==========================================
// 2. THE PERIMETER ENFORCER
// ==========================================

export class PerimeterEnforcer {
  constructor(
    private readonly tokenVerifier: ITokenVerifier,
    private readonly traceIdGenerator: ITraceIdGenerator
  ) {}

  /**
   * The primary security checkpoint for all inbound API traffic.
   * Enforces Constraint 4: Sovereign Context Enforcement.
   * 
   * @param untrustedPayload The raw JSON body sent by the Al-Mantahaa UI.
   * @param rawAuthorizationHeader The 'Authorization: Bearer <token>' header.
   * @returns A strictly typed, mathematically secure envelope for internal routing.
   * @throws Error if authentication fails, preventing the request from advancing.
   */
  public async enforceBoundary<T>(
    untrustedPayload: UntrustedClientPayload<T>,
    rawAuthorizationHeader: string | undefined | null
  ): Promise<VerifiedGatewayRequest<T>> {
    
    // 1. Token Extraction
    if (!rawAuthorizationHeader || !rawAuthorizationHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Missing or malformed Authorization header. Request terminated at perimeter.');
    }

    const token = rawAuthorizationHeader.split(' ')[1];
    if (!token) {
      throw new Error('Unauthorized: Empty token payload. Request terminated at perimeter.');
    }

    // 2. Cryptographic Verification
    // This is where we mathematically prove who the user is.
    // If the token is expired or tampered with, this throws an error and the request dies here.
    const verifiedContext = await this.tokenVerifier.verifyToken(token);

    // 3. Absolute Session Validation
    if (verifiedContext.expiresAt < Date.now()) {
      throw new Error(`Unauthorized: Sovereign session for Tenant [${verifiedContext.subscriberTenantId}] has expired.`);
    }

    // 4. Secure Envelope Construction
    // We bind the verified context to the untrusted data. 
    // Internal chambers will now look ONLY at 'request.context.subscriberTenantId'.
    return {
      context: verifiedContext,
      payload: untrustedPayload.data,
      gatewayTimestampMs: Date.now(),
      traceId: this.traceIdGenerator.generate()
    };
  }
}