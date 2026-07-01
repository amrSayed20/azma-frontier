import type { SovereignBusContract } from '../sovereign-bus/sovereign-bus-contract';
import type { JourneyRecord } from './sovereign-journey-types';

export class JourneyBusPublisher {
  constructor(private readonly bus: SovereignBusContract) {}

  publishStarted(record: JourneyRecord): void {
    this.bus.publish({
      eventType: 'JOURNEY_STARTED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        journeyTypeId: record.journeyTypeId,
      },
    });
  }

  publishChapterEntered(record: JourneyRecord, chamberHint: string | null): void {
    this.bus.publish({
      eventType: 'JOURNEY_CHAPTER_ENTERED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        chapterId: record.currentChapterId ?? '',
        chamberHint,
      },
    });
  }

  publishChapterCompleted(record: JourneyRecord, chapterId: string): void {
    this.bus.publish({
      eventType: 'JOURNEY_CHAPTER_COMPLETED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        chapterId,
      },
    });
  }

  publishChapterSkipped(record: JourneyRecord, chapterId: string): void {
    this.bus.publish({
      eventType: 'JOURNEY_CHAPTER_SKIPPED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        chapterId,
      },
    });
  }

  publishPaused(record: JourneyRecord): void {
    this.bus.publish({
      eventType: 'JOURNEY_PAUSED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        chapterId: record.currentChapterId,
      },
    });
  }

  publishResumed(record: JourneyRecord): void {
    this.bus.publish({
      eventType: 'JOURNEY_RESUMED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        chapterId: record.currentChapterId,
      },
    });
  }

  publishCompleted(record: JourneyRecord): void {
    const durationMs =
      record.startedAt !== null ? Date.now() - record.startedAt.getTime() : 0;
    this.bus.publish({
      eventType: 'JOURNEY_COMPLETED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        journeyTypeId: record.journeyTypeId,
        durationMs,
      },
    });
  }

  publishAbandoned(record: JourneyRecord): void {
    this.bus.publish({
      eventType: 'JOURNEY_ABANDONED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        journeyId: record.journeyId,
        lastPhase: record.phase,
      },
    });
  }

  publishIntakeProfiled(record: JourneyRecord): void {
    if (record.userIntentProfile === null) return;
    this.bus.publish({
      eventType: 'USER_INTENT_PROFILED',
      sourceLayer: 5,
      sourceService: 'SovereignJourneyEngine',
      correlationId: record.journeyId,
      payload: {
        sessionId: record.sessionId,
        language: record.userIntentProfile.language,
        experienceLevel: record.userIntentProfile.experienceLevel,
        intent: record.userIntentProfile.intent,
      },
    });
  }
}
