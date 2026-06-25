import { 
  ProjectCategory, 
  WorkflowStep, 
  CostEstimation, 
  ProductionTimeline, 
  ProductionMilestone 
} from './planner-types';

export class PlannerCostEngine {
  private static readonly BASE_COMPUTE_UNIT = 50;
  private static readonly CRITICAL_STEP_MULTIPLIER = 1.5;

  /**
   * Deterministically evaluates the architectural complexity of the project.
   * Cinematic projects require more rendering and multi-modal coordination than text-based articles.
   */
  private static getCategoryMultiplier(category: ProjectCategory): number {
    switch (category) {
      case 'cinematic': return 3.5;
      case 'podcast': return 2.0;
      case 'research': return 1.8;
      case 'article': return 1.2;
      default: return 1.0;
    }
  }

  /**
   * Generates a strict production timeline based on workflow steps and complexity.
   * Calculates the exact hours required and maps them into actionable milestones.
   */
  public static estimateTimeline(category: ProjectCategory, workflow: WorkflowStep[]): ProductionTimeline {
    const complexity = this.getCategoryMultiplier(category);
    let totalHours = 0;
    const milestones: ProductionMilestone[] = [];

    // Calculate absolute time and build base milestones
    for (const step of workflow) {
      const stepBaseHours = step.isCritical ? 4 : 2;
      const stepDuration = stepBaseHours * complexity;
      totalHours += stepDuration;

      milestones.push({
        id: `MS-${step.stepId}`,
        name: `Completion of ${step.operationName}`,
        associatedChamber: step.targetChamber,
        percentOfTotalTime: stepDuration // Temporarily hold duration to calculate percentage next
      });
    }

    // Normalize timeline into exact percentages
    for (const ms of milestones) {
      ms.percentOfTotalTime = Number(((ms.percentOfTotalTime / totalHours) * 100).toFixed(2));
    }

    return {
      estimatedDurationHours: Number(totalHours.toFixed(2)),
      milestones
    };
  }

  /**
   * Calculates the sovereign compute cost, resource allocation, and baseline financial estimation.
   * Prevents system overload by mapping exact processing units required for every chamber.
   */
  public static calculateCosts(category: ProjectCategory, workflow: WorkflowStep[]): CostEstimation {
    const complexityMultiplier = this.getCategoryMultiplier(category);
    let totalComputeUnits = 0;
    
    const resourceBreakdown: Record<string, number> = {
      'intelligence_processing': 0, // Hujjah Al-Damighah
      'logic_orchestration': 0,     // Qiyamah
      'generative_synthesis': 0,    // Ras Al-Amr
      'quality_assurance': 0        // Makman Al-Ghayah
    };

    for (const step of workflow) {
      const stepCompute = this.BASE_COMPUTE_UNIT * (step.isCritical ? this.CRITICAL_STEP_MULTIPLIER : 1.0);
      const scaledCompute = stepCompute * complexityMultiplier;
      totalComputeUnits += scaledCompute;

      // Deterministically route cost allocation to the responsible chamber's quota
      switch (step.targetChamber) {
        case 'hujjah-al-damighah':
          resourceBreakdown['intelligence_processing'] += scaledCompute;
          break;
        case 'qiyamah':
          resourceBreakdown['logic_orchestration'] += scaledCompute;
          break;
        case 'ras-al-amr':
          resourceBreakdown['generative_synthesis'] += scaledCompute;
          break;
        case 'makman-al-ghayah':
          resourceBreakdown['quality_assurance'] += scaledCompute;
          break;
        default:
          resourceBreakdown['logic_orchestration'] += scaledCompute;
      }
    }

    // Format all calculated breakdowns to strict 2-decimal point precision
    totalComputeUnits = Number(totalComputeUnits.toFixed(2));
    
    for (const key in resourceBreakdown) {
      resourceBreakdown[key] = Number(resourceBreakdown[key].toFixed(2));
    }

    // Abstract financial conversion (e.g., mapped to underlying LLM API / Server costs)
    const baseCost = Number((totalComputeUnits * 0.015).toFixed(2));

    return {
      totalComputeUnits,
      complexityMultiplier,
      baseCost,
      resourceBreakdown
    };
  }
}