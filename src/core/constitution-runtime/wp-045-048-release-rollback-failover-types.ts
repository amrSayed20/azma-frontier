/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-045-048: RELEASE READINESS, ROLLBACK, FAILOVER & RECOVERY TYPES
 *
 * Type definitions for constitutional release certification:
 * - Release Readiness Gate (WP-045)
 * - Rollback Readiness (WP-046)
 * - Failover / Recovery Rehearsal (WP-047)
 * - RCS Final Extension (WP-048)
 * ════════════════════════════════════════════════════════════════════════════
 */

import { RuntimeLayer } from './wp-037-runtime-observability-types';

// ════════════════════════════════════════════════════════════════════════════
// 1. RELEASE READINESS GATE (WP-045)
// ════════════════════════════════════════════════════════════════════════════

export enum ReadinessStatus {
  READY = 'READY',
  NOT_READY = 'NOT_READY',
  CONDITIONAL = 'CONDITIONAL',
  BLOCKED = 'BLOCKED',
}

export interface ReadinessCheck {
  readonly checkId: string;
  readonly name: string;
  readonly status: ReadinessStatus;
  readonly score: number; // 0-100
  readonly details: string;
  readonly issues: string[];
  readonly verifiedAt: number;
}

export interface ReleaseReadinessGate {
  readonly gateId: string;
  readonly evaluatedAt: number;
  readonly runtimeCompleteness: ReadinessCheck;
  readonly dependencyCompleteness: ReadinessCheck;
  readonly constitutionalCompleteness: ReadinessCheck;
  readonly configurationCompleteness: ReadinessCheck;
  readonly runtimeIntegrity: ReadinessCheck;
  readonly deploymentReadiness: ReadinessCheck;
  readonly overallStatus: ReadinessStatus;
  readonly overallScore: number; // 0-100
  readonly blockers: string[];
  readonly recommendations: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// 2. ROLLBACK READINESS (WP-046)
// ════════════════════════════════════════════════════════════════════════════

export enum RollbackTarget {
  RUNTIME_STATE = 'RUNTIME_STATE',
  AGENT_SOCIETY = 'AGENT_SOCIETY',
  SCHEDULING = 'SCHEDULING',
  MEMORY = 'MEMORY',
  DECISION_STATE = 'DECISION_STATE',
  CONFIGURATION = 'CONFIGURATION',
  AUDIT_CONTINUITY = 'AUDIT_CONTINUITY',
}

export interface RollbackSnapshot {
  readonly snapshotId: string;
  readonly createdAt: number;
  readonly target: RollbackTarget;
  readonly version: string;
  readonly stateHash: string;
  readonly stateData: Record<string, unknown>;
  readonly constitutionallyValid: boolean;
  readonly size: number; // bytes
}

export interface RollbackExecution {
  readonly rollbackId: string;
  readonly snapshotId: string;
  readonly target: RollbackTarget;
  readonly initiatedAt: number;
  readonly completedAt?: number;
  readonly success: boolean;
  readonly restoredState: Record<string, unknown>;
  readonly integrityVerified: boolean;
  readonly auditContinuityPreserved: boolean;
  readonly error?: string;
}

export interface RollbackReadinessReport {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly snapshotsAvailable: Map<RollbackTarget, RollbackSnapshot>;
  readonly allTargetsCovered: boolean;
  readonly deterministic: boolean;
  readonly auditContinuitySupported: boolean;
  readonly estimatedRollbackTimeMs: number;
  readonly status: ReadinessStatus;
}

// ════════════════════════════════════════════════════════════════════════════
// 3. FAILOVER REHEARSAL (WP-047)
// ════════════════════════════════════════════════════════════════════════════

export enum FailureType {
  NODE_FAILURE = 'NODE_FAILURE',
  LAYER_FAILURE = 'LAYER_FAILURE',
  AGENT_FAILURE = 'AGENT_FAILURE',
  MEMORY_FAILURE = 'MEMORY_FAILURE',
  QUEUE_FAILURE = 'QUEUE_FAILURE',
  NETWORK_FAILURE = 'NETWORK_FAILURE',
}

export enum RecoveryPhase {
  DETECTION = 'DETECTION',
  ISOLATION = 'ISOLATION',
  RECOVERY = 'RECOVERY',
  RESUME = 'RESUME',
  INTEGRITY_VERIFICATION = 'INTEGRITY_VERIFICATION',
  CONSTITUTIONAL_VERIFICATION = 'CONSTITUTIONAL_VERIFICATION',
}

export interface FailureInjection {
  readonly injectionId: string;
  readonly failureType: FailureType;
  readonly target: string;
  readonly injectedAt: number;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly expectedRecoveryMs: number;
}

export interface RecoveryPhaseResult {
  readonly phase: RecoveryPhase;
  readonly startedAt: number;
  readonly completedAt: number;
  readonly durationMs: number;
  readonly success: boolean;
  readonly details: string;
}

export interface FailoverRehearsalResult {
  readonly rehearsalId: string;
  readonly failure: FailureInjection;
  readonly detectedAt: number;
  readonly detectionLatencyMs: number;
  readonly recoveryPhases: RecoveryPhaseResult[];
  readonly fullyRecovered: boolean;
  readonly totalRecoveryMs: number;
  readonly integrityVerified: boolean;
  readonly constitutionallyValid: boolean;
  readonly auditContinuous: boolean;
}

export interface RecoveryTimelineReport {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly rehearsals: FailoverRehearsalResult[];
  readonly totalFailuresSimulated: number;
  readonly totalRecoveries: number;
  readonly recoverySuccessRate: number; // 0-1
  readonly avgDetectionMs: number;
  readonly avgRecoveryMs: number;
  readonly maxRecoveryMs: number;
  readonly allIntegrityVerified: boolean;
  readonly allConstitutionallyValid: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CERTIFICATION REPORT
// ════════════════════════════════════════════════════════════════════════════

export interface RuntimeCertification {
  readonly certificationId: string;
  readonly issuedAt: number;
  readonly wavesCompleted: number;
  readonly totalTestsPassing: number;
  readonly rcsArtifactCount: number;
  readonly layersOperational: number;
  readonly releaseGatePassed: boolean;
  readonly rollbackReady: boolean;
  readonly failoverProven: boolean;
  readonly constitutionallyCertified: boolean;
  readonly operationallyReady: boolean;
  readonly recommendation: 'READY_FOR_PRODUCTION' | 'READY_FOR_GITHUB_RELEASE' | 'READY_FOR_CHAMBER_INTEGRATION' | 'NOT_READY';
}

// ════════════════════════════════════════════════════════════════════════════
// 5. SERVICE CONTRACTS
// ════════════════════════════════════════════════════════════════════════════

export interface ReleaseReadinessServiceContract {
  evaluateReadinessGate(): Promise<ReleaseReadinessGate>;
  checkRuntimeCompleteness(): Promise<ReadinessCheck>;
  checkDependencyCompleteness(): Promise<ReadinessCheck>;
  checkConstitutionalCompleteness(): Promise<ReadinessCheck>;
  checkConfigurationCompleteness(): Promise<ReadinessCheck>;
  checkRuntimeIntegrity(): Promise<ReadinessCheck>;
  checkDeploymentReadiness(): Promise<ReadinessCheck>;
}

export interface RollbackReadinessServiceContract {
  createSnapshot(target: RollbackTarget): Promise<RollbackSnapshot>;
  createAllSnapshots(): Promise<Map<RollbackTarget, RollbackSnapshot>>;
  executeRollback(snapshotId: string, target: RollbackTarget): Promise<RollbackExecution>;
  getRollbackReadinessReport(): Promise<RollbackReadinessReport>;
  verifySnapshotIntegrity(snapshotId: string): Promise<boolean>;
}

export interface FailoverRehearsalServiceContract {
  injectFailure(failureType: FailureType, target: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<FailureInjection>;
  conductRehearsalFor(failure: FailureInjection): Promise<FailoverRehearsalResult>;
  runFullFailoverSuite(): Promise<RecoveryTimelineReport>;
  verifyRecoveryIntegrity(rehearsalId: string): Promise<boolean>;
  getRecoveryTimeline(): Promise<RecoveryTimelineReport>;
}

export interface RuntimeCertificationServiceContract {
  generateRuntimeCertification(): Promise<RuntimeCertification>;
}
