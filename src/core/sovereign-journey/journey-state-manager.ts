import { randomUUID } from 'crypto';
import type {
  JourneyRecord,
  JourneyPhase,
  JourneyDefinition,
  UserIntentProfile,
} from './sovereign-journey-types';

export class JourneyStateTransitionError extends Error {
  constructor(from: JourneyPhase, to: string) {
    super(`Invalid journey state transition from '${from}' to '${to}'`);
    this.name = 'JourneyStateTransitionError';
  }
}

export class JourneyStateManager {
  beginJourney(sessionId: string, definition: JourneyDefinition): JourneyRecord {
    const now = new Date();
    const phase: JourneyPhase = definition.requiresIntake ? 'WELCOMED' : 'INTAKE_COMPLETE';
    return {
      journeyId: randomUUID(),
      sessionId,
      journeyTypeId: definition.journeyTypeId,
      phase,
      currentChapterId: null,
      completedChapters: [],
      skippedChapters: [],
      userIntentProfile: definition.requiresIntake ? null : this.defaultProfile(),
      startedAt: now,
      lastActivityAt: now,
      completedAt: null,
    };
  }

  sealIntakeProfile(record: JourneyRecord, profile: UserIntentProfile): JourneyRecord {
    if (record.phase !== 'WELCOMED') {
      throw new JourneyStateTransitionError(record.phase, 'INTAKE_COMPLETE');
    }
    return {
      ...record,
      phase: 'INTAKE_COMPLETE',
      userIntentProfile: profile,
      lastActivityAt: new Date(),
    };
  }

  advanceChapter(record: JourneyRecord, definition: JourneyDefinition): JourneyRecord {
    const sequence = definition.chapterSequence;
    const now = new Date();

    if (record.phase === 'INTAKE_COMPLETE') {
      const firstChapter = sequence[0];
      if (firstChapter === undefined) throw new Error('Journey definition has no chapters.');
      return {
        ...record,
        phase: 'CHAPTER_ACTIVE',
        currentChapterId: firstChapter,
        lastActivityAt: now,
      };
    }

    if (record.phase === 'CHAPTER_ACTIVE') {
      return { ...record, phase: 'CHAPTER_COMPLETE', lastActivityAt: now };
    }

    if (record.phase === 'CHAPTER_COMPLETE') {
      const currentIdx =
        record.currentChapterId !== null ? sequence.indexOf(record.currentChapterId) : -1;
      const nextChapter = sequence[currentIdx + 1];
      if (nextChapter === undefined) {
        throw new Error(
          `No next chapter after '${record.currentChapterId ?? 'null'}'. Call completeJourney() instead.`,
        );
      }
      const completedChapters =
        record.currentChapterId !== null
          ? [...record.completedChapters, record.currentChapterId]
          : record.completedChapters;
      return {
        ...record,
        phase: 'CHAPTER_ACTIVE',
        currentChapterId: nextChapter,
        completedChapters,
        lastActivityAt: now,
      };
    }

    throw new JourneyStateTransitionError(record.phase, 'advance');
  }

  skipChapter(record: JourneyRecord, definition: JourneyDefinition): JourneyRecord {
    if (record.phase !== 'CHAPTER_ACTIVE') {
      throw new JourneyStateTransitionError(record.phase, 'skip chapter');
    }
    const sequence = definition.chapterSequence;
    const skippedChapters =
      record.currentChapterId !== null
        ? [...record.skippedChapters, record.currentChapterId]
        : record.skippedChapters;
    const currentIdx =
      record.currentChapterId !== null ? sequence.indexOf(record.currentChapterId) : -1;
    const nextChapter = sequence[currentIdx + 1];
    return {
      ...record,
      phase: 'CHAPTER_COMPLETE',
      skippedChapters,
      currentChapterId: nextChapter ?? record.currentChapterId,
      lastActivityAt: new Date(),
    };
  }

  pauseJourney(record: JourneyRecord): JourneyRecord {
    if (record.phase !== 'CHAPTER_ACTIVE' && record.phase !== 'CHAPTER_COMPLETE') {
      throw new JourneyStateTransitionError(record.phase, 'JOURNEY_PAUSED');
    }
    return { ...record, phase: 'JOURNEY_PAUSED', lastActivityAt: new Date() };
  }

  resumeJourney(record: JourneyRecord): JourneyRecord {
    if (record.phase !== 'JOURNEY_PAUSED') {
      throw new JourneyStateTransitionError(record.phase, 'CHAPTER_ACTIVE');
    }
    return { ...record, phase: 'CHAPTER_ACTIVE', lastActivityAt: new Date() };
  }

  completeJourney(record: JourneyRecord): JourneyRecord {
    if (record.phase !== 'CHAPTER_ACTIVE' && record.phase !== 'CHAPTER_COMPLETE') {
      throw new JourneyStateTransitionError(record.phase, 'JOURNEY_COMPLETE');
    }
    const now = new Date();
    const completedChapters =
      record.currentChapterId !== null
        ? [...record.completedChapters, record.currentChapterId]
        : record.completedChapters;
    return {
      ...record,
      phase: 'JOURNEY_COMPLETE',
      completedChapters,
      lastActivityAt: now,
      completedAt: now,
    };
  }

  skipEntireJourney(record: JourneyRecord): JourneyRecord {
    if (record.phase === 'JOURNEY_COMPLETE' || record.phase === 'JOURNEY_SKIPPED') {
      throw new JourneyStateTransitionError(record.phase, 'JOURNEY_SKIPPED');
    }
    const now = new Date();
    return { ...record, phase: 'JOURNEY_SKIPPED', lastActivityAt: now, completedAt: now };
  }

  private defaultProfile(): UserIntentProfile {
    return {
      profileId: randomUUID(),
      language: 'en',
      dialect: null,
      communicationStyle: 'conversational',
      creativeGoals: [],
      experienceLevel: 'explorer',
      intent: '',
      collectedAt: new Date(),
    };
  }
}
