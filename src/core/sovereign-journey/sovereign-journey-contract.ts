import type {
  JourneyChapterId,
  JourneyChapter,
  JourneyTypeId,
  JourneyDefinition,
  JourneyRecord,
  UserIntentProfile,
  JourneyMetrics,
  SovereignJourneyStats,
} from './sovereign-journey-types';

export interface SovereignJourneyEngineContract {
  readonly layerName: 'SovereignJourneyEngine';
  readonly version: '1.0.0';
  readonly layerNumber: 5;

  // ── Journey type registry ────────────────────────────────────────────────────
  registerJourneyDefinition(definition: JourneyDefinition): void;
  getJourneyDefinition(journeyTypeId: JourneyTypeId): JourneyDefinition;
  listJourneyDefinitions(): readonly JourneyDefinition[];
  listAvailableJourneys(sessionId: string): readonly JourneyDefinition[];

  // ── Journey lifecycle ────────────────────────────────────────────────────────
  beginJourney(sessionId: string, journeyTypeId?: JourneyTypeId): JourneyRecord;
  sealIntakeProfile(sessionId: string, profile: UserIntentProfile): JourneyRecord;
  advanceChapter(sessionId: string): JourneyRecord;
  skipChapter(sessionId: string): JourneyRecord;
  pauseJourney(sessionId: string): JourneyRecord;
  resumeJourney(sessionId: string): JourneyRecord;
  completeJourney(sessionId: string): JourneyRecord;
  skipEntireJourney(sessionId: string): JourneyRecord;

  // ── Journey read ─────────────────────────────────────────────────────────────
  getJourney(sessionId: string): JourneyRecord | null;
  getCurrentChapter(sessionId: string): JourneyChapter | null;
  getAllJourneys(sessionId: string): readonly JourneyRecord[];
  getCompletedJourneys(sessionId: string): readonly JourneyRecord[];

  // ── Chapter catalogue ────────────────────────────────────────────────────────
  getChapter(chapterId: JourneyChapterId): JourneyChapter;
  getChapters(journeyTypeId?: JourneyTypeId): readonly JourneyChapter[];

  // ── Profile ──────────────────────────────────────────────────────────────────
  getUserIntentProfile(sessionId: string): UserIntentProfile | null;
  updateUserIntentProfile(
    sessionId: string,
    updates: Partial<Omit<UserIntentProfile, 'profileId' | 'collectedAt'>>,
  ): JourneyRecord;

  // ── Analytics ────────────────────────────────────────────────────────────────
  getJourneyMetrics(): JourneyMetrics;
  getStats(): SovereignJourneyStats;
}
