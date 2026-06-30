import type {
  PlatformVitalitySignal,
  FiveQuestions,
  OsHeartbeat,
  RuntimeEvent,
  RuntimeEventType,
  Incident,
  SovereignReport,
  ReportType,
  SovereignGrant,
  GrantParams,
  ChronicleEntry,
  ChronicleCategory,
  ExecutiveRecommendation,
  EmpireTreasurySnapshot,
  Prediction,
  PendingApproval,
  ApprovalResult,
} from './sovereign-command-types';
import type { SovereignAuthorityToken } from '../sovereign-identity/sovereign-identity-contract';

// ── Sub-service contracts ────────────────────────────────────────────────────

export interface PlatformVitalityContract {
  readonly serviceName: 'PlatformVitalityService';
  getVitalitySignal(): Promise<PlatformVitalitySignal>;
  fiveQuestions(): Promise<FiveQuestions>;
}

export interface OsHeartbeatContract {
  readonly serviceName: 'OsHeartbeatService';
  getHeartbeat(): Promise<OsHeartbeat>;
}

export interface RuntimeObservatoryContract {
  readonly serviceName: 'RuntimeObservatoryService';
  recordEvent(event: Omit<RuntimeEvent, 'eventId' | 'timestamp'>): void;
  getRecentEvents(limit?: number): readonly RuntimeEvent[];
  getEventCount(): number;
  getEventsByType(type: RuntimeEventType): readonly RuntimeEvent[];
}

export interface IncidentIntelligenceContract {
  readonly serviceName: 'IncidentIntelligenceService';
  detectIncidents(heartbeat: OsHeartbeat): readonly Incident[];
  getOpenIncidents(): readonly Incident[];
  resolveIncident(incidentId: string, resolution: string): void;
  getAllIncidents(): readonly Incident[];
}

export interface SovereignReportingContract {
  readonly serviceName: 'SovereignReportingService';
  generateReport(type: ReportType): Promise<SovereignReport>;
  getRecentReports(limit?: number): readonly SovereignReport[];
}

export interface SovereignGrantContract {
  readonly serviceName: 'SovereignGrantService';
  issueGrant(params: GrantParams): SovereignGrant;
  revokeGrant(grantId: string): void;
  getGrants(targetUserId?: string): readonly SovereignGrant[];
  getActiveGrants(): readonly SovereignGrant[];
}

export interface EmpireChronicleContract {
  readonly serviceName: 'EmpireChronicleService';
  record(entry: Omit<ChronicleEntry, 'entryId' | 'timestamp'>): ChronicleEntry;
  getChronicle(limit?: number): readonly ChronicleEntry[];
  getByCategory(category: ChronicleCategory): readonly ChronicleEntry[];
}

export interface ExecutiveIntelligenceContract {
  readonly serviceName: 'ExecutiveIntelligenceService';
  analyze(
    heartbeat: OsHeartbeat,
    predictions: readonly Prediction[],
    treasury: EmpireTreasurySnapshot,
  ): readonly ExecutiveRecommendation[];
  getLatestRecommendations(): readonly ExecutiveRecommendation[];
}

export interface EmpireTreasuryContract {
  readonly serviceName: 'EmpireTreasuryService';
  getSnapshot(): Promise<EmpireTreasurySnapshot>;
}

export interface PredictiveCommandContract {
  readonly serviceName: 'PredictiveCommandService';
  generatePredictions(
    heartbeat: OsHeartbeat,
    treasury: EmpireTreasurySnapshot,
  ): readonly Prediction[];
  getActivePredictions(): readonly Prediction[];
}

export interface FounderApprovalGateContract {
  readonly serviceName: 'FounderApprovalGateService';
  submitForApproval(recommendation: ExecutiveRecommendation): Promise<PendingApproval>;
  approve(approvalId: string, token: SovereignAuthorityToken): Promise<ApprovalResult>;
  reject(approvalId: string, reason: string): Promise<void>;
  getPendingApprovals(): Promise<readonly PendingApproval[]>;
  getAllApprovals(): readonly PendingApproval[];
}

// ── Top-level Layer 9 contract ───────────────────────────────────────────────

export interface SovereignCommandContract {
  readonly layerName: 'SovereignCommand';
  readonly version: '1.0.0';
  readonly layerNumber: 9;

  readonly platformVitality: PlatformVitalityContract;
  readonly osHeartbeat: OsHeartbeatContract;
  readonly runtimeObservatory: RuntimeObservatoryContract;
  readonly incidentIntelligence: IncidentIntelligenceContract;
  readonly sovereignReporting: SovereignReportingContract;
  readonly sovereignGrants: SovereignGrantContract;
  readonly empireChronicle: EmpireChronicleContract;
  readonly executiveIntelligence: ExecutiveIntelligenceContract;
  readonly empireTreasury: EmpireTreasuryContract;
  readonly predictiveCommand: PredictiveCommandContract;
  readonly founderApprovalGate: FounderApprovalGateContract;
}
