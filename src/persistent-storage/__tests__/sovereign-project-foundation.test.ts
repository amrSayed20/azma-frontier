/**
 * AZMA OS — Phase B3: projects, storyboards, scenes, tombstones, public links.
 *
 * Constitution Articles 2.2, 6.3, 7, 9.3. Constitutional invariants, not route
 * existence — the directive is explicit that this phase must test the former.
 */

import { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import {
  createProject, getProject, listProjectsForOwner, listProjectsUnderUmbrella,
  createStoryboard, getStoryboard, listStoryboardsForOwner,
  addScene, listScenes, setSceneOrder, assignSceneAsset, setScenePicturePlan,
  recordTombstone, findTombstoneByAssetId, listTombstonesForOwner,
  mintPublicToken, createPublicLink, findPublicLinkByToken, revokePublicLink,
} from '../sovereign-project-repository';
import {
  ProjectType, ProjectLifecycle, StoryboardLifecycle,
  PublishedProtection, PublicationState, isLive, mayHaveParent,
} from '../../sovereign-projects/sovereign-project-contracts';

const OWNER = 'creator-alpha';
const OTHER = 'creator-beta';

let db: DatabaseSync;
beforeEach(() => { db = createDatabase(':memory:'); });
afterEach(() => { db.close(); });

function umbrella(owner = OWNER) {
  const outcome = createProject(db, { ownerId: owner, projectType: ProjectType.SOVEREIGN, title: 'مشروعي' });
  if (!outcome.ok) throw new Error('fixture failed');
  return outcome.project;
}

describe('B3 — projects, Article 7', () => {
  it('creates all four constitutional project types', () => {
    for (const type of [ProjectType.SOVEREIGN, ProjectType.KNOWLEDGE, ProjectType.ASSET_COLLECTION, ProjectType.COMPOSITION]) {
      const outcome = createProject(db, { ownerId: OWNER, projectType: type, title: `t-${type}` });
      expect(outcome.ok).toBe(true);
      if (outcome.ok) expect(outcome.project.projectType).toBe(type);
    }
    expect(listProjectsForOwner(db, OWNER)).toHaveLength(4);
  });

  it('rejects an invalid project type rather than storing it', () => {
    const outcome = createProject(db, { ownerId: OWNER, projectType: 'NOT_A_TYPE' as ProjectType, title: 'x' });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe('INVALID_TYPE');
    expect(listProjectsForOwner(db, OWNER)).toHaveLength(0);
  });

  it('starts ACTIVE and records both timestamps', () => {
    const p = umbrella();
    expect(p.lifecycleState).toBe(ProjectLifecycle.ACTIVE);
    expect(p.createdAt).toBeGreaterThan(0);
    expect(p.updatedAt).toBe(p.createdAt);
  });

  describe('the umbrella — Article 7.4', () => {
    it('gathers the three specialised projects beneath it', () => {
      const top = umbrella();
      for (const type of [ProjectType.KNOWLEDGE, ProjectType.ASSET_COLLECTION, ProjectType.COMPOSITION]) {
        const outcome = createProject(db, { ownerId: OWNER, projectType: type, title: `t-${type}`, parentProjectId: top.projectId });
        expect(outcome.ok).toBe(true);
      }
      const children = listProjectsUnderUmbrella(db, top.projectId, OWNER);
      expect(children).toHaveLength(3);
      expect(children.every((c) => c.parentProjectId === top.projectId)).toBe(true);
    });

    it('refuses a SOVEREIGN project a parent — there is exactly one top', () => {
      const top = umbrella();
      const outcome = createProject(db, { ownerId: OWNER, projectType: ProjectType.SOVEREIGN, title: 'second', parentProjectId: top.projectId });
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.reason).toBe('SOVEREIGN_CANNOT_HAVE_PARENT');
    });

    it('a SOVEREIGN project has no parent; the others may', () => {
      expect(mayHaveParent(ProjectType.SOVEREIGN)).toBe(false);
      expect(mayHaveParent(ProjectType.KNOWLEDGE)).toBe(true);
      expect(umbrella().parentProjectId).toBeNull();
    });

    it('refuses to hang a project under ANOTHER Creator’s umbrella', () => {
      const theirs = umbrella(OTHER);
      const outcome = createProject(db, { ownerId: OWNER, projectType: ProjectType.KNOWLEDGE, title: 'x', parentProjectId: theirs.projectId });
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.reason).toBe('PARENT_NOT_FOUND');
    });

    it('refuses a parent that does not exist', () => {
      const outcome = createProject(db, { ownerId: OWNER, projectType: ProjectType.KNOWLEDGE, title: 'x', parentProjectId: 'nope' });
      expect(outcome.ok).toBe(false);
    });
  });

  describe('ownership', () => {
    it('one Creator cannot read another’s project', () => {
      const mine = umbrella(OWNER);
      expect(getProject(db, mine.projectId, OTHER)).toBeNull();
      expect(getProject(db, mine.projectId, OWNER)).not.toBeNull();
    });

    it('listings never cross Creators', () => {
      umbrella(OWNER); umbrella(OTHER); umbrella(OTHER);
      expect(listProjectsForOwner(db, OWNER)).toHaveLength(1);
      expect(listProjectsForOwner(db, OTHER)).toHaveLength(2);
    });

    it('filters by type when asked', () => {
      const top = umbrella();
      createProject(db, { ownerId: OWNER, projectType: ProjectType.KNOWLEDGE, title: 'k', parentProjectId: top.projectId });
      expect(listProjectsForOwner(db, OWNER, ProjectType.KNOWLEDGE)).toHaveLength(1);
      expect(listProjectsForOwner(db, OWNER, ProjectType.COMPOSITION)).toHaveLength(0);
    });
  });
});

