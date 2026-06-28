# WP-007: Runtime Reusability Matrix

## Runtime-First Architecture

This document describes how WP-007 (Runtime Admission Controller) is decomposed into canonical, reusable components that power AZMA OS without external dependencies.

---

## 1. CANONICAL RUNTIME ENGINE

**Component:** `RuntimeAdmissionEngine` (wp-007-runtime-engine.ts)

**Purpose:** Core business logic for admission decision evaluation and recording.

**Responsibilities:**
- Evaluate incoming requests (no policy knowledge)
- Record decisions immutably to WP-005 audit backbone
- Enforce <50ms latency SLA (Instant Execution pattern)
- Provide queryable decision history
- Support chain integrity verification
- Support rollback via snapshot restoration (WP-046)

**Dependencies:**
- WP-005: Immutable Decision Audit Backbone (storage, integrity)
- WP-001: Constitutional Authority Map (article references)
- WP-004: Policy Decision Trace Schema (trace format)

**Exported Contracts:**
```typescript
- RuntimeAdmissionEngine (class)
- RuntimeAdmissionRequest (interface)
- AdmissionEvaluation (interface)
- RuntimeDecisionRecord (interface)
- RuntimeQueryCriteria (interface)
- RuntimeEngineStatistics (interface)
- ChainVerificationResult (interface)
```

**Key Methods:**
- `evaluateAndRecord()` — Core decision engine
- `queryDecisions()` — Historical queries
- `verifyChainIntegrity()` — Tamper detection
- `getStatistics()` — Observability
- `resetToSnapshot()` — Recovery support

**Critical Property:** Zero external dependencies. This engine can run in isolation for testing, agent simulation, or future sovereign AI.

---

## 2. KERNEL CONTRACTS

**Constitutional Boundaries:**

These types are immutable across all future WPs:

- `ConstitutionArticleId` (WP-001) — Authority reference
- `PolicyDecisionTrace` (WP-004) — Immutable trace format
- `AuditEventMetadata` (WP-005) — Event categorization
- `RuntimeAdmissionRequest` — Incoming request model
- `RuntimeDecisionRecord` — Recorded decision
- `PolicyDecisionOutcome` — Decision type

**Stability Commitment:**
- No breaking changes to these contracts
- Version 1.0 for entire AZMA OS runtime
- New contracts added, never modified
- All consumers depend on these contracts

---

## 3. ADAPTER LAYER

**Component:** `AdmissionPolicyAdapter` (wp-007-adapter.ts)

**Purpose:** Feature-specific policy evaluation logic.

**Responsibilities:**
- Register/manage admission policies
- Evaluate policies against requests
- Orchestrate Runtime Engine + policy logic
- Provide feature-specific routing

**Dependencies:**
- RuntimeAdmissionEngine (uses, not depends)
- AdmissionPolicyRule (types)

**Key Methods:**
- `registerPolicy()` — Add policy
- `removePolicy()` — Remove policy
- `evaluateRequest()` — Policy matching
- `processRequest()` — Full pipeline

**Replaceability:** This layer can be completely replaced with alternative policy evaluation mechanisms (e.g., ML-based routing, complex rule engine, AI-driven) without affecting the Runtime Engine.

---

## 4. CHAMBER CONSUMERS

**Component:** `RuntimeAdmissionController` (wp-007-admission-controller.ts)

**Purpose:** Integration wrapper for chambers.

**Chambers that Consume This:**
- Governance Chamber — Enforce policy decisions
- User Interface Chamber — Display admission status
- Audit Chamber — Historical query interface
- Alert & Escalation Chamber — Route denied/escalated requests
- Orchestration Chamber — Route approved requests

**API Surface:**
```typescript
registerPolicy(policy)              // Add policy
removePolicy(policyId)              // Remove policy
evaluateRequest(request, context)  // Full evaluation
queryDecisions(criteria)            // Historical query
getStatistics()                     // Observability
resetStatistics()                   // Monitoring reset
getRuntimeEngine()                  // Advanced access
getAdapter()                        // Advanced access
```

**Consumers Never Call:**
- Internal Runtime Engine methods directly
- Private policy matching logic
- Chain verification internals (except admin use)

---

## 5. FUTURE AGENT CONSUMERS

**How Agents Will Use This:**

### Agent Pattern 1: Single-Agent Delegation
```
Agent → evaluateRequest(delegated-request)
        → Receives: AdmissionApprovedRoute or AdmissionDeniedResponse
        → Routes to orchestration or escalates
```

### Agent Pattern 2: Multi-Agent Coordination
```
Agent A → (queries historical decisions via queryDecisions)
Orchestrator → aggregates results
Agent B → (receives routing decision)
```

### Agent Pattern 3: Collective Decision
```
Sovereign Agent Society → queries statistics (getStatistics)
                      → Decides collective policy
                      → Updates policy (registerPolicy)
```

