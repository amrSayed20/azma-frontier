/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-orchestrator.ts
 *
 * Goal Orchestrator.
 */

import { GoalContract } from './goal-contracts';
import { GoalPlanner } from './goal-planner';
import { GoalDependencyResolver } from './goal-dependency-resolver';
import { GoalPrioritizationEngine } from './goal-prioritization-engine';

export class GoalOrchestrator {
  constructor(
    private readonly planner: GoalPlanner,
    private readonly dependencyResolver: GoalDependencyResolver,
    private readonly prioritizationEngine: GoalPrioritizationEngine
  ) {}

  /**
   * Produces executable goals.
   */
  public orchestrate(
    goals: readonly GoalContract[]
  ): GoalContract[] {

    const plannedGoals =
      this.planner.buildExecutionPlan(
        goals
      );

    const executableGoals =
      plannedGoals.filter(
        goal =>
          this.dependencyResolver.canExecute(
            goal,
            plannedGoals
          )
      );

    return this.prioritizationEngine.prioritize(
      executableGoals
    );
  }
}