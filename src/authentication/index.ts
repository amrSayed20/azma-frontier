/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Execution Package III. Real, credentials-based Creator and Founder
 * authentication, built on the Persistent Storage Foundation. See
 * auth-service.ts and founder-bootstrap.ts for the full disclosure of
 * what this is (a self-contained email/password + server-side-session
 * system) and why (no external OAuth/managed-auth credential can be
 * provisioned or tested in this environment).
 */

export type { AuthResult, AuthOutcome, AuthSuccess, AuthFailure, AuthFailureReason, VerifiedSession, CreatorRole } from './types';
export { signUp, logIn, logOut, verifySession } from './auth-service';
export { ensureFounderAccountExists } from './founder-bootstrap';
export { hashPassword, verifyPassword } from './password-hashing';
export { generateSessionId } from './session-token';
