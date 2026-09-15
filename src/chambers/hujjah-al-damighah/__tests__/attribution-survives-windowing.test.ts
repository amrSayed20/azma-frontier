/**
 * A citation must survive the window.
 *
 * ─── THE DEFECT THIS KEEPS DEAD ─────────────────────────────────────────────
 *
 *   Evidence is extracted as a 420-character window over the most relevant
 *   passage of a document. The Hadith provider first appended the collection,
 *   the narration number and the scholars' gradings to the end of its text, and
 *   the live page showed the result: a long narration reached the Creator
 *   windowed, with all three truncated away.
 *
 *   What is left when that happens is an unsourced sentence about the Prophet ﷺ
 *   — the exact thing the Founder forbade — and a grading the Creator never
 *   sees is a grading that was never displayed.
 *
 *   A citation is therefore not prose. It rides past the window.
 */

import { EvidenceExtractor } from '../core/evidence-extractor';
import { ClaimParser } from '../domain/claim-parser';
import { SourceAuthority } from '../domain/evidence-authority';

/** Long enough that any window over it must drop something. */
const LONG_NARRATION =
  'حدثنا عبد الله بن يوسف قال أخبرنا مالك عن ابن شهاب عن عروة بن الزبير عن المسور بن مخرمة ' +
  'ومروان بن الحكم يصدق كل واحد منهما حديث صاحبه قالا خرج رسول الله صلى الله عليه وسلم زمن ' +
  'الحديبية حتى إذا كانوا ببعض الطريق قال النبي صلى الله عليه وسلم إن خالد بن الوليد بالغميم ' +
  'في خيل لقريش طليعة فخذوا ذات اليمين فوالله ما شعر بهم خالد حتى إذا هم بقترة الجيش فانطلق ' +
  'يركض نذيرا لقريش وسار النبي صلى الله عليه وسلم حتى إذا كان بالثنية التي يهبط عليهم منها ' +
  'بركت به راحلته فقال الناس حل حل فألحت فقالوا خلأت القصواء فقال النبي صلى الله عليه وسلم ' +
  'ما خلأت القصواء وما ذاك لها بخلق ولكن حبسها حابس الفيل ثم قال والذي نفسي بيده لا يسألونني ' +
  'خطة يعظمون فيها حرمات الله إلا أعطيتهم إياها ثم زجرها فوثبت';

const ATTRIBUTION =
  'صحيح البخاري — الحديث 2731.\nدرجة الحديث: غير متوفرة من المصدر.';

const claim = ClaimParser.parse('حابس الفيل', 'religious');

function extract(content: string, attributionAr?: string) {
  const [evidence] = EvidenceExtractor.extract(
    { id: 'd', provider: 'ministry-human-knowledge', content, attributionAr, authority: SourceAuthority.DOCUMENTED },
    claim,
  );
  return evidence;
}

describe('a narration too long for the window', () => {
  it('is windowed — which is what used to destroy the citation', () => {
    const passage = EvidenceExtractor.findRelevantPassage(LONG_NARRATION, claim);
    expect(passage.length).toBeLessThan(LONG_NARRATION.length);
  });

  it('would lose its collection if the citation were part of the text', () => {
    // The old shape: attribution appended as trailing prose.
    const asProse = extract(`${LONG_NARRATION}\n\n${ATTRIBUTION}`);
    expect(asProse.extractedText).not.toContain('صحيح البخاري');
  });

  it('keeps its collection when the citation rides apart from the text', () => {
    const withAttribution = extract(LONG_NARRATION, ATTRIBUTION);
    expect(withAttribution.extractedText).toContain('صحيح البخاري');
    expect(withAttribution.extractedText).toContain('الحديث 2731');
  });

  it('keeps what the scholars said of it, or that they said nothing', () => {
    const withAttribution = extract(LONG_NARRATION, ATTRIBUTION);
    expect(withAttribution.extractedText).toContain('درجة الحديث: غير متوفرة من المصدر');
  });

  it('keeps a disagreement between scholars rather than windowing it away', () => {
    const graded = extract(
      LONG_NARRATION,
      'سنن أبي داود — الحديث 1.\nدرجة الحديث:\nحسن صحيح — الألباني\nصحيح لغيره — شعيب الأرناؤوط\nواختلف أهل العلم في درجته، وقد عُرضت أقوالهم كما هي.',
    );
    expect(graded.extractedText).toContain('حسن صحيح — الألباني');
    expect(graded.extractedText).toContain('واختلف أهل العلم');
  });
});

describe('a citation never inflates a score', () => {
  it('scores the passage alone, not the passage plus its citation', () => {
    // A citation stuffed with the claim's own words must not raise confidence.
    const plain = extract(LONG_NARRATION);
    const stuffed = extract(LONG_NARRATION, 'حابس الفيل حابس الفيل حابس الفيل');
    expect(stuffed.confidenceScore).toBe(plain.confidenceScore);
  });
});

describe('a source with nothing to cite', () => {
  it('is left exactly as it was', () => {
    const plain = extract('نص قصير بلا نسبة');
    expect(plain.extractedText).toBe('نص قصير بلا نسبة');
  });
});

describe('a verse', () => {
  it('carries its sura and number past the window', () => {
    const verseClaim = ClaimParser.parse('اصحاب الفيل', 'religious');
    const [evidence] = EvidenceExtractor.extract(
      {
        id: 'v',
        provider: 'ministry-human-knowledge',
        content: '﴿أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ﴾',
        attributionAr: 'سورة الفيل، الآية 1.',
        authority: SourceAuthority.SCRIPTURE,
      },
      verseClaim,
    );
    expect(evidence.extractedText).toContain('سورة الفيل، الآية 1');
    expect(evidence.sourceAuthority).toBe(SourceAuthority.SCRIPTURE);
  });
});
