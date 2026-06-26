import { ExecutivePlanningEngine } from './executive-planning-engine';
import { ExecutivePriorityEngine } from './executive-priority-engine';
import { ExecutiveRecommendationEngine } from './executive-recommendation-engine';
import { ExecutiveRiskAnalyzer } from './executive-risk-analyzer';
import { ExecutiveSituationAnalyzer } from './executive-situation-analyzer';
import { ExecutiveValidationLayer } from './executive-validation-layer';
import { ExecutiveDecisionPackage, ExecutivePipelineInput } from './executive-intelligence-types';

export class ExecutiveDecisionPipeline {
  constructor(
    private readonly situationAnalyzer: ExecutiveSituationAnalyzer,
    private readonly riskAnalyzer: ExecutiveRiskAnalyzer,
    private readonly recommendationEngine: ExecutiveRecommendationEngine,
    private readonly priorityEngine: ExecutivePriorityEngine,
    private readonly planningEngine: ExecutivePlanningEngine,
    private readonly validationLayer: ExecutiveValidationLayer
  ) {}

  public process(input: ExecutivePipelineInput): ExecutiveDecisionPackage {
    this.validationLayer.validatePipelineInput(input);

    const situation = this.situationAnalyzer.analyze(input);
    const risks = this.riskAnalyzer.analyze(input, situation);
    const priority = this.priorityEngine.rank(input, situation, risks);
    const recommendations = this.recommendationEngine.recommend(input, situation, risks, priority);

    this.validationLayer.validateFounderAuthority(input, recommendations);

    const plan = this.planningEngine.buildPlan(input, priority, recommendations);

    return {
      packageId: `exec-package-${input.action.actionId}-${Date.now().toString(36)}`,
      input,
      situation,
      risks,
      priority,
      recommendations,
      plan,
      submittedToFounderAt: new Date(),
    };
  }
}
