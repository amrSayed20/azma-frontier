/**
 * AZMA OS — القيامة: the four acts of creation, where an act is chosen.
 *
 * The Founder, 2026-09-26, having found ✎ تعديل and إنفوغرافيك only at the
 * bottom of the gallery or buried among fourteen styles: «اريد حقل اختيار
 * مثل بطاقة صورة وفيديو وتعديل وانفوجرافيك — لا بالأسفل.»
 *
 * An act is chosen FIRST, because the act decides what is offered after it:
 * an edit has no style to pick, and an infographic BINDS one designated model
 * (STYLE_REQUIRED_MODEL_MAP — the selector refuses rather than substitutes).
 * These tests hold the order, the four acts, and the rule that no provider
 * name travels to a Creator through the act's controls.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');
const PAGE = read('app/qiyamah-chamber/page.tsx');

const at = (needle: string, haystack = CLIENT) => {
  const i = haystack.indexOf(needle);
  expect(i).toBeGreaterThan(-1);
  return i;
};

describe('1 · four acts, not two', () => {
  it('offers image, video, infographic and edit as acts', () => {
    const start = at('<div className="media-type-toggle"');
    const toggle = CLIENT.slice(start, start + 1400);
    for (const act of ['image', 'video', 'infographic', 'edit']) {
      expect(toggle).toContain(`'${act}',`);
    }
  });

  it('the act state admits exactly those four', () => {
    expect(CLIENT).toContain("useState<'image' | 'video' | 'edit' | 'infographic'>");
  });
});

describe('2 · the act is chosen before what depends on it', () => {
  it('the act selector precedes the style registry', () => {
    expect(at('<div className="media-type-toggle"')).toBeLessThan(at('<StyleRegistry '));
  });

  it('the act selector precedes the edit panel it opens', () => {
    expect(at('<div className="media-type-toggle"')).toBeLessThan(at('<div className="edit-act"'));
  });

  it('the act selector sits at the head of the construction panel, not its foot', () => {
    const form = at('<div className="genesis-form">');
    const toggle = at('<div className="media-type-toggle"');
    const tabs = at('<div className="mode-tab-switcher"');
    expect(toggle).toBeGreaterThan(form);
    expect(toggle).toBeLessThan(tabs);
  });
});

describe('3 · each act is offered only what it can use', () => {
  it('a style grid is offered only where a style is chosen', () => {
    // A clip made FROM an owned still takes its look from that still, so the
    // grid narrowed with the video act's two sources (2026-09-26).
    expect(CLIENT).toContain("{(mediaType === 'image' || (mediaType === 'video' && videoSource === 'idea')) && (");
  });

  it('the infographic binds its model instead of re-offering a style', () => {
    expect(CLIENT).toContain("if (mode === 'infographic') setStyle('infographic');");
  });

  it('an act that works on an owned asset is not asked for an idea', () => {
    // This read `mediaType !== 'edit'` until animation moved into the video
    // act. Two acts now begin from something the Creator already owns, so the
    // rule is named once and every control reads the name — a literal repeated
    // at four call sites is how the fourth gets forgotten.
    expect(CLIENT).toContain("const actsOnOwnAsset = mediaType === 'edit' || (mediaType === 'video' && videoSource === 'asset');");
    expect(CLIENT).toContain('{!actsOnOwnAsset && (');
    expect(CLIENT).toContain('{!actsOnOwnAsset && shapesForAct.length > 1 && (');
    expect(CLIENT).toContain(') : actsOnOwnAsset ? null : (');
  });

  it('animation is offered inside the video act, not as a fifth box', () => {
    // The Founder named four acts; animating a still IS making a clip from an
    // asset you own. He said twice it was «موجود ولكنه غير ظاهر».
    expect(CLIENT).toContain("['asset', 'من أصلٍ تملكه'");
    expect(CLIENT).toContain("{mediaType === 'video' && videoSource === 'asset' && (");
    const acts = CLIENT.slice(at('<div className="media-type-toggle"'), at('<div className="media-type-toggle"') + 1400);
    expect(acts).not.toContain("'animate'");
  });

  it('the infographic has one door, not two', () => {
    // Offered as an act AND as a brush, a Creator could choose صورة and be
    // handed an infographic — the act disagreeing with the output.
    expect(CLIENT).toContain("ALL_STYLES.filter((s) => s.id !== 'infographic')");
  });
});

describe('4 · a picture has a shape too', () => {
  it('the shapes offered follow the act, not the video fleet alone', () => {
    // MEASURED 2026-09-26: the chooser read the VIDEO fleet, so it appeared for
    // a clip and never for a picture — while the whole chain behind it (route →
    // generation service → adapter aspect_ratio) already carried the value and
    // the designated image model is VERIFIED to accept all three shapes.
    expect(CLIENT).toContain("const shapesForAct = mediaType === 'video' ? aspectOptions : imageAspectOptions;");
    expect(CLIENT).toContain('{!actsOnOwnAsset && shapesForAct.length > 1 && (');
  });

  it('the image shapes are derived from the image fleet, never written by hand', () => {
    expect(PAGE).toContain('IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active)');
    expect(PAGE).toContain('const imageAspectOptions = shapesEveryModelAccepts(');
  });

  it('the chosen shape is sent for every act that offers one', () => {
    expect(CLIENT).toContain("if (shapesForAct.includes(aspectRatio)) {");
  });
});

describe('5 · no provider name reaches a Creator through these controls', () => {
  it('the animation models carry a sovereign name, not a product name', () => {
    expect(PAGE).toContain('nameAr: m.sovereignNameAr,');
    expect(CLIENT).not.toContain('animationModels[0].displayName');
    expect(CLIENT).not.toMatch(/animationModels[\s\S]{0,400}?\.displayName/);
  });

  it('no act label carries a Latin provider word', () => {
    const start = at('<div className="media-type-toggle"');
    const toggle = CLIENT.slice(start, start + 1400);
    for (const word of ['nano', 'banana', 'veo', 'seedance', 'openai', 'gemini', 'magic']) {
      expect(toggle.toLowerCase()).not.toContain(word);
    }
  });
});
