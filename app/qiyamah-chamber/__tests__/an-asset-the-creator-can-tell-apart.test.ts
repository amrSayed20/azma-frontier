/**
 * AZMA OS — THE PICKER SHOWS ASSETS, NOT COPIES OF ONE SENTENCE · 2026-10-13
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   On the deployed release the Creator owned 49 images and 45 clips, and the
 *   picker drew every clip as the same sentence — «مقطعٌ في خزانتك», forty-five
 *   identical rows. Choosing was guessing.
 *
 *   And those rows had a second cost that looked unrelated: as full-width
 *   buttons they pushed the Face Swap acknowledgment card to y=1572 inside an
 *   844px viewport. Nothing clipped it and nothing covered it — it was simply
 *   728px below the fold. «The card is cut off» and «the list is ambiguous»
 *   were one defect wearing two faces.
 */

import {
  assetNameAr, familyOfInput, dropVerdict, assetMetaAr,
} from '../_lib/asset-identity';
import { readFileSync } from 'fs';
import { join } from 'path';

const css = readFileSync(join(process.cwd(), 'app/qiyamah-chamber/qiyamah-chamber.css'), 'utf8');

describe('1 · an asset is named as itself, never as its family', () => {
  it('two clips deposited on different days do not share a name', () => {
    const a = assetNameAr({ derivation: 'UPLOADED', createdAt: Date.UTC(2026, 9, 1) });
    const b = assetNameAr({ derivation: 'UPLOADED', createdAt: Date.UTC(2026, 9, 12) });
    expect(a).not.toEqual(b);
  });

  it('an asset an act produced is named by that act', () => {
    expect(assetNameAr({
      createdAt: Date.UTC(2026, 9, 12),
      metadata: { mutationInstructionAr: 'صورة ناطقة' },
    })).toContain('صورة ناطقة');
  });

  it('and the sentence that caused this defect is not produced for anything', () => {
    for (const probe of [
      { derivation: 'UPLOADED', createdAt: Date.UTC(2026, 9, 12) },
      { derivation: 'GENERATED', createdAt: Date.UTC(2026, 9, 12) },
      { metadata: { mutationInstructionAr: 'إزالة الخلفيّة' }, createdAt: Date.UTC(2026, 9, 12) },
      {},
    ]) {
      expect(assetNameAr(probe)).not.toBe('مقطعٌ في خزانتك');
      expect(assetNameAr(probe)).not.toBe('صورةٌ في خزانتك');
    }
  });

  it('what is shown beside the name is measured, never invented', () => {
    // No duration is claimed for a clip whose length nobody has read yet.
    expect(assetMetaAr({ kind: 'MOTION', pixelWidth: null, pixelHeight: null })).toBe('مقطع');
    expect(assetMetaAr({ kind: 'VISUAL', pixelWidth: 1920, pixelHeight: 1080 })).toContain('1920×1080');
  });
});

describe('2 · each slot takes one family, and the two differ where it matters', () => {
  it('face swap reads a clip into one slot and a face into the other', () => {
    // Its catalog inputs are ['video-asset', 'face-asset']. If both slots
    // resolved to one family, a Creator could put the clip where the face goes.
    expect(familyOfInput('video-asset')).toBe('MOTION');
    expect(familyOfInput('face-asset')).toBe('VISUAL');
    expect(familyOfInput('video-asset')).not.toBe(familyOfInput('face-asset'));
  });

  it('sound is its own family, so it is never offered where a picture belongs', () => {
    expect(familyOfInput('audio-asset')).toBe('AUDIO');
    expect(familyOfInput('asset')).toBe('VISUAL');
  });
});

describe('3 · a drop is judged before anything is selected', () => {
  const payload = (kind: string, assetId = 'asset_1') => JSON.stringify({ assetId, kind });

  it('a matching family is accepted, and names the asset it carried', () => {
    expect(dropVerdict(payload('MOTION'), 'MOTION')).toEqual({ ok: true, assetId: 'asset_1' });
  });

  it('a mismatched family is refused, and the refusal says what went where', () => {
    const v = dropVerdict(payload('VISUAL'), 'MOTION');
    expect(v.ok).toBe(false);
    expect(v.ok === false && v.reasonAr).toContain('صورة');
  });

  it('nothing droppable, or a malformed payload, is refused in silence', () => {
    // Silence, not an error message: the Creator dragged something that was
    // never ours, and telling them off for it would be noise.
    expect(dropVerdict(null, 'MOTION')).toEqual({ ok: false, reasonAr: null });
    expect(dropVerdict('not json', 'MOTION')).toEqual({ ok: false, reasonAr: null });
    expect(dropVerdict(JSON.stringify({ kind: 'MOTION' }), 'MOTION')).toEqual({ ok: false, reasonAr: null });
  });
});

describe('4 · the list is bounded, which is what brings the card back into reach', () => {
  it('the grid cannot grow without limit', () => {
    const grid = css.split('.creative-act-assets {')[1]!.split('}')[0]!;
    expect(grid).toMatch(/max-height:/);
    expect(grid).toMatch(/overflow-y:\s*auto/);
  });

  it('and a preview that fails says so instead of falling back to a label', () => {
    expect(css).toContain('.creative-act-thumb--broken');
  });
});

describe('5 · the same act, twice in one afternoon, still gives two names', () => {
  it('two assets from one act on one day do not collide', () => {
    // MEASURED after the first repair: 29 distinct names across 94 assets,
    // because an act run three times in an afternoon named all three alike.
    const at = (h: number, m: number) => assetNameAr({
      createdAt: Date.UTC(2026, 9, 12, h, m),
      metadata: { mutationInstructionAr: 'تبديل الوجه' },
    });
    expect(at(13, 5)).not.toEqual(at(16, 40));
  });
});
