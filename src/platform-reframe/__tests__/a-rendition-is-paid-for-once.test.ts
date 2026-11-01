/**
 * AZMA OS — النسخةُ تُدفَع مرّةً واحدة.
 *
 * ─── THE FIVE CASES THE OWNER NAMED, 2026-11-02 ─────────────────────────────
 *
 *   1 · resending a request whose answer was lost   → no second charge
 *   2 · a deliberate repeat while the copy is live  → no second charge
 *   3 · a request after the fifteen days are up     → a charge is due
 *   4 · a different asset                           → its own charge
 *   5 · an asset the Creator does not own           → found, charged, nothing
 *
 *   All five are answered by ONE question — «do you have the file?» — asked
 *   of the Vault with `liveRenditionFor`. These tests drive that function
 *   directly against real rows, because it is the thing that decides whether
 *   twenty units move.
 *
 *   The price itself is untouched and is asserted as such: twenty units, read
 *   from the Founder's own table and not from this file.
 */

import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-reframe-')), 'reframe.db');

import { getDb, createCreator, insertVaultAsset } from '../../persistent-storage';
import { liveRenditionFor, ownedMaster } from '../live-rendition';
import { reframeUnitCost } from '../reframe-plan';
import { RETENTION_MS } from '../retention';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import {
  SourceChamber, DerivationKind, LifecycleState, AssetFamily,
} from '../../vault/sovereign-vault-types';

let seq = 0;
const NOW = 1_800_000_000_000;

function creator(): string {
  const id = `rf_${++seq}`;
  createCreator(getDb(), { creatorId: id, email: `${id}@azma.test`, passwordHash: null, displayName: 'مبدع' });
  return id;
}

/** A master the Creator owns. */
function master(ownerId: string): string {
  const assetId = `master_${++seq}`;
  insertVaultAsset(getDb(), {
    assetId,
    subscriberTenantId: ownerId,
    originatingOperationId: assetId,
    capabilityTarget: CapabilityTarget.MOTION,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: `/uploads/${assetId}.mp4`,
    creationChamber: SourceChamber.QIYAMAH,
    derivation: DerivationKind.UPLOADED,
    lifecycleState: LifecycleState.FINAL,
    createdBy: ownerId,
    createdAt: NOW,
    updatedAt: NOW,
    metadata: {},
  });
  return assetId;
}

/** A rendition of `parent` for `platform`, expiring at `expiresAtMs`. */
function rendition(params: {
  ownerId: string;
  parent: string;
  platform: string;
  expiresAtMs: number;
  metadata?: Record<string, unknown>;
}): string {
  const assetId = `rend_${++seq}`;
  insertVaultAsset(getDb(), {
    assetId,
    subscriberTenantId: params.ownerId,
    originatingOperationId: assetId,
    capabilityTarget: CapabilityTarget.MOTION,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: `/uploads/${assetId}.mp4`,
    parentAssetId: params.parent,
    rootAssetId: params.parent,
    version: 2,
    derivation: DerivationKind.RENDERED,
    creationChamber: SourceChamber.MAKMAN_AL_GHAYAH,
    lifecycleState: LifecycleState.FINAL,
    createdBy: params.ownerId,
    createdAt: NOW,
    updatedAt: NOW,
    expiresAtMs: params.expiresAtMs,
    metadata: params.metadata ?? {
      reframedForPlatform: params.platform,
      sourceAssetId: params.parent,
    },
  });
  return assetId;
}

const look = (creatorId: string, sourceAssetId: string, platform: string, now = NOW) =>
  liveRenditionFor({ db: getDb(), creatorId, sourceAssetId, platform, now });

