================================================================================
WP-008: DISPATCH AND PRIORITIZATION CONTROL
Sovereign Runtime Operating System — Layer 3 Classification
Implementation Plan (2026-06-28)
================================================================================

This Work Package demonstrates the new Operating System Kernel mindset.
WP-008 is the first work package designed with OS layer classification from inception.

================================================================================
PART I: OS LAYER CLASSIFICATION
================================================================================

### Primary OS Layer Assignment
**Layer 3: Scheduling Layer**

**Rationale:** WP-008 manages request queuing, prioritization, and scheduling decisions.
This is a pure scheduling responsibility, distinct from admission control (Layer 6) 
and policy evaluation (Layer 5).

### Secondary Layer Participation
- Depends on Layer 1 (Constitutional authority for priority policy)
- Depends on Layer 2 (Execution kernel for audit recording)
- Feeds Layer 4 (Memory layer stores queue state)
- Feeds Layer 5 (Decision layer receives scheduling context)

================================================================================
PART II: KERNEL DEPENDENCIES (INWARD-ONLY)
================================================================================

**Layer Dependency Chain:**
```
WP-008 (Layer 3) depends on:
├── Layer 1: Constitutional Kernel (WP-001-003)
│   └── Provides: ConstitutionArticleId, policy authority
├── Layer 2: Execution Kernel (WP-004-006)
│   └── Provides: PolicyDecisionTrace, audit recording
└── ✅ Properly flows inward only (no dependencies on Layers 4-10)
```

**Specific Dependencies:**
1. Layer 1 (Constitutional Kernel):
   - ConstitutionArticleId (for priority policy authority)
   - Authority validation (to verify priority assignment authority)
   - ConstitutionPolicies (scheduling policies from constitution)

2. Layer 2 (Execution Kernel):
   - PolicyDecisionTrace structure (to record scheduling decisions)
   - Audit recording API (ImmutableDecisionAuditBackbone)
   - PolicyDecisionSeverity (to assign severity to scheduling violations)

**No Dependencies On:**
- Layer 4 (Memory layer) — Layer 3 provides scheduling, Layer 4 consumes it
- Layer 5 (Decision layer) — Layer 3 provides scheduling context, Layer 5 consumes it
- Layer 6 (Admission layer) — Separate concern; both consume Layers 1-2
- Layers 7-10 — Not applicable to scheduling

================================================================================
PART III: SERVICES PROVIDED (PUBLIC CONTRACTS)
================================================================================

### Service 1: Request Queue Management
**Name:** RequestQueueService
**Export:** Public contract (immutable)
**Purpose:** Manage incoming request queue with FIFO ordering

**Exported Types:**
```typescript
interface RequestQueue {
  readonly queueId: string;
  readonly capacity: number;
  readonly size: number;
  readonly items: readonly ScheduledRequest[];
}

interface ScheduledRequest {
  readonly requestId: string;
  readonly enqueuedAt: number;
  readonly priority: SchedulingPriority;
  readonly estimatedProcessTime: number;
  readonly placementIndex: number;
}

type SchedulingPriority = 'low' | 'normal' | 'high' | 'critical';
```

**Service Methods:**
- `enqueue(request, priority): ScheduledRequest` — Add request to queue
- `dequeue(): ScheduledRequest | null` — Remove highest-priority request
- `peek(): ScheduledRequest | null` — View next request without removing
- `getQueueStatus(): RequestQueue` — Query full queue state

**Immutability Guarantee:** Queue state is append-only. Requests never removed from history.

---

### Service 2: Priority Assignment
**Name:** PriorityAssignmentService
**Export:** Public contract (immutable)
**Purpose:** Determine priority level for incoming requests

**Exported Types:**
```typescript
interface PriorityAssignmentPolicy {
  readonly policyId: string;
  readonly policyName: string;
  readonly conditions: readonly PriorityCondition[];
  readonly defaultPriority: SchedulingPriority;
  readonly authorityArticleId: ConstitutionArticleId;
}

interface PriorityCondition {
  readonly actionType: string;
  readonly source: string;
  readonly assignedPriority: SchedulingPriority;
  readonly reason: string;
}

interface PriorityAssignment {
  readonly requestId: string;
  readonly assignedPriority: SchedulingPriority;
  readonly policyMatched: string;
  readonly timestamp: number;
}
```

