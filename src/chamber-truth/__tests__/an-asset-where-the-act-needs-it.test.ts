/**
 * AZMA OS — القيامة: getting an asset INTO the act that needs one.
 *
 * The Founder, 2026-09-26: «لا يمكن رفع أصل من الجهاز او حتى صورة من الخزينة
 * للتعديل عليه او تحريكه — خاصية السحب والافلات لا تؤتي بنتيجة».
 *
 * ─── WHAT WAS MEASURED, AGAINST THE LIVE RELEASE ────────────────────────────
 *
 *   The mechanism was NOT broken. Click-to-choose uploaded a real file and the
 *   zone reported success. A synthetic drop fired with defaultPrevented=true
 *   and reached the server, which refused only because the probe file was four
 *   fake bytes. Selecting a Vault image inside the act worked too: the tile
 *   took the selected class and the run button enabled.
 *
 *   What was broken was WHERE. The Empire's only upload door sat at y=1340,
 *   below a 1200px viewport, in a section at the foot of the page — while the
 *   act needing an asset stands at the top, with no door of its own. A browser
 *   does not scroll the page for someone holding a file, so there was nothing
 *   under the cursor to drop onto. «لا تؤتي بنتيجة» was exact.
 *
 *   And a third fault, mine, that he did not name: `editableAssets`
 *   concatenated 31 pickable generations with 35 Vault images of which 28 were
 *   THE SAME ASSET — so each of those appeared twice, the second copy labelled
 *   «أصلٌ رفعته» to a Creator who had uploaded nothing.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const CLIENT = readFileSync(join(ROOT, 'app/qiyamah-chamber/QiyamahChamberClient.tsx'), 'utf8');
const CSS = readFileSync(join(ROOT, 'app/qiyamah-chamber/qiyamah-chamber.css'), 'utf8');

describe('1 · one asset, one tile', () => {
  it('the picker is keyed by asset id, not built by concatenation', () => {
    expect(CLIENT).toContain('const byId = new Map<string, { assetId: string; url: string; label: string }>();');
    expect(CLIENT).toContain('if (u.capabilityTarget !== \'VISUAL\' || byId.has(u.assetId)) continue;');
  });

  it('a generation keeps its own words rather than being called an upload', () => {
    // The generation loop runs first and the Vault loop skips ids it already
    // holds, so «أصلٌ رفعته» can only reach an asset the Chamber did not make.
    const start = CLIENT.indexOf('const editableAssets = (() => {');
    const block = CLIENT.slice(start, CLIENT.indexOf('})();', start));
    expect(block.indexOf('label: g.originalIdea')).toBeLessThan(block.indexOf("label: 'أصلٌ رفعته'"));
  });
});

describe('2 · the act carries its own door', () => {
  it('one door serves both acts and both their states', () => {
    // edit-with-assets, edit-empty, video-with-assets, video-empty
    expect((CLIENT.match(/<AssetDoor onReceived=/g) ?? []).length).toBe(4);
  });

  it('it hands the act what it just received', () => {
    expect(CLIENT).toContain('<AssetDoor onReceived={setEditingAssetId} />');
    expect(CLIENT).toContain('<AssetDoor onReceived={setAnimateAssetId} />');
    expect(CLIENT).toContain('const assetId = await uploadFile(file);');
    expect(CLIENT).toContain('if (assetId) onReceived(assetId);');
  });

  it('an empty picker offers the door instead of being a dead end', () => {
    expect(CLIENT).toContain('لا أصولَ لديك بعد — ارفع صورةً من جهازك، أو أنشئ واحدةً ثمّ عُد.');
    expect(CLIENT).toContain('لا صورَ لديك بعد — ارفع واحدةً من جهازك، أو أنشئ صورةً ثمّ عُد.');
  });

  it('it takes a drop as well as a click, and stops the browser opening the file', () => {
    const start = CLIENT.indexOf('const AssetDoor =');
    const door = CLIENT.slice(start, start + 2200);
    expect(door).toContain('onDragOver={(e) => { e.preventDefault();');
    expect(door).toContain('onDrop={(e) => { e.preventDefault();');
    expect(door).toContain('e.dataTransfer.files[0]');
    expect(door).toContain("onKeyDown={(e) => e.key === 'Enter'");
  });

  it('it is one upload, not a second implementation', () => {
    const start = CLIENT.indexOf('const AssetDoor =');
    const door = CLIENT.slice(start, start + 2200);
    expect(door).not.toContain('FormData');
    expect(door).not.toContain('/api/vault/assets/upload');
  });

  it('it paints its own surface, like every control in this chamber', () => {
    const rule = CSS.slice(CSS.indexOf('.asset-door {'), CSS.indexOf('}', CSS.indexOf('.asset-door {')));
    expect(rule).toMatch(/background\s*:/);
    expect(rule).toMatch(/color\s*:/);
  });
});

describe('3 · upload still answers the caller that has no act to fill', () => {
  it('it returns the new id and null on refusal', () => {
    expect(CLIENT).toContain('const uploadFile = async (file: File): Promise<string | null> => {');
    expect(CLIENT).toContain('return newItem.assetId || null;');
  });
});

describe('4 · an old demand does not greet the next one', () => {
  /**
   * The Founder, 2026-09-26: «المطالبة القديمة تظل موجودة بحقل النص بعد
   * الخروج من الحجرة والعودة إليها». Walking his exact path on the live
   * release — exit by the door, the Foyer, the القيامة card — and the back
   * button, in a fresh context, every field came back empty and nothing was
   * in either storage. It does not reproduce there.
   *
   * The mechanism that produces exactly what he describes is the browser's
   * own form restoration: session restore and bfcache write the previous text
   * back into the <textarea> AFTER load, and React never overwrites it —
   * a controlled input whose value has not changed is not re-rendered. The
   * Creator reads an old demand while the Chamber believes the field is
   * empty, which is why the build button sits disabled in front of text.
   */
  it('the chamber makes the DOM agree with its state on entry', () => {
    expect(CLIENT).toContain("document.querySelectorAll<HTMLTextAreaElement>('.genesis-section textarea')");
    expect(CLIENT).toContain("if (field.value !== '') field.value = '';");
  });

  it('and again when a restore lands after mount', () => {
    expect(CLIENT).toContain("const onShow = (e: PageTransitionEvent) => { if (e.persisted) clearRestored(); };");
    expect(CLIENT).toContain("window.addEventListener('pageshow', onShow);");
    expect(CLIENT).toContain("return () => window.removeEventListener('pageshow', onShow);");
  });

  it('the browser is asked first, not only corrected afterwards', () => {
    expect((CLIENT.match(/autoComplete="off"/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
});
