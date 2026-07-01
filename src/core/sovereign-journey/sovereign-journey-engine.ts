import type { SovereignBusContract } from '../sovereign-bus/sovereign-bus-contract';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { IntelligenceRuntimeContract } from '../sovereign-intelligence/intelligence-runtime-contract';
import type { SovereignJourneyEngineContract } from './sovereign-journey-contract';
import type {
  JourneyChapterId,
  JourneyChapter,
  JourneyTypeId,
  JourneyDefinition,
  JourneyRecord,
  UserIntentProfile,
  JourneyExperienceAdapter,
  JourneyMetrics,
  SovereignJourneyStats,
} from './sovereign-journey-types';
import { JourneyDefinitionRegistry } from './journey-definition-registry';
import { JourneyStateManager } from './journey-state-manager';
import { JourneyNarrativeService } from './journey-narrative-service';
import { JourneyProgressService } from './journey-progress-service';
import { JourneyAdaptationEngine } from './journey-adaptation-engine';
import { JourneyCompanionOrchestrator } from './journey-companion-orchestrator';
import { JourneyBusPublisher } from './journey-bus-publisher';
import { JourneyExperienceRouter } from './journey-experience-router';

interface JourneyEngineDeps {
  readonly sovereignBus: SovereignBusContract;
  readonly memoryLayer: MemoryLayerContract;
  readonly sovereignIntelligence: IntelligenceRuntimeContract;
  readonly defaultAdapter?: JourneyExperienceAdapter;
}

export class SovereignJourneyEngine implements SovereignJourneyEngineContract {
  readonly layerName = 'SovereignJourneyEngine' as const;
  readonly version = '1.0.0' as const;
  readonly layerNumber = 5 as const;

  private readonly registry: JourneyDefinitionRegistry;
  private readonly stateManager: JourneyStateManager;
  private readonly narrativeService: JourneyNarrativeService;
  private readonly progressService: JourneyProgressService;
  private readonly adaptationEngine: JourneyAdaptationEngine;
  private readonly companionOrchestrator: JourneyCompanionOrchestrator;
  private readonly busPublisher: JourneyBusPublisher;
  private readonly experienceRouter: JourneyExperienceRouter;

  private metricsStarted = 0;
  private metricsCompleted = 0;
  private metricsSkipped = 0;
  private metricsPaused = 0;
  private metricsLastUpdated = new Date();

  constructor(deps: JourneyEngineDeps) {
    this.registry = new JourneyDefinitionRegistry();
    this.stateManager = new JourneyStateManager();
    this.narrativeService = new JourneyNarrativeService(this.registry);
    this.progressService = new JourneyProgressService(deps.memoryLayer);
    this.adaptationEngine = new JourneyAdaptationEngine(deps.sovereignIntelligence);
    this.companionOrchestrator = new JourneyCompanionOrchestrator();
    this.busPublisher = new JourneyBusPublisher(deps.sovereignBus);
    this.experienceRouter = new JourneyExperienceRouter(deps.defaultAdapter);
  }

  // ── Journey type registry ──────────────────────────────────────────────────

  registerJourneyDefinition(definition: JourneyDefinition): void {
    this.registry.register(definition);
  }

  getJourneyDefinition(journeyTypeId: JourneyTypeId): JourneyDefinition {
    return this.registry.get(journeyTypeId);
  }

  listJourneyDefinitions(): readonly JourneyDefinition[] {
    return this.registry.list();
  }

  listAvailableJourneys(sessionId: string): readonly JourneyDefinition[] {
    const allRecords = this.progressService.getAll(sessionId);
    return this.registry.listAvailable(allRecords);
  }

  // ── Journey lifecycle ──────────────────────────────────────────────────────

