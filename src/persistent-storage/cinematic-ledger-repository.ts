/**
 * AZMA OS — PERSISTENT STORAGE
 * Cinematic Ledger Repository
 *
 * MINISTRY VIII — REAL CINEMATIC LEDGER
 *
 * The Cinematic Ledger is the Empire's permanent memory of creative production.
 * It records what was created — not how workers executed it.
 *
 * Every constitutionally completed production event (Goal → Publication →
 * evaluated render status via MakmanGoalDistributionBridge) receives one
 * permanent record here. The record preserves:
 *   - Production identity (publicationId)
 *   - Creator identity (publisherTenantId)
 *   - Project identity (sourceCanvasId → the originating Direction Workspace)
 *   - Direction identity (sourceCompilationId → the exact compiled state)
 *   - Production type (canvasType: NARRATIVE / DIRECTORIAL / CINEMATIC)
 *   - Constitutional production status (renderStatus: DYNAMIC / PROCESSING / FAILED)
 *   - Produced artifact link (flattenedVaultAssetId, once a CINEMATIC job resolves)
 *   - Full production timestamps and version lineage
 *
 * Separation guarantee: this table records production events; the
 * operation_ledger table (Ministry VII) records execution internals.
 * No execution telemetry, worker metrics, or queue state belongs here.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { SovereignPublication } from '../chambers/makman-al-ghayah/publication-contracts';
import type { ICinematicLedger } from '../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';

export interface CinematicProductionRecord {
  publicationId: string;
  publisherTenantId: string;
  sourceCanvasId: string;
  sourceCompilationId: string;
  canvasType: string;
  title: string;
  description: string;
  renderStatus: string;
  flattenedVaultAssetId?: string;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export class CinematicLedger implements ICinematicLedger {
  constructor(private readonly db: DatabaseSync) {}

  /**
   * Permanently records a completed production event.
   * Called by MakmanGoalDistributionBridge after evaluateAndDispatchRender()
   * resolves, so initialRenderStatus is the genuine production status.
   * INSERT OR REPLACE: re-publishing the same canvas (same publicationId)
   * updates the record rather than creating a duplicate.
   */
  public record(
    publication: SovereignPublication,
    sourceCanvasId: string,
    canvasType: string,
    initialRenderStatus: string,
  ): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO cinematic_ledger
          (publication_id, publisher_tenant_id, source_canvas_id, source_compilation_id,
           canvas_type, title, description, render_status, flattened_vault_asset_id,
           published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        publication.publicationId,
        publication.publisherTenantId,
        sourceCanvasId,
        publication.sourceCompilationId,
        canvasType,
        publication.title,
        publication.description,
        initialRenderStatus,
        null,
        publication.publishedAt ?? null,
        publication.createdAt,
        publication.updatedAt,
      );
  }

  /**
   * Updates the constitutional production status of an existing record.
   * Called when a CINEMATIC job resolves (PROCESSING → COMPLETED) or fails
   * (PROCESSING → FAILED). Optionally records the produced artifact's Vault ID.
   */
  public updateProductionStatus(
    publicationId: string,
    renderStatus: string,
    flattenedVaultAssetId?: string,
  ): void {
    this.db
      .prepare(
        `UPDATE cinematic_ledger
         SET render_status = ?, flattened_vault_asset_id = COALESCE(?, flattened_vault_asset_id), updated_at = ?
         WHERE publication_id = ?`,
      )
      .run(renderStatus, flattenedVaultAssetId ?? null, Date.now(), publicationId);
  }

  /**
   * Retrieves a single production record, tenant-gated at the SQL level.
   * Returns null if the record does not exist or belongs to a different creator.
   */
  public getProductionRecord(publicationId: string, tenantId: string): CinematicProductionRecord | null {
    const row = this.db
      .prepare(
        'SELECT * FROM cinematic_ledger WHERE publication_id = ? AND publisher_tenant_id = ?',
      )
      .get(publicationId, tenantId) as Record<string, unknown> | undefined;

    return row ? this.rowToRecord(row) : null;
  }

  /**
   * Lists all productions for a creator, most recent first.
   * Returns production summaries — every field except the full publication JSON
   * (which was never stored here, only in the in-memory publication registry).
   */
  public listProductionsForCreator(tenantId: string): readonly CinematicProductionRecord[] {
    const rows = this.db
      .prepare('SELECT * FROM cinematic_ledger WHERE publisher_tenant_id = ? ORDER BY created_at DESC')
      .all(tenantId) as Record<string, unknown>[];

    return rows.map((row) => this.rowToRecord(row));
  }

  private rowToRecord(row: Record<string, unknown>): CinematicProductionRecord {
    return {
      publicationId: row.publication_id as string,
      publisherTenantId: row.publisher_tenant_id as string,
      sourceCanvasId: row.source_canvas_id as string,
      sourceCompilationId: row.source_compilation_id as string,
      canvasType: row.canvas_type as string,
      title: row.title as string,
      description: row.description as string,
      renderStatus: row.render_status as string,
      flattenedVaultAssetId: row.flattened_vault_asset_id != null ? (row.flattened_vault_asset_id as string) : undefined,
      publishedAt: row.published_at != null ? (row.published_at as number) : undefined,
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
    };
  }
}
