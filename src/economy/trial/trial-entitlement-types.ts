// AZMA OS — Trial Entitlement types.
// Chief Architect entitlement (authorized 2026-08-27):
//   5 free image generations per new Creator. No free video.
// Trial usage NEVER reduces the paid AZMA Unit balance.
// Trial entitlements are independent of subscriptions.
// Entitlement is per Creator, NOT per model or per provider —
// adding more models NEVER increases a Creator's free allocation.

export interface TrialEntitlement {
  readonly creatorId: string;
  readonly imagesUsed: number;
  readonly imagesGranted: number;       // 5 for new Creators (authorized 2026-08-27)
  readonly videoUsed: number;
  readonly videoGranted: number;        // 0 — no free video at launch
  readonly claimedAt: number | null;    // Unix ms of first usage; null if never used
  readonly createdAt: number;
  readonly updatedAt: number;
}

export type TrialCapability = 'image' | 'video';

export interface TrialClaimResult {
  readonly claimed: boolean;
  readonly remainingImages: number;
  readonly remainingVideos: number;
  readonly reason?: string;             // set if claimed: false
}

export class TrialExhaustedError extends Error {
  constructor(readonly capability: TrialCapability, readonly creatorId: string) {
    super(`Trial ${capability} entitlement exhausted for creator ${creatorId}`);
    this.name = 'TrialExhaustedError';
  }
}