describe('١ · إعادةُ الإرسالِ والتكرارُ المقصود — لا خصمَ ثانٍ', () => {
  it('a live rendition is found, so neither a resend nor a repeat is charged', () => {
    const me = creator();
    const src = master(me);
    const rend = rendition({ ownerId: me, parent: src, platform: 'tiktok', expiresAtMs: NOW + RETENTION_MS });

    // Case 1 — the answer was lost and the Creator pressed again.
    const resend = look(me, src, 'tiktok');
    expect(resend?.assetId).toBe(rend);

    // Case 2 — a deliberate repeat, the copy still live. The SAME answer,
    // because the question is «do you have it?», not «did you ask?».
    const repeat = look(me, src, 'tiktok');
    expect(repeat?.assetId).toBe(rend);

    // The rendition is handed back whole, with the address the Creator needs.
    expect(resend?.secureStorageUri).toBe(`/uploads/${rend}.mp4`);
    expect(resend?.platform).toBe('tiktok');
  });

  it('and the platform is read from the rendition, so one platform never answers for another', () => {
    const me = creator();
    const src = master(me);
    rendition({ ownerId: me, parent: src, platform: 'tiktok', expiresAtMs: NOW + RETENTION_MS });

    expect(look(me, src, 'tiktok')).not.toBeNull();
    // A reframe for Instagram is a different file and a different charge.
    expect(look(me, src, 'instagram')).toBeNull();
  });
});

describe('٢ · انتهاءُ الصلاحيّة — الخصمُ مستحقٌّ من جديد', () => {
  it('a rendition one millisecond past its stamp is NOT a live copy', () => {
    const me = creator();
    const src = master(me);
    const expiry = NOW + RETENTION_MS;
    rendition({ ownerId: me, parent: src, platform: 'tiktok', expiresAtMs: expiry });

    // Alive right up to the stamp…
    expect(look(me, src, 'tiktok', expiry - 1)).not.toBeNull();
    // …and not after it.
    expect(look(me, src, 'tiktok', expiry)).toBeNull();
    expect(look(me, src, 'tiktok', expiry + 1)).toBeNull();
  });

  it('an expired row the sweeper has not reached yet is still not ownership', () => {
    /*  THE RULE THIS PROTECTS: validity is the stamp, never the sweeper's
     *  timing. If a lingering row counted as a live copy, the MOMENT THE
     *  SWEEPER LAST RAN would decide whether a Creator pays — the clock
     *  deciding money through the back door.
     */
    const me = creator();
    const src = master(me);
    rendition({ ownerId: me, parent: src, platform: 'tiktok', expiresAtMs: NOW - 1 });

    // The row is present in the table…
    const rows = getDb()
      .prepare('SELECT COUNT(*) AS n FROM vault_assets WHERE parent_asset_id = ?')
      .get(src) as { n: number };
    expect(rows.n).toBe(1);
    // …and it is not a live rendition.
    expect(look(me, src, 'tiktok')).toBeNull();
  });

  it('a rendition with no expiry stamp at all is not claimed as one', () => {
    // Only a reframe stamps an expiry. An asset without one is a master or
    // some other derivative, and must never be handed back as a rendition.
    const me = creator();
    const src = master(me);
    const assetId = `rend_${++seq}`;
    insertVaultAsset(getDb(), {
      assetId,
      subscriberTenantId: me,
      originatingOperationId: assetId,
      capabilityTarget: CapabilityTarget.MOTION,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: `/uploads/${assetId}.mp4`,
      parentAssetId: src,
      rootAssetId: src,
      version: 2,
      derivation: DerivationKind.RENDERED,
      creationChamber: SourceChamber.MAKMAN_AL_GHAYAH,
      lifecycleState: LifecycleState.FINAL,
      createdBy: me,
      createdAt: NOW,
      updatedAt: NOW,
      metadata: { reframedForPlatform: 'tiktok' },
    });

    expect(look(me, src, 'tiktok')).toBeNull();
  });
});

