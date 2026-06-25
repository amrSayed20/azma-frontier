/**
 * AZMA OS - Phase 8: Sovereign Master Composition (System Wiring)
 * File: src/system-root/root-infrastructure-providers.ts
 * * The Root Infrastructure Providers.
 * Provides the physical cryptographic and tracing engines required by 
 * Bab Al-Wusul. Implemented natively to eliminate third-party dependencies 
 * at the sovereign perimeter boundary.
 */

import * as crypto from 'crypto';
import { 
  ITokenVerifier, 
  ITraceIdGenerator, 
  SovereignSessionContext, 
  SovereignRole 
} from '../gateway/bab-al-wusul';

// ==========================================
// 1. TRACE ID GENERATOR
// ==========================================

export class SovereignTraceGenerator implements ITraceIdGenerator {
  /**
   * Generates a mathematically random UUIDv4.
   * Ensures absolute uniqueness for the Operation Ledger audit trails.
   */
  public generate(): string {
    return crypto.randomUUID();
  }
}

// ==========================================
// 2. CRYPTOGRAPHIC TOKEN VERIFIER
// ==========================================

export class SovereignTokenVerifier implements ITokenVerifier {
  constructor(private readonly jwtSecret: string) {}

  /**
   * A zero-dependency, native implementation of JWT verification.
   * Cryptographically proves identity using HMAC SHA-256 and strictly maps 
   * the payload into the internal SovereignSessionContext.
   * * @param rawToken The raw JWT string from the authorization header.
   * @returns The constitutionally verified session context.
   */
  public async verifyToken(rawToken: string): Promise<SovereignSessionContext> {
    const parts = rawToken.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Sovereign Security Violation: Malformed token structure. Request terminated.');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Cryptographic Signature Verification
    const expectedSignature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signatureB64 !== expectedSignature) {
      throw new Error('Sovereign Security Violation: Cryptographic signature mismatch. Token tampering detected.');
    }

    // 2. Payload Extraction & Decoding
    let payloadStr: string;
    try {
      payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    } catch (error) {
      throw new Error('Sovereign Security Violation: Invalid token encoding format.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;
    try {
      payload = JSON.parse(payloadStr);
    } catch (error) {
      throw new Error('Sovereign Security Violation: Unparseable token payload.');
    }

    // 3. Expiration Boundary Validation
    const nowMs = Date.now();
    const expiresAtMs = payload.exp ? payload.exp * 1000 : 0;
    
    if (expiresAtMs < nowMs) {
      throw new Error('Sovereign Security Violation: Token lifetime has expired.');
    }

    // 4. Constitutional Context Mapping
    // Strict structural mapping prevents unknown properties from polluting the internal environment
    return {
      subscriberTenantId: payload.sub || 'UNKNOWN_TENANT',
      sessionId: payload.jti || crypto.randomUUID(),
      // Coerce raw roles into the official SovereignRole enum
      roles: Array.isArray(payload.roles) ? payload.roles as SovereignRole[] : [SovereignRole.CONSUMER],
      activeSubscriptionTiers: Array.isArray(payload.tiers) ? payload.tiers : [],
      isAgeVerified: payload.ageVerified === true,
      geoRegion: payload.geo,
      issuedAt: payload.iat ? payload.iat * 1000 : nowMs,
      expiresAt: expiresAtMs
    };
  }
}