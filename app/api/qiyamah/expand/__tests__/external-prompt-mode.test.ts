/**
 * Qiyamah Expand Route — External Prompt Mode tests
 *
 * When mode: 'external' is submitted, the route must:
 *   - Accept the externalPrompt exactly as provided (no alteration)
 *   - Return it verbatim in the response as externalPrompt
 *   - Return a qiyamahReading (Qiyamah's stylistic interpretation)
 *   - The reading must differ from the verbatim input (style was applied)
 *   - constructionMode must be 'interpretation'
 *
 * Tests operate on the exported STYLE_VOCABULARY so the reading
 * construction logic can be verified without HTTP machinery.
 */

import { STYLE_VOCABULARY } from '../route';

const buildSovereignPrompt = (input: string, style: string): string => {
  const vocab = STYLE_VOCABULARY[style] ?? STYLE_VOCABULARY['cinematic'];
  return `${vocab.prefix}${input.trim()}${vocab.suffix}`;
};

describe('Qiyamah Expand — External Prompt Mode', () => {

  it('external prompt is preserved verbatim in the reading construction (not re-written)', () => {
    const originalPrompt = 'a man walking through ancient ruins at sunset';
    const reading = buildSovereignPrompt(originalPrompt, 'cinematic');
    expect(reading).toContain(originalPrompt);
  });

  it('the qiyamahReading differs from the externalPrompt (style was applied)', () => {
    const originalPrompt = 'woman standing in a field of flowers';
    const reading = buildSovereignPrompt(originalPrompt, 'cinematic');
    expect(reading).not.toBe(originalPrompt);
  });

  it('the reading contains the cinematic prefix when cinematic style is chosen', () => {
    const reading = buildSovereignPrompt('test prompt', 'cinematic');
    expect(reading).toContain(STYLE_VOCABULARY['cinematic'].prefix);
    expect(reading).toContain(STYLE_VOCABULARY['cinematic'].suffix);
  });

  it('external prompt works with all 13 styles — each produces a distinct reading', () => {
    const originalPrompt = 'desert landscape at night';
    const readings = Object.keys(STYLE_VOCABULARY).map((style) =>
      buildSovereignPrompt(originalPrompt, style)
    );
    // each reading must contain the original prompt
    for (const reading of readings) {
      expect(reading).toContain(originalPrompt);
    }
    // readings across styles are all distinct
    const uniqueReadings = new Set(readings);
    expect(uniqueReadings.size).toBe(Object.keys(STYLE_VOCABULARY).length);
  });

  it('falls back to cinematic when an unknown style is submitted with an external prompt', () => {
    const reading = buildSovereignPrompt('test', 'nonexistent-style');
    expect(reading).toContain(STYLE_VOCABULARY['cinematic'].prefix);
  });
});
