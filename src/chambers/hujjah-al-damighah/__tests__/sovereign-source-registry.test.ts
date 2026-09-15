/**
 * The Source Registry — a source that refuses this host stays registered.
 *
 * The chamber used to answer a religious question with nothing and say nothing
 * about why. Three Hadith authorities were named by the Founder and all three
 * refuse this server; the Creator is entitled to learn that a named authority
 * was consulted and could not be reached, rather than to read a silence.
 */

import {
  SOVEREIGN_SOURCES,
  findSource,
  sourceTitleAr,
  reachableSourcesFor,
  unreachableSourcesFor,
  availabilityFor,
} from '../sources/sovereign-source-registry';
import {
  AccessStatus,
  CoverageStatus,
  SourceType,
  VerificationStatus,
  TranslationType,
  TranslationStatus,
  coverageLabelAr,
  mayClaimCompleteness,
  translationLabelAr,
  hasStatedGrade,
  GRADE_UNAVAILABLE_AR,
  TRANSLATION_CONFIDENCE_UNCOMPUTED_AR,
} from '../sources/source-contracts';
import { SourceAuthority } from '../domain/evidence-authority';

describe('what the registry holds', () => {
  it('registers the Qur’an as the one decisive text', () => {
    const quran = findSource('scripture');
    expect(quran?.authorityClass).toBe(SourceAuthority.SCRIPTURE);
    expect(quran?.sourceType).toBe(SourceType.SCRIPTURE);
  });

  it('registers the collections of the Sunnah as documented, not decisive', () => {
    const sunnah = findSource('hadith-collections');
    expect(sunnah?.authorityClass).toBe(SourceAuthority.DOCUMENTED);
    expect(sunnah?.authorityClass).not.toBe(SourceAuthority.SCRIPTURE);
    expect(sunnah?.accessStatus).toBe(AccessStatus.OPEN);
  });

  it('gives every source a Creator-facing name that is not a hostname', () => {
    for (const s of SOVEREIGN_SOURCES) {
      expect(s.titleAr.length).toBeGreaterThan(2);
      expect(s.titleAr).not.toMatch(/\.(com|net|org|gov|sa)\b|https?:|cdn|api\./i);
    }
  });

  it('names no provider or vendor anywhere a Creator can read', () => {
    const creatorFacing = SOVEREIGN_SOURCES.map((s) => s.titleAr).join(' ');
    expect(creatorFacing).not.toMatch(
      /gutenberg|wikipedia|gutendex|dorar|sunnah\.com|alifta|jsdelivr|gemini|hadeethenc/i,
    );
  });
});

describe('a source that refuses this host', () => {
  it('stays registered rather than being forgotten', () => {
    for (const id of ['dorar', 'sunnah-com', 'alifta-sunna']) {
      expect(findSource(id)).not.toBeNull();
    }
  });

  it('is marked refused, not merely absent', () => {
    expect(findSource('dorar')?.accessStatus).toBe(AccessStatus.BLOCKED);
    expect(findSource('dorar')?.coverage).toBe(CoverageStatus.SOURCE_BLOCKED);
    expect(findSource('alifta-sunna')?.accessStatus).toBe(AccessStatus.BLOCKED);
  });

  it('is never claimed as verified when it was never reached', () => {
    for (const id of ['dorar', 'sunnah-com', 'alifta-sunna']) {
      expect(findSource(id)?.verificationStatus).not.toBe(VerificationStatus.VERIFIED);
    }
  });

  it('distinguishes a locked door from a silent one', () => {
    expect(findSource('sunnah-com')?.accessStatus).toBe(AccessStatus.REQUIRES_KEY);
  });

  it('is excluded from what the chamber will actually consult', () => {
    const reachable = reachableSourcesFor('religious').map((s) => s.sourceId);
    expect(reachable).toContain('scripture');
    expect(reachable).toContain('hadith-collections');
    expect(reachable).not.toContain('dorar');
  });

  it('is reported to the Creator with a reason, in the Creator’s language', () => {
    const report = availabilityFor('religious');
    expect(report.reachable).toContain('القرآن الكريم');
    expect(report.unreachable.length).toBeGreaterThan(0);
    for (const u of report.unreachable) {
      expect(u.reasonAr.length).toBeGreaterThan(8);
      expect(u.reasonAr).toMatch(/[؀-ۿ]/);
    }
  });

  it('separates a missing credential from a refusal', () => {
    const report = availabilityFor('religious');
    const locked = report.unreachable.find((u) => u.titleAr.includes('مكتبة السنّة'));
    expect(locked?.reasonAr).toContain('إذن وصول');
  });
});

