import { sealSvg } from '../imperial-seal';

/**
 * Two defects, and nothing wider.
 *
 * Until 2026-10-08 the Empire signed itself with 徵 — a CJK character — in
 * every browser tab and in the icon about to be submitted to TikTok. The
 * repair was to stop typesetting the mark at all and draw it from
 * coordinates. Both tests guard that repair, not its appearance.
 */
describe('the imperial seal', () => {
  /**
   * The old mark came back the moment anyone reintroduced a `<text>` element,
   * and a glyph is also a renderer dependency: `ImageResponse` has only the
   * fonts it is handed, so a typeset seal is a seal that can silently fail to
   * one square per letter.
   */
  it('typesets nothing — the mark is drawn, not written', () => {
    expect(sealSvg(512)).not.toMatch(/<text|font-family/);
  });

  /**
   * This is called at 32 as well as 512. The full emblem at a favicon's width
   * is a smudge, so detail is spent by size; a change that gives every size
   * the same drawing undoes that silently, because nobody inspects a 32px PNG.
   */
  it('drops the circuitry at favicon size', () => {
    expect(sealSvg(512)).toContain('stroke-width="0.5"');
    expect(sealSvg(32)).not.toContain('stroke-width="0.5"');
  });
});
