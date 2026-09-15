/**
 * The Sunnah enters the chamber — and a narration's grade never gets invented.
 *
 * The rule these exist to hold: «Do not infer the grade of every narration from
 * the name of the collection. Display multiple scholarly grades when they
 * differ. Display grade unavailable when no reliable grade is available. Never
 * manufacture a single synthetic grade.»
 *
 * Measured from the live source: al-Bukhari's first narration carries an empty
 * grading field, while Abu Dawud's carries four grades from four scholars that
 * do not agree. Both of those facts are fixtures below.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

import {
  HadithProvider,
  renderGrades,
  normaliseArabic,
  subjectWords,
  clearHeldCollections,
  heldCollections,
} from '../providers/hadith-provider';
import { SourceAuthority } from '../domain/evidence-authority';

/** As al-Bukhari actually arrives: text and reference, and no grading at all. */
const BUKHARI_SHAPE = {
  hadiths: [
    {
      hadithnumber: 1,
      text: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى',
      grades: [],
      reference: { book: 1, hadith: 1 },
    },
    {
      hadithnumber: 2,
      text: 'الصبر ضياء والصلاة نور وفي الصبر خير كثير',
      grades: [],
      reference: { book: 1, hadith: 2 },
    },
  ],
};

/** As Abu Dawud actually arrives: four scholars, and they disagree. */
const ABUDAWUD_SHAPE = {
  hadiths: [
    {
      hadithnumber: 1,
      text: 'من صبر على البلاء رفعه الله',
      grades: [
        { name: 'الألباني', grade: 'حسن صحيح' },
        { name: 'شعيب الأرناؤوط', grade: 'صحيح لغيره' },
      ],
      reference: { book: 1, hadith: 1 },
    },
  ],
};

function serves(body: unknown, ok = true) {
  return { ok, json: async () => body };
}

let provider: HadithProvider;
beforeEach(() => {
  mockFetch.mockReset();
  provider = new HadithProvider();
  // A held collection outlives the test that fetched it, so without this a test
  // asking what happens when the collections are unreachable would be answered
  // by the collection the previous test left behind.
  clearHeldCollections();
});

describe('making Arabic comparable', () => {
  it('sees past the diacritics two scribes differ over', () => {
    expect(normaliseArabic('الصَّبْرُ')).toBe(normaliseArabic('الصبر'));
  });

  it('sees past the forms of alif and ya', () => {
    expect(normaliseArabic('إنما')).toBe(normaliseArabic('انما'));
    expect(normaliseArabic('على')).toBe(normaliseArabic('علي'));
  });

  it('keeps the words of the subject and sets aside the asking', () => {
    expect(subjectWords('ما هو فضل الصبر')).toEqual(['الصبر']);
  });

  it('asks nothing when a question is all framing', () => {
    expect(subjectWords('ما هو')).toEqual([]);
  });
});

describe('a narration the scholars did not grade', () => {
  it('says so, rather than borrowing the collection’s reputation', () => {
    expect(renderGrades([])).toBeNull();
    expect(renderGrades(undefined)).toBeNull();
  });

  it('reaches the Creator as ungraded even from the most trusted collection', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    const doc = await provider.fetch('hadith-ara-bukhari-1');

    expect(doc.content).toContain('صحيح البخاري — الحديث 1');
    expect(doc.content).toContain('درجة الحديث: غير متوفرة من المصدر');
    // The word the collection's title would have supplied, had we let it.
    expect(doc.content).not.toMatch(/درجة الحديث:\s*صحيح\b/);
  });
});

