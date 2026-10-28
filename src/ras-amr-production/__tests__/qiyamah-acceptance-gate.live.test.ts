/**
 * AZMA OS — بوّابة القبول: «حجرة القيامة — من الفكرة إلى الأصل الإبداعيّ السياديّ»
 *
 * Builds the five-scene demand with the repository's own authority — the same
 * createStoryboard / addScene / setScenePicturePlan the Chamber of Evidence
 * uses — and pins each scene to a picture the Creator already owns: three
 * photographs of the Empire's own screens and two commissioned frames.
 *
 * Every scene is `creator-asset`, so the production that follows buys nothing.
 * The storyboard id is printed for the constitutional produce route to take up.
 *
 *     AZMA_ALLOW_TEST_NETWORK=1 AZMA_DB_PATH=… AZMA_OWNER_ID=… \
 *     npx jest qiyamah-acceptance-gate
 */

import { writeFileSync } from 'node:fs';
import {
  addScene,
  createStoryboard,
  listScenes,
  setScenePicturePlan,
} from '../../persistent-storage/sovereign-project-repository';
import { getDb } from '../../persistent-storage/db';

const OWNER = process.env.AZMA_OWNER_ID;
const live = process.env.AZMA_ALLOW_TEST_NETWORK === '1' && Boolean(OWNER) && Boolean(process.env.AZMA_PROOF_DIR);
const describeLive = live ? describe : describe.skip;
jest.setTimeout(120_000);

/** What each scene shows, what is said over it, and the picture already owned. */
const SCENES = [
  {
    description: 'النيّة الإبداعيّة تتحوّل إلى طلبِ إنشاءٍ واضح داخل حجرة القيامة.',
    directionNotes: 'أهلاً بيك في حجرة القيامة! فكرتك هنا بتبقى طلب واضح.',
    visualSearchEn: 'golden thread weaving into a geometric form in darkness',
    assetId: 'asset_1793051233463_zssae8s',
    origin: 'مولَّدة داخل القيامة',
  },
  {
    description: 'الطلب يصير مشاهدَ وخطّةَ إنتاج في حجرة رأس الأمر.',
    directionNotes: 'وبعدين يتحوّل لمشاهد وخطّة.',
    visualSearchEn: 'production planning screen with scene templates',
    assetId: 'asset_1793073666350_lqbab9d',
    origin: 'لقطةٌ حقيقيّةٌ من شاشة رأس الأمر، مؤطَّرةٌ على محتواها',
  },
  {
    description: 'اختيار المواد: إعادةُ استخدامِ أصلٍ سياديٍّ قائمٍ من الخزانة.',
    directionNotes: 'وموادها نلاقيها في خزانتك أو نصنعها.',
    visualSearchEn: 'sovereign vault holding the creator own assets',
    assetId: 'asset_1793073683020_bd2ed2o',
    origin: 'لقطةٌ حقيقيّةٌ من القصر السياديّ، مؤطَّرةٌ على محتواها',
  },
  {
    description: 'الإنشاء والتركيب: كلُّ أصلٍ يُربَط بمشهده وبتوجيهه.',
    directionNotes: 'وكل أصل يترتبط بمشهده.',
    visualSearchEn: 'creation chamber capabilities panel',
    assetId: 'asset_1793073678636_tl7348f',
    origin: 'لقطةٌ حقيقيّةٌ من حجرة القيامة، مؤطَّرةٌ على محتواها',
  },
  {
    description: 'الناتج السياديّ يُحفَظ أصلًا في خزانة المبدع.',
    directionNotes: 'والناتج يتحفظ في خزانتك.',
    visualSearchEn: 'finished golden artifact inside an opening vault',
    assetId: 'asset_1793051250578_zknrr4v',
    origin: 'مولَّدة داخل القيامة',
  },
] as const;

describeLive('بوّابة القبول — المطالبة الخماسيّة', () => {
  it('writes five scenes, each already holding the picture it will show', () => {
    const db = getDb();
    const board = createStoryboard(db, {
      ownerId: OWNER!,
      title: 'حجرة القيامة: من الفكرة إلى الأصل الإبداعيّ السياديّ',
    });

    const written: { order: number; sceneId: string; assetId: string; origin: string }[] = [];
    SCENES.forEach((s, i) => {
      const added = addScene(db, {
        storyboardId: board.storyboardId,
        ownerId: OWNER!,
        description: s.description,
        directionNotes: s.directionNotes,
        visualSearchEn: s.visualSearchEn,
        order: i + 1,
      });
      expect(added.ok).toBe(true);
      const sceneId = (added as { ok: true; scene: { sceneId: string } }).scene.sceneId;
      // The Creator already owns this picture, so the plan says so and pins it.
      // Nothing on this road may be commissioned, and the route's own rule —
      // only `generate` is ever bought — is what makes that true.
      const planned = setScenePicturePlan(db, sceneId, OWNER!, {
        sourcing: 'creator-asset',
        visualAssetId: s.assetId,
      });
      expect(planned).toBe(true);
      written.push({ order: i + 1, sceneId, assetId: s.assetId, origin: s.origin });
    });

    const back = listScenes(db, board.storyboardId, OWNER!);
    expect(back).toHaveLength(5);
    expect(back.every((s) => s.sourcing === 'creator-asset')).toBe(true);
    expect(back.map((s) => s.visualAssetId)).toEqual(SCENES.map((s) => s.assetId));
    // Five different pictures — no repetition padding the count.
    expect(new Set(back.map((s) => s.visualAssetId)).size).toBe(5);

    writeFileSync(`${process.env.AZMA_PROOF_DIR}/storyboard.json`, JSON.stringify({
      storyboardId: board.storyboardId,
      title: board.title,
      scenes: written.map((w, i) => ({
        ...w,
        description: SCENES[i]!.description,
        said: SCENES[i]!.directionNotes,
        searchEn: SCENES[i]!.visualSearchEn,
        sourcing: back[i]!.sourcing,
      })),
    }, null, 1), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`[acceptance gate] storyboard=${board.storyboardId} · 5 scenes · all creator-asset`);
  });
});
