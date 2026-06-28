================================================================================
SOVEREIGN RUNTIME OS ARCHITECTURE — QUICK REFERENCE & IMPLEMENTATION GUIDE
Effective: 2026-06-28 (Upon WP-007 Approval)
================================================================================

This guide summarizes the three foundational architecture documents and explains 
how they work together to govern the development of WP-008 through WP-048.

================================================================================
DOCUMENT ROADMAP
================================================================================

### Document 1: AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md (Comprehensive)
**Type:** Authoritative reference — Read this for deep understanding
**Audience:** Architects, Chief Architect, future governance council
**Contains:**
- Complete 10-layer architecture definition
- Layer 1-10 detailed responsibilities and contracts
- Layer interaction & dependency rules
- Layer classification template for new WPs
- Historical WP sequence mapping

**When to Read:** Before designing any new WP
**How Long:** 2-3 hours (comprehensive)

---

### Document 2: CHIEF_ARCHITECT_OS_DIRECTIVE.md (Governance)
**Type:** Binding directive — Follow this for all decisions
**Audience:** All stakeholders, development teams, leadership
**Contains:**
- OS kernel paradigm shift (former → new thinking)
- 10 permanent non-negotiable architectural rules
- Mandatory classification requirements
- New approval gates (pre, implementation, post)
- Deviation policy and Chief Architect authority
- Transition plan and success metrics

**When to Read:** Upon starting WP-008 (mandatory reading)
**How Long:** 1.5-2 hours (executive overview possible)

---

### Document 3: WP-008_LAYER_CLASSIFICATION_PLANNING.md (Template & Example)
**Type:** Working template — Copy this for every new WP
**Audience:** WP teams, development leads, technical writers
**Contains:**
- Layer 3 (Scheduling) detailed design
- Complete layer classification (all required sections)
- Kernel dependencies (Layers 1-2 only)
- Services provided (RequestQueueService, PriorityAssignmentService, SchedulingDecisionService)
- Services consumed (from inner layers only)
- Public/internal contracts
- Future AI interfaces
- Agent society interfaces
- Circular dependency verification
- Layer coherence verification
- Implementation roadmap
- Approval gates

**When to Use:** Before every new WP implementation (PRE-IMPLEMENTATION)
**How to Use:** Copy structure, fill in your layer details
**How Long to Complete:** 3-5 days per WP

================================================================================
QUICK REFERENCE: WHEN TO USE EACH DOCUMENT
================================================================================

### Scenario 1: I'm planning a new WP (WP-008+)
1. Read CHIEF_ARCHITECT_OS_DIRECTIVE.md (governance rules)
2. Read AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md (find your layer)
3. Copy WP-008_LAYER_CLASSIFICATION_PLANNING.md structure
4. Fill in your WP's layer classification
5. Submit to Chief Architect for pre-implementation approval

**Expected Timeline:** 1 week to complete classification

---

### Scenario 2: I'm implementing an approved WP
1. Review your WP's approved layer classification document
2. Follow TypeScript + ESLint standards
3. Ensure no layer boundary violations during coding
4. Refer to AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md if uncertain about contracts

**Expected Timeline:** Per WP roadmap (Phases 1-4 in directive)

---

### Scenario 3: I'm reviewing a completed WP
1. Check WP's layer classification is approved (pre-gate)
2. Verify implementation follows approved classification
3. Run architectural audit:
   - Zero circular dependencies?
   - No layer boundary violations?
   - All public contracts properly exported?
   - All decisions recorded to audit?
4. Refer to CHIEF_ARCHITECT_OS_DIRECTIVE.md for approval requirements

**Expected Timeline:** 1-2 weeks per WP

---

### Scenario 4: I'm integrating a chamber into the OS
1. Read AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md — Layer 10 section
2. Read CHIEF_ARCHITECT_OS_DIRECTIVE.md — Rule 9 (chambers via Layer 10 only)
3. Implement chamber adapter that:
   - Translates chamber requests to OS kernel format
   - Routes through Layer 6 admission gate (WP-007)
   - Returns responses to chamber
   - Never directly accesses Layers 1-9

**Expected Timeline:** <1 week per chamber (after WP-029)

---

### Scenario 5: I'm adding a new layer (VERY RARE)
1. Write proposal to Chief Architect
2. Demonstrate why existing 10 layers insufficient
3. If approved, update:
   - AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md (add new layer)
   - CHIEF_ARCHITECT_OS_DIRECTIVE.md (update rules + deviations)
   - All future WPs follow new architecture

**Expected Timeline:** Architecture review + decision (1-2 weeks)

