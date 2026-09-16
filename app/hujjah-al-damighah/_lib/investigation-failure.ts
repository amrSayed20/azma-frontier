/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * What the Creator is told when an investigation cannot be completed.
 *
 * ─── MEASURED, IN THE SHIPPED CHAMBER ───────────────────────────────────────
 *
 *   The failure channel returned machine text straight to the screen. The
 *   Creator-facing surface prints it unaltered:
 *
 *       <p>{result.error ?? 'المستودعات المعرفية لا تستجيب.'}</p>
 *
 *   and what reached it was, verbatim:
 *
 *       AUTH_REQUIRED
 *       Query rejected at the reception boundary.
 *       Error: [SovereignLibraryProvider] Cannot read 'book-1513': HTTP 403
 *
 *   The last of those breaks the founding rule twice in one line. It names the
 *   repository that was asked, and it prints the identifier the machine files
 *   the work under. «المستخدم يرى الدليل والحجة ولا يرى المصدر.» A Creator who
 *   asked about the story of Yunus was one failed request away from reading the
 *   name of a provider and the shelf number of a book.
 *
 *   The first two are not source leaks but they are the same disease: an
 *   Arabic-speaking Creator handed a constant meant for a switch statement, and
 *   the internal name of a pipeline stage they have no reason to know exists.
 *
 * ─── THE RULE THIS FILE ENFORCES ────────────────────────────────────────────
 *
 *   No text crosses to the Creator that the chamber did not write FOR them.
 *   A failure is named here, in their tongue, from a closed set. An exception's
 *   own words never travel — they are written to the Empire's log, where the
 *   engineer who needs the provider's name can read it and the Creator cannot.
 *
 *   The vocabulary is closed on purpose. A new way to fail must be named here
 *   before it can be shown, which is what stops the next raw string from
 *   reaching the screen the way this one did.
 */

/** The ways an investigation can fail to reach the Creator. */
export enum InvestigationFailure {
  /** No session. The Creator must enter before the chamber will search. */
  NOT_ADMITTED = 'NOT_ADMITTED',
  /** The question did not pass the chamber's entry boundary. */
  QUESTION_NOT_ACCEPTED = 'QUESTION_NOT_ACCEPTED',
  /** The question was received but could not be read as a question. */
  QUESTION_NOT_UNDERSTOOD = 'QUESTION_NOT_UNDERSTOOD',
  /** The search ran and the repositories returned nothing usable. */
  NOTHING_FOUND = 'NOTHING_FOUND',
  /** Something broke. The Creator is told that, and nothing about what. */
  CHAMBER_FAULT = 'CHAMBER_FAULT',
}

/**
 * What the Creator reads. Written to them, not about the machine.
 *
 * Each says what happened and what they may do next. None names a repository,
 * a provider, a document, a stage of the pipeline, or an HTTP status.
 */
const SPOKEN_AR: Readonly<Record<InvestigationFailure, string>> = {
  [InvestigationFailure.NOT_ADMITTED]:
    'لم تدخل الحجرة بعد. سجّل دخولك ثم أعد سؤالك، ويبقى نصّه كما كتبته.',
  [InvestigationFailure.QUESTION_NOT_ACCEPTED]:
    'لم تُقبل هذه الصياغة عند باب الحجرة. أعد كتابة سؤالك جملةً واضحة، وحدّد المجال الذي تسأل فيه.',
  [InvestigationFailure.QUESTION_NOT_UNDERSTOOD]:
    'وصل سؤالك ولم يتبيّن للحجرة موضوعه. سمِّ ما تسأل عنه باسمه، فالحجرة تبحث في الموضوع لا في الألفاظ.',
  [InvestigationFailure.NOTHING_FOUND]:
    'بحثت الحجرة ولم تجد في هذا الموضوع دليلاً تطمئنّ إلى عرضه. ولا تُقدَّم لك حجّةٌ بلا دليل.',
  [InvestigationFailure.CHAMBER_FAULT]:
    'تعذّر إتمام البحث لخللٍ في الحجرة، لا في سؤالك. أعد المحاولة، وقد سُجّل الخلل عندنا.',
};

/** The Creator's words for a failure. */
export function failureSpokenAr(failure: InvestigationFailure): string {
  return SPOKEN_AR[failure];
}

/**
 * Whether a string is one of the machine's own — a constant, a stage name, or
 * an exception carrying a provider's name or a document's identifier.
 *
 * Used by the chamber's tests to hold the boundary: every one of these was on
 * the Creator's screen before this file existed.
 *
 * Scoped to the failure channel, and nowhere else. It treats any English as
 * machine text, which is true of a message the chamber writes and false of a
 * citation: a medical paper's journal is named in English by its publisher, and
 * the Founder's medical decision requires that journal be recorded. Pointing
 * this at an attribution would strip the evidence to protect the plumbing.
 */
export function isMachineText(text: string): boolean {
  return (
    /[A-Za-z]{3}/.test(text) ||        // any English at all, in an Arabic chamber
    /\[[A-Za-z]+\]/.test(text) ||      // [SovereignLibraryProvider]
    /\b[A-Z][A-Z_]{3,}\b/.test(text) ||// AUTH_REQUIRED
    /HTTP\s*\d{3}/.test(text) ||       // HTTP 403
    /'[a-z]+-\d+'/.test(text)          // 'book-1513'
  );
}
