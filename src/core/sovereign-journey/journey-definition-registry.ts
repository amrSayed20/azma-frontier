import type { JourneyTypeId, JourneyDefinition, JourneyRecord } from './sovereign-journey-types';
import { FIRST_JOURNEY_DEFINITION } from './sovereign-journey-types';

export class JourneyDefinitionRegistry {
  private readonly definitions = new Map<JourneyTypeId, JourneyDefinition>([
    ['FIRST_JOURNEY', FIRST_JOURNEY_DEFINITION],
  ]);

  register(definition: JourneyDefinition): void {
    if (definition.journeyTypeId === 'FIRST_JOURNEY') {
      throw new Error('FIRST_JOURNEY_DEFINITION is immutable and cannot be re-registered.');
    }
    this.definitions.set(definition.journeyTypeId, definition);
  }

  get(journeyTypeId: JourneyTypeId): JourneyDefinition {
    const def = this.definitions.get(journeyTypeId);
    if (def === undefined) throw new Error(`Unknown journey type: ${journeyTypeId}`);
    return def;
  }

  list(): readonly JourneyDefinition[] {
    return [...this.definitions.values()];
  }

  listAvailable(sessionRecords: readonly JourneyRecord[]): readonly JourneyDefinition[] {
    return this.list().filter((def) => {
      if (def.isRepeatable) return true;
      return !sessionRecords.some(
        (r) =>
          r.journeyTypeId === def.journeyTypeId &&
          (r.phase === 'JOURNEY_COMPLETE' || r.phase === 'JOURNEY_SKIPPED'),
      );
    });
  }
}
