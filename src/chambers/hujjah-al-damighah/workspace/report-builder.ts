import { EvidenceBundle } from '../domain/evidence.types';

export interface IntelligenceReport {
  dossierId: string;
  topic: string;
  executiveSummary: string;
  evidenceBundle: EvidenceBundle;
  contentOpportunities: string[];
  generatedAt: Date;
}

export class ReportBuilder {
  public static build(bundle: EvidenceBundle): IntelligenceReport {
    const topEvidence = bundle.evidence.slice(0, 3);

    const summary = topEvidence
      .map((e) => e.extractedText)
      .join(' ');

    const opportunities = topEvidence.map(
      (e) =>
        `Explore source ${e.sourceProvider} around document ${e.sourceId}`
    );

    return {
      dossierId: `DOSSIER-${crypto.randomUUID()
        .split('-')[0]
        .toUpperCase()}`,

      topic: bundle.claim.normalizedStatement,

      executiveSummary:
        summary ||
        `Sovereign intelligence analysis for concept: ${bundle.claim.normalizedStatement}.`,

      evidenceBundle: bundle,

      contentOpportunities: opportunities,

      generatedAt: new Date(),
    };
  }
}