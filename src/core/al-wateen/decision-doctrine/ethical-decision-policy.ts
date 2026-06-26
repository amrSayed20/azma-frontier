import { DoctrineCandidatePath, EthicalPolicyResult } from './doctrine-types';

export class EthicalDecisionPolicy {
  public evaluate(candidates: readonly DoctrineCandidatePath[]): EthicalPolicyResult {
    const blockedPathIds: string[] = [];
    const notes: string[] = [];

    for (const candidate of candidates) {
      if (candidate.constitutionalImpact < 55) {
        blockedPathIds.push(candidate.pathId);
        notes.push(`Path ${candidate.pathId} blocked due to insufficient constitutional impact.`);
      }

      if (candidate.sustainabilityImpact < 50) {
        blockedPathIds.push(candidate.pathId);
        notes.push(`Path ${candidate.pathId} blocked due to weak long-term sustainability.`);
      }
    }

    return {
      compliant: blockedPathIds.length < candidates.length,
      policyNotes: notes,
      blockedPathIds: Array.from(new Set(blockedPathIds.values())),
    };
  }
}
