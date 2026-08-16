import type { DatabaseSync } from 'node:sqlite';
import type { TrialCapability, TrialClaimResult, TrialEntitlement } from './trial-entitlement-types';
import { TrialExhaustedError } from './trial-entitlement-types';
import { createHash } from 'crypto';

interface TrialRow {
  creator_id: string;
  images_used: number;
  images_granted: number;
  video_used: number;
  video_granted: number;
  claimed_at: number | null;
  claim_ip_hash: string | null;
  credential_id: string | null;
  webauthn_public_key: string | null;
  created_at: number;
  updated_at: number;
}

function toEntitlement(row: TrialRow): TrialEntitlement {
  return {
    creatorId: row.creator_id,
    imagesUsed: row.images_used,
    imagesGranted: row.images_granted,
    videoUsed: row.video_used,
    videoGranted: row.video_granted,
    claimedAt: row.claimed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TrialEntitlementRepository {
  constructor(private readonly db: DatabaseSync) {}

  // Returns existing entitlement or creates a zero-usage one.
  getOrCreate(creatorId: string): TrialEntitlement {
    const existing = this.db
      .prepare('SELECT * FROM trial_entitlements WHERE creator_id = ?')
      .get(creatorId) as TrialRow | undefined;

    if (existing) return toEntitlement(existing);

    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO trial_entitlements
           (creator_id, images_used, images_granted, video_used, video_granted,
            claimed_at, created_at, updated_at)
         VALUES (?, 0, 3, 0, 1, NULL, ?, ?)`,
      )
      .run(creatorId, now, now);

    return this.getOrCreate(creatorId);
  }

  // Atomically claims one trial usage. Throws TrialExhaustedError if quota is full.
  claim(
    creatorId: string,
    capability: TrialCapability,
    rawIp?: string,
  ): TrialClaimResult {
    const entitlement = this.getOrCreate(creatorId);
    const now = Date.now();
    const claimedAt = entitlement.claimedAt ?? now;

    if (capability === 'image') {
      if (entitlement.imagesUsed >= entitlement.imagesGranted) {
        throw new TrialExhaustedError('image', creatorId);
      }

      const ipHash = rawIp ? hashIp(rawIp) : null;

      const result = this.db
        .prepare(
          `UPDATE trial_entitlements
           SET images_used = images_used + 1,
               claimed_at  = COALESCE(claimed_at, ?),
               claim_ip_hash = COALESCE(claim_ip_hash, ?),
               updated_at  = ?
           WHERE creator_id = ? AND images_used < images_granted`,
        )
        .run(claimedAt, ipHash, now, creatorId) as { changes: number };

      if (result.changes !== 1) {
        throw new TrialExhaustedError('image', creatorId);
      }

      const updated = this.getOrCreate(creatorId);
      return {
        claimed: true,
        remainingImages: updated.imagesGranted - updated.imagesUsed,
        remainingVideos: updated.videoGranted - updated.videoUsed,
      };
    }

    // video
    if (entitlement.videoUsed >= entitlement.videoGranted) {
      throw new TrialExhaustedError('video', creatorId);
    }

    const ipHash = rawIp ? hashIp(rawIp) : null;

    const result = this.db
      .prepare(
        `UPDATE trial_entitlements
         SET video_used   = video_used + 1,
             claimed_at   = COALESCE(claimed_at, ?),
             claim_ip_hash = COALESCE(claim_ip_hash, ?),
             updated_at   = ?
         WHERE creator_id = ? AND video_used < video_granted`,
      )
      .run(claimedAt, ipHash, now, creatorId) as { changes: number };

    if (result.changes !== 1) {
      throw new TrialExhaustedError('video', creatorId);
    }

    const updated = this.getOrCreate(creatorId);
    return {
      claimed: true,
      remainingImages: updated.imagesGranted - updated.imagesUsed,
      remainingVideos: updated.videoGranted - updated.videoUsed,
    };
  }

  hasRemainingTrial(creatorId: string, capability: TrialCapability): boolean {
    const e = this.getOrCreate(creatorId);
    return capability === 'image'
      ? e.imagesUsed < e.imagesGranted
      : e.videoUsed < e.videoGranted;
  }
}

function hashIp(rawIp: string): string {
  return createHash('sha256').update(rawIp).digest('hex');
}
