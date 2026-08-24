/**
 * Qiyamah Style Vocabulary — F and G validation tests
 *
 * F: All 5 AVAILABLE styles are operational and accepted.
 * G: LOCKED styles are blocked from the construction pipeline.
 *
 * Tests operate on the exported constants so the contract between
 * the route and the UI can be verified without HTTP machinery.
 */

import { STYLE_VOCABULARY, LOCKED_STYLES } from '../route';

const AVAILABLE_STYLE_IDS = Object.keys(STYLE_VOCABULARY);

describe('Qiyamah Sovereign Style Registry', () => {

  // ── F: Available styles ───────────────────────────────────────────────────

  it('F: exactly 5 available styles exist in STYLE_VOCABULARY', () => {
    expect(AVAILABLE_STYLE_IDS).toHaveLength(5);
  });

  it('F: cinematic is available and has prefix + suffix', () => {
    expect(AVAILABLE_STYLE_IDS).toContain('cinematic');
    expect(STYLE_VOCABULARY['cinematic'].prefix).toBeTruthy();
    expect(STYLE_VOCABULARY['cinematic'].suffix).toBeTruthy();
  });

  it('F: realistic is available (replaces hyper_real)', () => {
    expect(AVAILABLE_STYLE_IDS).toContain('realistic');
    expect(AVAILABLE_STYLE_IDS).not.toContain('hyper_real');
  });

  it('F: advertising is available', () => {
    expect(AVAILABLE_STYLE_IDS).toContain('advertising');
  });

  it('F: documentary is available', () => {
    expect(AVAILABLE_STYLE_IDS).toContain('documentary');
  });

  it('F: creative is available', () => {
    expect(AVAILABLE_STYLE_IDS).toContain('creative');
  });

  // ── G: Locked styles blocked ──────────────────────────────────────────────

  it('G: scifi is locked — not in STYLE_VOCABULARY, in LOCKED_STYLES', () => {
    expect(AVAILABLE_STYLE_IDS).not.toContain('scifi');
    expect(LOCKED_STYLES.has('scifi')).toBe(true);
  });

  it('G: animation is locked — not in STYLE_VOCABULARY, in LOCKED_STYLES', () => {
    expect(AVAILABLE_STYLE_IDS).not.toContain('animation');
    expect(LOCKED_STYLES.has('animation')).toBe(true);
  });

  it('G: all 8 locked styles are absent from STYLE_VOCABULARY', () => {
    const EXPECTED_LOCKED = ['scifi', 'animation', 'fantasy', 'portrait', 'fashion', 'architecture', 'historical', 'abstract'];
    for (const s of EXPECTED_LOCKED) {
      expect(AVAILABLE_STYLE_IDS).not.toContain(s);
      expect(LOCKED_STYLES.has(s)).toBe(true);
    }
  });

  it('G: LOCKED_STYLES and STYLE_VOCABULARY are disjoint — no style can be both', () => {
    for (const s of AVAILABLE_STYLE_IDS) {
      expect(LOCKED_STYLES.has(s)).toBe(false);
    }
  });
});
