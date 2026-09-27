/**
 * No provider's name reaches a Creator.
 *
 * ─── THE INCIDENT THIS ENCODES ───────────────────────────────────────────────
 *
 *   The Founder, 2026-09-25, reading his own screen in القيامة: «كما أنه يذكر
 *   أسماء ٢ من مزودي الخدمة وهذا مخالف.»
 *
 *   Measured: every model in both fleets carried the provider's own product
 *   name in `displayName` — «Nano Banana 2», «Seedream 4», «Veo 3.1», «Kling
 *   3.0», «Sora 2», «LTX 2.3», «Z-Image Turbo» — and the chamber's animation
 *   chooser rendered it straight through. The Knowledge Source Abstraction
 *   Principle is not a rule about knowledge alone: the Empire never exposes a
 *   provider to a Creator, in any Chamber, for any capability.
 *
 *   `displayName` stays: an engineer reading a log needs to know which model
 *   ran. It is simply never what a Creator is shown.
 */

import { buildImageCreationIntent, getProductionSelector } from '../index';
import { IMAGE_MODEL_FLEET } from '../image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../video-model-fleet';

/** Names and fragments that identify a provider or its product, not an effect. */
const PROVIDER_WORDS = [
  'nano', 'banana', 'seedream', 'seedance', 'veo', 'kling', 'sora', 'ltx',
  'z-image', 'openai', 'gpt', 'dall', 'magic hour', 'magichour', 'eleven',
  'flux', 'stable', 'midjourney', 'runway', 'pika', 'luma',
];

const EVERY_MODEL = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET];

describe('no provider name reaches a Creator', () => {
  it('every model has a sovereign name and a note, in Arabic', () => {
    for (const m of EVERY_MODEL) {
      expect(m.sovereignNameAr.trim().length).toBeGreaterThan(2);
      expect(m.sovereignNoteAr.trim().length).toBeGreaterThan(8);
      // Arabic, so it can be read by the person it addresses.
      expect(m.sovereignNameAr).toMatch(/[؀-ۿ]/);
      expect(m.sovereignNoteAr).toMatch(/[؀-ۿ]/);
    }
  });

  it('no sovereign name or note carries a provider or product name', () => {
    for (const m of EVERY_MODEL) {
      const shown = `${m.sovereignNameAr} ${m.sovereignNoteAr}`.toLowerCase();
      for (const word of PROVIDER_WORDS) {
        expect(shown).not.toContain(word);
      }
    }
  });

  it('no sovereign name carries Latin letters at all', () => {
    // A Creator is addressed in one tongue. A model named in Latin would be a
    // provider's name whether or not it appears on the list above.
    for (const m of EVERY_MODEL) {
      expect(m.sovereignNameAr).not.toMatch(/[A-Za-z]/);
    }
  });

  it('displayName still names the model, for an engineer reading a log', () => {
    // The opposite guarantee: the technical label must NOT be scrubbed, or a
    // failure in production becomes unattributable.
    for (const m of EVERY_MODEL) {
      expect(m.displayName.trim().length).toBeGreaterThan(1);
    }
  });

  it('two models never share one sovereign name', () => {
    const names = EVERY_MODEL.map((m) => m.sovereignNameAr);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("the Founder's designation of 2026-09-25", () => {
  // «قد اختصصت ثلاثة مزودين فقط من المزود الرئيسي» — one for images and the
  // infographic, two for video and its editing. Ten were authorized before it.
  // A fourth was added the same day, by the Founder's ruling, once the
  // consequence of three was measured: six styles ask for a quality tier
  // above `standard` and the selector refuses rather than downgrade in
  // silence. nano-banana-pro is the same family at `ultra`.
  const DESIGNATED = ['nano-banana-2', 'minimax-h3', 'veo-3-1'];

  it('production routes to those three and to nothing else', () => {
    const authorized = EVERY_MODEL.filter((m) => m.productionAuthorized).map((m) => m.modelId);
    expect(authorized.sort()).toEqual([...DESIGNATED].sort());
  });

  it('the withdrawn models are kept, not deleted', () => {
    // Their verified capabilities, their costs and their limits are the
    // Empire's record. A designation that changes should change a flag.
    expect(EVERY_MODEL.length).toBeGreaterThanOrEqual(10);
  });

  it('the infographic still requires the model designated for it', () => {
    const infographic = IMAGE_MODEL_FLEET.find((m) => m.supportedStyleIds?.includes('infographic'));
    expect(infographic?.modelId).toBe('nano-banana-2');
    expect(infographic?.productionAuthorized).toBe(true);
  });
});

describe('every style the Chamber offers can still be produced', () => {
  // MEASURED 2026-09-25 the moment the designation took effect: a cinematic
  // intent returned `quality-unavailable` — six styles ask for a tier above
  // `standard` and the selector refuses rather than downgrade a Creator's
  // work in silence. That refusal is right; offering fourteen styles and
  // serving eight is not.
  const STYLES = ['cinematic', 'realistic', 'advertising', 'documentary', 'creative',
    'scifi', 'animation', 'fantasy', 'portrait', 'fashion', 'architecture',
    'historical', 'abstract', 'infographic'];

  it('no style the Chamber offers is refused', () => {
    for (const style of STYLES) {
      const r = getProductionSelector().select(buildImageCreationIntent('اختبار', style));
      expect({ style, selected: r.selected }).toEqual({ style, selected: true });
    }
  });

  it('the infographic goes to the model that is required for it, and no other', () => {
    const r = getProductionSelector().select(buildImageCreationIntent('اختبار', 'infographic'));
    expect(r.selected && r.selection.modelId).toBe('nano-banana-2');
  });
});
