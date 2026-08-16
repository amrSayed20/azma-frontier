import type { DatabaseSync } from 'node:sqlite';
import { TrialEntitlementRepository } from './trial-entitlement-repository';
import type { TrialCapability, TrialClaimResult, TrialEntitlement } from './trial-entitlement-types';

// Thin service layer — coordinates the repository and exposes the public API
// used by generation routes. Does not contain persistence logic.
export class TrialEntitlementService {
  private readonly repo: TrialEntitlementRepository;

  constructor(db: DatabaseSync) {
    this.repo = new TrialEntitlementRepository(db);
  }

  getEntitlement(creatorId: string): TrialEntitlement {
    return this.repo.getOrCreate(creatorId);
  }

  hasRemainingTrial(creatorId: string, capability: TrialCapability): boolean {
    return this.repo.hasRemainingTrial(creatorId, capability);
  }

  // Claim a trial usage. Throws TrialExhaustedError if quota is full.
  // Generation routes call this ONLY if the Creator has no paid balance.
  claimTrial(creatorId: string, capability: TrialCapability, rawIp?: string): TrialClaimResult {
    return this.repo.claim(creatorId, capability, rawIp);
  }

  // Returns a Creator's trial status summary for the pre-flight estimate UI.
  getTrialStatus(creatorId: string): {
    hasTrialImages: boolean;
    hasTrialVideos: boolean;
    remainingImages: number;
    remainingVideos: number;
  } {
    const e = this.repo.getOrCreate(creatorId);
    return {
      hasTrialImages: e.imagesUsed < e.imagesGranted,
      hasTrialVideos: e.videoUsed < e.videoGranted,
      remainingImages: e.imagesGranted - e.imagesUsed,
      remainingVideos: e.videoGranted - e.videoUsed,
    };
  }
}
