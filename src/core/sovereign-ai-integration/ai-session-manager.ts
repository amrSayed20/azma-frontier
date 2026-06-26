export interface AISession {
  readonly sessionId: string;
  readonly requestedBy: string;
  readonly startedAt: Date;
  readonly lastUsedAt: Date;
  readonly requestIds: readonly string[];
}

export class AISessionManager {
  private readonly sessions = new Map<string, AISession>();

  public getOrCreate(requestedBy: string, sessionId?: string): AISession {
    const existing = sessionId ? this.sessions.get(sessionId) : undefined;

    if (existing) {
      const updated = { ...existing, lastUsedAt: new Date() };
      this.sessions.set(updated.sessionId, updated);
      return updated;
    }

    const created: AISession = {
      sessionId: sessionId ?? `ai-session-${Date.now().toString(36)}`,
      requestedBy,
      startedAt: new Date(),
      lastUsedAt: new Date(),
      requestIds: [],
    };

    this.sessions.set(created.sessionId, created);
    return created;
  }

  public recordRequest(sessionId: string, requestId: string): void {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    this.sessions.set(sessionId, {
      ...session,
      lastUsedAt: new Date(),
      requestIds: [...session.requestIds, requestId],
    });
  }

  public list(): readonly AISession[] {
    return Array.from(this.sessions.values());
  }
}
