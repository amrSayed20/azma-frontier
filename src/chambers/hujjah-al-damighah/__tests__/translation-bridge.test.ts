/**
 * Nothing foreign reaches the Creator — not to the eye, and not to the voice.
 *
 * ─── WHY THIS IS NOT A PREFERENCE ───────────────────────────────────────────
 *
 *   Measured on the live page: a Creator who asked «قصة أصحاب الفيل» in Arabic
 *   received «Media Topic: Mecca», «Warfare in pre-Islamic Arabia» and three
 *   more English entries among their ten pieces of evidence. The chamber
 *   speaks, so those were not merely awkward to read past — they would be read
 *   aloud, in a language the Creator did not ask in.
 *
 *   The Founder's instruction: «ولا يعرض النص باللغة الإنجليزية وكذلك لا ينطق
 *   فالحجره ناطقه ولا تنسى».
 *
 *   It pulls against his other instruction, that an answer must not take long.
 *   Where they meet, the language rule wins: withholding a passage costs the
 *   Creator one piece of evidence, while showing English costs the chamber its
 *   voice. A passage that cannot cross is therefore withheld — never displayed
 *   in its own tongue as a fallback.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

process.env.GEMINI_API_KEY = 'gemini-test-key-sentinel';

import { toArabic, displayableText } from '../sovereign-language-bridge';
import { TranslationType, TranslationStatus } from '../sources/source-contracts';

function geminiReturns(text: string) {
  return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] }}] }) };
}

/** The shape the bridge asks for: each passage back under its own marker. */
function markedReply(...passages: string[]): string {
  return passages.map((p, i) => `<<<${i + 1}>>>\n${p}`).join('\n\n');
}

beforeEach(() => mockFetch.mockReset());

describe('a passage already in the Creator’s tongue', () => {
  it('crosses nothing and is declared original', async () => {
    const [record] = await toArabic(['الصبر ضياء']);
    expect(record.translationType).toBe(TranslationType.ORIGINAL);
    expect(record.translationStatus).toBe(TranslationStatus.NOT_REQUIRED);
    expect(displayableText(record)).toBe('الصبر ضياء');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('a foreign passage', () => {
  it('is displayed in Arabic, never in the tongue it arrived in', async () => {
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply('موضوع: مكة المكرمة')));
    const [record] = await toArabic(['Media Topic: Mecca']);

    expect(displayableText(record)).toBe('موضوع: مكة المكرمة');
    expect(displayableText(record)).not.toContain('Media Topic');
  });

  it('keeps its original, so a rendering can be checked against it', async () => {
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply('موضوع: مكة المكرمة')));
    const [record] = await toArabic(['Media Topic: Mecca']);

    expect(record.originalText).toBe('Media Topic: Mecca');
    expect(record.translationType).toBe(TranslationType.MACHINE_TRANSLATION);
  });

  it('never claims a translation confidence nobody computed', async () => {
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply('موضوع: مكة')));
    const [record] = await toArabic(['Media Topic: Mecca']);
    expect(record.translationConfidence).toBeNull();
  });
});

describe('a passage that cannot cross', () => {
  it('is withheld, not shown in English', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    const [record] = await toArabic(['Warfare in pre-Islamic Arabia']);

    expect(record.translationStatus).toBe(TranslationStatus.WITHHELD);
    expect(displayableText(record)).toBeNull();
  });

  it('is withheld when the bridge is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    const [record] = await toArabic(['Himyar was a South Arabian kingdom']);
    expect(displayableText(record)).toBeNull();
  });

  it('is withheld when the reply omits it', async () => {
    // Two asked for, one returned.
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply('الأول فقط')));
    const records = await toArabic(['first passage', 'second passage']);

    expect(displayableText(records[0]!)).toBe('الأول فقط');
    expect(displayableText(records[1]!)).toBeNull();
  });

  it('still carries its original when withheld, so nothing is lost silently', async () => {
    mockFetch.mockRejectedValueOnce(new Error('down'));
    const [record] = await toArabic(['Media Topic: Mecca']);
    expect(record.originalText).toBe('Media Topic: Mecca');
    expect(record.translationWarnings.length).toBeGreaterThan(0);
  });
});

describe('everything crosses together', () => {
  it('asks once for many passages rather than once each', async () => {
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply('أ', 'ب', 'ج')));
    await toArabic(['one', 'two', 'three']);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('withholds the overflow rather than making a second Creator wait', async () => {
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply(...Array(8).fill('نص'))));
    const many = Array.from({ length: 12 }, (_, i) => `passage ${i}`);
    const records = await toArabic(many);

    expect(records.filter((r) => displayableText(r) !== null)).toHaveLength(8);
    expect(records.slice(8).every((r) => r.translationStatus === TranslationStatus.WITHHELD)).toBe(true);
  });

  it('leaves Arabic passages untouched while foreign ones cross', async () => {
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply('نص مترجم')));
    const records = await toArabic(['حديث عربي', 'an english passage']);

    expect(records[0]!.translationType).toBe(TranslationType.ORIGINAL);
    expect(records[1]!.translationType).toBe(TranslationType.MACHINE_TRANSLATION);
    // Only the foreign one was sent.
    const sent = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(sent.contents[0].parts[0].text).toContain('an english passage');
    expect(sent.contents[0].parts[0].text).not.toContain('حديث عربي');
  });
});

describe('what the translator is instructed to protect', () => {
  async function instruction(): Promise<string> {
    mockFetch.mockResolvedValueOnce(geminiReturns(markedReply('نص')));
    await toArabic(['some english']);
    return JSON.parse(mockFetch.mock.calls[0][1].body).systemInstruction.parts[0].text;
  }

  it('forbids touching a verse or a narration', async () => {
    const rules = await instruction();
    expect(rules).toContain('لا تُترجم نصاً قرآنياً ولا حديثاً نبوياً');
  });

  it('forbids adding interpretation or a ruling', async () => {
    expect(await instruction()).toContain('لا تُضف تفسيراً ولا رأياً ولا حكماً');
  });

  it('names no provider in its instruction', async () => {
    expect(await instruction()).not.toMatch(/gemini|google|openai|wikipedia/i);
  });
});

describe('nothing to do', () => {
  it('asks nothing of an empty batch', async () => {
    await expect(toArabic([])).resolves.toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
