# AZMA Founder Experience Blueprint

## Mission
Connect the existing Sovereign High Council interface to the completed runtime architecture without redesigning UI, CSS, or visual identity.

This blueprint is planning-only.
No page implementation, component creation, runtime invention, or styling changes are performed in this phase.

## Constraints (Imperial Order)
- Reuse existing runtime modules only.
- Use clean integration boundaries and public runtime APIs.
- Do not introduce new core runtime modules.
- Do not redesign visuals.
- Do not create React/CSS artifacts in this phase.

## 1) Existing Sovereign High Council Page Audit

### Current UI Structure
Current route and layout:
- `app/sovereign-high-council/page.tsx`
- `app/sovereign-high-council/layout.tsx`
- `app/sovereign-high-council/council.css`

Current page behavior:
- Uses client-side authorization fetch: `/api/sovereign/auth`.
- Maintains local UI states only:
  - `isAuthorized`
  - `loading`
  - `selectedHall`
  - `systemStatus` (hardcoded local state)
- Presents 14 command halls with static labels/icons.
- Hall detail view is placeholder content: "Command Hall Details - Coming Soon".

### Audit Findings
- Runtime architecture is not currently connected to page data.
- No runtime snapshots, diagnostics, briefings, or doctrine outputs are surfaced.
- The page calls `/api/sovereign/auth`, but no matching `app/api/sovereign/**` route currently exists in workspace.
- Visual identity is already established and must be preserved.

## 2) Runtime Capability Map (Established Systems)

### Constitution Runtime
Public runtime class: `ConstitutionRuntime`
Primary capabilities:
- `loadConstitution()`
- `evaluate(action)`
- `publishState()`
- `getState()`
- `getEvents()`
Use in founder interface:
- Constitutional state and evaluation basis for all command actions.

### Executive Intelligence
Public runtime class: `ExecutiveIntelligenceRuntime`
Primary capabilities:
- `evaluateAndProcess(action)`
- `processDecision(action, evaluation)`
- `getLatestDecisionPackage()`
- `getSnapshot()`
Use in founder interface:
- Executive action package, risk and recommendation context.

### Strategic Intelligence
Public runtime class: `StrategicIntelligenceRuntime`
Primary capabilities:
- `generatePackage()`
- `getLatestPackage()`
- `getSnapshot()`
Use in founder interface:
- Strategic outlook, readiness, and opportunity/threat context.

### Future Simulation
Public runtime class: `FutureSimulationRuntime`
Primary capabilities:
- `simulateFromCurrentState(simulationId, pathCount)`
- `simulateAction(action, simulationId, pathCount)`
- `getLatestPackage()`
- `getSnapshot()`
Use in founder interface:
- Scenario ranking, path recommendation, risk/opportunity summaries.

### Sovereign Intelligence Bus
Public runtime API: `SovereignIntelligenceBusApi`
Primary capabilities:
- `synchronize()`
- `diagnostics()`
- `snapshot()`
- `recentPublished(limit)`
- `recentRouted(limit)`
Use in founder interface:
- Runtime synchronization health, message routing telemetry, diagnostics feed.

### Sovereign Perception
Public runtime class: `SovereignPerceptionRuntime`
Primary capabilities:
- `perceive()`
- `latest()`
- `snapshot()`
Use in founder interface:
- Observation layer for runtime/infrastructure/resource/security/founder activity signals.

### Al-Wateen Living Intelligence
Public runtime class: `AlWateenIntegrationRuntime`
Primary capabilities:
- `integrate(trigger)`
- `integrateWithAction(actionContext, trigger)`
- `latest()`
- `snapshot()`
- `diagnostics()`
Use in founder interface:
- Unified Constitutional Intelligence Package and founder/executive/strategic briefings.

### Al-Wateen Personality
Public runtime class: `PersonalityRuntime`
Primary capabilities:
- `engage(sessionId, founderId, constitutionalPackage)`
- `latest()`
- `snapshot()`
Use in founder interface:
- Founder-facing communication style and response composition package.

### Imperial Decision Doctrine
Public runtime class: `DoctrineRuntime`
Primary capabilities:
- `evaluate(founderIntent, constitutionalPackage, candidatePaths)`
- `latest()`
- `snapshot()`
Use in founder interface:
- Decision ranking, justification chain, transparent tradeoff reasoning.

### Sovereign High Council Runtime
Public runtime class: `CouncilRuntime`
Bootstrap function: `createCouncilRuntime(...)`
Primary capabilities:
- `synchronizeFounderSession(input)`
- `latestSynchronization()`
- `snapshot()`
Use in founder interface:
- Session orchestration that fuses unified package + briefings + future recommendation + doctrine outcome.

## 3) Runtime Data Sources for the Page

The Sovereign High Council page should consume read models derived from existing runtime outputs only.

