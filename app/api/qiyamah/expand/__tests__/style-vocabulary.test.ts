/**
 * Qiyamah Style Vocabulary — validation tests
 *
 * All 13 styles are now fully operational. No LOCKED_STYLES set exists.
 * Tests verify: every expected style is present, each has a non-empty
 * prefix and suffix, and the total count is exactly 13.
 */

import { STYLE_VOCABULARY } from '../route';

const STYLE_IDS = Object.keys(STYLE_VOCABULARY);

const EXPECTED_STYLES = [
  'cinematic', 'realistic', 'advertising', 'documentary', 'creative',
  'scifi', 'animation', 'fantasy', 'portrait', 'fashion',
  'architecture', 'historical', 'abstract',
];

describe('Qiyamah Sovereign Style Registry', () => {

  it('exactly 13 styles exist in STYLE_VOCABULARY', () => {
    expect(STYLE_IDS).toHaveLength(13);
  });

  it('all expected style IDs are present', () => {
    for (const id of EXPECTED_STYLES) {
      expect(STYLE_IDS).toContain(id);
    }
  });

  it.each(EXPECTED_STYLES)('%s has a non-empty prefix and suffix', (styleId) => {
    const entry = STYLE_VOCABULARY[styleId];
    expect(entry).toBeDefined();
    expect(entry.prefix.trim()).toBeTruthy();
    expect(entry.suffix.trim()).toBeTruthy();
  });

  it('cinematic has 35mm in the prefix (canonical sovereign style)', () => {
    expect(STYLE_VOCABULARY['cinematic'].prefix).toContain('35mm');
  });

  it('realistic has 8K in the prefix', () => {
    expect(STYLE_VOCABULARY['realistic'].prefix).toContain('8K');
  });

  it('no LOCKED_STYLES export — all styles are operational', () => {
    // If LOCKED_STYLES were accidentally re-introduced, importing it would fail.
    // The named import below will be undefined if the export does not exist,
    // which is the correct state: there are no locked styles.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routeModule = require('../route') as Record<string, unknown>;
    expect(routeModule['LOCKED_STYLES']).toBeUndefined();
  });

  it('STYLE_VOCABULARY and expected list are in sync — no extra or missing styles', () => {
    expect(new Set(STYLE_IDS)).toEqual(new Set(EXPECTED_STYLES));
  });
});