  beginJourney(sessionId: string, journeyTypeId: JourneyTypeId = 'FIRST_JOURNEY'): JourneyRecord {
    const definition = this.registry.get(journeyTypeId);
    const record = this.stateManager.beginJourney(sessionId, definition);
    this.progressService.save(record);
    this.busPublisher.publishStarted(record);
    this.metricsStarted++;
    this.metricsLastUpdated = new Date();

    const chapter = record.currentChapterId
      ? this.narrativeService.getChapter(record.currentChapterId)
      : null;
    const isReturn = this.progressService.getCompleted(sessionId).length > 0;
    this.companionOrchestrator.instruct(record, chapter, isReturn);

    void this.experienceRouter.getActive().presentWelcome({
      phase: record.phase,
      chapter,
      profile: record.userIntentProfile,
      isReturn,
    });

    return record;
  }

  sealIntakeProfile(sessionId: string, profile: UserIntentProfile): JourneyRecord {
    const active = this.requireActive(sessionId);
    const record = this.stateManager.sealIntakeProfile(active, profile);
    this.progressService.save(record);
    this.busPublisher.publishIntakeProfiled(record);
    this.metricsLastUpdated = new Date();
    return record;
  }

  advanceChapter(sessionId: string): JourneyRecord {
    const active = this.requireActive(sessionId);
    const definition = this.registry.get(active.journeyTypeId);
    const prevChapterId = active.currentChapterId;
    const record = this.stateManager.advanceChapter(active, definition);
    this.progressService.save(record);
    this.metricsLastUpdated = new Date();

    if (record.phase === 'CHAPTER_ACTIVE' && record.currentChapterId !== null) {
      const chapter = this.narrativeService.getChapter(record.currentChapterId);
      const adapted = this.adaptationEngine.adapt(chapter, record.userIntentProfile);
      this.busPublisher.publishChapterEntered(record, adapted.chamberHint);
      this.companionOrchestrator.instruct(record, adapted, false);
      void this.experienceRouter.getActive().presentChapter(adapted, {
        phase: record.phase,
        chapter: adapted,
        profile: record.userIntentProfile,
        isReturn: false,
      });
    } else if (record.phase === 'CHAPTER_COMPLETE' && prevChapterId !== null) {
      const chapter = this.narrativeService.getChapter(prevChapterId);
      this.busPublisher.publishChapterCompleted(record, prevChapterId);
      this.companionOrchestrator.instruct(record, chapter, false);
      void this.experienceRouter.getActive().presentChapterComplete(chapter, {
        phase: record.phase,
        chapter,
        profile: record.userIntentProfile,
        isReturn: false,
      });
    }

    return record;
  }

  skipChapter(sessionId: string): JourneyRecord {
    const active = this.requireActive(sessionId);
    const definition = this.registry.get(active.journeyTypeId);
    const skippedId = active.currentChapterId ?? '';
    const record = this.stateManager.skipChapter(active, definition);
    this.progressService.save(record);
    this.busPublisher.publishChapterSkipped(record, skippedId);
    this.metricsLastUpdated = new Date();
    return record;
  }

  pauseJourney(sessionId: string): JourneyRecord {
    const active = this.requireActive(sessionId);
    const record = this.stateManager.pauseJourney(active);
    this.progressService.save(record);
    this.busPublisher.publishPaused(record);
    this.metricsPaused++;
    this.metricsLastUpdated = new Date();
    void this.experienceRouter.getActive().presentPause(record);
    return record;
  }

  resumeJourney(sessionId: string): JourneyRecord {
    const paused = this.requirePaused(sessionId);
    const record = this.stateManager.resumeJourney(paused);
    this.progressService.save(record);
    this.busPublisher.publishResumed(record);
    this.metricsLastUpdated = new Date();
    void this.experienceRouter.getActive().presentResume(record);
    return record;
  }

  completeJourney(sessionId: string): JourneyRecord {
    const active = this.requireActive(sessionId);
    const record = this.stateManager.completeJourney(active);
    this.progressService.save(record);
    this.busPublisher.publishCompleted(record);
    this.metricsCompleted++;
    this.metricsLastUpdated = new Date();
    void this.experienceRouter.getActive().presentCompletion(record);
    return record;
  }

