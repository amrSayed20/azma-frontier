import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createSovereignJourneyEngine } from './sovereign-journey-engine';
import type { SovereignJourneyEngineContract } from './sovereign-journey-contract';
import type { SovereignBusContract } from '../sovereign-bus/sovereign-bus-contract';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { IntelligenceRuntimeContract } from '../sovereign-intelligence/intelligence-runtime-contract';
import type { JourneyDefinition, UserIntentProfile } from './sovereign-journey-types';

// ── Minimal mock factories ──────────────────────────────────────────────────

function makeBus(): SovereignBusContract {
  return {
    layerName: 'SovereignOperationsBus',
    version: '1.0.0',
    layerNumber: 2,
    publish: jest.fn() as jest.Mock,
    subscribe: jest.fn() as jest.Mock,
    replay: jest.fn() as jest.Mock,
    getEventLog: jest.fn() as jest.Mock,
    getStats: jest.fn() as jest.Mock,
  } as unknown as SovereignBusContract;
}

function makeMemory(): MemoryLayerContract {
  return {
    layerName: 'MemoryLayer',
    version: '1.0.0',
    layerNumber: 4,
    stateCacheService: {
      serviceName: 'StateCacheService',
      get: jest.fn() as jest.Mock,
      set: jest.fn() as jest.Mock,
      invalidate: jest.fn() as jest.Mock,
      getStatistics: jest.fn() as jest.Mock,
    },
    constitutionalMemoryService: {
      serviceName: 'ConstitutionalMemoryService',
      remember: jest.fn() as jest.Mock,
      recallByArticle: jest.fn() as jest.Mock,
      getMemorySize: jest.fn() as jest.Mock,
    },
  } as unknown as MemoryLayerContract;
}

function makeIntelligence(): IntelligenceRuntimeContract {
  return {
    layerName: 'SovereignIntelligence',
    version: '1.0.0',
    layerNumber: 8,
    getAvailableSources: jest.fn(() => []) as jest.Mock,
    sourceManager: { serviceName: 'KnowledgeSourceManager' },
    domainClassifier: { serviceName: 'KnowledgeDomainClassifier' },
    searchRouter: { serviceName: 'SearchAgentRouter' },
    sourceVerifier: { serviceName: 'SourceVerifier' },
    summarizer: { serviceName: 'KnowledgeSummarizer' },
    packageBuilder: { serviceName: 'KnowledgePackageBuilder' },
    pipeline: { serviceName: 'KnowledgePipeline' },
  } as unknown as IntelligenceRuntimeContract;
}

function makeProfile(): UserIntentProfile {
  return {
    profileId: 'profile-test-001',
    language: 'en',
    dialect: null,
    communicationStyle: 'conversational',
    creativeGoals: ['launch a podcast'],
    experienceLevel: 'explorer',
    intent: 'I want to launch a podcast empire.',
    collectedAt: new Date(),
  };
}

// ── Test suite ──────────────────────────────────────────────────────────────

