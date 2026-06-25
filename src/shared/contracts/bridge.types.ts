import { IntelligenceReport } from '../../chambers/hujjah-al-damighah/workspace/report-builder';

export interface ChamberExportPayload {
  targetChamber: 'qiyamah' | 'ras-al-amr' | 'makman';
  payload: IntelligenceReport;
  exportedAt: Date;
}

export interface QiyamahInjectionContext {
  injectedTopic: string;
  creativePromptEnrichment: string;
  supportingEvidenceIds: string[];
  injectedAt: Date;
}

export interface ChamberBridgeEvent {
  type: 'EVIDENCE_EXPORTED' | 'PAYLOAD_INJECTED';
  payload: ChamberExportPayload | QiyamahInjectionContext;
  timestamp: Date;
}