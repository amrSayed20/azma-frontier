import { randomUUID } from 'crypto';
import type { FounderMode, FounderSession, FounderSessionContract } from './sovereign-identity-contract';

export class FounderSessionService implements FounderSessionContract {
  readonly serviceName = 'FounderSessionService' as const;

  private session: FounderSession | null = null;

  getSession(): FounderSession | null {
    return this.session;
  }

  createSession(mode: FounderMode): FounderSession {
    const now = new Date();
    this.session = {
      sessionId: randomUUID(),
      mode,
      startedAt: now,
      switchedAt: now,
    };
    return this.session;
  }

  updateMode(mode: FounderMode): FounderSession {
    const now = new Date();
    if (this.session === null) {
      return this.createSession(mode);
    }
    this.session = {
      sessionId: this.session.sessionId,
      mode,
      startedAt: this.session.startedAt,
      switchedAt: now,
    };
    return this.session;
  }
}