describe('the library’s partial reading is not hidden', () => {
  it('records that a volume is read in part, not whole', () => {
    // It used to be EXCERPT_ONLY — ten kilobytes, which is a title page. The
    // Empire holds its own catalogue now and reads 200KB looking for the
    // passage that bears on the question, so the coverage claim changed with
    // the behaviour rather than ahead of it.
    expect(findSource('sovereign-library')?.coverage).toBe(CoverageStatus.PARTIALLY_REVIEWED);
  });

  it('is reachable, because only its index service was ever blocked', () => {
    expect(findSource('sovereign-library')?.accessStatus).toBe(AccessStatus.OPEN);
  });

  it('serves every domain, because the library holds every subject', () => {
    const library = findSource('sovereign-library');
    for (const d of ['history', 'culture', 'scientific', 'medical', 'religious']) {
      expect(library?.domains).toContain(d);
    }
  });

  it('says so in the Creator’s own language', () => {
    expect(coverageLabelAr(CoverageStatus.EXCERPT_ONLY)).toContain('مقتطف');
    expect(coverageLabelAr(CoverageStatus.SOURCE_BLOCKED)).toContain('غير متاح');
  });
});

describe('claiming a story is whole', () => {
  it('is allowed only when every source was read whole', () => {
    expect(mayClaimCompleteness([CoverageStatus.FULLY_REVIEWED])).toBe(true);
  });

  it('is refused when any source was read only in part', () => {
    expect(mayClaimCompleteness([
      CoverageStatus.FULLY_REVIEWED,
      CoverageStatus.EXCERPT_ONLY,
    ])).toBe(false);
  });

  it('is refused when nothing was read at all', () => {
    expect(mayClaimCompleteness([])).toBe(false);
  });
});

describe('a narration with no stated grade', () => {
  it('is recognised as ungraded', () => {
    expect(hasStatedGrade({ collectionAr: 'صحيح البخاري', grades: [], gradesDiffer: false }))
      .toBe(false);
  });

  it('has words of its own that do not borrow a grade', () => {
    expect(GRADE_UNAVAILABLE_AR).toContain('غير متوفرة');
    expect(GRADE_UNAVAILABLE_AR).not.toContain('صحيح');
    expect(GRADE_UNAVAILABLE_AR).not.toContain('ضعيف');
  });
});

describe('translation', () => {
  it('always declares the machine’s hand', () => {
    const label = translationLabelAr({
      originalLanguage: 'en',
      originalText: 'patience',
      translatedLanguage: 'ar',
      translationText: 'الصبر',
      translationType: TranslationType.MACHINE_TRANSLATION,
      translationStatus: TranslationStatus.TRANSLATED,
      translationConfidence: null,
      translationWarnings: [],
    });
    expect(label).toContain('ترجمة آلية');
    expect(label).toContain('الأصل محفوظ');
  });

  it('never invents a confidence percentage', () => {
    expect(TRANSLATION_CONFIDENCE_UNCOMPUTED_AR).toContain('غير محسوبة');
    expect(TRANSLATION_CONFIDENCE_UNCOMPUTED_AR).not.toMatch(/\d/);
  });

  it('does not call an original a translation', () => {
    const label = translationLabelAr({
      originalLanguage: 'ar',
      originalText: 'الصبر',
      translatedLanguage: 'ar',
      translationText: null,
      translationType: TranslationType.ORIGINAL,
      translationStatus: TranslationStatus.NOT_REQUIRED,
      translationConfidence: null,
      translationWarnings: [],
    });
    expect(label).toContain('كما ورد في مصدره');
  });
});

describe('the eight Ministries', () => {
  it('gained a source, not a ninth Ministry', () => {
    expect(sourceTitleAr('hadith-collections')).toBe('كتب السنّة التسعة');
    expect(unreachableSourcesFor('religious').length).toBeGreaterThan(0);
  });
});
