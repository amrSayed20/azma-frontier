/**
 * Session coordination for orchestration continuity.
 */

import { SessionState } from '../types/orchestration-contracts';
import { now } from '../utils/time';

export class SessionCoordinator {
  private readonly sessions = new Map<string, SessionState>();

  public touch(sessionId: string, activeContextId?: string): SessionState {
    const existing = this.sessions.get(sessionId);

    const next: SessionState = {
      sessionId,
      activeContextId,
      requestCount: (existing?.requestCount ?? 0) + 1,
      lastActivityAt: now()
    };

    this.sessions.set(sessionId, next);
    return next;
  }

  public get(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }
}
