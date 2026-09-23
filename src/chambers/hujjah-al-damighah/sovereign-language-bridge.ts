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

import {
  TranslationRecord,
  TranslationType,
  TranslationStatus,
} from './sources/source-contracts';

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

/**
 * Why the bridge yielded nothing — so a failure can be seen, not guessed.
 *
 * ─── WHAT THIS ENDS ──────────────────────────────────────────────────────────
 *
 *   MEASURED on production 2026-09-23, three independent ways: two deposited
 *   investigations carried no «الجواب المركَّب» line, and a live investigation
 *   showed «الملخص» where «الإجابة» belongs. The composed Arabic answer — the
 *   one thing a Creator is meant to leave an investigation holding — was not
 *   being made, and nothing anywhere said so. Every failure path returned a
 *   bare `null`: no key, a refused request, a timeout, a malformed body. Four
 *   different truths collapsed into silence, and the Chamber went on as if
 *   the answer had simply not been wanted.
 */
export type BridgeFailure =
  | 'NO_KEY'          // the Empire never configured the bridge
  | 'REFUSED'         // the provider answered, and said no
  | 'TIMED_OUT'       // it did not answer in time
  | 'EMPTY'           // it answered with nothing usable
  | 'UNREACHABLE';    // the request never completed

export interface BridgeOutcome {
  readonly text: string | null;
  readonly failure: BridgeFailure | null;
  /** Provider status when it answered — for the record, never for a Creator. */
  readonly httpStatus?: number;
}

async function askGeminiOutcome(
  system: string,
  user: string,
  timeoutMs: number,
  maxOutputTokens: number,
  temperature: number,
): Promise<BridgeOutcome> {
  const key = apiKey();
  if (!key) return { text: null, failure: 'NO_KEY' };

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
    if (!response.ok) return { text: null, failure: 'REFUSED', httpStatus: response.status };

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === 'string' && text.trim().length > 0
      ? { text: text.trim(), failure: null, httpStatus: response.status }
      : { text: null, failure: 'EMPTY', httpStatus: response.status };
  } catch (err) {
    // An abort is the timeout we set; anything else never reached the provider.
    const aborted = err instanceof Error && err.name === 'AbortError';
    return { text: null, failure: aborted ? 'TIMED_OUT' : 'UNREACHABLE' };
  } finally {
    clearTimeout(timer);
  }
}

/** The narrow form, for callers that genuinely have nothing to do with a reason. */
async function askGemini(
  system: string,
  user: string,
  timeoutMs: number,
  maxOutputTokens: number,
  temperature: number,
): Promise<string | null> {
  return (await askGeminiOutcome(system, user, timeoutMs, maxOutputTokens, temperature)).text;
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
  return (await composeAnswerOutcome(input)).text;
}

/**
 * The same composition, and the reason when there is none.
 *
 * The Chamber calls this one: an answer that was not composed is an event the
 * Empire must be able to name — «no key» and «the provider refused» are not
 * the same failure, and neither is «there was no evidence to compose from».
 */
export async function composeAnswerOutcome(input: SynthesisInput): Promise<BridgeOutcome> {
  if (input.evidenceTexts.length === 0) return { text: null, failure: 'EMPTY' };

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

  return askGeminiOutcome(
    system,
    `السؤال: ${input.query}\n\nالأدلة:\n${evidence}`,
    SYNTHESIS_TIMEOUT_MS,
    700,
    0.3,
  );
}

// ─── CARRYING THE SOURCES' ANSWERS BACK ──────────────────────────────────────

/**
 * The bridge used to run one way only.
 *
 * The Creator's question was carried out to catalogues that index English, and
 * what those catalogues returned was displayed exactly as it arrived. A Creator
 * asking «قصة أصحاب الكهف» was shown `Media Topic: Seven Sleepers` — and the
 * chamber speaks, so a passage like that is not merely awkward to read past: it
 * is read aloud, in a language the Creator did not ask in.
 *
 * The Founder's rule is therefore absolute — «ولا يعرض النص باللغة الإنجليزية
 * وكذلك لا ينطق فالحجرة ناطقة» — and translation belongs in the evidence path
 * rather than at the moment of display, because the same text must be Arabic
 * for the eye and for the voice.
 *
 * Against that stands the Founder's other rule, that an answer must not take
 * long. So the passages cross together in a single call under one deadline, and
 * when that deadline passes a passage is **withheld rather than shown in
 * English**. The language rule is an identity; the speed rule is a comfort. A
 * withheld passage costs the Creator one piece of evidence. A passage shown in
 * English costs the chamber its voice.
 */

/** Everything crosses together, once. Measured against the chamber's own 5s. */
const TRANSLATION_TIMEOUT_MS = 6_000;

/** More than this in one call and the model starts dropping passages. */
const MAX_PASSAGES_PER_CALL = 8;

const PASSAGE_OPEN = '<<<';
const PASSAGE_CLOSE = '>>>';

