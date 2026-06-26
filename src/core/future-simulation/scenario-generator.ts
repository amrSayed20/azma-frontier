import { FutureSimulationValidationError } from './future-simulation-errors';
import { SimulatedDecision, SimulationInput, SimulationScenario } from './future-simulation-types';

const MAX_PATH_COUNT = 1_000_000;

export class ScenarioGenerator {
  public generate(input: SimulationInput): readonly SimulationScenario[] {
    if (input.pathCount <= 0 || input.pathCount > MAX_PATH_COUNT) {
      throw new FutureSimulationValidationError(`pathCount must be between 1 and ${MAX_PATH_COUNT}.`);
    }

    const scenarios: SimulationScenario[] = [];

    for (let i = 0; i < input.pathCount; i += 1) {
      const founderDecision = this.buildFounderDecision(input, i);
      const executiveDecision = this.buildExecutiveDecision(input, i);
      const strategicDecision = this.buildStrategicDecision(input, i);

      scenarios.push({
        scenarioId: `${input.simulationId}-scenario-${i + 1}`,
        title: `Future Scenario ${i + 1}`,
        assumptions: this.buildAssumptions(input, i),
        founderDecision,
        executiveDecision,
        strategicDecision,
      });
    }

    return scenarios;
  }

  private buildFounderDecision(input: SimulationInput, seed: number): SimulatedDecision {
    const baseline = input.constitutionEvaluation?.decision ?? input.constitutionState.lastDecision ?? 'defer';

    return {
      actor: 'founder',
      decision: seed % 5 === 0 ? 'escalate' : baseline,
      confidence: this.seededConfidence(seed, 75),
      rationale: 'Founder decision simulation derived from constitutional state and scenario variance.',
    };
  }

  private buildExecutiveDecision(input: SimulationInput, seed: number): SimulatedDecision {
    const baseline = input.latestExecutivePackage?.recommendations[0]?.targetDecision ?? 'defer';

    return {
      actor: 'executive',
      decision: seed % 4 === 0 ? 'approve' : baseline,
      confidence: this.seededConfidence(seed + 7, 70),
      rationale: 'Executive decision simulation derived from latest package and risk-aware variance.',
    };
  }

  private buildStrategicDecision(input: SimulationInput, seed: number): SimulatedDecision {
    const baseline = input.latestStrategicPackage ? 'observe' : 'defer';

    return {
      actor: 'strategic',
      decision: seed % 3 === 0 ? 'escalate' : baseline,
      confidence: this.seededConfidence(seed + 13, 68),
      rationale: 'Strategic decision simulation derived from long-horizon intelligence continuity.',
    };
  }

  private buildAssumptions(input: SimulationInput, seed: number): readonly string[] {
    return [
      `Constitution loaded: ${input.constitutionState.loaded}`,
      `Policy density: ${input.constitutionState.policyCount}`,
      `Executive packages observed: ${input.executiveState?.totalDecisionPackages ?? 0}`,
      `Strategic packages observed: ${input.strategicState?.totalPackages ?? 0}`,
      `Scenario seed: ${seed}`,
    ];
  }

  private seededConfidence(seed: number, floor: number): number {
    return Math.max(floor, Math.min(100, floor + (seed % 31)));
  }
}
