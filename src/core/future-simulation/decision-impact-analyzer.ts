import { DecisionImpact, SimulationPath, SimulationScenario } from './future-simulation-types';

export class DecisionImpactAnalyzer {
  public analyze(
    scenarios: readonly SimulationScenario[],
    paths: readonly SimulationPath[]
  ): readonly DecisionImpact[] {
    const scenarioMap = new Map(scenarios.map((scenario) => [scenario.scenarioId, scenario]));

    return paths.map((path) => {
      const scenario = scenarioMap.get(path.scenarioId);
      const founderImpact = scenario?.founderDecision.confidence ?? 0;
      const executiveImpact = scenario?.executiveDecision.confidence ?? 0;
      const strategicImpact = scenario?.strategicDecision.confidence ?? 0;

      return {
        pathId: path.pathId,
        founderImpact,
        executiveImpact,
        strategicImpact,
        aggregateImpact: Math.round((founderImpact + executiveImpact + strategicImpact) / 3),
      };
    });
  }
}
