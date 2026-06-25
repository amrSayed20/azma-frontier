/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Verdict Engine
 *
 * Sovereign Knowledge Court
 * Status: V1.0
 */

export type VerdictType =
  | 'accepted'
  | 'under_review'
  | 'conflict'
  | 'rejected';

export interface VerdictState {
  id: VerdictType;

  label: string;
  description: string;

  borderColor: string;
  glowColor: string;

  severity: number;

  allowDispatch: boolean;
  allowArchive: boolean;
  allowMemory: boolean;
}

export const ACCEPTED_STATE: VerdictState = {
  id: 'accepted',

  label: 'مقبولة',
  description: 'الحجة مستقرة ومدعومة ويمكن نشرها وإرسالها.',

  borderColor: '#D4AF37',
  glowColor: 'rgba(255,215,0,0.25)',

  severity: 0,

  allowDispatch: true,
  allowArchive: true,
  allowMemory: true,
};

export const UNDER_REVIEW_STATE: VerdictState = {
  id: 'under_review',

  label: 'تحت المراجعة',
  description: 'المعلومة تحتاج تثبيتاً إضافياً قبل اعتمادها الكامل.',

  borderColor: '#8B6508',
  glowColor: 'rgba(212,175,55,0.15)',

  severity: 1,

  allowDispatch: false,
  allowArchive: true,
  allowMemory: true,
};

export const CONFLICT_STATE: VerdictState = {
  id: 'conflict',

  label: 'متعارضة',
  description: 'تم اكتشاف تعارض بين الأدلة أو المصادر.',

  borderColor: '#8B0000',
  glowColor: 'rgba(255,0,0,0.15)',

  severity: 2,

  allowDispatch: false,
  allowArchive: false,
  allowMemory: false,
};

export const REJECTED_STATE: VerdictState = {
  id: 'rejected',

  label: 'مرفوضة',
  description: 'المعلومة ضعيفة أو غير مؤهلة للدخول إلى المدينة السيادية.',

  borderColor: '#550000',
  glowColor: 'rgba(255,0,0,0.25)',

  severity: 3,

  allowDispatch: false,
  allowArchive: false,
  allowMemory: false,
};

export const verdictRegistry: Record<VerdictType, VerdictState> = {
  accepted: ACCEPTED_STATE,
  under_review: UNDER_REVIEW_STATE,
  conflict: CONFLICT_STATE,
  rejected: REJECTED_STATE,
};

export function getVerdictState(
  verdict: VerdictType
): VerdictState {
  return verdictRegistry[verdict];
}

export function canDispatch(
  verdict: VerdictType
): boolean {
  return getVerdictState(verdict).allowDispatch;
}

export function canArchive(
  verdict: VerdictType
): boolean {
  return getVerdictState(verdict).allowArchive;
}

export function canStoreMemory(
  verdict: VerdictType
): boolean {
  return getVerdictState(verdict).allowMemory;
}

export interface VerdictEvaluationInput {
  confidence: number;
  hasConflict?: boolean;
  blocked?: boolean;
}

export function evaluateVerdict(
  input: VerdictEvaluationInput
): VerdictState {
  const {
    confidence,
    hasConflict = false,
    blocked = false,
  } = input;

  if (blocked) {
    return REJECTED_STATE;
  }

  if (hasConflict) {
    return CONFLICT_STATE;
  }

  if (confidence >= 90) {
    return ACCEPTED_STATE;
  }

  if (confidence >= 70) {
    return UNDER_REVIEW_STATE;
  }

  return REJECTED_STATE;
}