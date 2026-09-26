/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/vault/sovereign-vault-manager.ts
 *
 * The Sovereign Vault Manager.
 * Executable infrastructure for depositing fleet-generated media and logic documents
 * directly into the user's permanent ownership layer.
 *
 * PERSISTENT STORAGE FOUNDATION (Engineering Package II): internal
 * storage migrated from an in-memory Map to src/persistent-storage/'s
 * durable SQLite-backed repository. Public methods, their signatures,
 * and their error-throwing behavior are unchanged — this is a storage
 * swap, not a redesign. A useful side effect: every SovereignVaultManager
 * instance now shares the same underlying database file, so the
 * previously-possible divergence between separately-constructed
 * instances (each with its own private Map) no longer occurs.
 */

import {
  SovereignVaultDeposit, VaultAsset, SovereignDepositError,
  DerivationKind, DerivationPermission, LifecycleState, isDerivable,
} from './sovereign-vault-types';
import { IVaultManager } from '../orchestrator/fleet-materialization/fleet/fleet-dispatcher';
import { getDb, insertVaultAsset, getVaultAsset, findVaultAssetByContentDigest, listVaultAssetsForTenant, linkGoalToVaultAsset, getProject } from '../persistent-storage';

export class SovereignVaultManager implements IVaultManager {
  /**
   * The final act of the materialization loop.
   * Transforms the fleet deposit into a permanent, tenant-bound Sovereign Asset.
   */
  /**
   * The one place an asset enters this Empire — and therefore the one place
   * provenance can be guaranteed.
   *
   * ─── WHY THE RULES LIVE HERE AND NOWHERE ELSE ─────────────────────────────
   *
   *   Measured in the Phase C audit: `insertVaultAsset` has exactly ONE caller
   *   in the entire repository, and it is this method. Ten call sites across
   *   eight files deposit through it — generation, upload, speech, voice
   *   cloning, fleet materialisation, the video provider, and the Chamber of
   *   Evidence.
   *
   *   That makes this a genuine chokepoint rather than a hopeful convention.
   *   Every lineage rule the constitution states is checked here, so no future
   *   creation path can bypass them by forgetting to.
   *
   * ─── WHAT IT REFUSES ──────────────────────────────────────────────────────
   *
   *   It throws rather than repairs. Article 7 of the directive: «Reject
   *   invalid cases rather than correcting them silently». A deposit naming a
   *   parent owned by someone else is not quietly reparented — it fails, and
   *   the caller learns that it tried to cross a tenant boundary.
   */
  public async depositAsset(deposit: SovereignVaultDeposit): Promise<VaultAsset> {
    const now = Date.now();
    const db = getDb();

    // Generates the universal asset ID representing the user's sovereign ownership
    // (Using standard generation logic in place of a full crypto package dependency)
    const newAssetId = `asset_${now}_${Math.random().toString(36).substring(2, 9)}`;

    // ── THE SAME BYTES ARE NOT DEPOSITED TWICE ─────────────────────────────
    //
    //   The Founder, 2026-09-26: «لا أريد ملء الخزائن بأصول مكرّرة... ستواجهنا
    //   مشكلة تخزين مع زيادة أعداد المشتركين».
    //
    //   It is checked HERE because this method is the one chokepoint every
    //   asset in the Empire passes through — upload, generation, derivation,
    //   voice, video, the Chamber of Evidence. Guarding the upload route alone
    //   would have left every other path free to duplicate.
    //
    //   It refuses rather than repairs, as this method does everywhere else:
    //   the caller learns which asset the Creator already owns and decides
    //   what to do with the bytes it had just written. A path that cannot
    //   cheaply hash its bytes supplies no digest and nothing changes for it.
    //
    //   Scoped to one tenant: two Creators owning identical bytes each own
    //   their own asset, and neither learns anything about the other.
    if (deposit.contentDigest) {
      const existing = findVaultAssetByContentDigest(db, deposit.subscriberTenantId, deposit.contentDigest);
      if (existing) {
        throw new SovereignDepositError(
          'DUPLICATE_CONTENT',
          'this Creator already owns an asset with these exact bytes',
          existing.assetId,
        );
      }
    }

    // ── Lineage resolution — Articles 5.3, 5.5, and directive Article 7 ─────
    //
    // An asset with no parent is an ORIGINAL: its own root, version 1. An asset
    // with a parent inherits that parent's root and sits one version above it,
    // which is what makes «كل نسخ هذا الأصل» a single query rather than a walk.
    const parentAssetId: string | null = deposit.parentAssetId ?? null;
    let rootAssetId = newAssetId;
    let version = 1;
    let derivation = deposit.derivation ?? DerivationKind.GENERATED;

    if (parentAssetId !== null) {
      if (parentAssetId === newAssetId) {
        throw new SovereignDepositError('CIRCULAR_LINEAGE', 'an asset cannot be its own parent');
      }

      const parent = getVaultAsset(db, parentAssetId);
      if (!parent) {
        throw new SovereignDepositError('PARENT_NOT_FOUND', `no asset '${parentAssetId}'`);
      }
      // THE CROSS-TENANT BOUNDARY, at creation time. Deriving from another
      // Creator's asset would copy their work into this one's lineage.
      if (parent.subscriberTenantId !== deposit.subscriberTenantId) {
        throw new SovereignDepositError('PARENT_NOT_OWNED', 'the parent belongs to another Creator');
      }
      // Article 5.5 — a legacy asset has no lineage to record, so nothing may
      // be built on it until its owner adopts it.
      if (!isDerivable(parent)) {
        throw new SovereignDepositError(
          'PARENT_NOT_DERIVABLE',
          'the parent requires adoption before it can be derived from',
        );
      }

      rootAssetId = parent.rootAssetId ?? parent.assetId;
      version = (parent.version ?? 1) + 1;
      // A deposit that names a parent but calls itself GENERATED is corrected
      // to MODIFIED only when it left the field unset — an explicit ANIMATED or
      // RENDERED is the caller's own true statement and is kept.
      if (deposit.derivation === undefined) derivation = DerivationKind.MODIFIED;
    }

    // ── Project ownership — directive Article 9 ────────────────────────────
    //
    // Enforced at this boundary, not in a caller. The security closure proved
    // that an ownership check living only in a caller is one a new caller
    // forgets.
    const projectId = deposit.projectId ?? null;
    if (projectId !== null) {
      const project = getProject(db, projectId, deposit.subscriberTenantId);
      if (!project) {
        throw new SovereignDepositError(
          'PROJECT_NOT_OWNED',
          'the project does not exist or belongs to another Creator',
        );
      }
    }

    const asset: VaultAsset = {
      assetId: newAssetId,
      subscriberTenantId: deposit.subscriberTenantId,
      originatingOperationId: deposit.operationId,
      capabilityTarget: deposit.capabilityTarget,
      assetFamily: deposit.assetFamily,
      secureStorageUri: deposit.secureStorageUri,
      metadata: deposit.metadata,
      createdAt: now,
      updatedAt: now,

      // Provenance, established at birth rather than upgraded later — the
      // directive forbids creating an asset and "upgrading" it afterwards
      // through a separate untracked process.
      parentAssetId,
      rootAssetId,
      version,
      derivation,
      creationChamber: deposit.creationChamber,
      projectId,
      lifecycleState: deposit.lifecycleState ?? LifecycleState.INTERMEDIATE,
      // An asset born under the constitution knows its own lineage, so it may
      // be built upon. Only legacy assets require adoption.
      derivationPermission: DerivationPermission.ALLOWED,
      createdBy: deposit.createdBy ?? deposit.subscriberTenantId,
      lastModifiedBy: null,
      lastModifiedAt: null,
      // Recorded at birth so the next deposit of the same bytes can be refused.
      // deriveAsset already puts it in metadata; the column is the indexed copy.
      contentDigest: deposit.contentDigest
        ?? (deposit.metadata as { contentDigest?: string } | undefined)?.contentDigest
        ?? null,
    };

    // Commit to the structural ownership layer
    insertVaultAsset(db, asset);

    return asset;
  }

