import { SimulationPath, SimulationScenario } from './future-simulation-types';

export class MultiPathSimulator {
  public simulate(scenarios: readonly SimulationScenario[]): readonly SimulationPath[] {
    return scenarios.map((scenario, index) => {
      const constitutionalOutcomeScore = this.clamp(
        Math.round((scenario.founderDecision.confidence + scenario.executiveDecision.confidence + scenario.strategicDecision.confidence) / 3)
      );

      const resourceConsumptionScore = this.clamp(35 + (index % 50));
      const financialImpactScore = this.clamp(40 + ((index * 3) % 50));
      const securityImpactScore = this.clamp(45 + ((index * 5) % 45));
      const infrastructureImpactScore = this.clamp(42 + ((index * 7) % 48));

      return {
        pathId: `${scenario.scenarioId}-path`,
        scenarioId: scenario.scenarioId,
        sequence: [
          `Founder:${scenario.founderDecision.decision}`,
          `Executive:${scenario.executiveDecision.decision}`,
          `Strategic:${scenario.strategicDecision.decision}`,
        ],
        constitutionalOutcomeScore,
        resourceConsumptionScore,
        financialImpactScore,
        securityImpactScore,
        infrastructureImpactScore,
      };
    });
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
