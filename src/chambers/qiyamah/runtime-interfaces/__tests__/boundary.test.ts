import {
  RUNTIME_INTERFACE_BOUNDARY,
  RUNTIME_INTERFACE_CONSUMERS,
  isPublicRuntimeExport,
  isInternalRuntimeExport,
} from '../boundary';

describe('Runtime Interface Boundary', () => {
  it('names exactly the seven future runtime consumers established in Stage 5, Article VI', () => {
    expect(RUNTIME_INTERFACE_CONSUMERS).toEqual([
      'Application Runtime', 'Presentation Runtime', 'UI Runtime', 'AI Runtime',
      'Engine Runtime', 'Workflow Runtime', 'Execution Runtime',
    ]);
  });

  it('never lists the same export name as both public and internal, for any module', () => {
    for (const [moduleKey, entry] of Object.entries(RUNTIME_INTERFACE_BOUNDARY)) {
      const overlap = (entry.public as readonly string[]).filter((name) =>
        (entry.internal as readonly string[]).includes(name),
      );
      expect({ moduleKey, overlap }).toEqual({ moduleKey, overlap: [] });
    }
  });

  it('correctly reports public and internal membership via the guard functions', () => {
    expect(isPublicRuntimeExport('lifecycle', 'RUNTIME_LIFECYCLE_STAGES')).toBe(true);
    expect(isInternalRuntimeExport('lifecycle', 'RUNTIME_LIFECYCLE_STAGES')).toBe(false);

    expect(isInternalRuntimeExport('lifecycle', 'RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS')).toBe(true);
    expect(isPublicRuntimeExport('lifecycle', 'RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS')).toBe(false);

    expect(isInternalRuntimeExport('states', 'RUNTIME_STATE_METADATA')).toBe(true);
    expect(isInternalRuntimeExport('signals', 'RUNTIME_SIGNAL_EMITTERS')).toBe(true);
  });

  it('reports false for names that exist in neither list', () => {
    expect(isPublicRuntimeExport('lifecycle', 'SomeNameThatDoesNotExist')).toBe(false);
    expect(isInternalRuntimeExport('lifecycle', 'SomeNameThatDoesNotExist')).toBe(false);
  });

  it('declares no internal exports for the contracts module (every actor contract is public)', () => {
    expect(RUNTIME_INTERFACE_BOUNDARY.contracts.internal).toEqual([]);
  });
});
