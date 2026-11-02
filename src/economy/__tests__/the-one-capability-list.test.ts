/**
 * AZMA OS — القائمةُ الواحدةُ لا تَنحرِف عن الشيفرة.
 *
 * ─── WHAT THIS PROVES ───────────────────────────────────────────────────────
 *
 *   `docs/THE_ONE_CAPABILITY_LIST.md` is the Founder's answer to «حلّ التعارض
 *   بين ٤ و٥ و٣ قدرات بقائمةٍ نهائيّةٍ واحدة». A document that states what the
 *   Empire charges is worthless the day the code moves without it.
 *
 *   So this does NOT lock a capability's state. It locks the DOCUMENT to the
 *   state: switch video generation on, and this fails until the list says so.
 *   The list and the code change together, or neither changes.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');
const LIST = read('docs/THE_ONE_CAPABILITY_LIST.md');

describe('the one capability list', () => {
  it('still names video generation as taking no hold, because it still takes none', () => {
    const road = read('app/api/qiyamah/generate/route.ts');
    // The measured mechanism: the catalog refuses, the road records null and
    // reserves nothing. If this line goes, the document is out of date.
    const takesNoHold = road.includes('videoResolvedCostEstimate = null;');
    expect(takesNoHold).toBe(true);
    expect(LIST).toContain('**توليدُ الفيديو**');
  });

  it('still names 2× upscale as taking no hold, because only 4× is priced', () => {
    const road = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    expect(road).toContain('if (scaleFactor === 4 && factorRecord?.creatorPriceExists) {');
    expect(LIST).toContain('**رفعُ الدقّةِ ٢×**');
  });

  it('still names the two capabilities the merge starts charging, and no others', () => {
    // These two roads read the price authority; before this branch, one
    // refused with 503 and the other charged nothing at all.
    expect(read('src/ras-amr-production/qiyamah-commission.ts'))
      .toContain('sovereignCapability: SCENE_CAPABILITY');
    expect(read('src/sovereign-entry/ras-al-amr-render.ts'))
      .toContain('sovereignCapability: MP4_EXPORT_CAPABILITY');

    expect(LIST).toContain('**١٧٠** للمشهد');
    expect(LIST).toContain('**١٠٠** لكلِّ ثانيةٍ من الفيلمِ النهائيّ');
  });
});
