import {
  DIRECTION_WORKSPACE_OPERATORS,
  DIRECTION_WORKSPACE_PURPOSE,
  DIRECTION_WORKSPACE_CAPABILITY_MAP,
} from '../direction-workspace-constitution';

describe('Package XVIII — Direction Workspace Foundation', () => {
  it('declares exactly the two constitutional operators — never a third, never a duplicate', () => {
    expect(DIRECTION_WORKSPACE_OPERATORS).toEqual(['manual-director', 'automatic-director']);
    expect(new Set(DIRECTION_WORKSPACE_OPERATORS).size).toBe(2);
  });

  it('states a real, non-empty purpose that names both operators and rules out a separate editing chamber', () => {
    expect(DIRECTION_WORKSPACE_PURPOSE.length).toBeGreaterThan(0);
    expect(DIRECTION_WORKSPACE_PURPOSE).toMatch(/Manual Director/);
    expect(DIRECTION_WORKSPACE_PURPOSE).toMatch(/Automatic Director/);
    expect(DIRECTION_WORKSPACE_PURPOSE.toLowerCase()).toMatch(/editing/);
  });

  it('gives every declared capability a real, non-empty constitutional location — never an unnamed future', () => {
    for (const entry of DIRECTION_WORKSPACE_CAPABILITY_MAP) {
      expect(entry.capability.length).toBeGreaterThan(0);
      expect(entry.constitutionalLocation.length).toBeGreaterThan(0);
    }
  });

  it('never declares the same capability twice', () => {
    const names = DIRECTION_WORKSPACE_CAPABILITY_MAP.map((entry) => entry.capability);
    expect(new Set(names).size).toBe(names.length);
  });

  it('honestly marks unimplemented future capabilities rather than claiming completeness', () => {
    const unimplemented = DIRECTION_WORKSPACE_CAPABILITY_MAP.filter((entry) => !entry.implemented);
    expect(unimplemented.length).toBeGreaterThan(0);
    // Every capability this ruling explicitly named as belonging to Ras Al Amr but not yet built.
    const unimplementedNames = unimplemented.map((entry) => entry.capability);
    expect(unimplementedNames).toEqual(
      expect.arrayContaining([
        'Imported media handling',
        'Voice generation / cloning / text-to-speech',
        'Export / delivery',
      ]),
    );
  });

  it('marks the already-real capabilities as implemented, reusing existing structures rather than re-declaring them as future work', () => {
    const implemented = DIRECTION_WORKSPACE_CAPABILITY_MAP.filter((entry) => entry.implemented);
    const implementedNames = implemented.map((entry) => entry.capability);
    expect(implementedNames).toEqual(
      expect.arrayContaining(['Asset placement', 'Scene arrangement / visual sequencing']),
    );
  });
});
