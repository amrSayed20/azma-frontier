/**
 * AZMA OS — Phase D: the mutation boundary.
 *
 * Constitution Articles 3.2, 4.5, 5.3–5.6; Phase D directive Articles 4, 5, 10, 11.
 *
 * ─── THE TEST THIS FILE EXISTS FOR ──────────────────────────────────────────
 *
 *   «لا تقبل نجاحًا مبنيًا على إعادة إرجاع الملف نفسه.»
 *
 *   The `anti-replay` block below is that rule, held by digest. A provider that
 *   hands back its own input — or a mutation that ran and changed nothing —
 *   cannot produce a successful derivation. Every other assertion here protects
 *   a lineage rule; that one protects the Creator from being shown a new
 *   version that is the old one.
 */

import { deriveAsset, digestOf, mutationRejectionSpokenAr, type MutationRequest } from '../sovereign-asset-mutation';
import { SovereignVaultManager } from '../sovereign-vault-manager';
import {
  AssetFamily, SourceChamber, DerivationKind, DerivationPermission, LifecycleState,
} from '../sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import {
  getDb, resetDbSingletonForTests, getVaultAsset, listAssetLineage,
  createProject, adoptLegacyAsset,
} from '../../persistent-storage';
import { ProjectType } from '../../sovereign-projects/sovereign-project-contracts';
// The real consumer of generationPrompt, imported so the assertion below is
// about what the Director actually does — not about what this test imagines it does.
import { deriveCreatorGoalFromPrompt } from '../../chambers/ras-al-amr/automatic-director-constitution';

const OWNER = 'creator-alpha';
const OTHER = 'creator-beta';

/** Distinct byte payloads — a real parent and a genuinely different output. */
const PARENT_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 1, 1, 1]);
const OUTPUT_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 9, 9, 9]);

let vault: SovereignVaultManager;

beforeEach(() => {
  process.env.AZMA_DB_PATH = ':memory:';
  resetDbSingletonForTests();
  vault = new SovereignVaultManager();
});
afterEach(() => { resetDbSingletonForTests(); });

async function seedParent(overrides: Record<string, unknown> = {}) {
  return vault.depositAsset({
    operationId: 'op-parent',
    subscriberTenantId: OWNER,
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: '/uploads/parent.png',
    metadata: { fileSizeBytes: PARENT_BYTES.length },
    creationChamber: SourceChamber.QIYAMAH,
    ...overrides,
  } as Parameters<SovereignVaultManager['depositAsset']>[0]);
}

function request(parentAssetId: string, overrides: Partial<MutationRequest> = {}): MutationRequest {
  return {
    parentAssetId,
    ownerId: OWNER,
    parentBytes: PARENT_BYTES,
    outputBytes: OUTPUT_BYTES,
    outputStorageUri: '/uploads/derived.png',
    chamber: SourceChamber.QIYAMAH,
    operationId: 'op-mutation',
    ...overrides,
  };
}

