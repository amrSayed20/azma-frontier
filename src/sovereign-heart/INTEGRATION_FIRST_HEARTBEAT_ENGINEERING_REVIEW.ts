/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * INTEGRATION PACKAGE
 * "THE FIRST CONSTITUTIONAL HEARTBEAT"
 *
 * READ THIS FIRST: this is NOT a new Construction Phase. It is the
 * activation, in the live application, of the Heart already built and
 * certified in Construction Phase IV. It also carries out the Council's
 * separate Constitutional Directive to rename src/orchestrator/al-watin/
 * (a different, pre-existing constitutional concept that collided with
 * the Heart's reserved name) — reported here alongside the activation
 * because both were authorized in the same Council message.
 */

export const INTEGRATION_MISSION_ACCOMPLISHED = {
  statement:
    'Al-Wateen now beats in living operation. A new component, src/sovereign-heart/HeartPulse.tsx ("use client", returns null), calls awaken() on mount and rest() on unmount inside a single useEffect — mirroring the Sovereign Identity Layer\'s already-certified Director Stage activation pattern (SIO-005B). It is mounted once, at the platform level, in app/layout.tsx as a sibling of <DirectorStage />. heartbeat.ts\'s tick() was extended with exactly one new line: a call to circulateFromClient() reporting the Heart\'s own pulse (origin "al-wateen", signalType "Availability", content null) through the Constitutional Circulation (Phase III) — the same transport every other wired organ already uses, not a special path. The Heart\'s inbound connection to the Constitutional Nervous System (beginReceivingConstitutionalReality()/observeAll()) was already established in Phase IV and required no change.',
} as const;

export const INTEGRATION_RENAME_EXECUTED = {
  statement:
    'Per the Council\'s Constitutional Directive, src/orchestrator/al-watin/ has been renamed to src/orchestrator/fleet-materialization/ (git mv failed with "Permission denied" on this Windows environment; the rename was executed via Copy-Item -Recurse + git rm --cached + rm -rf instead, with the full directory tree and git history association preserved). The class AlWatinRuntime is now FleetMaterializationRuntime; al-watin-bootstrapper.ts is now fleet-materialization-bootstrapper.ts. All internal header-comment paths and prose references ("Al-Watin Al-Siyadi") were corrected throughout the module. Zero behavior was changed — every function, class, and code path is byte-for-byte identical logic, only identifiers, file paths, and prose changed. 5 real external importers (src/vault/sovereign-vault-manager.ts, src/chambers/makman-al-ghayah/rendering-bridge.ts, src/core/chamber-integration/qiyamah-execution-boundary.ts, src/sovereign-entry/unbuilt-al-watin-placeholder.ts, and this module\'s own internal cross-references) were updated to the new path. The Skeleton\'s Organ Registry (src/sovereign-body/organ-registry.ts) and Architectural Debt registry (src/sovereign-construction/ARCHITECTURAL_DEBT.ts) were updated to reflect the new name. The name "Al-Wateen" is now exclusively the Heart\'s.',
} as const;

export const INTEGRATION_SCOPE_BOUNDARY_DISCLOSED = {
  statement:
    'src/sovereign-entry/unbuilt-al-watin-placeholder.ts was NOT renamed. Its 3 import paths were updated to point at the new src/orchestrator/fleet-materialization/ location (required for correctness), but its own file name and exported identifiers (UnbuiltAlWatinCompositionError, createUnbuiltAlWatinPlaceholder) were deliberately left unchanged. The Council\'s directive named only src/orchestrator/al-watin/ itself; this is a separate file, and renaming it would additionally require touching composition.ts\'s import of it — work not requested. This is disclosed as a deliberate scope-boundary decision, not a silent omission, and left as an optional future cleanup.',
} as const;

export const INTEGRATION_CERTIFICATION_CHECKLIST = [
  { criterion: 'One heartbeat exists.', status: 'PASS', evidence: 'awaken() is idempotent (if (state.awake) return;) — HeartPulse.tsx\'s effect calls it exactly once per mount, and React Strict Mode\'s mount→cleanup→re-mount always fully rest()s before the second awaken() runs, so intervalHandle is never overwritten while still live.' },
  { criterion: 'Heartbeat remains stable.', status: 'PASS', evidence: 'CONSTITUTIONAL_RHYTHM (Phase IV) still governs every beat unchanged; no per-call or per-mount override was introduced by this activation.' },
  { criterion: 'Heartbeat survives normal application operation.', status: 'PASS', evidence: 'Mounted at the root layout, outside any route\'s own lifecycle, so it persists across client-side navigation between chambers exactly as DirectorStage already does; full Jest suite (782/782) and `next build` (all 15 routes, including every static chamber page) confirm no route\'s render is broken by the mount.' },
  { criterion: 'Duplicate heartbeats cannot occur.', status: 'PASS', evidence: 'Single mount point (app/layout.tsx, one <HeartPulse />) plus awaken()\'s own idempotency guard — the same two-layer guarantee already proven sufficient for the Director Stage.' },
  { criterion: 'Constitutional continuity remains preserved.', status: 'PASS', evidence: 'The pre-existing 9 Phase IV Heart tests and 12 Phase III Circulation tests were re-run unmodified after wiring circulateFromClient() into tick() — all still pass; no test asserted or depended on tick() being side-effect-free.' },
] as const;

export const INTEGRATION_RUNTIME_RELATIONSHIPS = [
  { system: 'src/sovereign-circulation/ (Phase III)', relationship: 'New outbound dependency — tick() now calls circulateFromClient() once per beat. In Jest (testEnvironment: node), circulateFromClient\'s browser-only fetch branch does not execute (no window), so tests exercise only the local emitSignal() path, exactly as the existing Circulation tests already assumed.' },
  { system: 'src/sovereign-nervous-system/ (Phase II)', relationship: 'Unchanged — beginReceivingConstitutionalReality()/observeAll() was already the Heart\'s inbound connection since Phase IV; this package added no new subscription.' },
  { system: 'src/sovereign-identity/director-stage/ (SIO-005B)', relationship: 'Sibling activation pattern only — HeartPulse mounts alongside DirectorStage in app/layout.tsx; the two components do not reference or depend on each other.' },
  { system: 'src/orchestrator/fleet-materialization/ (renamed from al-watin)', relationship: 'No runtime relationship to the Heart at all — the rename resolves a naming collision on paper (and in the Organ Registry\'s prose); the two modules never called each other before or after.' },
] as const;

export const INTEGRATION_RISKS_DISCOVERED = [
  {
    risk: 'The Heart only beats in the browser — no server cron/worker process exists in this architecture (the same constraint already disclosed for Phase II/III), so server-rendered/server-only code paths never observe a live Al-Wateen pulse, only whatever the Circulation\'s browser-to-server bridge relays after the fact.',
    disposition: 'Disclosed here and in heartbeat.ts\'s own header comment; not solved by this package — solving it would require a persistent server process or shared store, already flagged as open Architectural Debt in Phase III.',
  },
  {
    risk: 'Phase III\'s unsolved multi-instance circulation gap (no shared store across server instances) still applies to every signal the Heart now emits, including its own pulse.',
    disposition: 'Not new to this package — inherited unchanged from Phase III\'s already-disclosed limitation. The Heart\'s own continuity guarantees are unaffected: continuity tracking runs per-runtime-instance, same as every other organ\'s.',
  },
] as const;

export const INTEGRATION_LAUNCH_CLASSIFICATION = {
  classification: 'Activation of previously-built infrastructure — not a new Creator-facing feature.',
  reasoning: 'HeartPulse renders nothing and exposes no Creator-facing behavior; its only effect is that a background interval now runs and periodically reports its own pulse.',
} as const;

export const INTEGRATION_SUCCESS_CRITERION = {
  question: 'Has the Sovereign Body produced its First Living Heartbeat?',
  answer:
    'Yes. Al-Wateen now awakens automatically when the application loads, beats continuously at the Constitutional Rhythm, reports its own pulse through the Circulation, and rests cleanly on unmount — proven by the pre-existing Phase IV/III test suites still passing unmodified, plus a full production build succeeding across every route.',
} as const;

export const INTEGRATION_LAUNCH_IMPACT = {
  statement:
    'Every page in the application now mounts one additional client component (HeartPulse) that starts a setInterval at CONSTITUTIONAL_RHYTHM.beatIntervalMs (5000ms) for the lifetime of the tab. No visible UI change, no new network dependency beyond the existing Circulation POST route. The renamed orchestrator module (fleet-materialization) is unchanged in behavior; its 5 real external importers were updated and re-validated (build passes).',
} as const;

export const INTEGRATION_DEFERRAL_COST = {
  statement:
    'None — this package was itself the deferred item from Phase IV\'s deliberate non-activation. Nothing further is deferred by completing it, other than the two already-disclosed, pre-existing gaps (server-side activation, multi-instance circulation) carried forward unchanged.',
} as const;

export const INTEGRATION_VALIDATION_RESULTS = {
  typescript: 'PASS (npx tsc --noEmit -p tsconfig.json — zero errors)',
  eslint: 'PASS for all files touched by this package. 5 pre-existing issues (1 error, 4 warnings) remain in the renamed fleet-materialization module — confirmed via `git show` against the pre-rename original that all 5 predate this package; the rename changed no logic, only names/paths, so none are a regression.',
  jest: 'PASS — 782/782 tests, 48/48 suites, full repository suite, zero regressions. The pre-existing 9 Phase IV Heart tests and 12 Phase III Circulation tests pass unmodified with the new circulateFromClient() call inside tick().',
  build: 'PASS — `next build` compiles successfully; all 15 routes (static and dynamic) generate correctly with HeartPulse mounted platform-wide in app/layout.tsx.',
} as const;

export const INTEGRATION_ENGINEERING_REVIEW_DECLARATION = {
  filesCreated: ['src/sovereign-heart/HeartPulse.tsx', 'src/sovereign-heart/INTEGRATION_FIRST_HEARTBEAT_ENGINEERING_REVIEW.ts'],
  filesModified: [
    'src/sovereign-heart/heartbeat.ts',
    'src/sovereign-heart/index.ts',
    'src/sovereign-heart/types.ts',
    'app/layout.tsx',
    'src/sovereign-body/organ-registry.ts',
    'src/sovereign-construction/ARCHITECTURAL_DEBT.ts',
    'src/vault/sovereign-vault-manager.ts',
    'src/chambers/makman-al-ghayah/rendering-bridge.ts',
    'src/core/chamber-integration/qiyamah-execution-boundary.ts',
    'src/sovereign-entry/unbuilt-al-watin-placeholder.ts',
  ],
  directoriesRenamed: ['src/orchestrator/al-watin/ -> src/orchestrator/fleet-materialization/'],
  classesRenamed: ['AlWatinRuntime -> FleetMaterializationRuntime'],
  heartAutoStarted: true,
  duplicateHeartbeatPossible: false,
  orchestrationOrIntelligenceIntroduced: false,
  status:
    'INTEGRATION PACKAGE "THE FIRST CONSTITUTIONAL HEARTBEAT" — complete. All validations pass. The Al-Wateen naming collision is fully resolved (renamed, not merged). The Sovereign Body now has a living, beating Heart. Awaiting Constitutional Certification before Construction Phase V (The Constitutional Mind / The Sovereign Core) begins.',
} as const;
