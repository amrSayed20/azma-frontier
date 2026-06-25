/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/authentication-contracts.ts
 * 
 * The Identity & Perimeter Authentication Contracts.
 * Establishes the constitutional boundary between untrusted client space 
 * and the verified internal execution environment. 
 * 
 * Enforces Constraint 4: Sovereign Context Enforcement (Zero-Trust Identity).
 * Enforces Constraint 5: Strict Architectural Isolation (No Business Logic).
 */

// ==========================================
// 1. IDENTITY & CONTEXT CONTRACTS
// ==========================================

export enum SovereignRole {
  CREATOR = 'CREATOR',
  CONSUMER = 'CONSUMER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

/**
 * The absolute, immutable source of truth for the user's identity.
 * Populated EXCLUSIVELY by the Gateway's authentication middleware 
 * using cryptographically verified tokens (e.g., JWT). 
 * Client-provided tenant IDs are strictly ignored and overwritten by this.
 */
export interface SovereignSessionContext {
  readonly subscriberTenantId: string;
  readonly sessionId: string;
  readonly roles: SovereignRole[];
  readonly activeSubscriptionTiers: string[];
  readonly isAgeVerified: boolean;
  readonly geoRegion?: string; // Resolved via Cloudflare/AWS headers at the edge
  readonly issuedAt: number;
  readonly expiresAt: number;
}

// ==========================================
// 2. BOUNDARY PAYLOAD CONTRACTS
// ==========================================

/**
 * Represents a raw, untrusted request payload arriving from the Al-Mantahaa UI.
 * No identity or authorization fields in this payload are trusted by the internal architecture.
 */
export interface UntrustedClientPayload<T = unknown> {
  readonly data: T;
  readonly clientMetadata?: Record<string, unknown>;
}

/**
 * The definitive, sanitized envelope that Bab Al-Wusul routes to internal 
 * chambers (Qiyamah, Ras Al-Amr, Makman Al-Ghayah). 
 * 
 * This structure physically forces internal chambers to read identity 
 * from the 'context' property rather than the 'payload' property.
 */
export interface VerifiedGatewayRequest<T> {
  readonly context: SovereignSessionContext;
  readonly payload: T;
  readonly gatewayTimestampMs: number;
  readonly traceId: string; // Essential for the Operation Ledger and debugging
}

// ==========================================
// 3. GATEWAY RESPONSE CONTRACTS
// ==========================================

/**
 * The standardized API response structure returned to the Frontend UI.
 * Designed to integrate seamlessly with the existing Al-Mantahaa UI architecture.
 */
export interface GatewayResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly requiredAction?: string; // e.g., 'REQUIRE_LOGIN', 'REQUIRE_PURCHASE'
  };
  readonly meta: {
    readonly traceId: string;
    readonly processedAtMs: number;
  };
}