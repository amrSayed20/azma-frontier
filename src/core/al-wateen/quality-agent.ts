/**
 * AZMA OS – Qiyamah Chamber
 * File: quality-agent.ts
 *
 * Quality Agent
 * Responsible for evaluating sovereign generation quality
 * and validating output readiness.
 */

export type QualityLevel =
  | 'low'
  | 'standard'
  | 'high'
  | 'premium';

export interface QualityReport {
  readonly level: QualityLevel;
  readonly score: number;
  readonly approved: boolean;
  readonly evaluatedAt: Date;
}

export class QualityAgent {
  /**
   * Creates a quality report.
   */
  public evaluate(score: number): QualityReport {
    const normalizedScore = this.normalizeScore(score);

    return {
      level: this.determineLevel(normalizedScore),
      score: normalizedScore,
      approved: normalizedScore >= 70,
      evaluatedAt: new Date(),
    };
  }

  /**
   * Determines the quality level.
   */
  public determineLevel(score: number): QualityLevel {
    if (score >= 90) {
      return 'premium';
    }

    if (score >= 80) {
      return 'high';
    }

    if (score >= 60) {
      return 'standard';
    }

    return 'low';
  }

  /**
   * Determines whether the output is publishable.
   */
  public isApproved(report: QualityReport): boolean {
    return report.approved;
  }

  /**
   * Normalizes score values.
   */
  public normalizeScore(score: number): number {
    if (score < 0) {
      return 0;
    }

    if (score > 100) {
      return 100;
    }

    return score;
  }
}