describe('Phase D — a real mutation produces an independent asset', () => {
  it('derives a NEW asset without touching the parent', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId));

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    // A distinct asset, not a rewrite.
    expect(outcome.asset.assetId).not.toBe(parent.assetId);
    expect(outcome.asset.secureStorageUri).not.toBe(parent.secureStorageUri);
    // The parent is still there and still retrievable — Article 5.6.
    expect(getVaultAsset(getDb(), parent.assetId)).not.toBeNull();
  });

  it('records the lineage: parent, inherited root, stepped version', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('expected success');

    expect(outcome.asset.parentAssetId).toBe(parent.assetId);
    expect(outcome.asset.rootAssetId).toBe(parent.rootAssetId);
    expect(outcome.asset.version).toBe((parent.version ?? 1) + 1);
    expect(outcome.asset.derivation).toBe(DerivationKind.MODIFIED);
  });

  it('keeps the owner, and the chamber that performed it', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId, { actorId: 'operator-3' }));
    if (!outcome.ok) throw new Error('expected success');

    expect(outcome.asset.subscriberTenantId).toBe(OWNER);
    expect(outcome.asset.creationChamber).toBe(SourceChamber.QIYAMAH);
    expect(outcome.asset.createdBy).toBe('operator-3');
  });

  it('honours an explicit ANIMATED derivation — a still brought into motion', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId, { derivation: DerivationKind.ANIMATED }));
    if (!outcome.ok) throw new Error('expected success');
    expect(outcome.asset.derivation).toBe(DerivationKind.ANIMATED);
  });

  it('stays inside the parent’s project — editing does not move an asset', async () => {
    const project = createProject(getDb(), { ownerId: OWNER, projectType: ProjectType.ASSET_COLLECTION, title: 'مجموعتي' });
    if (!project.ok) throw new Error('fixture');

    const parent = await seedParent({ projectId: project.project.projectId });
    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('expected success');

    expect(outcome.asset.projectId).toBe(project.project.projectId);
  });

  it('is deposited in the Vault and appears in the lineage', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('expected success');

    // Persisted — read back, not merely returned.
    expect(getVaultAsset(getDb(), outcome.asset.assetId)).not.toBeNull();

    const lineage = listAssetLineage(getDb(), parent.assetId, OWNER);
    expect(lineage.map((a) => a.assetId)).toEqual([parent.assetId, outcome.asset.assetId]);
  });

  it('a third generation keeps the ORIGINAL root', async () => {
    const v1 = await seedParent();
    const d1 = await deriveAsset(request(v1.assetId));
    if (!d1.ok) throw new Error('fixture');

    const THIRD = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 7, 7, 7, 7]);
    const d2 = await deriveAsset(request(d1.asset.assetId, {
      parentBytes: OUTPUT_BYTES, outputBytes: THIRD, outputStorageUri: '/uploads/v3.png',
    }));
    if (!d2.ok) throw new Error('expected success');

    expect(d2.asset.rootAssetId).toBe(v1.assetId);
    expect(d2.asset.version).toBe(3);
    expect(listAssetLineage(getDb(), v1.assetId, OWNER)).toHaveLength(3);
  });

  it('proves the content is new — digests are recorded and differ', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('expected success');

    const md = outcome.asset.metadata as Record<string, unknown>;
    expect(md.parentContentDigest).toBe(digestOf(PARENT_BYTES));
    expect(md.contentDigest).toBe(digestOf(OUTPUT_BYTES));
    expect(md.contentDigest).not.toBe(md.parentContentDigest);
    expect(md.derivedFromAssetId).toBe(parent.assetId);
  });

  it('keeps the Creator’s own instruction with the result', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId, { instructionAr: 'غيّر الخلفية إلى رفوف مكتبة' }));
    if (!outcome.ok) throw new Error('expected success');
    expect((outcome.asset.metadata as Record<string, unknown>).mutationInstructionAr)
      .toBe('غيّر الخلفية إلى رفوف مكتبة');
  });
});

describe('Phase D — THE ANTI-REPLAY GUARD, directive Article 5', () => {
  it('REFUSES output byte-identical to the parent — a replayed reference is not an edit', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId, { outputBytes: PARENT_BYTES }));

    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.rejection).toBe('OUTPUT_IDENTICAL_TO_PARENT');
  });

  it('writes NOTHING when it refuses — no phantom version appears', async () => {
    const parent = await seedParent();
    const before = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;

    await deriveAsset(request(parent.assetId, { outputBytes: PARENT_BYTES }));

    const after = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    expect(after).toBe(before);
    expect(listAssetLineage(getDb(), parent.assetId, OWNER)).toHaveLength(1);
  });

  it('REFUSES a copy under a new filename — the name is not the content', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId, {
      outputBytes: PARENT_BYTES,
      outputStorageUri: '/uploads/looks-new-but-is-not.png',
    }));
    expect(outcome.ok).toBe(false);
  });

  it('REFUSES empty output — a mutation that produced nothing', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId, { outputBytes: Buffer.alloc(0) }));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.rejection).toBe('EMPTY_OUTPUT');
  });

  it('ACCEPTS a single changed byte — the guard tests identity, not magnitude', async () => {
    const parent = await seedParent();
    const nearlyIdentical = Buffer.from(PARENT_BYTES);
    nearlyIdentical[nearlyIdentical.length - 1] ^= 0x01;

    const outcome = await deriveAsset(request(parent.assetId, { outputBytes: nearlyIdentical }));
    expect(outcome.ok).toBe(true);
  });

  it('tells the Creator plainly that nothing changed', () => {
    const spoken = mutationRejectionSpokenAr('OUTPUT_IDENTICAL_TO_PARENT');
    expect(spoken).toMatch(/لم يتغيّر/);
    // Names no provider, no library, no storage path.
    expect(spoken).not.toMatch(/openai|magic|gemini|provider|\/uploads\//i);
  });
});

