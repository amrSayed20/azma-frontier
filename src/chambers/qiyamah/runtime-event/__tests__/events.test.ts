import { RUNTIME_EVENT_ARCHITECTURES } from '../events';
import { RUNTIME_EVENT_TAXONOMY } from '../taxonomy';
import * as runtimeInterfacesFacade from '../../runtime-interfaces/facade';
import type { RuntimeSignalKind } from '../../runtime-interfaces/facade';

const REQUIRED_FIELDS = [
  'name', 'event_ownership', 'event_taxonomy', 'event_origin', 'event_lifecycle',
  'event_propagation', 'event_ordering', 'event_visibility', 'event_guarantees',
  'event_constraints', 'event_invariants', 'event_guards', 'event_traceability',
] as const;

function kindFromName(name: string): RuntimeSignalKind {
  return name.replace(/EventArchitecture$/, '') as RuntimeSignalKind;
}

describe('Runtime Event Architectures', () => {
  it('defines exactly sixteen event architectures', () => {
    expect(RUNTIME_EVENT_ARCHITECTURES).toHaveLength(16);
  });

  it('gives every event architecture all required fields', () => {
    for (const event of RUNTIME_EVENT_ARCHITECTURES) {
      for (const field of REQUIRED_FIELDS) {
        expect(event).toHaveProperty(field);
      }
    }
  });

  it('assigns every event a taxonomy class consistent with taxonomy membership', () => {
    for (const event of RUNTIME_EVENT_ARCHITECTURES) {
      const kind = kindFromName(event.name);
      const taxonomyEntry = RUNTIME_EVENT_TAXONOMY[event.event_taxonomy];
      expect((taxonomyEntry.members as readonly string[])).toContain(kind);
    }
  });

  it('cross-checks every declared emitter against the Foundation\'s own isPermittedEmitter', () => {
    for (const event of RUNTIME_EVENT_ARCHITECTURES) {
      const kind = kindFromName(event.name);
      for (const emitter of event.event_ownership.emitters) {
        expect({
          kind,
          emitter,
          permitted: runtimeInterfacesFacade.isPermittedEmitter(kind, emitter),
        }).toEqual({ kind, emitter, permitted: true });
      }
    }
  });

  it('cross-checks every declared visibility against the Foundation\'s own visibilityOf', () => {
    for (const event of RUNTIME_EVENT_ARCHITECTURES) {
      const kind = kindFromName(event.name);
      expect(event.event_visibility).toBe(runtimeInterfacesFacade.visibilityOf(kind));
    }
  });

  it('names only guard functions that actually exist on the Runtime Interfaces facade', () => {
    const facadeExports = new Set(Object.keys(runtimeInterfacesFacade));
    for (const event of RUNTIME_EVENT_ARCHITECTURES) {
      for (const guardName of event.event_guards) {
        expect({ event: event.name, guardName, exists: facadeExports.has(guardName) }).toEqual({
          event: event.name,
          guardName,
          exists: true,
        });
      }
    }
  });

  it('gives every event a non-empty guarantees, constraints, and invariants list', () => {
    for (const event of RUNTIME_EVENT_ARCHITECTURES) {
      expect(event.event_guarantees.length).toBeGreaterThan(0);
      expect(event.event_constraints.length).toBeGreaterThan(0);
      expect(event.event_invariants.length).toBeGreaterThan(0);
    }
  });
});
