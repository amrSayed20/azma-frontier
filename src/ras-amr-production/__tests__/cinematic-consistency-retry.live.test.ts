/**
 * AZMA OS — the ONE follow-up question the first live proof raised.
 *
 * ─── WHAT WAS SEEN, AND WHY THIS IS NOT A RANDOM RETRY ──────────────────────
 *
 *   The first live run (2026-10-19) produced three real frames from one
 *   approved reference. Looked at, not merely measured:
 *
 *     frame 1  the product, established
 *     frame 3  the SAME jar, the same label, the same kitchen, a hand
 *              presenting it — identity and world both held
 *     frame 2  the same label and world, and a STRUCTURAL ARTEFACT: the jar
 *              appears duplicated, its lid is gone, and the side angle the
 *              instruction asked for was not taken
 *
 *   So one question is open and it is architectural, not cosmetic: is that
 *   duplication a property of the EDIT ROAD — in which case the road is not
 *   fit for an advertisement — or of that one instruction, which asked for a
 *   spoon to enter a frame that already held a jar?
 *
 *   One edit answers it. The same reference, the same world, the same scene,
 *   and one sentence added that forbids a second jar. If the artefact repeats,
 *   the road has a flaw to report; if it clears, the flaw was in the words.
 *
 *   It also exercises, with real money, what Phase 3 proved only against a
 *   double: remaking ONE frame while every other approved frame is untouched.
 *
 *       AZMA_ALLOW_TEST_NETWORK=1 MAGIC_HOUR_LIVE=1 MAGIC_HOUR_API_KEY=… \
 *       AZMA_LIVE_SCRATCH=<the first run's directory> npx jest consistency-retry
 */

import { mkdirSync, copyFileSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename } from 'node:path';

const scratch = process.env['AZMA_LIVE_SCRATCH'] ?? '';
const LIVE = process.env['MAGIC_HOUR_LIVE'] === '1'
  && typeof process.env['MAGIC_HOUR_API_KEY'] === 'string'
  && process.env['MAGIC_HOUR_API_KEY']!.length > 20
  && scratch.length > 0
  && existsSync(join(scratch, 'live.db'));

if (LIVE) {
  process.env['AZMA_DB_PATH'] = join(scratch, 'live.db');
  process.env['UPLOADS_DIR'] = scratch;
}
const EVIDENCE = process.env['AZMA_LIVE_EVIDENCE_DIR'] ?? join(scratch, 'evidence');

import { getDb } from '../../persistent-storage/db';
import { getVaultAsset } from '../../persistent-storage';
import { assignSceneAsset, listScenes } from '../../persistent-storage/sovereign-project-repository';
import { commissionScenePictures } from '../qiyamah-commission';

const describeLive = LIVE ? describe : describe.skip;
const OWNER = 'creator-live-consistency';

const WORLD = [
  'المكان: طاولةُ خشبٍ داكنٍ في مطبخٍ ريفيٍّ، خلفيّةٌ معتمةٌ غيرُ واضحةِ التفاصيل.',
  'الإضاءة: ضوءٌ ذهبيٌّ دافئٌ من اليسار، ظلالٌ ناعمة.',
  'الأسلوب: تصويرٌ إعلانيٌّ واقعيٌّ عاليُ الوضوح، ألوانٌ دافئة.',
  'المنتج: برطمانُ عسلٍ زجاجيٌّ أسطوانيٌّ بغطاءٍ نحاسيٍّ ذهبيّ،',
  'عليه مُلصَقٌ ورقيٌّ كريميٌّ مستطيلٌ بإطارٍ ذهبيٍّ رقيقٍ وكلمةٍ عربيّةٍ واحدةٍ بخطٍّ بنّيٍّ داكن،',
  'والعسلُ داخلَه كهرمانيٌّ فاتح.',
].join(' ');

/** The same scene, with the one sentence the first attempt lacked. */
const DEMAND = 'أدِر الكاميرا إلى زاويةٍ جانبيّةٍ قريبةٍ من البرطمانِ نفسِه، وأضِف ملعقةَ خشبٍ '
  + 'ترفعُ خيطَ عسلٍ أمامَه. برطمانٌ واحدٌ فقط في الإطار، بغطائِه النحاسيِّ مُغلَقاً، ولا نسخةَ '
  + 'ثانيةً منه ولا مُلصَقَ إضافيّ.';

