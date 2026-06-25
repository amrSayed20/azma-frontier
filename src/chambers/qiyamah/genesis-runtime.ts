/**
 * AZMA OS – Qiyamah Chamber
 * File: genesis-runtime.ts
 *
 * Genesis Runtime
 * Responsible for managing the lifecycle of
 * generation sessions inside the Genesis Chamber.
 */

export type GenesisRuntimeStatus =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed';

export interface GenesisSession {
  readonly sessionId: string;
  readonly status: GenesisRuntimeStatus;
  readonly startedAt: Date;
  readonly finishedAt: Date | null;
}

export class GenesisRuntime {
  /**
   * Starts a new generation session.
   */
  public startSession(
    sessionId: string
  ): GenesisSession {
    return {
      sessionId,
      status: 'running',
      startedAt: new Date(),
      finishedAt: null,
    };
  }

  /**
   * Marks a session as completed.
   */
  public completeSession(
    session: GenesisSession
  ): GenesisSession {
    return {
      ...session,
      status: 'completed',
      finishedAt: new Date(),
    };
  }

  /**
   * Marks a session as failed.
   */
  public failSession(
    session: GenesisSession
  ): GenesisSession {
    return {
      ...session,
      status: 'failed',
      finishedAt: new Date(),
    };
  }

  /**
   * Pauses a session.
   */
  public pauseSession(
    session: GenesisSession
  ): GenesisSession {
    return {
      ...session,
      status: 'paused',
    };
  }

  /**
   * Determines whether a session is active.
   */
  public isActive(
    session: GenesisSession
  ): boolean {
    return (
      session.status === 'running' ||
      session.status === 'preparing'
    );
  }
}