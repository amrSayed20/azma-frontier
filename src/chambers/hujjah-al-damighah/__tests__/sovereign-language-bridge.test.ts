/**
 * The language bridge — the first tests to enter this chamber.
 *
 * What matters here is that the bridge never makes things worse: a question it
 * cannot translate is still asked, an answer it cannot compose still leaves the
 * Creator holding the evidence, and a religious declaration genuinely changes
 * the instruction rather than merely being passed along.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

process.env.GEMINI_API_KEY = 'gemini-test-key-sentinel';

import { toSearchLanguage, composeAnswer, isArabic } from '../sovereign-language-bridge';

function geminiSays(text: string) {
  return {
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  };
}

beforeEach(() => mockFetch.mockReset());

describe('recognising Arabic', () => {
  it('sees Arabic', () => expect(isArabic('ما هي الطاقة الشمسية')).toBe(true));
  it('sees English', () => expect(isArabic('what is solar energy')).toBe(false));
  it('sees Arabic inside a mixed line', () => expect(isArabic('solar طاقة')).toBe(true));
});

describe('carrying a question to the catalogues', () => {
  it('renders an Arabic question as English keywords', async () => {
    mockFetch.mockResolvedValueOnce(geminiSays('solar energy photovoltaic'));
    await expect(toSearchLanguage('ما هي الطاقة الشمسية')).resolves.toBe('solar energy photovoltaic');
  });

  it('does not touch a question already in English', async () => {
    await expect(toSearchLanguage('what is solar energy')).resolves.toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('asks in the Creator’s own words when the bridge is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    await expect(toSearchLanguage('ما هي الطاقة')).resolves.toBeNull();
  });

  it('refuses a reply that came back in Arabic — that is an answer, not a translation', async () => {
    mockFetch.mockResolvedValueOnce(geminiSays('الطاقة الشمسية هي ضوء الشمس'));
    await expect(toSearchLanguage('ما هي الطاقة الشمسية')).resolves.toBeNull();
  });

  it('refuses a reply long enough to be prose rather than keywords', async () => {
    mockFetch.mockResolvedValueOnce(geminiSays('x'.repeat(200)));
    await expect(toSearchLanguage('ما هي الطاقة')).resolves.toBeNull();
  });

  it('strips quotes and line breaks a model tends to add', async () => {
    mockFetch.mockResolvedValueOnce(geminiSays('"solar energy"\n'));
    await expect(toSearchLanguage('ما هي الطاقة')).resolves.toBe('solar energy');
  });

  it('yields rather than stalls when the bridge refuses', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    await expect(toSearchLanguage('ما هي الطاقة')).resolves.toBeNull();
  });
});

describe('composing the answer', () => {
  it('returns the composed Arabic answer', async () => {
    mockFetch.mockResolvedValueOnce(geminiSays('الطاقة الشمسية هي الطاقة المستمدة من ضوء الشمس.'));
    await expect(composeAnswer({
      query: 'ما هي الطاقة الشمسية',
      evidenceTexts: ['solar energy is radiant light from the Sun'],
      isReligious: false,
    })).resolves.toContain('الطاقة الشمسية');
  });

  it('composes nothing when there is no evidence, rather than inventing', async () => {
    await expect(composeAnswer({ query: 'س', evidenceTexts: [], isReligious: false }))
      .resolves.toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('leaves the Creator their evidence when composition fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('timeout'));
    await expect(composeAnswer({ query: 'س', evidenceTexts: ['e'], isReligious: false }))
      .resolves.toBeNull();
  });

  it('never names a repository in its instruction', async () => {
    mockFetch.mockResolvedValueOnce(geminiSays('جواب'));
    await composeAnswer({ query: 'س', evidenceTexts: ['e'], isReligious: false });

    const sent = JSON.parse(mockFetch.mock.calls[0][1].body);
    const instruction = sent.systemInstruction.parts[0].text;
    expect(instruction).toContain('لا تذكر اسم أي مصدر');
    expect(instruction).not.toMatch(/wikipedia|gutenberg|reddit|openlibrary/i);
  });
});

describe('a religious question', () => {
  async function instructionFor(isReligious: boolean): Promise<string> {
    mockFetch.mockResolvedValueOnce(geminiSays('جواب'));
    await composeAnswer({ query: 'س', evidenceTexts: ['e'], isReligious });
    return JSON.parse(mockFetch.mock.calls[0][1].body).systemInstruction.parts[0].text;
  }

  it('names the Qur’an as the only authority', async () => {
    expect(await instructionFor(true)).toContain('القرآن الكريم');
  });

  it('requires the hedging formulae for what is merely narrated', async () => {
    const instruction = await instructionFor(true);
    expect(instruction).toContain('قيل إن');
    expect(instruction).toContain('يقال');
    expect(instruction).toContain('ذكر أن');
    expect(instruction).toContain('الإسرائيليات');
  });

  it('forbids issuing a ruling', async () => {
    expect(await instructionFor(true)).toContain('لا تُفتِ');
  });

  it('carries none of that into an ordinary question', async () => {
    const instruction = await instructionFor(false);
    expect(instruction).not.toContain('القرآن الكريم');
    expect(instruction).not.toContain('الإسرائيليات');
  });
});
