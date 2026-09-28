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

/**
 * Composing a storyboard is a deliberate act with a waiting state on screen,
 * so it is allowed the room a translation is not. MEASURED 2026-09-28: at
 * 1,200 tokens the provider answered 200 and carried no text at all, with
 * nothing left for the scenes; the allowance was spent before the first
 * visible word. A cap costs nothing until it is used.
 */
const STRUCTURE_TIMEOUT_MS = 30_000;
const STRUCTURE_MAX_TOKENS = 8_192;

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
  | 'EXHAUSTED'       // it began an answer and ran out of allowance mid-way
  | 'EMPTY'           // it answered with nothing usable
  | 'UNREACHABLE';    // the request never completed

export interface BridgeOutcome {
  readonly text: string | null;
  readonly failure: BridgeFailure | null;
  /** Provider status when it answered — for the record, never for a Creator. */
  readonly httpStatus?: number;
}

/**
 * Statuses the provider itself asks us to come back from.
 *
 * MEASURED from the server 2026-09-23: the configured model answered 200 on
 * two consecutive direct calls, while the Chamber's own call the same minute
 * was refused 503 — «This model is currently experiencing high demand. Spikes
 * in demand are usually temporary. Please try again later.» The provider
 * asked to be retried and the Chamber did not; one spike cost the Creator the
 * whole answer. 429 is here for the same reason.
 */
const RETRYABLE = new Set([429, 503]);
const RETRY_BACKOFF_MS = [400, 1_200];

async function askGeminiOutcome(
  system: string,
  user: string,
  timeoutMs: number,
  maxOutputTokens: number,
  temperature: number,
): Promise<BridgeOutcome> {
  let last: BridgeOutcome = { text: null, failure: 'UNREACHABLE' };
  for (let attempt = 0; attempt <= RETRY_BACKOFF_MS.length; attempt += 1) {
    last = await askGeminiOnce(system, user, timeoutMs, maxOutputTokens, temperature);
    if (last.text !== null) return last;
    // A missing key and an empty answer do not improve by asking again.
    if (last.failure !== 'REFUSED' || last.httpStatus === undefined || !RETRYABLE.has(last.httpStatus)) return last;
    if (attempt < RETRY_BACKOFF_MS.length) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS[attempt]));
    }
  }
  return last;
}

