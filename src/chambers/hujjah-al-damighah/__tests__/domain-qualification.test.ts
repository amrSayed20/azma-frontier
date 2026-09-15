/**
 * A source is consulted only where it has business answering.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   The chamber reported its own workings for the first time and the log said:
 *
 *     search returned 10 — {"ministry-human-knowledge":4,
 *                           "ministry-media-intelligence":3,
 *                           "ministry-business-intelligence":3}
 *
 *   Three of ten places in a *religious* question went to a Ministry whose only
 *   sources are the register of contemporary public attention and a forum of
 *   technical discourse. The Ministry holding both the Qur'an and the Sunnah
 *   was left with four places to share between four sources.
 *
 *   The registry had recorded each source's domains since the day it was built.
 *   The chamber simply was not consulting that record.
 *
 * ─── THE REGRESSION THIS ALMOST SHIPPED ─────────────────────────────────────
 *
 *   The Sovereign path — investigations raised by SOEL and Makman rather than
 *   by a Creator typing a question — carries domains of 'observation',
 *   'fulfillment' and 'general'. Those describe *why* an investigation was
 *   raised, not what body of knowledge answers it, and no source declares them.
 *   A filter that treated them like any other domain would have silenced every
 *   source in the Empire and severed a bridge that already works.
 *
 *   So the registry rules only on the domains it models.
 */

import {
  sourceServesDomain,
  governedDomains,
  SOVEREIGN_SOURCES,
} from '../sources/sovereign-source-registry';

describe('the domains the registry governs', () => {
  it('are exactly what its sources declare, never a hand-kept list', () => {
    const declared = new Set(SOVEREIGN_SOURCES.flatMap((s) => s.domains));
    expect(new Set(governedDomains())).toEqual(declared);
  });

  it('cover every domain the Creator can choose in the chamber', () => {
    // KNOWLEDGE_DOMAINS in the chamber's own evidence-utils.
    for (const d of ['religious', 'medical', 'scientific', 'history', 'culture']) {
      expect(governedDomains()).toContain(d);
    }
  });
});

describe('a religious question', () => {
  it('reaches the Qur’an and the Sunnah', () => {
    expect(sourceServesDomain('scripture', 'religious')).toBe(true);
    expect(sourceServesDomain('hadith-collections', 'religious')).toBe(true);
  });

  it('reaches the Arabic encyclopedia, which carries sira and biography', () => {
    expect(sourceServesDomain('arabic-wikipedia', 'religious')).toBe(true);
  });

  it('is never put to the register of contemporary public attention', () => {
    expect(sourceServesDomain('google-trends', 'religious')).toBe(false);
  });

  it('is never put to a forum of technical discourse', () => {
    expect(sourceServesDomain('hacker-news', 'religious')).toBe(false);
  });
});

describe('a medical question', () => {
  it('is never put to trends or technical discourse either', () => {
    expect(sourceServesDomain('google-trends', 'medical')).toBe(false);
    expect(sourceServesDomain('hacker-news', 'medical')).toBe(false);
  });

  it('does not reach the Qur’an, which was not registered to answer it', () => {
    expect(sourceServesDomain('scripture', 'medical')).toBe(false);
  });
});

describe('the Sovereign path', () => {
  it('silences nothing, because its domains are not ones the registry models', () => {
    for (const d of ['observation', 'fulfillment', 'general']) {
      expect(sourceServesDomain('scripture', d)).toBe(true);
      expect(sourceServesDomain('hadith-collections', d)).toBe(true);
      expect(sourceServesDomain('google-trends', d)).toBe(true);
    }
  });

  it('is unaffected when no domain is given at all', () => {
    expect(sourceServesDomain('google-trends', undefined)).toBe(true);
    expect(sourceServesDomain('google-trends', '')).toBe(true);
    expect(sourceServesDomain('google-trends', null)).toBe(true);
  });
});

describe('a source the registry has never heard of', () => {
  it('is allowed through, because that is a gap in the registry and not grounds to silence it', () => {
    expect(sourceServesDomain('some-future-provider', 'religious')).toBe(true);
  });
});

describe('matching is forgiving of how a domain is written', () => {
  it('ignores case and surrounding space', () => {
    expect(sourceServesDomain('scripture', '  Religious  ')).toBe(true);
    expect(sourceServesDomain('google-trends', 'RELIGIOUS')).toBe(false);
  });
});
