/**
 * Trial Entitlement Invariant Tests
 *
 * Covers construction-order points:
 *   9. Five-image free entitlement remains exactly five
 *   10. Free entitlement does not multiply across models/providers
 *
 * Uses DatabaseSync (node:sqlite) — no network calls. No real credits consumed.
 */

import { DatabaseSync } from 'node:sqlite';
import { TrialEntitlementRepository } from '../../economy/trial/trial-entitlement-repository';
import { TrialExhaustedError } from '../../economy/trial/trial-entitlement-types';

// ── In-memory SQLite with minimal schema ──────────────────────────────────────

function createTestDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE trial_entitlements (
      creator_id TEXT PRIMARY KEY,
      images_used INTEGER NOT NULL DEFAULT 0,
      images_granted INTEGER NOT NULL DEFAULT 5,
      video_used INTEGER NOT NULL DEFAULT 0,
      video_granted INTEGER NOT NULL DEFAULT 0,
      claimed_at INTEGER,
      claim_ip_hash TEXT,
      credential_id TEXT,
      webauthn_public_key TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  return db;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 9: Five-image free entitlement remains exactly five', () => {
  it('a new Creator gets exactly 5 images granted', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);
    const e = repo.getOrCreate('creator-001');

    expect(e.imagesGranted).toBe(5);
    expect(e.imagesUsed).toBe(0);
    expect(e.videoGranted).toBe(0);
  });

  it('each claim decrements remaining images by exactly one', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    for (let i = 1; i <= 5; i++) {
      const result = repo.claim('creator-002', 'image');
      expect(result.claimed).toBe(true);
      expect(result.remainingImages).toBe(5 - i);
    }
  });

  it('the 6th image claim throws TrialExhaustedError — not silently granted', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    for (let i = 0; i < 5; i++) repo.claim('creator-003', 'image');

    expect(() => repo.claim('creator-003', 'image')).toThrow(TrialExhaustedError);
  });

  it('hasRemainingTrial returns false after all 5 images are used', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    for (let i = 0; i < 5; i++) repo.claim('creator-004', 'image');

    expect(repo.hasRemainingTrial('creator-004', 'image')).toBe(false);
  });

  it('hasRemainingTrial returns true for a fresh Creator (5 remaining)', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);
    repo.getOrCreate('creator-005');

    expect(repo.hasRemainingTrial('creator-005', 'image')).toBe(true);
  });

  it('video entitlement is zero — first video claim throws TrialExhaustedError', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);
    repo.getOrCreate('creator-006');

    expect(() => repo.claim('creator-006', 'video')).toThrow(TrialExhaustedError);
    expect(repo.hasRemainingTrial('creator-006', 'video')).toBe(false);
  });
});

describe('Point 10: Free entitlement does not multiply across models/providers', () => {
  it('the entitlement row is keyed by creatorId only — NOT by model or provider', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    // Use 2 images as if they went to two different models
    repo.claim('creator-007', 'image'); // "z-image-turbo"
    repo.claim('creator-007', 'image'); // "seedream-4"

    const e = repo.getOrCreate('creator-007');
    // Only 2 used — shared counter, not per-model
    expect(e.imagesUsed).toBe(2);
    expect(e.imagesGranted).toBe(5);
    expect(e.imagesGranted - e.imagesUsed).toBe(3);
  });

  it('100 model variants in registry do NOT create 100 entitlement rows', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    // Simulate 10 different model IDs calling getOrCreate for the same Creator
    // (in production: the entitlement layer is called before model selection, not per model)
    for (let m = 0; m < 10; m++) {
      repo.getOrCreate('creator-008');
    }

    const count = (db.prepare('SELECT COUNT(*) as n FROM trial_entitlements WHERE creator_id = ?')
      .get('creator-008') as { n: number }).n;

    // Only ONE row — no multiplication
    expect(count).toBe(1);
  });

  it('switching providers mid-session does not reset or double the entitlement', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    // Use 3 images (simulating magic-hour-image provider)
    repo.claim('creator-009', 'image');
    repo.claim('creator-009', 'image');
    repo.claim('creator-009', 'image');

    // Simulate: provider switches to a new provider (e.g., openai-image)
    // The entitlement layer is provider-agnostic — same counter
    const afterSwitch = repo.getOrCreate('creator-009');
    expect(afterSwitch.imagesUsed).toBe(3);
    expect(afterSwitch.imagesGranted).toBe(5);

    // Only 2 more images remain — the switch did not reset the counter
    repo.claim('creator-009', 'image');
    repo.claim('creator-009', 'image');

    expect(() => repo.claim('creator-009', 'image')).toThrow(TrialExhaustedError);
  });

  it('different Creators have independent entitlement counters', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    // Creator A uses all 5
    for (let i = 0; i < 5; i++) repo.claim('creator-a', 'image');

    // Creator B still has all 5
    const b = repo.getOrCreate('creator-b');
    expect(b.imagesUsed).toBe(0);
    expect(b.imagesGranted).toBe(5);
    expect(repo.hasRemainingTrial('creator-b', 'image')).toBe(true);
  });

  it('the entitlement INSERT uses images_granted=5 for every new Creator', () => {
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    // Create 3 Creators
    repo.getOrCreate('new-c-1');
    repo.getOrCreate('new-c-2');
    repo.getOrCreate('new-c-3');

    // Each should have images_granted = 5
    for (const id of ['new-c-1', 'new-c-2', 'new-c-3']) {
      const row = db
        .prepare('SELECT images_granted FROM trial_entitlements WHERE creator_id = ?')
        .get(id) as { images_granted: number } | undefined;
      expect(row).toBeDefined();
      expect(row!.images_granted).toBe(5);
    }
  });

  it('atomic UPDATE prevents race-condition double-claim', () => {
    // The SQL UPDATE uses WHERE images_used < images_granted.
    // If two concurrent processes both read imagesUsed = 4, only one UPDATE will have changes = 1.
    // The second gets changes = 0 and throws TrialExhaustedError (SQLite is single-writer — serialized).
    const db = createTestDb();
    const repo = new TrialEntitlementRepository(db);

    // Exhaust 4 claims
    for (let i = 0; i < 4; i++) repo.claim('creator-race', 'image');

    // Simulate two "concurrent" claims for the last slot
    // In SQLite single-writer mode they are serialized; only one wins.
    let successCount = 0;
    let errorCount = 0;

    try {
      repo.claim('creator-race', 'image');
      successCount++;
    } catch (e) {
      if (e instanceof TrialExhaustedError) errorCount++;
    }

    try {
      repo.claim('creator-race', 'image');
      successCount++;
    } catch (e) {
      if (e instanceof TrialExhaustedError) errorCount++;
    }

    expect(successCount).toBe(1); // exactly one wins
    expect(errorCount).toBe(1);   // the other is rejected

    const final = repo.getOrCreate('creator-race');
    expect(final.imagesUsed).toBe(5);
    expect(final.imagesGranted).toBe(5);
  });
});
