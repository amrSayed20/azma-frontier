/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-timeline-engine.ts
 *
 * Goal Timeline Engine.
 */

import {
  GoalContract,
  GoalStatus
} from './goal-contracts';

export interface GoalTimelineEntry {
  readonly goalId: string;

  readonly title: string;

  readonly status: GoalStatus;

  readonly createdAtMs: number;

  readonly updatedAtMs: number;
}

export class GoalTimelineEngine {

  /**
   * Builds a chronological timeline.
   */
  public buildTimeline(
    goals: readonly GoalContract[]
  ): GoalTimelineEntry[] {

    return goals
      .map(
        goal => ({
          goalId:
            goal.goalId,

          title:
            goal.title,

          status:
            goal.status,

          createdAtMs:
            goal.createdAtMs,

          updatedAtMs:
            goal.updatedAtMs
        })
      )
      .sort(
        (
          left,
          right
        ) =>
          left.createdAtMs -
          right.createdAtMs
      );
  }

  /**
   * Returns active timeline entries.
   */
  public getActiveTimeline(
    goals: readonly GoalContract[]
  ): GoalTimelineEntry[] {

    return this.buildTimeline(
      goals
    ).filter(
      entry =>
        entry.status !==
        GoalStatus.COMPLETED
    );
  }
}