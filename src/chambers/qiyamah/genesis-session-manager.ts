/**
 * AZMA OS – Qiyamah Chamber
 * File: genesis-session-manager.ts
 *
 * Genesis Session Manager
 * Responsible for managing all generation sessions.
 */

import {
  GenesisSession,
  GenesisSessionManager as SessionFactory
} from './genesis-session';

import {
  GenesisSessionStore
} from './genesis-session-store';

export class GenesisSessionManager {
  private readonly sessionFactory = new SessionFactory();

  constructor(
    private readonly sessionStore: GenesisSessionStore
  ) {}

  /**
   * Creates and registers a new session.
   */
  public createSession(
    sessionId: string
  ): GenesisSession {
    const session =
      this.sessionFactory.createSession(
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
  ): GenesisSession | undefined {
    return this.sessionStore.getSession(
      sessionId
    );
  }

  /**
   * Updates a session.
   */
  public updateSession(
    session: GenesisSession
  ): void {
    this.sessionStore.update(
      session
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
  public getAllSessions(): readonly GenesisSession[] {
    return this.sessionStore.getAllSessions();
  }

  /**
   * Returns active session count.
   */
  public getSessionCount(): number {
    return this.sessionStore.size();
  }
}