describe('٣ · اختلافُ الأصول', () => {
  it('a rendition of one master never answers for another', () => {
    const me = creator();
    const first = master(me);
    const second = master(me);
    rendition({ ownerId: me, parent: first, platform: 'tiktok', expiresAtMs: NOW + RETENTION_MS });

    expect(look(me, first, 'tiktok')).not.toBeNull();
    // The second master owns nothing, so its reframe is new work.
    expect(look(me, second, 'tiktok')).toBeNull();
  });

  it('the newest live rendition is the one returned', () => {
    const me = creator();
    const src = master(me);
    rendition({ ownerId: me, parent: src, platform: 'tiktok', expiresAtMs: NOW + 1_000 });
    const newer = rendition({ ownerId: me, parent: src, platform: 'tiktok', expiresAtMs: NOW + RETENTION_MS });

    expect(look(me, src, 'tiktok')?.assetId).toBe(newer);
  });
});

describe('٤ · محاولةُ الوصولِ إلى أصلٍ لا يَملِكُه المبدع', () => {
  it('another Creator’s master yields no rendition, however live theirs is', () => {
    const mine = creator();
    const theirs = creator();
    const notMine = master(theirs);
    rendition({ ownerId: theirs, parent: notMine, platform: 'tiktok', expiresAtMs: NOW + RETENTION_MS });

    // Their copy is alive and findable BY THEM…
    expect(look(theirs, notMine, 'tiktok')).not.toBeNull();
    // …and invisible to anyone else.
    expect(look(mine, notMine, 'tiktok')).toBeNull();
  });

  it('and the master itself is refused before any reframe is considered', () => {
    const mine = creator();
    const theirs = creator();
    const notMine = master(theirs);

    expect(ownedMaster(getDb(), notMine, theirs)).not.toBeNull();
    expect(ownedMaster(getDb(), notMine, mine)).toBeNull();
    expect(ownedMaster(getDb(), 'asset-that-never-was', mine)).toBeNull();
  });

  it('a rendition row belonging to someone else cannot be reached by naming the master', () => {
    // The decisive scoping: both predicates are on the asking Creator, so a
    // crafted master id cannot surface another tenant's file — nor let its
    // owner's copy excuse this Creator from a charge.
    const mine = creator();
    const theirs = creator();
    const shared = master(theirs);
    rendition({ ownerId: theirs, parent: shared, platform: 'instagram', expiresAtMs: NOW + RETENTION_MS });

    expect(look(mine, shared, 'instagram')).toBeNull();
  });
});

describe('٥ · ومتانةُ القراءةِ نفسِها', () => {
  it('metadata that will not parse is never claimed as a rendition', () => {
    const me = creator();
    const src = master(me);
    const assetId = rendition({
      ownerId: me, parent: src, platform: 'tiktok', expiresAtMs: NOW + RETENTION_MS,
    });
    // The shape of a row written by something that did not finish.
    getDb().prepare('UPDATE vault_assets SET metadata = ? WHERE asset_id = ?').run('{not json', assetId);

    expect(look(me, src, 'tiktok')).toBeNull();
  });

  it('metadata without the platform is not a match for any platform', () => {
    const me = creator();
    const src = master(me);
    rendition({
      ownerId: me, parent: src, platform: 'tiktok',
      expiresAtMs: NOW + RETENTION_MS,
      metadata: { sourceAssetId: src },
    });

    expect(look(me, src, 'tiktok')).toBeNull();
    expect(look(me, src, 'instagram')).toBeNull();
  });
});

describe('٦ · والسعرُ لم يُمَسّ', () => {
  it('a reframe still costs the twenty units the Founder ruled', () => {
    // Read from `OPERATION_CONSUMPTION` through the road's own function, so
    // this test cannot pass on a number typed into it.
    expect(reframeUnitCost()).toBe(20);
  });

  it('and the reuse question is asked BEFORE the hold is taken', () => {
    const { readFileSync } = require('fs') as typeof import('fs');
    const source = readFileSync(join(process.cwd(), 'app/makman-al-ghayah/reframe-actions.ts'), 'utf8');
    expect(source.indexOf('liveRenditionFor({')).toBeLessThan(source.indexOf('ledger.reserve('));
    // And it is scoped to the asking Creator.
    expect(source).toContain('db: getDb(), creatorId, sourceAssetId: assetId, platform: target.platform');
  });
});
