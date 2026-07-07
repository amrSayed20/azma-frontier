import { RUNTIME_BOUNDARY_CHECKS, RUNTIME_BOUNDARY_CHECKS_WITHOUT_A_GUARD } from '../boundary-checks';
// The mechanism boundary's guards (isPublicRuntimeExport, isInternalRuntimeExport) are meta-guards
// over the Interfaces boundary itself, exported from runtime-interfaces/boundary.ts and re-exported
// via the package index — not from facade.ts, which carries only the operational surface.
import * as runtimeInterfacesAll from '../../runtime-interfaces';

describe('Runtime Boundary Checks', () => {
  it('defines exactly eight boundary checks', () => {
    expect(RUNTIME_BOUNDARY_CHECKS).toHaveLength(8);
  });

  it('names only guard functions that actually exist within the Runtime Interfaces package', () => {
    const facadeExports = new Set(Object.keys(runtimeInterfacesAll));
    for (const check of RUNTIME_BOUNDARY_CHECKS) {
      for (const guardName of check.validation_guards) {
        expect({ check: check.name, guardName, exists: facadeExports.has(guardName) }).toEqual({
          check: check.name,
          guardName,
          exists: true,
        });
      }
    }
  });

  it('honestly discloses exactly the boundary checks with no runtime guard', () => {
    const emptyGuardChecks = RUNTIME_BOUNDARY_CHECKS
      .filter((check) => check.validation_guards.length === 0)
      .map((check) => check.validation_traceability.architecturalBoundary?.match(/BOUNDARY_CHECK_(\w+)/)?.[1]);

    expect(RUNTIME_BOUNDARY_CHECKS_WITHOUT_A_GUARD.boundaries).toHaveLength(emptyGuardChecks.length);
  });

  it('never leaves a boundary check\'s reason or consequence empty', () => {
    expect(RUNTIME_BOUNDARY_CHECKS_WITHOUT_A_GUARD.reason.length).toBeGreaterThan(0);
    expect(RUNTIME_BOUNDARY_CHECKS_WITHOUT_A_GUARD.consequence.length).toBeGreaterThan(0);
  });
});
