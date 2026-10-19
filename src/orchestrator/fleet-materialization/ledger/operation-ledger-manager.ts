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
          actual_resource_cost = ?,
          resolved_at = ?,
          updated_at = ?
         WHERE operation_id = ?`,
      )
      .run(
        newState,
        updates?.allocatedProviderId ?? entry.allocatedProviderId ?? null,
        updates?.externalJobId ?? entry.externalJobId ?? null,
        // ── THE COLUMN THAT EXISTED AND COULD NOT BE WRITTEN ──────────────
        //
        //   MEASURED 2026-09-26: `actual_resource_cost` was null on all 28
        //   rows, and the reason was structural — this statement did not name
        //   it. Nothing could have filled it, however much a caller wanted to.
        //
        //   UNITS, AND WHY THEY ARE NOT THE SAME HERE:
        //   `estimated_resource_cost` is an AZMA internal constant per
        //   capability (WRITING 1 · VISUAL 5 · AUDIO 10 · MOTION 50). This
        //   column now carries the PROVIDER'S OWN CHARGE, in the provider's
        //   own unit. The two are NOT comparable and must never be subtracted
        //   from one another. The unit itself is recorded beside the number in
        //   the asset's metadata (`providerCreditUnit`), because this column
        //   has nowhere to hold it — a REAL with no unit is exactly the kind
        //   of value that later reads as dollars. It is not dollars.
        updates?.actualResourceCost ?? entry.actualResourceCost ?? null,
        updates?.resolvedAt ?? entry.resolvedAt ?? null,
        now,
        operationId,
      );
  }

  /**
   * ─── WHY A FAILURE REASON IS WRITTEN, AND WHERE ───────────────────────────
   *
   *   MEASURED on production 2026-10-18: of 71 recorded operations, 43 had
   *   failed, and 33 of those carried no reason at all. The reason was being
   *   read from a Map in the memory of whichever module instance spawned the
   *   job — so a status poll served by a different instance found nothing, and
   *   the Creator was shown a generic «error processing one of the files» for a
   *   render that had actually failed because the engine was missing.
   *
   *   This writes the reason where the same table already keeps it for the
   *   DIRECTORIAL path: inside `source_intent_json`, under its own key. That is
   *   a change to a STATEMENT, not to the schema — no column is added, no
   *   migration runs, and every existing row stays exactly as it is.
   *
   *   It deliberately does NOT go through updateState(): recording WHY a sealed
   *   operation failed is not a state transition, and updateState refuses to
   *   touch a terminal row. A reason that could only be written before the
   *   failure was sealed would be a reason that is never written.
   *
   *   `detail` is for engineers. It is never shown to a Creator — the chamber
   *   derives its own wording from `code` — so it must still carry no
   *   credential, token, or private path.
   */
  public async recordFailureDiagnostic(
    operationId: string,
    diagnostic: { readonly code: string; readonly detail?: string },
  ): Promise<void> {
    const row = this.db
      .prepare('SELECT source_intent_json FROM operation_ledger WHERE operation_id = ?')
      .get(operationId) as { source_intent_json?: string } | undefined;
    if (!row?.source_intent_json) return;

    let intent: Record<string, unknown>;
    try {
      intent = JSON.parse(row.source_intent_json) as Record<string, unknown>;
    } catch {
      return;
    }
    // First writer wins: the reason closest to the failure is the true one, and
    // a later generic classification must not overwrite a specific one.
    if (intent['renderFailure']) return;

    intent['renderFailure'] = {
      code: diagnostic.code,
      detail: diagnostic.detail ? diagnostic.detail.slice(0, 2000) : undefined,
      at: Date.now(),
    };
    this.db
      .prepare('UPDATE operation_ledger SET source_intent_json = ?, updated_at = ? WHERE operation_id = ?')
      .run(JSON.stringify(intent), Date.now(), operationId);
  }

  /** The persisted reason for a failed operation, or null when none was ever recorded. */
  public readFailureDiagnostic(
    operationId: string,
  ): { readonly code: string; readonly detail?: string; readonly at?: number } | null {
    const row = this.db
      .prepare('SELECT source_intent_json FROM operation_ledger WHERE operation_id = ?')
      .get(operationId) as { source_intent_json?: string } | undefined;
    if (!row?.source_intent_json) return null;
    try {
      const intent = JSON.parse(row.source_intent_json) as Record<string, unknown>;
      const d = intent['renderFailure'] as { code?: string; detail?: string; at?: number } | undefined;
      return d?.code ? { code: d.code, detail: d.detail, at: d.at } : null;
    } catch {
      return null;
    }
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

  /**
   * RAS AL AMR EXECUTION DIRECTIVE — PHASE 4: a Creator's most recent
   * operations whose id starts with `operationIdPrefix`, newest first. Lets a
   * chamber find its own render jobs again after the Creator leaves and returns.
   * Tenant-scoped by construction: only rows owned by `tenantId` are read.
   */
  public listRecentForTenant(tenantId: string, operationIdPrefix: string, limit: number): OperationLedgerEntry[] {
    const rows = this.db
      .prepare(
        `SELECT operation_id FROM operation_ledger
          WHERE subscriber_tenant_id = ? AND operation_id LIKE ? ESCAPE '\\'
          ORDER BY created_at DESC LIMIT ?`,
      )
      .all(
        tenantId,
        `${operationIdPrefix.replace(/[\\%_]/g, (c) => `\\${c}`)}%`,
        Math.max(1, Math.min(50, limit)),
      ) as Record<string, unknown>[];
    return rows.map((row) => this.getEntrySync(row.operation_id as string));
  }

  private getEntrySync(operationId: string): OperationLedgerEntry {
    const row = this.db
      .prepare('SELECT * FROM operation_ledger WHERE operation_id = ?')
      .get(operationId) as Record<string, unknown>;
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