**Service Methods:**
- `registerPriorityPolicy(policy): void` — Register priority policy
- `assignPriority(request): PriorityAssignment` — Determine priority
- `queryPolicies(): PriorityAssignmentPolicy[]` — List all policies
- `removePriorityPolicy(policyId): void` — Unregister policy

**Immutability Guarantee:** Priority assignments recorded to audit trail and never changed.

---

### Service 3: Scheduling Decisions
**Name:** SchedulingDecisionService
**Export:** Public contract (immutable)
**Purpose:** Generate scheduling decisions and routing instructions

**Exported Types:**
```typescript
interface SchedulingDecision {
  readonly requestId: string;
  readonly decidedAt: number;
  readonly queuePosition: number;
  readonly estimatedWaitTime: number;
  readonly assignedPriority: SchedulingPriority;
  readonly routingTarget: 'normal-queue' | 'priority-queue' | 'escalation-queue';
  readonly reason: string;
  readonly authorityArticleId: ConstitutionArticleId;
}

interface SchedulingStatistics {
  readonly totalRequests: number;
  readonly averageQueueTime: number;
  readonly maxQueueTime: number;
  readonly priorityDistribution: Record<SchedulingPriority, number>;
  readonly queueUtilization: number; // 0-100%
}
```

**Service Methods:**
- `makeSchedulingDecision(request): SchedulingDecision` — Generate decision
- `getStatistics(): SchedulingStatistics` — Query scheduling metrics
- `queryDecisionHistory(criteria): SchedulingDecision[]` — Query historical decisions
- `resetStatistics(): void` — Clear statistics

**Immutability Guarantee:** All scheduling decisions recorded to audit trail.

================================================================================
PART IV: SERVICES CONSUMED (INTERNAL DEPENDENCIES)
================================================================================

### From Layer 1: Constitutional Kernel

**Service 1: Authority Lookup**
- **Used for:** Verifying priority policy authority
- **Contract:** `authorityLookup(articleId: ConstitutionArticleId): AuthorityInfo`
- **Scope:** Layer 3 only uses for validation, never makes authority decisions

**Service 2: Policy Boundary Enforcement**
- **Used for:** Ensuring priority policies comply with constitutional boundaries
- **Contract:** `validatePolicyBoundary(policy: PriorityAssignmentPolicy): boolean`
- **Scope:** Raises error if policy violates authority

---

### From Layer 2: Execution Kernel

**Service 1: Audit Recording**
- **Used for:** Recording every scheduling decision to immutable audit trail
- **Contract:** `recordDecisionTrace(trace: PolicyDecisionTrace): AuditResponse`
- **Scope:** Every `makeSchedulingDecision()` call writes to audit

**Service 2: Audit Retrieval**
- **Used for:** Historical scheduling queries
- **Contract:** `queryDecisionTraces(criteria): PolicyDecisionTrace[]`
- **Scope:** Used by `queryDecisionHistory()`

**Service 3: Chain Verification**
- **Used for:** Verifying integrity of scheduling decision records
- **Contract:** `verifyChainIntegrity(): ChainVerificationResult`
- **Scope:** Prevents tampering with scheduling history

================================================================================
PART V: PUBLIC RUNTIME CONTRACTS (EXPORTED TO OUTER LAYERS)
================================================================================

All contracts are immutable and versioned. Breaking changes are prohibited.

### Contract 1: SchedulingRequest
```typescript
export interface SchedulingRequest {
  readonly requestId: string;
  readonly userId: string;
  readonly actionType: string;
  readonly source: 'direct-user' | 'agent-delegated' | 'orchestrator-initiated';
  readonly submittedAt: number;
  readonly payload: Record<string, unknown>;
}
```
**Version:** 1.0 (Immutable)
**Consumed by:** Layer 4 (Memory), Layer 5 (Decision), Layer 6 (Admission)
**Guarantee:** Structure never changes; new fields only in version 2.0

