/**
 * AZMA OS – Qiyamah Chamber
 * File: genesis-session.ts
 *
 * Genesis Session
 * Represents the living state of a generation session.
 */

export type GenesisSessionStatus =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed';

export interface GenesisSession {
  readonly sessionId: string;

  readonly currentAgent: string | null;

  readonly currentAssetType: string | null;

  readonly currentProgress: number;

  readonly currentCost: number;

  readonly currentRoute: string | null;

  readonly status: GenesisSessionStatus;

  readonly createdAt: Date;

  readonly updatedAt: Date;
}

export class GenesisSessionManager {
  /**
   * Creates a new session.
   */
  public createSession(
    sessionId: string
  ): GenesisSession {
    const now = new Date();

    return {
      sessionId,
      currentAgent: null,
      currentAssetType: null,
      currentProgress: 0,
      currentCost: 0,
      currentRoute: null,
      status: 'idle',
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Updates the active agent.
   */
  public setCurrentAgent(
    session: GenesisSession,
    agentName: string
  ): GenesisSession {
    return {
      ...session,
      currentAgent: agentName,
      updatedAt: new Date(),
    };
  }

  /**
   * Updates progress.
   */
  public setProgress(
    session: GenesisSession,
    progress: number
  ): GenesisSession {
    return {
      ...session,
      currentProgress: Math.max(0, Math.min(100, progress)),
      updatedAt: new Date(),
    };
  }

  /**
   * Updates cost.
   */
  public setCost(
    session: GenesisSession,
    cost: number
  ): GenesisSession {
    return {
      ...session,
      currentCost: cost,
      updatedAt: new Date(),
    };
  }

  /**
   * Updates route.
   */
  public setRoute(
    session: GenesisSession,
    route: string
  ): GenesisSession {
    return {
      ...session,
      currentRoute: route,
      updatedAt: new Date(),
    };
  }

  /**
   * Updates status.
   */
  public setStatus(
    session: GenesisSession,
    status: GenesisSessionStatus
  ): GenesisSession {
    return {
      ...session,
      status,
      updatedAt: new Date(),
    };
  }
}