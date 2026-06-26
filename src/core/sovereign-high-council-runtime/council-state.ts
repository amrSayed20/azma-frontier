import { CouncilRuntimeStateSnapshot, FounderSession } from './runtime-types';

export class CouncilState {
  private totalSessions = 0;
  private totalSynchronizations = 0;
  private lastSessionId?: string;
  private lastSynchronizationId?: string;
  private lastSyncedAt?: Date;

  public recordSession(session: FounderSession): void {
    if (session.sessionId !== this.lastSessionId) {
      this.totalSessions += 1;
    }

    this.lastSessionId = session.sessionId;
  }

  public recordSynchronization(synchronizationId: string, timestamp: Date): void {
    this.totalSynchronizations += 1;
    this.lastSynchronizationId = synchronizationId;
    this.lastSyncedAt = timestamp;
  }

  public snapshot(): CouncilRuntimeStateSnapshot {
    return {
      totalSessions: this.totalSessions,
      totalSynchronizations: this.totalSynchronizations,
      lastSessionId: this.lastSessionId,
      lastSynchronizationId: this.lastSynchronizationId,
      lastSyncedAt: this.lastSyncedAt,
    };
  }
}
