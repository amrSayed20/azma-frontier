/**
 * SOVEREIGN PURPOSE FOUNDATION — Constitutional Foundation Package I
 *
 * Proves SovereignPurposeRepository correctly persists and restores a
 * Creator's Sovereign Purpose, that SOEL correctly forwards to it, and
 * that the constitutional restart guarantee holds: a Purpose set in one
 * process lifetime is retrievable in a new instance backed by the same DB.
 *
 * Three sections:
 *  1. SovereignPurposeRepository — direct persistence tests
 *  2. SOEL forwarding — getSovereignPurpose / setSovereignPurpose
 *  3. Restart simulation — the constitutional objective of this Package
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { SovereignPurposeRepository } from '../sovereign-purpose-repository';
import { SovereignOperationalEntryLayer } from '../../sovereign-entry/soel';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import type { MakmanGoalDistributionBridge } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary } from '../../chambers/makman-al-ghayah/consumption-boundary';
import type { PrePublishingBoundary } from '../../chambers/ras-al-amr/pre-publishing-boundary';

function makeCreator(db: DatabaseSync, creatorId: string): void {
  db.prepare(
    'INSERT INTO creators (creator_id, email, password_hash, role, display_name, preferred_locale, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(creatorId, `${creatorId}@test.com`, 'hash', 'creator', null, null, Date.now());
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SovereignPurposeRepository — direct persistence tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Sovereign Purpose Foundation — SovereignPurposeRepository', () => {
  let db: DatabaseSync;
  let repo: SovereignPurposeRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    repo = new SovereignPurposeRepository(db);
    makeCreator(db, 'creator-1');
  });

  afterEach(() => {
    db.close();
  });

  it('getSovereignPurpose() returns null for a Creator who has never stated one', () => {
    expect(repo.getSovereignPurpose('creator-1')).toBeNull();
  });

  it('setSovereignPurpose() persists the purpose and returns a SovereignPurpose', () => {
    const purpose = repo.setSovereignPurpose('creator-1', 'Build the world\'s first sovereign creative OS.');

    expect(purpose.creatorId).toBe('creator-1');
    expect(purpose.purposeStatement).toBe('Build the world\'s first sovereign creative OS.');
    expect(typeof purpose.createdAtMs).toBe('number');
    expect(typeof purpose.updatedAtMs).toBe('number');
  });

  it('getSovereignPurpose() returns the persisted purpose after setSovereignPurpose()', () => {
    repo.setSovereignPurpose('creator-1', 'A sovereign vision.');

    const retrieved = repo.getSovereignPurpose('creator-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.creatorId).toBe('creator-1');
    expect(retrieved!.purposeStatement).toBe('A sovereign vision.');
  });

  it('setSovereignPurpose() updates the statement on a second call', () => {
    repo.setSovereignPurpose('creator-1', 'Original purpose.');
    repo.setSovereignPurpose('creator-1', 'Updated purpose.');

    const retrieved = repo.getSovereignPurpose('creator-1');
    expect(retrieved!.purposeStatement).toBe('Updated purpose.');
  });

  it('createdAtMs is set on the first call and never overwritten by subsequent updates', () => {
    const first = repo.setSovereignPurpose('creator-1', 'First.');
    const second = repo.setSovereignPurpose('creator-1', 'Second.');

    expect(second.createdAtMs).toBe(first.createdAtMs);
    expect(second.updatedAtMs).toBeGreaterThanOrEqual(first.updatedAtMs);
  });

  it('updatedAtMs reflects the latest write', () => {
    const first = repo.setSovereignPurpose('creator-1', 'First.');
    const second = repo.setSovereignPurpose('creator-1', 'Second.');

    expect(second.updatedAtMs).toBeGreaterThanOrEqual(first.updatedAtMs);
  });

  it('tenant isolation — Creator A cannot read Creator B\'s Purpose', () => {
    makeCreator(db, 'creator-2');
    repo.setSovereignPurpose('creator-1', 'Creator A\'s vision.');

    expect(repo.getSovereignPurpose('creator-2')).toBeNull();
  });

  it('getSovereignPurpose() returns null for an unknown creatorId — not an error', () => {
    expect(repo.getSovereignPurpose('no-such-creator')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SOEL forwarding — getSovereignPurpose / setSovereignPurpose
// ─────────────────────────────────────────────────────────────────────────────

describe('Sovereign Purpose Foundation — SOEL forwarding', () => {
  let db: DatabaseSync;
  let soel: SovereignOperationalEntryLayer;

  beforeEach(() => {
    db = createDatabase(':memory:');
    makeCreator(db, 'creator-soel');
    const repo = new SovereignPurposeRepository(db);
    soel = new SovereignOperationalEntryLayer(
      new GoalState(),
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      repo,
    );
  });

  afterEach(() => {
    db.close();
  });

  it('getSovereignPurpose() returns null for a Creator who has never stated one', () => {
    expect(soel.getSovereignPurpose('creator-soel')).toBeNull();
  });

  it('setSovereignPurpose() + getSovereignPurpose() round-trips correctly', () => {
    soel.setSovereignPurpose('creator-soel', 'A sovereign imperial vision.');

    const retrieved = soel.getSovereignPurpose('creator-soel');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.creatorId).toBe('creator-soel');
    expect(retrieved!.purposeStatement).toBe('A sovereign imperial vision.');
  });

  it('getSovereignPurpose() returns null when no purposeStore is wired — never throws', () => {
    const soelWithoutStore = new SovereignOperationalEntryLayer(
      new GoalState(),
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );
    expect(soelWithoutStore.getSovereignPurpose('creator-soel')).toBeNull();
  });

  it('setSovereignPurpose() throws when no purposeStore is wired — programming error guard', () => {
    const soelWithoutStore = new SovereignOperationalEntryLayer(
      new GoalState(),
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );
    expect(() => soelWithoutStore.setSovereignPurpose('creator-soel', 'A vision.')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Restart simulation — the constitutional objective of this Package
// ─────────────────────────────────────────────────────────────────────────────

describe('Sovereign Purpose Foundation — Purpose survives server restart', () => {
  it('a Purpose set in one process lifetime is retrievable in a new repository instance backed by the same database', () => {
    const db = createDatabase(':memory:');
    makeCreator(db, 'creator-restart');

    // Process lifetime 1 — set the Sovereign Purpose
    const repo1 = new SovereignPurposeRepository(db);
    repo1.setSovereignPurpose('creator-restart', 'The Empire remembers.');

    // Process lifetime 2 — new repository instance, same database (simulates restart)
    const repo2 = new SovereignPurposeRepository(db);
    const restored = repo2.getSovereignPurpose('creator-restart');

    expect(restored).not.toBeNull();
    expect(restored!.creatorId).toBe('creator-restart');
    expect(restored!.purposeStatement).toBe('The Empire remembers.');
    expect(typeof restored!.createdAtMs).toBe('number');
    expect(typeof restored!.updatedAtMs).toBe('number');

    db.close();
  });

  it('createdAtMs survives restart — the original timestamp is never reset', () => {
    const db = createDatabase(':memory:');
    makeCreator(db, 'creator-ts');

    const repo1 = new SovereignPurposeRepository(db);
    const original = repo1.setSovereignPurpose('creator-ts', 'First purpose.');

    // Restart — update via new instance
    const repo2 = new SovereignPurposeRepository(db);
    const updated = repo2.setSovereignPurpose('creator-ts', 'Updated purpose after restart.');

    expect(updated.createdAtMs).toBe(original.createdAtMs);
    expect(updated.purposeStatement).toBe('Updated purpose after restart.');

    db.close();
  });
});