================================================================================
THE 10-LAYER ARCHITECTURE AT A GLANCE
================================================================================

```
Layer 10: Peripheral Adapter Layer          (WP-025-048)
           ↓ consumes all inner layers
Layer 9:  Security Layer                    (WP-022-024)
           ↓ consumes Layers 1-8
Layer 8:  Observability Layer               (WP-019-021)
           ↓ consumes Layers 1-7
Layer 7:  Agent Services Layer              (WP-016-018)
           ↓ consumes Layers 1-6
Layer 6:  Admission & Dispatch Layer        (WP-007, WP-014-015)
           ↓ consumes Layers 1-5 [WP-007 = canonical gate]
Layer 5:  Decision Layer                    (WP-012-013)
           ↓ consumes Layers 1-4
Layer 4:  Memory Layer                      (WP-010-011)
           ↓ consumes Layers 1-3
Layer 3:  Scheduling Layer                  (WP-008-009) [NEXT]
           ↓ consumes Layers 1-2
Layer 2:  Execution Kernel                  (WP-004-006) ✅ Approved
           ↓ consumes Layer 1 [audit trail for all layers]
Layer 1:  Constitutional Kernel             (WP-001-003) ✅ Approved
           ↓ no dependencies [foundation]
```

**Key Principle:** Each layer depends ONLY on layers below it.
Outer layers may depend on all inner layers. Inner layers never depend on outer layers.

================================================================================
MANDATORY APPROVAL GATES FOR EVERY WP
================================================================================

### Gate 1: Pre-Implementation (BEFORE coding)
**What:** Layer classification document
**Deliverable:** WP-XXX_LAYER_CLASSIFICATION_PLANNING.md
**Review:** Chief Architect
**Status:** Must be APPROVED before coding begins
**Consequence if Failed:** Work package blocked until approved

### Gate 2: Implementation Phase (DURING coding)
**What:** Layer boundary compliance
**Deliverable:** Code review
**Review:** Chief Architect spot-checks + team lead verification
**Status:** Must maintain approved layer structure
**Consequence if Failed:** Code cannot merge if violations detected

### Gate 3: Post-Implementation (AFTER coding)
**What:** Architectural coherence audit
**Deliverable:** WP-XXX_ARCHITECTURAL_AUDIT_REPORT.md
**Review:** Chief Architect
**Status:** Must verify:
  - Zero circular dependencies
  - No layer boundary violations
  - All public contracts properly exported
  - All decisions recorded to audit trail
  - No Chamber direct kernel access
**Consequence if Failed:** Work package blocked from approval

### Gate 4: Final Approval (IF all gates pass)
**What:** Chief Architect sign-off
**Deliverable:** Approval for production deployment
**Review:** Chief Architect
**Status:** Only after all gates pass
**Consequence if Failed:** Work package cannot be deployed

================================================================================
LAYER CLASSIFICATION CHECKLIST (FOR EVERY NEW WP)
================================================================================

Use this checklist when creating your WP_XXX_LAYER_CLASSIFICATION_PLANNING.md:

**Part I: OS Layer Classification**
- [ ] Primary layer identified (1-10)
- [ ] Secondary layers listed (if applicable)
- [ ] Rationale documented

**Part II: Kernel Dependencies (Verified Inward-Only)**
- [ ] All dependent layers listed
- [ ] Dependencies flow inward only (no Layer N depends on Layer N+1+)
- [ ] Zero circular dependencies
- [ ] No layer bypassing

**Part III: Services Provided (Public Contracts)**
- [ ] Service 1 name and contract defined
- [ ] Service 2 name and contract defined
- [ ] [As many services as needed]
- [ ] All contracts are immutable (exported permanently)

**Part IV: Services Consumed (From Inner Layers)**
- [ ] Service 1 from Layer X documented
- [ ] Service 2 from Layer Y documented
- [ ] [As many as needed]
- [ ] All sources are inner layers only

**Part V: Public Runtime Contracts**
- [ ] Contract 1 type and immutability guarantee documented
- [ ] Contract 2 type and immutability guarantee documented
- [ ] [As many as needed]
- [ ] Versioning strategy explained

**Part VI: Internal Runtime Contracts**
- [ ] Internal 1 documented as NOT exported
- [ ] Internal 2 documented as NOT exported
- [ ] [As many as needed]
- [ ] Clear lifetime and scope

**Part VII: Future Sovereign AI Interfaces**
- [ ] What can AI access from this layer
- [ ] What is explicitly forbidden
- [ ] Authorization requirements specified

**Part VIII: Agent Society Interfaces**
- [ ] What can agents access
- [ ] Privacy boundaries defined
- [ ] Multi-agent coordination mechanisms

