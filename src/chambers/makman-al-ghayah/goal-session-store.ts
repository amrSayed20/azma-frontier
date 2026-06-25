/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-session-store.ts
 *
 * Goal Session Store.
 */

import {
  GoalSession
} from './goal-session';

export class GoalSessionStore {
  private readonly sessions =
    new Map<string, GoalSession>();

  /**
   * Registers a session.
   */
  public register(
    session: GoalSession
  ): void {

    this.sessions.set(
      session.sessionId,
      session
    );
  }

  /**
   * Retrieves a session.
   */
  public getSession(
    sessionId: string
  ): GoalSession | undefined {

    return this.sessions.get(
      sessionId
    );
  }

  /**
   * Returns all sessions.
   */
  public getAllSessions(): readonly GoalSession[] {

    return Array.from(
      this.sessions.values()
    );
  }

  /**
   * Removes a session.
   */
  public removeSession(
    sessionId: string
  ): void {

    this.sessions.delete(
      sessionId
    );
  }

  /**
   * Clears all sessions.
   */
  public clear(): void {

    this.sessions.clear();
  }

  /**
   * Returns session count.
   */
  public size(): number {

    return this.sessions.size;
  }
}