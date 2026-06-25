import {
  ChamberExportPayload,
  QiyamahInjectionContext,
} from '../../../shared/contracts/bridge.types';

export class QiyamahPayloadTransformer {
  /**
   * Transforms an incoming intelligence export payload into a Qiyamah-specific injection context.
   * Ensures data sovereignty by validating the payload destination and structure.
   */
  public static transform(
    exportPayload: ChamberExportPayload
  ): QiyamahInjectionContext {
    if (exportPayload.targetChamber !== 'qiyamah') {
      throw new Error(
        `Invalid payload destination: Expected 'qiyamah', received '${exportPayload.targetChamber}'`
      );
    }

    const report = exportPayload.payload;

    if (!report || !report.topic) {
      throw new Error(
        'Invalid payload: Missing IntelligenceReport or primary topic.'
      );
    }

    const opportunitiesText =
      Array.isArray(report.contentOpportunities) &&
      report.contentOpportunities.length > 0
        ? report.contentOpportunities
            .map((opp) => `• ${opp}`)
            .join('\n')
        : 'No specific content opportunities extracted.';

    const enrichmentString =
      `[SOVEREIGN INTELLIGENCE CONTEXT]\n` +
      `Topic: ${report.topic}\n` +
      `Executive Summary: ${
        report.executiveSummary || 'No summary provided.'
      }\n\n` +
      `Evidence & Content Opportunities:\n${opportunitiesText}`;

    const evidenceIds = report.evidenceBundle.evidence.map(
      (e) => e.id
    );

    return {
      injectedTopic: report.topic,
      creativePromptEnrichment: enrichmentString,
      supportingEvidenceIds: evidenceIds,
      injectedAt: new Date(),
    };
  }
}