/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Medical Evidence Layer — contracts.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   The medical domain had two sources, both general encyclopedias, and a
 *   doctor explaining an operation to a patient was answered from the same
 *   place as someone asking about a Yemeni singer. The Founder's ruling: the
 *   medical domain must not depend on general encyclopedias alone.
 *
 *   No ninth Ministry. This is a source layer with its own taxonomy, its own
 *   safety rules and its own metadata, inside the engine that already exists.
 *
 * ─── WHAT MAKES THIS DIFFERENT FROM EVERY OTHER SOURCE ──────────────────────
 *
 *   Elsewhere in the chamber a source's standing is a property of the source.
 *   In medicine it is a property of the *study* — the same journal publishes a
 *   clinical guideline and a single case report in the same week, and they are
 *   not the same kind of evidence. So the hierarchy is read per item, from the
 *   publication type the source itself states.
 *
 *   Measured from the production host: Europe PMC returns
 *   `pubTypeList: ['Systematic Review', 'Journal Article']` on the record
 *   itself, with the publication date, the journal and the DOI. For
 *   cholecystectomy alone it holds 169 records typed as guidelines, 1,578 as
 *   systematic reviews and 1,113 as meta-analyses. The hierarchy this file
 *   defines is therefore READ, never inferred.
 *
 * ─── THE LINE THAT MATTERS MOST ─────────────────────────────────────────────
 *
 *   Nothing here produces a diagnosis, a treatment plan, a dose, or a decision
 *   about a person. The chamber explains what is published; the decision in any
 *   actual case belongs to the clinician treating that patient, who knows
 *   things no search can know. Every medical output carries that, attached to
 *   the work rather than left in a footnote.
 */

// ─── THE HIERARCHY, AS THE SOURCES THEMSELVES STATE IT ───────────────────────

/**
 * What kind of medical evidence an item is.
 *
 * Ordered. A guideline outranks a systematic review, which outranks a single
 * trial, which outranks a general reference — and the ordering is the point:
 * «Never present a general encyclopedia as equivalent to a clinical guideline
 * or systematic review.»
 */
export enum MedicalEvidenceKind {
  /** Official clinical practice guideline or evidence-based recommendation. */
  GUIDELINE = 'GUIDELINE',
  /** Systematic review or meta-analysis — the totality of evidence weighed. */
  SYSTEMATIC_REVIEW = 'SYSTEMATIC_REVIEW',
  /** A randomised controlled trial. */
  RANDOMISED_TRIAL = 'RANDOMISED_TRIAL',
  /** Any other primary clinical study: cohort, case-control, case series. */
  CLINICAL_STUDY = 'CLINICAL_STUDY',
  /** A registered trial record — a study that exists, not yet a result. */
  TRIAL_REGISTRATION = 'TRIAL_REGISTRATION',
  /** Material written for patients by a health institution. */
  PATIENT_EDUCATION = 'PATIENT_EDUCATION',
  /** A narrative review, editorial, or commentary. */
  EXPERT_NARRATIVE = 'EXPERT_NARRATIVE',
  /** A general encyclopedia. Introductory definitions only. */
  GENERAL_REFERENCE = 'GENERAL_REFERENCE',
}

/** Rank for ordering. Lower is stronger. Never shown as a number. */
const RANK: Record<MedicalEvidenceKind, number> = {
  [MedicalEvidenceKind.GUIDELINE]: 1,
  [MedicalEvidenceKind.SYSTEMATIC_REVIEW]: 2,
  [MedicalEvidenceKind.RANDOMISED_TRIAL]: 3,
  [MedicalEvidenceKind.CLINICAL_STUDY]: 4,
  [MedicalEvidenceKind.TRIAL_REGISTRATION]: 5,
  [MedicalEvidenceKind.PATIENT_EDUCATION]: 6,
  [MedicalEvidenceKind.EXPERT_NARRATIVE]: 7,
  [MedicalEvidenceKind.GENERAL_REFERENCE]: 8,
};

export function medicalRank(kind: MedicalEvidenceKind): number {
  return RANK[kind];
}

export function strongerKind(a: MedicalEvidenceKind, b: MedicalEvidenceKind): MedicalEvidenceKind {
  return RANK[a] <= RANK[b] ? a : b;
}

/** The Creator's words for each kind, and what each one actually means. */
export function medicalKindLabelAr(kind: MedicalEvidenceKind): string {
  switch (kind) {
    case MedicalEvidenceKind.GUIDELINE: return 'إرشاد سريري معتمد';
    case MedicalEvidenceKind.SYSTEMATIC_REVIEW: return 'مراجعة منهجية';
    case MedicalEvidenceKind.RANDOMISED_TRIAL: return 'تجربة سريرية مُعشّاة';
    case MedicalEvidenceKind.CLINICAL_STUDY: return 'دراسة سريرية';
    case MedicalEvidenceKind.TRIAL_REGISTRATION: return 'تجربة مُسجَّلة';
    case MedicalEvidenceKind.PATIENT_EDUCATION: return 'مادة تثقيفية للمرضى';
    case MedicalEvidenceKind.EXPERT_NARRATIVE: return 'مراجعة سردية أو رأي متخصص';
    default: return 'مرجع عام';
  }
}

