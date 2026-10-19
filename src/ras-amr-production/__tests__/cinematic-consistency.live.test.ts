/**
 * AZMA OS — RAS AL AMR: the decisive LIVE proof of the cinematic-consistency road.
 *
 * ─── WHAT THIS IS, AND WHY IT IS NOT A UNIT TEST ────────────────────────────
 *
 *   Every other suite in this folder doubles the provider, which is right for
 *   proving decisions and useless for proving consistency. The question the
 *   Chief Architect put — does a product stay the same product across frames
 *   when each later frame is EDITED out of an approved one — cannot be answered
 *   by a mock, by a green build, or by two different sha256 sums. It can only
 *   be answered by real pictures, looked at.
 *
 *   So this runs the real road with the real engine and real money:
 *
 *     1 · the base frame      real `generateImage`      (text → image)
 *     2 · approval            real `assignSceneAsset`   (owner-scoped)
 *     3 · two more frames     real `commissionScenePictures` with a reference,
 *                             which calls the real `editSovereignImage`
 *     4 · verification        the rows, the lineage, the bytes, the charge
 *
 *   Nothing is bypassed: the same courier, the same edit act, the same Vault
 *   deposit and the same owner-scoped pinning the chamber uses. What is NOT
 *   exercised is the film workshop — the produce route refuses before any
 *   commission when the workshop is unreachable, and the workshop lives on the
 *   loopback of another host. That gate is about assembling a film, not about
 *   making frames, and frames are the question here.
 *
 * ─── OPT-IN, BECAUSE IT SPENDS ──────────────────────────────────────────────
 *
 *       AZMA_ALLOW_TEST_NETWORK=1 MAGIC_HOUR_LIVE=1 \
 *       MAGIC_HOUR_API_KEY=… npx jest cinematic-consistency.live
 *
 *   Skipped otherwise, in full, so an ordinary run of this repository can never
 *   spend a credit by accident.
 *
 *   MEASURED COST, from the Empire's own cost truth: 100 credits for the base
 *   frame and 100 for each edit — 300 for one complete proof. The provider's
 *   own `credits_charged` is recorded for each job rather than assumed.
 */

