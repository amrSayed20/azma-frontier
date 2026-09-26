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
  it('a style grid is offered for image and video alone', () => {
    expect(CLIENT).toContain("{(mediaType === 'image' || mediaType === 'video') && (");
  });

  it('the infographic binds its model instead of re-offering a style', () => {
    expect(CLIENT).toContain("if (mode === 'infographic') setStyle('infographic');");
  });

  it('an edit is not asked for an idea', () => {
    expect(CLIENT).toContain("{mediaType !== 'edit' && (");
  });

  it('the infographic has one door, not two', () => {
    // Offered as an act AND as a brush, a Creator could choose صورة and be
    // handed an infographic — the act disagreeing with the output.
    expect(CLIENT).toContain("ALL_STYLES.filter((s) => s.id !== 'infographic')");
  });
});

describe('4 · no provider name reaches a Creator through these controls', () => {
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
