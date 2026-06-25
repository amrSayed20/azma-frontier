# AZMA QIYAMAH ARCHITECTURAL RECOVERY PLAN

## Scope

- Audited module: src/chambers/qiyamah
- Mode: analysis only
- Repository modifications to existing implementation: none

## File-Level Recovery Matrix

| File name | Current responsibility | Actual behavior | Correct responsibility | Correct destination | Migration priority | Risk level | Dependencies | Migration notes |
|---|---|---|---|---|---|---|---|---|
| src/chambers/qiyamah/agent-event-log.ts | Agent event log storage | Stores and retrieves agent lifecycle events and severity | Platform-level runtime observability | src/core/al-wateen | Medium | Medium | none | Move after health/failover migration so event contracts remain consistent |
| src/chambers/qiyamah/agent-failover-manager.ts | Agent failover management | Evaluates health reports and selects replacement agent names | Centralized self-healing/failover | src/core/al-wateen | High | High | ./agent-health-monitor | Migrate with health monitor as one unit to avoid split failover logic |
| src/chambers/qiyamah/agent-health-monitor.ts | Agent health checks | Creates agent health reports and statuses | Centralized health monitoring | src/core/al-wateen | High | High | none | Move before failover manager consumption is rewired |
| src/chambers/qiyamah/agent-registry.ts | Qiyamah agent catalog | Creates static registry of Qiyamah-specific creative agents | Chamber-internal capability catalog | Qiyamah | Low | Low | imports all local agents | Keep in Qiyamah; later expose outward only through Chamber Integration metadata |
| src/chambers/qiyamah/billing-agent.ts | Execution billing logic | Builds bill and approval based on cost breakdown | Cost/governance and budget policy | src/chambers/makman-al-ghayah | High | Medium | ./cost-agent | Move with cost-agent and adapt orchestration contracts after migration |
| src/chambers/qiyamah/bridge/payload-transformer.ts | Payload transformation bridge | Maps planner/context payloads to chamber export payload | Cross-module communication adaptation | src/core/chamber-integration | High | Medium | ../../../shared/contracts/bridge.types | Move with controller boundary interfaces to avoid dual bridge logic |
| src/chambers/qiyamah/canvas-agent.ts | Creative asset preparation | Builds canvas asset metadata for generation input | Creative generation domain logic | Qiyamah | Low | Low | none | Keep; this is chamber specialization |
| src/chambers/qiyamah/character-agent.ts | Character profile shaping | Produces sovereign character model for output generation | Creative generation domain logic | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/cost-agent.ts | Cost estimation | Calculates duration/style/voice cost components and total | Monetization and cost policy domain | src/chambers/makman-al-ghayah | High | Medium | ./style-agent, ./voice-agent | Move in same wave as billing-agent |
| src/chambers/qiyamah/duration-agent.ts | Duration normalization | Applies min/max duration limits and normalization | Creative generation constraints | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/genesis-orchestrator.ts | In-chamber orchestration | Coordinates all Qiyamah agents into a generation pipeline | Platform orchestration coordinator | src/core/sovereign-orchestrator | High | High | imports 15 local agents | Split by extracting orchestration flow, keeping pure creative agents in Qiyamah |
| src/chambers/qiyamah/genesis-runtime.ts | Runtime session status model | Tracks runtime status and completion/failure timing | Cross-request runtime tracking | src/core/sovereign-orchestrator | Medium | Medium | none | Move with session artifacts to avoid state fragmentation |
| src/chambers/qiyamah/genesis-session.ts | Session entity model | Holds mutable session progress/current agent/status | Orchestration session contract | src/core/sovereign-orchestrator | Medium | Medium | none | Migrate before session-manager/store rewiring |
| src/chambers/qiyamah/genesis-session-manager.ts | Session orchestration manager | Creates and manages sessions via session store/factory | Orchestration session coordination | src/core/sovereign-orchestrator | Medium | Medium | ./genesis-session, ./genesis-session-store | Migrate with genesis-session-store in same wave |
| src/chambers/qiyamah/genesis-session-store.ts | Session persistence | In-memory session map operations | Orchestration session persistence | src/core/sovereign-orchestrator | Medium | Low | ./genesis-session | Move together with session manager |
| src/chambers/qiyamah/import-agent.ts | Input ingestion | Builds imported asset records from source chamber content | Creative generation intake | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/index.ts | Chamber export surface | Re-exports state/controller/orchestrator and bridge artifacts | Chamber public API only | Qiyamah | Medium | Medium | store, controller, orchestrator exports | Update only after all migrated symbols are relocated |
| src/chambers/qiyamah/master-agent.ts | Master output packaging | Produces sealed artifact metadata | Creative generation domain logic | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/orbit-agent.ts | Destination routing hints | Maps output to destination route categories | Release/publishing routing policy | src/chambers/ras-al-amr | Medium | Medium | none | Move after Ras Al-Amr boundary alignment |
| src/chambers/qiyamah/progress-agent.ts | Progress tracking | Normalizes percentage and progress state updates | Runtime monitoring/telemetry | src/core/al-wateen | Medium | Medium | none | Move after Al-Wateen telemetry/monitoring contracts are consumed |
| src/chambers/qiyamah/prompt-agent.ts | Prompt enrichment | Produces enriched prompt from base prompt and context | Creative generation domain logic | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/qiyamah-controller.ts | Chamber orchestration facade | Converts planner context + state into export payload and updates state | Chamber API facade with bridge coupling | Qiyamah (facade) + bridge parts to Chamber Integration | High | High | ../../shared/contracts/bridge.types, ./bridge/payload-transformer, ./store/qiyamah-state | Keep controller intent in Qiyamah; migrate payload transformation/bridge contract handling outward |
| src/chambers/qiyamah/qiyamah-execution-boundary.ts | External execution boundary | Converts raw intent payload to fleet dispatch shape and references orchestrator ledger types | Chamber integration boundary, not chamber business logic | src/core/chamber-integration | High | High | ./qiyamah-intent-types, ../../orchestrator/al-watin/fleet/fleet-dispatcher, ../../orchestrator/al-watin/ledger/operation-ledger-types | Highest boundary-risk file; migrate early to enforce no direct cross-layer coupling |
| src/chambers/qiyamah/qiyamah-intent-types.ts | Intent contracts | Defines polymorphic capability-target intents for dispatch | Orchestration contracts | src/core/sovereign-orchestrator | High | Medium | none | Move alongside execution-boundary contract updates |
| src/chambers/qiyamah/quality-agent.ts | Output quality scoring | Calculates normalized quality score and level/approval | Quality governance and platform QA policy | src/core/al-wateen | Medium | Medium | none | Move after Al-Wateen quality monitoring interfaces are stable |
| src/chambers/qiyamah/render-agent.ts | Render execution session | Tracks render status and lifecycle | Creative rendering execution | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/script-agent.ts | Script generation | Produces script content with language + length controls | Creative generation domain logic | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/store/qiyamah-state.ts | Chamber draft state | Maintains draft/status/listeners and planner contract data | Chamber-internal state store | Qiyamah | Low | Low | ../../../shared/contracts/bridge.types | Keep; expose read-only metadata through Chamber Integration |
| src/chambers/qiyamah/style-agent.ts | Style selection | Maps style tokens to generation style and premium flag | Creative generation domain logic | Qiyamah | Low | Low | none | Keep |
| src/chambers/qiyamah/voice-agent.ts | Voice selection | Maps voice type and metadata into sovereign voice profile | Creative generation domain logic | Qiyamah | Low | Low | none | Keep |

