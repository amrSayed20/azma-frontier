/**
 * No source is silenced by another source's scoring scale.
 *
 * ─── WHAT IS PROVEN HERE, AND WHAT IS NOT ───────────────────────────────────
 *
 *   PROVEN: a source whose scoring scale sits below another's can be shut out
 *   of a shared limit entirely, however relevant its results are. The first
 *   test below constructs exactly that and shows sorting by score alone
 *   returning nothing but one source.
 *
 *   NOT PROVEN, and deliberately not claimed: that this is why a live query for
 *   «ما ورد في فضل الصبر» returned ten verses and no narration. I wrote a
 *   fixture meant to reproduce that and it did not — with the two providers'
 *   real score ranges, narrations do survive a plain sort. The live cause is
 *   still under measurement, and this guard stands on its own merits rather
 *   than on a diagnosis I have not established.
 *
 *   A score orders results honestly *within* a source. Across sources it is not
 *   a common currency, and treating it as one lets the most generous scorer
 *   silence everyone else. That is worth preventing whether or not it is what
 *   happened on Tuesday.
 */

import { selectAcrossSources } from '../core/repository-manager';
import type { RepositorySearchResult } from '../domain/evidence.types';

function results(provider: string, scores: number[]): RepositorySearchResult[] {
  return scores.map((relevanceScore, i) => ({
    id: `${provider}-${i}`,
    provider,
    title: `${provider} ${i}`,
    snippet: 's',
    relevanceScore,
  }));
}

/**
 * The providers' real ranges, measured from their own code: the Qur'an scores
 * 0.80–0.99, the Sunnah 0.50–0.90. With these, a plain sort does NOT shut the
 * Sunnah out — which is why the live absence is not explained by this, and why
 * the test below says so rather than pretending otherwise.
 */
const SCRIPTURE = results('scripture', [0.99, 0.97, 0.95, 0.93, 0.91, 0.89, 0.87, 0.85, 0.83, 0.81]);
const SUNNAH = results('hadith', [0.90, 0.88, 0.86, 0.84, 0.82, 0.80, 0.78, 0.76, 0.74, 0.72]);

/** A source whose scale sits wholly below another's — the case that does shut out. */
const QUIET_SOURCE = results('quiet', [0.49, 0.47, 0.45, 0.43, 0.41]);

describe('two sources sharing a limit', () => {
  const chosen = selectAcrossSources([SCRIPTURE, SUNNAH], 10);

  it('shows that a plain sort silences a source whose scale sits below another’s', () => {
    const byScoreAlone = [...SCRIPTURE, ...QUIET_SOURCE]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
    expect(byScoreAlone.every((r) => r.provider === 'scripture')).toBe(true);
  });

  it('gives that quiet source a place regardless', () => {
    const fair = selectAcrossSources([SCRIPTURE, QUIET_SOURCE], 10);
    expect(fair.filter((r) => r.provider === 'quiet').length).toBeGreaterThan(0);
  });

  it('does not claim the Sunnah was shut out by score alone — with its real range it is not', () => {
    const byScoreAlone = [...SCRIPTURE, ...SUNNAH]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
    expect(byScoreAlone.some((r) => r.provider === 'hadith')).toBe(true);
  });

  it('gives both sources a place', () => {
    expect(chosen.some((r) => r.provider === 'scripture')).toBe(true);
    expect(chosen.some((r) => r.provider === 'hadith')).toBe(true);
  });

  it('shares the limit evenly when both have plenty to offer', () => {
    expect(chosen.filter((r) => r.provider === 'scripture')).toHaveLength(5);
    expect(chosen.filter((r) => r.provider === 'hadith')).toHaveLength(5);
  });

  it('keeps each source’s own best, not its worst', () => {
    const scripture = chosen.filter((r) => r.provider === 'scripture');
    expect(scripture.map((r) => r.relevanceScore)).toEqual([0.99, 0.97, 0.95, 0.93, 0.91]);
  });

  it('still hands the Creator the strongest first', () => {
    const scores = chosen.map((r) => r.relevanceScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('never exceeds the limit', () => {
    expect(chosen).toHaveLength(10);
  });
});

describe('a source with more to offer', () => {
  it('fills what the others leave unused', () => {
    const chosen = selectAcrossSources([SCRIPTURE, results('hadith', [0.9])], 10);
    expect(chosen.filter((r) => r.provider === 'hadith')).toHaveLength(1);
    expect(chosen.filter((r) => r.provider === 'scripture')).toHaveLength(9);
  });

  it('takes the whole limit when it is the only one that answered', () => {
    const chosen = selectAcrossSources([SCRIPTURE, [], []], 10);
    expect(chosen).toHaveLength(10);
    expect(chosen.every((r) => r.provider === 'scripture')).toBe(true);
  });
});

describe('when there is less than the limit', () => {
  it('returns everything without padding', () => {
    const chosen = selectAcrossSources([results('a', [0.9]), results('b', [0.8])], 10);
    expect(chosen).toHaveLength(2);
  });

  it('returns nothing when nothing was found', () => {
    expect(selectAcrossSources([[], []], 10)).toEqual([]);
  });

  it('returns nothing when there is no room', () => {
    expect(selectAcrossSources([SCRIPTURE], 0)).toEqual([]);
  });
});

describe('many sources, one narrow limit', () => {
  it('spends the places on distinct sources before doubling up on any one', () => {
    const chosen = selectAcrossSources(
      [results('a', [0.9, 0.8]), results('b', [0.7, 0.6]), results('c', [0.5, 0.4])],
      3,
    );
    expect(new Set(chosen.map((r) => r.provider)).size).toBe(3);
  });

  it('does not let an empty source consume a place', () => {
    const chosen = selectAcrossSources([results('a', [0.9]), [], results('c', [0.5])], 3);
    expect(chosen.map((r) => r.provider)).toEqual(['a', 'c']);
  });
});
