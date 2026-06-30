/**
 * Sovereign Command Layer — Production-Grade Unit Tests
 *
 * Tests Layer 9 (Sovereign Command) and Sovereign Identity subsystem:
 *   1. FounderSessionService
 *   2. FounderIdentityService
 *   3. SovereignAuthorityService
 *   4. RuntimeObservatoryService
 *   5. IncidentIntelligenceService
 *   6. EmpireTreasuryService
 *   7. PredictiveCommandService
 *   8. ExecutiveIntelligenceService
 *   9. FounderApprovalGateService
 *  10. SovereignGrantService
 *  11. EmpireChronicleService
 *  12. OsHeartbeatService
 *  13. PlatformVitalityService
 *  14. SovereignReportingService
 *  15. SovereignCommandLayer (Layer 9 contract)
 */

import { createHash } from 'crypto';
import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { createSchedulingKernel } from '../constitution-runtime/wp-008-kernel';
import { createMemoryLayer } from '../constitution-runtime/wp-011-kernel';
import { createAgentSocietyLayer } from '../constitution-runtime/wp-020-kernel';
import { createSovereignIntelligenceLayer } from '../sovereign-intelligence/sovereign-intelligence-layer';
import { FounderSessionService } from '../sovereign-identity/founder-session-service';
import { FounderIdentityService } from '../sovereign-identity/founder-identity-service';
import { SovereignAuthorityService } from '../sovereign-identity/sovereign-authority-service';
import { RuntimeObservatoryService } from './runtime-observatory-service';
import { IncidentIntelligenceService } from './incident-intelligence-service';
import { EmpireTreasuryService } from './empire-treasury-service';
import { PredictiveCommandService } from './predictive-command-service';
import { ExecutiveIntelligenceService } from './executive-intelligence-service';
import { FounderApprovalGateService } from './founder-approval-gate-service';
import { SovereignGrantService } from './sovereign-grant-service';
import { EmpireChronicleService } from './empire-chronicle-service';
import { OsHeartbeatService } from './os-heartbeat-service';
import { PlatformVitalityService } from './platform-vitality-service';
import { SovereignReportingService } from './sovereign-reporting-service';
import { SovereignCommandLayer } from './sovereign-command-layer';
import type { OsHeartbeat } from './sovereign-command-types';

// ── Shared kernel instances ──────────────────────────────────────────────────

const l3 = createSchedulingKernel();
const l4 = createMemoryLayer();
const l7 = createAgentSocietyLayer();
const l8 = createSovereignIntelligenceLayer(l4, l3);

// ── Helper: minimal healthy heartbeat ───────────────────────────────────────

function makeHealthyHeartbeat(): OsHeartbeat {
  return {
    heartbeatId: 'test-hb-001',
    timestamp: new Date(),
    l3Scheduling: { layerNumber: 3, queueLength: 0, totalEnqueued: 2 },
    l4Memory: { layerNumber: 4, cacheEntries: 5, constitutionalMemorySize: 4 },
    l7AgentSociety: { layerNumber: 7, activeAgents: 3 },
    l8Intelligence: { layerNumber: 8, availableSources: 1 },
    l10Chambers: [
      { chamberId: 'hujjah-al-damighah', status: 'HEALTHY', metrics: {}, message: '' },
      { chamberId: 'qiyamah-chamber', status: 'HEALTHY', metrics: {}, message: '' },
      { chamberId: 'ras-al-amr', status: 'HEALTHY', metrics: {}, message: '' },
      { chamberId: 'sovereign-high-council', status: 'HEALTHY', metrics: {}, message: '' },
    ],
    overallStatus: 'HEALTHY',
  };
}

function makeDegradedHeartbeat(): OsHeartbeat {
  return {
    ...makeHealthyHeartbeat(),
    heartbeatId: 'test-hb-degraded',
    l10Chambers: [
      { chamberId: 'hujjah-al-damighah', status: 'WARNING', metrics: {}, message: 'High latency' },
      { chamberId: 'qiyamah-chamber', status: 'HEALTHY', metrics: {}, message: '' },
      { chamberId: 'ras-al-amr', status: 'HEALTHY', metrics: {}, message: '' },
      { chamberId: 'sovereign-high-council', status: 'HEALTHY', metrics: {}, message: '' },
    ],
    overallStatus: 'DEGRADED',
  };
}

// ── Component 1: FounderSessionService ───────────────────────────────────────

