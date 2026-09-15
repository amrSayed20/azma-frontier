/**
 * The Evidence Authority Policy — what a source *is*, kept apart from how well
 * it happens to match a question.
 *
 * The fault these guard against was live: the chamber displayed a Qur'anic verse
 * as its leading evidence and, in the same document, announced «الثقة ضعيفة —
 * الأدلة متعارضة أو لم تُوثَّق بما يكفي». Both sentences came from one number
 * that measures neither standing nor documentation, only keyword overlap.
 */

import {
  SourceAuthority,
  EvidenceRelevance,
  SCRIPTURE_SOURCE_KEY,
  authorityOfSourceKey,
  authorityOfEvidence,
  isDecisiveAuthority,
  gradeRelevance,
  authorityLabelAr,
  relevanceLabelAr,
  interpretationNoteAr,
} from '../domain/evidence-authority';
import { EvidenceExtractor } from '../core/evidence-extractor';
import { ClaimParser } from '../domain/claim-parser';
import { MinistryRegistry } from '../ministries/ministry-registry';
import { CONSTITUTIONAL_MINISTRIES } from '../ministries/ministry-contracts';
import type { IRepositoryProvider } from '../core/repository-manager';
import type { RepositorySearchResult } from '../domain/evidence.types';
import type { SourceDocument } from '../core/evidence-extractor';

const VERSE =
  '﴿أَمْ حَسِبْتَ أَنَّ أَصْحَابَ الكهف وَالرَّقِيمِ كَانُوا مِنْ آيَاتِنَا عَجَبًا﴾ — سورة الكهف، الآية 9.';

function stubProvider(id: string, content: string): IRepositoryProvider {
  return {
    providerId: id,
    async search(): Promise<RepositorySearchResult[]> {
      return [{ id: 'doc-1', provider: id, title: 't', snippet: 's', relevanceScore: 0.9 }];
    },
    async fetch(): Promise<SourceDocument> {
      return { id: 'doc-1', provider: id, content };
    },
  };
}

describe('what a source is', () => {
  it('names the Qur’an decisive', () => {
    expect(authorityOfSourceKey(SCRIPTURE_SOURCE_KEY)).toBe(SourceAuthority.SCRIPTURE);
    expect(isDecisiveAuthority(SourceAuthority.SCRIPTURE)).toBe(true);
  });

  it('names a retrieved catalogue documented, and no more than that', () => {
    expect(authorityOfSourceKey('gutenberg')).toBe(SourceAuthority.DOCUMENTED);
    expect(authorityOfSourceKey('wikipedia')).toBe(SourceAuthority.DOCUMENTED);
    expect(isDecisiveAuthority(SourceAuthority.DOCUMENTED)).toBe(false);
  });

  it('does not let an unknown source inherit a standing', () => {
    expect(authorityOfSourceKey('something-new')).toBe(SourceAuthority.UNATTRIBUTED);
    expect(authorityOfSourceKey(undefined)).toBe(SourceAuthority.UNATTRIBUTED);
    expect(authorityOfSourceKey('')).toBe(SourceAuthority.UNATTRIBUTED);
  });

  it('reads absence as unattributed rather than as a standing it cannot vouch for', () => {
    expect(authorityOfEvidence(undefined)).toBe(SourceAuthority.UNATTRIBUTED);
    expect(authorityOfEvidence({})).toBe(SourceAuthority.UNATTRIBUTED);
  });

  it('is not fooled by a name that merely resembles the scripture key', () => {
    expect(authorityOfSourceKey('scripture-commentary')).toBe(SourceAuthority.UNATTRIBUTED);
    expect(authorityOfSourceKey('my-scripture')).toBe(SourceAuthority.UNATTRIBUTED);
  });
});

describe('how closely a passage bears on the question', () => {
  it('moves with the score, which is the one thing the score measures', () => {
    expect(gradeRelevance(0.9)).toBe(EvidenceRelevance.DIRECT);
    expect(gradeRelevance(0.5)).toBe(EvidenceRelevance.PARTIAL);
    expect(gradeRelevance(0.2)).toBe(EvidenceRelevance.NEEDS_REFLECTION);
    expect(gradeRelevance(0.01)).toBe(EvidenceRelevance.DISTANT);
  });

  it('treats a missing score as a distant bearing, not as an error', () => {
    expect(gradeRelevance(NaN)).toBe(EvidenceRelevance.DISTANT);
  });
});

describe('standing and bearing are different claims', () => {
  it('a decisive text may still bear only distantly on this question', () => {
    // This is the case the old single number could not express at all.
    const authority = authorityOfSourceKey(SCRIPTURE_SOURCE_KEY);
    const relevance = gradeRelevance(0.05);

    expect(isDecisiveAuthority(authority)).toBe(true);
    expect(relevance).toBe(EvidenceRelevance.DISTANT);
    expect(authorityLabelAr(authority)).toContain('قطعي الثبوت');
    expect(relevanceLabelAr(relevance)).toContain('بعيدة');
  });

  it('a weak bearing is never worded as a weak source', () => {
    expect(relevanceLabelAr(EvidenceRelevance.DISTANT)).toContain('بالسؤال');
    expect(relevanceLabelAr(EvidenceRelevance.DISTANT)).not.toContain('مصدر');
  });

  it('the chamber declines to interpret scripture, and says so', () => {
    const note = interpretationNoteAr(SourceAuthority.SCRIPTURE);
    expect(note).toContain('لا تُفتي');
    expect(note).toContain('كما ورد');
  });

  it('declares no interpretation where there is none to declare', () => {
    expect(interpretationNoteAr(SourceAuthority.DOCUMENTED)).toBeNull();
    expect(interpretationNoteAr(SourceAuthority.UNATTRIBUTED)).toBeNull();
  });
});

