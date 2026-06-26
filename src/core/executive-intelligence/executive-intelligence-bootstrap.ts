import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveDecisionPipeline } from './executive-decision-pipeline';
import { ExecutiveEventProcessor } from './executive-event-processor';
import { ExecutiveIntelligenceEngine } from './executive-intelligence-engine';
import { ExecutiveMemoryBridge } from './executive-memory-bridge';
import { ExecutivePlanningEngine } from './executive-planning-engine';
import { ExecutivePriorityEngine } from './executive-priority-engine';
import { ExecutiveRecommendationEngine } from './executive-recommendation-engine';
import { ExecutiveRiskAnalyzer } from './executive-risk-analyzer';
import { ExecutiveRuntimeState } from './executive-runtime-state';
import { ExecutiveSituationAnalyzer } from './executive-situation-analyzer';
import { ExecutiveValidationLayer } from './executive-validation-layer';

export function createExecutiveIntelligenceEngine(
  constitutionRuntime: ConstitutionRuntime
): ExecutiveIntelligenceEngine {
  const validationLayer = new ExecutiveValidationLayer();
  const situationAnalyzer = new ExecutiveSituationAnalyzer();
  const riskAnalyzer = new ExecutiveRiskAnalyzer();
  const recommendationEngine = new ExecutiveRecommendationEngine();
  const priorityEngine = new ExecutivePriorityEngine();
  const planningEngine = new ExecutivePlanningEngine();
  const decisionPipeline = new ExecutiveDecisionPipeline(
    situationAnalyzer,
    riskAnalyzer,
    recommendationEngine,
    priorityEngine,
    planningEngine,
    validationLayer
  );

  return new ExecutiveIntelligenceEngine(
    constitutionRuntime,
    new ExecutiveEventProcessor(),
    decisionPipeline,
    new ExecutiveMemoryBridge(),
    validationLayer,
    new ExecutiveRuntimeState()
  );
}