describe('B3 — storyboard and scenes, Article 2.2', () => {
  it('a storyboard is a record with identity, not a string', () => {
    const sb = createStoryboard(db, { ownerId: OWNER, title: 'قصة صاحب الحوت' });
    expect(sb.storyboardId).toMatch(/^sb_/);
    expect(sb.lifecycleState).toBe(StoryboardLifecycle.DRAFT);
    expect(getStoryboard(db, sb.storyboardId, OWNER)).not.toBeNull();
  });

  it('keeps its relationship to the knowledge that produced it', () => {
    const top = umbrella();
    const k = createProject(db, { ownerId: OWNER, projectType: ProjectType.KNOWLEDGE, title: 'k', parentProjectId: top.projectId });
    if (!k.ok) throw new Error('fixture');
    const sb = createStoryboard(db, { ownerId: OWNER, title: 'x', knowledgeProjectId: k.project.projectId });
    expect(getStoryboard(db, sb.storyboardId, OWNER)!.knowledgeProjectId).toBe(k.project.projectId);
  });

  it('is not readable by another Creator', () => {
    const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
    expect(getStoryboard(db, sb.storyboardId, OTHER)).toBeNull();
    expect(listStoryboardsForOwner(db, OTHER)).toHaveLength(0);
  });

  describe('scenes carry structure, not prose', () => {
    it('stores every structural field the constitution names', () => {
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const added = addScene(db, {
        storyboardId: sb.storyboardId, ownerId: OWNER,
        description: 'المصباح على المكتب', durationSeconds: 4.5,
        transitionIntent: 'CROSSFADE', directionNotes: 'إضاءة دافئة جانبية',
      });
      expect(added.ok).toBe(true);
      if (!added.ok) return;
      expect(added.scene.description).toBe('المصباح على المكتب');
      expect(added.scene.durationSeconds).toBe(4.5);
      expect(added.scene.transitionIntent).toBe('CROSSFADE');
      expect(added.scene.directionNotes).toBe('إضاءة دافئة جانبية');
    });

    it('APPENDS in stable, Creator-declared order — not an unordered list', () => {
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      for (const d of ['أول', 'ثاني', 'ثالث']) {
        addScene(db, { storyboardId: sb.storyboardId, ownerId: OWNER, description: d });
      }
      const scenes = listScenes(db, sb.storyboardId, OWNER);
      expect(scenes.map((s) => s.order)).toEqual([1, 2, 3]);
      expect(scenes.map((s) => s.description)).toEqual(['أول', 'ثاني', 'ثالث']);
    });

    it('order survives a reorder and the listing follows it', () => {
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      addScene(db, { storyboardId: sb.storyboardId, ownerId: OWNER, description: 'أ' });
      const b = addScene(db, { storyboardId: sb.storyboardId, ownerId: OWNER, description: 'ب' });
      if (!b.ok) throw new Error('fixture');

      expect(setSceneOrder(db, b.scene.sceneId, OWNER, 0)).toBe(true);
      expect(listScenes(db, sb.storyboardId, OWNER).map((s) => s.description)).toEqual(['ب', 'أ']);
    });

    it('refuses a scene for a storyboard this Creator does not own', () => {
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const outcome = addScene(db, { storyboardId: sb.storyboardId, ownerId: OTHER, description: 'تسلل' });
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.reason).toBe('STORYBOARD_NOT_FOUND');
      expect(listScenes(db, sb.storyboardId, OWNER)).toHaveLength(0);
    });

    it('refuses a scene for a storyboard that does not exist', () => {
      expect(addScene(db, { storyboardId: 'nope', ownerId: OWNER, description: 'x' }).ok).toBe(false);
    });

    it('assigns an asset to a scene, and only for its owner', () => {
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const s = addScene(db, { storyboardId: sb.storyboardId, ownerId: OWNER, description: 'أ' });
      if (!s.ok) throw new Error('fixture');

      expect(assignSceneAsset(db, s.scene.sceneId, OTHER, { visualAssetId: 'asset-1' })).toBe(false);
      expect(assignSceneAsset(db, s.scene.sceneId, OWNER, { visualAssetId: 'asset-1' })).toBe(true);
      expect(listScenes(db, sb.storyboardId, OWNER)[0].visualAssetId).toBe('asset-1');
    });

    it('a picture already made survives a re-save of the same demand', () => {
      // MEASURED 2026-10-19: this function nulled `visual_asset_id` for every
      // `generate` answer, and the chamber calls it on BLUR of the demand
      // field. So clicking into a finished scene's demand and clicking away
      // again discarded the link to a picture that had cost 100 credits, and
      // the next production bought it a second time. Nothing said so.
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const s = addScene(db, {
        storyboardId: sb.storyboardId, ownerId: OWNER, description: 'أ',
        sourcing: 'generate', creationDemandAr: 'برطمانُ عسلٍ على خشبٍ داكن',
      });
      if (!s.ok) throw new Error('fixture');
      assignSceneAsset(db, s.scene.sceneId, OWNER, { visualAssetId: 'asset-made' });

      // The same words again: not a new demand, so not a new picture.
      expect(setScenePicturePlan(db, s.scene.sceneId, OWNER, {
        sourcing: 'generate', creationDemandAr: 'برطمانُ عسلٍ على خشبٍ داكن',
      })).toBe(true);
      expect(listScenes(db, sb.storyboardId, OWNER)[0].visualAssetId).toBe('asset-made');
    });

    it('whitespace is not a change: the picture survives a cosmetic re-save', () => {
      // The Founder's condition, 2026-10-19: «ولا تُسقط الروابط السابقة عند
      // تحديث المطالبة دون تغيير جوهري.» A space typed and deleted is not a
      // new demand, and must not cost a Creator a picture they paid for.
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const s = addScene(db, {
        storyboardId: sb.storyboardId, ownerId: OWNER, description: 'أ',
        sourcing: 'generate', creationDemandAr: 'برطمانُ عسلٍ على خشبٍ داكن',
      });
      if (!s.ok) throw new Error('fixture');
      assignSceneAsset(db, s.scene.sceneId, OWNER, { visualAssetId: 'asset-made' });

      expect(setScenePicturePlan(db, s.scene.sceneId, OWNER, {
        sourcing: 'generate',
        // The same words, typed carelessly: leading spaces, a doubled space
        // inside, and a trailing newline.
        creationDemandAr: `  برطمانُ عسلٍ   على خشبٍ داكن${String.fromCharCode(10)}`,
      })).toBe(true);
      expect(listScenes(db, sb.storyboardId, OWNER)[0].visualAssetId).toBe('asset-made');
    });

    it('a changed demand forgets the picture that answered the old one', () => {
      // The other half of the same rule: a generated picture answers a demand.
      // Change the demand and it no longer answers it, so the scene stops
      // claiming it — and the next production makes one that does.
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const s = addScene(db, {
        storyboardId: sb.storyboardId, ownerId: OWNER, description: 'أ',
        sourcing: 'generate', creationDemandAr: 'برطمانُ عسلٍ على خشبٍ داكن',
      });
      if (!s.ok) throw new Error('fixture');
      assignSceneAsset(db, s.scene.sceneId, OWNER, { visualAssetId: 'asset-made' });

      expect(setScenePicturePlan(db, s.scene.sceneId, OWNER, {
        sourcing: 'generate', creationDemandAr: 'ملعقةٌ ترفعُ خيطَ عسلٍ ذهبيّاً',
      })).toBe(true);
      expect(listScenes(db, sb.storyboardId, OWNER)[0].visualAssetId).toBeNull();
    });

    it('turning to the stock library forgets a generated picture too', () => {
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const s = addScene(db, {
        storyboardId: sb.storyboardId, ownerId: OWNER, description: 'أ',
        sourcing: 'generate', creationDemandAr: 'برطمانُ عسلٍ على خشبٍ داكن',
      });
      if (!s.ok) throw new Error('fixture');
      assignSceneAsset(db, s.scene.sceneId, OWNER, { visualAssetId: 'asset-made' });

      expect(setScenePicturePlan(db, s.scene.sceneId, OWNER, { sourcing: 'stock' })).toBe(true);
      expect(listScenes(db, sb.storyboardId, OWNER)[0].visualAssetId).toBeNull();
    });

    it('assigning one asset does not erase the other', () => {
      const sb = createStoryboard(db, { ownerId: OWNER, title: 'x' });
      const s = addScene(db, { storyboardId: sb.storyboardId, ownerId: OWNER, description: 'أ' });
      if (!s.ok) throw new Error('fixture');
      assignSceneAsset(db, s.scene.sceneId, OWNER, { visualAssetId: 'v1' });
      assignSceneAsset(db, s.scene.sceneId, OWNER, { audioAssetId: 'a1' });
      const scene = listScenes(db, sb.storyboardId, OWNER)[0];
      expect(scene.visualAssetId).toBe('v1');
      expect(scene.audioAssetId).toBe('a1');
    });
  });
});