### Contract 2: SchedulingPriority
```typescript
export type SchedulingPriority = 'low' | 'normal' | 'high' | 'critical';

export interface PriorityDefinition {
  readonly level: SchedulingPriority;
  readonly numericalValue: 1 | 2 | 3 | 4;
  readonly estimatedProcessingTime: number; // milliseconds
  readonly expectedWaitTime: number; // milliseconds
}
```
**Version:** 1.0 (Immutable)
**Consumed by:** Layer 4 (Memory), Layer 5 (Decision), Layer 6 (Admission)
**Guarantee:** Priority values never change; new levels only in version 2.0

### Contract 3: SchedulingDecision
```typescript
export interface SchedulingDecision {
  readonly requestId: string;
  readonly decidedAt: number;
  readonly queuePosition: number;
  readonly estimatedWaitTime: number;
  readonly assignedPriority: SchedulingPriority;
  readonly routingTarget: 'normal-queue' | 'priority-queue' | 'escalation-queue';
  readonly reason: string;
  readonly authorityArticleId: ConstitutionArticleId;
}
```
**Version:** 1.0 (Immutable)
**Consumed by:** Layer 4 (Memory), Layer 5 (Decision), Layer 6 (Admission)
**Guarantee:** Structure immutable; new routing targets only in version 2.0

================================================================================
PART VI: INTERNAL RUNTIME CONTRACTS (LAYER 3 ONLY)
================================================================================

These contracts are NOT exposed to outer layers. They are implementation details.

### Internal 1: QueueNode
```typescript
interface QueueNode {
  requestId: string;
  priority: SchedulingPriority;
  enqueuedAt: number;
  nextNode: QueueNode | null;
}
```
**Scope:** Internal queue implementation detail
**Lifetime:** Per-runtime (not persisted)

### Internal 2: PriorityComparator
```typescript
interface PriorityComparator {
  compare(a: SchedulingPriority, b: SchedulingPriority): number;
  getPriorityWeight(priority: SchedulingPriority): number;
}
```
**Scope:** Internal priority comparison logic
**Lifetime:** Singleton per runtime

### Internal 3: SchedulingContext
```typescript
interface SchedulingContext {
  currentTime: number;
  queueSize: number;
  systemLoad: number;
  maxQueueSize: number;
}
```
**Scope:** Internal context used during decision-making
**Lifetime:** Per-request

================================================================================
PART VII: FUTURE SOVEREIGN AI INTERFACES
================================================================================

The future Sovereign AI system will interact with Layer 3 (Scheduling) through these authorized interfaces:

### Interface 1: Direct Scheduling Query
**Authorization:** Sovereign AI may query scheduling decisions for self-evaluation
```typescript
// Available to Sovereign AI only (not to chambers)
export interface SovereignAISchedulingInterface {
  // Query scheduling decisions for pattern analysis
  querySchedulingPatterns(criteria: SchedulingQueryCriteria): SchedulingDecision[];
  
  // Request priority override (with justification)
  requestPriorityOverride(
    requestId: string,
    newPriority: SchedulingPriority,
    justification: string,
    authorityArticleId: ConstitutionArticleId
  ): OverrideDecision;
  
  // Get scheduling statistics for optimization
  getSchedulingStatistics(): SchedulingStatistics;
}
```

### Interface 2: Scheduling Policy Suggestions
**Authorization:** Sovereign AI may suggest new priority policies
```typescript
// Available to Sovereign AI only (not to chambers)
export interface SovereignAISchedulingPolicyInterface {
  // Suggest new priority policies based on analysis
  suggestPriorityPolicy(
    policy: PriorityAssignmentPolicy,
    analysis: string,
    authorityArticleId: ConstitutionArticleId
  ): PolicySuggestion;
  
  // Request policy update with justification
  requestPolicyUpdate(
    policyId: string,
    updates: Partial<PriorityAssignmentPolicy>,
    justification: string,
    authorityArticleId: ConstitutionArticleId
  ): UpdateDecision;
}
```

**Restrictions:**
- Sovereign AI CANNOT directly modify policies (must request through authorized channels)
- All AI requests are recorded with full justification and authority
- AI priority overrides are audited and limited by constitutional authority

