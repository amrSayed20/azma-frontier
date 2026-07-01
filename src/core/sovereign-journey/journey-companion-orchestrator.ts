import type {
  JourneyRecord,
  JourneyChapter,
  JourneyPhase,
  CompanionInstruction,
  JourneyCompanionContext,
} from './sovereign-journey-types';

export class JourneyCompanionOrchestrator {
  instruct(
    record: JourneyRecord,
    chapter: JourneyChapter | null,
    isReturn: boolean,
  ): CompanionInstruction {
    const context: JourneyCompanionContext = {
      phase: record.phase,
      chapter,
      profile: record.userIntentProfile,
      isReturn,
    };
    return { action: this.selectAction(record.phase), context };
  }

  private selectAction(phase: JourneyPhase): CompanionInstruction['action'] {
    switch (phase) {
      case 'WELCOMED':
        return 'welcome';
      case 'INTAKE_COMPLETE':
        return 'encourage';
      case 'CHAPTER_ACTIVE':
        return 'explain';
      case 'CHAPTER_COMPLETE':
        return 'celebrate';
      case 'JOURNEY_PAUSED':
        return 'staySilent';
      case 'JOURNEY_RESUMED':
        return 'welcome';
      case 'JOURNEY_COMPLETE':
        return 'celebrate';
      case 'JOURNEY_SKIPPED':
        return 'encourage';
      case 'NOT_STARTED':
        return 'staySilent';
    }
  }
}
