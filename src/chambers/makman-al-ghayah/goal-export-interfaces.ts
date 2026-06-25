/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-export-interfaces.ts
 *
 * Goal Export Interfaces.
 */

import {
  GoalContract
} from './goal-contracts';

export interface GoalExportPayload {
  readonly exportedAtMs: number;

  readonly totalGoals: number;

  readonly goals: readonly GoalContract[];
}

export interface GoalExporter {
  export(
    goals: readonly GoalContract[]
  ): GoalExportPayload;
}

export class JsonGoalExporter
  implements GoalExporter {

  public export(
    goals: readonly GoalContract[]
  ): GoalExportPayload {

    return {
      exportedAtMs:
        Date.now(),

      totalGoals:
        goals.length,

      goals
    };
  }
}