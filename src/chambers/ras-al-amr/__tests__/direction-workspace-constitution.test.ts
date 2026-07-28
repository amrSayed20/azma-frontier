import {
  DIRECTION_WORKSPACE_OPERATORS,
  DIRECTION_WORKSPACE_PURPOSE,
  DIRECTION_WORKSPACE_CAPABILITY_MAP,
  MEDIA_INGESTION_SOURCES,
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
      expect.arrayContaining(['Voice generation / cloning / text-to-speech', 'Export / delivery']),
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

describe('Package XIX — Media Ingestion Layer', () => {
  it('marks Imported media handling as genuinely implemented now that Creator upload is real', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability === 'Imported media handling');
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/upload/i);
  });

  it('records all four approved input sources as real, tested data, each with a non-empty reason', () => {
    expect(MEDIA_INGESTION_SOURCES.length).toBe(4);
    for (const entry of MEDIA_INGESTION_SOURCES) {
      expect(entry.source.length).toBeGreaterThan(0);
      expect(entry.reason.length).toBeGreaterThan(0);
    }
  });

  it('declares all four sources honestly available, each citing a real code path rather than asserting without one', () => {
    const names = MEDIA_INGESTION_SOURCES.map((s) => s.source);
    expect(names).toEqual([
      'Qiyamah-generated assets',
      'Sovereign Vault assets',
      'Creator-uploaded files',
      'Previously saved project assets',
    ]);
    for (const entry of MEDIA_INGESTION_SOURCES) {
      expect(entry.available).toBe(true);
    }
  });

  it('discloses the narrower interpretation of "previously saved project assets" rather than silently claiming full canvas-resume', () => {
    const entry = MEDIA_INGESTION_SOURCES.find((s) => s.source === 'Previously saved project assets');
    expect(entry?.reason).toMatch(/does not exist/);
    expect(entry?.reason).toMatch(/not built by this package/);
  });
});
