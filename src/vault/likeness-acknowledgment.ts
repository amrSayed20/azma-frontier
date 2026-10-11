/**
 * AZMA OS — THE CREATOR'S OWN DECLARATION ABOUT A LIKENESS  (§2)
 *
 * ─── WHAT THIS IS, SAID BEFORE ANYTHING ELSE ────────────────────────────────
 *
 *   It is the CREATOR'S declaration. It is not, and must never be described
 *   as, the Empire verifying that the person depicted consented. The Empire
 *   cannot observe consent; it can observe only that a Creator was shown a
 *   plain statement and affirmed it, and it records exactly that.
 *
 *   The previous three reports blocked face swap because no likeness policy
 *   existed. This does not create one by implication: it creates the SAFEGUARD
 *   the Chief Architect ordered, and the Architect's own policy ruling remains
 *   his to make. What changes is that the operation can no longer be reached
 *   without the Creator having said, in their own language and by their own
 *   deliberate act, that they hold the rights.
 *
 * ─── AND IT IS NOT A CHECKBOX THE SCREEN CAN PRE-TICK ───────────────────────
 *
 *   The acknowledgment is a value the BROWSER must send, bound to the specific
 *   request, and the server refuses without it. A UI that pre-checked it would
 *   be forging a declaration on a Creator's behalf, so the default is absent
 *   and a test holds that.
 *
 *   It also cannot be bypassed by a direct API call: the gate lives in the
 *   runner, below the route, so every path — a browser, a script, a future
 *   route somebody forgets to guard — passes it.
 */

/**
 * The policy text's own version.
 *
 * Recorded with every acknowledgment so a declaration can always be read back
 * against the exact words the Creator was shown. Change the words, change this
 * — an acknowledgment of unknown wording is not evidence of anything.
 */
export const LIKENESS_POLICY_VERSION = 'likeness-v1-2026-10-11' as const;

/**
 * What the Creator reads, in their own language.
 *
 * Four sentences, each carrying one of the four things §2 requires be said.
 * No sentence claims the Empire checked anything.
 */
export const LIKENESS_ACKNOWLEDGMENT_AR = {
  heading: 'إقرارٌ قبل تبديل الوجه',
  /** 1 · they confirm they hold the rights and the authorization. */
  rights:
    'أُقِرّ بأنّني أملك الحقوقَ والأذونَ اللازمةَ لاستخدام الوجه المصدر وللمادّة التي '
    + 'أرفعها، وأنّ استخدامي لهما مُصرَّحٌ به.',
  /** 2 · they are responsible for the truth of it and for the use. */
  responsibility:
    'وأتحمّل وحدي مسؤوليّةَ صدقِ هذا الإقرار، ومسؤوليّةَ أن يكون استخدامي المقصودُ '
    + 'مأذوناً به.',
  /** 3 · possession is not consent. */
  possessionIsNotConsent:
    'وأعلم أنّ امتلاكي صورةً أو مقطعاً ليس في ذاته موافقةً من الشخص الظاهر فيه.',
  /** 4 · AZMA is not verifying; this is the Creator's declaration. */
  azmaDoesNotVerify:
    'وأعلم أنّ هذا الإقرارَ إقراري أنا، وأنّ أزما لا تَتحقّق نيابةً عنّي من موافقة '
    + 'الشخص الظاهر، ولا يُعدّ قبولُها هنا دليلاً على تلك الموافقة.',
  /** The affirmative control's own label. Never pre-selected. */
  affirmLabel: 'أُقِرّ بما تَقدّم',
  /** Shown when a request arrives without it. */
  refusedAr:
    'لم يُسجَّل إقرارُك بحقوق الوجه المصدر. تبديلُ الوجه لا يَبدأ قبل إقرارٍ صريحٍ '
    + 'منك — ولن نُقِرّ نيابةً عنك.',
} as const;

/** The four statements, in the order they are shown. For a UI and for a test. */
export const LIKENESS_STATEMENTS_AR: readonly string[] = [
  LIKENESS_ACKNOWLEDGMENT_AR.rights,
  LIKENESS_ACKNOWLEDGMENT_AR.responsibility,
  LIKENESS_ACKNOWLEDGMENT_AR.possessionIsNotConsent,
  LIKENESS_ACKNOWLEDGMENT_AR.azmaDoesNotVerify,
];

/**
 * What a browser must send with a face-swap request.
 *
 * `acknowledgedVersion` must equal the version the server holds: a declaration
 * made against older wording is not a declaration against these words, and
 * silently accepting it would let a policy change erase what was agreed.
 */
export interface LikenessAcknowledgment {
  readonly acknowledged: true;
  readonly acknowledgedVersion: string;
}

export type AcknowledgmentRejection =
  | 'absent'
  | 'not-affirmative'
  | 'version-mismatch';

export type AcknowledgmentVerdict =
  | {
      readonly ok: true;
      /** Recorded against the request. Never the media, never a face. */
      readonly record: {
        readonly policyVersion: string;
        readonly acknowledgedAtMs: number;
      };
    }
  | {
      readonly ok: false;
      readonly rejection: AcknowledgmentRejection;
      readonly messageAr: string;
      readonly detailEn: string;
    };

/**
 * Judge an acknowledgment — and nothing else.
 *
 * It takes no asset, no owner, and no media. It cannot therefore read
 * possession as consent even by accident, which is the one inference §2
 * forbids. A test asserts the absence.
 */
export function verifyLikenessAcknowledgment(
  input: unknown,
  nowMs: number = Date.now(),
): AcknowledgmentVerdict {
  const a = (input ?? {}) as Partial<LikenessAcknowledgment>;

  if (a.acknowledged === undefined) {
    return {
      ok: false, rejection: 'absent',
      messageAr: LIKENESS_ACKNOWLEDGMENT_AR.refusedAr,
      detailEn: 'face-swap: no acknowledgment field was sent',
    };
  }
  // STRICTLY `true`. A truthy string, a 1, or a non-empty object is not a
  // Creator affirming anything — it is a client being loose, and a declaration
  // inferred from looseness is a declaration nobody made.
  if (a.acknowledged !== true) {
    return {
      ok: false, rejection: 'not-affirmative',
      messageAr: LIKENESS_ACKNOWLEDGMENT_AR.refusedAr,
      detailEn: `face-swap: acknowledged was ${JSON.stringify(a.acknowledged)}, not true`,
    };
  }
  if (a.acknowledgedVersion !== LIKENESS_POLICY_VERSION) {
    return {
      ok: false, rejection: 'version-mismatch',
      messageAr: LIKENESS_ACKNOWLEDGMENT_AR.refusedAr,
      detailEn: `face-swap: acknowledged version '${String(a.acknowledgedVersion)}' `
        + `is not the current '${LIKENESS_POLICY_VERSION}'`,
    };
  }

  return {
    ok: true,
    // Only the version and the moment. No face, no media, no copy of the
    // source — §2 forbids storing unnecessary sensitive data, and the
    // declaration needs none of it to be meaningful.
    record: { policyVersion: LIKENESS_POLICY_VERSION, acknowledgedAtMs: nowMs },
  };
}

/** Which operations require it. One list, so a new face act cannot miss it. */
export const OPERATIONS_REQUIRING_LIKENESS_ACKNOWLEDGMENT: readonly string[] = [
  'face-swap',
];

export function requiresLikenessAcknowledgment(operation: string): boolean {
  return OPERATIONS_REQUIRING_LIKENESS_ACKNOWLEDGMENT.includes(operation);
}
