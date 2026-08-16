// AZMA OS — Trial Entitlement types.
// The First Creation Gift: 3 free images + 1 free 4-second video per Creator.
// Trial usage NEVER reduces the paid AZMA Unit balance.
// Trial entitlements are independent of subscriptions.

export interface TrialEntitlement {
  readonly creatorId: string;
  readonly imagesUsed: number;
  readonly imagesGranted: number;       // always 3 at launch
  readonly videoUsed: number;
  readonly videoGranted: number;        // always 1 at launch
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