describe('Phase D — lineage refusals, directive Articles 4 and 10', () => {
  it('REFUSES a missing parent', async () => {
    const outcome = await deriveAsset(request('no-such-asset'));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.rejection).toBe('PARENT_NOT_FOUND');
  });

  it('REFUSES a parent owned by another Creator', async () => {
    const theirs = await seedParent({ subscriberTenantId: OTHER });
    const outcome = await deriveAsset(request(theirs.assetId, { ownerId: OWNER }));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.rejection).toBe('PARENT_NOT_OWNED');
  });

  it('REFUSES a legacy parent before adoption — Article 5.5', async () => {
    getDb().prepare(
      `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
       VALUES ('legacy-1', ?, 'op', 'VISUAL', 'MEDIA', '/uploads/legacy-1.png', '{}', 1, 1)`,
    ).run(OWNER);

    const outcome = await deriveAsset(request('legacy-1'));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.rejection).toBe('PARENT_REQUIRES_ADOPTION');
  });

  it('ALLOWS a legacy parent once its owner adopts it', async () => {
    getDb().prepare(
      `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
       VALUES ('legacy-2', ?, 'op', 'VISUAL', 'MEDIA', '/uploads/legacy-2.png', '{}', 1, 1)`,
    ).run(OWNER);
    expect(adoptLegacyAsset(getDb(), 'legacy-2', OWNER)).toBe(true);

    const outcome = await deriveAsset(request('legacy-2'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    // The lineage begins at adoption. No history before it is invented.
    expect(outcome.asset.rootAssetId).toBe('legacy-2');
    expect(outcome.asset.version).toBe(2);
  });

  it('REFUSES a parent whose derivation right was withheld', async () => {
    const parent = await seedParent();
    getDb().prepare('UPDATE vault_assets SET derivation_permission = ? WHERE asset_id = ?')
      .run(DerivationPermission.REQUIRES_ADOPTION, parent.assetId);

    const outcome = await deriveAsset(request(parent.assetId));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.rejection).toBe('PARENT_NOT_DERIVABLE');
  });

  it('REFUSES a deleted parent', async () => {
    const parent = await seedParent();
    getDb().prepare('DELETE FROM vault_assets WHERE asset_id = ?').run(parent.assetId);

    const outcome = await deriveAsset(request(parent.assetId));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.rejection).toBe('PARENT_NOT_FOUND');
  });

  it('every refusal writes nothing at all', async () => {
    const parent = await seedParent();
    const before = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;

    await deriveAsset(request('no-such-asset'));
    await deriveAsset(request(parent.assetId, { outputBytes: Buffer.alloc(0) }));
    await deriveAsset(request(parent.assetId, { outputBytes: PARENT_BYTES }));

    const after = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    expect(after).toBe(before);
  });

  it('every refusal speaks to the Creator, naming no machinery', () => {
    for (const rejection of [
      'PARENT_NOT_FOUND', 'PARENT_NOT_OWNED', 'PARENT_REQUIRES_ADOPTION',
      'PARENT_NOT_DERIVABLE', 'EMPTY_OUTPUT', 'OUTPUT_IDENTICAL_TO_PARENT',
    ] as const) {
      const spoken = mutationRejectionSpokenAr(rejection);
      expect(/[؀-ۿ]/.test(spoken)).toBe(true);
      expect(spoken).not.toMatch(/[A-Za-z]{4}/);
    }
  });
});