describe('FounderSessionService', () => {
  let service: FounderSessionService;

  beforeEach(() => {
    service = new FounderSessionService();
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('FounderSessionService');
  });

  test('getSession returns null before any session is created', () => {
    expect(service.getSession()).toBeNull();
  });

  test('createSession creates a FOUNDER mode session', () => {
    const session = service.createSession('FOUNDER');
    expect(session.mode).toBe('FOUNDER');
    expect(typeof session.sessionId).toBe('string');
    expect(session.sessionId.length).toBeGreaterThan(0);
    expect(session.startedAt).toBeInstanceOf(Date);
    expect(session.switchedAt).toBeInstanceOf(Date);
  });

  test('createSession creates a USER mode session', () => {
    const session = service.createSession('USER');
    expect(session.mode).toBe('USER');
  });

  test('getSession returns the session after creation', () => {
    const session = service.createSession('FOUNDER');
    expect(service.getSession()).toStrictEqual(session);
  });

  test('updateMode switches mode while preserving sessionId', () => {
    const original = service.createSession('FOUNDER');
    const updated = service.updateMode('USER');
    expect(updated.mode).toBe('USER');
    expect(updated.sessionId).toBe(original.sessionId);
    expect(updated.startedAt).toStrictEqual(original.startedAt);
  });

  test('updateMode creates a new session if none exists', () => {
    const session = service.updateMode('USER');
    expect(session.mode).toBe('USER');
    expect(service.getSession()).not.toBeNull();
  });
});

// ── Component 2: FounderIdentityService ──────────────────────────────────────

describe('FounderIdentityService', () => {
  const testCredential = 'test-founder-secret-2026';
  const testHash = createHash('sha256').update(testCredential).digest('hex');
  let sessionService: FounderSessionService;
  let service: FounderIdentityService;

  beforeEach(() => {
    sessionService = new FounderSessionService();
    service = new FounderIdentityService(testHash, sessionService);
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('FounderIdentityService');
  });

  test('getCurrentMode is USER before any switch', () => {
    expect(service.getCurrentMode()).toBe('USER');
  });

  test('switchToFounderMode with correct credential returns FOUNDER session', () => {
    const session = service.switchToFounderMode(testCredential);
    expect(session.mode).toBe('FOUNDER');
    expect(service.getCurrentMode()).toBe('FOUNDER');
  });

  test('isFounderSession returns true for active session token', () => {
    const session = service.switchToFounderMode(testCredential);
    expect(service.isFounderSession(session.sessionId)).toBe(true);
  });

  test('isFounderSession returns false for unknown token', () => {
    expect(service.isFounderSession('unknown-token')).toBe(false);
  });

  test('switchToFounderMode with wrong credential throws', () => {
    expect(() => service.switchToFounderMode('wrong-password')).toThrow('Invalid founder credential');
  });

  test('switchToFounderMode with empty credentialHash throws', () => {
    const unconfigured = new FounderIdentityService('', sessionService);
    expect(() => unconfigured.switchToFounderMode(testCredential)).toThrow(
      'Founder credential not configured',
    );
  });

  test('switchToUserMode clears the active session token', () => {
    const founderSession = service.switchToFounderMode(testCredential);
    service.switchToUserMode();
    expect(service.isFounderSession(founderSession.sessionId)).toBe(false);
    expect(service.getCurrentMode()).toBe('USER');
  });
});

// ── Component 3: SovereignAuthorityService ────────────────────────────────────

