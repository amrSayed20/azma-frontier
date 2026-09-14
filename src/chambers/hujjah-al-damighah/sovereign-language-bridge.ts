/**
 * AZMA OS — HUJJAH AL-DAMIGHAH: THE LANGUAGE BRIDGE
 *
 * Two jobs, one provider.
 *
 * 1. Carries an Arabic question across to the sources that only speak English.
 *    Most of the Empire's knowledge repositories — the electronic library
 *    among them — hold nothing in Arabic, so an Arabic question reached them
 *    as a string they could not match and returned nothing at all. The library
 *    was never broken; it was never asked in a language it understands.
 *
 * 2. Composes the Arabic answer from the evidence the investigation gathered.
 *
 * The Creator is never told which repository spoke, in keeping with the
 * Knowledge Source Abstraction Principle: what returns is Sovereign Knowledge,
 * not a citation of some provider's name.
 *
 * Both calls degrade rather than fail. A question that cannot be translated is
 * still asked in its own words; an answer that cannot be composed still leaves
 * the Creator holding the evidence.
 */

const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** The Creator is waiting. A bridge that stalls is worse than one that yields. */
const TRANSLATE_TIMEOUT_MS = 4_000;
const SYNTHESIS_TIMEOUT_MS = 12_000;

function apiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? null;
}

const ARABIC = /[؀-ۿ]/;

export function isArabic(text: string): boolean {
  return ARABIC.test(text);
}

async function askGemini(
  system: string,
  user: string,
  timeoutMs: number,
  maxOutputTokens: number,
  temperature: number,
): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature, maxOutputTokens },
      }),
    });
    if (!response.ok) return null;

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === 'string' && text.trim().length > 0 ? text.trim() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Renders an Arabic question as the English search terms a library catalogue
 * would actually match. Returns null when no bridge is needed or possible, and
 * the caller then searches in the Creator's own words.
 */
export async function toSearchLanguage(query: string): Promise<string | null> {
  if (!isArabic(query)) return null;

  const translated = await askGemini(
    [
      'You convert an Arabic question into English search keywords for a library catalogue.',
      'Reply with the keywords only — no sentence, no punctuation, no explanation, no quotes.',
      'Use the terms a catalogue would index: subject nouns, not question words.',
      'Three to six words.',
    ].join(' '),
    query,
    TRANSLATE_TIMEOUT_MS,
    40,
    0,
  );
  if (!translated) return null;

  // A model that answers instead of translating is worse than no bridge.
  const cleaned = translated.replace(/["'\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length === 0 || cleaned.length > 120 || ARABIC.test(cleaned)) return null;
  return cleaned;
}

export interface SynthesisInput {
  readonly query: string;
  readonly evidenceTexts: readonly string[];
  /** The Creator declared this a religious question. */
  readonly isReligious: boolean;
}

/**
 * Composes the Arabic answer. Under a religious declaration the instruction
 * changes: the Qur'an alone carries authority, and anything outside it is
 * reported with the hedging classical scholarship uses for what it does not
 * vouch for — قيل إن، يقال، ذكر أن.
 */
export async function composeAnswer(input: SynthesisInput): Promise<string | null> {
  if (input.evidenceTexts.length === 0) return null;

  const commonRules = [
    'أنت نظام معرفة سيادي. تُجيب بالعربية الفصحى إجابة واضحة موثوقة مبنية على الأدلة المعطاة.',
    'اكتب ثلاث إلى خمس جمل متماسكة تجيب مباشرة على السؤال.',
    'لا تذكر اسم أي مصدر أو موسوعة أو قاعدة بيانات أو منصة إطلاقاً.',
    'إن كانت الأدلة لا تكفي للإجابة، قل ذلك صراحةً ولا تخترع.',
  ];

  const religiousRules = [
    'هذا سؤال ديني، وله حكم خاص:',
    'المرجع الوحيد ذو الحجية هو القرآن الكريم. ما ثبت فيه يُذكر جزماً.',
    'وما جاء من الإسرائيليات أو أخبار أهل الكتاب أو ما لا تثبت نسبته، يُذكر بصيغة التمريض:',
    '«قيل إن» أو «يقال» أو «ذكر أن» — ولا يُقدَّم أبداً على أنه مقطوع به.',
    'ميّز بوضوح بين ما هو قرآني وما هو منقول، ولا تخلط بينهما.',
    'لا تُفتِ ولا تُرجّح بين المذاهب؛ اعرض ما ثبت وانسب ما سواه لقائله.',
  ];

  const system = [...commonRules, ...(input.isReligious ? religiousRules : [])].join(' ');

  const evidence = input.evidenceTexts
    .slice(0, 5)
    .map((text, i) => `[${i + 1}] ${text}`)
    .join('\n\n');

  return askGemini(
    system,
    `السؤال: ${input.query}\n\nالأدلة:\n${evidence}`,
    SYNTHESIS_TIMEOUT_MS,
    700,
    0.3,
  );
}
