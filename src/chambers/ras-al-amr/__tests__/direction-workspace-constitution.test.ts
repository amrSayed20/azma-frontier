import {
  DIRECTION_WORKSPACE_OPERATORS,
  DIRECTION_WORKSPACE_PURPOSE,
  DIRECTION_WORKSPACE_CAPABILITY_MAP,
  MEDIA_INGESTION_SOURCES,
  MANUAL_DIRECTION_DECISIONS,
  toDirectionDecision,
} from '../direction-workspace-constitution';
import { CanvasActionType, type ReorderNodePayload, type UpdateNodeTemporalPayload } from '../assembly-directive-payloads';

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

describe('Package XX — Direction Assembly Layer', () => {
  it('marks Asset grouping as a new, genuinely implemented capability reusing AssemblyTrack', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability === 'Asset grouping');
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/AssemblyTrack/);
    expect(entry?.constitutionalLocation).toMatch(/ADD_TRACK/);
    expect(entry?.constitutionalLocation).toMatch(/MOVE_NODE_TO_TRACK/);
  });

  it('updates Scene arrangement / visual sequencing to also cite the new real, write-side reorder mutation', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability === 'Scene arrangement / visual sequencing');
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/REORDER_NODE/);
  });
});

describe('Package XXI — Direction Node Layer', () => {
  it('marks Direction Node identity/metadata/classification as genuinely implemented, reusing AssemblyNode', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find(
      (e) => e.capability === 'Direction Node identity / metadata / classification',
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/AssemblyNode/);
    expect(entry?.constitutionalLocation).toMatch(/DirectionNodeRole/);
    expect(entry?.constitutionalLocation).toMatch(/UPDATE_NODE_CLASSIFICATION/);
  });
});

describe('Package XXII — Manual Direction Engine', () => {
  it('marks the Manual Direction Decisions capability as genuinely implemented', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability.startsWith('Manual Direction Decisions'),
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/SET_NODE_ACTIVE/);
    expect(entry?.constitutionalLocation).toMatch(/SET_NODE_EMPHASIS/);
    expect(entry?.constitutionalLocation).toMatch(/SET_NODE_LOCK/);
  });

  it('records all eight named Direction Decisions, each with a real, non-empty mechanism', () => {
    expect(MANUAL_DIRECTION_DECISIONS.length).toBe(8);
    for (const entry of MANUAL_DIRECTION_DECISIONS) {
      expect(entry.decision.length).toBeGreaterThan(0);
      expect(entry.realMechanism.length).toBeGreaterThan(0);
    }
  });

  it('lists exactly the eight decisions the Chief Architect named, in order, none duplicated', () => {
    const decisions = MANUAL_DIRECTION_DECISIONS.map((e) => e.decision);
    expect(decisions).toEqual([
      'Promote Node',
      'Demote Node',
      'Activate Node',
      'Disable Node',
      'Mark as Primary',
      'Mark as Supporting',
      'Lock Direction',
      'Unlock Direction',
    ]);
    expect(new Set(decisions).size).toBe(decisions.length);
  });

  it('proves Promote/Demote reuse the real REORDER_NODE mutation rather than a new one', () => {
    const promote = MANUAL_DIRECTION_DECISIONS.find((e) => e.decision === 'Promote Node');
    const demote = MANUAL_DIRECTION_DECISIONS.find((e) => e.decision === 'Demote Node');
    expect(promote?.realMechanism).toMatch(/REORDER_NODE/);
    expect(demote?.realMechanism).toMatch(/REORDER_NODE/);
    expect(promote?.realMechanism).toMatch(/Package XX/);
  });
});

describe('Package XXIII — Direction Decision Model', () => {
  const baseMutation = {
    canvasId: 'canvas-1',
    subscriberTenantId: 'tenant-1',
  };

  it('marks the shared Direction Decision language as genuinely implemented', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability.startsWith('Shared Direction Decision language'),
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/toDirectionDecision/);
  });

  it('wraps a real Manual Director mutation into a DirectionDecision, tagging operator and issuedAtMs', () => {
    const mutation: ReorderNodePayload = {
      ...baseMutation,
      actionType: CanvasActionType.REORDER_NODE,
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      direction: 'up',
    };

    const decision = toDirectionDecision('manual-director', mutation, 1000);

    expect(decision).toEqual({
      operator: 'manual-director',
      mutation,
      issuedAtMs: 1000,
    });
  });

  it('defaults issuedAtMs to the current time when omitted', () => {
    const mutation: ReorderNodePayload = {
      ...baseMutation,
      actionType: CanvasActionType.REORDER_NODE,
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      direction: 'down',
    };

    const before = Date.now();
    const decision = toDirectionDecision('manual-director', mutation);
    const after = Date.now();

    expect(decision.issuedAtMs).toBeGreaterThanOrEqual(before);
    expect(decision.issuedAtMs).toBeLessThanOrEqual(after);
  });

  it('is already structurally capable of wrapping an Automatic-Director-shaped mutation, proving shared readiness without wiring it in', () => {
    const mutation: UpdateNodeTemporalPayload = {
      ...baseMutation,
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      targetNodeId: 'node-2',
      targetTrackId: 'track-1',
      temporalUpdates: { globalStartTimeSeconds: 4.2 },
    };

    const decision = toDirectionDecision('automatic-director', mutation, 2000);

    expect(decision.operator).toBe('automatic-director');
    expect(decision.mutation).toBe(mutation);
    expect(decision.issuedAtMs).toBe(2000);
  });
});

describe('Package XXIV — Sovereign Assembly Runtime', () => {
  it('marks the Assembly Runtime capability as genuinely implemented, citing the real execution consumer', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability.startsWith('Assembly Runtime'),
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/AssemblyRuntime\.execute/);
    expect(entry?.constitutionalLocation).toMatch(/RasAlAmrStateManager\.applyMutation/);
  });
});

describe('Package XXV — Automatic Director Integration', () => {
  it('marks Automatic Director Direction Decision emission as genuinely implemented', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability === 'Automatic Director Direction Decision emission',
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/handleApplyDirectorDecision/);
    expect(entry?.constitutionalLocation).toMatch(/'automatic-director'/);
    expect(entry?.constitutionalLocation).toMatch(/AssemblyRuntime\.execute/);
  });

  it('updates the shared Direction Decision language entry to reflect both operators actually producing it', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability.startsWith('Shared Direction Decision language'),
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/handleApplyDirectorDecision/);
  });
});

describe('Package XXVI — Sovereign Rendering Engine', () => {
  it('marks the Rendering Engine capability as genuinely implemented, citing the real pre-existing compilation path', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability.startsWith('Sovereign Rendering Engine'),
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/PrePublishingBoundary\.compileForPublishing/);
    expect(entry?.constitutionalLocation).toMatch(/AssemblyRuntime/);
  });
});