/** A passage already in Arabic needs no crossing and is declared as original. */
function asOriginal(text: string): TranslationRecord {
  return {
    originalLanguage: 'ar',
    originalText: text,
    translatedLanguage: 'ar',
    translationText: text,
    translationType: TranslationType.ORIGINAL,
    translationStatus: TranslationStatus.NOT_REQUIRED,
    translationConfidence: null,
    translationWarnings: [],
  };
}

/** A passage that could not cross. It is withheld, never shown as it was. */
function asWithheld(text: string, reason: string): TranslationRecord {
  return {
    originalLanguage: 'en',
    originalText: text,
    translatedLanguage: 'ar',
    translationText: null,
    translationType: TranslationType.MACHINE_TRANSLATION,
    translationStatus: TranslationStatus.WITHHELD,
    translationConfidence: null,
    translationWarnings: [reason],
  };
}

const TRANSLATION_RULES = [
  'أنت ناقلٌ أمين بين لسانين، ولستَ مفسّراً ولا شارحاً ولا مرجعاً في دين.',
  'انقل كل مقطع إلى عربية فصيحة سليمة، تنقل المعنى كما هو دون زيادة ولا نقص.',
  'أبقِ أسماء الأعلام والأماكن والمصطلحات الطبية والعلمية كما هي، وأضف الأصل بين قوسين إن كان المصطلح دقيقاً.',
  'لا تُترجم نصاً قرآنياً ولا حديثاً نبوياً ولا تتصرف فيهما بحال — إن ورد شيء من ذلك فانقله كما هو.',
  'لا تُضف تفسيراً ولا رأياً ولا حكماً.',
  'لا تحذف مقطعاً ولا تدمج مقطعين.',
  `أعِد كل مقطع مسبوقاً بعلامته هكذا: ${PASSAGE_OPEN}رقم${PASSAGE_CLOSE} ثم النص المترجم.`,
  'ولا تكتب شيئاً غير ذلك.',
];

function parsePassages(reply: string, expected: number): (string | null)[] {
  const out: (string | null)[] = new Array(expected).fill(null);
  const pattern = new RegExp(`${PASSAGE_OPEN}\\s*(\\d+)\\s*${PASSAGE_CLOSE}([\\s\\S]*?)(?=${PASSAGE_OPEN}|$)`, 'g');
  for (const m of reply.matchAll(pattern)) {
    const index = parseInt(m[1], 10) - 1;
    const text = m[2].trim();
    if (index >= 0 && index < expected && text.length > 0) out[index] = text;
  }
  return out;
}

/**
 * Carries a batch of passages into Arabic, preserving each original.
 *
 * Every returned record holds the original text whatever happened, so the
 * reference survives and the Creator can be shown the source beside the
 * rendering. `translationConfidence` is null in every record this function
 * produces: nothing here computes a defensible number, and the Founder's rule
 * is that an uncomputed confidence is declared, never invented.
 */
export async function toArabic(passages: readonly string[]): Promise<TranslationRecord[]> {
  if (passages.length === 0) return [];

  const records: TranslationRecord[] = passages.map((p) =>
    isArabic(p) ? asOriginal(p) : asWithheld(p, 'لم تُطلب الترجمة بعد'),
  );

  const pending: { index: number; text: string }[] = [];
  passages.forEach((text, index) => {
    if (!isArabic(text)) pending.push({ index, text });
  });
  if (pending.length === 0) return records;

  const batch = pending.slice(0, MAX_PASSAGES_PER_CALL);
  for (const { index } of pending.slice(MAX_PASSAGES_PER_CALL)) {
    records[index] = asWithheld(passages[index], 'تجاوز عدد المقاطع حدّ النقل الواحد');
  }

  const prompt = batch
    .map((p, i) => `${PASSAGE_OPEN}${i + 1}${PASSAGE_CLOSE}\n${p.text}`)
    .join('\n\n');

  const reply = await askGemini(
    TRANSLATION_RULES.join(' '),
    prompt,
    TRANSLATION_TIMEOUT_MS,
    2_000,
    0.1,
  );

  if (reply === null) {
    for (const { index } of batch) {
      records[index] = asWithheld(passages[index], 'تعذّر النقل إلى العربية');
    }
    return records;
  }

  const parsed = parsePassages(reply, batch.length);
  batch.forEach((p, i) => {
    const arabic = parsed[i];
    records[p.index] = arabic
      ? {
          originalLanguage: 'en',
          originalText: p.text,
          translatedLanguage: 'ar',
          translationText: arabic,
          translationType: TranslationType.MACHINE_TRANSLATION,
          translationStatus: TranslationStatus.TRANSLATED,
          // Nothing here measures how faithful the crossing was, so nothing
          // here claims to. The Creator is told it was not computed.
          translationConfidence: null,
          translationWarnings: [],
        }
      : asWithheld(p.text, 'لم يعد النقل بهذا المقطع');
  });

  return records;
}

/**
 * The text a Creator may be shown — and, because the chamber speaks, the text
 * it may say aloud. Null when the passage could not cross, and null means the
 * passage is not displayed at all rather than displayed in its own tongue.
 */
export function displayableText(record: TranslationRecord): string | null {
  return record.translationStatus === TranslationStatus.WITHHELD
    ? null
    : record.translationText;
}