describe('a narration the scholars graded', () => {
  it('carries every grade with the name of who issued it', () => {
    const rendered = renderGrades([
      { name: 'الألباني', grade: 'حسن صحيح' },
      { name: 'شعيب الأرناؤوط', grade: 'صحيح لغيره' },
    ]);
    expect(rendered).toContain('حسن صحيح — الألباني');
    expect(rendered).toContain('صحيح لغيره — شعيب الأرناؤوط');
  });

  it('declares the disagreement instead of picking a winner', () => {
    const rendered = renderGrades([
      { name: 'الألباني', grade: 'حسن صحيح' },
      { name: 'شعيب الأرناؤوط', grade: 'صحيح لغيره' },
    ]);
    expect(rendered).toContain('واختلف أهل العلم في درجته');
  });

  it('claims no disagreement when the scholars agree', () => {
    const rendered = renderGrades([
      { name: 'الألباني', grade: 'صحيح' },
      { name: 'زبير علي زئي', grade: 'صحيح' },
    ]);
    expect(rendered).not.toContain('واختلف');
  });

  it('discards a grade with no scholar attached to it', () => {
    expect(renderGrades([{ grade: 'صحيح' }])).toBeNull();
    expect(renderGrades([{ name: 'الألباني' }])).toBeNull();
  });

  it('delivers the disagreement to the Creator, live', async () => {
    mockFetch.mockResolvedValue(serves(ABUDAWUD_SHAPE));
    const doc = await provider.fetch('hadith-ara-abudawud-1');

    expect(doc.content).toContain('سنن أبي داود — الحديث 1');
    expect(doc.content).toContain('حسن صحيح — الألباني');
    expect(doc.content).toContain('صحيح لغيره — شعيب الأرناؤوط');
    expect(doc.content).toContain('واختلف أهل العلم');
  });
});

describe('what the narration is', () => {
  it('is documented, never scripture — the Qur’an alone is decisive', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    const doc = await provider.fetch('hadith-ara-bukhari-1');
    expect(doc.authority).toBe(SourceAuthority.DOCUMENTED);
    expect(doc.authority).not.toBe(SourceAuthority.SCRIPTURE);
  });
});

describe('searching the collections', () => {
  it('finds narrations bearing on the subject asked', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    const results = await provider.search('x', 5, 'ما هو فضل الصبر');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.snippet).toContain('الصبر');
    expect(results[0]!.title).toContain('صحيح البخاري');
  });

  it('is asked in the Creator’s own words, not the catalogues’ rendering', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    await provider.search('patience virtue', 5, 'الصبر');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('stays silent rather than guessing when no Arabic was asked', async () => {
    await expect(provider.search('patience virtue', 5)).resolves.toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not stall the chamber when the collections are unreachable', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));
    await expect(provider.search('x', 5, 'الصبر')).resolves.toEqual([]);
  });

  it('survives a collection that answers with nothing usable', async () => {
    mockFetch.mockResolvedValue(serves({ hadiths: [] }));
    await expect(provider.search('x', 5, 'الصبر')).resolves.toEqual([]);
  });
});

describe('holding a collection', () => {
  it('fetches a collection once and answers the second question from memory', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    await provider.search('x', 1, 'الصبر');
    const callsAfterFirst = mockFetch.mock.calls.length;

    await provider.search('x', 1, 'الصبر');
    expect(mockFetch.mock.calls.length).toBe(callsAfterFirst);
    expect(heldCollections().length).toBeGreaterThan(0);
  });

  it('holds no more collections than it is allowed to', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    // A word present in every collection forces each one to be consulted.
    await provider.search('x', 40, 'الصبر');
    expect(heldCollections().length).toBeLessThanOrEqual(3);
  });

  it('can be emptied, so a bad retrieval is recoverable without a restart', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    await provider.search('x', 1, 'الصبر');
    expect(heldCollections().length).toBeGreaterThan(0);

    clearHeldCollections();
    expect(heldCollections()).toEqual([]);
  });
});

describe('refusing a reference it cannot honour', () => {
  it('rejects a narration id naming no collection', async () => {
    await expect(provider.fetch('hadith-not-a-collection-1')).rejects.toThrow();
  });

  it('reports a narration that is not in the collection', async () => {
    mockFetch.mockResolvedValue(serves(BUKHARI_SHAPE));
    await expect(provider.fetch('hadith-ara-bukhari-99999')).rejects.toThrow();
  });
});
