import type { JourneyChapterId, JourneyChapter, JourneyTypeId } from './sovereign-journey-types';
import type { JourneyDefinitionRegistry } from './journey-definition-registry';

const CANONICAL_CHAPTERS: readonly JourneyChapter[] = [
  {
    chapterId: 'IDEA',
    narrativeTitle: 'The Spark',
    narrativeSummary: 'Every empire begins with one idea. This is yours.',
    chamberHint: null,
    emotionalGoal: 'Kindle wonder — no product exists yet, only possibility.',
  },
  {
    chapterId: 'KNOWLEDGE',
    narrativeTitle: 'The Library',
    narrativeSummary: 'The Empire holds all knowledge. Every answer begins here.',
    chamberHint: 'hujjah-al-damighah',
    emotionalGoal: 'Build confidence through discovery.',
  },
  {
    chapterId: 'CREATION',
    narrativeTitle: 'The Studio',
    narrativeSummary: 'Ideas become real. This is where creation lives.',
    chamberHint: 'qiyamah-chamber',
    emotionalGoal: 'Feel the power of making something from nothing.',
  },
  {
    chapterId: 'STORAGE',
    narrativeTitle: 'The Vault',
    narrativeSummary: 'Everything you create is protected and remembered.',
    chamberHint: 'sovereign-vault',
    emotionalGoal: 'Feel secure and organized — nothing is ever lost.',
  },
  {
    chapterId: 'PRODUCTION',
    narrativeTitle: 'The Arena',
    narrativeSummary: 'Your work moves through the Empire at full speed.',
    chamberHint: 'ras-al-amr',
    emotionalGoal: 'Feel the capability and agency of a sovereign creator.',
  },
  {
    chapterId: 'PUBLISHING',
    narrativeTitle: 'The Gate',
    narrativeSummary: 'The world is waiting. The Gate opens on your command.',
    chamberHint: null,
    emotionalGoal: 'Feel ready to share your creation with the world.',
  },
  {
    chapterId: 'GROWTH',
    narrativeTitle: 'The Council',
    narrativeSummary: 'The Empire grows with you. You are part of something larger.',
    chamberHint: 'sovereign-high-council',
    emotionalGoal: 'Feel that you are a citizen of a living creative empire.',
  },
];

const CHAPTER_MAP = new Map<JourneyChapterId, JourneyChapter>(
  CANONICAL_CHAPTERS.map((c) => [c.chapterId, c]),
);

export class JourneyNarrativeService {
  constructor(private readonly registry: JourneyDefinitionRegistry) {}

  getChapter(chapterId: JourneyChapterId): JourneyChapter {
    const chapter = CHAPTER_MAP.get(chapterId);
    if (chapter === undefined) throw new Error(`Unknown chapter: ${chapterId}`);
    return chapter;
  }

  getChapters(journeyTypeId?: JourneyTypeId): readonly JourneyChapter[] {
    if (journeyTypeId === undefined) return CANONICAL_CHAPTERS;
    const definition = this.registry.get(journeyTypeId);
    return definition.chapterSequence.map((id) => this.getChapter(id));
  }
}