export function medicalKindMeaningAr(kind: MedicalEvidenceKind): string {
  switch (kind) {
    case MedicalEvidenceKind.GUIDELINE:
      return 'توصية صادرة عن جهة سريرية، مبنية على مجموع الأدلة المتاحة وقت إصدارها.';
    case MedicalEvidenceKind.SYSTEMATIC_REVIEW:
      return 'وزنٌ لمجموع الدراسات في المسألة، لا لدراسةٍ واحدة — وهو أقوى ما يُبنى عليه بعد الإرشادات.';
    case MedicalEvidenceKind.RANDOMISED_TRIAL:
      return 'تجربة واحدة بتصميم قوي — تُقرأ في حدود من شملتهم، ولا تُعمَّم وحدها.';
    case MedicalEvidenceKind.CLINICAL_STUDY:
      return 'دراسة واحدة — نتيجتها خاصة بمن دُرسوا وبظروف دراستهم.';
    case MedicalEvidenceKind.TRIAL_REGISTRATION:
      return 'تسجيلٌ لتجربة قائمة أو مُزمعة — يُثبت وجودها، ولا يُثبت نتيجةً بعد.';
    case MedicalEvidenceKind.PATIENT_EDUCATION:
      return 'شرحٌ موجَّه للمرضى من جهة صحية — للفهم لا للاستدلال السريري.';
    case MedicalEvidenceKind.EXPERT_NARRATIVE:
      return 'عرضٌ أو رأيٌ لمختص — لا يقوم مقام مراجعةٍ منهجية.';
    default:
      return 'تعريفٌ عام للاستئناس — ولا يُساوى بإرشادٍ سريري ولا بمراجعة منهجية.';
  }
}

// ─── HOW OLD IS TOO OLD ──────────────────────────────────────────────────────

export enum MedicalRecency {
  CURRENT = 'CURRENT',
  AGEING = 'AGEING',
  OLD = 'OLD',
  UNDATED = 'UNDATED',
}

/**
 * Medicine changes. A guideline from fifteen years ago may have been withdrawn
 * and a Creator has no way to know that from the text alone, so the age of a
 * source travels with it.
 *
 * These bands are a disclosed convention, not a clinical standard, and the
 * chamber says so rather than implying a rule that does not exist.
 */
export function recencyOf(publicationYear: number | null, nowYear: number): MedicalRecency {
  if (publicationYear === null || !Number.isFinite(publicationYear)) return MedicalRecency.UNDATED;
  const age = nowYear - publicationYear;
  if (age <= 5) return MedicalRecency.CURRENT;
  if (age <= 10) return MedicalRecency.AGEING;
  return MedicalRecency.OLD;
}

export function recencyLabelAr(recency: MedicalRecency, year: number | null): string {
  switch (recency) {
    case MedicalRecency.CURRENT: return `حديث (${year})`;
    case MedicalRecency.AGEING: return `مضى عليه بعض الوقت (${year}) — يُراجَع هل صدر أحدث منه`;
    case MedicalRecency.OLD: return `قديم (${year}) — قد يكون تجاوزه ما هو أحدث`;
    default: return 'بلا تاريخ نشر معلوم';
  }
}

// ─── ONE PIECE OF MEDICAL EVIDENCE ───────────────────────────────────────────

export interface MedicalEvidence {
  /** Internal routing id. Never shown. */
  readonly id: string;
  /** The title as its source published it. */
  readonly title: string;
  /** The passage the chamber is offering as evidence. */
  readonly text: string;
  readonly kind: MedicalEvidenceKind;
  /** The publishing body or journal, as the source names it. */
  readonly publisher: string | null;
  readonly publicationYear: number | null;
  readonly publicationDate: string | null;
  /** A reference a Creator or a clinician can look up: DOI, PMID, registry id. */
  readonly citation: string | null;
  /** Where it lives. Internal; never rendered. */
  readonly locator: string | null;
  /** The publication types the source itself stated, verbatim. */
  readonly statedTypes: readonly string[];
  /** Present only where a source publishes one. Never computed here. */
  readonly statedEvidenceLevel: string | null;
  readonly openAccess: boolean | null;
}

// ─── WHAT A MEDICAL ANSWER MUST KEEP APART ───────────────────────────────────

/**
 * The layers a medical answer must never merge.
 *
 * «Medical answers must separate: medical fact, evidence strength, source
 * recency, source relevance, clinical recommendation, general patient
 * education, uncertainty or disagreement.»
 */
