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
describe('Trial Entitlement — initial state', () => {
  it('new Creator receives 3 image and 1 video trial entitlements', () => {
    const e = repo.getOrCreate(CREATOR);
    expect(e.imagesGranted).toBe(3);
    expect(e.imagesUsed).toBe(0);
    expect(e.videoGranted).toBe(1);
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
    expect(result.remainingImages).toBe(2);
    expect(result.remainingVideos).toBe(1);
  });

  it('claims up to 3 image trial usages', () => {
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');
    const e = repo.getOrCreate(CREATOR);
    expect(e.imagesUsed).toBe(3);
  });

  it('throws TrialExhaustedError after all image trials are used', () => {
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');
    expect(() => repo.claim(CREATOR, 'image')).toThrow(TrialExhaustedError);
  });

  it('claims 1 video trial usage successfully', () => {
    const result = repo.claim(CREATOR, 'video');
    expect(result.claimed).toBe(true);
    expect(result.remainingVideos).toBe(0);
  });

  it('throws TrialExhaustedError after video trial is used', () => {
    repo.claim(CREATOR, 'video');
    expect(() => repo.claim(CREATOR, 'video')).toThrow(TrialExhaustedError);
  });

  it('image and video trials are independent — exhausting images does not affect videos', () => {
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');
    repo.claim(CREATOR, 'image');
    // video still available
    expect(() => repo.claim(CREATOR, 'video')).not.toThrow();
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
  it('getTrialStatus returns correct counts', () => {
    service.claimTrial(CREATOR, 'image');
    const status = service.getTrialStatus(CREATOR);
    expect(status.remainingImages).toBe(2);
    expect(status.remainingVideos).toBe(1);
    expect(status.hasTrialImages).toBe(true);
    expect(status.hasTrialVideos).toBe(true);
  });

  it('hasRemainingTrial returns false when quota exhausted', () => {
    service.claimTrial(CREATOR, 'video');
    expect(service.hasRemainingTrial(CREATOR, 'video')).toBe(false);
  });
});