### Primary Data Sources
- Founder session synchronization result:
  - Source: `CouncilRuntime.synchronizeFounderSession(...)`
  - Payload: unified package, briefing bundle, future recommendation, doctrine package, candidate paths, immutable marker.

- Runtime global snapshot:
  - Source: `CouncilRuntime.snapshot()`
  - Payload: council runtime state and Al-Wateen snapshot.

### Secondary Data Sources (Per Hall and Diagnostics)
- Constitution baseline:
  - `ConstitutionRuntime.getState()` / `publishState()` / `getEvents()`
- Executive package/snapshot:
  - `ExecutiveIntelligenceRuntime.getLatestDecisionPackage()` / `getSnapshot()`
- Strategic package/snapshot:
  - `StrategicIntelligenceRuntime.getLatestPackage()` / `getSnapshot()`
- Future simulation package/snapshot:
  - `FutureSimulationRuntime.getLatestPackage()` / `getSnapshot()`
- Bus diagnostics and transport telemetry:
  - `SovereignIntelligenceBusApi.diagnostics()` / `snapshot()` / `recentPublished()` / `recentRouted()`
- Perception package/snapshot:
  - `SovereignPerceptionRuntime.latest()` / `snapshot()`
- Al-Wateen diagnostics:
  - `AlWateenIntegrationRuntime.diagnostics()`
- Personality and doctrine latest/snapshot for command narratives and doctrine trace:
  - `PersonalityRuntime.latest()` / `snapshot()`
  - `DoctrineRuntime.latest()` / `snapshot()`

## 4) Runtime State Flow Blueprint

### A) Session Initialization Flow
1. Founder enters Sovereign High Council route.
2. Authorization boundary resolves founder identity and clearance.
3. Runtime composition boundary resolves runtime graph (existing modules only).
4. Council runtime session sync is triggered with `CouncilRuntimeInput`.
5. UI receives a normalized view model derived from returned synchronization result.

### B) Continuous Runtime Refresh Flow
1. Trigger bus synchronization via `SovereignIntelligenceBusApi.synchronize()`.
2. Trigger perception refresh via `SovereignPerceptionRuntime.perceive()`.
3. Trigger Al-Wateen integration (manual or event-driven trigger).
4. Re-run `CouncilRuntime.synchronizeFounderSession(...)` for updated founder package.
5. Update page-level runtime state model and hall-specific panels.

### C) Hall Selection Flow
1. Founder selects hall card.
2. Integration layer maps `hallId` to one or more runtime selectors.
3. Selectors read latest runtime snapshots/packages.
4. Detail panel renders runtime-backed content for selected hall.
5. No visual structure change; only data source changes.

## 5) Interaction Flow Blueprint

### Interaction: Initial Load
- Existing: loading spinner -> auth check -> page render.
- Blueprint integration:
  - Keep visual loading behavior.
  - Replace static `systemStatus` derivation with runtime-derived health synthesis from:
    - bus diagnostics
    - council snapshot
    - al-wateen diagnostics

### Interaction: Hall Card Click
- Existing: set local `selectedHall`.
- Blueprint integration:
  - Keep selection behavior.
  - Populate detail area from runtime-mapped data by hall responsibility mapping (Section 7).

### Interaction: Founder Command Actions
- Founder intent entry/action signal routes through existing runtime APIs:
  - Constitution evaluation (where action context exists)
  - Al-Wateen integration (with action trigger)
  - Future simulation package reuse or refresh
  - Doctrine evaluation through council synchronization chain
- Surface outputs as:
  - recommended path
  - justification
  - constitutional implications
  - advisory urgency

## 6) Founder Workflow Blueprint (Operational)

1. Authenticate founder and establish session context.
2. Load latest council synchronization snapshot.
3. Review top-level governance health and advisory urgency.
4. Open Founder Command hall for doctrine-backed decision package.
5. Inspect recommended path and justification transparency.
6. Validate impacts through strategic + future simulation summaries.
7. Confirm action posture with constitutional and executive briefings.
8. Continue with periodic synchronization refresh cycles.

## 7) Component Responsibility Mapping (Existing Interface)

### Page Container: `SovereignHighCouncilPage`
Responsibilities after integration:
- Keep route-level rendering and view switching.
- Own runtime view model state only (not runtime business logic).
- Call integration boundary to fetch/update runtime-backed read models.

### Auth Segment (Existing fetch block)
Responsibilities after integration:
- Keep founder access guard.
- Move to validated endpoint contract used by page runtime loader.
- If unauthorized, continue using existing unauthorized view.

### Status Indicator
Responsibilities after integration:
- Read computed health from runtime diagnostics model.
- Avoid local hardcoded status except as fallback during transient loading.

