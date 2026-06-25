/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-session.ts
 *
 * Goal Session.
 */

export enum GoalSessionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED'
}

export class GoalSession {
  constructor(
    public readonly sessionId: string,
    public readonly createdAtMs: number = Date.now(),
    public status: GoalSessionStatus =
      GoalSessionStatus.ACTIVE
  ) {}

  /**
   * Marks session as paused.
   */
  public pause(): void {
    this.status =
      GoalSessionStatus.PAUSED;
  }

  /**
   * Marks session as completed.
   */
  public complete(): void {
    this.status =
      GoalSessionStatus.COMPLETED;
  }

  /**
   * Terminates session.
   */
  public terminate(): void {
    this.status =
      GoalSessionStatus.TERMINATED;
  }

  /**
   * Checks whether session is active.
   */
  public isActive(): boolean {
    return (
      this.status ===
      GoalSessionStatus.ACTIVE
    );
  }
}