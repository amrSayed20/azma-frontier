/**
 * AZMA OS — the publication that survives a restart, 2026-10-04.
 *
 *   OPTION B, approved: `MakmanPublicationRegistry` held `new Map()`, and its
 *   own contract named the replacement — «In production, this maps to the
 *   database repository holding the master catalog». After any restart,
 *   `getPublication` returned null and `PublicConsumptionBoundary` threw «not
 *   found or has been retracted» for a work nobody had retracted.
 *
 *   Every test here uses a real SQLite file and, where restart is the subject,
 *   a real close and re-open. A durability claim proven against an in-memory
 *   database proves nothing about durability.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SCHEMA_STATEMENTS } from '../schema';
import { PublicationRepository } from '../publication-repository';
import { MakmanPublicationRegistry } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import {
  DistributionTier,
  type SovereignPublication,
} from '../../chambers/makman-al-ghayah/publication-contracts';

const DAY = 24 * 60 * 60 * 1000;
let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'azma-pub-'));
  file = join(dir, 'pub.db');
});
afterEach(() => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* reclaimed */ } });

/** A real file-backed database, opened the way a restart opens one. */
function open(): DatabaseSync {
  const db = new DatabaseSync(file);
  for (const s of SCHEMA_STATEMENTS) db.exec(s);
  return db;
}

function publication(over: Partial<SovereignPublication> = {}): SovereignPublication {
  return {
    publicationId: 'pub-1',
    sourceCompilationId: 'compile-1',
    publisherTenantId: 'tenant-1',
    title: 'فيلم أدب الطلب',
    description: 'خمسة مشاهد',
    coverArtUri: '/generated-assets/cover.png',
    accessPolicy: {
      distributionTier: DistributionTier.COMMERCIAL_RENTAL,
      pricing: { basePrice: 49.5, currency: 'EGP', rentalDurationHours: 48 },
      geoRestrictions: ['EG', 'SA'],
      requiresAgeVerification: true,
    },
    isPublished: true,
    publishedAt: 1_000,
    createdAt: 1_000,
    updatedAt: 1_000,
    ...over,
  };
}

// ── A · persistence ───────────────────────────────────────────────────────
it('A · a publication persists and comes back whole — policy and all', () => {
  const db = open();
  const repo = new PublicationRepository(db);
  repo.save(publication());
  // Every field of the access policy, which is what decides who may watch.
  expect(repo.findById('pub-1')).toEqual(publication());
  db.close();
});

// ── B · restart ───────────────────────────────────────────────────────────
it('B · and it is still there after the process that wrote it is gone', async () => {
  const first = open();
  new MakmanPublicationRegistry(new PublicationRepository(first)).register(publication());
  first.close();

  // A genuinely separate connection, as a redeployed server opens one.
  const second = open();
  const registry = new MakmanPublicationRegistry(new PublicationRepository(second));
  const found = await registry.getPublication('pub-1');
  expect(found).not.toBeNull();
  expect(found!.title).toBe('فيلم أدب الطلب');
  second.close();
});

// ── C · schedule persistence ──────────────────────────────────────────────
it('C · a scheduled moment survives the restart too', () => {
  const when = Date.now() + 2 * DAY;
  const first = open();
  new PublicationRepository(first).save(publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: when }));
  first.close();

  const second = open();
  expect(new PublicationRepository(second).findById('pub-1')!.scheduledPublishAt).toBe(when);
  second.close();
});

// ── D · before due ────────────────────────────────────────────────────────
it('D · a publication whose time has not come does not publish when observed', async () => {
  const db = open();
  const store = new PublicationRepository(db);
  store.save(publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: Date.now() + DAY }));

  const found = await new MakmanPublicationRegistry(store).getPublication('pub-1');
  expect(found!.isPublished).toBe(false);
  expect(store.findById('pub-1')!.isPublished).toBe(false);
  db.close();
});

// ── E · due ───────────────────────────────────────────────────────────────
it('E · a publication whose time has come publishes on the first observation', async () => {
  const db = open();
  const store = new PublicationRepository(db);
  store.save(publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: Date.now() - 1_000 }));

  const found = await new MakmanPublicationRegistry(store).getPublication('pub-1');
  expect(found!.isPublished).toBe(true);
  expect(found!.publishedAt).toBeGreaterThan(0);
  // And it stayed published — the transition was written, not computed.
  expect(store.findById('pub-1')!.isPublished).toBe(true);
  db.close();
});

