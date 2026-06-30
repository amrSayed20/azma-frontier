import type { SovereignActionType } from '../sovereign-command/sovereign-command-types';

export type { SovereignActionType };

// ── Founder session ──────────────────────────────────────────────────────────

export type FounderMode = 'FOUNDER' | 'USER';

export interface FounderSession {
  readonly sessionId: string;
  readonly mode: FounderMode;
  readonly startedAt: Date;
  readonly switchedAt: Date;
}

// ── Authority token ──────────────────────────────────────────────────────────

export interface SovereignAuthorityToken {
  readonly tokenId: string;
  readonly sessionId: string;
  readonly action: SovereignActionType;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly used: boolean;
}

// ── Service contracts ────────────────────────────────────────────────────────

export interface FounderIdentityContract {
  readonly serviceName: 'FounderIdentityService';
  isFounderSession(token: string): boolean;
  switchToFounderMode(credential: string): FounderSession;
  switchToUserMode(): FounderSession;
  getCurrentMode(): FounderMode;
}

export interface FounderSessionContract {
  readonly serviceName: 'FounderSessionService';
  getSession(): FounderSession | null;
  createSession(mode: FounderMode): FounderSession;
  updateMode(mode: FounderMode): FounderSession;
}

export interface SovereignAuthorityContract {
  readonly serviceName: 'SovereignAuthorityService';
  authorizeAction(session: FounderSession, action: SovereignActionType): SovereignAuthorityToken;
  isAuthorized(token: SovereignAuthorityToken, action: SovereignActionType): boolean;
  revokeToken(tokenId: string): void;
}

// ── Grouped contract (exposed on AzmaOsRuntimeContract) ─────────────────────

export interface SovereignIdentityContract {
  readonly founderIdentity: FounderIdentityContract;
  readonly founderSession: FounderSessionContract;
  readonly sovereignAuthority: SovereignAuthorityContract;
}
