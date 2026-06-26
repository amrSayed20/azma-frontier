import { StrategicForecast, StrategicObjective, StrategicThreat } from './strategic-intelligence-types';

export class StrategicObjectiveTracker {
  public track(
    forecast: StrategicForecast,
    threats: readonly StrategicThreat[]
  ): readonly StrategicObjective[] {
    const highThreatCount = threats.filter((threat) => threat.level === 'high' || threat.level === 'critical').length;

    return [
      {
        objectiveId: 'obj-constitutional-durability',
        title: 'Maintain constitutional durability above strategic threshold.',
        owner: 'strategic-intelligence',
        status: forecast.projectedConstitutionalHealth >= 75 ? 'on-track' : 'at-risk',
        progress: Math.min(100, forecast.projectedConstitutionalHealth),
        rationale: 'Constitutional projection determines long-horizon governance durability.',
      },
      {
        objectiveId: 'obj-architecture-coherence',
        title: 'Preserve architecture coherence through sustained strategic guidance.',
        owner: 'strategic-intelligence',
        status: highThreatCount > 0 ? 'watch' : 'on-track',
        progress: Math.max(40, forecast.projectedArchitecturalHealth),
        rationale: 'Threat pressure influences architecture coherence over multi-year horizons.',
      },
      {
        objectiveId: 'obj-platform-evolution',
        title: 'Increase platform evolution health with advisory-only intelligence cycles.',
        owner: 'strategic-intelligence',
        status: forecast.projectedPlatformEvolutionHealth >= 70 ? 'on-track' : 'watch',
        progress: Math.max(45, forecast.projectedPlatformEvolutionHealth),
        rationale: 'Strategic intelligence packages drive evolution without direct authority execution.',
      },
    ];
  }
}