import { mkdirSync, copyFileSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

const LIVE = process.env['MAGIC_HOUR_LIVE'] === '1'
  && typeof process.env['MAGIC_HOUR_API_KEY'] === 'string'
  && process.env['MAGIC_HOUR_API_KEY']!.length > 20;

// The scratch world. A real database and a real directory, both temporary:
// this test writes rows and bytes, and it writes them nowhere near the dev or
// the production Vault. Set before any import, because module-level readers
// freeze what they see.
const scratch = LIVE ? join(tmpdir(), `azma-live-consistency-${Date.now()}`) : '';
if (LIVE) {
  mkdirSync(scratch, { recursive: true });
  process.env['AZMA_DB_PATH'] = join(scratch, 'live.db');
  process.env['UPLOADS_DIR'] = scratch;
}
/** Where the pictures are left for a human to look at. */
const EVIDENCE = process.env['AZMA_LIVE_EVIDENCE_DIR'] ?? join(scratch, 'evidence');

import { getDb } from '../../persistent-storage/db';
import { createCreator, getVaultAsset } from '../../persistent-storage';
import {
  addScene,
  assignSceneAsset,
  createStoryboard,
  listScenes,
} from '../../persistent-storage/sovereign-project-repository';
import { generateImage } from '../../qiyamah-generation/generation-service';
import { commissionScenePictures, composeSceneInstruction } from '../qiyamah-commission';

const describeLive = LIVE ? describe : describe.skip;

const OWNER = 'creator-live-consistency';

/** One product, one world — the words the whole proof is built on. */
const WORLD = [
  'المكان: طاولةُ خشبٍ داكنٍ في مطبخٍ ريفيٍّ، خلفيّةٌ معتمةٌ غيرُ واضحةِ التفاصيل.',
  'الإضاءة: ضوءٌ ذهبيٌّ دافئٌ من اليسار، ظلالٌ ناعمة.',
  'الأسلوب: تصويرٌ إعلانيٌّ واقعيٌّ عاليُ الوضوح، ألوانٌ دافئة.',
].join(' ');

const PRODUCT = [
  'برطمانُ عسلٍ زجاجيٌّ أسطوانيٌّ بغطاءٍ نحاسيٍّ ذهبيّ،',
  'عليه مُلصَقٌ ورقيٌّ كريميٌّ مستطيلٌ بإطارٍ ذهبيٍّ رقيقٍ وكلمةٍ عربيّةٍ واحدةٍ بخطٍّ بنّيٍّ داكن،',
  'والعسلُ داخلَه كهرمانيٌّ فاتح.',
].join(' ');

const SCENE_DEMANDS = [
  'البرطمانُ وحدَه في منتصفِ الإطار، لقطةٌ أماميّةٌ على مستوى الطاولة.',
  'نفسُ البرطمانِ من زاويةٍ جانبيّةٍ قريبةٍ، وملعقةُ خشبٍ ترفعُ خيطَ عسلٍ أمامَه.',
  'نفسُ البرطمانِ ويدٌ تُقدّمُه نحوَ الكاميرا، لقطةٌ أوسعُ من زاويةٍ منخفضةٍ قليلاً.',
];

const digestOfFile = (uri: string) =>
  createHash('sha256').update(readFileSync(onDisk(uri))).digest('hex');

function onDisk(uri: string): string {
  const name = basename(uri);
  return uri.startsWith('/generated-assets/')
    ? join(scratch, 'generated-assets', name)
    : join(scratch, name);
}

describeLive('LIVE — one product across three frames', () => {
  jest.setTimeout(20 * 60 * 1000);

  const ledger: Record<string, unknown> = { startedAt: new Date().toISOString() };

  afterAll(() => {
    if (!LIVE) return;
    mkdirSync(EVIDENCE, { recursive: true });
    writeFileSync(join(EVIDENCE, 'ledger.json'), JSON.stringify(ledger, null, 1));
    // eslint-disable-next-line no-console
    console.log('[live] evidence written to', EVIDENCE);
  });

  it('makes a base frame, approves it, and builds two more OUT OF it', async () => {
    const db = getDb();
    createCreator(db, {
      creatorId: OWNER, email: 'live-consistency@azma.local',
      passwordHash: 'not-a-login', role: 'founder', displayName: 'Live Proof',
    });

    // ── 1 · THE BASE FRAME, from words ───────────────────────────────────
    const basePrompt = composeSceneInstruction({
      visualWorldAr: `${WORLD} المنتج: ${PRODUCT}`,
      demandAr: SCENE_DEMANDS[0],
    });
    const base = await generateImage({
      prompt: basePrompt,
      creatorId: OWNER,
      platformTarget: 'youtube',
    });
    ledger['base'] = base;
    if (base.status !== 'succeeded') {
      throw new Error(`the base frame did not arrive: ${JSON.stringify(base)}`);
    }

    const baseAsset = getVaultAsset(db, base.asset.assetId);
    expect(baseAsset).toBeTruthy();
    const baseDigestBefore = digestOfFile(base.asset.assetUrl);
    ledger['baseAsset'] = {
      assetId: baseAsset!.assetId,
      uri: baseAsset!.secureStorageUri,
      metadata: baseAsset!.metadata,
      digest: baseDigestBefore,
    };

    // ── 2 · APPROVAL: the frame becomes the reference, owner-scoped ───────
    const sb = createStoryboard(db, { ownerId: OWNER, title: 'عسلُ سِدرٍ — إثباتُ الاتساق' });
    const sceneIds = SCENE_DEMANDS.map((demand, i) => {
      const added = addScene(db, {
        storyboardId: sb.storyboardId, ownerId: OWNER,
        description: `المشهد ${i + 1}`, directionNotes: 'سطرٌ يُقال فوقَ المشهد.',
        sourcing: 'generate', creationDemandAr: demand, order: i + 1,
      });
      if (!added.ok) throw new Error('could not seed a scene');
      return added.scene.sceneId;
    });
    expect(assignSceneAsset(db, sceneIds[0], OWNER, { visualAssetId: base.asset.assetId })).toBe(true);
    // And a stranger cannot: the same call, a different owner.
    expect(assignSceneAsset(db, sceneIds[0], 'someone-else', { visualAssetId: 'x' })).toBe(false);

    // ── 3 · TWO MORE FRAMES, each edited out of the approved one ──────────
    const commissioned = await commissionScenePictures({
      creatorId: OWNER,
      creatorRole: 'founder',
      visualWorldAr: `${WORLD} المنتج: ${PRODUCT}`,
      referenceAssetId: base.asset.assetId,
      demands: [
        { order: 2, sceneId: sceneIds[1], demandAr: SCENE_DEMANDS[1], seenAr: 'المشهد ٢' },
        { order: 3, sceneId: sceneIds[2], demandAr: SCENE_DEMANDS[2], seenAr: 'المشهد ٣' },
      ],
    });
    ledger['commissioned'] = commissioned;

    // Honest about failure: if the engine refused, the reason is the finding.
    const refused = commissioned.filter((c) => c.failure);
    if (refused.length > 0) {
      throw new Error(`the editor refused: ${JSON.stringify(refused)}`);
    }

    // ── 4 · PINNED, exactly as the production route pins ─────────────────
    for (const made of commissioned) {
      expect(assignSceneAsset(db, made.sceneId, OWNER, { visualAssetId: made.assetId! })).toBe(true);
    }

    // ── 5 · WHAT THE EMPIRE NOW HOLDS ────────────────────────────────────
    const frames = listScenes(db, sb.storyboardId, OWNER).map((s) => s.visualAssetId);
    expect(frames).toEqual([base.asset.assetId, commissioned[0].assetId, commissioned[1].assetId]);
    expect(new Set(frames).size).toBe(3);

    const derived = commissioned.map((c) => getVaultAsset(db, c.assetId!)!);
    for (const asset of derived) {
      expect(asset).toBeTruthy();
      // An independent sovereign asset, with its lineage recorded.
      expect(asset.parentAssetId).toBe(base.asset.assetId);
      expect(asset.rootAssetId).toBe(baseAsset!.rootAssetId ?? base.asset.assetId);
      expect(asset.subscriberTenantId).toBe(OWNER);
      expect(asset.secureStorageUri).not.toBe(baseAsset!.secureStorageUri);
      expect(String(asset.secureStorageUri)).not.toMatch(/^https?:/);
    }
    // The reference itself was neither replaced nor rewritten.
    expect(digestOfFile(baseAsset!.secureStorageUri)).toBe(baseDigestBefore);
    expect(getVaultAsset(db, base.asset.assetId)!.secureStorageUri).toBe(baseAsset!.secureStorageUri);

    ledger['derived'] = derived.map((a) => ({
      assetId: a.assetId, uri: a.secureStorageUri, parentAssetId: a.parentAssetId,
      rootAssetId: a.rootAssetId, version: a.version, derivation: a.derivation,
      metadata: a.metadata, digest: digestOfFile(a.secureStorageUri),
    }));
    ledger['sceneLinks'] = listScenes(db, sb.storyboardId, OWNER)
      .map((s) => ({ order: s.order, sceneId: s.sceneId, visualAssetId: s.visualAssetId }));

    // ── 6 · THE PICTURES, KEPT FOR A HUMAN TO LOOK AT ────────────────────
    mkdirSync(EVIDENCE, { recursive: true });
    const keep = (uri: string, name: string) => {
      const from = onDisk(uri);
      if (existsSync(from)) copyFileSync(from, join(EVIDENCE, name));
    };
    keep(baseAsset!.secureStorageUri, `frame-1-reference${extOf(baseAsset!.secureStorageUri)}`);
    keep(derived[0].secureStorageUri, `frame-2-edited${extOf(derived[0].secureStorageUri)}`);
    keep(derived[1].secureStorageUri, `frame-3-edited${extOf(derived[1].secureStorageUri)}`);
  });
});

function extOf(uri: string): string {
  const name = basename(uri);
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '.png' : name.slice(dot);
}
