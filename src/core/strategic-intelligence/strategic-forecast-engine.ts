import { StrategicForecast, StrategicSituationSnapshot, StrategicThreat } from './strategic-intelligence-types';

export class StrategicForecastEngine {
  public forecast(
    situation: StrategicSituationSnapshot,
    threats: readonly StrategicThreat[]
  ): StrategicForecast {
    const threatPenalty = threats.reduce((sum, threat) => sum + this.threatWeight(threat.level), 0);
    const confidence = Math.max(55, Math.min(95, 88 - threatPenalty));

    return {
      forecastId: `forecast-${Date.now().toString(36)}`,
      horizon: 'long-term',
      confidence,
      projectedConstitutionalHealth: this.project(situation.constitutionalHealth, threatPenalty),
      projectedArchitecturalHealth: this.project(situation.architecturalHealth, threatPenalty - 2),
      projectedInfrastructureHealth: this.project(situation.infrastructureHealth, threatPenalty + 2),
      projectedPlatformEvolutionHealth: this.project(situation.platformEvolutionHealth, threatPenalty - 1),
      narrative: 'Forecast projects strategic resilience when advisory recommendations are adopted within constitutional boundaries.',
    };
  }

  private threatWeight(level: StrategicThreat['level']): number {
    if (level === 'critical') {
      return 10;
    }

    if (level === 'high') {
      return 6;
    }

    if (level === 'medium') {
      return 3;
    }

    return 1;
  }

  private project(current: number, penalty: number): number {
    return Math.max(0, Math.min(100, Math.round(current - penalty + 4)));
  }
}
