import { IntelligenceReport } from './report-builder';

export interface ExportPayload {
  targetChamber: 'qiyamah' | 'ras-al-amr' | 'makman';
  payload: IntelligenceReport;
  exportedAt: Date;
}

export class EvidenceExporter {
  public static exportToQiyamah(report: IntelligenceReport): ExportPayload {
    // Generates the immutable payload that will be injected into Qiyamah Chamber's state
    return {
      targetChamber: 'qiyamah',
      payload: report,
      exportedAt: new Date(),
    };
  }
}