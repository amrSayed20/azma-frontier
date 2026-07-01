export type JourneyChapterId =
  | 'IDEA'
  | 'KNOWLEDGE'
  | 'CREATION'
  | 'STORAGE'
  | 'PRODUCTION'
  | 'PUBLISHING'
  | 'GROWTH';

export const SOVEREIGN_CHAPTER_SEQUENCE: readonly JourneyChapterId[] = [
  'IDEA',
  'KNOWLEDGE',
  'CREATION',
  'STORAGE',
  'PRODUCTION',
  'PUBLISHING',
  'GROWTH',
] as const;

export interface JourneyChapter {
  readonly chapterId: JourneyChapterId;
  readonly narrativeTitle: string;
  readonly narrativeSummary: string;
  readonly chamberHint: string | null;
  readonly emotionalGoal: string;
}

export type JourneyTypeId = 'FIRST_JOURNEY' | string;

export interface JourneyDefinition {
  readonly journeyTypeId: JourneyTypeId;
  readonly journeyTypeName: string;
  readonly description: string;
  readonly chapterSequence: readonly JourneyChapterId[];
  readonly isRepeatable: boolean;
  readonly requiresIntake: boolean;
}

export const FIRST_JOURNEY_DEFINITION: JourneyDefinition = {
  journeyTypeId: 'FIRST_JOURNEY',
  journeyTypeName: 'The First Journey',
  description: 'Transforms a first-time visitor into a confident citizen of the Empire.',
  chapterSequence: SOVEREIGN_CHAPTER_SEQUENCE,
  isRepeatable: false,
  requiresIntake: true,
} as const;

export type JourneyPhase =
  | 'NOT_STARTED'
  | 'WELCOMED'
  | 'INTAKE_COMPLETE'
  | 'CHAPTER_ACTIVE'
  | 'CHAPTER_COMPLETE'
  | 'JOURNEY_PAUSED'
  | 'JOURNEY_RESUMED'
  | 'JOURNEY_COMPLETE'
  | 'JOURNEY_SKIPPED';

export interface UserIntentProfile {
  readonly profileId: string;
  readonly language: string;
  readonly dialect: string | null;
  readonly communicationStyle: 'terse' | 'descriptive' | 'conversational' | 'formal';
  readonly creativeGoals: readonly string[];
  readonly experienceLevel: 'explorer' | 'practitioner' | 'expert';
  readonly intent: string;
  readonly collectedAt: Date;
}

export interface JourneyRecord {
  readonly journeyId: string;
  readonly sessionId: string;
  readonly journeyTypeId: JourneyTypeId;
  readonly phase: JourneyPhase;
  readonly currentChapterId: JourneyChapterId | null;
  readonly completedChapters: readonly JourneyChapterId[];
  readonly skippedChapters: readonly JourneyChapterId[];
  readonly userIntentProfile: UserIntentProfile | null;
  readonly startedAt: Date | null;
  readonly lastActivityAt: Date | null;
  readonly completedAt: Date | null;
}

export type JourneyAdapterType =
  | 'default'
  | 'voice'
  | 'cinematic'
  | 'ar-vr'
  | 'founder-template'
  | 'enterprise'
  | 'team'
  | 'accessibility'
  | 'children'
  | 'premium';

export interface JourneyCompanionContext {
  readonly phase: JourneyPhase;
  readonly chapter: JourneyChapter | null;
  readonly profile: UserIntentProfile | null;
  readonly isReturn: boolean;
}

export interface CompanionInstruction {
  readonly action: 'welcome' | 'explain' | 'celebrate' | 'encourage' | 'warn' | 'staySilent';
  readonly context: JourneyCompanionContext;
}

export interface JourneyExperienceAdapter {
  readonly adapterId: string;
  readonly adapterType: JourneyAdapterType;
  presentWelcome(context: JourneyCompanionContext): Promise<void>;
  presentChapter(chapter: JourneyChapter, context: JourneyCompanionContext): Promise<void>;
  presentChapterComplete(chapter: JourneyChapter, context: JourneyCompanionContext): Promise<void>;
  presentCompletion(record: JourneyRecord): Promise<void>;
  presentPause(record: JourneyRecord): Promise<void>;
  presentResume(record: JourneyRecord): Promise<void>;
}

export interface JourneyMetrics {
  readonly totalStarted: number;
  readonly totalCompleted: number;
  readonly totalSkipped: number;
  readonly totalPaused: number;
  readonly completionRate: number;
  readonly lastUpdated: Date;
}

export interface SovereignJourneyStats {
  readonly activeJourneys: number;
  readonly completedJourneys: number;
  readonly pausedJourneys: number;
  readonly skippedJourneys: number;
  readonly totalSessions: number;
}