================================================================================
PART VIII: AGENT SOCIETY INTERFACES
================================================================================

Agents will interact with Layer 3 (Scheduling) through these authorized interfaces:

### Interface 1: Agent Priority Coordination
**Authorization:** Agents may negotiate priority for coordinated requests
```typescript
// Available to agents
export interface AgentSchedulingInterface {
  // Submit request with requested priority
  submitRequest(
    request: SchedulingRequest,
    requestedPriority: SchedulingPriority,
    justification: string
  ): SchedulingDecision;
  
  // Query estimated wait time
  getEstimatedWaitTime(requestId: string): number;
  
  // Get collective queue status (limited visibility)
  getQueueStatus(): {
    averageWaitTime: number;
    priorityDistribution: Record<SchedulingPriority, number>;
    userCount: number; // Aggregated, not individual
  };
}
```

### Interface 2: Multi-Agent Coordination
**Authorization:** Agents may coordinate priorities for delegated requests
```typescript
// Available to agents
export interface MultiAgentSchedulingInterface {
  // Coordinate priority for multi-agent request
  coordinatePriority(
    requestIds: string[],
    coordinationId: string,
    priority: SchedulingPriority,
    agents: string[]
  ): CoordinationDecision;
  
  // Query coordination status
  getCoordinationStatus(coordinationId: string): CoordinationStatus;
  
  // Request collective priority escalation
  requestCollectiveEscalation(
    requestIds: string[],
    coordinationId: string,
    reason: string
  ): EscalationDecision;
}
```

**Restrictions:**
- Agents CANNOT see other agents' requests (privacy)
- Priority coordination limited to agents' own delegations
- Collective escalation requires unanimous agent agreement

================================================================================
PART IX: CIRCULAR DEPENDENCY VERIFICATION
================================================================================

### ✅ Verified: No Circular Dependencies

**Dependency Flow Analysis:**
```
WP-008 (Layer 3) → Layer 1 (Constitutional Kernel) ✅ Inward only
WP-008 (Layer 3) → Layer 2 (Execution Kernel) ✅ Inward only
WP-008 (Layer 3) ← Layer 4 (Memory Layer) ✅ No circular (4 depends on 3, not vice versa)
WP-008 (Layer 3) ← Layer 5 (Decision Layer) ✅ No circular (5 depends on 3, not vice versa)
WP-008 (Layer 3) ← Layer 6 (Admission Layer) ✅ No circular (6 depends on 3, not vice versa)
```

**Verification:**
- ✅ Layer 1 does NOT depend on Layer 3
- ✅ Layer 2 does NOT depend on Layer 3
- ✅ Layer 3 does NOT depend on Layers 4-10
- ✅ Only inward dependencies (3 → 1, 3 → 2)
- ✅ Outer layers may depend on Layer 3 (allowed)

**Circular Dependency Risk:** ZERO

================================================================================
PART X: LAYER COHERENCE VERIFICATION
================================================================================

### ✅ Verified: No Layer Boundary Violations

**Verification Checklist:**

1. ✅ **Belongs in Layer 3 (Scheduling)**
   - Responsibility: Request queuing, priority assignment, scheduling decisions
   - Not admission control (Layer 6 responsibility)
   - Not policy evaluation (Layer 5 responsibility)
   - Not memory management (Layer 4 responsibility)
   - ✅ Correct layer assignment

2. ✅ **No Business Logic in Wrong Layer**
   - Policy evaluation decisions → NOT in WP-008 (belongs in Layer 5)
   - Admission control → NOT in WP-008 (belongs in Layer 6)
   - Memory caching → NOT in WP-008 (belongs in Layer 4)
   - ✅ Pure scheduling responsibility only

3. ✅ **All Service Contracts Properly Exported**
   - RequestQueueService → Public, exported to outer layers
   - PriorityAssignmentService → Public, exported to outer layers
   - SchedulingDecisionService → Public, exported to outer layers
   - QueueNode, PriorityComparator → Internal, NOT exported
   - ✅ Clear export boundaries

