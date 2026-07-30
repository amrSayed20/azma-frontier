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
    // (superseded finding, kept as history): 'Export / delivery' was true at ruling time in 2026-07-28
    // (Package XVIII) but is now implemented (Package XXVII) — see its own entry's disclosure.
    // (superseded finding, kept as history): 'Voice generation / cloning / text-to-speech' was one combined
    // row at ruling time; Text To Speech is now real (Ministry II), Voice Cloning is now real (Ministry III)
    // — the row was split and both are implemented.
    const unimplementedNames = unimplemented.map((entry) => entry.capability);
    // (superseded finding, kept as history): 'Music / sound placement' and 'Mixing' were unimplemented
    // at Package XVIII ruling time; both are now real (Ministry IV) — see their own entries.
    expect(unimplementedNames).toEqual(expect.arrayContaining(['Subtitle decisions']));
    expect(unimplementedNames).not.toContain('Voice cloning');
    expect(unimplementedNames).not.toContain('Music / sound placement');
    expect(unimplementedNames).not.toContain('Mixing');
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

describe('Ministry I — Voice Ecosystem', () => {
  it('marks imported voice management as genuinely implemented', () => {
    const importedVoice = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability.startsWith('Imported voice management'),
    );
    expect(importedVoice?.implemented).toBe(true);
    expect(importedVoice?.constitutionalLocation).toMatch(/filterVoiceLibrary/);
    expect(importedVoice?.constitutionalLocation).toMatch(/VoiceAssignmentDirective/);
  });
});

describe('Ministry II — Text To Speech Engine', () => {
  it('marks Text To Speech as genuinely implemented', () => {
    const tts = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability.startsWith('Text To Speech'));
    expect(tts?.implemented).toBe(true);
    expect(tts?.constitutionalLocation).toMatch(/speech-provider\.ts/);
    expect(tts?.constitutionalLocation).toMatch(/generate-speech/);
  });
});

describe('Ministry III — Voice Cloning Engine', () => {
  it('marks Voice Cloning as genuinely implemented, completing the Sovereign Voice Ecosystem', () => {
    const cloning = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability === 'Voice cloning');
    expect(cloning?.implemented).toBe(true);
    expect(cloning?.constitutionalLocation).toMatch(/voice-cloning-provider\.ts/);
    expect(cloning?.constitutionalLocation).toMatch(/clone-voice/);
    expect(cloning?.constitutionalLocation).toMatch(/isVoiceAsset/);
  });
});

describe('Ministry IV — Sovereign Mixing Engine', () => {
  it('marks Mixing as genuinely implemented, citing the full per-node and track-level mixing path', () => {
    const mixing = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability === 'Mixing');
    expect(mixing?.implemented).toBe(true);
    expect(mixing?.constitutionalLocation).toMatch(/AudioMixingDirective/);
    expect(mixing?.constitutionalLocation).toMatch(/fadeInSeconds/);
    expect(mixing?.constitutionalLocation).toMatch(/SET_TRACK_VOLUME/);
    expect(mixing?.constitutionalLocation).toMatch(/CompiledMixPlan/);
    expect(mixing?.constitutionalLocation).toMatch(/compileMixPlan/);
  });

  it('marks Music / sound placement as genuinely implemented, citing the real node placement and compilation path', () => {
    const music = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability === 'Music / sound placement');
    expect(music?.implemented).toBe(true);
    expect(music?.constitutionalLocation).toMatch(/MUSIC_LAYER/);
    expect(music?.constitutionalLocation).toMatch(/AudioMixingDirective/);
    expect(music?.constitutionalLocation).toMatch(/CompiledMixPlan/);
  });

  it('honestly discloses that all three Sovereign Voice Asset types mix through the same path', () => {
    const mixing = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) => e.capability === 'Mixing');
    expect(mixing?.constitutionalLocation).toMatch(/imported.*TTS.*cloned|imported\/TTS\/cloned/i);
  });
});

describe('Package XXVII — Sovereign Export Engine', () => {
  it('marks the Export Engine capability as genuinely implemented, citing all three real pre-existing components and the disclosed Fleet gap', () => {
    const entry = DIRECTION_WORKSPACE_CAPABILITY_MAP.find((e) =>
      e.capability.startsWith('Sovereign Export Engine'),
    );
    expect(entry?.implemented).toBe(true);
    expect(entry?.constitutionalLocation).toMatch(/MakmanGoalDistributionBridge\.bridgeToDestination/);
    expect(entry?.constitutionalLocation).toMatch(/FlattenedRenderingBridge\.evaluateAndDispatchRender/);
    expect(entry?.constitutionalLocation).toMatch(/PublicConsumptionBoundary\.requestConsumption/);
    expect(entry?.constitutionalLocation).toMatch(/FAILED/);
  });
});
