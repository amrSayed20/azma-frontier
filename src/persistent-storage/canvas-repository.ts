/**
 * AZMA OS — MINISTRY VI: SOVEREIGN PROJECT RESUME
 * Canvas Repository
 *
 * Durable storage for the Sovereign Direction State (SovereignCanvas).
 * Mirrors vault-asset-repository.ts in structure and security discipline:
 * every read is tenant-gated at the SQL level — a Creator can never load
 * another tenant's canvas by guessing its canvasId.
 *
 * The full SovereignCanvas is stored as JSON in `canvas_json`. This is
 * the same object the Assembly Runtime, Rendering Engine, and Export
 * Engine already consume — no secondary state, no reconstruction. The
 * `title` and `canvas_type` columns are redundant projections extracted
 * for listing purposes, so GET /api/ras-amr/canvas can return summaries
 * without deserializing every canvas's full JSON payload.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { SovereignCanvas } from '../chambers/ras-al-amr/assembly-contracts';

/** A lightweight summary returned by listCanvasesForTenant — no full JSON. */
export interface CanvasSummary {
  canvasId: string;
  subscriberTenantId: string;
  title: string;
  canvasType: string;
  savedAt: number;
}

/**
 * Saves (or re-saves) a Sovereign Canvas. INSERT OR REPLACE makes every
 * call idempotent on `canvas_id` — re-saving replaces the prior
 * snapshot, preserving the full current constitutional state.
 */
export function saveCanvas(db: DatabaseSync, canvas: SovereignCanvas, savedAt: number = Date.now()): void {
  db.prepare(
    `INSERT OR REPLACE INTO sovereign_canvases
      (canvas_id, subscriber_tenant_id, title, canvas_type, canvas_json, saved_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    canvas.canvasId,
    canvas.subscriberTenantId,
    canvas.title,
    canvas.canvasType,
    JSON.stringify(canvas),
    savedAt,
  );
}

/**
 * Loads a full SovereignCanvas by its canvasId. The subscriberTenantId
 * argument is not optional — the query enforces it at the SQL level so
 * a Creator cannot load another tenant's canvas by guessing the id.
 * Returns null when the canvas does not exist or belongs to a different
 * tenant — callers must treat both cases identically (404).
 */
export function loadCanvas(
  db: DatabaseSync,
  canvasId: string,
  subscriberTenantId: string,
): SovereignCanvas | null {
  const row = db
    .prepare(`SELECT canvas_json FROM sovereign_canvases WHERE canvas_id = ? AND subscriber_tenant_id = ?`)
    .get(canvasId, subscriberTenantId) as { canvas_json: string } | undefined;
  if (!row) return null;
  return JSON.parse(row.canvas_json) as SovereignCanvas;
}

/**
 * Lists all canvas summaries for the given tenant, most recently saved
 * first — enough for a project picker without loading full state.
 */
export function listCanvasesForTenant(db: DatabaseSync, subscriberTenantId: string): readonly CanvasSummary[] {
  const rows = db
    .prepare(
      `SELECT canvas_id, subscriber_tenant_id, title, canvas_type, saved_at
       FROM sovereign_canvases WHERE subscriber_tenant_id = ? ORDER BY saved_at DESC`,
    )
    .all(subscriberTenantId) as {
    canvas_id: string;
    subscriber_tenant_id: string;
    title: string;
    canvas_type: string;
    saved_at: number;
  }[];

  return rows.map((row) => ({
    canvasId: row.canvas_id,
    subscriberTenantId: row.subscriber_tenant_id,
    title: row.title,
    canvasType: row.canvas_type,
    savedAt: row.saved_at,
  }));
}
