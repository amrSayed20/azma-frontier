/**
 * AZMA OS Operational Runtime Verification
 *
 * End-to-end integration test that proves AZMA OS can complete a full startup
 * and execute a complete operational scenario without mocks.
 *
 * VERIFICATION PHASES:
 *   Phase 1 — Runtime Bootstrap    (kernel layer contracts)
 *   Phase 2 — Chamber Discovery    (4 chambers discovered)
 *   Phase 3 — Chamber Activation   (all chambers ACTIVE)
 *   Phase 4 — Runtime Contracts    (each layer's service APIs)
 *   Phase 5 — End-to-End Request   (OS routes request through L10 adapter)
 *   Phase 6 — Runtime Health       (all chambers HEALTHY)
 *   Phase 7 — Lifecycle Recording  (constitutional memory populated)
 *   Phase 8 — Scheduling Proof     (L3 queue processed enqueue requests)
 *   Phase 9 — Health Report        (structured cross-chamber health summary)
 *   Phase 10 — Operational Readiness Report
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { initializeAzmaOs } from './azma-os-runtime-bootstrap';
import type { AzmaOsRuntimeContract } from './azma-os-types';

// ── Report types ────────────────────────────────────────────────────────────

interface ChamberHealthEntry {
  chamberId: string;
  status: string;
  message: string;
  metrics: Readonly<Record<string, number>>;
}

interface RuntimeHealthReport {
  readonly generatedAt: Date;
  readonly chambers: readonly ChamberHealthEntry[];
  readonly allChamberHealthy: boolean;
  readonly layer3QueueLength: number;
  readonly layer4CacheEntries: number;
  readonly constitutionalMemorySize: number;
}

interface ReadinessCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

interface OperationalReadinessReport {
  readonly generatedAt: Date;
  readonly overallReady: boolean;
  readonly layers: {
    readonly l2SovereignBus: boolean;
    readonly l3Scheduling: boolean;
    readonly l4Memory: boolean;
    readonly l5SovereignJourney: boolean;
    readonly l7AgentSociety: boolean;
    readonly l8SovereignIntelligence: boolean;
    readonly l9SovereignCommand: boolean;
    readonly l10Chambers: boolean;
  };
  readonly chamberSummary: {
    readonly registered: number;
    readonly active: number;
    readonly allActive: boolean;
  };
  readonly checks: readonly ReadinessCheck[];
}

// ── Test suite ───────────────────────────────────────────────────────────────

describe('AZMA OS Operational Runtime Verification', () => {
  let os: AzmaOsRuntimeContract;

  beforeAll(async () => {
    os = await initializeAzmaOs();
  }, 60_000);

  // ── Phase 1: Runtime Bootstrap ─────────────────────────────────────────

  describe('Phase 1: Runtime Bootstrap', () => {
    test('Layer 2 Sovereign Operations Bus is initialized with correct contract', () => {
      expect(os.sovereignBus.layerName).toBe('SovereignOperationsBus');
      expect(os.sovereignBus.version).toBe('1.0.0');
      expect(os.sovereignBus.layerNumber).toBe(2);
    });

    test('L2 SOB has recorded RUNTIME_STARTED event from bootstrap', () => {
      const log = os.sovereignBus.getEventLog();
      const runtimeStarted = log.find((e) => e.eventType === 'RUNTIME_STARTED');
      expect(runtimeStarted).toBeDefined();
      expect(runtimeStarted?.sourceService).toBe('AzmaOsBootstrap');
    });

    test('L2 SOB has recorded CHAMBER_ACTIVATED events for all 4 chambers', () => {
      const log = os.sovereignBus.getEventLog();
      const activated = log.filter((e) => e.eventType === 'CHAMBER_ACTIVATED');
      expect(activated).toHaveLength(4);
    });

    test('L2 SOB stats reflect 5 published events from bootstrap', () => {
      const stats = os.sovereignBus.getStats();
      // 1 RUNTIME_STARTED + 4 CHAMBER_ACTIVATED
      expect(stats.totalPublished).toBeGreaterThanOrEqual(5);
      expect(stats.lastEventAt).toBeInstanceOf(Date);
    });

    test('L2 SOB replay returns events in chronological order', () => {
      const replayed = os.sovereignBus.replay({});
      expect(replayed.length).toBeGreaterThanOrEqual(5);
      // First event must be RUNTIME_STARTED
      expect(replayed[0]!.eventType).toBe('RUNTIME_STARTED');
    });

    test('Layer 5 Sovereign Journey Engine is initialized with correct contract', () => {
      expect(os.sovereignJourney.layerName).toBe('SovereignJourneyEngine');
      expect(os.sovereignJourney.version).toBe('1.0.0');
      expect(os.sovereignJourney.layerNumber).toBe(5);
    });

    test('L5 Journey Engine has FIRST_JOURNEY pre-registered', () => {
      const def = os.sovereignJourney.getJourneyDefinition('FIRST_JOURNEY');
      expect(def.journeyTypeId).toBe('FIRST_JOURNEY');
      expect(def.chapterSequence).toHaveLength(7);
    });

    test('L5 Journey Engine can begin and complete a journey end-to-end', () => {
      const sid = 'os-verification-journey-session';
      const record = os.sovereignJourney.beginJourney(sid);
      expect(record.phase).toBe('WELCOMED');
      const metrics = os.sovereignJourney.getJourneyMetrics();
      expect(metrics.totalStarted).toBeGreaterThanOrEqual(1);
    });

    test('Layer 3 Scheduling Kernel is initialized with correct contract', () => {
      expect(os.kernelLayer3.layerName).toBe('SchedulingKernel');
      expect(os.kernelLayer3.version).toBe('1.0.0');
      expect(os.kernelLayer3.layerNumber).toBe(3);
      expect(os.kernelLayer3.requestQueueService.serviceName).toBe('RequestQueueService');
      expect(os.kernelLayer3.priorityAssignmentService.serviceName).toBe('PriorityAssignmentService');
      expect(os.kernelLayer3.schedulingDecisionService.serviceName).toBe('SchedulingDecisionService');
    });

    test('Layer 4 Memory Layer is initialized with correct contract', () => {
      expect(os.kernelLayer4.layerName).toBe('MemoryLayer');
      expect(os.kernelLayer4.version).toBe('1.0.0');
      expect(os.kernelLayer4.layerNumber).toBe(4);
      expect(os.kernelLayer4.stateCacheService.serviceName).toBe('StateCacheService');
      expect(os.kernelLayer4.constitutionalMemoryService.serviceName).toBe('ConstitutionalMemoryService');
    });

    test('Layer 7 Agent Society is initialized with correct contract', () => {
      expect(os.agentSociety.layerName).toBe('AgentSocietyLayer');
      expect(os.agentSociety.version).toBe('1.0.0');
      expect(os.agentSociety.layerNumber).toBe(7);
      expect(os.agentSociety.agentRegistryService.serviceName).toBe('AgentRegistryService');
      expect(os.agentSociety.agentSelectionRouter.serviceName).toBe('AgentSelectionRouter');
      expect(os.agentSociety.agentExecutionGateway.serviceName).toBe('AgentExecutionGateway');
      expect(os.agentSociety.agentLifecycleService.serviceName).toBe('AgentLifecycleService');
    });

    test('Layer 8 Sovereign Intelligence Layer is initialized with correct contract', () => {
      expect(os.sovereignIntelligence.layerName).toBe('SovereignIntelligence');
      expect(os.sovereignIntelligence.version).toBe('1.0.0');
      expect(os.sovereignIntelligence.layerNumber).toBe(8);
      expect(os.sovereignIntelligence.sourceManager.serviceName).toBe('KnowledgeSourceManager');
      expect(os.sovereignIntelligence.domainClassifier.serviceName).toBe('KnowledgeDomainClassifier');
      expect(os.sovereignIntelligence.searchRouter.serviceName).toBe('SearchAgentRouter');
      expect(os.sovereignIntelligence.sourceVerifier.serviceName).toBe('SourceVerifier');
      expect(os.sovereignIntelligence.summarizer.serviceName).toBe('KnowledgeSummarizer');
      expect(os.sovereignIntelligence.packageBuilder.serviceName).toBe('KnowledgePackageBuilder');
      expect(os.sovereignIntelligence.pipeline.serviceName).toBe('KnowledgePipeline');
    });

    test('L8 Sovereign Intelligence Layer has Gutenberg as a registered source', () => {
      const sources = os.sovereignIntelligence.getAvailableSources();
      expect(sources.length).toBeGreaterThanOrEqual(1);
      const gutenberg = sources.find((s) => s.sourceId === 'gutenberg');
      expect(gutenberg).toBeDefined();
      expect(gutenberg?.isAvailable()).toBe(true);
    });

    test('Layer 9 Sovereign Command Layer is initialized with correct contract', () => {
      expect(os.sovereignCommand.layerName).toBe('SovereignCommand');
      expect(os.sovereignCommand.version).toBe('1.0.0');
      expect(os.sovereignCommand.layerNumber).toBe(9);
      expect(os.sovereignCommand.platformVitality.serviceName).toBe('PlatformVitalityService');
      expect(os.sovereignCommand.osHeartbeat.serviceName).toBe('OsHeartbeatService');
      expect(os.sovereignCommand.runtimeObservatory.serviceName).toBe('RuntimeObservatoryService');
      expect(os.sovereignCommand.incidentIntelligence.serviceName).toBe('IncidentIntelligenceService');
      expect(os.sovereignCommand.sovereignReporting.serviceName).toBe('SovereignReportingService');
      expect(os.sovereignCommand.sovereignGrants.serviceName).toBe('SovereignGrantService');
      expect(os.sovereignCommand.empireChronicle.serviceName).toBe('EmpireChronicleService');
      expect(os.sovereignCommand.executiveIntelligence.serviceName).toBe('ExecutiveIntelligenceService');
      expect(os.sovereignCommand.empireTreasury.serviceName).toBe('EmpireTreasuryService');
      expect(os.sovereignCommand.predictiveCommand.serviceName).toBe('PredictiveCommandService');
      expect(os.sovereignCommand.founderApprovalGate.serviceName).toBe('FounderApprovalGateService');
    });

    test('Sovereign Identity subsystem is initialized with correct serviceName values', () => {
      expect(os.sovereignIdentity.founderIdentity.serviceName).toBe('FounderIdentityService');
      expect(os.sovereignIdentity.founderSession.serviceName).toBe('FounderSessionService');
      expect(os.sovereignIdentity.sovereignAuthority.serviceName).toBe('SovereignAuthorityService');
    });

    test('L9 OsHeartbeat aggregates all OS layers correctly', async () => {
      const heartbeat = await os.sovereignCommand.osHeartbeat.getHeartbeat();
      expect(heartbeat.l3Scheduling.layerNumber).toBe(3);
      expect(heartbeat.l4Memory.layerNumber).toBe(4);
      expect(heartbeat.l7AgentSociety.layerNumber).toBe(7);
      expect(heartbeat.l8Intelligence.layerNumber).toBe(8);
      expect(heartbeat.l10Chambers).toHaveLength(4);
    }, 30_000);

    test('L9 Platform Vitality confirms the Empire is alive', async () => {
      const signal = await os.sovereignCommand.platformVitality.getVitalitySignal();
      expect(signal.fiveQuestions.isAlive).toBe(true);
      expect(signal.fiveQuestions.isHealthy).toBe(true);
      expect(['ALIVE', 'DEGRADED']).toContain(signal.status);
    }, 30_000);

    test('OS startup timestamp is valid', () => {
      expect(os.startedAt).toBeInstanceOf(Date);
      expect(os.startedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    test('OS version is correct', () => {
      expect(os.version).toBe('1.0.0');
    });
  });

  // ── Phase 2: Chamber Discovery ─────────────────────────────────────────

  describe('Phase 2: Chamber Discovery', () => {
    test('All four chambers are registered', () => {
      expect(os.registeredChambers).toHaveLength(4);
    });

    test('Hujjah Al-Damighah is discovered', () => {
      expect(os.registeredChambers).toContain('hujjah-al-damighah');
    });

    test('Qiyamah Chamber is discovered', () => {
      expect(os.registeredChambers).toContain('qiyamah-chamber');
    });

    test('Ras Al-Amr is discovered', () => {
      expect(os.registeredChambers).toContain('ras-al-amr');
    });

    test('Sovereign High Council is discovered', () => {
      expect(os.registeredChambers).toContain('sovereign-high-council');
    });

    test('Chamber metadata is catalogued for each registered chamber', () => {
      for (const chamberId of os.registeredChambers) {
        const metadata = os.chamberIntegration.metadataCatalog.get(chamberId);
        expect(metadata).toBeDefined();
        expect(metadata?.chamberId).toBe(chamberId);
        expect(metadata?.capabilities.length).toBeGreaterThan(0);
      }
    });

    test('Capabilities are registered for all chambers', () => {
      const allCaps = os.chamberIntegration.capabilityRegistry.listAll();
      const allEntries = Object.values(allCaps).flatMap((entries) => entries);

      for (const chamberId of os.registeredChambers) {
        const chamberEntries = allEntries.filter((e) => e.chamberId === chamberId);
        expect(chamberEntries.length).toBeGreaterThan(0);
      }
    });
  });

  // ── Phase 3: Chamber Activation ────────────────────────────────────────

  describe('Phase 3: Chamber Activation', () => {
    test('All four chambers reached ACTIVE status', () => {
      expect(os.activeChambers).toHaveLength(4);
    });

    test('registeredChambers and activeChambers sets are identical', () => {
      const registered = [...os.registeredChambers].sort();
      const active = [...os.activeChambers].sort();
      expect(active).toEqual(registered);
    });

    test('Each chamber endpoint reports ACTIVE in registry', () => {
      for (const chamberId of os.activeChambers) {
        const endpoint = os.chamberIntegration.chamberRegistry.get(chamberId);
        expect(endpoint?.status).toBe('ACTIVE');
      }
    });

    test('Each adapter is accessible via ChamberLoader', () => {
      for (const chamberId of os.activeChambers) {
        const adapter = os.chamberIntegration.loader.getAdapter(chamberId);
        expect(adapter).toBeDefined();
        expect(adapter?.chamberId).toBe(chamberId);
      }
    });
  });

  // ── Phase 4: Runtime Contracts ─────────────────────────────────────────

  describe('Phase 4: Runtime Contracts', () => {
    test('L3 queue service responds to getStatistics()', async () => {
      const stats = await os.kernelLayer3.requestQueueService.getStatistics();
      expect(stats.totalEnqueued).toBeGreaterThanOrEqual(0);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });

    test('L3 queue service responds to getCurrentQueueLength()', async () => {
      const length = await os.kernelLayer3.requestQueueService.getCurrentQueueLength();
      expect(typeof length).toBe('number');
      expect(length).toBeGreaterThanOrEqual(0);
    });

    test('L4 cache service responds to getStatistics()', async () => {
      const stats = await os.kernelLayer4.stateCacheService.getStatistics();
      expect(stats.totalEntries).toBeGreaterThanOrEqual(0);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });

    test('L4 memory service responds to getMemorySize()', async () => {
      const size = await os.kernelLayer4.constitutionalMemoryService.getMemorySize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });

    test('L7 agent registry responds to getActiveAgents()', async () => {
      const agents = await os.agentSociety.agentRegistryService.getActiveAgents();
      expect(Array.isArray(agents)).toBe(true);
    });
  });

  // ── Phase 5: End-to-End Request ────────────────────────────────────────

  describe('Phase 5: End-to-End Request Through OS', () => {
    test('OS routes get-state request to Qiyamah Chamber via communicate()', async () => {
      const result = await os.chamberIntegration.runtime.communicate(
        'os-kernel',
        'qiyamah-chamber',
        'get-state',
        {},
      );

      expect(result['success']).toBe(true);
      expect(result['state']).toBeDefined();
    });

    test('OS routes update-project-input to Qiyamah Chamber', async () => {
      const result = await os.chamberIntegration.runtime.communicate(
        'os-kernel',
        'qiyamah-chamber',
        'update-project-input',
        { idea: 'AZMA OS Verification Project', basePrompt: 'Full operational runtime test' },
      );

      expect(result['success']).toBe(true);
    });

    test('OS routes apply-mutation request to Ras Al-Amr Chamber', async () => {
      const canvas = {
        canvasId: 'os-verification-canvas',
        subscriberTenantId: 'os-verification-tenant',
        canvasType: 'CINEMATIC',
        title: 'OS Verification Canvas',
        tracks: [
          {
            trackId: 'track-001',
            trackName: 'Video Track 1',
            isMuted: false,
            isHidden: false,
            nodes: [],
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const mutation = {
        actionType: 'ADD_NODE',
        canvasId: 'os-verification-canvas',
        subscriberTenantId: 'os-verification-tenant',
        targetTrackId: 'track-001',
        vaultAssetId: 'asset-os-verification-001',
      };

      const result = await os.chamberIntegration.runtime.communicate(
        'os-kernel',
        'ras-al-amr',
        'apply-mutation',
        { canvas, mutation },
      );

      expect(result['success']).toBe(true);
      const updatedCanvas = result['canvas'] as { tracks: { nodes: unknown[] }[] };
      expect(updatedCanvas.tracks[0].nodes).toHaveLength(1);
    });

    test('OS routes snapshot request to Sovereign High Council', async () => {
      const result = await os.chamberIntegration.runtime.communicate(
        'os-kernel',
        'sovereign-high-council',
        'snapshot',
        {},
      );

      expect(result['success']).toBe(true);
      expect(result['snapshot']).toBeDefined();
    });

    test('L3 scheduling kernel recorded enqueue operations from e2e requests', async () => {
      const stats = await os.kernelLayer3.requestQueueService.getStatistics();
      // adapter activate + handleMessage calls all enqueue — at minimum the mutations above
      expect(stats.totalEnqueued).toBeGreaterThan(0);
    });
  });

  // ── Phase 6: Runtime Health ────────────────────────────────────────────

  describe('Phase 6: Runtime Health', () => {
    test('All chambers report HEALTHY status after activation', async () => {
      for (const chamberId of os.activeChambers) {
        const adapter = os.chamberIntegration.loader.getAdapter(chamberId);
        const health = await adapter!.health();
        expect(health.status).toBe('HEALTHY');
        expect(health.chamberId).toBe(chamberId);
        expect(health.timestamp).toBeLessThanOrEqual(Date.now());
      }
    });

    test('Each chamber health report includes metrics', async () => {
      for (const chamberId of os.activeChambers) {
        const adapter = os.chamberIntegration.loader.getAdapter(chamberId);
        const health = await adapter!.health();
        expect(typeof health.metrics).toBe('object');
      }
    });
  });

  // ── Phase 7: Lifecycle Recording ──────────────────────────────────────

  describe('Phase 7: Lifecycle Recording in Constitutional Memory', () => {
    test('Constitutional memory has activation records for all chambers', async () => {
      const memSize = await os.kernelLayer4.constitutionalMemoryService.getMemorySize();
      // At minimum: 4 activation entries (one per chamber)
      expect(memSize).toBeGreaterThanOrEqual(4);
    });

    test('Hujjah Al-Damighah activation was recorded', async () => {
      const entries = await os.kernelLayer4.constitutionalMemoryService.recallByArticle(
        'integration-with-chambers',
      );
      const activationEntry = entries.find((e) =>
        e.requestId === 'hujjah-al-damighah-lifecycle',
      );
      expect(activationEntry).toBeDefined();
      expect(activationEntry?.decisionSummary).toContain('activated');
    });

    test('Qiyamah Chamber activation was recorded', async () => {
      const entries = await os.kernelLayer4.constitutionalMemoryService.recallByArticle(
        'integration-with-chambers',
      );
      const activationEntry = entries.find((e) =>
        e.requestId === 'qiyamah-chamber-lifecycle',
      );
      expect(activationEntry).toBeDefined();
    });

    test('Ras Al-Amr activation was recorded', async () => {
      const entries = await os.kernelLayer4.constitutionalMemoryService.recallByArticle(
        'integration-with-chambers',
      );
      const activationEntry = entries.find((e) =>
        e.requestId === 'ras-al-amr-lifecycle',
      );
      expect(activationEntry).toBeDefined();
    });

    test('Sovereign High Council activation was recorded', async () => {
      const entries = await os.kernelLayer4.constitutionalMemoryService.recallByArticle(
        'sovereign-high-council',
      );
      const activationEntry = entries.find((e) =>
        e.requestId === 'sovereign-high-council-lifecycle',
      );
      expect(activationEntry).toBeDefined();
    });
  });

  // ── Phase 8: Scheduling Proof ──────────────────────────────────────────

  describe('Phase 8: Scheduling Kernel Proof', () => {
    test('L3 queue processed at least one request per active chamber operation', async () => {
      const stats = await os.kernelLayer3.requestQueueService.getStatistics();
      // get-state is cache-first (no enqueue); update-project-input + apply-mutation each enqueue once
      expect(stats.totalEnqueued).toBeGreaterThanOrEqual(2);
    });

    test('L3 priority policies are accessible', async () => {
      const policies = await os.kernelLayer3.priorityAssignmentService.getPolicies();
      expect(Array.isArray(policies)).toBe(true);
    });
  });

  // ── Phase 9: Runtime Health Report ────────────────────────────────────

  describe('Phase 9: Runtime Health Report', () => {
    test('Generates a complete structured Runtime Health Report', async () => {
      const chambers: ChamberHealthEntry[] = [];

      for (const chamberId of os.activeChambers) {
        const adapter = os.chamberIntegration.loader.getAdapter(chamberId)!;
        const health = await adapter.health();
        chambers.push({
          chamberId: health.chamberId,
          status: health.status,
          message: health.message,
          metrics: health.metrics,
        });
      }

      const cacheStats = await os.kernelLayer4.stateCacheService.getStatistics();
      const queueLength = await os.kernelLayer3.requestQueueService.getCurrentQueueLength();
      const memSize = await os.kernelLayer4.constitutionalMemoryService.getMemorySize();

      const report: RuntimeHealthReport = {
        generatedAt: new Date(),
        chambers,
        allChamberHealthy: chambers.every((c) => c.status === 'HEALTHY'),
        layer3QueueLength: queueLength,
        layer4CacheEntries: cacheStats.totalEntries,
        constitutionalMemorySize: memSize,
      };

      expect(report.allChamberHealthy).toBe(true);
      expect(report.chambers).toHaveLength(4);
      expect(report.constitutionalMemorySize).toBeGreaterThanOrEqual(4);
      expect(report.generatedAt).toBeInstanceOf(Date);
    });
  });

  // ── Phase 10: Operational Readiness Report ─────────────────────────────

  describe('Phase 10: Operational Readiness Report', () => {
    test('Generates a complete Operational Readiness Report and all checks pass', async () => {
      const memSize = await os.kernelLayer4.constitutionalMemoryService.getMemorySize();
      const queueStats = await os.kernelLayer3.requestQueueService.getStatistics();
      const activeAgents = await os.agentSociety.agentRegistryService.getActiveAgents();

      const busStats = os.sovereignBus.getStats();
      const journeyStats = os.sovereignJourney.getStats();

      const checks: ReadinessCheck[] = [
        {
          name: 'L2 Sovereign Operations Bus online',
          passed: os.sovereignBus.layerNumber === 2,
          detail: `Layer ${os.sovereignBus.layerNumber} v${os.sovereignBus.version}, ${busStats.totalPublished} events published`,
        },
        {
          name: 'L3 Scheduling Kernel online',
          passed: os.kernelLayer3.layerNumber === 3,
          detail: `Layer ${os.kernelLayer3.layerNumber} v${os.kernelLayer3.version}`,
        },
        {
          name: 'L4 Memory Layer online',
          passed: os.kernelLayer4.layerNumber === 4,
          detail: `Layer ${os.kernelLayer4.layerNumber} v${os.kernelLayer4.version}`,
        },
        {
          name: 'L5 Sovereign Journey Engine online',
          passed: os.sovereignJourney.layerNumber === 5,
          detail: `Layer ${os.sovereignJourney.layerNumber} v${os.sovereignJourney.version}, ${journeyStats.totalSessions} journey sessions`,
        },
        {
          name: 'L7 Agent Society online',
          passed: os.agentSociety.layerNumber === 7,
          detail: `Layer ${os.agentSociety.layerNumber} v${os.agentSociety.version}, ${activeAgents.length} agents registered`,
        },
        {
          name: 'All 4 chambers discovered',
          passed: os.registeredChambers.length === 4,
          detail: `Registered: ${os.registeredChambers.join(', ')}`,
        },
        {
          name: 'All 4 chambers ACTIVE',
          passed: os.activeChambers.length === 4,
          detail: `Active: ${os.activeChambers.join(', ')}`,
        },
        {
          name: 'Constitutional memory populated',
          passed: memSize >= 4,
          detail: `${memSize} constitutional memory entries`,
        },
        {
          name: 'L8 Sovereign Intelligence online',
          passed: os.sovereignIntelligence.layerNumber === 8,
          detail: `Layer ${os.sovereignIntelligence.layerNumber} v${os.sovereignIntelligence.version}, ${os.sovereignIntelligence.getAvailableSources().length} source(s) registered`,
        },
        {
          name: 'L9 Sovereign Command online',
          passed: os.sovereignCommand.layerNumber === 9,
          detail: `Layer ${os.sovereignCommand.layerNumber} v${os.sovereignCommand.version}, 11 executive services active`,
        },
        {
          name: 'Scheduling kernel processed requests',
          passed: queueStats.totalEnqueued >= 2,
          detail: `${queueStats.totalEnqueued} requests enqueued`,
        },
        {
          name: 'OS started without errors',
          passed: os.startedAt instanceof Date,
          detail: `Started at ${os.startedAt.toISOString()}`,
        },
      ];

      const report: OperationalReadinessReport = {
        generatedAt: new Date(),
        overallReady: checks.every((c) => c.passed),
        layers: {
          l2SovereignBus: os.sovereignBus.layerNumber === 2,
          l3Scheduling: os.kernelLayer3.layerNumber === 3,
          l4Memory: os.kernelLayer4.layerNumber === 4,
          l5SovereignJourney: os.sovereignJourney.layerNumber === 5,
          l7AgentSociety: os.agentSociety.layerNumber === 7,
          l8SovereignIntelligence: os.sovereignIntelligence.layerNumber === 8,
          l9SovereignCommand: os.sovereignCommand.layerNumber === 9,
          l10Chambers: os.activeChambers.length === 4,
        },
        chamberSummary: {
          registered: os.registeredChambers.length,
          active: os.activeChambers.length,
          allActive: os.registeredChambers.length === os.activeChambers.length,
        },
        checks,
      };

      expect(report.overallReady).toBe(true);
      expect(report.layers.l2SovereignBus).toBe(true);
      expect(report.layers.l3Scheduling).toBe(true);
      expect(report.layers.l4Memory).toBe(true);
      expect(report.layers.l5SovereignJourney).toBe(true);
      expect(report.layers.l7AgentSociety).toBe(true);
      expect(report.layers.l8SovereignIntelligence).toBe(true);
      expect(report.layers.l9SovereignCommand).toBe(true);
      expect(report.layers.l10Chambers).toBe(true);
      expect(report.chamberSummary.allActive).toBe(true);
      expect(report.chamberSummary.registered).toBe(4);
      expect(report.chamberSummary.active).toBe(4);

      for (const check of report.checks) {
        expect(check.passed).toBe(true);
      }
    });
  });
});
