/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * Type Definitions
 */

import type { CreatorRole } from '../persistent-storage';

export type { CreatorRole };

export interface AuthResult {
  readonly creatorId: string;
  readonly role: CreatorRole;
  readonly sessionId: string;
  readonly expiresAt: number;
}

export type AuthFailureReason = 'invalid-input' | 'email-taken' | 'invalid-credentials';

export interface AuthFailure {
  readonly status: 'failed';
  readonly reason: AuthFailureReason;
  readonly message: string;
}

export interface AuthSuccess {
  readonly status: 'succeeded';
  readonly result: AuthResult;
}

export type AuthOutcome = AuthSuccess | AuthFailure;

export interface VerifiedSession {
  readonly creatorId: string;
  readonly role: CreatorRole;
}
