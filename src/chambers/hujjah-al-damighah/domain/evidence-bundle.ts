/**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/domain/evidence-bundle.ts
 *
 * The Evidence Bundle Manager.
 * A stateful builder used by the Intelligence Engine to aggregate evidence
 * and emit immutable EvidenceBundle artifacts.
 */

import * as crypto from 'crypto';

import {
  Evidence,
  EvidenceBundle,
  SovereignClaim
} from './evidence.types';

export class EvidenceBundleManager {
  private readonly evidenceList: Evidence[] = [];

  private readonly metadata: Record<string, unknown> = {};

  private readonly bundleId: string;

  private readonly claimId: string;

  private readonly normalizedStatement: string;

  constructor(
    normalizedStatement: string,
    claimId: string
  ) {
    this.normalizedStatement = normalizedStatement;
    this.claimId = claimId;

    this.bundleId = crypto.randomUUID();
  }

  /**
   * Adds evidence to the bundle.
   */
  public addEvidence(
    evidence: Evidence
  ): void {
    this.evidenceList.push(
      evidence
    );
  }

  /**
   * Injects metadata.
   */
  public setMetadata(
    key: string,
    value: unknown
  ): void {
    this.metadata[key] = value;
  }

  /**
   * Calculates average confidence score.
   */
  public calculateAverageEvidenceScore(): number {
    if (this.evidenceList.length === 0) {
      return 0;
    }

    const totalScore =
      this.evidenceList.reduce(
        (sum, evidence) =>
          sum + evidence.confidenceScore,
        0
      );

    return totalScore / this.evidenceList.length;
  }

  /**
   * Extracts keywords from the normalized statement.
   */
  private extractKeywords(): string[] {
    return this.normalizedStatement
      .toLowerCase()
      .split(/\s+/)
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 2);
  }

  /**
   * Produces the immutable bundle.
   */
  public getBundle(): EvidenceBundle {

    const claim: SovereignClaim = {
      id: this.claimId,

      originalStatement:
        this.normalizedStatement,

      normalizedStatement:
        this.normalizedStatement,

      targetCategory:
        'general',

      timestampMs:
        Date.now(),

      keywords:
        this.extractKeywords()
    };

    return {
      bundleId:
        this.bundleId,

      claim,

      evidence:
        [...this.evidenceList],

      metadata: {
        investigationStatus:
          'in_progress',

        totalSourcesScanned:
          0,

        averageEvidenceScore:
          this.calculateAverageEvidenceScore(),

        ...this.metadata
      },

      generatedAtMs:
        Date.now()
    };
  }
}