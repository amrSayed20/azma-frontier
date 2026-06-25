/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-session-manager.ts
 *
 * Goal Session Manager.
 */

import {
  GoalSession
} from './goal-session';

import {
  GoalSessionStore
} from './goal-session-store';

export class GoalSessionManager {

  constructor(
    private readonly sessionStore:
      GoalSessionStore
  ) {}

  /**
   * Creates and registers a new session.
   */
  public createSession(
    sessionId: string
  ): GoalSession {

    const session =
      new GoalSession(
        sessionId
      );

    this.sessionStore.register(
      session
    );

    return session;
  }

  /**
   * Retrieves a session.
   */
  public getSession(
    sessionId: string
  ): GoalSession | undefined {

    return this.sessionStore.getSession(
      sessionId
    );
  }

  /**
   * Removes a session.
   */
  public removeSession(
    sessionId: string
  ): void {

    this.sessionStore.removeSession(
      sessionId
    );
  }

  /**
   * Returns all sessions.
   */
  public getAllSessions():
    readonly GoalSession[] {

    return this.sessionStore
      .getAllSessions();
  }

  /**
   * Returns session count.
   */
  public size(): number {

    return this.sessionStore.size();
  }
}