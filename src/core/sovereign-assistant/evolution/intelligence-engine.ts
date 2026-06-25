/**
 * AZMA OS - Sovereign Assistant
 * Evolution & Intelligence Engine
 * Continuous discovery and recommendation of platform improvements
 */

import {
  EvolutionCandidate,
  PlatformRecommendation,
  UrgencyLevel,
} from '../types/sovereign-types';

/**
 * Recommendation engine for platform intelligence.
 * Analyzes system state and generates actionable recommendations.
 */
export class RecommendationEngine {
  private readonly recommendations: Map<string, PlatformRecommendation> = new Map();
  private readonly approvedRecommendations: Set<string> = new Set();

  /**
   * Creates a new platform recommendation.
   */
  public createRecommendation(
    category: 'ai-model' | 'infrastructure' | 'optimization' | 'security',
    title: string,
    description: string,
    urgency: UrgencyLevel,
    estimatedImpact: string,
    estimatedEffort: 'low' | 'medium' | 'high',
    estimatedCost?: number
  ): PlatformRecommendation {
    const recommendation: PlatformRecommendation = {
      recommendationId: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      category,
      title,
      description,
      urgency,
      estimatedImpact,
      estimatedEffort,
      estimatedCost,
      createdAt: new Date(),
    };

    this.recommendations.set(recommendation.recommendationId, recommendation);
    return recommendation;
  }

  /**
   * Retrieves all recommendations sorted by urgency.
   */
  public getRecommendations(
    category?: string,
    minUrgency?: UrgencyLevel
  ): readonly PlatformRecommendation[] {
    const urgencyOrder: Record<UrgencyLevel, number> = {
      emergency: 0,
      critical: 1,
      warning: 2,
      info: 3,
    };

    let recs = Array.from(this.recommendations.values());

    if (category) {
      recs = recs.filter(r => r.category === category);
    }

    if (minUrgency) {
      recs = recs.filter(r => urgencyOrder[r.urgency] <= urgencyOrder[minUrgency]);
    }

    return recs.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  }

  /**
   * Marks a recommendation as approved by founder.
   */
  public approveRecommendation(recommendationId: string, approverId: string): boolean {
    if (!this.recommendations.has(recommendationId)) {
      return false;
    }

    this.approvedRecommendations.add(recommendationId);
    return true;
  }

  /**
   * Returns only approved recommendations ready for implementation.
   */
  public getApprovedRecommendations(): readonly PlatformRecommendation[] {
    return Array.from(this.approvedRecommendations)
      .map(id => this.recommendations.get(id))
      .filter((r): r is PlatformRecommendation => r !== undefined);
  }

  /**
   * Archives a recommendation (removes from active list).
   */
  public archiveRecommendation(recommendationId: string): boolean {
    return this.recommendations.delete(recommendationId);
  }
}

/**
 * Evolution engine for AI model discovery and platform evolution.
 */
export class EvolutionEngine {
  private readonly candidates: Map<string, EvolutionCandidate> = new Map();
  private readonly benchmarkResults: Map<string, number> = new Map();

  /**
   * Discovers new AI model candidate.
   */
  public discoverCandidate(
    name: string,
    type: 'model' | 'library' | 'infrastructure',
    candidateVersion: string,
    currentVersion?: string
  ): EvolutionCandidate {
    const candidate: EvolutionCandidate = {
      candidateId: `evo_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      name,
      type,
      currentVersion,
      candidateVersion,
      benchmarkScore: 0,
      estimatedBenefit: '',
      estimatedRisk: '',
      approvalRequired: true,
    };

    this.candidates.set(candidate.candidateId, candidate);
    return candidate;
  }

  /**
   * Benchmarks a candidate against current implementation.
   */
  public async benchmarkCandidate(candidateId: string): Promise<{
    readonly improvementPercent: number;
    readonly riskAssessment: string;
    readonly recommendation: string;
  }> {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      throw new Error(`Candidate ${candidateId} not found`);
    }

    // Simulate benchmarking (in production, would run actual tests)
    const improvementPercent = Math.random() * 40 - 10; // -10% to +40%
    const riskLevel = Math.random();

    let riskAssessment = 'Low risk upgrade';
    if (riskLevel > 0.7) {
      riskAssessment = 'High risk - extensive testing required';
    } else if (riskLevel > 0.4) {
      riskAssessment = 'Medium risk - standard testing required';
    }

    let recommendation = 'Not recommended at this time';
    if (improvementPercent > 10 && riskLevel < 0.4) {
      recommendation = 'Recommended for approval';
    } else if (improvementPercent > 5 && riskLevel < 0.7) {
      recommendation = 'Consider for next release cycle';
    }

    // Update candidate
    const updated: EvolutionCandidate = {
      ...candidate,
      benchmarkScore: Math.max(0, Math.min(100, 50 + improvementPercent * 2.5)),
      estimatedBenefit: `${improvementPercent.toFixed(1)}% performance improvement`,
      estimatedRisk: riskAssessment,
    };

    this.candidates.set(candidateId, updated);
    this.benchmarkResults.set(candidateId, improvementPercent);

    return {
      improvementPercent,
      riskAssessment,
      recommendation,
    };
  }

  /**
   * Returns top candidates by benchmark score.
   */
  public getTopCandidates(limit: number = 5): readonly EvolutionCandidate[] {
    return Array.from(this.candidates.values())
      .sort((a, b) => b.benchmarkScore - a.benchmarkScore)
      .slice(0, limit);
  }

  /**
   * Returns candidates requiring owner approval.
   */
  public getPendingApprovals(): readonly EvolutionCandidate[] {
    return Array.from(this.candidates.values()).filter(
      c => c.approvalRequired && c.benchmarkScore > 0
    );
  }

  /**
   * Approves a candidate for implementation.
   */
  public approveCandidate(candidateId: string): boolean {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      return false;
    }

    const approved: EvolutionCandidate = {
      ...candidate,
      approvalRequired: false,
    };
    this.candidates.set(candidateId, approved);
    return true;
  }
}

/**
 * Integrated intelligence system combining recommendations and evolution.
 */
export class IntelligenceSystem {
  private readonly recommendations: RecommendationEngine;
  private readonly evolution: EvolutionEngine;

  constructor() {
    this.recommendations = new RecommendationEngine();
    this.evolution = new EvolutionEngine();
  }

  /**
   * Gets all intelligence items (recommendations + evolution candidates).
   */
  public getIntelligence(): {
    readonly recommendations: readonly PlatformRecommendation[];
    readonly evolutions: readonly EvolutionCandidate[];
  } {
    return {
      recommendations: this.recommendations.getRecommendations(),
      evolutions: this.evolution.getPendingApprovals(),
    };
  }

  /**
   * Gets the recommendation engine.
   */
  public getRecommendationEngine(): RecommendationEngine {
    return this.recommendations;
  }

  /**
   * Gets the evolution engine.
   */
  public getEvolutionEngine(): EvolutionEngine {
    return this.evolution;
  }
}
