/**
 * AZMA OS – Qiyamah Chamber
 * File: billing-agent.ts
 *
 * Billing Agent
 * Responsible for creating and validating
 * sovereign execution bills.
 */

import { CostBreakdown } from './cost-agent';

export interface ExecutionBill {
  readonly amount: number;
  readonly availableBalance: number;
  readonly approved: boolean;
  readonly createdAt: Date;
}

export class BillingAgent {
  /**
   * Creates a sovereign execution bill.
   */
  public createBill(
    breakdown: CostBreakdown,
    availableBalance: number
  ): ExecutionBill {
    return {
      amount: breakdown.totalCost,
      availableBalance,
      approved: availableBalance >= breakdown.totalCost,
      createdAt: new Date(),
    };
  }

  /**
   * Determines whether the bill can be executed.
   */
  public canExecute(bill: ExecutionBill): boolean {
    return bill.approved;
  }

  /**
   * Calculates remaining balance after execution.
   */
  public calculateRemainingBalance(
    bill: ExecutionBill
  ): number {
    return bill.availableBalance - bill.amount;
  }
}