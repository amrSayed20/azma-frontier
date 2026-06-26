import { StrategicForecast, StrategicSituationSnapshot, StrategicTrend } from './strategic-intelligence-types';

export class StrategicTrendEngine {
  public build(
    situation: StrategicSituationSnapshot,
    forecast: StrategicForecast
  ): readonly StrategicTrend[] {
    return [
      this.makeTrend(
        'trend-constitutional',
        'Constitutional Health Trajectory',
        situation.constitutionalHealth,
        forecast.projectedConstitutionalHealth,
        ['compliance status', 'policy depth', 'governance continuity']
      ),
      this.makeTrend(
        'trend-architecture',
        'Architectural Stability Trajectory',
        situation.architecturalHealth,
        forecast.projectedArchitecturalHealth,
        ['article coverage', 'signal polarity', 'cross-runtime alignment']
      ),
      this.makeTrend(
        'trend-platform-evolution',
        'Platform Evolution Momentum',
        situation.platformEvolutionHealth,
        forecast.projectedPlatformEvolutionHealth,
        ['executive throughput', 'signal volume', 'forecast confidence']
      ),
    ];
  }

  private makeTrend(
    trendId: string,
    title: string,
    current: number,
    projected: number,
    evidence: readonly string[]
  ): StrategicTrend {
    const delta = projected - current;

    return {
      trendId,
      title,
      direction: delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat',
      strength: Math.min(100, Math.abs(delta) * 8 + 40),
      evidence,
    };
  }
}
