/**
 * Evidence is judged in the tongue it is written in.
 *
 * Scoring is keyword overlap. When an Arabic question was rendered into English
 * for the catalogues and the rendering was written over the claim, every Arabic
 * passage overlapped at zero — so a Qur'anic verse, the one source the Founder
 * named as authoritative for religious questions, would have been graded the
 * weakest evidence in the bundle while an English catalogue entry outranked it.
 */

import { ClaimParser } from '../domain/claim-parser';
import { EvidenceExtractor } from '../core/evidence-extractor';
import { ConfidenceLevel } from '../domain/evidence.types';

const VERSE =
  '﴿أَمْ حَسِبْتَ أَنَّ أَصْحَابَ الكهف وَالرَّقِيمِ كَانُوا مِنْ آيَاتِنَا عَجَبًا﴾ — سورة الكهف، الآية 9. ' +
  'المعنى: لا تظن أيها الرسول أن قصة أصحاب الكهف من آياتنا عجيبة وغريبة.';

const ENGLISH_ENTRY =
  'Media Topic: Seven Sleepers. Description: a Christian and Muslim story about ' +
  'sleepers in a cave who slept for many years, recorded in several traditions.';

function scoreOf(content: string, claim: ReturnType<typeof ClaimParser.parse>) {
  const [evidence] = EvidenceExtractor.extract(
    { id: 'd', provider: 'p', content },
    claim,
  );
  return evidence;
}

describe('a question asked in Arabic and rendered for the catalogues', () => {
  const claim = ClaimParser.parse('أصحاب الكهف والرقيم', 'religious', 'people of the cave sleepers');

  it('keeps the Creator’s own words as the claim', () => {
    expect(claim.normalizedStatement).toBe('أصحاب الكهف والرقيم');
    expect(claim.catalogueStatement).toBe('people of the cave sleepers');
  });

  it('grades the verse on its own words, not on a rendering it never saw', () => {
    const evidence = scoreOf(VERSE, claim);
    expect(evidence.confidenceScore).toBeGreaterThan(0);
    expect(evidence.confidenceLevel).not.toBe(ConfidenceLevel.UNVERIFIED);
  });

  it('still grades an English passage on the wording the catalogues were asked', () => {
    expect(scoreOf(ENGLISH_ENTRY, claim).confidenceScore).toBeGreaterThan(0);
  });

  it('is the repair itself: the verse is no longer outranked by a media entry', () => {
    expect(scoreOf(VERSE, claim).confidenceScore)
      .toBeGreaterThanOrEqual(scoreOf(ENGLISH_ENTRY, claim).confidenceScore);
  });
});

describe('a question that crossed no language boundary', () => {
  const claim = ClaimParser.parse('أصحاب الكهف والرقيم', 'religious');

  it('carries no second tongue', () => {
    expect(claim.catalogueStatement).toBeUndefined();
    expect(claim.catalogueKeywords).toBeUndefined();
  });

  it('is scored exactly as it always was', () => {
    expect(EvidenceExtractor.claimInTongueOf(VERSE, claim)).toBe(claim);
    expect(EvidenceExtractor.claimInTongueOf(ENGLISH_ENTRY, claim)).toBe(claim);
  });
});