4. ✅ **No Internal State Exposed**
   - Queue implementation details (QueueNode) → Internal only
   - Priority comparison logic (PriorityComparator) → Internal only
   - Scheduling context (SchedulingContext) → Internal only
   - All external APIs return immutable contracts only
   - ✅ Proper encapsulation

5. ✅ **All Decisions Recorded to Audit Trail**
   - Every `makeSchedulingDecision()` → Records to Layer 2 audit
   - Every priority assignment → Recorded with authority
   - Every policy update → Recorded with justification
   - ✅ Complete audit coverage

6. ✅ **No Unauthorized Layer Bypass**
   - Layer 4 cannot skip scheduling and go directly to Layer 2
   - Layer 6 cannot skip scheduling and go directly to Layer 5
   - All requests flow through Layer 3 sequentially
   - ✅ Proper layer sequencing

7. ✅ **Deterministic Execution**
   - Priority assignment → Deterministic (sorted by rule order)
   - Queue ordering → Deterministic (priority + FIFO)
   - Scheduling decisions → Deterministic (same input = same output)
   - ✅ No random logic

**Layer Coherence Risk:** ZERO

================================================================================
PART XI: IMPLEMENTATION ROADMAP
================================================================================

### Phase 1: Core Scheduling Engine (Week 1)
- [ ] Implement RequestQueueService
- [ ] Implement PriorityComparator (internal)
- [ ] Implement QueueNode (internal)
- [ ] Basic FIFO queue with priority levels

### Phase 2: Priority Assignment (Week 2)
- [ ] Implement PriorityAssignmentService
- [ ] Priority policy registration
- [ ] Priority policy matching
- [ ] Audit recording for assignments

### Phase 3: Scheduling Decisions (Week 3)
- [ ] Implement SchedulingDecisionService
- [ ] Generate scheduling decisions
- [ ] Calculate wait times
- [ ] Record decisions to audit trail

### Phase 4: Layer Integration (Week 4)
- [ ] Integrate with Layer 1 (Constitutional authority)
- [ ] Integrate with Layer 2 (Audit recording)
- [ ] Integrate with Layer 4 (Memory layer consumption)
- [ ] Verify no circular dependencies

### Phase 5: Testing & Validation (Week 5)
- [ ] TypeScript strict mode compliance
- [ ] ESLint compliance (zero warnings)
- [ ] Jest test suite (40+ tests)
- [ ] Simulation harness (15+ scenarios)
- [ ] Architectural audit

### Phase 6: Documentation & Approval (Week 6)
- [ ] Layer classification complete
- [ ] Public contracts documented
- [ ] Future AI interfaces specified
- [ ] Agent society interfaces specified
- [ ] Chief Architect review
- [ ] WP-008 Approval Gate

================================================================================
PART XII: CHIEF ARCHITECT APPROVAL GATES
================================================================================

**Pre-Implementation Gate (THIS DOCUMENT):**
- [ ] OS Layer clearly identified (Layer 3: Scheduling)
- [ ] Kernel dependencies documented (Layers 1-2 only)
- [ ] Public contracts defined (RequestQueueService, PriorityAssignmentService, SchedulingDecisionService)
- [ ] Services consumed documented (Constitutional authority, audit recording)
- [ ] Future AI interfaces specified
- [ ] Agent society interfaces specified
- [ ] Circular dependency verified (ZERO)
- [ ] Layer coherence verified (PASS)

**Implementation Gate (During Development):**
- [ ] TypeScript strict mode compliance
- [ ] ESLint zero-warning compliance
- [ ] All contracts exported from correct layer
- [ ] No layer boundary violations
- [ ] All decisions recorded to audit trail
- [ ] No Chambers bypass OS kernel

**Post-Implementation Gate (After Development):**
- [ ] Architectural coherence audit (PASS)
- [ ] Circular dependency verification (ZERO)
- [ ] Layer separation verification (PASS)
- [ ] Chief Architect sign-off required before WP-009

================================================================================

END WP-008 LAYER CLASSIFICATION PLANNING

Next: WP-008 Implementation per this OS kernel architecture

Status: Ready for Chief Architect approval to proceed

================================================================================
