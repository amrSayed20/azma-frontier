/**
 * The chamber answers the subject, not the wording.
 *
 * ─── THE FOUNDER'S OWN EXAMPLE ──────────────────────────────────────────────
 *
 *   «لقد سألت الحجرة في بحث عن قصة صاحب الحوت سيدنا يونس فجاءت بنص قرآني ثم
 *    أتت بكل ما يسمى يونس سواء كان راوٍ أو أي شخص اسمه يونس.»
 *
 *   Two faults produced that, and both were in string comparison.
 *
 *   The scoring engine asked `text.includes(keyword)`. It matched inside words,
 *   so a Prophet's name found every narrator who shared it; and it compared raw
 *   characters, so «ٱلصَّبْرِ» never matched «الصبر» and verses retrieved
 *   *because* they contain a word were then scored as containing nothing — the
 *   live page showed verses at «0%» beside encyclopedia entries at «100%».
 *
 *   And a narration was searched whole. A narration is two things joined: the
 *   isnad names who carried it, the matn is what was said. The isnad is often
 *   the longer half and is made entirely of names, so searching it is searching
 *   a roll of transmitters. A name in an isnad is there the way a postman's
 *   name is on a letter.
 */

import { EvidenceScoringEngine, normaliseArabic } from '../core/evidence-scoring';
import { extractMatn, hasDistinguishableMatn } from '../providers/isnad';
import { ClaimParser } from '../domain/claim-parser';

/** A real narration whose chain carries a transmitter named Yunus. */
const NARRATION_WITH_YUNUS_IN_CHAIN =
  'حَدَّثَنَا عَبْدُ اللَّهِ بْنُ وَهْبٍ، قَالَ أَخْبَرَنِي يُونُسُ، عَنِ ابْنِ شِهَابٍ، ' +
  'عَنْ أَبِي سَلَمَةَ، عَنْ أَبِي هُرَيْرَةَ، قَالَ رسول الله صلى الله عليه وسلم ' +
  'إِذَا أَقْبَلَ رَمَضَانُ فُتِحَتْ أَبْوَابُ الْجَنَّةِ وَغُلِّقَتْ أَبْوَابُ النَّارِ';

/** A narration that is actually about Yunus ﷺ. */
const NARRATION_ABOUT_YUNUS =
  'حَدَّثَنَا آدَمُ، حَدَّثَنَا شُعْبَةُ، عَنِ ابْنِ عَبَّاسٍ، عن النبي صلى الله عليه وسلم ' +
  'قَالَ مَا يَنْبَغِي لِعَبْدٍ أَنْ يَقُولَ أَنَا خَيْرٌ مِنْ يُونُسَ بْنِ مَتَّى';

describe('telling the chain from what was carried', () => {
  it('cuts at the handover to what was said', () => {
    const matn = extractMatn(NARRATION_WITH_YUNUS_IN_CHAIN);
    expect(matn).toContain('إِذَا أَقْبَلَ رَمَضَانُ');
    expect(hasDistinguishableMatn(NARRATION_WITH_YUNUS_IN_CHAIN)).toBe(true);
  });

  it('leaves the transmitters behind', () => {
    // This is the whole point: the narrator named Yunus is in the chain.
    expect(NARRATION_WITH_YUNUS_IN_CHAIN).toContain('يُونُسُ');
    expect(extractMatn(NARRATION_WITH_YUNUS_IN_CHAIN)).not.toContain('يُونُس');
  });

  it('keeps a name that belongs to what was actually said', () => {
    expect(extractMatn(NARRATION_ABOUT_YUNUS)).toContain('يُونُسَ بْنِ مَتَّى');
  });

  it('keeps the whole text when it cannot find a handover', () => {
    const noChain = 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى';
    expect(extractMatn(noChain)).toBe(noChain);
    expect(hasDistinguishableMatn(noChain)).toBe(false);
  });

  it('does not cut when the handover sits at the very end', () => {
    // A mention of the Prophet ﷺ inside the chain, with no content after it.
    const trailing = 'حدثنا فلان عن فلان عن النبي صلى الله عليه وسلم';
    expect(extractMatn(trailing)).toBe(trailing);
  });

  it('survives an empty narration without inventing one', () => {
    expect(extractMatn('')).toBe('');
    expect(extractMatn('   ')).toBe('');
  });
});

describe('scoring a passage against a question', () => {
  const claim = ClaimParser.parse('الصبر', 'religious');

  it('sees an Arabic word through its diacritics', () => {
    // A verse retrieved *because* it contains this word used to score zero.
    const verse = '﴿وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ﴾';
    expect(EvidenceScoringEngine.score(verse, claim).confidenceScore).toBeGreaterThan(0);
  });

  it('sees a word through the prefixes Arabic attaches to it', () => {
    for (const form of ['الصبر', 'بالصبر', 'وبالصبر', 'فالصبر', 'للصبر']) {
      expect(EvidenceScoringEngine.score(`قال ${form} خير`, claim).confidenceScore)
        .toBeGreaterThan(0);
    }
  });

  it('does not find a word inside a longer, different word', () => {
    const yunus = ClaimParser.parse('يونس', 'religious');
    expect(EvidenceScoringEngine.score('حدثنا يونسي بن كذا', yunus).confidenceScore).toBe(0);
  });

  it('scores a narration about a subject above one that merely transmits it', () => {
    const yunus = ClaimParser.parse('يونس', 'religious');
    const about = EvidenceScoringEngine.score(extractMatn(NARRATION_ABOUT_YUNUS), yunus);
    const carried = EvidenceScoringEngine.score(extractMatn(NARRATION_WITH_YUNUS_IN_CHAIN), yunus);

    expect(about.confidenceScore).toBeGreaterThan(0);
    expect(carried.confidenceScore).toBe(0);
  });

  it('is the shape of the fault: whole narrations score the same either way', () => {
    const yunus = ClaimParser.parse('يونس', 'religious');
    const about = EvidenceScoringEngine.score(NARRATION_ABOUT_YUNUS, yunus);
    const carried = EvidenceScoringEngine.score(NARRATION_WITH_YUNUS_IN_CHAIN, yunus);
    expect(carried.confidenceScore).toBe(about.confidenceScore);
  });

  it('still scores English, which most catalogues hold', () => {
    const english = ClaimParser.parse('solar energy', 'scientific');
    expect(EvidenceScoringEngine.score('Solar Energy is radiant light', english).confidenceScore)
      .toBeGreaterThan(0);
  });

  it('claims nothing when there is nothing to compare', () => {
    const empty = { ...claim, keywords: [] };
    expect(EvidenceScoringEngine.score('أي نص', empty).confidenceScore).toBe(0.1);
  });
});

describe('normalising Arabic', () => {
  it('is stable across the spellings scribes differ over', () => {
    expect(normaliseArabic('ٱلصَّبْرِ')).toBe('الصبر');
    expect(normaliseArabic('إنَّما')).toBe('انما');
    expect(normaliseArabic('صلاةً')).toBe('صلاه');
  });
});
