import { RUNTIME_STATE_ARCHITECTURES } from '../states';
import { RUNTIME_STATE_CLASSIFICATION_TAXONOMY, RUNTIME_STATE_VISIBILITY_MODEL } from '../taxonomy';
import * as runtimeInterfacesFacade from '../../runtime-interfaces/facade';

const REQUIRED_FIELDS = [
  'name', 'state_ownership', 'state_classification', 'state_lifecycle', 'state_visibility',
  'state_transitions', 'state_synchronization', 'state_restoration', 'state_invariants',
  'state_guards', 'state_traceability',
] as const;

describe('Runtime State Architectures', () => {
  it('defines exactly fifteen state architectures', () => {
    expect(RUNTIME_STATE_ARCHITECTURES).toHaveLength(15);
  });

  it('gives every state architecture all required fields', () => {
    for (const state of RUNTIME_STATE_ARCHITECTURES) {
      for (const field of REQUIRED_FIELDS) {
        expect(state).toHaveProperty(field);
      }
    }
  });

  it('assigns every state a classification consistent with the taxonomy membership', () => {
    for (const state of RUNTIME_STATE_ARCHITECTURES) {
      const stateName = state.name.replace(/Architecture$/, '');
      const taxonomyEntry = RUNTIME_STATE_CLASSIFICATION_TAXONOMY[state.state_classification];
      expect((taxonomyEntry.members as readonly string[])).toContain(stateName);
    }
  });

  it('assigns every state a visibility consistent with the visibility model membership', () => {
    for (const state of RUNTIME_STATE_ARCHITECTURES) {
      const stateName = state.name.replace(/Architecture$/, '');
      const visibilityEntry = RUNTIME_STATE_VISIBILITY_MODEL[state.state_visibility];
      expect((visibilityEntry.members as readonly string[])).toContain(stateName);
    }
  });

  it('names only guard functions that actually exist on the Runtime Interfaces facade', () => {
    const facadeExports = new Set(Object.keys(runtimeInterfacesFacade));
    for (const state of RUNTIME_STATE_ARCHITECTURES) {
      for (const guardName of state.state_guards) {
        expect({ state: state.name, guardName, exists: facadeExports.has(guardName) }).toEqual({
          state: state.name,
          guardName,
          exists: true,
        });
      }
    }
  });

  it('gives every state a non-empty invariants list and a non-empty restoration note', () => {
    for (const state of RUNTIME_STATE_ARCHITECTURES) {
      expect(state.state_invariants.length).toBeGreaterThan(0);
      expect(state.state_restoration.length).toBeGreaterThan(0);
    }
  });
});
