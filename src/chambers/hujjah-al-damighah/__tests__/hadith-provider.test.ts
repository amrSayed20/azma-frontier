/**
 * The Sunnah enters the chamber — and a narration's grade never gets invented.
 *
 * ─── THE DEFECT THESE EXIST TO KEEP DEAD ────────────────────────────────────
 *
 *   The first shape of this provider retrieved the collections at search time.
 *   Each is a single JSON document of nine megabytes, JSON.parse is
 *   synchronous, and the production log recorded what that cost: on every
 *   investigation *every* Ministry exceeded its five-second deadline —
 *   including the four Ministries that have no providers attached and return an
 *   empty array immediately. An empty Ministry cannot take five seconds. They
 *   took five seconds because nothing was running at all. One Creator's search
 *   of the Sunnah froze the whole Empire for everyone else inside it.
 *
 *   The narrations are now ingested once by a separate process and read as
 *   rows. `fetch` is mocked below to throw: nothing in this provider may reach
 *   the network, and a test proves it rather than trusting it.
 *
 * ─── THE GRADING RULE ───────────────────────────────────────────────────────
 *
 *   Measured from the collections: al-Bukhari carries an empty grading field,
 *   while Abu Dawud's first narration carries grades from scholars who do not
 *   agree. Both are fixtures here.
 */

const forbiddenFetch = jest.fn(() => {
  throw new Error('The Hadith provider must never reach the network.');
});
global.fetch = forbiddenFetch as unknown as typeof fetch;

const mockSearch = jest.fn();
const mockSearchAny = jest.fn();
const mockFind = jest.fn();
const mockHas = jest.fn();
const mockCounts = jest.fn();

jest.mock('@/src/persistent-storage/hadith-repository', () => ({
  searchNarrations: (...a: unknown[]) => mockSearch(...a),
  searchNarrationsAny: (...a: unknown[]) => mockSearchAny(...a),
  findNarration: (...a: unknown[]) => mockFind(...a),
  hasNarrations: (...a: unknown[]) => mockHas(...a),
  narrationCounts: (...a: unknown[]) => mockCounts(...a),
}));

import {
  HadithProvider,
  renderGrades,
  normaliseArabic,
  subjectWords,
  parseDocumentId,
  sunnahHolding,
} from '../providers/hadith-provider';
import { SourceAuthority } from '../domain/evidence-authority';

/** As al-Bukhari is actually held: text and number, and no grading at all. */
const BUKHARI_NARRATION = {
  narrationId: 'ara-bukhari-2',
  edition: 'ara-bukhari',
  collectionAr: 'صحيح البخاري',
  narrationNumber: 2,
  textAr: 'الصبر ضياء والصلاة نور وفي الصبر خير كثير',
  grades: [],
};

/** As Abu Dawud is actually held: scholars named, and they disagree. */
const ABUDAWUD_NARRATION = {
  narrationId: 'ara-abudawud-1',
  edition: 'ara-abudawud',
  collectionAr: 'سنن أبي داود',
  narrationNumber: 1,
  textAr: 'من صبر على البلاء رفعه الله',
  grades: [
    { name: 'الألباني', grade: 'حسن صحيح' },
    { name: 'شعيب الأرناؤوط', grade: 'صحيح لغيره' },
  ],
};

let provider: HadithProvider;
beforeEach(() => {
  forbiddenFetch.mockClear();
  mockSearch.mockReset();
  mockSearchAny.mockReset();
  mockFind.mockReset();
  mockHas.mockReset().mockReturnValue(true);
  mockCounts.mockReset().mockReturnValue({ total: 0, byCollection: {} });
  provider = new HadithProvider();
});

describe('the provider never reaches the network', () => {
  it('searches without a single request', async () => {
    mockSearch.mockReturnValue([BUKHARI_NARRATION]);
    await provider.search('x', 5, 'الصبر');
    expect(forbiddenFetch).not.toHaveBeenCalled();
  });

  it('fetches a narration without a single request', async () => {
    mockFind.mockReturnValue(BUKHARI_NARRATION);
    await provider.fetch('hadith-ara-bukhari-2');
    expect(forbiddenFetch).not.toHaveBeenCalled();
  });

  it('returns at once when the Empire holds no narrations yet', async () => {
    mockHas.mockReturnValue(false);
    await expect(provider.search('x', 5, 'الصبر')).resolves.toEqual([]);
    expect(mockSearch).not.toHaveBeenCalled();
    expect(forbiddenFetch).not.toHaveBeenCalled();
  });
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
    expect(subjectWords('ما ورد في فضل الصبر')).toEqual(['الصبر']);
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
    mockFind.mockReturnValue(BUKHARI_NARRATION);
    const doc = await provider.fetch('hadith-ara-bukhari-2');

    // The citation rides in attributionAr, not in the text — a window over the
    // text would otherwise cut the collection and the grading away entirely.
    expect(doc.attributionAr).toContain('صحيح البخاري — الحديث 2');
    expect(doc.attributionAr).toContain('درجة الحديث: غير متوفرة من المصدر');
    // The word the collection's title would have supplied, had we let it.
    expect(doc.attributionAr).not.toMatch(/درجة الحديث:\s*صحيح\b/);
    // The narration itself is the text, and nothing else is.
    expect(doc.content).toBe(BUKHARI_NARRATION.textAr);
  });
});

