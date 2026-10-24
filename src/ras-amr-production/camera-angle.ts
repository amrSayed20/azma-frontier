/**
 * AZMA OS — رأس الأمر: من أينَ تَنظُر الكاميرا.
 *
 * A named field, not a sentence the Creator must remember to type. The Founder,
 * 2026-10-21: «لا يكفي وجود خيار في الواجهة أو تمريره كنص» — an option that
 * decorates a panel and changes nothing is worse than no option, because it
 * promises. So each angle here carries the exact clause that goes to the image
 * engine, and the clause says where the LENS is, never what the subject does:
 * «يَلتفِت جانبًا» moves the person; «الكاميرا على يمينه» moves the camera. The
 * difference is the whole capability.
 *
 * `UNSPECIFIED` is first and is the default. A Creator who says nothing about
 * the camera must have nothing said on their behalf: an unasked-for angle is a
 * silent edit to their picture.
 *
 * Pure data and one pure function. No I/O.
 */

export type CameraAngleId =
  | 'unspecified'
  | 'front'
  | 'side'
  | 'three-quarter'
  | 'high'
  | 'low';

export interface CameraAngle {
  readonly id: CameraAngleId;
  /** What the Creator reads in the chamber. */
  readonly labelAr: string;
  /**
   * The clause appended to the scene instruction. Empty for `unspecified`.
   * Written as a camera placement, and paired with what that placement
   * implies, so the engine has no room to read it as a pose direction.
   */
  readonly clauseAr: string;
}

export const CAMERA_ANGLES: readonly CameraAngle[] = [
  {
    id: 'unspecified',
    labelAr: 'دون تحديد',
    clauseAr: '',
  },
  {
    id: 'front',
    labelAr: 'أمامية',
    clauseAr:
      'زاويةُ التصوير: الكاميرا أمامَ الموضوعِ مباشرةً وفي مستوى منتصفِه، '
      + 'تَنظُر إليه وجهًا لوجه؛ يَظهَر جانباه بالقدرِ نفسِه ولا يَميل المحورُ يمينًا ولا يسارًا.',
  },
  {
    id: 'side',
    labelAr: 'جانبية',
    clauseAr:
      'زاويةُ التصوير: الكاميرا على جانبِ الموضوعِ بزاويةِ تسعينَ درجةً عن واجهتِه، '
      + 'وفي مستوى منتصفِه؛ يَظهَر جانبٌ واحدٌ منه كاملًا ولا تَظهَر واجهتُه.',
  },
  {
    id: 'three-quarter',
    // MEASURED, job cmvmrogkb09bpi, 2026-10-24: this clause read
    // «الكاميرا بينَ الأمامِ والجانبِ … تَظهَر واجهتُه وأحدُ جانبيه معًا», and the
    // engine returned the man TWICE in one frame — once from each of the two
    // positions the sentence named — although the one-copy rule was present in
    // full, in the same instruction. The rule did not fail: the sentence
    // outranked it by asking, in plain words, for two views «together».
    //
    // So the rotation is now stated ONCE, as a single camera placed off the
    // front axis, and the frame is named as one. An angle is a place to stand,
    // never a pair of places to compare.
    //
    // This wording is NOT proven: the 500 credits the Founder authorised were
    // spent on the five calls above and one of them is what found this. The
    // repair stands on reading, and awaits its own picture.
    labelAr: 'ثلاثة أرباع',
    clauseAr:
      'زاويةُ التصوير: الكاميرا مائلةٌ عن واجهةِ الموضوعِ بنحوِ خمسٍ وأربعينَ درجةً نحوَ أحدِ جانبيه، '
      + 'وفي مستوى منتصفِه؛ لقطةٌ واحدةٌ من موضعٍ واحد، في إطارٍ واحدٍ لا يَحمِل غيرَ الموضوعِ مرّةً واحدة.',
  },
  {
    id: 'high',
    labelAr: 'علوية',
    clauseAr:
      'زاويةُ التصوير: الكاميرا أعلى من الموضوعِ تَنظُر إليه إلى أسفل، '
      + 'ويَميل خطُّ النظرِ نحوَ الأرضِ فتَظهَر الأرضيّةُ خلفَه لا الأفقُ ولا السماء.',
  },
  {
    id: 'low',
    labelAr: 'منخفضة',
    clauseAr:
      'زاويةُ التصوير: الكاميرا أخفضُ من الموضوعِ قريبةً من مستوى الأرضِ تَنظُر إليه إلى أعلى، '
      + 'ويَميل خطُّ النظرِ نحوَ السماءِ فيَبدو الموضوعُ شامخًا فوقَ العدسة.',
  },
];

const BY_ID = new Map<CameraAngleId, CameraAngle>(CAMERA_ANGLES.map((a) => [a.id, a]));

export const DEFAULT_CAMERA_ANGLE: CameraAngleId = 'unspecified';

/** A stored value read back from a row written before this field existed, or by a newer client. */
export function readCameraAngle(value: unknown): CameraAngleId {
  return typeof value === 'string' && BY_ID.has(value as CameraAngleId)
    ? (value as CameraAngleId)
    : DEFAULT_CAMERA_ANGLE;
}

/** The clause this angle contributes, or '' when the Creator named no angle. */
export function cameraAngleClauseAr(angle: CameraAngleId | undefined | null): string {
  return BY_ID.get(readCameraAngle(angle))?.clauseAr ?? '';
}

export function cameraAngleLabelAr(angle: CameraAngleId | undefined | null): string {
  return BY_ID.get(readCameraAngle(angle))?.labelAr ?? 'دون تحديد';
}
