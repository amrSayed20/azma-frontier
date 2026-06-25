import { Claim } from '../domain/evidence.types';

export class EvidenceScoringEngine {
  public static score(evidenceText: string, claim: Claim): { evidenceScore: number; confidenceScore: number } {
    if (!claim.keywords || claim.keywords.length === 0) {
      return { evidenceScore: 0.1, confidenceScore: 0.1 };
    }

    let matchCount = 0;
    const lowerEvidence = evidenceText.toLowerCase();

    for (const keyword of claim.keywords) {
      if (lowerEvidence.includes(keyword)) {
        matchCount++;
      }
    }

    const keywordRatio = matchCount / claim.keywords.length;
    
    // Heuristic scoring for V1 (pre-LLM semantic analysis)
    const evidenceScore = Number((keywordRatio * 0.7 + 0.3).toFixed(2));
    const confidenceScore = Number((Math.min(1.0, keywordRatio * 1.5)).toFixed(2));

    return { evidenceScore, confidenceScore };
  }
}