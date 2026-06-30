import { randomUUID } from 'crypto';
import type {
  FounderSession,
  SovereignActionType,
  SovereignAuthorityContract,
  SovereignAuthorityToken,
} from './sovereign-identity-contract';

const TOKEN_TTL_MS = 5 * 60 * 1_000; // 5 minutes

export class SovereignAuthorityService implements SovereignAuthorityContract {
  readonly serviceName = 'SovereignAuthorityService' as const;

  private readonly tokens = new Map<string, SovereignAuthorityToken>();

  authorizeAction(session: FounderSession, action: SovereignActionType): SovereignAuthorityToken {
    if (session.mode !== 'FOUNDER') {
      throw new Error('Authority denied: Founder Mode required to authorize sovereign actions');
    }
    const now = new Date();
    const token: SovereignAuthorityToken = {
      tokenId: randomUUID(),
      sessionId: session.sessionId,
      action,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
      used: false,
    };
    this.tokens.set(token.tokenId, token);
    return token;
  }

  isAuthorized(token: SovereignAuthorityToken, action: SovereignActionType): boolean {
    const stored = this.tokens.get(token.tokenId);
    if (stored === undefined) return false;
    if (stored.used) return false;
    if (stored.action !== action) return false;
    if (stored.expiresAt.getTime() < Date.now()) return false;
    return true;
  }

  revokeToken(tokenId: string): void {
    const stored = this.tokens.get(tokenId);
    if (stored !== undefined) {
      this.tokens.set(tokenId, { ...stored, used: true });
    }
  }

  consumeToken(tokenId: string): void {
    const stored = this.tokens.get(tokenId);
    if (stored !== undefined) {
      this.tokens.set(tokenId, { ...stored, used: true });
    }
  }
}
