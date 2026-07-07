import { RUNTIME_VALIDATION_POINTS } from '../validation-points';
import * as runtimeInterfacesFacade from '../../runtime-interfaces/facade';

const REQUIRED_FIELDS = [
  'name', 'validation_ownership', 'validation_scope', 'validation_hierarchy',
  'validation_checkpoints', 'validation_dependencies', 'validation_invariants',
  'validation_failure_classifications', 'validation_outcomes',
  'cross_layer_validation_relationships', 'validation_guards', 'validation_traceability',
] as const;

describe('Runtime Validation Points', () => {
  it('defines exactly six validation points', () => {
    expect(RUNTIME_VALIDATION_POINTS).toHaveLength(6);
  });

  it('gives every validation point all required fields', () => {
    for (const point of RUNTIME_VALIDATION_POINTS) {
      for (const field of REQUIRED_FIELDS) {
        expect(point).toHaveProperty(field);
      }
    }
  });

  it('names only guard functions that actually exist on the Runtime Interfaces facade', () => {
    const facadeExports = new Set(Object.keys(runtimeInterfacesFacade));
    for (const point of RUNTIME_VALIDATION_POINTS) {
      for (const guardName of point.validation_guards) {
        expect({ point: point.name, guardName, exists: facadeExports.has(guardName) }).toEqual({
          point: point.name,
          guardName,
          exists: true,
        });
      }
    }
  });

  it('gives every validation point a non-empty checkpoints and invariants list', () => {
    for (const point of RUNTIME_VALIDATION_POINTS) {
      expect(point.validation_checkpoints.length).toBeGreaterThan(0);
      expect(point.validation_invariants.length).toBeGreaterThan(0);
    }
  });
});
