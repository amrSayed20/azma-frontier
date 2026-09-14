/**
 * The Qur'an as a source, and the rule that made it necessary.
 *
 * What matters here is that the Creator's own words reach this source intact —
 * it indexes Arabic and nothing else — that a literal index is asked something
 * it can actually match, and that the verse arrives with its place so a Creator
 * can take the evidence anywhere and check it.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

import {
  SovereignScriptureProvider,
  scriptureSearchCandidates,
} from '../providers/sovereign-scripture-provider';

function replies(body: unknown, ok = true) {
  return { ok, json: async () => body };
}

function matched(...verses: Array<{ number: number; text: string }>) {
  return replies({ data: { matches: verses } });
}

const NOT_FOUND = { ok: false, json: async () => ({}) };

let provider: SovereignScriptureProvider;
beforeEach(() => {
  mockFetch.mockReset();
  provider = new SovereignScriptureProvider();
});

describe('reducing a question to what a literal index can match', () => {
  it('sets aside the words that frame the question', () => {
    // Measured against the live index: the whole phrase answers 404, these two
    // words answer with sura 18 verse 9.
    expect(scriptureSearchCandidates('قصة أصحاب الكهف')[0]).toBe('أصحاب الكهف');
  });

  it('falls back to shorter phrasings, longest first', () => {
    const candidates = scriptureSearchCandidates('ما هو فضل الصبر في الشدائد');
    expect(candidates[0]).toContain('الصبر');
    expect(candidates).toContain('الشدائد');
  });

  it('strips the diacritics that would make a word unmatchable', () => {
    expect(scriptureSearchCandidates('الصَّبْر والصلاة')[0]).toBe('الصبر والصلاة');
  });

  it('asks nothing when the question is all framing', () => {
    expect(scriptureSearchCandidates('ما هو')).toEqual([]);
  });

  it('asks nothing of an Arabic index in another tongue', () => {
    expect(scriptureSearchCandidates('what is patience')).toEqual([]);
  });
});

describe('who the question reaches this source as', () => {
  it('asks in the Creator’s own words, not the catalogues’ rendering', async () => {
    mockFetch.mockResolvedValueOnce(matched({ number: 2149, text: 'أم حسبت' }));
    await provider.search('the people of the cave', 3, 'أصحاب الكهف');

    expect(decodeURIComponent(mockFetch.mock.calls[0][0])).toContain('أصحاب الكهف');
  });

  it('stays silent rather than guessing when no Arabic was asked', async () => {
    await expect(provider.search('the people of the cave', 3)).resolves.toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('tries the next phrasing when the Book does not contain the first', async () => {
    mockFetch.mockResolvedValueOnce(NOT_FOUND);
    mockFetch.mockResolvedValueOnce(matched({ number: 52, text: 'واستعينوا بالصبر' }));

    const results = await provider.search('x', 3, 'فضل الصبر العظيم');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(1);
  });

  it('gives up without failing the investigation when nothing matches', async () => {
    mockFetch.mockResolvedValue(NOT_FOUND);
    await expect(provider.search('x', 3, 'كلمة لا توجد')).resolves.toEqual([]);
  });

  it('does not stall the chamber when the source is unreachable', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));
    await expect(provider.search('x', 3, 'أصحاب الكهف')).resolves.toEqual([]);
  });
});

describe('the weight the verse carries', () => {
  it('ranks above every catalogue, as the Founder ruled for this domain', async () => {
    mockFetch.mockResolvedValueOnce(matched(
      { number: 2149, text: 'أم حسبت' },
      { number: 2151, text: 'فضربنا على آذانهم' },
    ));

    const results = await provider.search('x', 3, 'أصحاب الكهف');
    // The strongest score any English catalogue assigns itself is 0.95.
    for (const r of results) expect(r.relevanceScore).toBeGreaterThan(0.95);
  });
});

describe('retrieving the verse', () => {
  it('carries the verse, its place, and the reading of its meaning', async () => {
    mockFetch.mockResolvedValueOnce(replies({
      data: [
        { number: 2149, text: 'أَمْ حَسِبْتَ', surah: { name: 'الكهف' }, numberInSurah: 9 },
        { number: 2149, text: 'لا تظن أيها الرسول' },
      ],
    }));

    const doc = await provider.fetch('ayah-2149');
    expect(doc.content).toContain('أَمْ حَسِبْتَ');
    expect(doc.content).toContain('سورة الكهف، الآية 9');
    expect(doc.content).toContain('المعنى: لا تظن أيها الرسول');
  });

  it('still delivers the verse when no reading accompanies it', async () => {
    mockFetch.mockResolvedValueOnce(replies({
      data: [{ number: 1, text: 'بسم الله', surah: { name: 'الفاتحة' }, numberInSurah: 1 }],
    }));

    const doc = await provider.fetch('ayah-1');
    expect(doc.content).toContain('بسم الله');
    expect(doc.content).not.toContain('المعنى');
  });

  it('refuses a reference that names no verse', async () => {
    await expect(provider.fetch('ayah-zero')).rejects.toThrow();
  });

  it('reports an unreachable verse rather than returning an empty one', async () => {
    mockFetch.mockResolvedValueOnce(replies({ data: [] }));
    await expect(provider.fetch('ayah-2149')).rejects.toThrow();
  });
});
