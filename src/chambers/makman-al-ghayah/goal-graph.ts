/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-graph.ts
 *
 * Goal Graph implementation.
 */

import { GoalNode } from './goal-node';

export class GoalGraph {
  private readonly nodes =
    new Map<string, GoalNode>();

  /**
   * Registers a goal node.
   */
  public addNode(
    node: GoalNode
  ): void {
    this.nodes.set(
      node.goalId,
      node
    );
  }

  /**
   * Retrieves a goal node.
   */
  public getNode(
    goalId: string
  ): GoalNode | undefined {
    return this.nodes.get(
      goalId
    );
  }

  /**
   * Checks whether a node exists.
   */
  public hasNode(
    goalId: string
  ): boolean {
    return this.nodes.has(
      goalId
    );
  }

  /**
   * Returns all nodes.
   */
  public getNodes(): readonly GoalNode[] {
    return Array.from(
      this.nodes.values()
    );
  }

  /**
   * Removes a node.
   */
  public removeNode(
    goalId: string
  ): void {
    this.nodes.delete(
      goalId
    );
  }

  /**
   * Clears the graph.
   */
  public clear(): void {
    this.nodes.clear();
  }

  /**
   * Returns node count.
   */
  public size(): number {
    return this.nodes.size;
  }
}