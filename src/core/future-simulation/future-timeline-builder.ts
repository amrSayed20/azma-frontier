import { FutureTimeline, SimulationPath } from './future-simulation-types';

export class FutureTimelineBuilder {
  public build(paths: readonly SimulationPath[]): readonly FutureTimeline[] {
    return paths.map((path) => ({
      pathId: path.pathId,
      points: [1, 3, 5, 10].map((yearOffset) => ({
        yearOffset,
        constitutionalHealth: this.clamp(path.constitutionalOutcomeScore - yearOffset + 2),
        resourcePressure: this.clamp(path.resourceConsumptionScore + yearOffset - 1),
        securityStability: this.clamp(path.securityImpactScore - Math.floor(yearOffset / 2)),
        infrastructureResilience: this.clamp(path.infrastructureImpactScore - Math.floor(yearOffset / 3)),
      })),
    }));
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
