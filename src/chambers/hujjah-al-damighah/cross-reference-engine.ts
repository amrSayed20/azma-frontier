/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Cross Reference Engine
 *
 * Status: V1.0
 * Knowledge Relationship Layer
 */

export interface CrossReference {
  sourceId: string;

  targetId: string;

  relationType: string;

  createdAt: string;
}

export interface CrossReferenceResult {
  success: boolean;

  reference: CrossReference;
}

export function createCrossReference(
  sourceId: string,
  targetId: string,
  relationType: string
): CrossReference {
  return {
    sourceId,
    targetId,
    relationType,
    createdAt: new Date().toISOString(),
  };
}

export function linkKnowledge(
  reference: CrossReference
): CrossReferenceResult {
  return {
    success: true,
    reference,
  };
}

export function isLinked(
  sourceId: string,
  targetId: string,
  references: CrossReference[]
): boolean {
  return references.some(
    (ref) =>
      ref.sourceId === sourceId &&
      ref.targetId === targetId
  );
}