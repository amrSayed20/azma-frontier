/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-hierarchy.ts
 *
 * Goal Hierarchy implementation.
 */

import { GoalNode } from './goal-node';

export class GoalHierarchy {
  private readonly parentMap =
    new Map<string, string>();

  private readonly childrenMap =
    new Map<string, GoalNode[]>();

  /**
   * Registers a parent-child relationship.
   */
  public attach(
    parent: GoalNode,
    child: GoalNode
  ): void {

    this.parentMap.set(
      child.goalId,
      parent.goalId
    );

    const children =
      this.childrenMap.get(
        parent.goalId
      ) ?? [];

    children.push(
      child
    );

    this.childrenMap.set(
      parent.goalId,
      children
    );
  }

  /**
   * Returns the parent goal id.
   */
  public getParentId(
    goalId: string
  ): string | undefined {
    return this.parentMap.get(
      goalId
    );
  }

  /**
   * Returns child nodes.
   */
  public getChildren(
    goalId: string
  ): readonly GoalNode[] {

    return (
      this.childrenMap.get(
        goalId
      ) ?? []
    );
  }

  /**
   * Checks whether a goal has children.
   */
  public hasChildren(
    goalId: string
  ): boolean {

    return this.getChildren(
      goalId
    ).length > 0;
  }

  /**
   * Clears hierarchy.
   */
  public clear(): void {

    this.parentMap.clear();

    this.childrenMap.clear();
  }
}