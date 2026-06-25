/**
 * AZMA OS – Qiyamah Chamber
 * File: duration-agent.ts
 *
 * Duration Agent
 * Responsible for managing generation duration
 * and validating execution time limits.
 */

export interface SovereignDuration {
  readonly seconds: number;
  readonly createdAt: Date;
}

export class DurationAgent {
  private readonly minimumDuration = 5;
  private readonly maximumDuration = 120;

  /**
   * Creates a sovereign duration profile.
   */
  public createDuration(seconds: number): SovereignDuration {
    return {
      seconds: this.normalize(seconds),
      createdAt: new Date(),
    };
  }

  /**
   * Checks whether a duration is valid.
   */
  public isValid(seconds: number): boolean {
    return (
      seconds >= this.minimumDuration &&
      seconds <= this.maximumDuration
    );
  }

  /**
   * Normalizes duration values to chamber limits.
   */
  public normalize(seconds: number): number {
    if (seconds < this.minimumDuration) {
      return this.minimumDuration;
    }

    if (seconds > this.maximumDuration) {
      return this.maximumDuration;
    }

    return seconds;
  }

  /**
   * Determines whether a duration is considered long.
   */
  public isLongDuration(seconds: number): boolean {
    return seconds > 60;
  }
}