describe('SovereignJourneyEngine — Layer 5', () => {
  let engine: SovereignJourneyEngineContract;
  let bus: SovereignBusContract;
  let memory: MemoryLayerContract;
  let intelligence: IntelligenceRuntimeContract;

  beforeEach(() => {
    bus = makeBus();
    memory = makeMemory();
    intelligence = makeIntelligence();
    engine = createSovereignJourneyEngine({
      sovereignBus: bus,
      memoryLayer: memory,
      sovereignIntelligence: intelligence,
    });
  });

  // ── Contract identity ──────────────────────────────────────────────────────

  describe('Contract identity', () => {
    test('layerName is SovereignJourneyEngine', () => {
      expect(engine.layerName).toBe('SovereignJourneyEngine');
    });

    test('version is 1.0.0', () => {
      expect(engine.version).toBe('1.0.0');
    });

    test('layerNumber is 5', () => {
      expect(engine.layerNumber).toBe(5);
    });
  });

  // ── Journey definition registry ────────────────────────────────────────────

  describe('Journey definition registry', () => {
    test('FIRST_JOURNEY is pre-registered at startup', () => {
      const def = engine.getJourneyDefinition('FIRST_JOURNEY');
      expect(def.journeyTypeId).toBe('FIRST_JOURNEY');
      expect(def.chapterSequence).toHaveLength(7);
    });

    test('listJourneyDefinitions returns pre-registered FIRST_JOURNEY', () => {
      const defs = engine.listJourneyDefinitions();
      expect(defs).toHaveLength(1);
      expect(defs[0]!.journeyTypeId).toBe('FIRST_JOURNEY');
    });

    test('registerJourneyDefinition adds a new journey type', () => {
      const custom: JourneyDefinition = {
        journeyTypeId: 'ADVANCED_JOURNEY',
        journeyTypeName: 'The Advanced Journey',
        description: 'For returning citizens.',
        chapterSequence: ['CREATION', 'PRODUCTION', 'PUBLISHING'],
        isRepeatable: true,
        requiresIntake: false,
      };
      engine.registerJourneyDefinition(custom);
      expect(engine.listJourneyDefinitions()).toHaveLength(2);
      expect(engine.getJourneyDefinition('ADVANCED_JOURNEY').journeyTypeName).toBe('The Advanced Journey');
    });

    test('getJourneyDefinition throws for unknown journeyTypeId', () => {
      expect(() => engine.getJourneyDefinition('UNKNOWN')).toThrow('Unknown journey type');
    });
  });

  // ── beginJourney ──────────────────────────────────────────────────────────

  describe('beginJourney', () => {
    test('creates a WELCOMED record for FIRST_JOURNEY (requiresIntake=true)', () => {
      const record = engine.beginJourney('session-001');
      expect(record.phase).toBe('WELCOMED');
      expect(record.sessionId).toBe('session-001');
      expect(record.journeyTypeId).toBe('FIRST_JOURNEY');
      expect(record.journeyId).toBeTruthy();
    });

    test('beginJourney publishes JOURNEY_STARTED event on the bus', () => {
      engine.beginJourney('session-002');
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'JOURNEY_STARTED', sourceLayer: 5 }),
      );
    });

    test('getJourney returns the active record after beginJourney', () => {
      const record = engine.beginJourney('session-003');
      const retrieved = engine.getJourney('session-003');
      expect(retrieved?.journeyId).toBe(record.journeyId);
    });

    test('getJourney returns null for unknown session', () => {
      expect(engine.getJourney('no-such-session')).toBeNull();
    });

    test('FIRST_JOURNEY defaulting: passing no journeyTypeId uses FIRST_JOURNEY', () => {
      const r1 = engine.beginJourney('session-explicit', 'FIRST_JOURNEY');
      const r2 = engine.beginJourney('session-default');
      expect(r1.journeyTypeId).toBe(r2.journeyTypeId);
    });
  });

  // ── sealIntakeProfile ─────────────────────────────────────────────────────

  describe('sealIntakeProfile', () => {
    test('transitions WELCOMED → INTAKE_COMPLETE', () => {
      engine.beginJourney('session-seal');
      const record = engine.sealIntakeProfile('session-seal', makeProfile());
      expect(record.phase).toBe('INTAKE_COMPLETE');
      expect(record.userIntentProfile?.language).toBe('en');
    });

    test('publishes USER_INTENT_PROFILED on the bus', () => {
      engine.beginJourney('session-intake');
      engine.sealIntakeProfile('session-intake', makeProfile());
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'USER_INTENT_PROFILED', sourceLayer: 5 }),
      );
    });
  });

  // ── advanceChapter ────────────────────────────────────────────────────────

  describe('advanceChapter', () => {
    test('INTAKE_COMPLETE → CHAPTER_ACTIVE with first chapter', () => {
      engine.beginJourney('session-adv');
      engine.sealIntakeProfile('session-adv', makeProfile());
      const record = engine.advanceChapter('session-adv');
      expect(record.phase).toBe('CHAPTER_ACTIVE');
      expect(record.currentChapterId).toBe('IDEA');
    });

    test('CHAPTER_ACTIVE → CHAPTER_COMPLETE', () => {
      engine.beginJourney('session-adv2');
      engine.sealIntakeProfile('session-adv2', makeProfile());
      engine.advanceChapter('session-adv2'); // → CHAPTER_ACTIVE (IDEA)
      const record = engine.advanceChapter('session-adv2'); // → CHAPTER_COMPLETE
      expect(record.phase).toBe('CHAPTER_COMPLETE');
    });

    test('CHAPTER_COMPLETE → CHAPTER_ACTIVE (next chapter)', () => {
      engine.beginJourney('session-adv3');
      engine.sealIntakeProfile('session-adv3', makeProfile());
      engine.advanceChapter('session-adv3'); // INTAKE_COMPLETE → CHAPTER_ACTIVE (IDEA)
      engine.advanceChapter('session-adv3'); // CHAPTER_ACTIVE → CHAPTER_COMPLETE
      const record = engine.advanceChapter('session-adv3'); // CHAPTER_COMPLETE → CHAPTER_ACTIVE (KNOWLEDGE)
      expect(record.phase).toBe('CHAPTER_ACTIVE');
      expect(record.currentChapterId).toBe('KNOWLEDGE');
    });

    test('advanceChapter publishes JOURNEY_CHAPTER_ENTERED when entering new chapter', () => {
      engine.beginJourney('session-enter');
      engine.sealIntakeProfile('session-enter', makeProfile());
      (bus.publish as jest.Mock).mockClear();
      engine.advanceChapter('session-enter'); // → CHAPTER_ACTIVE
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'JOURNEY_CHAPTER_ENTERED', sourceLayer: 5 }),
      );
    });
  });

  // ── skipChapter ───────────────────────────────────────────────────────────

  describe('skipChapter', () => {
    test('skipping a chapter records it in skippedChapters', () => {
      engine.beginJourney('session-skip');
      engine.sealIntakeProfile('session-skip', makeProfile());
      engine.advanceChapter('session-skip'); // → CHAPTER_ACTIVE (IDEA)
      const record = engine.skipChapter('session-skip');
      expect(record.skippedChapters).toContain('IDEA');
    });

    test('publishes JOURNEY_CHAPTER_SKIPPED on the bus', () => {
      engine.beginJourney('session-skip2');
      engine.sealIntakeProfile('session-skip2', makeProfile());
      engine.advanceChapter('session-skip2');
      (bus.publish as jest.Mock).mockClear();
      engine.skipChapter('session-skip2');
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'JOURNEY_CHAPTER_SKIPPED', sourceLayer: 5 }),
      );
    });
  });

  // ── pauseJourney / resumeJourney ──────────────────────────────────────────

  describe('pauseJourney and resumeJourney', () => {
    function reachChapterActive(sessionId: string) {
      engine.beginJourney(sessionId);
      engine.sealIntakeProfile(sessionId, makeProfile());
      engine.advanceChapter(sessionId);
    }

    test('pauseJourney transitions CHAPTER_ACTIVE → JOURNEY_PAUSED', () => {
      reachChapterActive('session-pause');
      const record = engine.pauseJourney('session-pause');
      expect(record.phase).toBe('JOURNEY_PAUSED');
    });

    test('pauseJourney publishes JOURNEY_PAUSED', () => {
      reachChapterActive('session-pause2');
      (bus.publish as jest.Mock).mockClear();
      engine.pauseJourney('session-pause2');
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'JOURNEY_PAUSED', sourceLayer: 5 }),
      );
    });

    test('resumeJourney transitions JOURNEY_PAUSED → CHAPTER_ACTIVE', () => {
      reachChapterActive('session-resume');
      engine.pauseJourney('session-resume');
      const record = engine.resumeJourney('session-resume');
      expect(record.phase).toBe('CHAPTER_ACTIVE');
    });

    test('resumeJourney publishes JOURNEY_RESUMED', () => {
      reachChapterActive('session-resume2');
      engine.pauseJourney('session-resume2');
      (bus.publish as jest.Mock).mockClear();
      engine.resumeJourney('session-resume2');
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'JOURNEY_RESUMED', sourceLayer: 5 }),
      );
    });
  });

  // ── completeJourney ───────────────────────────────────────────────────────

  describe('completeJourney', () => {
    test('completeJourney from CHAPTER_ACTIVE → JOURNEY_COMPLETE', () => {
      engine.beginJourney('session-complete');
      engine.sealIntakeProfile('session-complete', makeProfile());
      engine.advanceChapter('session-complete');
      const record = engine.completeJourney('session-complete');
      expect(record.phase).toBe('JOURNEY_COMPLETE');
      expect(record.completedAt).toBeInstanceOf(Date);
    });

    test('publishes JOURNEY_COMPLETED on the bus', () => {
      engine.beginJourney('session-complete2');
      engine.sealIntakeProfile('session-complete2', makeProfile());
      engine.advanceChapter('session-complete2');
      (bus.publish as jest.Mock).mockClear();
      engine.completeJourney('session-complete2');
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'JOURNEY_COMPLETED', sourceLayer: 5 }),
      );
    });

    test('completed journey is no longer in active records', () => {
      engine.beginJourney('session-complete3');
      engine.sealIntakeProfile('session-complete3', makeProfile());
      engine.advanceChapter('session-complete3');
      engine.completeJourney('session-complete3');
      expect(engine.getJourney('session-complete3')).toBeNull();
    });

    test('completed journey appears in getCompletedJourneys', () => {
      engine.beginJourney('session-complete4');
      engine.sealIntakeProfile('session-complete4', makeProfile());
      engine.advanceChapter('session-complete4');
      engine.completeJourney('session-complete4');
      const completed = engine.getCompletedJourneys('session-complete4');
      expect(completed).toHaveLength(1);
      expect(completed[0]!.phase).toBe('JOURNEY_COMPLETE');
    });
  });

  // ── skipEntireJourney ─────────────────────────────────────────────────────

  describe('skipEntireJourney', () => {
    test('transitions any non-terminal phase → JOURNEY_SKIPPED', () => {
      engine.beginJourney('session-skip-all');
      const record = engine.skipEntireJourney('session-skip-all');
      expect(record.phase).toBe('JOURNEY_SKIPPED');
    });

    test('publishes JOURNEY_ABANDONED on the bus', () => {
      engine.beginJourney('session-skip-all2');
      (bus.publish as jest.Mock).mockClear();
      engine.skipEntireJourney('session-skip-all2');
      expect(bus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'JOURNEY_ABANDONED', sourceLayer: 5 }),
      );
    });
  });

  // ── Chapter catalogue ─────────────────────────────────────────────────────

  describe('Chapter catalogue', () => {
    test('getChapter returns canonical chapter data', () => {
      const chapter = engine.getChapter('IDEA');
      expect(chapter.chapterId).toBe('IDEA');
      expect(chapter.narrativeTitle).toBe('The Spark');
    });

    test('getChapters returns all 7 canonical chapters when no journeyTypeId', () => {
      const chapters = engine.getChapters();
      expect(chapters).toHaveLength(7);
    });

    test('getChapters with FIRST_JOURNEY returns 7 chapters in SOVEREIGN_CHAPTER_SEQUENCE order', () => {
      const chapters = engine.getChapters('FIRST_JOURNEY');
      expect(chapters[0]!.chapterId).toBe('IDEA');
      expect(chapters[6]!.chapterId).toBe('GROWTH');
    });

    test('getCurrentChapter returns null when no active journey', () => {
      expect(engine.getCurrentChapter('no-session')).toBeNull();
    });

    test('getCurrentChapter returns the active chapter after entering CHAPTER_ACTIVE', () => {
      engine.beginJourney('session-cur-ch');
      engine.sealIntakeProfile('session-cur-ch', makeProfile());
      engine.advanceChapter('session-cur-ch');
      const chapter = engine.getCurrentChapter('session-cur-ch');
      expect(chapter?.chapterId).toBe('IDEA');
    });
  });

  // ── Profile management ────────────────────────────────────────────────────

  describe('Profile management', () => {
    test('getUserIntentProfile returns null before sealIntakeProfile', () => {
      engine.beginJourney('session-prof');
      expect(engine.getUserIntentProfile('session-prof')).toBeNull();
    });

    test('getUserIntentProfile returns profile after sealing', () => {
      engine.beginJourney('session-prof2');
      engine.sealIntakeProfile('session-prof2', makeProfile());
      expect(engine.getUserIntentProfile('session-prof2')?.language).toBe('en');
    });

    test('updateUserIntentProfile patches profile fields', () => {
      engine.beginJourney('session-prof3');
      engine.sealIntakeProfile('session-prof3', makeProfile());
      const updated = engine.updateUserIntentProfile('session-prof3', { language: 'ar' });
      expect(updated.userIntentProfile?.language).toBe('ar');
    });

    test('updateUserIntentProfile throws before sealIntakeProfile', () => {
      engine.beginJourney('session-prof4');
      expect(() =>
        engine.updateUserIntentProfile('session-prof4', { language: 'ar' }),
      ).toThrow('Cannot update profile before sealIntakeProfile');
    });
  });

  // ── Analytics ─────────────────────────────────────────────────────────────

  describe('Analytics', () => {
    test('getJourneyMetrics starts with zeros', () => {
      const metrics = engine.getJourneyMetrics();
      expect(metrics.totalStarted).toBe(0);
      expect(metrics.totalCompleted).toBe(0);
      expect(metrics.totalSkipped).toBe(0);
      expect(metrics.totalPaused).toBe(0);
      expect(metrics.completionRate).toBe(0);
    });

    test('getJourneyMetrics increments totalStarted on beginJourney', () => {
      engine.beginJourney('session-metrics');
      expect(engine.getJourneyMetrics().totalStarted).toBe(1);
    });

    test('getJourneyMetrics tracks completed journeys', () => {
      engine.beginJourney('session-metrics2');
      engine.sealIntakeProfile('session-metrics2', makeProfile());
      engine.advanceChapter('session-metrics2');
      engine.completeJourney('session-metrics2');
      const metrics = engine.getJourneyMetrics();
      expect(metrics.totalCompleted).toBe(1);
      expect(metrics.completionRate).toBe(1);
    });

    test('getStats returns expected structure', () => {
      const stats = engine.getStats();
      expect(typeof stats.activeJourneys).toBe('number');
      expect(typeof stats.completedJourneys).toBe('number');
      expect(typeof stats.pausedJourneys).toBe('number');
      expect(typeof stats.skippedJourneys).toBe('number');
      expect(typeof stats.totalSessions).toBe('number');
    });
  });

  // ── listAvailableJourneys ─────────────────────────────────────────────────

  describe('listAvailableJourneys', () => {
    test('FIRST_JOURNEY available for a new session', () => {
      const available = engine.listAvailableJourneys('session-avail');
      expect(available.map((d) => d.journeyTypeId)).toContain('FIRST_JOURNEY');
    });

    test('FIRST_JOURNEY unavailable after completion (isRepeatable=false)', () => {
      engine.beginJourney('session-avail2');
      engine.sealIntakeProfile('session-avail2', makeProfile());
      engine.advanceChapter('session-avail2');
      engine.completeJourney('session-avail2');
      const available = engine.listAvailableJourneys('session-avail2');
      expect(available.map((d) => d.journeyTypeId)).not.toContain('FIRST_JOURNEY');
    });
  });

  // ── getAllJourneys ─────────────────────────────────────────────────────────

  describe('getAllJourneys', () => {
    test('returns empty array for unknown session', () => {
      expect(engine.getAllJourneys('unknown-session')).toHaveLength(0);
    });

    test('returns all records including terminal ones', () => {
      engine.beginJourney('session-all');
      engine.sealIntakeProfile('session-all', makeProfile());
      engine.advanceChapter('session-all');
      engine.completeJourney('session-all');
      const all = engine.getAllJourneys('session-all');
      expect(all).toHaveLength(1);
      expect(all[0]!.phase).toBe('JOURNEY_COMPLETE');
    });
  });

  // ── Error guards ──────────────────────────────────────────────────────────

  describe('Error guards', () => {
    test('requireActive throws when no journey started', () => {
      expect(() => engine.advanceChapter('no-session')).toThrow('No active journey');
    });

    test('requirePaused throws when journey is not paused', () => {
      engine.beginJourney('session-err');
      expect(() => engine.resumeJourney('session-err')).toThrow('No paused journey');
    });
  });

  // ── Full lifecycle integration ─────────────────────────────────────────────

  describe('Full lifecycle integration — FIRST_JOURNEY', () => {
    test('completes a full 7-chapter journey lifecycle without errors', () => {
      const sid = 'session-full-lifecycle';
      const allChapters = ['IDEA', 'KNOWLEDGE', 'CREATION', 'STORAGE', 'PRODUCTION', 'PUBLISHING', 'GROWTH'] as const;

      engine.beginJourney(sid);
      engine.sealIntakeProfile(sid, makeProfile());

      // Enter first chapter: INTAKE_COMPLETE → CHAPTER_ACTIVE (IDEA)
      let r = engine.advanceChapter(sid);
      expect(r.phase).toBe('CHAPTER_ACTIVE');
      expect(r.currentChapterId).toBe('IDEA');

      // Walk chapters 1..5 (IDEA→KNOWLEDGE→…→PUBLISHING), then enter GROWTH
      for (let i = 0; i < allChapters.length - 1; i++) {
        r = engine.advanceChapter(sid); // CHAPTER_ACTIVE → CHAPTER_COMPLETE
        expect(r.phase).toBe('CHAPTER_COMPLETE');
        r = engine.advanceChapter(sid); // CHAPTER_COMPLETE → CHAPTER_ACTIVE (next)
        expect(r.phase).toBe('CHAPTER_ACTIVE');
        expect(r.currentChapterId).toBe(allChapters[i + 1]);
      }
      // Now in CHAPTER_ACTIVE (GROWTH)
      expect(r.currentChapterId).toBe('GROWTH');

      // Complete the final chapter — no more chapters to advance to
      const final = engine.completeJourney(sid);
      expect(final.phase).toBe('JOURNEY_COMPLETE');
      expect(final.completedAt).toBeInstanceOf(Date);

      const metrics = engine.getJourneyMetrics();
      expect(metrics.totalStarted).toBe(1);
      expect(metrics.totalCompleted).toBe(1);
      expect(metrics.completionRate).toBe(1);
    });
  });
});
