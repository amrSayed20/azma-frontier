/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * Does this passage bear on what the Creator actually asked?
 *
 * ─── WHY COUNTING WORDS WAS NEVER GOING TO BE ENOUGH ────────────────────────
 *
 *   Retrieval finds passages that carry a word. That is all it can do, and it
 *   is the right thing for it to do: thirty-six thousand narrations cannot be
 *   read one by one for every question.
 *
 *   But a word is not a subject. The Founder asked for the story of Yunus ﷺ and
 *   was handed the verse, and then every narration transmitted by a man named
 *   Yunus, and then a Yemeni singer who happens to share the name. Separating
 *   the chain of transmission from what was narrated removed the transmitters.
 *   It does nothing about the singer, and nothing about «مقام النبي دانيال»
 *   arriving as evidence for a question about الصبر.
 *
 *   «يجب أن تكون الحجرة صادقة وتجيب المستخدم من سؤاله أو موضوعه الذي قد حدده
 *    مسبقاً» — and a chamber that hands over ten passages, six of which are
 *    about something else, is not answering the subject. It is answering the
 *    spelling.
 *
 * ─── WHAT THIS DOES ─────────────────────────────────────────────────────────
 *
 *   Retrieval stays as it is and finds candidates. Then the candidates are read
 *   — all of them, in one pass — and each is judged on one question only: does
 *   this bear on the subject asked about? What does not is set aside, and the
 *   Creator is told how many were set aside rather than left to wonder why ten
 *   became four.
 *
 * ─── WHAT IT MUST NOT DO ────────────────────────────────────────────────────
 *
 *   It does not rank, grade, interpret, or rule. It does not decide that a
 *   narration is weak or that a verse does not apply — those are judgements
 *   about standing and meaning, and they belong to the authority policy and to
 *   scholars respectively. It decides only whether a passage is on the subject
 *   at all, which is the question retrieval could not ask.
 *
 *   And it fails open. When it cannot read, everything retrieved is kept: a
 *   Creator holding extra evidence can see for themselves that a passage is off
 *   the subject, while a Creator holding none because a judge was unreachable
 *   has been silently denied what the Empire actually found.
 */

const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** One pass over the candidates. The Creator is waiting. */
const JUDGEMENT_TIMEOUT_MS = 8_000;

/** Beyond this the judgement itself becomes the slow part of the chamber. */
const MAX_CANDIDATES = 12;

/** How many characters of a passage are enough to tell what it is about. */
const PASSAGE_WINDOW = 400;

export interface SubjectCandidate {
  readonly id: string;
  readonly text: string;
  /** True for the Qur'an and the Sunnah — see keepAlways below. */
  readonly keepAlways?: boolean;
}

export interface SubjectVerdict {
  /** Ids that bear on the subject. */
  readonly onSubject: readonly string[];
  /** Ids set aside, and why in one phrase, for the Creator to be told. */
  readonly setAside: readonly { id: string; reasonAr: string }[];
  /** False when nothing could be judged and everything was kept. */
  readonly judged: boolean;
}

function apiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? null;
}

const RULES = [
  'أنت فارزٌ للأدلة، لا مفسّرٌ ولا مفتٍ ولا مُرجِّح.',
  'مهمّتك سؤالٌ واحد عن كل مقطع: هل هو في موضوع سؤال المستخدم أم في موضوع آخر؟',
  'المقطع الذي يذكر الاسم عَرَضاً — كاسم راوٍ في سند، أو شخصٍ آخر يحمل الاسم نفسه، أو مكانٍ سُمّي به — ليس في الموضوع.',
  'المقطع الذي يتناول الموضوع نفسه ولو من طرف — سببه أو أثره أو حكمه أو قصته — فهو في الموضوع.',
  'لا تحكم على صحة المقطع ولا على قوته ولا على درجته، ولا تُرجّح بين مقطعين.',
  'أعد سطراً واحداً لكل مقطع بهذه الصيغة تماماً: الرقم ثم | ثم نعم أو لا ثم | ثم سببٌ من كلمتين إلى أربع.',
  'مثال: 3|لا|اسم راوٍ في السند',
  'ولا تكتب شيئاً غير هذه السطور.',
];