**Part IX: Circular Dependency Verification**
- [ ] No circular dependencies verified
- [ ] Dependencies flow inward only
- [ ] Automated analysis performed
- [ ] Manual review completed

**Part X: Layer Coherence Verification**
- [ ] Belongs in assigned layer (justified)
- [ ] No business logic in wrong layer
- [ ] All contracts properly exported
- [ ] No internal state exposed
- [ ] All decisions recorded to audit
- [ ] No unauthorized layer bypass
- [ ] Deterministic execution (where applicable)

================================================================================
IMPLEMENTATION TIMELINE (WP-008 through WP-048)
================================================================================

### Phase 1: Layers 3-5 Foundation (Weeks 1-10)
- WP-008-009: Scheduling Layer (Layer 3)
- WP-010-011: Memory Layer (Layer 4)
- WP-012-013: Decision Layer (Layer 5)
- WP-014-015: Escalation & Failure (Layer 6 extensions)

**Objective:** Complete policy evaluation pipeline
**Dependencies:** Layers 1-2 already approved
**Deliverable:** WP-008 through WP-015 approved and deployed

### Phase 2: Layers 7-8 Capability (Weeks 11-20)
- WP-016-018: Agent Services (Layer 7)
- WP-019-021: Observability (Layer 8)

**Objective:** Agent support + operational intelligence
**Dependencies:** Layers 1-6 complete
**Deliverable:** WP-016 through WP-021 approved and deployed

### Phase 3: Layers 9-10 Completion (Weeks 21-30)
- WP-022-024: Security (Layer 9)
- WP-025-029: Chamber Adapters (Layer 10 — 5 chambers)

**Objective:** Production-grade security + chamber integration
**Dependencies:** Layers 1-8 complete
**Deliverable:** WP-022 through WP-029 approved and deployed

### Phase 4: Integration & Advanced (Weeks 31-48+)
- WP-030-048: Future extensions, optimizations, scale testing
- Advanced capabilities (rollback, recovery, migration)
- Scale testing (1000+ agents)
- Future Sovereign AI integration

**Objective:** Complete, production-ready Sovereign Runtime OS
**Dependencies:** Layers 1-10 complete and stable
**Deliverable:** WP-030 through WP-048 approved and deployed
                 Complete Sovereign Runtime OS operational at scale

**Total Estimated Timeline:** 12 months (48 weeks)

================================================================================
KEY ARCHITECTURAL PRINCIPLES (QUICK REFERENCE)
================================================================================

1. **OS Kernel Thinking**
   - AZMA Runtime IS an operating system
   - Not a collection of components
   - Permanent, coherent, governed architecture

2. **10-Layer Governance**
   - Each layer has defined responsibility
   - Layers depend inward only (Layer N → Layers 1..N-1)
   - No circular dependencies
   - No layer bypassing

3. **Immutable Contracts**
   - Once exported, service contracts cannot break
   - New features = new services or contract versions
   - All exported types are `readonly`

4. **Admission Gate**
   - WP-007 Runtime Engine = Layer 6 admission gate
   - All requests flow through admission
   - Chambers cannot bypass this layer
   - Exception: Future Sovereign AI (authorized)

5. **Complete Audit Trail**
   - Every decision recorded to Layer 2 (audit backbone)
   - No silent decisions
   - All rationale linked
   - Chain integrity verified

6. **Constitutional Authority**
   - ConstitutionArticleId = source of truth
   - Every decision links to constitutional authority
   - No decision violates constitutional boundaries
   - Layer 1 enforces boundaries for all outer layers

7. **Deterministic Core**
   - All core kernel logic is deterministic
   - Same input = same output
   - Enabled by: SHA256 hashing, sorted evaluations, reproducible ordering
   - Exception: Layer 10 adapters may be non-deterministic

8. **Chamber Integration**
   - Chambers integrate via Layer 10 adapters
   - Adapters are replaceable
   - Adapters never modify kernel logic
   - No chamber specific code in Layers 1-9

