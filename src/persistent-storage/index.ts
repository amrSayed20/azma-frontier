/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Migrates Launch-Critical data only (Creator records, sessions,
 * Qiyamah generation records, Vault asset metadata) from in-memory
 * storage to a real, durable Node `node:sqlite` database. See db.ts for
 * the disclosed deployment-topology limitation (survives restarts on a
 * single server; does not by itself solve persistence across separate
 * serverless instances).
 */

export { createDatabase, getDb, resetDbSingletonForTests } from './db';

export type { CreatorRecord, NewCreator, CreatorRole } from './creator-repository';
export { createCreator, getCreator, getCreatorByEmail, updateCreatorPreferredLocale } from './creator-repository';

export type { SessionRecord } from './session-repository';
export { createSession, getActiveSession, deleteSession } from './session-repository';

export type { GenerationRecord, NewGenerationRecord } from './generation-record-repository';
export { recordGeneration, listGenerationsForCreator } from './generation-record-repository';

export { insertVaultAsset, getVaultAsset, listVaultAssetsForTenant, linkGoalToVaultAsset } from './vault-asset-repository';

export type { SubscriptionRecord, NewSubscription, SubscriptionPatch, SubscriptionStatus } from './subscription-repository';
export {
  createSubscription,
  getSubscriptionByCreator,
  getSubscriptionByStripeSubscriptionId,
  updateSubscription,
} from './subscription-repository';

export type { CanvasSummary } from './canvas-repository';
export { saveCanvas, loadCanvas, listCanvasesForTenant } from './canvas-repository';

export type { CinematicProductionRecord } from './cinematic-ledger-repository';
export { CinematicLedger } from './cinematic-ledger-repository';