describe('B3 — tombstones, Articles 6.2 and 6.3', () => {
  it('preserves identity, owner and the deletion actor', () => {
    const t = recordTombstone(db, { assetId: 'asset-1', ownerId: OWNER, deletedBy: OWNER, nowMs: 5_000 });
    expect(t.assetId).toBe('asset-1');
    expect(t.deletedBy).toBe(OWNER);
    expect(t.deletedAt).toBe(5_000);
    expect(findTombstoneByAssetId(db, 'asset-1', OWNER)).not.toBeNull();
  });

  it('KEEPS THE LINEAGE — a destroyed parent still answers for its children', () => {
    // Article 5.4 (no orphan) and Article 6.2 (destruction) collide without this.
    recordTombstone(db, {
      assetId: 'parent-1', ownerId: OWNER, deletedBy: OWNER,
      parentAssetId: 'grandparent-1', rootAssetId: 'root-1', projectId: 'proj-1',
      creationChamber: 'QIYAMAH',
    });
    const t = findTombstoneByAssetId(db, 'parent-1', OWNER)!;
    expect(t.parentAssetId).toBe('grandparent-1');
    expect(t.rootAssetId).toBe('root-1');
    expect(t.projectId).toBe('proj-1');
    expect(t.creationChamber).toBe('QIYAMAH');
  });

  it('STRIPS THE STORAGE PATH even when a caller passes one', () => {
    const t = recordTombstone(db, {
      assetId: 'asset-1', ownerId: OWNER, deletedBy: OWNER,
      metadataSnapshot: {
        secureStorageUri: '/uploads/secret.png',
        secure_storage_uri: '/uploads/secret.png',
        assetUrl: '/uploads/secret.png',
        fileSizeBytes: 1234,
      },
    });
    expect(t.metadataSnapshot.secureStorageUri).toBeUndefined();
    expect(t.metadataSnapshot.secure_storage_uri).toBeUndefined();
    expect(t.metadataSnapshot.assetUrl).toBeUndefined();
    // What an audit legitimately needs survives.
    expect(t.metadataSnapshot.fileSizeBytes).toBe(1234);
    expect(JSON.stringify(t)).not.toContain('/uploads/');
  });

  it('records the published-protection state — Article 6.4', () => {
    const t = recordTombstone(db, {
      assetId: 'asset-1', ownerId: OWNER, deletedBy: OWNER,
      publishedProtection: PublishedProtection.PROTECTED_BY_PUBLICATION,
    });
    expect(t.publishedProtection).toBe(PublishedProtection.PROTECTED_BY_PUBLICATION);
  });

  it('defaults to NOT_PROTECTED rather than guessing', () => {
    expect(recordTombstone(db, { assetId: 'a', ownerId: OWNER, deletedBy: OWNER }).publishedProtection)
      .toBe(PublishedProtection.NOT_PROTECTED);
  });

  it('is not readable by another Creator', () => {
    recordTombstone(db, { assetId: 'asset-1', ownerId: OWNER, deletedBy: OWNER });
    expect(findTombstoneByAssetId(db, 'asset-1', OTHER)).toBeNull();
    expect(listTombstonesForOwner(db, OTHER)).toHaveLength(0);
  });
});

