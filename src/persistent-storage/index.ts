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
export { createCreator, getCreator, getCreatorByEmail, updateCreatorPreferredLocale, setVaultPinHash, getVaultPinHash } from './creator-repository';

export type { SessionRecord } from './session-repository';
export { createSession, getActiveSession, deleteSession } from './session-repository';

export type { VaultCredential } from './vault-credential-repository';
export {
  listVaultCredentials,
  getVaultCredential,
  saveVaultCredential,
  recordVaultCredentialUse,
  deleteVaultCredential,
} from './vault-credential-repository';

export type { GenerationRecord, NewGenerationRecord } from './generation-record-repository';
export { recordGeneration, linkGenerationToVaultAsset, getGenerationRecord, deleteGenerationRecord, listGenerationsForCreator, creatorOwnsGeneratedAsset } from './generation-record-repository';

export { insertVaultAsset, getVaultAsset, findVaultAssetByStorageUri, listVaultAssetsForTenant, linkGoalToVaultAsset, deleteVaultAssetByStorageUri, deleteVaultAssetById, listAssetLineage, adoptLegacyAsset } from './vault-asset-repository';

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

export { ConsumptionRepository } from './consumption-repository';

// ── Constitutional foundation, Phase B3 — Articles 2.2, 6.3, 7, 9.3 ────────
export {
  createProject, getProject, listProjectsForOwner, listProjectsUnderUmbrella,
  createStoryboard, getStoryboard, listStoryboardsForOwner,
  addScene, listScenes, setSceneOrder, assignSceneAsset,
  recordTombstone, findTombstoneByAssetId, listTombstonesForOwner,
  mintPublicToken, createPublicLink, findPublicLinkByToken, revokePublicLink, listPublicLinksForOwner,
} from './sovereign-project-repository';

// GOOGLE IDENTITY GATE — the binding between an AZMA account and an external
// authentication provider, and the one place verification state is written.
export type { AuthenticationIdentityRecord } from './authentication-identity-repository';
export {
  findIdentityByProviderSubject,
  listIdentitiesForCreator,
  verificationStateForCreator,
  linkVerifiedIdentity,
  touchIdentity,
  resolveIdentity,
} from './authentication-identity-repository';