interface Judgement {
  readonly onSubject: boolean;
  readonly reasonAr: string;
}

export function parseJudgements(reply: string, expected: number): (Judgement | null)[] {
  const out: (Judgement | null)[] = new Array(expected).fill(null);
  for (const line of reply.split('\n')) {
    const parts = line.split('|');
    if (parts.length < 2) continue;
    const index = parseInt(parts[0].trim(), 10) - 1;
    if (!(index >= 0 && index < expected)) continue;
    const answer = parts[1].trim();
    const onSubject = answer.startsWith('نعم');
    if (!onSubject && !answer.startsWith('لا')) continue;
    out[index] = {
      onSubject,
      reasonAr: (parts[2] ?? '').trim().slice(0, 60) || 'خارج موضوع السؤال',
    };
  }
  return out;
}

/**
 * Judge which candidates bear on the subject.
 *
 * `keepAlways` candidates are judged like any other and reported like any other,
 * but are never set aside: the Qur'an and the Sunnah are the sources the Founder
 * named for a religious question, and a chamber that quietly dropped a verse
 * because a reader thought it off-topic would be overruling him. Where the
 * judgement says a verse is off-subject, that is recorded and the verse still
 * travels — the Creator can see both.
 */
export async function judgeSubjectRelevance(
  query: string,
  candidates: readonly SubjectCandidate[],
): Promise<SubjectVerdict> {
  const keepEverything: SubjectVerdict = {
    onSubject: candidates.map((c) => c.id),
    setAside: [],
    judged: false,
  };

  const key = apiKey();
  if (!key || candidates.length === 0) return keepEverything;

  const batch = candidates.slice(0, MAX_CANDIDATES);
  const prompt = [
    `سؤال المستخدم: ${query}`,
    '',
    ...batch.map((c, i) => `[${i + 1}] ${c.text.slice(0, PASSAGE_WINDOW)}`),
  ].join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), JUDGEMENT_TIMEOUT_MS);
  let reply: string | null = null;
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: RULES.join(' ') }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 500 },
      }),
    });
    if (response.ok) {
      const data = await response.json() as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === 'string' && text.trim().length > 0) reply = text.trim();
    }
  } catch {
    reply = null;
  } finally {
    clearTimeout(timer);
  }

  // Unreadable, unreachable, or refused: keep everything. A Creator holding an
  // extra passage can see it is off the subject; a Creator holding none because
  // a judge was unreachable has been denied what the Empire actually found.
  if (reply === null) return keepEverything;

  const judgements = parseJudgements(reply, batch.length);
  const onSubject: string[] = [];
  const setAside: { id: string; reasonAr: string }[] = [];

  batch.forEach((candidate, i) => {
    const judgement = judgements[i];
    // No judgement for this one is not a judgement against it.
    if (!judgement || judgement.onSubject || candidate.keepAlways) {
      onSubject.push(candidate.id);
      return;
    }
    setAside.push({ id: candidate.id, reasonAr: judgement.reasonAr });
  });

  // Anything past the batch was never judged, so it is kept.
  for (const overflow of candidates.slice(MAX_CANDIDATES)) onSubject.push(overflow.id);

  // A judgement that sets aside everything is not a judgement, it is a failure
  // wearing one. The Creator gets what was found.
  if (onSubject.length === 0) return keepEverything;

  return { onSubject, setAside, judged: true };
}

/** What the Creator is told about evidence that was set aside. */
export function setAsideNoticeAr(count: number): string {
  if (count <= 0) return '';
  if (count === 1) return 'نُحّي دليلٌ واحد لأنه خارج موضوع سؤالك.';
  if (count === 2) return 'نُحّي دليلان لأنهما خارج موضوع سؤالك.';
  if (count <= 10) return `نُحّيت ${count} أدلة لأنها خارج موضوع سؤالك.`;
  return `نُحّي ${count} دليلاً لأنها خارج موضوع سؤالك.`;
}