**Stable Contracts for Agents:**
- RuntimeAdmissionRequest (generic, no hardcoded fields)
- RuntimeDecisionRecord (fully auditable)
- RuntimeQueryCriteria (flexible querying)
- Latency guarantees (<50ms)

---

## 6. FUTURE SOVEREIGN AI CONSUMERS

**How AZMA's Own Intelligence Will Use This:**

### Scenario 1: Direct Runtime Engine Usage
```
AZMA-Internal-AI → RuntimeAdmissionEngine.evaluateAndRecord()
                → Bypasses adapter layer (direct decision)
                → Records to audit backbone
                → No external provider call needed
```

### Scenario 2: Adapter Replacement
```
AZMA-Internal-AI → Provides new AdmissionPolicyAdapter implementation
                -> Leverages same RuntimeAdmissionEngine
                -> No breaking changes to chambers
```

### Scenario 3: Extended Queries
```
AZMA-Internal-AI → queryDecisions(complex-criteria)
                -> Performs ML-based pattern detection
                -> Updates policies autonomously (with constitutional checks)
```

**Provider-Agnostic Design:**
- Runtime Engine doesn't call external AI
- Routing decisions are deterministic logic, not AI-dependent
- Adapter layer can be updated to use AZMA-internal intelligence
- Chambers are unaffected by AI provider changes

---

## 7. ARCHITECTURAL GUARANTEES

### Guarantee 1: No Circular Dependencies
```
Chambers → RuntimeAdmissionController ✓
RuntimeAdmissionController → RuntimeAdmissionEngine ✓
RuntimeAdmissionEngine → WP-005 (audit backbone) ✓
   ↓
WP-005 → WP-001 (authority) ✓
   ↓
No reverse dependency ✓
```

### Guarantee 2: Runtime Engine Never Knows About Policies
- Policy logic is in Adapter Layer only
- Runtime Engine is policy-agnostic
- New policy types don't require runtime changes
- Policies are data, not code

### Guarantee 3: Deterministic Execution
- No random number generation in core logic
- No timestamps in decision logic (only recording)
- Policy evaluation order is deterministic
- Chain verification is deterministic

### Guarantee 4: Constitutional Traceability
- Every decision links to ConstitutionArticleId
- All decisions recorded to immutable audit backbone (WP-005)
- Chain integrity verifiable at any time
- Supports WP-044 (constitutional traceability validation)

---

## 8. MULTIMODAL EXECUTION READINESS

### Current Support (Phase 1)
- Instant Execution (<50ms)
- Synchronous decision recording
- Simple policy pattern matching

### Future Support (Phase 2+)
- Background Execution (async evaluation)
- Progressive Feedback (partial admission results)
- Concurrent Request Batching
- Extended policy languages (ML, symbolic reasoning)
- Contextual decision routing

**Stable Contracts Survive All Phases:**
- RuntimeAdmissionRequest format
- RuntimeDecisionRecord format
- Decision outcomes (allowed, denied, escalated)
- Latency tracking

---

## 9. ROLLBACK & RECOVERY SUPPORT

**WP-046 Integration:**

Runtime Engine supports rollback to previous snapshots:
```
resetToSnapshot(timestamp) → Reverts all decisions after timestamp
                          → Chain integrity maintained
                          → Audit trail preserved
                          → Chambers can resume from known good state
```

**Recovery Pattern:**
1. Incident detected
2. Identify rollback timestamp
3. Call `resetToSnapshot(timestamp)`
4. Verify chain integrity via `verifyChainIntegrity()`
5. Resume operations
6. WP-044 validates constitutional traceability post-recovery

---

## 10. PRODUCTION READINESS CHECKLIST

- ✅ TypeScript strict mode (no `any` types)
- ✅ ESLint compliance (<0 warnings)
- ✅ Zero external service dependencies
- ✅ Immutable audit trail (WP-005)
- ✅ Deterministic policy evaluation
- ✅ SLA enforcement (latency tracking)
- ✅ Error handling (fail-secure to escalation)
- ✅ Chain integrity verification
- ✅ Statistics/observability
- ✅ Rollback support
- ✅ Constitutional traceability (WP-001, WP-006)

---

## Summary

WP-007 implements a **Sovereign Admission Control Runtime** that:

1. **Is Constitutional** — Enforces authority boundaries from WP-001
2. **Is Reusable** — Runtime Engine is consumed by all chambers, agents, future AI
3. **Is Provider-Agnostic** — No external dependencies
4. **Is Permanent** — Contracts stable across all future AZMA phases
5. **Is Deterministic** — Chain-verified decisions for audit and recovery
6. **Is Extensible** — Adapter layer supports unlimited policy customizations
7. **Is Observable** — Statistics, telemetry, historical queries
8. **Is Recoverable** — Snapshot-based rollback for WP-046

By treating admission control as a **canonical runtime capability** rather than a feature, WP-007 establishes a pattern that all remaining WPs (008-048) will follow, converging toward a complete Sovereign Runtime Operating System by WP-048.
