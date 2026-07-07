import { RUNTIME_INTEGRATION_INVARIANTS, RUNTIME_INTEGRATION_GUARDS } from '../invariants-and-guards';
// Two guards (isPublicRuntimeExport, isInternalRuntimeExport) are meta-guards over the Interfaces
// boundary itself, exported from runtime-interfaces/boundary.ts and re-exported via the package
// index rather than facade.ts, which carries only the operational surface.
import * as runtimeInterfacesAll from '../../runtime-interfaces';

describe('Runtime Integration Invariants', () => {
  it('is non-empty and every entry is fully traceable', () => {
    expect(RUNTIME_INTEGRATION_INVARIANTS.length).toBeGreaterThan(0);
    for (const invariant of RUNTIME_INTEGRATION_INVARIANTS) {
      expect(invariant.invariant.length).toBeGreaterThan(0);
      expect(invariant.source.length).toBeGreaterThan(0);
    }
  });
});

describe('Runtime Integration Guards', () => {
  it('names only guard functions that actually exist within the Runtime Interfaces package', () => {
    const facadeExports = new Set(Object.keys(runtimeInterfacesAll));
    for (const entry of RUNTIME_INTEGRATION_GUARDS) {
      expect({ guard: entry.guard, exists: facadeExports.has(entry.guard) }).toEqual({
        guard: entry.guard,
        exists: true,
      });
    }
  });

  it('gives every guard at least one named integration point that uses it', () => {
    for (const entry of RUNTIME_INTEGRATION_GUARDS) {
      expect(entry.usedBy.length).toBeGreaterThan(0);
    }
  });

  it('accounts for every value-level export the facade exposes as an executable function', () => {
    const guardNames = new Set(RUNTIME_INTEGRATION_GUARDS.map((g) => g.guard));
    const knownFunctionExports = [
      'isForwardTransition', 'isRenewalTransition', 'isSelfLoop', 'isPermittedLifecycleTransition',
      'isTerminalStage', 'resolveLifecycleEvent', 'isPermittedEmitter', 'visibilityOf',
      'isCitizenVisibleEffect', 'mayGhostGuideIntervene', 'mayCompanionSpeak',
      'mayInvisibleDirectorChangeRhythm', 'isChamberSilent', 'stateMetadataOf', 'stateVisibilityOf',
    ];
    for (const name of knownFunctionExports) {
      expect(guardNames.has(name)).toBe(true);
    }
  });
});
