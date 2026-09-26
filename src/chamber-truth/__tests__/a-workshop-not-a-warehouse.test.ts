/**
 * AZMA OS — القيامة is a chamber of creation, and every act lands where
 * results are shown.
 *
 * Two rulings the Founder gave on 2026-09-26, closing the Chamber.
 *
 * ─── «الأصل الناتج من التحريك لا يُعرض بالأعلى» ─────────────────────────────
 *
 *   An act run from the top produced a real asset and showed it only beside
 *   the card it had started from. The Chamber has ONE place it shows what it
 *   has made, with the next acts offered on it — that is the whole point of
 *   the loop closing. Every act lands there now: generation, edit, animation
 *   and upscale.
 *
 *   The animation started from a GALLERY CARD keeps its own inline result,
 *   because that is where the Creator was looking. `animatingRecordId` is what
 *   tells the two apart, and it is null only when the act was run from above.
 *
 * ─── «لماذا تتجمّع الأصول في القيامة؟ مكانها الطبيعي بعد الاعتماد هو الخزانة»
 *
 *   He is right, and it is what makes the acceptance step mean something. The
 *   floor was called «إرثك السيادي» and held everything ever made, for ever.
 *   A legacy is kept in a vault; a workshop floor holds the work in hand.
 *
 *   The truth used is the asset's own `lifecycleState === 'FINAL'`, read from
 *   the Vault — not a list this page happens to remember, so it survives a
 *   reload and a different device. Nothing is hidden: the floor says how much
 *   went and opens the door to it.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const CLIENT = readFileSync(join(ROOT, 'app/qiyamah-chamber/QiyamahChamberClient.tsx'), 'utf8');

describe('1 · every act lands where results are shown', () => {
  it('an animation run from the top opens the result panel', () => {
    expect(CLIENT).toContain('if (animatingRecordId === null) {');
    const start = CLIENT.indexOf('if (animatingRecordId === null) {');
    const block = CLIENT.slice(start, start + 420);
    expect(block).toContain('setGeneratedAssetUrl(result.asset.secureStorageUri);');
    expect(block).toContain('setGeneratedAssetId(result.asset.assetId);');
    expect(block).toContain("setGeneratedAssetType('video');");
    expect(block).toContain("setStage('result');");
  });

  it('an animation run from a gallery card still answers beside that card', () => {
    // The Creator was looking at the card. Moving them would be a second fault.
    expect(CLIENT).toContain('setAnimatedResult({ forRecordId: animatingRecordId ?? ');
  });

  it('an edit lands there too', () => {
    const start = CLIENT.indexOf('setEditedAssetId(result.asset.assetId);');
    expect(start).toBeGreaterThan(-1);
    const block = CLIENT.slice(start, start + 520);
    expect(block).toContain("setGeneratedAssetType('image');");
    expect(block).toContain("setStage('result');");
  });

  it('and an upscale names what it produced, so the panel renders it', () => {
    const start = CLIENT.indexOf('setUpscaleState(\'ready\');');
    expect(start).toBeGreaterThan(-1);
    expect(CLIENT.slice(Math.max(0, start - 420), start)).toContain("setGeneratedAssetType('image');");
  });
});

describe('2 · a workshop floor, not a warehouse', () => {
  it('what has been accepted leaves the floor', () => {
    expect(CLIENT).toContain('generations.filter((g) => !acceptedUris.includes(g.assetUrl)).map((g) => (');
  });

  it('accepted is the asset own durable state, not a list the page remembers', () => {
    expect(CLIENT).toContain("all.filter((a) => a.lifecycleState === 'FINAL' && a.secureStorageUri)");
    expect(CLIENT).toContain('setAcceptedUris(');
  });

  it('nothing is hidden — the floor says how much went and opens the door', () => {
    expect(CLIENT).toContain('أصلاً اعتمدتَه انتقل إلى خزانتك');
    expect(CLIENT).toContain("goTo('/sovereign-vault-palace')");
  });

  it('the floor is named for what it holds', () => {
    expect(CLIENT).toContain('<h3>تحت يدك</h3>');
    expect(CLIENT).not.toContain('<h3>إرثك السيادي</h3>');
  });
});
