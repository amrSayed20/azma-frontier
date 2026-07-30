/**
 * AZMA OS - Fleet Materialization Architecture
 * File: src/orchestrator/fleet-materialization/ledger/operation-ledger-manager.ts
 *
 * The Executable Operation Ledger Manager.
 * Governs the strict state machine, multi-tenant isolation, and resource tracking
 * for every materialization transaction across the Fleet Materialization Runtime.
 *
 * MINISTRY VII — REAL FLEET INFRASTRUCTURE: replaced in-memory Map with real
 * SQLite persistence (operation_ledger table, schema.ts). Operation state now
 * survives server restarts and is observable across process boundaries.
 * Constructor now requires a DatabaseSync instance; callers supply getDb()
 * for production or createDatabase(':memory:') for tests.
 */

import type { DatabaseSync } from 'node:sqlite';
import { AZMAPolymorphicIntent, CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { OperationLedgerEntry, OperationState } from './operation-ledger-types';
import { ILedgerManager } from '../fleet/fleet-dispatcher';

export class OperationLedgerManager implements ILedgerManager {
  constructor(private readonly db: DatabaseSync) {}

  public async createEntry(intent: AZMAPolymorphicIntent): Promise<OperationLedgerEntry> {
    const now = Date.now();
    const estimatedCost = this.calculateBaseCost(intent.capabilityTarget);

    this.db
      .prepare(
        `INSERT INTO operation_ledger
          (operation_id, subscriber_tenant_id, capability_target, current_state,
           source_intent_json, estimated_resource_cost, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        intent.operationId,
        intent.subscriberTenantId,
        intent.capabilityTarget,
        OperationState.PENDING_AUTHORIZATION,
        JSON.stringify(intent),
        estimatedCost,
        now,
        now,
      );

    return this.getEntry(intent.operationId);
  }

  public async updateState(
    operationId: string,
    newState: OperationState,
    updates?: Partial<OperationLedgerEntry>,
  ): Promise<void> {
    const entry = await this.getEntry(operationId);

    if (this.isTerminalState(entry.currentState)) {
      throw new Error(
        `Ledger Error: Cannot transition operation [${operationId}]. It is already sealed in terminal state [${entry.currentState}].`,
      );
    }

    const now = Date.now();

    this.db
      .prepare(
        `UPDATE operation_ledger SET
          current_state = ?,
          allocated_provider_id = ?,
          external_job_id = ?,
          resolved_at = ?,
          updated_at = ?
         WHERE operation_id = ?`,
      )
      .run(
        newState,
        updates?.allocatedProviderId ?? entry.allocatedProviderId ?? null,
        updates?.externalJobId ?? entry.externalJobId ?? null,
        updates?.resolvedAt ?? entry.resolvedAt ?? null,
        now,
        operationId,
      );
  }

  public async getEntry(operationId: string): Promise<OperationLedgerEntry> {
    const row = this.db
      .prepare('SELECT * FROM operation_ledger WHERE operation_id = ?')
      .get(operationId) as Record<string, unknown> | undefined;

    if (!row) {
      throw new Error(`Ledger Error: Operation [${operationId}] not found.`);
    }

    return {
      operationId: row.operation_id as string,
      subscriberTenantId: row.subscriber_tenant_id as string,
      capabilityTarget: row.capability_target as CapabilityTarget,
      sourceIntent: JSON.parse(row.source_intent_json as string) as AZMAPolymorphicIntent,
      currentState: row.current_state as OperationState,
      estimatedResourceCost: row.estimated_resource_cost as number,
      actualResourceCost: row.actual_resource_cost != null ? (row.actual_resource_cost as number) : undefined,
      allocatedProviderId: row.allocated_provider_id != null ? (row.allocated_provider_id as string) : undefined,
      externalJobId: row.external_job_id != null ? (row.external_job_id as string) : undefined,
      resolvedAt: row.resolved_at != null ? (row.resolved_at as number) : undefined,
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
    };
  }

  private isTerminalState(state: OperationState): boolean {
    return (
      state === OperationState.DEPOSITED ||
      state === OperationState.FAILED ||
      state === OperationState.REJECTED_QUOTA ||
      state === OperationState.REJECTED_POLICY
    );
  }

  private calculateBaseCost(target: string): number {
    switch (target) {
      case 'WRITING':
        return 1;
      case 'DIRECTORIAL':
        return 2;
      case 'VISUAL':
        return 5;
      case 'AUDIO':
        return 10;
      case 'MOTION':
        return 50;
      default:
        return 1;
    }
  }
}