describe('a narration the scholars graded', () => {
  it('carries every grade with the name of who issued it', () => {
    const rendered = renderGrades(ABUDAWUD_NARRATION.grades);
    expect(rendered).toContain('حسن صحيح — الألباني');
    expect(rendered).toContain('صحيح لغيره — شعيب الأرناؤوط');
  });

  it('declares the disagreement instead of picking a winner', () => {
    expect(renderGrades(ABUDAWUD_NARRATION.grades)).toContain('واختلف أهل العلم في درجته');
  });

  it('claims no disagreement when the scholars agree', () => {
    const rendered = renderGrades([
      { name: 'الألباني', grade: 'صحيح' },
      { name: 'زبير علي زئي', grade: 'صحيح' },
    ]);
    expect(rendered).not.toContain('واختلف');
  });

  it('discards a grade with no scholar attached to it', () => {
    expect(renderGrades([{ grade: 'صحيح' } as never])).toBeNull();
    expect(renderGrades([{ name: 'الألباني' } as never])).toBeNull();
  });

  it('delivers the disagreement to the Creator', async () => {
    mockFind.mockReturnValue(ABUDAWUD_NARRATION);
    const doc = await provider.fetch('hadith-ara-abudawud-1');

    expect(doc.attributionAr).toContain('سنن أبي داود — الحديث 1');
    expect(doc.attributionAr).toContain('حسن صحيح — الألباني');
    expect(doc.attributionAr).toContain('صحيح لغيره — شعيب الأرناؤوط');
    expect(doc.attributionAr).toContain('واختلف أهل العلم');
  });
});

describe('what a narration is', () => {
  it('is documented, never scripture — the Qur’an alone is decisive', async () => {
    mockFind.mockReturnValue(BUKHARI_NARRATION);
    const doc = await provider.fetch('hadith-ara-bukhari-2');
    expect(doc.authority).toBe(SourceAuthority.DOCUMENTED);
    expect(doc.authority).not.toBe(SourceAuthority.SCRIPTURE);
  });

  it('names its collection to the Creator, and no host', async () => {
    mockSearch.mockReturnValue([BUKHARI_NARRATION]);
    const [result] = await provider.search('x', 5, 'الصبر');
    expect(result.title).toContain('صحيح البخاري');
    expect(result.title).not.toMatch(/cdn|jsdelivr|http|api/i);
  });
});

describe('searching the collections', () => {
  it('finds narrations bearing on the subject asked', async () => {
    mockSearch.mockReturnValue([BUKHARI_NARRATION]);
    const results = await provider.search('x', 5, 'ما ورد في فضل الصبر');

    expect(results.length).toBe(1);
    expect(results[0]!.snippet).toContain('الصبر');
  });

  it('is asked in the Creator’s own words, not the catalogues’ rendering', async () => {
    mockSearch.mockReturnValue([]);
    mockSearchAny.mockReturnValue([]);
    await provider.search('patience virtue', 5, 'الصبر');

    // The words handed to storage are the Creator's, normalised — not English.
    expect(mockSearch).toHaveBeenCalledWith(['الصبر'], 5);
  });

  it('stays silent rather than guessing when no Arabic was asked', async () => {
    await expect(provider.search('patience virtue', 5)).resolves.toEqual([]);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('falls back to any word only after every word found nothing', async () => {
    mockSearch.mockReturnValue([]);
    mockSearchAny.mockReturnValue([BUKHARI_NARRATION]);

    const results = await provider.search('x', 5, 'الصبر والصلاة');
    expect(mockSearch).toHaveBeenCalled();
    expect(mockSearchAny).toHaveBeenCalled();
    expect(results.length).toBe(1);
  });

  it('does not widen the search when a single word already found nothing', async () => {
    mockSearch.mockReturnValue([]);
    await provider.search('x', 5, 'الصبر');
    expect(mockSearchAny).not.toHaveBeenCalled();
  });

  it('does not fail the investigation when storage faults', async () => {
    mockHas.mockImplementation(() => { throw new Error('db gone'); });
    await expect(provider.search('x', 5, 'الصبر')).resolves.toEqual([]);
  });

  it('ranks a narration matching the whole subject above one matching a part', async () => {
    mockSearch.mockReturnValue([BUKHARI_NARRATION]);
    const [whole] = await provider.search('x', 5, 'الصبر والصلاة');

    mockSearch.mockReturnValue([]);
    mockSearchAny.mockReturnValue([BUKHARI_NARRATION]);
    const [part] = await provider.search('x', 5, 'الصبر والصلاة');

    expect(whole.relevanceScore).toBeGreaterThan(part.relevanceScore);
  });
});

describe('refusing a reference it cannot honour', () => {
  it('rejects a reference naming no narration', async () => {
    await expect(provider.fetch('hadith-ara-bukhari-zero')).rejects.toThrow();
    expect(parseDocumentId('nonsense')).toBeNull();
  });

  it('reports a narration the Empire does not hold', async () => {
    mockFind.mockReturnValue(null);
    await expect(provider.fetch('hadith-ara-bukhari-99999')).rejects.toThrow();
  });

  it('reads a reference back exactly as it was written', () => {
    expect(parseDocumentId('hadith-ara-bukhari-2')).toEqual({ edition: 'ara-bukhari', number: 2 });
  });
});

describe('what the Empire says it holds', () => {
  it('reports an empty store as empty rather than as a silence', () => {
    mockCounts.mockReturnValue({ total: 0, byCollection: {} });
    expect(sunnahHolding().held).toBe(false);
  });

  it('reports what it holds, by collection', () => {
    mockCounts.mockReturnValue({ total: 7589, byCollection: { 'صحيح البخاري': 7589 } });
    const holding = sunnahHolding();
    expect(holding.held).toBe(true);
    expect(holding.byCollection['صحيح البخاري']).toBe(7589);
  });

  it('does not claim a holding when the store cannot be read', () => {
    mockCounts.mockImplementation(() => { throw new Error('db gone'); });
    expect(sunnahHolding().held).toBe(false);
  });
});
