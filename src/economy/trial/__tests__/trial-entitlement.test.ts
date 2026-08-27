import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../../persistent-storage/db';
import { TrialEntitlementRepository } from '../trial-entitlement-repository';
import { TrialEntitlementService } from '../trial-entitlement-service';
import { TrialExhaustedError } from '../trial-entitlement-types';

let db: DatabaseSync;
let repo: TrialEntitlementRepository;
let service: TrialEntitlementService;

const CREATOR = 'creator-trial-001';
const CREATOR_B = 'creator-trial-002';

beforeEach(() => {
  db = createDatabase(':memory:');
  repo = new TrialEntitlementRepository(db);
  service = new TrialEntitlementService(db);
});

afterEach(() => {
  db.close();
});

// SCENARIO 32: First Creation Gift — trial is granted for new Creators
// Chief Architect entitlement (authorized 2026-08-27): 5 free images, 0 free videos.
describe('Trial Entitlement — initial state', () => {
  it('new Creator receives 5 image and 0 video trial entitlements (Chief Architect authorized)', () => {
    const e = repo.getOrCreate(CREATOR);
    expect(e.imagesGranted).toBe(5);
    expect(e.imagesUsed).toBe(0);
    expect(e.videoGranted).toBe(0);
    expect(e.videoUsed).toBe(0);
    expect(e.claimedAt).toBeNull();
  });

  it('getOrCreate is idempotent — second call does not reset usage', () => {
    repo.getOrCreate(CREATOR);
    repo.claim(CREATOR, 'image');
    const e = repo.getOrCreate(CREATOR);
    expect(e.imagesUsed).toBe(1); // not reset
  });
});

describe('Trial Entitlement — claim()', () => {
  it('claims an image trial usage successfully', () => {
    const result = repo.claim(CREATOR, 'image');
    expect(result.claimed).toBe(true);
    expect(result.remainingImages).toBe(4); // 5 - 1
    expect(result.remainingVideos).toBe(0);  // no free video
  });

  it('claims up to 5 image trial usages (Chief Architect authorized)', () => {
    for (let i = 0; i < 5; i++) repo.claim(CREATOR, 'image');
    const e = repo.getOrCreate(CREATOR);
    expect(e.imagesUsed).toBe(5);
  });

  it('throws TrialExhaustedError after all 5 image trials are used', () => {
    for (let i = 0; i < 5; i++) repo.claim(CREATOR, 'image');
    expect(() => repo.claim(CREATOR, 'image')).toThrow(TrialExhaustedError);
  });

  it('throws TrialExhaustedError immediately on video claim — zero video entitlement', () => {
    // No free video generation at launch (Chief Architect authorized 2026-08-27)
    expect(() => repo.claim(CREATOR, 'video')).toThrow(TrialExhaustedError);
  });

  it('video entitlement is zero — hasRemainingTrial returns false from the start', () => {
    expect(repo.hasRemainingTrial(CREATOR, 'video')).toBe(false);
  });

  it('image and video entitlements are independent counters — exhausting images does not reset video counter', () => {
    // Video is 0 granted. Exhausting image does not change video counter.
    for (let i = 0; i < 5; i++) repo.claim(CREATOR, 'image');
    const e = repo.getOrCreate(CREATOR);
    expect(e.videoGranted).toBe(0); // still 0 — not reset or incremented
    expect(e.videoUsed).toBe(0);
  });

  it('sets claimedAt on first usage', () => {
    const before = Date.now();
    repo.claim(CREATOR, 'image');
    const e = repo.getOrCreate(CREATOR);
    expect(e.claimedAt).toBeGreaterThanOrEqual(before);
  });

  it('does not change claimedAt on subsequent claims', () => {
    repo.claim(CREATOR, 'image');
    const e1 = repo.getOrCreate(CREATOR);
    const firstClaimed = e1.claimedAt!;

    repo.claim(CREATOR, 'image');
    const e2 = repo.getOrCreate(CREATOR);
    expect(e2.claimedAt).toBe(firstClaimed);
  });
});

describe('Trial Entitlement — tenant isolation', () => {
  it('each Creator has their own independent trial quota', () => {
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');

    // CREATOR_B is unaffected
    expect(service.hasRemainingTrial(CREATOR_B, 'image')).toBe(true);
    expect(() => repo.claim(CREATOR_B, 'image')).not.toThrow();
  });
});

describe('TrialEntitlementService', () => {
  it('getTrialStatus returns correct counts after one image claim', () => {
    service.claimTrial(CREATOR, 'image');
    const status = service.getTrialStatus(CREATOR);
    expect(status.remainingImages).toBe(4); // 5 - 1
    expect(status.remainingVideos).toBe(0);  // no free video
    expect(status.hasTrialImages).toBe(true);
    expect(status.hasTrialVideos).toBe(false); // zero video entitlement
  });

  it('hasRemainingTrial returns false when image quota exhausted', () => {
    for (let i = 0; i < 5; i++) service.claimTrial(CREATOR, 'image');
    expect(service.hasRemainingTrial(CREATOR, 'image')).toBe(false);
  });
});