  /**
   * Retrieves an asset from the Vault while enforcing absolute tenant isolation.
   * Required when Qiyamah domains pull context for new operations.
   */
  public async getAsset(assetId: string, tenantId: string): Promise<VaultAsset> {
    const asset = getVaultAsset(getDb(), assetId);

    if (!asset) {
      throw new Error(`Vault Error: Asset [${assetId}] not found.`);
    }

    // The absolute constitutional boundary of multi-tenant isolation
    if (asset.subscriberTenantId !== tenantId) {
      throw new Error(`Vault Security Breach: Tenant [${tenantId}] attempted to access Asset [${assetId}] belonging to another sovereign owner.`);
    }

    return asset;
  }

  /**
   * INTEGRATION PACKAGE II (2026-07-25): every asset the given tenant
   * has ever deposited, most recent first — the read path Vault
   * Palace's real Creator-visible listing depends on.
   */
  public async listAssetsForTenant(tenantId: string): Promise<readonly VaultAsset[]> {
    return listVaultAssetsForTenant(getDb(), tenantId);
  }

  /**
   * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: writes a Goal's id
   * back onto the asset it was created from, at Goal-creation time — the
   * third of the three prerequisites the Chief Architect ruled must
   * close together. Enforces the same tenant-isolation check as
   * getAsset() before writing anything.
   */
  public async linkGoalToAsset(assetId: string, tenantId: string, goalId: string): Promise<void> {
    const asset = getVaultAsset(getDb(), assetId);

    if (!asset) {
      throw new Error(`Vault Error: Asset [${assetId}] not found.`);
    }

    if (asset.subscriberTenantId !== tenantId) {
      throw new Error(`Vault Security Breach: Tenant [${tenantId}] attempted to link a Goal onto Asset [${assetId}] belonging to another sovereign owner.`);
    }

    linkGoalToVaultAsset(getDb(), assetId, goalId);
  }
}