describe('Phase D — the derived asset is usable downstream', () => {
  it('is selectable, addressable, and carries what a composition node needs', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('expected success');

    const stored = getVaultAsset(getDb(), outcome.asset.assetId)!;
    // What Ras Al Amr reads when placing a node on a timeline.
    expect(stored.assetFamily).toBe(AssetFamily.MEDIA);
    expect(stored.capabilityTarget).toBe(CapabilityTarget.VISUAL);
    expect(stored.secureStorageUri).toBeTruthy();
    expect(stored.lifecycleState).toBe(LifecycleState.INTERMEDIATE);
  });

  it('can itself be derived from — the chain continues', async () => {
    const parent = await seedParent();
    const first = await deriveAsset(request(parent.assetId));
    if (!first.ok) throw new Error('fixture');

    const stored = getVaultAsset(getDb(), first.asset.assetId)!;
    expect(stored.derivationPermission).toBe(DerivationPermission.ALLOWED);
  });

  it('is not visible to another Creator', async () => {
    const parent = await seedParent();
    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('fixture');

    expect(listAssetLineage(getDb(), parent.assetId, OTHER)).toHaveLength(0);
  });
});

describe('a derived asset never claims its parent’s creation as its own', () => {
  /**
   * ─── THE DEFECT THIS HOLDS SHUT ───────────────────────────────────────────
   *
   *   Derivation copied `...parent.metadata` wholesale. Found by reading what a
   *   real derived asset said about itself during the Phase D live proof:
   *
   *     instruction given  : «اجعل الخلفية زرقاء داكنة كليل صافٍ»
   *     metadata asserted  : generationPrompt = «مدينة إمبراطورية فوق النيل…»
   *                          generationModel  = flux-schnell
   *
   *   `automatic-director.ts` turns generationPrompt into the Creator's GOAL and
   *   its constitution says it echoes that "verbatim, never interprets" — so the
   *   Director would have directed a film from words the Creator never said
   *   about that asset, sincerely believing it was quoting them.
   */
  const PARENT_CREATION = {
    generationPrompt: 'مدينة إمبراطورية فوق النيل',
    generationModel: 'flux-schnell',
    generationStyle: 'imaginative',
    providerId: 'some-other-engine',
  };

  it('drops every claim about how the PARENT’s bytes were made', async () => {
    const parent = await seedParent({
      metadata: { ...PARENT_CREATION, fileSizeBytes: PARENT_BYTES.length },
    });

    const outcome = await deriveAsset(request(parent.assetId, {
      instructionAr: 'اجعل الخلفية زرقاء داكنة',
    }));
    if (!outcome.ok) throw new Error('expected success');

    const stored = getVaultAsset(getDb(), outcome.asset.assetId)!;
    for (const key of Object.keys(PARENT_CREATION)) {
      expect(stored.metadata[key]).toBeUndefined();
    }
  });

  it('keeps metadata that is genuinely about the asset, not its creation event', async () => {
    const parent = await seedParent({
      metadata: { ...PARENT_CREATION, isVoiceAsset: false, fileSizeBytes: 123 },
    });

    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('expected success');

    const stored = getVaultAsset(getDb(), outcome.asset.assetId)!;
    expect(stored.metadata.isVoiceAsset).toBe(false);
  });

  it('states its OWN account of itself instead', async () => {
    const parent = await seedParent({
      metadata: { ...PARENT_CREATION, fileSizeBytes: PARENT_BYTES.length },
    });

    const outcome = await deriveAsset(request(parent.assetId, {
      instructionAr: 'اجعل الخلفية زرقاء داكنة',
    }));
    if (!outcome.ok) throw new Error('expected success');

    const stored = getVaultAsset(getDb(), outcome.asset.assetId)!;
    expect(stored.metadata.mutationInstructionAr).toBe('اجعل الخلفية زرقاء داكنة');
    expect(stored.metadata.derivedFromAssetId).toBe(parent.assetId);
    expect(stored.metadata.parentContentDigest).toBe(digestOf(PARENT_BYTES));
    expect(stored.metadata.contentDigest).toBe(digestOf(OUTPUT_BYTES));
  });

  it('the Automatic Director finds NO stated goal on a derived asset', async () => {
    const parent = await seedParent({
      metadata: { ...PARENT_CREATION, fileSizeBytes: PARENT_BYTES.length },
    });
    const outcome = await deriveAsset(request(parent.assetId));
    if (!outcome.ok) throw new Error('expected success');

    const stored = getVaultAsset(getDb(), outcome.asset.assetId)!;
    // Exactly what automatic-director.ts reads at the point of decision.
    const goal = deriveCreatorGoalFromPrompt(stored.metadata.generationPrompt);
    expect(goal.stated).toBe(false);
    expect(goal.statedIntent).not.toBe(PARENT_CREATION.generationPrompt);
  });
});
