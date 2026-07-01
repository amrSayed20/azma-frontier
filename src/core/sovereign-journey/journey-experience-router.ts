import type { JourneyExperienceAdapter, JourneyCompanionContext, JourneyChapter, JourneyRecord } from './sovereign-journey-types';

export class JourneyAdapterConformanceError extends Error {
  constructor(adapterId: string, missingMethod: string) {
    super(`JourneyExperienceAdapter '${adapterId}' is missing required method: ${missingMethod}`);
    this.name = 'JourneyAdapterConformanceError';
  }
}

const REQUIRED_METHODS: ReadonlyArray<keyof JourneyExperienceAdapter> = [
  'presentWelcome',
  'presentChapter',
  'presentChapterComplete',
  'presentCompletion',
  'presentPause',
  'presentResume',
];

export class DefaultConversationalAdapter implements JourneyExperienceAdapter {
  readonly adapterId = 'default-conversational';
  readonly adapterType = 'default' as const;

  async presentWelcome(_context: JourneyCompanionContext): Promise<void> {}
  async presentChapter(_chapter: JourneyChapter, _context: JourneyCompanionContext): Promise<void> {}
  async presentChapterComplete(_chapter: JourneyChapter, _context: JourneyCompanionContext): Promise<void> {}
  async presentCompletion(_record: JourneyRecord): Promise<void> {}
  async presentPause(_record: JourneyRecord): Promise<void> {}
  async presentResume(_record: JourneyRecord): Promise<void> {}
}

export class JourneyExperienceRouter {
  private readonly adapters = new Map<string, JourneyExperienceAdapter>();
  private activeAdapterId: string;

  constructor(defaultAdapter: JourneyExperienceAdapter = new DefaultConversationalAdapter()) {
    this.validate(defaultAdapter);
    this.adapters.set(defaultAdapter.adapterId, defaultAdapter);
    this.activeAdapterId = defaultAdapter.adapterId;
  }

  register(adapter: JourneyExperienceAdapter): void {
    this.validate(adapter);
    this.adapters.set(adapter.adapterId, adapter);
  }

  activate(adapterId: string): void {
    if (!this.adapters.has(adapterId)) {
      throw new Error(`Adapter not registered: ${adapterId}`);
    }
    this.activeAdapterId = adapterId;
  }

  getActive(): JourneyExperienceAdapter {
    const adapter = this.adapters.get(this.activeAdapterId);
    if (adapter === undefined) throw new Error('No active adapter found.');
    return adapter;
  }

  private validate(adapter: JourneyExperienceAdapter): void {
    for (const method of REQUIRED_METHODS) {
      if (typeof (adapter as unknown as Record<string, unknown>)[method] !== 'function') {
        throw new JourneyAdapterConformanceError(adapter.adapterId, String(method));
      }
    }
  }
}
