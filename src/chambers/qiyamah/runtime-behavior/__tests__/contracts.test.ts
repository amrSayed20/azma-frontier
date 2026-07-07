import { RUNTIME_CONTRACT_BEHAVIORS } from '../contracts';
import * as runtimeInterfacesFacade from '../../runtime-interfaces/facade';

const REQUIRED_FIELDS = [
  'name', 'behavioral_responsibility', 'behavioral_contracts', 'interaction_sequencing',
  'signal_propagation_behavior', 'transition_behavior', 'synchronization_behavior',
  'invariants', 'guards', 'behavioral_validation', 'traceability',
] as const;

describe('Runtime Contract Behaviors', () => {
  it('defines exactly seven contract behaviors, one per Stage 6 interface entry', () => {
    expect(RUNTIME_CONTRACT_BEHAVIORS).toHaveLength(7);
  });

  it('gives every behavior entry all required fields', () => {
    for (const behavior of RUNTIME_CONTRACT_BEHAVIORS) {
      for (const field of REQUIRED_FIELDS) {
        expect(behavior).toHaveProperty(field);
      }
    }
  });

  it('gives every behavior entry a non-empty behavioral_contracts and invariants list', () => {
    for (const behavior of RUNTIME_CONTRACT_BEHAVIORS) {
      expect(behavior.behavioral_contracts.length).toBeGreaterThan(0);
      expect(behavior.invariants.length).toBeGreaterThan(0);
    }
  });

  it('names only guard functions that actually exist on the Runtime Interfaces facade', () => {
    const facadeExports = new Set(Object.keys(runtimeInterfacesFacade));
    for (const behavior of RUNTIME_CONTRACT_BEHAVIORS) {
      for (const guardName of behavior.guards) {
        expect({ behavior: behavior.name, guardName, exists: facadeExports.has(guardName) }).toEqual({
          behavior: behavior.name,
          guardName,
          exists: true,
        });
      }
    }
  });

  it('never invents a new function name beyond the facade\'s existing guard surface', () => {
    const allGuardNames = RUNTIME_CONTRACT_BEHAVIORS.flatMap((behavior) => behavior.guards);
    const facadeExports = new Set(Object.keys(runtimeInterfacesFacade));
    const unknown = allGuardNames.filter((name) => !facadeExports.has(name));
    expect(unknown).toEqual([]);
  });
});
