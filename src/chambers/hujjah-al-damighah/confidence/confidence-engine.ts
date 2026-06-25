/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Confidence Engine
 *
 * Sovereign Knowledge Scale
 * Status: V1.0
 */

export interface ConfidenceInput {
  sourceStrength: number;      // قوة المصدر (0-100)
  evidenceCount: number;       // عدد الأدلة
  agreementLevel: number;      // توافق المصادر (0-100)
  freshnessLevel: number;      // حداثة المعلومات (0-100)
  conflictLevel?: number;      // مستوى التعارض (0-100)
}

export interface ConfidenceResult {
  confidence: number;

  sourceScore: number;
  evidenceScore: number;
  agreementScore: number;
  freshnessScore: number;
  conflictPenalty: number;

  label: string;
}

export function evaluateConfidence(
  input: ConfidenceInput
): ConfidenceResult {

  const {
    sourceStrength,
    evidenceCount,
    agreementLevel,
    freshnessLevel,
    conflictLevel = 0,
  } = input;

  const evidenceScore = Math.min(evidenceCount * 10, 100);

  const rawScore =
    sourceStrength * 0.35 +
    evidenceScore * 0.25 +
    agreementLevel * 0.25 +
    freshnessLevel * 0.15;

  const penalty = conflictLevel * 0.4;

  const confidence = Math.max(
    0,
    Math.min(
      100,
      Math.round(rawScore - penalty)
    )
  );

  let label = '';

  if (confidence >= 90) {
    label = 'ثقة سيادية';
  } else if (confidence >= 75) {
    label = 'ثقة قوية';
  } else if (confidence >= 60) {
    label = 'قيد التحقق';
  } else {
    label = 'ضعيفة';
  }

  return {
    confidence,

    sourceScore: sourceStrength,
    evidenceScore,

    agreementScore: agreementLevel,
    freshnessScore: freshnessLevel,

    conflictPenalty: penalty,

    label,
  };
}