## Duplicate Responsibilities

- Health/failover duplication: qiyamah agent health/failover overlaps with Al-Wateen health and recovery roles.
- Orchestration duplication: genesis-orchestrator overlaps with Sovereign Orchestrator responsibilities.
- Communication boundary duplication: qiyamah-execution-boundary and bridge/payload-transformer overlap with Chamber Integration duties.
- Cost/billing duplication: qiyamah cost and billing overlap with Makman Al-Ghayah monetization/cost governance duties.
- Progress/quality duplication: qiyamah progress and quality agents overlap with Al-Wateen monitoring and quality governance concerns.

## Architectural Violations

- Direct cross-layer coupling from chamber boundary to orchestrator fleet and ledger types in qiyamah-execution-boundary.
- Chamber-level orchestration engine (genesis-orchestrator) carrying platform orchestration concerns.
- Chamber bridge adaptation logic in qiyamah/bridge that belongs to Chamber Integration.
- Runtime health/failover logic embedded in chamber instead of platform supervisor layer.

## Circular Responsibility Risks

- Qiyamah runtime orchestration + Sovereign Orchestrator can create bidirectional orchestration ownership.
- Qiyamah boundary importing orchestrator contracts while orchestrator depends on chamber capabilities increases ownership loop risk.
- Cost and billing in Qiyamah while Makman owns financial governance creates policy loop risk.