  skipEntireJourney(sessionId: string): JourneyRecord {
    const active = this.requireActive(sessionId);
    const record = this.stateManager.skipEntireJourney(active);
    this.progressService.save(record);
    this.busPublisher.publishAbandoned(record);
    this.metricsSkipped++;
    this.metricsLastUpdated = new Date();
    return record;
  }

  // ── Journey read ───────────────────────────────────────────────────────────

  getJourney(sessionId: string): JourneyRecord | null {
    return this.progressService.getActive(sessionId);
  }

  getCurrentChapter(sessionId: string): JourneyChapter | null {
    const active = this.progressService.getActive(sessionId);
    if (active === null || active.currentChapterId === null) return null;
    return this.narrativeService.getChapter(active.currentChapterId);
  }

  getAllJourneys(sessionId: string): readonly JourneyRecord[] {
    return this.progressService.getAll(sessionId);
  }

  getCompletedJourneys(sessionId: string): readonly JourneyRecord[] {
    return this.progressService.getCompleted(sessionId);
  }

  // ── Chapter catalogue ──────────────────────────────────────────────────────

  getChapter(chapterId: JourneyChapterId): JourneyChapter {
    return this.narrativeService.getChapter(chapterId);
  }

  getChapters(journeyTypeId?: JourneyTypeId): readonly JourneyChapter[] {
    return this.narrativeService.getChapters(journeyTypeId);
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  getUserIntentProfile(sessionId: string): UserIntentProfile | null {
    return this.progressService.getActive(sessionId)?.userIntentProfile ?? null;
  }

  updateUserIntentProfile(
    sessionId: string,
    updates: Partial<Omit<UserIntentProfile, 'profileId' | 'collectedAt'>>,
  ): JourneyRecord {
    const active = this.requireActive(sessionId);
    if (active.userIntentProfile === null) {
      throw new Error('Cannot update profile before sealIntakeProfile() is called.');
    }
    const updated: UserIntentProfile = { ...active.userIntentProfile, ...updates };
    const record: JourneyRecord = { ...active, userIntentProfile: updated };
    this.progressService.save(record);
    this.metricsLastUpdated = new Date();
    return record;
  }

  // ── Analytics ──────────────────────────────────────────────────────────────

  getJourneyMetrics(): JourneyMetrics {
    const completionRate =
      this.metricsStarted > 0 ? this.metricsCompleted / this.metricsStarted : 0;
    return {
      totalStarted: this.metricsStarted,
      totalCompleted: this.metricsCompleted,
      totalSkipped: this.metricsSkipped,
      totalPaused: this.metricsPaused,
      completionRate,
      lastUpdated: this.metricsLastUpdated,
    };
  }

  getStats(): SovereignJourneyStats {
    return {
      activeJourneys: this.countByPhase('active'),
      completedJourneys: this.metricsCompleted,
      pausedJourneys: this.countByPhase('paused'),
      skippedJourneys: this.metricsSkipped,
      totalSessions: this.metricsStarted,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private requireActive(sessionId: string): JourneyRecord {
    const record = this.progressService.getActive(sessionId);
    if (record === null) {
      throw new Error(
        `No active journey for session '${sessionId}'. Call beginJourney() first.`,
      );
    }
    return record;
  }

  private requirePaused(sessionId: string): JourneyRecord {
    // Paused records are removed from activeRecords; look in all records
    const all = this.progressService.getAll(sessionId);
    const paused = all.find((r) => r.phase === 'JOURNEY_PAUSED');
    if (paused === undefined) {
      throw new Error(`No paused journey for session '${sessionId}'.`);
    }
    return paused;
  }

  private countByPhase(kind: 'active' | 'paused'): number {
    // Simple counter approximation — in a real distributed system this would
    // be a proper aggregation query. For in-process runtime, metrics suffice.
    if (kind === 'active') return this.metricsStarted - this.metricsCompleted - this.metricsSkipped;
    return this.metricsPaused;
  }
}

export function createSovereignJourneyEngine(
  deps: JourneyEngineDeps,
): SovereignJourneyEngineContract {
  return new SovereignJourneyEngine(deps);
}
