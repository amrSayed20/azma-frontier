/**
 * What the Creator is actually shown.
 *
 * The live contradiction these guard against: a Qur'anic verse displayed as the
 * leading evidence while the same verdict document said «الثقة ضعيفة — الأدلة
 * متعارضة أو لم تُوثَّق بما يكفي لحكم قاطع». One number — the mean keyword
 * overlap between the question's wording and the retrieved passages — was
 * speaking in the name of four different claims.
 */

import type { InvestigationDTO, EvidenceItemDTO } from '../actions';
import {
  SourceAuthority,
  bucketEvidence,
  resolveKnowledgeLayer,
  generateVerdictExplanation,
  scriptureEvidence,
  topAuthority,
  isScriptureItem,
  authorityOf,
  relevanceOf,
  getConstitutionalTier,
  countScripture,
  evidenceForTaking,
} from '../_lib/evidence-utils';
import { EvidenceRelevance } from '@/src/chambers/hujjah-al-damighah/domain/evidence-authority';

function item(over: Partial<EvidenceItemDTO> = {}): EvidenceItemDTO {
  return {
    id: 'e1',
    extractedText: 'نص',
    contextWindow: 'نص',
    confidenceScore: 0.5,
    confidenceLevel: 'MODERATE',
    sourceAuthority: SourceAuthority.DOCUMENTED,
    ...over,
  };
}

/** A verse that matched on a weak keyword overlap — the exact live case. */
const weakMatchVerse = item({
  id: 'verse',
  extractedText: '﴿وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ﴾ — سورة البقرة، الآية 45.',
  confidenceScore: 0.12,
  confidenceLevel: 'LOW',
  sourceAuthority: SourceAuthority.SCRIPTURE,
});

const englishEntry = item({
  id: 'media',
  extractedText: 'Media Topic: Seven Sleepers. A Christian and Muslim story.',
  confidenceScore: 0.31,
  confidenceLevel: 'LOW',
  sourceAuthority: SourceAuthority.DOCUMENTED,
});

function dtoOf(...evidence: EvidenceItemDTO[]): InvestigationDTO {
  const scores = evidence.map((e) => e.confidenceScore);
  return {
    success: true,
    evidence,
    totalSourcesScanned: evidence.length,
    averageEvidenceScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
  };
}

describe('a verse is displayed as a verse', () => {
  it('is labelled as Qur’anic text however weakly it matched the wording', () => {
    expect(resolveKnowledgeLayer(weakMatchVerse, 'religious').labelAr).toBe('نص قرآني');
  });

  it('is not labelled «مصدر مجهول», which is what its score alone would have earned', () => {
    // The same text and score with nothing to place it by. A documented source
    // is protected from this label too, so the counterfactual has to be a text
    // the chamber genuinely cannot place.
    const asIfUnplaceable = item({ ...weakMatchVerse, sourceAuthority: 'UNATTRIBUTED' });
    expect(resolveKnowledgeLayer(asIfUnplaceable, 'religious').labelAr).toBe('مصدر مجهول');
    expect(resolveKnowledgeLayer(weakMatchVerse, 'religious').labelAr).not.toBe('مصدر مجهول');
  });

  it('sits at the highest constitutional tier', () => {
    expect(getConstitutionalTier(resolveKnowledgeLayer(weakMatchVerse, 'religious').tier)).toBe(1);
  });

  it('keeps its Arabic text as the evidence itself', () => {
    expect(weakMatchVerse.extractedText).toContain('﴿');
    expect(scriptureEvidence(dtoOf(weakMatchVerse, englishEntry))[0]!.extractedText)
      .toContain('وَٱلصَّلَوٰةِ');
  });
});

describe('the verse is never sorted into «متعارض» or «غير محقَّق»', () => {
  const buckets = bucketEvidence(dtoOf(weakMatchVerse, englishEntry));

  it('stands among the supported evidence', () => {
    expect(buckets.supported.map((e) => e.id)).toContain('verse');
  });

  it('is absent from every bucket that feeds a word of doubt', () => {
    for (const bucket of [buckets.disputed, buckets.unverified, buckets.narratives]) {
      expect(bucket.map((e) => e.id)).not.toContain('verse');
    }
  });

  it('does not drag an ordinary weak source up with it', () => {
    expect(buckets.supported.map((e) => e.id)).not.toContain('media');
    expect(buckets.unverified.map((e) => e.id)).toContain('media');
  });
});

