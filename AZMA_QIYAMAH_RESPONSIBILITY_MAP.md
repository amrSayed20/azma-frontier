# AZMA QIYAMAH RESPONSIBILITY MAP

## Responsibility Matrix

| Responsibility Name | Current File | Current Chamber | Correct Architectural Owner | Why That Owner | Runtime Layer | Communication Layer | Dependencies | Migration Difficulty | Risk |
|---|---|---|---|---|---|---|---|---|---|
| Health Monitoring Compatibility Re-Export | src/chambers/qiyamah/agent-health-monitor.ts | Qiyamah | Al-Wateen | Health supervision is a core platform reliability concern already implemented in core. | Core Runtime (transitional shim exposure) | Chamber export surface -> Core | ../../core/al-wateen/agent-health-monitor | Low | Low |
| Failover Management Compatibility Re-Export | src/chambers/qiyamah/agent-failover-manager.ts | Qiyamah | Al-Wateen | Failover and recovery ownership belongs to platform runtime governance. | Core Runtime (transitional shim exposure) | Chamber export surface -> Core | ../../core/al-wateen/agent-failover-manager | Low | Low |
| Event Logging Compatibility Re-Export | src/chambers/qiyamah/agent-event-log.ts | Qiyamah | Al-Wateen | Operational event logging is platform observability responsibility. | Core Runtime (transitional shim exposure) | Chamber export surface -> Core | ../../core/al-wateen/agent-event-log | Low | Low |
| Progress Tracking Compatibility Re-Export | src/chambers/qiyamah/progress-agent.ts | Qiyamah | Al-Wateen | Progress telemetry is part of runtime monitoring governance. | Core Runtime (transitional shim exposure) | Chamber export surface -> Core | ../../core/al-wateen/progress-agent | Low | Low |
| Quality Scoring Compatibility Re-Export | src/chambers/qiyamah/quality-agent.ts | Qiyamah | Al-Wateen | Quality gate policy belongs to platform-level operational governance. | Core Runtime (transitional shim exposure) | Chamber export surface -> Core | ../../core/al-wateen/quality-agent | Low | Low |
| Payload Transformation Compatibility Re-Export | src/chambers/qiyamah/bridge/payload-transformer.ts | Qiyamah | Chamber Integration | Cross-boundary payload adaptation is core integration ownership. | Core Integration Runtime (transitional shim exposure) | Chamber export surface -> Core Integration | ../../../core/chamber-integration/bridge/payload-transformer | Low | Low |
| Execution Boundary Compatibility Re-Export | src/chambers/qiyamah/qiyamah-execution-boundary.ts | Qiyamah | Chamber Integration | Execution boundary contracts must live in Core integration layer. | Core Integration Runtime (transitional shim exposure) | Chamber export surface -> Core Integration | ../../core/chamber-integration/qiyamah-execution-boundary | Low | Low |
| Intent Contract Compatibility Re-Export | src/chambers/qiyamah/qiyamah-intent-types.ts | Qiyamah | Sovereign Orchestrator | Capability intent contracts are orchestration contract ownership. | Core Orchestration Runtime (transitional shim exposure) | Chamber export surface -> Core Orchestrator | ../../core/sovereign-orchestrator/qiyamah-intent-types | Low | Low |
| Agent Composition Registry | src/chambers/qiyamah/agent-registry.ts | Qiyamah | Qiyamah | Chamber-local composition of creative agents belongs to chamber runtime, but currently includes leaked owners. | Application Runtime | Intra-chamber composition | ./canvas-agent, ./import-agent, ./script-agent, ./prompt-agent, ./character-agent, ./voice-agent, ./style-agent, ./duration-agent, ./cost-agent, ./billing-agent, ./render-agent, ./progress-agent, ./quality-agent, ./master-agent, ./orbit-agent | Medium | Medium |
| Canvas Asset Materialization | src/chambers/qiyamah/canvas-agent.ts | Qiyamah | Qiyamah | Asset shape generation is domain-specific creative logic. | Application Runtime | Intra-chamber | none | Low | Low |
| Character Definition Management | src/chambers/qiyamah/character-agent.ts | Qiyamah | Qiyamah | Character identity/description behavior is chamber content logic. | Application Runtime | Intra-chamber | none | Low | Low |
| Duration Policy and Normalization | src/chambers/qiyamah/duration-agent.ts | Qiyamah | Qiyamah | Duration guardrails for generation are chamber-level creative constraints. | Application Runtime | Intra-chamber | none | Low | Low |
| Prompt Construction and Enrichment | src/chambers/qiyamah/prompt-agent.ts | Qiyamah | Qiyamah | Prompt composition is chamber content preparation logic. | Application Runtime | Intra-chamber | none | Low | Low |
| Script Generation and Validation | src/chambers/qiyamah/script-agent.ts | Qiyamah | Qiyamah | Script drafting and validation are direct creative operations. | Application Runtime | Intra-chamber | none | Low | Low |
| Style Profile Selection | src/chambers/qiyamah/style-agent.ts | Qiyamah | Qiyamah | Style interpretation is chamber-level generation preference logic. | Application Runtime | Intra-chamber | none | Low | Low |
| Voice Profile Selection | src/chambers/qiyamah/voice-agent.ts | Qiyamah | Qiyamah | Voice profile logic is chamber-level generation selection logic. | Application Runtime | Intra-chamber | none | Low | Low |
| Render Session Lifecycle Tracking | src/chambers/qiyamah/render-agent.ts | Qiyamah | Qiyamah | Render session state transitions are still tied to chamber execution path. | Application Runtime | Intra-chamber | none | Medium | Medium |
| Imported Asset Intake | src/chambers/qiyamah/import-agent.ts | Qiyamah | Qiyamah | Source chamber and vault intake normalization is chamber preprocessing logic. | Application Runtime | Intra-chamber with upstream data ingest | none | Low | Low |
| Master Artifact Packaging and Seal State | src/chambers/qiyamah/master-agent.ts | Qiyamah | Qiyamah | Packaging of final chamber artifact is chamber output responsibility. | Application Runtime | Intra-chamber | none | Low | Low |
| Production Cost Accounting | src/chambers/qiyamah/cost-agent.ts | Qiyamah | Makman Al-Ghayah | Financial cost policy is economic/governance chamber ownership, not creative chamber ownership. | Application Runtime (misplaced) | Intra-chamber currently; should be cross-chamber via Core | ./style-agent, ./voice-agent | Medium | Medium |
| Billing Authorization and Balance Validation | src/chambers/qiyamah/billing-agent.ts | Qiyamah | Makman Al-Ghayah | Billing approval and remaining-balance semantics are economic governance ownership. | Application Runtime (misplaced) | Intra-chamber currently; should be cross-chamber via Core | ./cost-agent | Medium | Medium |
| Publishing Route Decision | src/chambers/qiyamah/orbit-agent.ts | Qiyamah | Ras Al-Amr | Release destination routing belongs to publishing/release governance chamber. | Application Runtime (misplaced) | Intra-chamber currently; should be cross-chamber via Core | none | Medium | Medium |
| Session Entity Mutation | src/chambers/qiyamah/genesis-session.ts | Qiyamah | Sovereign Orchestrator | Session identity/progress/status mutation is orchestration state ownership. | Core Orchestration Runtime (misplaced) | Intra-chamber currently | none | Medium | Medium |
| Session Persistence Store | src/chambers/qiyamah/genesis-session-store.ts | Qiyamah | Sovereign Orchestrator | Session persistence is orchestration runtime infrastructure ownership. | Core Orchestration Runtime (misplaced) | Intra-chamber currently | ./genesis-session | Medium | Medium |
| Session Coordination Service | src/chambers/qiyamah/genesis-session-manager.ts | Qiyamah | Sovereign Orchestrator | Session create/update/remove orchestration is coordinator ownership. | Core Orchestration Runtime (misplaced) | Intra-chamber currently | ./genesis-session, ./genesis-session-store | Medium | Medium |
| Runtime State Lifecycle (start/pause/fail/complete) | src/chambers/qiyamah/genesis-runtime.ts | Qiyamah | Sovereign Orchestrator | Runtime lifecycle transitions are orchestration runtime ownership. | Core Orchestration Runtime (misplaced) | Intra-chamber currently | none | Medium | Medium |
| Chamber-Local Agent Orchestration Composition | src/chambers/qiyamah/genesis-orchestrator.ts | Qiyamah | Sovereign Orchestrator | Multi-agent orchestration composition belongs to central orchestrator ownership, but implementation is coupled with chamber capabilities. | Core Orchestration Runtime (misplaced) | Intra-chamber currently | ./canvas-agent, ./import-agent, ./script-agent, ./prompt-agent, ./character-agent, ./voice-agent, ./style-agent, ./duration-agent, ./cost-agent, ./billing-agent, ./render-agent, ./progress-agent, ./quality-agent, ./master-agent, ./orbit-agent | High | High |
| Chamber Intake and Planning Control | src/chambers/qiyamah/qiyamah-controller.ts | Qiyamah | Qiyamah | Chamber-level control of idea/prompt/state and planner invocation remains chamber facade responsibility. | Application Runtime | Chamber -> Core Integration (payload transform) + local state | ../../shared/contracts/bridge.types, ../../core/chamber-integration/bridge/payload-transformer, ./store/qiyamah-state | Medium | Medium |
| Chamber Draft State Storage and Subscription | src/chambers/qiyamah/store/qiyamah-state.ts | Qiyamah | Qiyamah | Draft, planner output, and local observer state are chamber state ownership. | Application Runtime | Intra-chamber state notifications | ../../../shared/contracts/bridge.types | Low | Low |
| Chamber Public API Aggregation and Singletons | src/chambers/qiyamah/index.ts | Qiyamah | Qiyamah (with transitional mixed exposure) | Chamber API exposure belongs to chamber, but currently re-exports mixed-owner responsibilities. | Application Runtime | Public export surface | ./store/qiyamah-state, ./bridge/payload-transformer, ./qiyamah-controller, ./qiyamah-execution-boundary, ./canvas-agent, ./import-agent, ./script-agent, ./prompt-agent, ./character-agent, ./voice-agent, ./style-agent, ./duration-agent, ./cost-agent, ./billing-agent, ./render-agent, ./progress-agent, ./quality-agent, ./master-agent, ./orbit-agent, ./genesis-orchestrator | Medium | Medium |

