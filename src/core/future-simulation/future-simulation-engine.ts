import { FutureSimulationAuthorityBoundaryError, FutureSimulationValidationError } from './future-simulation-errors';
import { ConstitutionalOutcomeEvaluator } from './constitutional-outcome-evaluator';
import { DecisionImpactAnalyzer } from './decision-impact-analyzer';
import { FutureTimelineBuilder } from './future-timeline-builder';
import {
  ConstitutionalOutcome,
  FutureSimulationPackage,
  OpportunityProjection,
  PathProbability,
  RankedFuture,
  RiskProjection,
  SimulationInput,
  SimulationPath,
} from './future-simulation-types';
import { MultiPathSimulator } from './multi-path-simulator';
import { OpportunityProjectionEngine } from './opportunity-projection-engine';
import { ProbabilityEngine } from './probability-engine';
import { RiskProjectionEngine } from './risk-projection-engine';
import { ScenarioGenerator } from './scenario-generator';
import { SimulationMemory } from './simulation-memory';
import { SimulationRuntimeState } from './simulation-runtime-state';

export class FutureSimulationEngine {
  constructor(
    private readonly scenarioGenerator: ScenarioGenerator,
    private readonly multiPathSimulator: MultiPathSimulator,
    private readonly probabilityEngine: ProbabilityEngine,
    private readonly riskProjectionEngine: RiskProjectionEngine,
    private readonly opportunityProjectionEngine: OpportunityProjectionEngine,
    private readonly futureTimelineBuilder: FutureTimelineBuilder,
    private readonly decisionImpactAnalyzer: DecisionImpactAnalyzer,
    private readonly constitutionalOutcomeEvaluator: ConstitutionalOutcomeEvaluator,
    private readonly simulationMemory: SimulationMemory,
    private readonly runtimeState: SimulationRuntimeState
  ) {}

  public simulate(input: SimulationInput): FutureSimulationPackage {
    this.validateInput(input);

    const scenarios = this.scenarioGenerator.generate(input);
    const paths = this.multiPathSimulator.simulate(scenarios);
    const probabilities = this.probabilityEngine.estimate(paths);
    const risks = this.riskProjectionEngine.project(paths);
    const opportunities = this.opportunityProjectionEngine.project(paths);
    const timelines = this.futureTimelineBuilder.build(paths);
    const impacts = this.decisionImpactAnalyzer.analyze(scenarios, paths);
    const constitutionalOutcomes = this.constitutionalOutcomeEvaluator.evaluate(paths, risks);
    const rankedFutures = this.rank(paths, probabilities, risks, opportunities, constitutionalOutcomes);

    const recommendedPathId = rankedFutures[0]?.pathId;
    if (!recommendedPathId) {
      throw new FutureSimulationValidationError('Simulation did not produce any ranked future paths.');
    }

    const simulationPackage: FutureSimulationPackage = {
      packageId: `future-package-${input.simulationId}-${Date.now().toString(36)}`,
      simulationId: input.simulationId,
      generatedAt: new Date(),
      scenarios,
      paths,
      probabilities,
      risks,
      opportunities,
      timelines,
      impacts,
      constitutionalOutcomes,
      rankedFutures,
      recommendedPathId,
      recommendationSummary: 'Recommended path maximizes constitutional safety while minimizing long-horizon risk.',
      executionDirective: 'simulation-only',
    };

    this.enforceBoundary(simulationPackage);

    this.simulationMemory.store(simulationPackage);
    this.runtimeState.publish(simulationPackage);

    return simulationPackage;
  }

  public getLatestPackage(): FutureSimulationPackage | undefined {
    return this.simulationMemory.latest();
  }

  public getSnapshot() {
    return this.runtimeState.snapshot();
  }

  private validateInput(input: SimulationInput): void {
    if (!input.constitutionState.loaded) {
      throw new FutureSimulationValidationError('Constitution state must be loaded before future simulation.');
    }

    if (input.pathCount < 1) {
      throw new FutureSimulationValidationError('pathCount must be greater than zero.');
    }
  }

  private rank(
    paths: readonly SimulationPath[],
    probabilities: readonly PathProbability[],
    risks: readonly RiskProjection[],
    opportunities: readonly OpportunityProjection[],
    outcomes: readonly ConstitutionalOutcome[]
  ): readonly RankedFuture[] {
    const probabilityMap = new Map(probabilities.map((value) => [value.pathId, value.probability]));
    const riskMap = new Map(risks.map((value) => [value.pathId, value]));
    const opportunityMap = new Map(opportunities.map((value) => [value.pathId, value]));
    const outcomeMap = new Map(outcomes.map((value) => [value.pathId, value]));

    const scored = paths.map((path) => {
      const probability = probabilityMap.get(path.pathId) ?? 0;
      const risk = riskMap.get(path.pathId);
      const opportunity = opportunityMap.get(path.pathId);
      const outcome = outcomeMap.get(path.pathId);

      const score =
        path.constitutionalOutcomeScore * 0.35 +
        probability * 100 * 0.2 +
        (opportunity?.score ?? 0) * 0.2 +
        (100 - (risk?.score ?? 100)) * 0.15 +
        (outcome?.constitutionalScore ?? 0) * 0.1;

      return {
        pathId: path.pathId,
        score: Number(score.toFixed(3)),
        probability,
        riskLevel: risk?.level ?? 'critical',
        constitutionalOutcome: outcome?.outcomeLabel ?? 'unconstitutional',
      };
    });

    const sorted = scored.sort((left, right) => right.score - left.score);

    return sorted.map((value, index) => ({
      pathId: value.pathId,
      rank: index + 1,
      score: value.score,
      probability: value.probability,
      riskLevel: value.riskLevel,
      constitutionalOutcome: value.constitutionalOutcome,
    }));
  }

  private enforceBoundary(simulationPackage: FutureSimulationPackage): void {
    if (simulationPackage.executionDirective !== 'simulation-only') {
      throw new FutureSimulationAuthorityBoundaryError('Future Simulation must remain simulation-only and cannot execute operations.');
    }
  }
}
