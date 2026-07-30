/**
 * MINISTRY VIII — REAL CINEMATIC LEDGER
 *
 * Proves the CinematicLedger repository correctly records, retrieves,
 * and updates permanent constitutional production records in SQLite.
 *
 * Covers: record(), updateProductionStatus(), getProductionRecord()
 * (including cross-tenant isolation), listProductionsForCreator()
 * (ordering and isolation), and INSERT OR REPLACE upsert behavior.
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { CinematicLedger } from '../cinematic-ledger-repository';
import { DistributionTier } from '../../chambers/makman-al-ghayah/publication-contracts';
import type { SovereignPublication } from '../../chambers/makman-al-ghayah/publication-contracts';
import { CanvasType } from '../../chambers/ras-al-amr/assembly-contracts';
import { RenderStatus } from '../../chambers/makman-al-ghayah/rendering-bridge';

function makePublication(overrides: Partial<SovereignPublication> = {}): SovereignPublication {
  const now = 1_000;
  return {
    publicationId: 'pub-1',
    sourceCompilationId: 'comp-1',
    publisherTenantId: 'tenant-1',
    title: 'A Sovereign Film',
    description: 'A constitutional production.',
    accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false },
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('Ministry VIII — CinematicLedger repository', () => {
  let db: DatabaseSync;
  let ledger: CinematicLedger;

  beforeEach(() => {
    db = createDatabase(':memory:');
    ledger = new CinematicLedger(db);
  });

  afterEach(() => {
    db.close();
  });

  it('record() persists all constitutional production fields', () => {
    const pub = makePublication();
    ledger.record(pub, 'canvas-1', CanvasType.CINEMATIC, RenderStatus.PROCESSING);

    const rec = ledger.getProductionRecord('pub-1', 'tenant-1');

    expect(rec).not.toBeNull();
    expect(rec!.publicationId).toBe('pub-1');
    expect(rec!.publisherTenantId).toBe('tenant-1');
    expect(rec!.sourceCanvasId).toBe('canvas-1');
    expect(rec!.sourceCompilationId).toBe('comp-1');
    expect(rec!.canvasType).toBe(CanvasType.CINEMATIC);
    expect(rec!.title).toBe('A Sovereign Film');
    expect(rec!.description).toBe('A constitutional production.');
    expect(rec!.renderStatus).toBe(RenderStatus.PROCESSING);
    expect(rec!.publishedAt).toBe(1_000);
    expect(rec!.createdAt).toBe(1_000);
  });

  it('record() with DYNAMIC render status — NARRATIVE and DIRECTORIAL productions are also permanently recorded', () => {
    const pub = makePublication({ publicationId: 'pub-narrative' });
    ledger.record(pub, 'canvas-nar', CanvasType.NARRATIVE, RenderStatus.DYNAMIC);

    const rec = ledger.getProductionRecord('pub-narrative', 'tenant-1');
    expect(rec!.renderStatus).toBe(RenderStatus.DYNAMIC);
    expect(rec!.canvasType).toBe(CanvasType.NARRATIVE);
  });

  it('record() with no publishedAt — optional field stored as undefined', () => {
    const pub = makePublication({ publicationId: 'pub-nopub', publishedAt: undefined });
    ledger.record(pub, 'canvas-1', CanvasType.DIRECTORIAL, RenderStatus.DYNAMIC);

    const rec = ledger.getProductionRecord('pub-nopub', 'tenant-1');
    expect(rec!.publishedAt).toBeUndefined();
  });

  it('INSERT OR REPLACE — re-publishing the same publicationId overwrites without duplication', () => {
    const v1 = makePublication({ title: 'Draft Cut' });
    ledger.record(v1, 'canvas-1', CanvasType.CINEMATIC, RenderStatus.FAILED);

    const v2 = makePublication({ title: 'Final Cut', updatedAt: 2_000 });
    ledger.record(v2, 'canvas-1', CanvasType.CINEMATIC, RenderStatus.PROCESSING);

    const rec = ledger.getProductionRecord('pub-1', 'tenant-1');
    expect(rec!.title).toBe('Final Cut');
    expect(rec!.renderStatus).toBe(RenderStatus.PROCESSING);
    expect(rec!.updatedAt).toBe(2_000);

    // Only one row
    const all = ledger.listProductionsForCreator('tenant-1');
    expect(all).toHaveLength(1);
  });

  it('updateProductionStatus() changes renderStatus and updates timestamp', () => {
    ledger.record(makePublication(), 'canvas-1', CanvasType.CINEMATIC, RenderStatus.PROCESSING);

    ledger.updateProductionStatus('pub-1', RenderStatus.COMPLETED, 'vault-asset-abc');

    const rec = ledger.getProductionRecord('pub-1', 'tenant-1');
    expect(rec!.renderStatus).toBe(RenderStatus.COMPLETED);
    expect(rec!.flattenedVaultAssetId).toBe('vault-asset-abc');
    expect(rec!.updatedAt).toBeGreaterThan(1_000);
  });

  it('updateProductionStatus() without flattenedVaultAssetId preserves the existing null value', () => {
    ledger.record(makePublication(), 'canvas-1', CanvasType.CINEMATIC, RenderStatus.PROCESSING);
    ledger.updateProductionStatus('pub-1', RenderStatus.FAILED);

    const rec = ledger.getProductionRecord('pub-1', 'tenant-1');
    expect(rec!.renderStatus).toBe(RenderStatus.FAILED);
    expect(rec!.flattenedVaultAssetId).toBeUndefined();
  });

  it('getProductionRecord() returns null for an unknown publicationId', () => {
    expect(ledger.getProductionRecord('no-such-pub', 'tenant-1')).toBeNull();
  });

  it('getProductionRecord() returns null for the correct publicationId but wrong tenant — cross-tenant isolation', () => {
    ledger.record(makePublication(), 'canvas-1', CanvasType.CINEMATIC, RenderStatus.PROCESSING);

    expect(ledger.getProductionRecord('pub-1', 'tenant-attacker')).toBeNull();
  });

  it('listProductionsForCreator() returns only that creator\'s records, most recent first', () => {
    ledger.record(
      makePublication({ publicationId: 'pub-a', createdAt: 1_000, updatedAt: 1_000 }),
      'canvas-1', CanvasType.CINEMATIC, RenderStatus.PROCESSING,
    );
    ledger.record(
      makePublication({ publicationId: 'pub-b', createdAt: 3_000, updatedAt: 3_000 }),
      'canvas-2', CanvasType.NARRATIVE, RenderStatus.DYNAMIC,
    );
    ledger.record(
      makePublication({ publicationId: 'pub-other', publisherTenantId: 'tenant-2', createdAt: 2_000, updatedAt: 2_000 }),
      'canvas-x', CanvasType.CINEMATIC, RenderStatus.FAILED,
    );

    const results = ledger.listProductionsForCreator('tenant-1');

    expect(results).toHaveLength(2);
    expect(results[0].publicationId).toBe('pub-b'); // most recent first
    expect(results[1].publicationId).toBe('pub-a');
    expect(results.every((r) => r.publisherTenantId === 'tenant-1')).toBe(true);
  });

  it('listProductionsForCreator() returns empty array for a creator with no records', () => {
    expect(ledger.listProductionsForCreator('nobody')).toEqual([]);
  });

  it('listProductionsForCreator() preserves full lineage: sourceCanvasId and sourceCompilationId are returned', () => {
    ledger.record(makePublication(), 'canvas-lineage', CanvasType.DIRECTORIAL, RenderStatus.DYNAMIC);

    const results = ledger.listProductionsForCreator('tenant-1');
    expect(results[0].sourceCanvasId).toBe('canvas-lineage');
    expect(results[0].sourceCompilationId).toBe('comp-1');
  });
});
