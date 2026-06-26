import { FutureSimulationEngine } from './future-simulation-engine';
import { ConstitutionalOutcomeEvaluator } from './constitutional-outcome-evaluator';
import { DecisionImpactAnalyzer } from './decision-impact-analyzer';
import { FutureTimelineBuilder } from './future-timeline-builder';
import { MultiPathSimulator } from './multi-path-simulator';
import { OpportunityProjectionEngine } from './opportunity-projection-engine';
import { ProbabilityEngine } from './probability-engine';
import { RiskProjectionEngine } from './risk-projection-engine';
import { ScenarioGenerator } from './scenario-generator';
import { SimulationMemory } from './simulation-memory';
import { SimulationRuntimeState } from './simulation-runtime-state';

export function createFutureSimulationEngine(): FutureSimulationEngine {
  return new FutureSimulationEngine(
    new ScenarioGenerator(),
    new MultiPathSimulator(),
    new ProbabilityEngine(),
    new RiskProjectionEngine(),
    new OpportunityProjectionEngine(),
    new FutureTimelineBuilder(),
    new DecisionImpactAnalyzer(),
    new ConstitutionalOutcomeEvaluator(),
    new SimulationMemory(),
    new SimulationRuntimeState()
  );
}
