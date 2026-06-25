/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/ledger/operation-ledger-manager.ts
 * 
 * The Executable Operation Ledger Manager.
 * Governs the strict state machine, multi-tenant isolation, and resource tracking
 * for every materialization transaction across Al-Watin Al-Siyadi.
 */

import { AZMAPolymorphicIntent } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { OperationLedgerEntry, OperationState } from './operation-ledger-types';
import { ILedgerManager } from '../fleet/fleet-dispatcher';

export class OperationLedgerManager implements ILedgerManager {
  // In-memory structural store for active operations.
  // In production, this binds to the encrypted transactional database layer.
  private readonly activeLedgers: Map<string, OperationLedgerEntry>;

  constructor() {
    this.activeLedgers = new Map<string, OperationLedgerEntry>();
  }

  /**
   * Initializes a new transaction. 
   * Binds the intent to the subscriberTenantId immediately to enforce multi-tenant isolation.
   */
  public async createEntry(intent: AZMAPolymorphicIntent): Promise<OperationLedgerEntry> {
    const now = Date.now();

    const entry: OperationLedgerEntry = {
      operationId: intent.operationId,
      subscriberTenantId: intent.subscriberTenantId,
      capabilityTarget: intent.capabilityTarget,
      sourceIntent: intent,
      currentState: OperationState.PENDING_AUTHORIZATION,
      estimatedResourceCost: this.calculateBaseCost(intent.capabilityTarget),
      createdAt: now,
      updatedAt: now
    };

    this.activeLedgers.set(entry.operationId, entry);
    return entry;
  }

  /**
   * Executes a state transition. 
   * Includes architectural safeguards against modifying terminal states.
   */
  public async updateState(
    operationId: string, 
    newState: OperationState, 
    updates?: Partial<OperationLedgerEntry>
  ): Promise<void> {
    const entry = await this.getEntry(operationId);

    if (this.isTerminalState(entry.currentState)) {
      throw new Error(`Ledger Error: Cannot transition operation [${operationId}]. It is already sealed in terminal state [${entry.currentState}].`);
    }

    const updatedEntry: OperationLedgerEntry = {
      ...entry,
      ...updates,
      currentState: newState,
      updatedAt: Date.now()
    };

    this.activeLedgers.set(operationId, updatedEntry);
  }

  /**
   * Retrieves an operation for the Fleet Dispatcher context.
   */
  public async getEntry(operationId: string): Promise<OperationLedgerEntry> {
    const entry = this.activeLedgers.get(operationId);
    if (!entry) {
      throw new Error(`Ledger Error: Operation [${operationId}] not found.`);
    }
    return entry;
  }

  // ==========================================
  // INTERNAL STATE & ACCOUNTING LOGIC
  // ==========================================

  private isTerminalState(state: OperationState): boolean {
    return state === OperationState.DEPOSITED ||
           state === OperationState.FAILED ||
           state === OperationState.REJECTED_QUOTA ||
           state === OperationState.REJECTED_POLICY;
  }

  private calculateBaseCost(target: string): number {
    // Foundational base logic. In full execution, this communicates with the commercial billing engine.
    switch (target) {
      case 'WRITING': return 1;
      case 'DIRECTORIAL': return 2;
      case 'VISUAL': return 5;
      case 'AUDIO': return 10;
      case 'MOTION': return 50;
      default: return 1;
    }
  }
}