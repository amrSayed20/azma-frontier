import { createHash } from 'crypto';
import type { FounderIdentityContract, FounderMode, FounderSession } from './sovereign-identity-contract';
import type { FounderSessionService } from './founder-session-service';

export class FounderIdentityService implements FounderIdentityContract {
  readonly serviceName = 'FounderIdentityService' as const;

  private activeSessionId: string | null = null;

  constructor(
    private readonly credentialHash: string,
    private readonly sessionService: FounderSessionService,
  ) {}

  isFounderSession(token: string): boolean {
    return this.activeSessionId !== null && this.activeSessionId === token;
  }

  switchToFounderMode(credential: string): FounderSession {
    if (this.credentialHash.length === 0) {
      throw new Error('Founder credential not configured — set AZMA_FOUNDER_CREDENTIAL_HASH');
    }
    const hash = createHash('sha256').update(credential).digest('hex');
    if (hash !== this.credentialHash) {
      throw new Error('Invalid founder credential');
    }
    const session = this.sessionService.createSession('FOUNDER');
    this.activeSessionId = session.sessionId;
    return session;
  }

  switchToUserMode(): FounderSession {
    this.activeSessionId = null;
    return this.sessionService.updateMode('USER');
  }

  getCurrentMode(): FounderMode {
    return this.sessionService.getSession()?.mode ?? 'USER';
  }
}

export function createFounderIdentityService(
  sessionService: FounderSessionService,
): FounderIdentityService {
  const hash = process.env['AZMA_FOUNDER_CREDENTIAL_HASH'] ?? '';
  return new FounderIdentityService(hash, sessionService);
}