async function askGeminiOnce(
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
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    };
    const candidate = data.candidates?.[0];
    // Every part, not only the first: a model that returns its answer in two
    // parts had the whole answer thrown away by reading `parts[0]` alone.
    const text = (candidate?.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .join('')
      .trim();
    if (text.length > 0) return { text, failure: null, httpStatus: response.status };

    // ─── AN ANSWER THAT DID NOT FIT ──────────────────────────────────────
    //   MEASURED on production 2026-09-28, pressing «✦ أنشئ المشاهد» by hand
    //   with three unrelated ideas — Arabic and English alike: the provider
    //   answered 200 every time and carried no text, and the Chamber told the
    //   Creator «لم يعد من التفكيك شيء. أعد المحاولة» — a sentence that sends
    //   them to press the same button forever. An allowance spent before the
    //   first visible word is not an empty answer; it is an answer that did
    //   not fit, and the two are not repaired by the same act.
    const exhausted = candidate?.finishReason === 'MAX_TOKENS';
    return {
      text: null,
      failure: exhausted ? 'EXHAUSTED' : 'EMPTY',
      httpStatus: response.status,
    };
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

  const outcome = await askGeminiOutcome(
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

  // ─── WHY THIS FAILURE IS NOW SPOKEN ──────────────────────────────────────
  //
  //   MEASURED on production 2026-09-24, in the server's own log: one
  //   investigation reached the library as «Seven Sleepers Ephesus religious
  //   history», and the next reached it as «أثر العدل استقرار المجتمعات» —
  //   an Arabic string sent to a catalogue that indexes only English, which
  //   can answer nothing. The bridge had failed, said nothing, and the
  //   library was blamed for the silence that followed.
  //
  //   Four different things end here and they are not one event: the provider
  //   refused, it timed out, it answered with nothing, or it answered in
  //   Arabic instead of translating. The Empire records which.
  const translated = outcome.text;
  if (!translated) {
    console.error('[Hujjah] question not bridged:', JSON.stringify({
      failure: outcome.failure, httpStatus: outcome.httpStatus,
    }));
    return null;
  }

  // A model that answers instead of translating is worse than no bridge.
  const cleaned = translated.replace(/["'\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length === 0 || cleaned.length > 120 || ARABIC.test(cleaned)) {
    console.error('[Hujjah] question not bridged:', JSON.stringify({
      failure: 'NOT_A_RENDERING',
      length: cleaned.length,
      stillArabic: ARABIC.test(cleaned),
    }));
    return null;
  }
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

// ─── THE CREATION DEMAND ─────────────────────────────────────────────────────

/**
 * Where a demand is addressed. A demand is written FOR a Chamber, in the terms
 * that Chamber can actually act on — a scene is not a production arc, and
 * neither is an objective. One object, three shapes, because the Chambers are
 * genuinely different and a single generic brief would be useful to none.
 */
export type DemandDestination = 'qiyamah-chamber' | 'ras-amr' | 'makman-al-ghayah';

export interface DemandInput {
  readonly query: string;
  readonly answerAr: string | undefined;
  readonly evidenceTexts: readonly string[];
  readonly destination: DemandDestination;
}

/**
 * What each Chamber is handed, said in the terms it already works in.
 *
 * Qiyamah takes an idea and expands it into a scene, so its demand is what to
 * depict. Ras Al Amr takes a free-text `intent` and plans a production from it,
 * so its demand is the arc. Makman registers goals against the Sovereign
 * Purpose, so its demand is an objective with what would evidence it.
 */
const DEMAND_INSTRUCTION: Record<DemandDestination, string> = {
  'qiyamah-chamber':
    'اكتب مطالبةً بصريّة: مشهدٌ واحد يُجسِّد ما خلص إليه التحقيق. صِف ما يُرى — المكان والعناصر والضوء والإحساس — في ثلاث إلى خمس جمل. '
    + 'لا تكتب عناوين ولا قوائم ولا تعليمات تقنيّة، بل وصفاً يقرؤه فنّانٌ فيرسمه.',
  'ras-amr':
    'اكتب مطالبةً إخراجيّة: كيف يُبنى عملٌ مرئيّ يحمل ما خلص إليه التحقيق. اذكر المفتتح، ثم التصاعد، ثم الذروة، ثم الخاتمة — '
    + 'في ثلاث إلى خمس جمل متّصلة، بصيغة نيّةٍ إخراجيّة لا قائمة لقطات.',
  'makman-al-ghayah':
    'اكتب مطالبةً غائيّة: ما الهدف الذي تستدعيه نتيجة هذا التحقيق، وما الذي يُثبت تحقّقه. '
    + 'جملتان إلى أربع: الهدف أوّلاً، ثم ما يُرصَد ليُعرف أنّه تحقّق.',
};

/**
 * Compose the Creation Demand a Creator leaves an investigation carrying.
 *
 * ─── THE BOUNDARY THIS RESPECTS ──────────────────────────────────────────────
 *
 *   The Chamber of Evidence investigates; it does not create. A demand is not
 *   creation — it is the statement of what should be created, grounded in what
 *   was actually found. So the instruction below forbids inventing: the demand
 *   may only build on the question, the composed answer and the evidence that
 *   this investigation produced. Nothing is added that the investigation did
 *   not establish.
 */
export async function composeCreationDemand(input: DemandInput): Promise<BridgeOutcome> {
  if (input.evidenceTexts.length === 0 && !input.answerAr) {
    return { text: null, failure: 'EMPTY' };
  }

  const system = [
    'أنت نظام معرفة سيادي يُحوِّل نتيجة تحقيقٍ إلى مطالبةٍ إنشائيّة.',
    'المطالبة تصف ما ينبغي إنشاؤه، ولا تُنشئه.',
    'ابنِ فقط على السؤال والجواب والأدلّة المعطاة. لا تُضف واقعةً لم ترد فيها، ولا تخترع رقماً ولا اسماً.',
    'اكتب بالعربيّة الفصحى، نصّاً متّصلاً بلا عناوين ولا ترقيم ولا رموز.',
    'لا تذكر اسم أيّ مصدر أو موسوعة أو قاعدة بيانات أو منصّة إطلاقاً.',
    DEMAND_INSTRUCTION[input.destination],
  ].join(' ');

  const evidence = input.evidenceTexts.slice(0, 4).map((t, i) => `[${i + 1}] ${t}`).join('\n\n');
  const user = [
    `السؤال: ${input.query}`,
    input.answerAr ? `\nالجواب المركَّب:\n${input.answerAr}` : '',
    evidence ? `\nالأدلّة:\n${evidence}` : '',
  ].join('\n');

  return askGeminiOutcome(system, user, SYNTHESIS_TIMEOUT_MS, 600, 0.4);
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

// ─── THE SCENE STRUCTURE ─────────────────────────────────────────────────────

/** One scene of a storyboard: what is seen, and what is said over it. */
export interface ComposedScene {
  readonly seenAr: string;
  readonly saidAr: string;
  /**
   * The same picture, phrased so a stock library can be asked for it.
   *
   * MEASURED 2026-09-25 by watching the first real storyboard film: over
   * narration about أصحاب الكهف the production showed a priest holding
   * a crucifix. The Chamber had written what the scene should show and the
   * production was never given it, so the picture was inferred from the words
   * by a library that knows nothing of this Empire's world.
   *
   * It is machinery and never reaches a Creator: not rendered, not spoken, not
   * returned. `seenAr` is the half that is theirs.
   */
  readonly searchEn: string | null;
  /**
   * Where this scene's picture comes from, decided by whoever wrote the scene.
   *
   * MEASURED 2026-09-25: the production workshop holds no generator — it
   * searches a stock library. So a scene describing something that does not
   * exist in the world can never be found, however well the search is
   * phrased, and no amount of production skill fixes it. The only party that
   * knows which case a scene is, is the one that decided what it shows.
   *
   * 'stock'    — it exists and can be found: a place, weather, light, a hand
   *              at work.
   * 'generate' — it exists nowhere: a particular product, a brand, an
   *              imagined scene, a thing not yet made.
   */
  readonly sourcing: 'stock' | 'generate';
  /**
   * What to create, when `sourcing` is 'generate'. Written by the same hand
   * that wrote what is seen, because that hand is the one that knows. Null
   * for a stock scene, which needs no demand.
   */
  readonly creationDemandAr: string | null;
}

export interface SceneStructureOutcome {
  readonly scenes: readonly ComposedScene[];
  readonly failure: BridgeFailure | 'NOT_A_STRUCTURE' | null;
  readonly httpStatus?: number;
}

/**
 * Break a finished investigation into an ordered sequence of scenes.
 *
 * ─── THE RULING THIS IMPLEMENTS ──────────────────────────────────────────────
 *
 *   «تفكيك الموضوع إلى مشاهد مطالبةٌ تكتبها الحُجّة الدامغة، ويُنتَج ويُجمَّع
 *   في رأس الأمر» — the Founder, 2026-09-25.
 *
 *   The registry recorded this exact gap against this Chamber: «Story
 *   structures — breaking a subject into ordered scenes.» It was deferred
 *   because nothing in the repository decomposed a subject. This does, and
 *   it stops there: the Chamber of Evidence states the sequence and does not
 *   produce a frame of it. Production and assembly are Ras Al Amr's, which is
 *   the line the storyboard_scenes row is already drawn along.
 *
 *   Order is the whole point — an unordered list is not a storyboard — so the
 *   scenes are returned in the sequence the model gave them and stored with
 *   an explicit scene_order the Creator controls afterwards.
 *
 *   Grounded only in what the investigation established. A storyboard that
 *   invents an episode is a storyboard about something that did not happen.
 */
export async function composeSceneStructure(input: {
  readonly query: string;
  readonly answerAr: string | undefined;
  readonly evidenceTexts: readonly string[];
  /** Three to seven; the Chamber keeps it within what a Creator can hold. */
  readonly sceneCount?: number;
  /**
   * What the scenes are built out of, which decides what the composition is
   * forbidden to do.
   *
   *   'evidence'       — a finished investigation. Inventing an episode here
   *                      would be a storyboard about something that did not
   *                      happen, so nothing may be added.
   *   'creative-brief' — the Creator's own idea and specifications. Invention
   *                      is the entire point — it is their work, not a claim
   *                      about the world — and the evidence rule would
   *                      cripple it. What still binds is their own
   *                      specification, which the composition serves.
   *
   * There is one scene composition in this Empire and this is it. A second
   * function would be a second authority on what a scene is.
   */
  readonly source?: 'evidence' | 'creative-brief';
}): Promise<SceneStructureOutcome> {
  if (input.evidenceTexts.length === 0 && !input.answerAr) {
    return { scenes: [], failure: 'EMPTY' };
  }
  const count = Math.max(3, Math.min(7, input.sceneCount ?? 5));
  const fromBrief = input.source === 'creative-brief';

  const system = [
    fromBrief
      ? 'أنت نظام إخراج سيادي يُفكّك فكرة المُنشئ إلى مشاهد مرتّبة قابلة للإنتاج.'
      : 'أنت نظام معرفة سيادي يُفكّك نتيجة تحقيقٍ إلى مشاهد مرتّبة.',
    `اكتب ${count} مشاهد بالضبط، بالترتيب الذي تُروى به.`,
    'كلّ مشهد سطران اثنان لا غير، بهذه الصيغة حرفيّاً:',
    'مشهد: <ما يُرى — المكان والعناصر والضوء والحركة>',
    'قول: <ما يُقال فوق المشهد، جملة أو جملتان>',
    'بحث: <ثلاث إلى خمس كلمات إنجليزية تصف المنظر الطبيعيّ أو المادّيّ وحده>',
    'سطر «بحث» للآلة وحدها ولن يراه أحد، فاكتبه بالإنجليزية.',
    'في سطر «بحث» صف مكاناً أو ضوءاً أو طبيعةً أو عمارةً فقط؛ ولا تذكر فيه شعائرَ دينٍ ولا رموزه ولا رجالَ دين، لا من هذا الدين ولا من غيره.',
    'مصدر: <مخزون أو توليد>',
    'اكتب «مخزون» إذا كان ما يُرى موجوداً في الدنيا ويُمكن تصويره: مكان، طبيعة، ضوء، يدٌ تعمل.',
    'واكتب «توليد» إذا كان ما يُرى لا وجود له في أيّ مكتبة: منتجٌ بعينه، علامةٌ، مشهدٌ متخيّل، شيءٌ لم يُصنَع بعد.',
    'مطالبة: <تُكتب فقط مع «توليد» — وصفٌ دقيق بالعربيّة للصورة المطلوب إنشاؤها>',
    'افصل بين كلّ مشهدٍ والذي يليه بسطرٍ فارغ.',
    fromBrief
      ? 'ابنِ على فكرة المُنشئ ومواصفاته المكتوبة. التزم بمواصفاته حرفيّاً ولا تخالفها، وما سكت عنه فأتمِمه بما يخدم فكرته.'
      :'ابنِ فقط على السؤال والجواب والأدلّة المعطاة. لا تُضف واقعةً لم ترد فيها، ولا تخترع اسماً ولا رقماً.',
    'لا تكتب عناوين ولا ترقيماً ولا رموزاً ولا شرحاً خارج الصيغة.',
    'لا تذكر اسم أيّ مصدر أو موسوعة أو قاعدة بيانات أو منصّة إطلاقاً.',
  ].join(' ');

  const evidence = input.evidenceTexts.slice(0, 5).map((t, i) => `[${i + 1}] ${t}`).join('\n\n');
  const user = fromBrief
    ? [
        `فكرة المُنشئ: ${input.query}`,
        input.answerAr
          ? `\nالمواصفات التي طلبها:\n${input.answerAr}`
          : '',
      ].join('\n')
    : [
        `السؤال: ${input.query}`,
        input.answerAr ? `\nالجواب المركَّب:\n${input.answerAr}` : '',
        evidence ? `\nالأدلّة:\n${evidence}` : '',
      ].join('\n');

  const outcome = await askGeminiOutcome(system, user, STRUCTURE_TIMEOUT_MS, STRUCTURE_MAX_TOKENS, 0.45);
  if (!outcome.text) {
    return { scenes: [], failure: outcome.failure, httpStatus: outcome.httpStatus };
  }

  const scenes = parseScenes(outcome.text);
  if (scenes.length === 0) {
    // A model that answered instead of structuring is worse than no structure.
    return { scenes: [], failure: 'NOT_A_STRUCTURE', httpStatus: outcome.httpStatus };
  }
  return { scenes, failure: null, httpStatus: outcome.httpStatus };
}

/**
 * Read the scenes back out of the composed text.
 *
 * A scene needs both halves. One without a «قول» is a picture with nobody
 * speaking over it, and one without a «مشهد» is a line with nothing to show —
 * neither is a scene, and both are dropped rather than padded into one.
 */
function parseScenes(text: string): ComposedScene[] {
  const scenes: ComposedScene[] = [];
  let seenAr: string | null = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/^[\s*\-–—•\d.)]+/, '').trim();
    if (line.length === 0) continue;

    const seen = /^مشهد\s*[:：]\s*(.+)$/.exec(line);
    if (seen) { seenAr = seen[1].trim(); continue; }

    const said = /^قول\s*[:：]\s*(.+)$/.exec(line);
    if (said && seenAr && seenAr.length > 0) {
      // A scene is stock until its author says otherwise. The picture that
      // can be found is the safe default; the one that must be made costs
      // the Creator, and nothing should spend that on their behalf.
      scenes.push({ seenAr, saidAr: said[1].trim(), searchEn: null, sourcing: 'stock', creationDemandAr: null });
      seenAr = null;
      continue;
    }

    // The search line follows the scene it belongs to, and is optional: a
    // scene without one is still a scene, and the production falls back to
    // deriving a picture as it did before — degraded, never broken.
    const search = /^بحث\s*[:：]\s*(.+)$/.exec(line);
    if (search && scenes.length > 0) {
      const term = search[1].trim();
      // Latin only, and short. Anything else is not a stock query, and a line
      // that came back in Arabic would search a library that cannot read it.
      if (/^[ -~]{3,80}$/.test(term) && /[A-Za-z]/.test(term)) {
        const last = scenes[scenes.length - 1];
        scenes[scenes.length - 1] = { ...last, searchEn: term };
      }
    }
    // «مصدر» — the author's decision about where this picture comes from.
    const sourced = /^مصدر\s*[:：]\s*(.+)$/.exec(line);
    if (sourced && scenes.length > 0) {
      const want = sourced[1].trim();
      if (/توليد/.test(want)) {
        const last = scenes[scenes.length - 1];
        scenes[scenes.length - 1] = { ...last, sourcing: 'generate' };
      }
      continue;
    }

    // «مطالبة» — what to create, and only meaningful for a generated scene.
    // A demand attached to a stock scene is dropped rather than obeyed: it
    // would spend the Creator's generation on a picture that can be found.
    const demanded = /^مطالبة\s*[:：]\s*(.+)$/.exec(line);
    if (demanded && scenes.length > 0) {
      const last = scenes[scenes.length - 1];
      const text = demanded[1].trim();
      if (last.sourcing === 'generate' && text.length >= 8) {
        scenes[scenes.length - 1] = { ...last, creationDemandAr: text };
      }
    }
  }

  // A scene that claims it must be generated and then says nothing about what
  // is a claim without its evidence. It falls back to stock, which is at least
  // something a search can act on — rather than being commissioned with an
  // empty demand, which would spend the Creator's generation on nothing.
  return scenes.map((scene) =>
    scene.sourcing === 'generate' && !scene.creationDemandAr
      ? { ...scene, sourcing: 'stock' as const }
      : scene,
  );
}