// ── F · the moment passed while the server was down ───────────────────────
it('F · a moment that passed while the server was offline is not lost', async () => {
  const first = open();
  new PublicationRepository(first).save(
    publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: Date.now() - 3 * DAY }),
  );
  first.close();                       // the server goes away, long past the hour

  const second = open();               // and comes back days later
  const store = new PublicationRepository(second);
  const found = await new MakmanPublicationRegistry(store).getPublication('pub-1');
  expect(found!.isPublished).toBe(true);
  second.close();
});

// ── G · access policy ─────────────────────────────────────────────────────
it('G · publishing changes nothing about who may watch', async () => {
  const db = open();
  const store = new PublicationRepository(db);
  store.save(publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: Date.now() - 1_000 }));

  const found = await new MakmanPublicationRegistry(store).getPublication('pub-1');
  // The policy is the publication's own, restored from its own row — never
  // inferred from a public link and never rebuilt from the ledger.
  expect(found!.accessPolicy).toEqual(publication().accessPolicy);
  db.close();
});

// ── H · idempotency ───────────────────────────────────────────────────────
it('H · two observers of one due publication produce one publication', async () => {
  const db = open();
  const store = new PublicationRepository(db);
  store.save(publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: Date.now() - 1_000 }));
  const registry = new MakmanPublicationRegistry(store);

  const first = await registry.getPublication('pub-1');
  const firstAt = first!.publishedAt;
  const second = await registry.getPublication('pub-1');

  expect(second!.isPublished).toBe(true);
  // The second observation did not re-stamp the moment it went live.
  expect(second!.publishedAt).toBe(firstAt);
  // And the conditional write itself reports that it did nothing.
  expect(store.markPublished('pub-1', Date.now())).toBe(false);
  db.close();
});

it('H · and a due publication can be claimed exactly once', () => {
  const db = open();
  const store = new PublicationRepository(db);
  store.save(publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: Date.now() - 1_000 }));
  const now = Date.now();
  expect(store.markPublished('pub-1', now)).toBe(true);
  expect(store.markPublished('pub-1', now)).toBe(false);
  db.close();
});

// ── I · an id alone cannot publish early ──────────────────────────────────
it('I · an unscheduled or future publication refuses the transition outright', () => {
  const db = open();
  const store = new PublicationRepository(db);
  store.save(publication({ publicationId: 'no-schedule', isPublished: false, publishedAt: undefined }));
  store.save(publication({ publicationId: 'future', isPublished: false, publishedAt: undefined, scheduledPublishAt: Date.now() + DAY }));

  // The due-ness is re-checked in the write itself, so holding an id is not
  // enough to make something live ahead of its hour.
  expect(store.markPublished('no-schedule', Date.now())).toBe(false);
  expect(store.markPublished('future', Date.now())).toBe(false);
  db.close();
});

// ── J · rescheduling ──────────────────────────────────────────────────────
it('J · rescheduling moves the one record — it never creates a second', async () => {
  const db = open();
  const store = new PublicationRepository(db);
  const registry = new MakmanPublicationRegistry(store);
  const momentA = Date.now() + DAY;

  store.save(publication({ isPublished: false, publishedAt: undefined, scheduledPublishAt: momentA }));
  // Moved earlier, to a moment already past.
  store.save({ ...store.findById('pub-1')!, scheduledPublishAt: Date.now() - 1_000 });

  const { n } = db.prepare('SELECT COUNT(*) AS n FROM sovereign_publications').get() as unknown as { n: number };
  expect(n).toBe(1);
  expect((await registry.getPublication('pub-1'))!.isPublished).toBe(true);
  db.close();
});

// ── K · the owner's own view ──────────────────────────────────────────────
it('K · an owner sees their due publications resolved, and no one else\'s', () => {
  const db = open();
  const store = new PublicationRepository(db);
  const past = Date.now() - 1_000;
  store.save(publication({ publicationId: 'mine', isPublished: false, publishedAt: undefined, scheduledPublishAt: past }));
  store.save(publication({ publicationId: 'theirs', publisherTenantId: 'tenant-2', isPublished: false, publishedAt: undefined, scheduledPublishAt: past }));

  const resolved = new MakmanPublicationRegistry(store).resolveDueForTenant('tenant-1');
  expect(resolved.map((p) => p.publicationId)).toEqual(['mine']);
  expect(store.findById('theirs')!.isPublished).toBe(false);
  db.close();
});

// ── L · the registry without a store still behaves as it always did ───────
it('L · a registry constructed with no store keeps its former behaviour', async () => {
  // `MAKMAN_COMMERCIAL_PIPELINE_COMPOSITION.ts` constructs one with no
  // arguments. That path must not change because production gained a store.
  const registry = new MakmanPublicationRegistry();
  registry.register(publication());
  expect((await registry.getPublication('pub-1'))!.title).toBe('فيلم أدب الطلب');
  expect(await registry.getPublication('absent')).toBeNull();
});