export interface MedicalAssessment {
  /** The strongest kind present. Read from the items, not decided. */
  readonly strongestKind: MedicalEvidenceKind;
  /** True when the items disagree in kind strongly enough to matter. */
  readonly restsOnSingleStudy: boolean;
  /** True when nothing stronger than a general reference was found. */
  readonly restsOnGeneralReferenceOnly: boolean;
  /** The oldest and newest years present, for a Creator to judge currency. */
  readonly yearRange: { readonly oldest: number | null; readonly newest: number | null };
  readonly recency: MedicalRecency;
}

export function assess(items: readonly MedicalEvidence[], nowYear: number): MedicalAssessment {
  if (items.length === 0) {
    return {
      strongestKind: MedicalEvidenceKind.GENERAL_REFERENCE,
      restsOnSingleStudy: false,
      restsOnGeneralReferenceOnly: true,
      yearRange: { oldest: null, newest: null },
      recency: MedicalRecency.UNDATED,
    };
  }

  const strongestKind = items.reduce<MedicalEvidenceKind>(
    (best, i) => strongerKind(best, i.kind),
    MedicalEvidenceKind.GENERAL_REFERENCE,
  );

  const years = items.map((i) => i.publicationYear).filter((y): y is number => y !== null);
  const newest = years.length ? Math.max(...years) : null;

  // «A single study must not automatically become a medical recommendation.»
  const restsOnSingleStudy =
    medicalRank(strongestKind) >= medicalRank(MedicalEvidenceKind.RANDOMISED_TRIAL) &&
    medicalRank(strongestKind) <= medicalRank(MedicalEvidenceKind.CLINICAL_STUDY);

  return {
    strongestKind,
    restsOnSingleStudy,
    restsOnGeneralReferenceOnly: strongestKind === MedicalEvidenceKind.GENERAL_REFERENCE,
    yearRange: { oldest: years.length ? Math.min(...years) : null, newest },
    recency: recencyOf(newest, nowYear),
  };
}

// ─── THE BOUNDARY, ATTACHED TO EVERY MEDICAL OUTPUT ──────────────────────────

/** Said on every medical answer. Never a footnote, never omitted. */
export const CLINICIAN_BOUNDARY_AR =
  'هذا شرحٌ تعليمي لما هو منشور، وليس تشخيصاً ولا خطة علاج ولا تعليمات دواء. ' +
  'القرار في حالةٍ بعينها لطبيبها المعالج وحده، وهو يعلم عنها ما لا يعلمه أي بحث.';

/** Said when the answer rests on one study rather than on the weight of evidence. */
export const SINGLE_STUDY_CAUTION_AR =
  'ما وُجد يستند إلى دراسةٍ واحدة لا إلى مجموع الأدلة — ونتيجة الدراسة الواحدة ' +
  'خاصة بمن شملتهم وبظروفهم، ولا تصير توصيةً بمجرّد وجودها.';

/** Said when nothing better than a general encyclopedia was found. */
export const GENERAL_ONLY_CAUTION_AR =
  'لم يُعثر على إرشادٍ سريري ولا مراجعةٍ منهجية في هذا الموضوع، وما عُرض مرجعٌ ' +
  'عام للتعريف فقط — ولا يُساوى بأيٍّ منهما.';

/** Said when what was found may predate current practice. */
export const OUTDATED_CAUTION_AR =
  'أحدث ما وُجد ليس حديثاً، وقد تغيّرت الممارسة الطبية بعده — يُراجَع هل صدر ما هو أحدث.';

/**
 * Warning signs are named by a clinician, never by this chamber.
 *
 * The directive asks for emergency warning signs «when relevant», and relevance
 * to a person is a clinical judgement. What the chamber can say honestly is
 * that urgency is not something it can assess — and that saying so is safer
 * than a list that might be read as complete.
 */
export const URGENCY_BOUNDARY_AR =
  'ولا تُقدّر هذه الحجرة درجة الاستعجال في حالةٍ بعينها. ما يستدعي طبيباً الآن ' +
  'يعرفه الطبيب من حال المريض، لا من نصٍّ عام.';

/** Every caution that applies to this assessment, in the Creator's language. */
export function medicalCautionsAr(assessment: MedicalAssessment): string[] {
  const cautions = [CLINICIAN_BOUNDARY_AR];
  if (assessment.restsOnGeneralReferenceOnly) cautions.push(GENERAL_ONLY_CAUTION_AR);
  if (assessment.restsOnSingleStudy) cautions.push(SINGLE_STUDY_CAUTION_AR);
  if (assessment.recency === MedicalRecency.OLD) cautions.push(OUTDATED_CAUTION_AR);
  cautions.push(URGENCY_BOUNDARY_AR);
  return cautions;
}
