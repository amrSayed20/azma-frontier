import type { IntelligenceRuntimeContract } from '../sovereign-intelligence/intelligence-runtime-contract';
import type { JourneyChapter, UserIntentProfile } from './sovereign-journey-types';

export class JourneyAdaptationEngine {
  constructor(private readonly intelligence: IntelligenceRuntimeContract) {}

  adapt(chapter: JourneyChapter, profile: UserIntentProfile | null): JourneyChapter {
    if (profile === null) return chapter;

    const sources = this.intelligence.getAvailableSources();
    const hasIntelligence = sources.length > 0;

    const expertSuffix =
      profile.experienceLevel === 'expert' && hasIntelligence
        ? ' Deep knowledge sources are available for your level.'
        : '';

    if (!expertSuffix) return chapter;

    return {
      ...chapter,
      narrativeSummary: chapter.narrativeSummary + expertSuffix,
    };
  }
}