## Responsibilities Already Correct

- Canvas asset materialization
- Character definition management
- Duration policy and normalization
- Prompt construction and enrichment
- Script generation and validation
- Style profile selection
- Voice profile selection
- Imported asset intake
- Master artifact packaging and seal state
- Chamber intake and planning control
- Chamber draft state storage and subscription

## Responsibilities Duplicated

- Session lifecycle/state appears in both src/chambers/qiyamah/genesis-runtime.ts and src/chambers/qiyamah/genesis-session.ts.
- Session management naming overlaps between src/chambers/qiyamah/genesis-session.ts (class GenesisSessionManager) and src/chambers/qiyamah/genesis-session-manager.ts.
- Orchestration composition appears in both src/chambers/qiyamah/agent-registry.ts and src/chambers/qiyamah/genesis-orchestrator.ts.
- Transitional core re-export responsibilities are duplicated between chamber shim files and their core owner implementations.

## Responsibilities Misplaced

- Production cost accounting (currently Qiyamah, correct owner Makman Al-Ghayah)
- Billing authorization and balance validation (currently Qiyamah, correct owner Makman Al-Ghayah)
- Publishing route decision (currently Qiyamah, correct owner Ras Al-Amr)
- Session entity mutation (currently Qiyamah, correct owner Sovereign Orchestrator)
- Session persistence store (currently Qiyamah, correct owner Sovereign Orchestrator)
- Session coordination service (currently Qiyamah, correct owner Sovereign Orchestrator)
- Runtime state lifecycle (currently Qiyamah, correct owner Sovereign Orchestrator)
- Chamber-local agent orchestration composition (currently Qiyamah, correct owner Sovereign Orchestrator)