describe('standing, bearing and interpretation are said separately', () => {
  const explanation = generateVerdictExplanation(dtoOf(weakMatchVerse, englishEntry), 'religious');

  it('states the standing of the source', () => {
    expect(explanation).toContain('حجّية المصدر');
    expect(explanation).toContain('قطعي الثبوت');
  });

  it('counts scripture the way Arabic counts', () => {
    // The live page read «8 نص قرآني». The Creator reads this.
    expect(countScripture(1)).toBe('نص قرآني واحد');
    expect(countScripture(2)).toBe('نصان قرآنيان');
    expect(countScripture(8)).toBe('8 نصوص قرآنية');
    expect(countScripture(11)).toBe('11 نصاً قرآنياً');
    expect(explanation).toContain('نص قرآني واحد');
  });

  it('states the bearing on the question as its own measurement', () => {
    expect(explanation).toContain('صلة النص بالسؤال');
  });

  it('never calls the source weak when the weakness is in the bearing', () => {
    expect(explanation).toContain('مطابقة الأدلة للسؤال ضعيفة');
    expect(explanation).toContain('لا حكم على حجّيتها');
    expect(explanation).not.toContain('الثقة ضعيفة');
  });

  it('declines to interpret, in the Founder’s own terms', () => {
    expect(explanation).toContain('لا تُفتي');
  });

  it('says none of that for a question with no scripture in it', () => {
    const ordinary = generateVerdictExplanation(dtoOf(englishEntry), 'scientific');
    expect(ordinary).not.toContain('حجّية المصدر');
    expect(ordinary).not.toContain('لا تُفتي');
    expect(ordinary).toContain('مطابقة الأدلة للسؤال');
  });
});

describe('the standing reported for the investigation as a whole', () => {
  it('is decisive when a verse is present, whatever else was gathered', () => {
    expect(topAuthority(dtoOf(englishEntry, weakMatchVerse))).toBe(SourceAuthority.SCRIPTURE);
  });

  it('is documented when only catalogues answered', () => {
    expect(topAuthority(dtoOf(englishEntry))).toBe(SourceAuthority.DOCUMENTED);
  });

  it('is unattributed when nothing can be named', () => {
    expect(topAuthority(dtoOf(item({ sourceAuthority: 'SOMETHING_ELSE' })))).toBe(
      SourceAuthority.UNATTRIBUTED,
    );
  });

  it('does not let a forged authority string promote an ordinary source', () => {
    // The DTO crosses a server boundary as plain strings; it is read back
    // through the policy rather than trusted as one.
    expect(authorityOf(item({ sourceAuthority: 'scripture' }))).toBe(SourceAuthority.UNATTRIBUTED);
    expect(isScriptureItem(item({ sourceAuthority: 'Scripture ' }))).toBe(false);
  });
});

describe('mixed evidence does not corrupt the classification', () => {
  const mixed = dtoOf(englishEntry, weakMatchVerse, item({ id: 'x', confidenceScore: 0.9, confidenceLevel: 'HIGH' }));

  it('finds exactly the one verse', () => {
    expect(scriptureEvidence(mixed)).toHaveLength(1);
    expect(scriptureEvidence(mixed)[0]!.id).toBe('verse');
  });

  it('leaves the ordinary sources ordinary', () => {
    expect(authorityOf(englishEntry)).toBe(SourceAuthority.DOCUMENTED);
    expect(resolveKnowledgeLayer(englishEntry, 'religious').labelAr).not.toBe('نص قرآني');
  });

  it('keeps the strongest-bearing verse first when several are present', () => {
    const second = item({ id: 'verse2', confidenceScore: 0.8, sourceAuthority: SourceAuthority.SCRIPTURE });
    expect(scriptureEvidence(dtoOf(weakMatchVerse, second))[0]!.id).toBe('verse2');
  });
});

describe('the proof the Creator carries out', () => {
  const taken = evidenceForTaking(weakMatchVerse, 'ما هو فضل الصبر', 'religious');

  it('carries the text itself', () => {
    expect(taken).toContain('وَٱلصَّلَوٰةِ');
    expect(taken).toContain('سورة البقرة، الآية 45');
  });

  it('carries its standing, so it cannot be quoted as more than it is', () => {
    expect(taken).toContain('حجّية المصدر: القرآن الكريم — قطعي الثبوت');
  });

  it('carries how closely it bears on the question, separately', () => {
    expect(taken).toContain('صلة النص بالسؤال: صلة بعيدة بالسؤال');
  });

  it('carries the question it was found for', () => {
    expect(taken).toContain('الموضوع: ما هو فضل الصبر');
  });

  it('carries the refusal to interpret, when the source is scripture', () => {
    expect(taken).toContain('لا تُفتي');
  });

  it('names no repository, anywhere in what leaves the chamber', () => {
    expect(taken).not.toMatch(/gutenberg|wikipedia|openlibrary|gemini|alquran|reddit|hacker/i);
  });

  it('does not attach a refusal to interpret where none applies', () => {
    expect(evidenceForTaking(englishEntry, 'س', 'scientific')).not.toContain('لا تُفتي');
  });
});

describe('bearing is still measured, not granted', () => {
  it('reports a weak match as a weak match even for a verse', () => {
    expect(relevanceOf(weakMatchVerse)).toBe(EvidenceRelevance.DISTANT);
  });

  it('reports a strong match as a strong one', () => {
    expect(relevanceOf(item({ confidenceScore: 0.92 }))).toBe(EvidenceRelevance.DIRECT);
  });
});
