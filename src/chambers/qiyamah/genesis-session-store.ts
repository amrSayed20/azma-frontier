/**
 * AZMA OS – Qiyamah Chamber
 * File: genesis-session-store.ts
 *
 * Genesis Session Store
 * Maintains all active and historical generation sessions.
 */

import {
  GenesisSession
} from './genesis-session';

export class GenesisSessionStore {
  private readonly sessions =
    new Map<string, GenesisSession>();

  /**
   * Registers a session.
   */
  public register(
    session: GenesisSession
  ): void {
    this.sessions.set(
      session.sessionId,
      session
    );
  }

  /**
   * Updates a session.
   */
  public update(
    session: GenesisSession
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
  ): GenesisSession | undefined {
    return this.sessions.get(
      sessionId
    );
  }

  /**
   * Returns all sessions.
   */
  public getAllSessions(): readonly GenesisSession[] {
    return Array.from(
      this.sessions.values()
    );
  }

  /**
   * Checks whether a session exists.
   */
  public hasSession(
    sessionId: string
  ): boolean {
    return this.sessions.has(
      sessionId
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