## Responsibilities Requiring Split

- src/chambers/qiyamah/genesis-orchestrator.ts: orchestration ownership and chamber capability wiring are co-located; orchestration control and chamber capability execution concerns must be separated.
- src/chambers/qiyamah/agent-registry.ts: registry currently aggregates chamber-owned and non-chamber-owned responsibilities via shims/misplaced agents.
- src/chambers/qiyamah/index.ts: public API aggregation mixes chamber responsibilities with transitional core-owned compatibility exports.

## Responsibilities Requiring Merge

- Session lifecycle responsibilities in src/chambers/qiyamah/genesis-runtime.ts and src/chambers/qiyamah/genesis-session.ts can be unified under one orchestrator-owned session lifecycle model.
- Session coordination and persistence responsibilities in src/chambers/qiyamah/genesis-session-manager.ts and src/chambers/qiyamah/genesis-session-store.ts can be merged into a coherent orchestrator-owned session service boundary.

## Responsibilities Requiring Redesign

- Orchestration responsibility boundary for src/chambers/qiyamah/genesis-orchestrator.ts requires redesign at ownership level to remove mixed ownership coupling while preserving runtime behavior.
- Chamber export policy in src/chambers/qiyamah/index.ts requires redesign to avoid long-term mixed-owner exposure through one chamber namespace.
- Session model naming and boundary semantics across src/chambers/qiyamah/genesis-session.ts and src/chambers/qiyamah/genesis-session-manager.ts require redesign for one clear ownership vocabulary.
