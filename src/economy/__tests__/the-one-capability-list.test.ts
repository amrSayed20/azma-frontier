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
const ROWS = /\r?\n/;
const LIST = read('docs/THE_ONE_CAPABILITY_LIST.md');

describe('the one capability list', () => {
  /*  ── THIS GUARD DID ITS JOB ON 2026-11-03 ──────────────────────────────
   *
   *    It existed to make the document and the code move together, and both
   *    of its cases failed the moment the Founder activated the two charges.
   *    That failure is the guard working: the list said «not charged» while
   *    the code had begun charging, and the diff could not be green until
   *    the document was corrected too.
   *
   *    The cases now hold the NEW state, and they fail just as loudly if
   *    either charge is ever switched back off without the list saying so.
   */
  it('names video generation as charged per requested second, because it is', () => {
    const road = read('app/api/qiyamah/generate/route.ts');
    expect(road).toContain("sovereignPriceFor('VIDEO_GENERATION')");
    expect(road).not.toContain('videoResolvedCostEstimate = null;');
    // The table's own row: the capability, then its price, then its unit.
    // Asserted as the row rather than as a phrase, because the cells are
    // separated by pipes and a phrase match would be an accident.
    const videoRow = LIST.split(ROWS).find((l) => l.includes('**توليدُ فيديو**'))!;
    expect(videoRow).toContain('**٢٠٠**');
    expect(videoRow).toContain('**للثانيةِ المطلوبة**');
  });

  it('names 2× upscale as charged per operation, because it is', () => {
    const road = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    expect(road).toContain("sovereignPriceFor('UPSCALE_2X')");
    expect(road).not.toContain('if (scaleFactor === 4 && factorRecord?.creatorPriceExists) {');
    const upscaleRow = LIST.split(ROWS).find((l) => l.includes('**رفعُ الدقّةِ ٢×**'))!;
    expect(upscaleRow).toContain('**٥٠**');
    expect(upscaleRow).toContain('**للعمليّة**');
  });

  it('names the voice identity as free and speech as charged by the character', () => {
    expect(read('app/api/vault/assets/clone-voice/route.ts'))
      .toContain('sovereignCapability: VOICE_IDENTITY_CAPABILITY');
    expect(read('app/api/vault/assets/generate-speech/route.ts'))
      .toContain('sovereignCapability: SPEECH_CAPABILITY');
    const identityRow = LIST.split(ROWS).find((l) => l.includes('**إنشاءُ هويّةٍ صوتيّةٍ سياديّة**'))!;
    expect(identityRow).toContain('**٠ — مجّانًا**');
    const speechRow = LIST.split(ROWS).find((l) => l.includes('**توليدُ النطق**'))!;
    expect(speechRow).toContain('**٠.١٢٨٩٢**');
    expect(speechRow).toContain('**لكلِّ حرف**');
  });

  it('still names the two capabilities the merge starts charging, and no others', () => {
    // These two roads read the price authority; before this branch, one
    // refused with 503 and the other charged nothing at all.
    expect(read('src/ras-amr-production/qiyamah-commission.ts'))
      .toContain('sovereignCapability: SCENE_CAPABILITY');
    expect(read('src/sovereign-entry/ras-al-amr-render.ts'))
      .toContain('sovereignCapability: MP4_EXPORT_CAPABILITY');

    const sceneRow = LIST.split(ROWS).find((l) => l.includes('**مشهدٌ في رأسِ الأمر**'))!;
    expect(sceneRow).toContain('**١٧٠**');
    expect(sceneRow).toContain('للمشهد');
    const exportRow = LIST.split(ROWS).find((l) => l.includes('**إخراجُ MP4**'))!;
    expect(exportRow).toContain('**١٠٠**');
    expect(exportRow).toContain('**لكلِّ ثانيةٍ نهائيّة**');
  });
});