## Files Already Correctly Placed

- src/chambers/qiyamah/agent-registry.ts
- src/chambers/qiyamah/canvas-agent.ts
- src/chambers/qiyamah/character-agent.ts
- src/chambers/qiyamah/duration-agent.ts
- src/chambers/qiyamah/import-agent.ts
- src/chambers/qiyamah/master-agent.ts
- src/chambers/qiyamah/prompt-agent.ts
- src/chambers/qiyamah/render-agent.ts
- src/chambers/qiyamah/script-agent.ts
- src/chambers/qiyamah/store/qiyamah-state.ts
- src/chambers/qiyamah/style-agent.ts
- src/chambers/qiyamah/voice-agent.ts

## Files Requiring Migration

- To Al-Wateen: agent-event-log.ts, agent-failover-manager.ts, agent-health-monitor.ts, progress-agent.ts, quality-agent.ts
- To Chamber Integration: bridge/payload-transformer.ts, qiyamah-execution-boundary.ts
- To Sovereign Orchestrator: genesis-orchestrator.ts, genesis-runtime.ts, genesis-session.ts, genesis-session-manager.ts, genesis-session-store.ts, qiyamah-intent-types.ts
- To Makman Al-Ghayah: cost-agent.ts, billing-agent.ts
- To Ras Al-Amr: orbit-agent.ts
- Partial split: qiyamah-controller.ts (keep chamber facade, move bridge adaptation concern)

## Recommended Migration Waves

### Wave 1 (Boundary Hardening)

- qiyamah-execution-boundary.ts -> Chamber Integration
- bridge/payload-transformer.ts -> Chamber Integration
- qiyamah-intent-types.ts -> Sovereign Orchestrator
- qiyamah-controller.ts (extract bridge concern only)

Rationale: removes immediate cross-layer violations and enforces chamber communication through the integration layer.

### Wave 2 (Platform Runtime Ownership)

- agent-health-monitor.ts -> Al-Wateen
- agent-failover-manager.ts -> Al-Wateen
- agent-event-log.ts -> Al-Wateen
- progress-agent.ts -> Al-Wateen
- quality-agent.ts -> Al-Wateen

Rationale: consolidates platform supervision and recovery responsibilities under Al-Wateen.

### Wave 3 (Orchestration Recovery)

- genesis-orchestrator.ts -> Sovereign Orchestrator
- genesis-runtime.ts -> Sovereign Orchestrator
- genesis-session.ts -> Sovereign Orchestrator
- genesis-session-manager.ts -> Sovereign Orchestrator
- genesis-session-store.ts -> Sovereign Orchestrator

Rationale: centralizes operational orchestration brain and removes duplicate orchestrator behavior from chamber scope.

### Wave 4 (Economic and Publishing Ownership)

- cost-agent.ts -> Makman Al-Ghayah
- billing-agent.ts -> Makman Al-Ghayah
- orbit-agent.ts -> Ras Al-Amr

Rationale: aligns financial policy and release-routing ownership with designated chambers.

### Wave 5 (Stabilization)

- Update src/chambers/qiyamah/index.ts export surface after migrated symbols are removed from chamber runtime.
- Confirm remaining Qiyamah files are purely creative-domain implementation and reachable only via Chamber Integration metadata.

Rationale: clean finalization without behavior rewrites.

## Safe Migration Order (Dependency-Aware)

1. Contracts and boundary adapters (intent types, payload transformer, execution boundary).
2. Health/failover/event supervision migration to Al-Wateen.
3. Orchestration session/runtime migration to Sovereign Orchestrator.
4. Cost/billing and orbit routing ownership migration.
5. Chamber export cleanup and post-migration dependency verification.

## Risk Summary

- High risk migrations: qiyamah-execution-boundary.ts, genesis-orchestrator.ts, qiyamah-controller.ts concern split.
- Medium risk migrations: health/failover/progress/quality cluster, cost/billing cluster, orbit-agent.
- Low risk migrations: none in migration set; low-risk files remain in Qiyamah and require no movement.