describe('B3 — sovereign public links, Article 9.3', () => {
  it('mints a token that cannot be guessed', () => {
    const tokens = new Set(Array.from({ length: 500 }, () => mintPublicToken()));
    expect(tokens.size).toBe(500);
    for (const token of tokens) {
      // 32 bytes base64url → 43 chars, no padding, url-safe alphabet only.
      expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    }
  });

  it('is not sequential — consecutive tokens share no prefix', () => {
    const a = mintPublicToken();
    const b = mintPublicToken();
    expect(a.slice(0, 8)).not.toBe(b.slice(0, 8));
  });

  it('points at a FINAL WORK asset, never at a storage path', () => {
    const link = createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: 'final-1' });
    expect(link.finalWorkAssetId).toBe('final-1');
    expect(JSON.stringify(link)).not.toContain('/uploads/');
    expect(JSON.stringify(link)).not.toContain('/generated-assets/');
    expect(JSON.stringify(link)).not.toContain('/renders/');
  });

  it('is live when published', () => {
    const link = createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: 'final-1' });
    expect(link.publicationState).toBe(PublicationState.PUBLISHED);
    expect(isLive(link)).toBe(true);
  });

  it('resolves by token without an owner — that is what public means', () => {
    const link = createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: 'final-1' });
    expect(findPublicLinkByToken(db, link.publicToken)!.linkId).toBe(link.linkId);
  });

  it('returns nothing for a token that was never minted', () => {
    expect(findPublicLinkByToken(db, mintPublicToken())).toBeNull();
  });

  describe('revocation — Article 9.3', () => {
    it('stops the link being live, and records who and when', () => {
      const link = createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: 'final-1' });
      expect(revokePublicLink(db, link.linkId, OWNER, 7_777)).toBe(true);

      const after = findPublicLinkByToken(db, link.publicToken)!;
      expect(after.publicationState).toBe(PublicationState.REVOKED);
      expect(after.revokedAt).toBe(7_777);
      expect(after.revokedBy).toBe(OWNER);
      expect(isLive(after)).toBe(false);
    });

    it('cannot be performed by another Creator', () => {
      const link = createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: 'final-1' });
      expect(revokePublicLink(db, link.linkId, OTHER)).toBe(false);
      expect(isLive(findPublicLinkByToken(db, link.publicToken)!)).toBe(true);
    });

    it('a revoked link still resolves — so the refusal is made in the open', () => {
      const link = createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: 'final-1' });
      revokePublicLink(db, link.linkId, OWNER);
      const found = findPublicLinkByToken(db, link.publicToken);
      expect(found).not.toBeNull();
      expect(isLive(found!)).toBe(false);
    });
  });
});