describe('no repository is named to the Creator', () => {
  it('says what the evidence is, never who supplied it', () => {
    const words = [
      authorityLabelAr(SourceAuthority.SCRIPTURE),
      authorityLabelAr(SourceAuthority.DOCUMENTED),
      authorityLabelAr(SourceAuthority.UNATTRIBUTED),
      relevanceLabelAr(EvidenceRelevance.DIRECT),
      interpretationNoteAr(SourceAuthority.SCRIPTURE) ?? '',
    ].join(' ');

    expect(words).not.toMatch(
      /gutenberg|wikipedia|openlibrary|reddit|gemini|alquran|quran\.com|hacker/i,
    );
    expect(words).toContain('القرآن الكريم');
  });
});

describe('the standing survives the Ministry that hides the name', () => {
  it('carries scripture through the re-stamp while the provider name does not', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', stubProvider(SCRIPTURE_SOURCE_KEY, VERSE));
    const manager = registry.buildRepositoryManager();

    const results = await manager.searchAll('أصحاب الكهف', 5, 'أصحاب الكهف');
    const doc = await manager.fetchDocument(results[0]!.provider, results[0]!.id);

    expect(doc.provider).toBe('ministry-human-knowledge');
    expect(doc.provider).not.toContain(SCRIPTURE_SOURCE_KEY);
    expect(doc.authority).toBe(SourceAuthority.SCRIPTURE);
  });

  it('does not hand a library volume the Qur’an’s standing', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', stubProvider('gutenberg', 'a book about caves'));
    const manager = registry.buildRepositoryManager();

    const results = await manager.searchAll('caves', 5);
    const doc = await manager.fetchDocument(results[0]!.provider, results[0]!.id);

    expect(doc.authority).toBe(SourceAuthority.DOCUMENTED);
  });

  it('keeps each source’s standing its own when they share a Ministry', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', stubProvider(SCRIPTURE_SOURCE_KEY, VERSE));
    registry.attachProvider('ministry-human-knowledge', stubProvider('gutenberg', 'a book'));
    const manager = registry.buildRepositoryManager();

    const results = await manager.searchAll('x', 10, 'أصحاب الكهف');
    const authorities = await Promise.all(
      results.map(async (r) => (await manager.fetchDocument(r.provider, r.id)).authority),
    );

    expect(authorities).toContain(SourceAuthority.SCRIPTURE);
    expect(authorities).toContain(SourceAuthority.DOCUMENTED);
    expect(authorities.filter((a) => a === SourceAuthority.SCRIPTURE)).toHaveLength(1);
  });
});

describe('the standing reaches the evidence', () => {
  const claim = ClaimParser.parse('أصحاب الكهف والرقيم', 'religious');

  it('stamps the extracted evidence with what its source is', () => {
    const [evidence] = EvidenceExtractor.extract(
      { id: 'd', provider: 'ministry-human-knowledge', content: VERSE, authority: SourceAuthority.SCRIPTURE },
      claim,
    );
    expect(evidence.sourceAuthority).toBe(SourceAuthority.SCRIPTURE);
  });

  it('falls back to the raw key when no Ministry resolved one', () => {
    const [evidence] = EvidenceExtractor.extract(
      { id: 'd', provider: SCRIPTURE_SOURCE_KEY, content: VERSE },
      claim,
    );
    expect(evidence.sourceAuthority).toBe(SourceAuthority.SCRIPTURE);
  });

  it('does not invent a standing for a source it cannot name', () => {
    const [evidence] = EvidenceExtractor.extract(
      { id: 'd', provider: 'ministry-human-knowledge', content: 'some text' },
      claim,
    );
    expect(evidence.sourceAuthority).toBe(SourceAuthority.UNATTRIBUTED);
  });

  it('keeps the Arabic of the verse as the evidence text itself', () => {
    const [evidence] = EvidenceExtractor.extract(
      { id: 'd', provider: SCRIPTURE_SOURCE_KEY, content: VERSE, authority: SourceAuthority.SCRIPTURE },
      claim,
    );
    expect(evidence.extractedText).toContain('أَمْ حَسِبْتَ');
    expect(evidence.extractedText).toContain('سورة الكهف');
  });
});

describe('the constitutional Ministries', () => {
  it('remain eight — scripture was given a standing, not a Ministry', () => {
    expect(CONSTITUTIONAL_MINISTRIES).toHaveLength(8);
    expect(CONSTITUTIONAL_MINISTRIES.map((m) => m.ministryId)).not.toContain('ministry-scripture');
    expect(CONSTITUTIONAL_MINISTRIES.map((m) => m.ministryId)).not.toContain('ministry-revelation');
  });
});