const onDisk = (uri: string) => (uri.startsWith('/generated-assets/')
  ? join(scratch, 'generated-assets', basename(uri))
  : join(scratch, basename(uri)));
const digestOf = (uri: string) => createHash('sha256').update(readFileSync(onDisk(uri))).digest('hex');

describeLive('LIVE — remaking one frame, and the duplication question', () => {
  jest.setTimeout(15 * 60 * 1000);

  it('remakes scene 2 from the same reference, and leaves every other frame alone', async () => {
    const db = getDb();
    const before = listScenes(db, listStoryboardId(db), OWNER);
    expect(before).toHaveLength(3);

    const referenceAssetId = before[0].visualAssetId!;
    const untouched = {
      reference: { assetId: referenceAssetId, digest: digestOf(getVaultAsset(db, referenceAssetId)!.secureStorageUri) },
      third: { assetId: before[2].visualAssetId!, digest: digestOf(getVaultAsset(db, before[2].visualAssetId!)!.secureStorageUri) },
    };
    const supersededAssetId = before[1].visualAssetId!;

    const commissioned = await commissionScenePictures({
      creatorId: OWNER,
      creatorRole: 'founder',
      visualWorldAr: WORLD,
      referenceAssetId,
      demands: [{ order: 2, sceneId: before[1].sceneId, demandAr: DEMAND, seenAr: 'المشهد ٢' }],
    });

    const refused = commissioned.filter((c) => c.failure);
    if (refused.length > 0) throw new Error(`the editor refused: ${JSON.stringify(refused)}`);
    expect(commissioned).toHaveLength(1);
    expect(commissioned[0].usedReference).toBe(true);

    // Pinned exactly as the route pins, replacing only this scene's frame.
    expect(assignSceneAsset(db, before[1].sceneId, OWNER, { visualAssetId: commissioned[0].assetId! })).toBe(true);

    const after = listScenes(db, listStoryboardId(db), OWNER);
    expect(after[0].visualAssetId).toBe(untouched.reference.assetId);
    expect(after[2].visualAssetId).toBe(untouched.third.assetId);
    expect(after[1].visualAssetId).toBe(commissioned[0].assetId);
    expect(after[1].visualAssetId).not.toBe(supersededAssetId);

    // The approved frames' BYTES are untouched, not merely their ids.
    expect(digestOf(getVaultAsset(db, untouched.reference.assetId)!.secureStorageUri))
      .toBe(untouched.reference.digest);
    expect(digestOf(getVaultAsset(db, untouched.third.assetId)!.secureStorageUri))
      .toBe(untouched.third.digest);

    // The superseded frame is still a sovereign asset of this Creator: nothing
    // is destroyed by a remake, it is simply no longer the scene's picture.
    expect(getVaultAsset(db, supersededAssetId)).toBeTruthy();

    const fresh = getVaultAsset(db, commissioned[0].assetId!)!;
    expect(fresh.parentAssetId).toBe(referenceAssetId);

    mkdirSync(EVIDENCE, { recursive: true });
    copyFileSync(onDisk(fresh.secureStorageUri), join(EVIDENCE, 'frame-2-remade.png'));
    writeFileSync(join(EVIDENCE, 'retry-ledger.json'), JSON.stringify({
      demand: DEMAND,
      remade: {
        assetId: fresh.assetId, uri: fresh.secureStorageUri,
        parentAssetId: fresh.parentAssetId, rootAssetId: fresh.rootAssetId,
        version: fresh.version, metadata: fresh.metadata,
      },
      supersededAssetId,
      untouched,
    }, null, 1));
  });
});

/** The one storyboard this scratch world holds. */
function listStoryboardId(db: ReturnType<typeof getDb>): string {
  const row = db.prepare('SELECT storyboard_id FROM storyboards ORDER BY created_at ASC LIMIT 1')
    .get() as { storyboard_id?: string } | undefined;
  if (!row?.storyboard_id) throw new Error('the first live run left no storyboard in this scratch world');
  return row.storyboard_id;
}
