/**
 * AZMA OS – Qiyamah Chamber
 * File: progress-agent.ts
 *
 * Progress Agent
 * Responsible for tracking sovereign generation progress.
 */

export interface ProgressState {
  readonly percentage: number;
  readonly updatedAt: Date;
}

export class ProgressAgent {
  /**
   * Creates an initial progress state.
   */
  public initialize(): ProgressState {
    return {
      percentage: 0,
      updatedAt: new Date(),
    };
  }

  /**
   * Updates progress percentage.
   */
  public update(
    percentage: number
  ): ProgressState {
    return {
      percentage: this.normalize(percentage),
      updatedAt: new Date(),
    };
  }

  /**
   * Determines whether generation is complete.
   */
  public isCompleted(
    progress: ProgressState
  ): boolean {
    return progress.percentage >= 100;
  }

  /**
   * Normalizes percentage values.
   */
  public normalize(
    percentage: number
  ): number {
    if (percentage < 0) {
      return 0;
    }

    if (percentage > 100) {
      return 100;
    }

    return percentage;
  }
}