### Command Hall Grid (`CommandHallCard`)
Responsibilities after integration:
- Keep current visuals and click mechanics.
- Receive badge/summary values from runtime view model per hall.

### Hall Detail (`CommandHallDetail`)
Responsibilities after integration:
- Replace "Coming Soon" with runtime-backed hall content model.
- No design restructure; only dynamic payload injection.

### Unauthorized View
Responsibilities after integration:
- Remains unchanged visually.
- Continue to present access denial path.

## 8) Runtime Integration Points (Clean Boundaries)

### Boundary 1: Runtime Composition Boundary (Server-side)
Purpose:
- Compose existing runtime instances in valid dependency order:
  1. Constitution Runtime
  2. Executive Runtime
  3. Strategic Runtime
  4. Future Simulation Runtime
  5. Sovereign Intelligence Bus API
  6. Sovereign Perception Runtime
  7. Al-Wateen Integration Runtime
  8. Personality Runtime
  9. Doctrine Runtime
  10. Sovereign High Council Runtime (via `createCouncilRuntime`)

Constraint:
- No new core runtime module creation.
- Public APIs only.

### Boundary 2: Founder Runtime Facade (Application Integration Layer)
Purpose:
- Expose page-ready read models and command handlers by orchestrating existing runtime calls.
- Translate runtime packages into hall-level payloads.

Constraint:
- No runtime logic invention.
- No mutation of domain contracts.

### Boundary 3: UI Binding Boundary
Purpose:
- Bind existing React page states/components to facade output.

Constraint:
- No new visual components required for this phase.
- Preserve current layout and styling.

## 9) Hall-to-Runtime Responsibility Matrix

- ch-sovereign-assistant:
  - Primary: Al-Wateen unified package + personality latest
  - Secondary: bus diagnostics

- ch-empire-pulse:
  - Primary: council snapshot + bus diagnostics/snapshot
  - Secondary: perception snapshot

- ch-architectural-health:
  - Primary: constitution state/events + bus boundary diagnostics
  - Secondary: council runtime state

- ch-infrastructure-health:
  - Primary: perception package (infrastructure observer)
  - Secondary: bus snapshot

- ch-resource-intelligence:
  - Primary: perception package (resource observer)
  - Secondary: future snapshot trend perspective

- ch-financial-intelligence:
  - Primary: strategic package recommendations/trajectory
  - Secondary: future simulation recommendation summary

- ch-evolution-intelligence:
  - Primary: strategic outlook + future ranked paths
  - Secondary: doctrine candidate tradeoffs

- ch-security-intelligence:
  - Primary: perception security observer + bus boundary guard diagnostics
  - Secondary: constitution permission implications

- ch-founder-command:
  - Primary: council synchronization result + doctrine package + briefing bundle
  - Secondary: personality engagement package

- ch-emergency-command:
  - Primary: bus diagnostics critical flags + constitution priority/evaluation context
  - Secondary: executive latest package

- ch-development-observatory:
  - Primary: bus recent published/routed + perception runtime observer signals
  - Secondary: strategic trend summaries

- ch-broadcast-center:
  - Primary: bus routed messages and synchronization cycle state
  - Secondary: al-wateen recommendations/briefings

- ch-gift-distribution:
  - Primary: strategic recommendations and executive package prioritization data
  - Secondary: doctrine-ranked path impact rationale

- ch-future-laboratory:
  - Primary: future simulation latest package and ranked futures
  - Secondary: doctrine recommendation alignment

## 10) Integration Risks and Controls

### Risk 1: Missing Auth Route Contract
- Observation: `/api/sovereign/auth` is called by page but no app route exists under `app/api/sovereign/**`.
- Control:
  - Define and implement endpoint contract in implementation phase before runtime binding.

### Risk 2: Client-side Runtime Leakage
- Observation: page is a client component.
- Control:
  - Keep runtime composition/orchestration server-side.
  - Expose sanitized read models to client via application boundary.

### Risk 3: Runtime Coupling Drift
- Control:
  - Import via public barrels only.
  - Keep hall selectors in integration layer, not in UI.

### Risk 4: Visual Regression
- Control:
  - No CSS or structural redesign.
  - Data-only insertion into existing component structure.

## 11) Implementation Readiness Checklist (For Next Approval Phase)
- Authorization endpoint contract finalized.
- Runtime composition boundary finalized using existing modules only.
- Founder runtime facade contract defined (input/output DTOs for page).
- Hall selectors mapped to existing runtime outputs.
- System status derivation rules approved.
- No UI/CSS redesign scope retained.

## Final Statement
This blueprint completes the Founder Experience Era Phase 1 planning objective:
- Existing Sovereign High Council interface audited.
- Completed runtime capabilities mapped.
- Runtime data/state/interaction/founder workflow defined.
- Integration points and component responsibilities established.
- No runtime invention and no visual redesign introduced.
