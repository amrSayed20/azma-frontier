import { ConstitutionPriority } from '../constitution-runtime';
import { EmpireAwarenessEngine } from './empire-awareness-engine';
import { StrategicAuthorityBoundaryError } from './strategic-intelligence-errors';
import { StrategicForecastEngine } from './strategic-forecast-engine';
import { StrategicMemory } from './strategic-memory';
import { StrategicObjectiveTracker } from './strategic-objective-tracker';
import { StrategicOpportunityAnalyzer } from './strategic-opportunity-analyzer';
import { StrategicRecommendationEngine } from './strategic-recommendation-engine';
import { StrategicRuntimeState } from './strategic-runtime-state';
import { StrategicSituationModel } from './strategic-situation-model';
import {
  StrategicIntelligencePackage,
  StrategicRuntimeStateSnapshot,
} from './strategic-intelligence-types';
import { StrategicThreatAnalyzer } from './strategic-threat-analyzer';
import { StrategicTrendEngine } from './strategic-trend-engine';

export class StrategicIntelligenceEngine {
  constructor(
    private readonly awarenessEngine: EmpireAwarenessEngine,
    private readonly situationModel: StrategicSituationModel,
    private readonly opportunityAnalyzer: StrategicOpportunityAnalyzer,
    private readonly threatAnalyzer: StrategicThreatAnalyzer,
    private readonly forecastEngine: StrategicForecastEngine,
    private readonly trendEngine: StrategicTrendEngine,
    private readonly objectiveTracker: StrategicObjectiveTracker,
    private readonly recommendationEngine: StrategicRecommendationEngine,
    private readonly strategicMemory: StrategicMemory,
    private readonly runtimeState: StrategicRuntimeState
  ) {}

  public generateStrategicIntelligencePackage(): StrategicIntelligencePackage {
    const input = this.awarenessEngine.observeEmpire();
    const strategicSituation = this.situationModel.build(input);
    const opportunities = this.opportunityAnalyzer.analyze(strategicSituation);
    const threats = this.threatAnalyzer.analyze(strategicSituation);
    const forecast = this.forecastEngine.forecast(strategicSituation, threats);
    const trends = this.trendEngine.build(strategicSituation, forecast);
    const objectives = this.objectiveTracker.track(forecast, threats);
    const recommendations = this.recommendationEngine.recommend(opportunities, threats, forecast, objectives);

    const strategicPackage: StrategicIntelligencePackage = {
      packageId: `strategic-package-${Date.now().toString(36)}`,
      generatedAt: new Date(),
      constitutionalDecisionContext: input.constitutionState.lastDecision,
      constitutionalComplianceContext: input.constitutionState.lastComplianceStatus,
      strategicSituation,
      opportunities,
      threats,
      forecast,
      trends,
      objectives,
      recommendations,
      executionDirective: 'advisory-only',
      constitutionalPriority: this.resolvePriority(threats),
    };

    this.enforceAuthorityBoundary(strategicPackage);

    this.strategicMemory.store(strategicPackage);
    this.runtimeState.publish(strategicPackage);

    return strategicPackage;
  }

  public getLatestStrategicPackage(): StrategicIntelligencePackage | undefined {
    return this.strategicMemory.latest();
  }

  public getRuntimeStateSnapshot(): StrategicRuntimeStateSnapshot {
    return this.runtimeState.snapshot();
  }

  private resolvePriority(threats: readonly StrategicIntelligencePackage['threats'][number][]): ConstitutionPriority {
    if (threats.some((threat) => threat.level === 'critical')) {
      return 'constitutional';
    }

    if (threats.some((threat) => threat.level === 'high')) {
      return 'critical';
    }

    if (threats.some((threat) => threat.level === 'medium')) {
      return 'high';
    }

    return 'normal';
  }

  private enforceAuthorityBoundary(strategicPackage: StrategicIntelligencePackage): void {
    if (strategicPackage.executionDirective !== 'advisory-only') {
      throw new StrategicAuthorityBoundaryError('Strategic Intelligence cannot issue executable authority directives.');
    }

    if (strategicPackage.recommendations.some((recommendation) => recommendation.advisoryOnly !== true)) {
      throw new StrategicAuthorityBoundaryError('Strategic recommendations must remain advisory-only.');
    }
  }
}