9. **Agent Coordination**
   - Agents coordinate via Layer 7 services
   - Agents cannot access inner layers directly
   - Multi-agent coordination is authorized
   - Privacy boundaries enforced (agents cannot see others' requests)

10. **Future Extensibility**
    - New capabilities = new Layer 10 adapters
    - New chambers = new Layer 10 adapters
    - New agents = Layer 7 coordination
    - Future Sovereign AI = direct inner-layer access (authorized)
    - No kernel redesign needed for any future extension

================================================================================
TROUBLESHOOTING & COMMON QUESTIONS
================================================================================

**Q: My WP doesn't fit in the 10-layer architecture. What do I do?**
A: Propose to Chief Architect in writing. Rare exceptions considered. More likely:
   your understanding of layers is incomplete. Re-read AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md

**Q: Can WP X depend on WP Y (which is higher layer)?**
A: No. Only inward dependencies allowed. If WP X needs something from higher layer,
   that functionality belongs in a lower layer. Redesign required.

**Q: What if two WPs in the same layer need to coordinate?**
A: Same-layer coordination is allowed (no circular dependency). Both depend on inner
   layers; coordination is peer-to-peer. Document this in layer classification.

**Q: The Chamber wants direct access to Layer 5 (Decision layer). Can we allow it?**
A: No. Chambers ONLY access through Layer 10 adapters. All chamber requests go through
   admission gate (Layer 6). This is non-negotiable (Rule 4).

**Q: How do we add a new layer?**
A: Rarely. Propose to Chief Architect with full justification. If approved, updates
   AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md + CHIEF_ARCHITECT_OS_DIRECTIVE.md + all
   future WP templates. This is a permanent organizational change.

**Q: Can we bypass the audit trail to improve performance?**
A: No. Every decision recorded to audit trail (Rule 2). If performance is critical,
   optimize the audit system (Layer 2), not by skipping recording.

**Q: What happens if we find a layer boundary violation during implementation?**
A: Stop immediately. Consult WP team lead + Chief Architect. Options:
   (1) Redesign component to respect boundaries
   (2) Propose layer change (very rare)
   (3) Create new service in correct layer + refactor

**Q: Can future Sovereign AI access all layers directly?**
A: Only with explicit authorization. Each layer specifies what AI can access.
   Default = read-only, restricted interfaces. Full access = extraordinary authorization.

================================================================================
SUCCESS CRITERIA (HOW WE KNOW IT'S WORKING)
================================================================================

- ✅ Zero architectural violations: No layer boundary breaches
- ✅ Zero circular dependencies: All dependencies flow inward only
- ✅ 100% audit coverage: Every decision recorded to Layer 2
- ✅ 100% constitutional compliance: Every decision links to Layer 1
- ✅ Linear scalability: Performance O(1) with agent count
- ✅ Contract stability: No breaking changes to exported contracts
- ✅ Chamber integration: 5+ chambers operational; new chambers <1 week
- ✅ Agent support: 1000+ agents operational; proven coordination
- ✅ Observability: Complete tracing from Layer 1 through 9
- ✅ Security: Zero unauthorized layer access; all threats audited
- ✅ Extensibility: Future capabilities don't require kernel redesign

================================================================================
GETTING STARTED: NEXT STEPS
================================================================================

1. **Read the Architecture (Today)**
   - CHIEF_ARCHITECT_OS_DIRECTIVE.md (1.5-2 hours)
   - AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md (2-3 hours)

2. **Understand the Template (Day 2)**
   - WP-008_LAYER_CLASSIFICATION_PLANNING.md (1-2 hours)
   - How to adapt for your WP

3. **Plan Your WP (Days 3-5)**
   - Identify your OS layer (1-10)
   - List kernel dependencies (inward only)
   - Define public contracts
   - Document consumed services
   - Write WP-XXX_LAYER_CLASSIFICATION_PLANNING.md

4. **Submit for Approval (Day 6)**
   - Send WP-XXX_LAYER_CLASSIFICATION_PLANNING.md to Chief Architect
   - Wait for pre-implementation gate approval
   - Address any feedback

5. **Begin Implementation (Day 7+)**
   - Follow approved layer classification
   - Maintain layer boundaries
   - TypeScript + ESLint compliance
   - No layer violations

6. **Post-Implementation Audit (After Coding)**
   - Architectural coherence audit
   - Circular dependency check
   - Layer boundary verification
   - Chief Architect approval

7. **Deploy to Production (When All Gates Pass)**
   - Approved WP can be deployed
   - Feeds Layer 1-9 consumers
   - Available to chambers via Layer 10

================================================================================

End of Quick Reference Guide

Questions? Refer to the three foundational documents:
1. AZMA_RUNTIME_OS_KERNEL_ARCHITECTURE.md (Deep reference)
2. CHIEF_ARCHITECT_OS_DIRECTIVE.md (Governance authority)
3. WP-008_LAYER_CLASSIFICATION_PLANNING.md (Working template)

Questions about your specific WP? Consult your approved layer classification document.

Questions about architecture direction? Contact Chief Architect.

Status: OS Kernel Architecture is permanent, binding, and effective immediately.

================================================================================