describe('SovereignAuthorityService', () => {
  let sessionService: FounderSessionService;
  let service: SovereignAuthorityService;

  beforeEach(() => {
    sessionService = new FounderSessionService();
    service = new SovereignAuthorityService();
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('SovereignAuthorityService');
  });

  test('authorizeAction on FOUNDER session returns a valid token', () => {
    const session = sessionService.createSession('FOUNDER');
    const token = service.authorizeAction(session, 'SOVEREIGN_GRANT');
    expect(token.action).toBe('SOVEREIGN_GRANT');
    expect(token.sessionId).toBe(session.sessionId);
    expect(token.used).toBe(false);
    expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  test('authorizeAction on USER session throws', () => {
    const session = sessionService.createSession('USER');
    expect(() => service.authorizeAction(session, 'SOVEREIGN_GRANT')).toThrow(
      'Founder Mode required',
    );
  });

  test('isAuthorized returns true for a valid unused token', () => {
    const session = sessionService.createSession('FOUNDER');
    const token = service.authorizeAction(session, 'PLATFORM_COMMAND');
    expect(service.isAuthorized(token, 'PLATFORM_COMMAND')).toBe(true);
  });

  test('isAuthorized returns false for wrong action type', () => {
    const session = sessionService.createSession('FOUNDER');
    const token = service.authorizeAction(session, 'SOVEREIGN_GRANT');
    expect(service.isAuthorized(token, 'RUNTIME_INTERVENTION')).toBe(false);
  });

  test('revokeToken marks token as used', () => {
    const session = sessionService.createSession('FOUNDER');
    const token = service.authorizeAction(session, 'EMERGENCY_RECOVERY');
    service.revokeToken(token.tokenId);
    expect(service.isAuthorized(token, 'EMERGENCY_RECOVERY')).toBe(false);
  });
});

// ── Component 4: RuntimeObservatoryService ────────────────────────────────────

describe('RuntimeObservatoryService', () => {
  let service: RuntimeObservatoryService;

  beforeEach(() => {
    service = new RuntimeObservatoryService();
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('RuntimeObservatoryService');
  });

  test('starts with zero events', () => {
    expect(service.getEventCount()).toBe(0);
    expect(service.getRecentEvents()).toHaveLength(0);
  });

  test('recordEvent increments event count', () => {
    service.recordEvent({ eventType: 'SYSTEM_EVENT', source: 'test', detail: 'startup' });
    expect(service.getEventCount()).toBe(1);
  });

  test('getRecentEvents returns events in descending timestamp order', () => {
    service.recordEvent({ eventType: 'CHAMBER_REQUEST', source: 'a', detail: 'first' });
    service.recordEvent({ eventType: 'CHAMBER_REQUEST', source: 'b', detail: 'second' });
    const events = service.getRecentEvents(10);
    expect(events[0]!.detail).toBe('second');
    expect(events[1]!.detail).toBe('first');
  });

  test('getRecentEvents respects the limit parameter', () => {
    for (let i = 0; i < 20; i++) {
      service.recordEvent({ eventType: 'SYSTEM_EVENT', source: 'test', detail: `event-${i}` });
    }
    expect(service.getRecentEvents(5)).toHaveLength(5);
  });

  test('getEventsByType filters correctly', () => {
    service.recordEvent({ eventType: 'CHAMBER_REQUEST', source: 'x', detail: 'req' });
    service.recordEvent({ eventType: 'SYSTEM_EVENT', source: 'y', detail: 'sys' });
    const chamberEvents = service.getEventsByType('CHAMBER_REQUEST');
    expect(chamberEvents).toHaveLength(1);
    expect(chamberEvents[0]!.eventType).toBe('CHAMBER_REQUEST');
  });

  test('each recorded event has a unique eventId', () => {
    service.recordEvent({ eventType: 'SYSTEM_EVENT', source: 's', detail: 'd' });
    service.recordEvent({ eventType: 'SYSTEM_EVENT', source: 's', detail: 'd' });
    const events = service.getRecentEvents();
    expect(events[0]!.eventId).not.toBe(events[1]!.eventId);
  });
});

// ── Component 5: IncidentIntelligenceService ──────────────────────────────────

describe('IncidentIntelligenceService', () => {
  let service: IncidentIntelligenceService;

  beforeEach(() => {
    service = new IncidentIntelligenceService();
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('IncidentIntelligenceService');
  });

  test('no incidents when all chambers are HEALTHY', () => {
    const hb = makeHealthyHeartbeat();
    const incidents = service.detectIncidents(hb);
    expect(incidents).toHaveLength(0);
    expect(service.getOpenIncidents()).toHaveLength(0);
  });

  test('detects incident when a chamber is WARNING', () => {
    const hb = makeDegradedHeartbeat();
    const incidents = service.detectIncidents(hb);
    expect(incidents).toHaveLength(1);
    expect(incidents[0]!.chamberId).toBe('hujjah-al-damighah');
    expect(incidents[0]!.status).toBe('OPEN');
    expect(incidents[0]!.what).toBeTruthy();
    expect(incidents[0]!.why).toBeTruthy();
    expect(incidents[0]!.recommendation).toBeTruthy();
  });

  test('does not create duplicate incidents for the same open chamber', () => {
    const hb = makeDegradedHeartbeat();
    service.detectIncidents(hb);
    service.detectIncidents(hb);
    expect(service.getOpenIncidents()).toHaveLength(1);
  });

  test('auto-resolves incident when chamber becomes HEALTHY', () => {
    const degraded = makeDegradedHeartbeat();
    service.detectIncidents(degraded);
    expect(service.getOpenIncidents()).toHaveLength(1);

    const recovered = makeHealthyHeartbeat();
    service.detectIncidents(recovered);
    expect(service.getOpenIncidents()).toHaveLength(0);
    expect(service.getAllIncidents()[0]!.status).toBe('RESOLVED');
  });

  test('resolveIncident manually closes an incident', () => {
    const hb = makeDegradedHeartbeat();
    const [incident] = service.detectIncidents(hb);
    service.resolveIncident(incident!.incidentId, 'Manually fixed by operator');
    expect(service.getOpenIncidents()).toHaveLength(0);
    expect(service.getAllIncidents()[0]!.status).toBe('RESOLVED');
  });
});

// ── Component 6: EmpireTreasuryService ────────────────────────────────────────

describe('EmpireTreasuryService', () => {
  let service: EmpireTreasuryService;

  beforeEach(() => {
    service = new EmpireTreasuryService();
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('EmpireTreasuryService');
  });

  test('getSnapshot returns a valid treasury snapshot', async () => {
    const snapshot = await service.getSnapshot();
    expect(snapshot.snapshotId).toBeTruthy();
    expect(snapshot.generatedAt).toBeInstanceOf(Date);
    expect(typeof snapshot.aiCosts.dailyCost).toBe('number');
    expect(typeof snapshot.aiCosts.monthlyCost).toBe('number');
    expect(typeof snapshot.aiCosts.burnRatePerHour).toBe('number');
    expect(snapshot.aiCosts.providerBalances.length).toBeGreaterThanOrEqual(1);
  });

  test('RAM utilization reflects real process memory', async () => {
    const snapshot = await service.getSnapshot();
    expect(snapshot.utilization.ram.used).toBeGreaterThan(0);
    expect(snapshot.utilization.ram.total).toBeGreaterThan(0);
    expect(snapshot.utilization.ram.pct).toBeGreaterThanOrEqual(0);
    expect(snapshot.utilization.ram.pct).toBeLessThanOrEqual(100);
  });

  test('utilization object has all five required fields', async () => {
    const { utilization } = await service.getSnapshot();
    expect(utilization.storage).toBeDefined();
    expect(utilization.gpu).toBeDefined();
    expect(utilization.cpu).toBeDefined();
    expect(utilization.ram).toBeDefined();
    expect(utilization.queue).toBeDefined();
  });

  test('revenue and subscription stats are initialized', async () => {
    const snapshot = await service.getSnapshot();
    expect(typeof snapshot.revenue.daily).toBe('number');
    expect(typeof snapshot.subscriptions.active).toBe('number');
    expect(typeof snapshot.subscriptions.mrr).toBe('number');
  });
});

// ── Component 7: PredictiveCommandService ─────────────────────────────────────

describe('PredictiveCommandService', () => {
  let service: PredictiveCommandService;
  let treasury: Awaited<ReturnType<EmpireTreasuryService['getSnapshot']>>;

  beforeAll(async () => {
    service = new PredictiveCommandService();
    treasury = await new EmpireTreasuryService().getSnapshot();
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('PredictiveCommandService');
  });

  test('generatePredictions returns an array (may be empty if utilization is low)', () => {
    const hb = makeHealthyHeartbeat();
    const predictions = service.generatePredictions(hb, treasury);
    expect(Array.isArray(predictions)).toBe(true);
  });

  test('predictions conform to Prediction shape when present', () => {
    const hb = makeHealthyHeartbeat();
    const predictions = service.generatePredictions(hb, treasury);
    for (const p of predictions) {
      expect(typeof p.predictionId).toBe('string');
      expect(typeof p.confidence).toBe('number');
      expect(p.confidence).toBeGreaterThanOrEqual(0);
      expect(p.confidence).toBeLessThanOrEqual(1);
      expect(typeof p.estimatedTimeToEventMs).toBe('number');
      expect(['ADVISORY', 'WARNING', 'CRITICAL']).toContain(p.severity);
      expect(p.generatedAt).toBeInstanceOf(Date);
    }
  });

  test('getActivePredictions returns last generated predictions', () => {
    const hb = makeHealthyHeartbeat();
    service.generatePredictions(hb, treasury);
    expect(Array.isArray(service.getActivePredictions())).toBe(true);
  });
});

// ── Component 8: ExecutiveIntelligenceService ─────────────────────────────────

describe('ExecutiveIntelligenceService', () => {
  let service: ExecutiveIntelligenceService;
  let treasury: Awaited<ReturnType<EmpireTreasuryService['getSnapshot']>>;

  beforeAll(async () => {
    service = new ExecutiveIntelligenceService();
    treasury = await new EmpireTreasuryService().getSnapshot();
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('ExecutiveIntelligenceService');
  });

  test('analyze returns an array', () => {
    const hb = makeHealthyHeartbeat();
    const recs = service.analyze(hb, [], treasury);
    expect(Array.isArray(recs)).toBe(true);
  });

  test('analyze generates a recommendation for degraded chambers', () => {
    const hb = makeDegradedHeartbeat();
    const recs = service.analyze(hb, [], treasury);
    const chamberRec = recs.find((r) => r.category === 'CHAMBER_OPTIMIZATION');
    expect(chamberRec).toBeDefined();
    expect(chamberRec!.requiredAction).toBe('RUNTIME_INTERVENTION');
  });

  test('recommendations are sorted by urgency (CRITICAL first)', () => {
    const hb = makeDegradedHeartbeat();
    const degradedHb: OsHeartbeat = {
      ...hb,
      l10Chambers: [
        { chamberId: 'hujjah-al-damighah', status: 'CRITICAL', metrics: {}, message: 'Down' },
        { chamberId: 'qiyamah-chamber', status: 'WARNING', metrics: {}, message: 'Slow' },
        { chamberId: 'ras-al-amr', status: 'HEALTHY', metrics: {}, message: '' },
        { chamberId: 'sovereign-high-council', status: 'HEALTHY', metrics: {}, message: '' },
      ],
    };
    const recs = service.analyze(degradedHb, [], treasury);
    expect(recs.length).toBeGreaterThanOrEqual(2);
    const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    for (let i = 0; i < recs.length - 1; i++) {
      expect(urgencyOrder[recs[i]!.urgency]).toBeLessThanOrEqual(urgencyOrder[recs[i + 1]!.urgency]);
    }
  });

  test('getLatestRecommendations reflects last analyze call', () => {
    const hb = makeHealthyHeartbeat();
    service.analyze(hb, [], treasury);
    expect(Array.isArray(service.getLatestRecommendations())).toBe(true);
  });

  test('generates recommendation when intelligence sources are missing', () => {
    const hb: OsHeartbeat = {
      ...makeHealthyHeartbeat(),
      l8Intelligence: { layerNumber: 8, availableSources: 0 },
    };
    const recs = service.analyze(hb, [], treasury);
    const silRec = recs.find((r) => r.requiredAction === 'RUNTIME_INTERVENTION');
    expect(silRec).toBeDefined();
  });
});

// ── Component 9: FounderApprovalGateService ───────────────────────────────────

describe('FounderApprovalGateService', () => {
  let chronicle: EmpireChronicleService;
  let gate: FounderApprovalGateService;
  let authService: SovereignAuthorityService;
  let founderSession: ReturnType<FounderSessionService['createSession']>;

  beforeEach(() => {
    const l4Fresh = createMemoryLayer();
    chronicle = new EmpireChronicleService(l4Fresh);
    gate = new FounderApprovalGateService(chronicle);
    authService = new SovereignAuthorityService();
    founderSession = new FounderSessionService().createSession('FOUNDER');
  });

  test('serviceName is correct', () => {
    expect(gate.serviceName).toBe('FounderApprovalGateService');
  });

  test('submitForApproval creates a PENDING approval', async () => {
    const rec = {
      recommendationId: 'rec-001',
      category: 'CHAMBER_OPTIMIZATION' as const,
      title: 'Test recommendation',
      rationale: 'Test',
      requiredAction: 'RUNTIME_INTERVENTION' as const,
      estimatedImpact: 'Low',
      urgency: 'MEDIUM' as const,
      generatedAt: new Date(),
    };
    const approval = await gate.submitForApproval(rec);
    expect(approval.status).toBe('PENDING');
    expect(approval.actionType).toBe('RUNTIME_INTERVENTION');
    expect(approval.approvalId).toBeTruthy();
  });

  test('getPendingApprovals returns submitted approvals', async () => {
    const rec = {
      recommendationId: 'rec-002',
      category: 'COST_REDUCTION' as const,
      title: 'Cost rec',
      rationale: 'Save money',
      requiredAction: 'COST_OPTIMIZATION' as const,
      estimatedImpact: 'High savings',
      urgency: 'HIGH' as const,
      generatedAt: new Date(),
    };
    await gate.submitForApproval(rec);
    const pending = await gate.getPendingApprovals();
    expect(pending).toHaveLength(1);
  });

  test('approve with valid token resolves the approval', async () => {
    const rec = {
      recommendationId: 'rec-003',
      category: 'INFRASTRUCTURE_SCALING' as const,
      title: 'Scale up',
      rationale: 'Need more capacity',
      requiredAction: 'RESOURCE_REDISTRIBUTION' as const,
      estimatedImpact: 'Better performance',
      urgency: 'HIGH' as const,
      generatedAt: new Date(),
    };
    const approval = await gate.submitForApproval(rec);
    const token = authService.authorizeAction(founderSession, 'RESOURCE_REDISTRIBUTION');
    const result = await gate.approve(approval.approvalId, token);
    expect(result.status).toBe('APPROVED');
    expect(result.executionToken).toBeTruthy();
    const pending = await gate.getPendingApprovals();
    expect(pending).toHaveLength(0);
  });

  test('approve with wrong action token throws', async () => {
    const rec = {
      recommendationId: 'rec-004',
      category: 'RUNTIME_OPTIMIZATION' as const,
      title: 'Optimize runtime',
      rationale: 'Too slow',
      requiredAction: 'RUNTIME_INTERVENTION' as const,
      estimatedImpact: 'Faster',
      urgency: 'MEDIUM' as const,
      generatedAt: new Date(),
    };
    const approval = await gate.submitForApproval(rec);
    const wrongToken = authService.authorizeAction(founderSession, 'SOVEREIGN_GRANT');
    await expect(gate.approve(approval.approvalId, wrongToken)).rejects.toThrow(
      'does not match required action',
    );
  });

  test('reject sets status to REJECTED with reason', async () => {
    const rec = {
      recommendationId: 'rec-005',
      category: 'MODEL_ROUTING' as const,
      title: 'Switch model',
      rationale: 'Better accuracy',
      requiredAction: 'AI_PROVIDER_SWITCH' as const,
      estimatedImpact: 'Improved quality',
      urgency: 'LOW' as const,
      generatedAt: new Date(),
    };
    const approval = await gate.submitForApproval(rec);
    await gate.reject(approval.approvalId, 'Not the right time');
    const all = gate.getAllApprovals();
    expect(all[0]!.status).toBe('REJECTED');
    expect(all[0]!.rejectionReason).toBe('Not the right time');
  });
});

// ── Component 10: SovereignGrantService ───────────────────────────────────────

describe('SovereignGrantService', () => {
  let chronicle: EmpireChronicleService;
  let service: SovereignGrantService;

  beforeEach(() => {
    chronicle = new EmpireChronicleService(createMemoryLayer());
    service = new SovereignGrantService(chronicle);
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('SovereignGrantService');
  });

  test('issueGrant creates an ACTIVE grant', () => {
    const grant = service.issueGrant({
      grantType: 'CREDITS',
      targetUserId: 'user-001',
      value: '500',
      reason: 'Beta tester reward',
      expiresAt: null,
    });
    expect(grant.status).toBe('ACTIVE');
    expect(grant.grantedBy).toBe('FOUNDER');
    expect(grant.grantType).toBe('CREDITS');
    expect(grant.grantId).toBeTruthy();
  });

  test('getActiveGrants returns only active grants', () => {
    const g1 = service.issueGrant({
      grantType: 'SUBSCRIPTION',
      targetUserId: 'user-002',
      value: 'pro-monthly',
      reason: 'Early adopter',
      expiresAt: null,
    });
    service.revokeGrant(g1.grantId);
    service.issueGrant({
      grantType: 'LIFETIME_ACCESS',
      targetUserId: 'user-003',
      value: 'all',
      reason: 'Partner',
      expiresAt: null,
    });
    expect(service.getActiveGrants()).toHaveLength(1);
  });

  test('getGrants filtered by userId returns correct grants', () => {
    service.issueGrant({
      grantType: 'CREDITS',
      targetUserId: 'alice',
      value: '100',
      reason: 'Gift',
      expiresAt: null,
    });
    service.issueGrant({
      grantType: 'CREDITS',
      targetUserId: 'bob',
      value: '200',
      reason: 'Gift',
      expiresAt: null,
    });
    expect(service.getGrants('alice')).toHaveLength(1);
    expect(service.getGrants('bob')).toHaveLength(1);
    expect(service.getGrants()).toHaveLength(2);
  });

  test('grant issuance records an entry in the chronicle', () => {
    service.issueGrant({
      grantType: 'FEATURE_ACCESS',
      targetUserId: 'user-chronicle',
      value: 'beta-feature',
      reason: 'Test',
      expiresAt: null,
    });
    const entries = chronicle.getByCategory('GRANT');
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });
});

// ── Component 11: EmpireChronicleService ──────────────────────────────────────

describe('EmpireChronicleService', () => {
  let service: EmpireChronicleService;

  beforeEach(() => {
    service = new EmpireChronicleService(createMemoryLayer());
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('EmpireChronicleService');
  });

  test('record creates a chronicle entry with timestamp and entryId', () => {
    const entry = service.record({
      category: 'MILESTONE',
      title: 'AZMA OS Layer 9 activated',
      narrative: 'Sovereign Command Layer entered production.',
      significance: 'HISTORIC',
    });
    expect(entry.entryId).toBeTruthy();
    expect(entry.timestamp).toBeInstanceOf(Date);
    expect(entry.category).toBe('MILESTONE');
    expect(entry.significance).toBe('HISTORIC');
  });

  test('getChronicle returns entries sorted newest first', () => {
    service.record({ category: 'ROUTINE' as never, title: 'first', narrative: '', significance: 'ROUTINE' });
    service.record({ category: 'COMMAND', title: 'second', narrative: '', significance: 'NOTABLE' });
    const entries = service.getChronicle();
    expect(entries[0]!.title).toBe('second');
  });

  test('getChronicle respects limit parameter', () => {
    for (let i = 0; i < 10; i++) {
      service.record({ category: 'COMMAND', title: `entry-${i}`, narrative: '', significance: 'ROUTINE' });
    }
    expect(service.getChronicle(5)).toHaveLength(5);
  });

  test('getByCategory filters correctly', () => {
    service.record({ category: 'MILESTONE', title: 'M1', narrative: '', significance: 'HISTORIC' });
    service.record({ category: 'INCIDENT', title: 'I1', narrative: '', significance: 'NOTABLE' });
    service.record({ category: 'MILESTONE', title: 'M2', narrative: '', significance: 'NOTABLE' });
    expect(service.getByCategory('MILESTONE')).toHaveLength(2);
    expect(service.getByCategory('INCIDENT')).toHaveLength(1);
  });
});

// ── Component 12: OsHeartbeatService ─────────────────────────────────────────

describe('OsHeartbeatService', () => {
  let service: OsHeartbeatService;

  beforeAll(() => {
    service = new OsHeartbeatService(l3, l4, l7, l8, () => []);
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('OsHeartbeatService');
  });

  test('getHeartbeat returns a valid OsHeartbeat', async () => {
    const hb = await service.getHeartbeat();
    expect(hb.heartbeatId).toBeTruthy();
    expect(hb.timestamp).toBeInstanceOf(Date);
    expect(hb.l3Scheduling.layerNumber).toBe(3);
    expect(hb.l4Memory.layerNumber).toBe(4);
    expect(hb.l7AgentSociety.layerNumber).toBe(7);
    expect(hb.l8Intelligence.layerNumber).toBe(8);
    expect(Array.isArray(hb.l10Chambers)).toBe(true);
    expect(['HEALTHY', 'DEGRADED', 'CRITICAL', 'UNKNOWN']).toContain(hb.overallStatus);
  });

  test('L3 queue metrics are valid numbers', async () => {
    const hb = await service.getHeartbeat();
    expect(typeof hb.l3Scheduling.queueLength).toBe('number');
    expect(typeof hb.l3Scheduling.totalEnqueued).toBe('number');
    expect(hb.l3Scheduling.totalEnqueued).toBeGreaterThanOrEqual(0);
  });

  test('L4 memory metrics are valid numbers', async () => {
    const hb = await service.getHeartbeat();
    expect(typeof hb.l4Memory.cacheEntries).toBe('number');
    expect(typeof hb.l4Memory.constitutionalMemorySize).toBe('number');
  });

  test('L8 intelligence source count is correct', async () => {
    const hb = await service.getHeartbeat();
    expect(hb.l8Intelligence.availableSources).toBe(l8.getAvailableSources().length);
  });
});

// ── Component 13: PlatformVitalityService ─────────────────────────────────────

describe('PlatformVitalityService', () => {
  let heartbeatSvc: OsHeartbeatService;
  let incidentSvc: IncidentIntelligenceService;
  let treasurySvc: EmpireTreasuryService;
  let service: PlatformVitalityService;

  beforeAll(() => {
    heartbeatSvc = new OsHeartbeatService(l3, l4, l7, l8, () => []);
    incidentSvc = new IncidentIntelligenceService();
    treasurySvc = new EmpireTreasuryService();
    service = new PlatformVitalityService(heartbeatSvc, incidentSvc, treasurySvc);
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('PlatformVitalityService');
  });

  test('fiveQuestions returns all five boolean/array fields', async () => {
    const q = await service.fiveQuestions();
    expect(typeof q.isAlive).toBe('boolean');
    expect(typeof q.isHealthy).toBe('boolean');
    expect(typeof q.isProfitable).toBe('boolean');
    expect(typeof q.areUsersSucceeding).toBe('boolean');
    expect(Array.isArray(q.attentionRequired)).toBe(true);
  });

  test('isAlive is true when OS layers are online', async () => {
    const q = await service.fiveQuestions();
    expect(q.isAlive).toBe(true);
  });

  test('getVitalitySignal returns a PlatformVitalitySignal', async () => {
    const signal = await service.getVitalitySignal();
    expect(signal.signalId).toBeTruthy();
    expect(signal.checkedAt).toBeInstanceOf(Date);
    expect(['ALIVE', 'DEGRADED', 'CRITICAL', 'OFFLINE']).toContain(signal.status);
    expect(typeof signal.message).toBe('string');
    expect(signal.message.length).toBeGreaterThan(0);
  });
});

// ── Component 14: SovereignReportingService ───────────────────────────────────

describe('SovereignReportingService', () => {
  let service: SovereignReportingService;

  beforeAll(() => {
    service = new SovereignReportingService(l3, l4, l7, l8);
  });

  test('serviceName is correct', () => {
    expect(service.serviceName).toBe('SovereignReportingService');
  });

  test('generateReport returns a valid SovereignReport for DAILY type', async () => {
    const report = await service.generateReport('DAILY');
    expect(report.reportId).toBeTruthy();
    expect(report.type).toBe('DAILY');
    expect(report.generatedAt).toBeInstanceOf(Date);
    expect(report.sections.length).toBeGreaterThanOrEqual(1);
    expect(report.summary.length).toBeGreaterThan(0);
    expect(report.period.from).toBeInstanceOf(Date);
    expect(report.period.to).toBeInstanceOf(Date);
  });

  test('generateReport for RUNTIME type contains runtime kernel section', async () => {
    const report = await service.generateReport('RUNTIME');
    const runtimeSection = report.sections.find((s) => s.title === 'Runtime Kernel');
    expect(runtimeSection).toBeDefined();
    expect(runtimeSection!.metrics['l3TotalEnqueued']).toBeDefined();
  });

  test('getRecentReports accumulates generated reports', async () => {
    await service.generateReport('PERFORMANCE');
    await service.generateReport('WEEKLY');
    const recent = service.getRecentReports(10);
    expect(recent.length).toBeGreaterThanOrEqual(2);
  });

  test('getRecentReports respects limit', async () => {
    const limited = service.getRecentReports(1);
    expect(limited).toHaveLength(1);
  });
});

// ── Component 15: SovereignCommandLayer ──────────────────────────────────────

describe('SovereignCommandLayer', () => {
  let layer: SovereignCommandLayer;

  beforeAll(() => {
    layer = new SovereignCommandLayer(l3, l4, l7, l8, () => []);
  });

  test('has correct Layer 9 identity contract', () => {
    expect(layer.layerName).toBe('SovereignCommand');
    expect(layer.version).toBe('1.0.0');
    expect(layer.layerNumber).toBe(9);
  });

  test('all 11 sub-services are initialized with correct serviceName values', () => {
    expect(layer.platformVitality.serviceName).toBe('PlatformVitalityService');
    expect(layer.osHeartbeat.serviceName).toBe('OsHeartbeatService');
    expect(layer.runtimeObservatory.serviceName).toBe('RuntimeObservatoryService');
    expect(layer.incidentIntelligence.serviceName).toBe('IncidentIntelligenceService');
    expect(layer.sovereignReporting.serviceName).toBe('SovereignReportingService');
    expect(layer.sovereignGrants.serviceName).toBe('SovereignGrantService');
    expect(layer.empireChronicle.serviceName).toBe('EmpireChronicleService');
    expect(layer.executiveIntelligence.serviceName).toBe('ExecutiveIntelligenceService');
    expect(layer.empireTreasury.serviceName).toBe('EmpireTreasuryService');
    expect(layer.predictiveCommand.serviceName).toBe('PredictiveCommandService');
    expect(layer.founderApprovalGate.serviceName).toBe('FounderApprovalGateService');
  });

  test('layer can be used as SovereignCommandContract — structural type check', () => {
    const contract = layer;
    expect(typeof contract.platformVitality.fiveQuestions).toBe('function');
    expect(typeof contract.osHeartbeat.getHeartbeat).toBe('function');
    expect(typeof contract.empireTreasury.getSnapshot).toBe('function');
    expect(typeof contract.founderApprovalGate.submitForApproval).toBe('function');
    expect(typeof contract.empireChronicle.record).toBe('function');
  });

  test('end-to-end: heartbeat flows through executive intelligence cycle', async () => {
    const hb = await layer.osHeartbeat.getHeartbeat();
    const treasury = await layer.empireTreasury.getSnapshot();
    const predictions = layer.predictiveCommand.generatePredictions(hb, treasury);
    const recommendations = layer.executiveIntelligence.analyze(hb, predictions, treasury);

    expect(hb.l3Scheduling.layerNumber).toBe(3);
    expect(Array.isArray(predictions)).toBe(true);
    expect(Array.isArray(recommendations)).toBe(true);
  }, 30_000);

  test('approval gate integrates with chronicle on submission', async () => {
    const rec = layer.executiveIntelligence.getLatestRecommendations()[0];
    if (rec !== undefined) {
      await layer.founderApprovalGate.submitForApproval(rec);
      const chronicleEntries = layer.empireChronicle.getByCategory('COMMAND');
      expect(chronicleEntries.length).toBeGreaterThanOrEqual(1);
    }
  }, 10_000);
});
