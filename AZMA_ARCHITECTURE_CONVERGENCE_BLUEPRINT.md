# AZMA Architecture Convergence Blueprint

## Constitutional Status

This document defines the canonical convergence blueprint for Phase 27.

It is an architectural planning and governance artifact only.

No runtime implementation is authorized by this document.

## 1. Canonical Runtime Architecture

### 1.1 Authoritative Runtime Spine

The canonical AZMA runtime architecture is:

1. Constitution Runtime (policy authority)
2. Sovereign Gateway (entry and perimeter)
3. Sovereign High Council Runtime (founder command surface)
4. Core Intelligence Plane (Executive, Strategic, Perception, Future Simulation, Sovereign Intelligence Bus)
5. Al-Wateen Core Intelligence (living integration and doctrine layers)
6. DNA Orchestrator Runtime (AI request planning and provider strategy)
7. Sovereign AI Integration (provider-agnostic execution boundary)
8. Chamber Integration Layer (chamber lifecycle and communication)
9. Chambers (domain execution)
10. Shared Memory, Telemetry, and Audit Planes

### 1.2 Canonical Paths

Canonical paths to retain as authoritative:

- src/core/constitution-runtime
- src/gateway/bab-al-wusul
- src/core/sovereign-high-council-runtime
- src/core/executive-intelligence
- src/core/strategic-intelligence
- src/core/sovereign-perception
- src/core/future-simulation
- src/core/sovereign-intelligence-bus
- src/core/al-wateen
- src/core/dna-orchestrator-runtime
- src/core/sovereign-ai-integration
- src/core/chamber-integration
- src/chambers/*

### 1.3 Parallel Paths to Retire or Fold

- src/core/al-wateen-assistant: merge into canonical src/core/al-wateen ownership model.
- src/orchestrator/al-watin: retire as independent orchestration authority and fold required capability into canonical sovereign orchestration and chamber integration boundaries.
- Duplicate execution-boundary patterns in chamber-local layers where equivalent canonical core boundaries already exist: fold into canonical boundary contracts.

## 2. Runtime Ownership Matrix

| Runtime Domain | Canonical Owner |
|---|---|
| DNA Orchestrator | src/core/dna-orchestrator-runtime |
| Sovereign AI Integration | src/core/sovereign-ai-integration |
| Al-Wateen | src/core/al-wateen |
| Sovereign High Council | src/core/sovereign-high-council-runtime |
| Intelligence Layers | src/core/executive-intelligence, src/core/strategic-intelligence, src/core/sovereign-perception, src/core/sovereign-intelligence-bus |
| Future Simulation | src/core/future-simulation |
| Runtime Health | src/core/al-wateen (canonical health authority) |
| Security | Constitution Runtime + Gateway perimeter and access-control domains |
| Identity | Sovereign High Council session/access boundaries + gateway authentication contracts |
| Billing | Chamber/domain billing boundaries, centralized under canonical chamber-integration governance |
| Monitoring | Sovereign Perception + Al-Wateen monitoring plane |
| Memory | Constitution history + intelligence memories + research memory governance artifacts |
| Telemetry | Sovereign Intelligence Bus diagnostics + canonical telemetry engines under core governance |

## 3. Dependency Convergence

### 3.1 Allowed Direction

Allowed dependency direction is top-down governance and outward execution:

1. Constitution Runtime -> all policy-governed domains (read/validate only)
2. Gateway -> High Council and runtime entry surfaces
3. High Council -> Intelligence Plane and approved APIs
4. Intelligence Plane -> DNA Orchestrator and simulation/recommendation APIs
5. DNA Orchestrator -> Sovereign AI Integration public API only
6. Sovereign AI Integration -> provider adapters through contracts only
7. Chamber Integration -> Chamber runtimes through chamber contracts only
8. Chambers -> external execution via canonical boundaries only

### 3.2 Forbidden Direction

1. Lower layers importing founder surface modules.
2. Chambers importing internal private modules from unrelated chambers.
3. AI provider adapters bypassing Sovereign AI Integration constitutional routing.
4. Parallel orchestrators acting as independent policy authorities.

## 4. Runtime Boundary Rules

1. Public API first: cross-domain communication only through declared public contracts.
2. Constitutional gate first: high-impact actions must remain policy-evaluable.
3. No lateral chamber coupling: chamber-to-chamber interaction only through chamber integration contracts.
4. One owner per domain: no shared ownership across parallel modules.
5. No duplicate authority engines per domain.
6. No direct dependency from UI/domain edges into lower-level private internals.

## 5. Integration Standards

1. Every new runtime module must declare owner, boundary, and dependency direction before approval.
2. Every integration must expose stable contract types and versioned compatibility intent.
3. Every high-impact integration must include fallback and failure semantics.
4. Every module must emit diagnosable telemetry and auditable decision traces.
5. No module may bypass constitutional or gateway governance boundaries.

## 6. Migration Strategy (Keep / Merge / Retire)

### Keep

- Canonical core modules listed in section 1.2.

### Merge

- Merge health/monitoring/recovery capabilities from src/core/al-wateen-assistant into canonical src/core/al-wateen governance and ownership.
- Merge reusable execution capabilities from src/orchestrator/al-watin into canonical orchestrator/chamber integration contracts where still valid.

### Retire

- Retire duplicate independent orchestration authority in src/orchestrator/al-watin after merge completion.
- Retire duplicate non-canonical boundary implementations that overlap existing canonical core boundaries.

### Justification

Convergence reduces split-authority risk, improves dependency clarity, strengthens constitutional enforcement, and lowers long-term maintenance cost.

## 7. Readiness Checklist Before Sovereign Research Phase

The Sovereign Research Phase may begin only when all are satisfied:

1. Canonical runtime ownership map is approved and ratified.
2. Parallel orchestration authorities are converged to one canonical authority model.
3. Dependency direction policy is documented and validated for core domains.
4. Boundary rule enforcement policy is approved for new module onboarding.
5. Technology Adoption Constitution governance path is approved and active.
6. Research and evaluation constitutions are approved/frozen and indexed.
7. Convergence migration plan has approved keep/merge/retire statuses for duplicate paths.
8. Telemetry/memory accountability requirements are ratified for governance traceability.
9. No unresolved constitutional conflicts exist between runtime governance artifacts.

## Final Statement

This blueprint defines the single authoritative convergence direction for AZMA OS runtime architecture and blocks further architectural drift until convergence readiness is achieved.
