# AZMA Work Package Approval Framework

**Authority:** Chief Architect  
**Effective:** 2026-06-28  
**Scope:** WP-009 through WP-048  
**Status:** ✅ ACTIVE

---

## The Four-Gate Approval Process

Every Work Package must PASS all four gates in sequence:

### Gate 1: Local Validation [TERTIARY]
**Purpose:** Code quality and functional correctness

- ✅ TypeScript Strict Mode: 0 errors (`npx tsc --noEmit --strict`)
- ✅ ESLint: 0 violations (`npx eslint . --max-warnings 0`)
- ✅ Unit Tests: 100% pass rate
- ✅ Integration Tests: 100% pass rate

**Failure Mode:** Do NOT proceed to Gate 2

**Approver:** Build system (automated)

---

### Gate 2: Architectural Simplicity Preservation (ASP) [PRIMARY]
**Purpose:** Ensure capability grows while complexity shrinks

**Core Principle:** `Capability ↑` AND `Complexity ↓`

#### 10-Dimension Evaluation

| # | Dimension | Question | Evaluation |
|---|-----------|----------|-----------|
| 1 | New Capability | Was a genuine new capability added? | Yes/No |
| 2 | Minimum Components | Could achieve same capability with fewer components? | Yes/Neutral/No |
| 3 | Services Simplified | Were any existing services simplified? | Yes/Neutral/No |
| 4 | Contracts Eliminated | Were any contracts eliminated? | Yes/Neutral/No |
| 5 | Logic Deduplication | Was duplicated logic removed? | Yes/Neutral/No |
| 6 | Maintenance Effort | Did maintenance burden decrease for future WPs? | Yes/Neutral/No |
| 7 | Cognitive Complexity | McCabe complexity decreased? | Score: X → Y |
| 8 | Readability | Did readability improve? | Yes/Neutral/No |
| 9 | Learning Curve | Can future engineers learn faster? | Yes/Neutral/No |
| 10 | Five-Year Test | Is removal still straightforward? | Yes/Neutral/No |

#### ASP Scoring

- **Pass:** Dimensions 1, 6, 9, 10 all "Yes"
- **Fail:** Any of dims 1, 6, 9, 10 is "No" → **REJECT WP, redesign required**
- **Ideal:** 10/10 dimensions passing
- **Acceptable:** 8-9/10 (with Chief Architect review)
- **Problematic:** 7/10 or below → Escalate for redesign

#### ASP Baseline Metrics (WP-008 → WP-048 Target)

| Metric | WP-008 | Direction | Target | Rationale |
|--------|--------|-----------|--------|-----------|
| Service classes | 4 | ↓ | ≤15 | Keep architecture lean |
| Contracts | 6 | ↓ | ≤50 | Reuse contracts, don't create new ones |
| McCabe avg | 3.2 | ↓ | ≤3.0 | Simple decision paths |
| File LOC avg | 150 | ↓ | ≤120 | Smaller, focused modules |
| Circular deps | 0 | → | 0 | Always forbidden |
| Debt ratio | ~10% | ↓ | <2% | Pay down technical debt |

**Failure Mode:** If any 3+ metrics deteriorate compared to previous WP → REJECT WP

**Approver:** Chief Architect (manual review)

---

### Gate 3: Progressive Kernel Regression (PKR) [SECONDARY]
**Purpose:** Validate all prior layers continue functioning after integration

**10-Point Validation Checklist:**

1. ✅ **Local Tests Pass:** All WP-local unit tests pass
2. ✅ **Backward Compatibility:** All prior WP tests pass (no regressions)
3. ✅ **Full OS Simulation:** Complete runtime kernel tested (WP-001 through current WP)
4. ✅ **Layer Behavior:** No unexpected changes in existing layer behavior
5. ✅ **Public Contracts:** No breaking changes to public contracts
6. ✅ **Determinism:** Same input produces same output (3 runs verified)
7. ✅ **Constitutional Traceability:** All decisions linked to ConstitutionArticleId
8. ✅ **Regression Latency:** New WP adds <5% latency; cumulative <20% by WP-048
9. ✅ **Architectural Drift:** No new cross-layer dependencies; inward-only rule maintained
10. ✅ **Auto-Repair:** Fix all WP-local issues before reporting; don't escalate WP-local problems

**Failure Mode:** If any point fails → **REJECT WP, do NOT proceed**

**Approver:** Build system + Chief Architect (automated + manual)

---

### Gate 4: Runtime Capability Growth (RCG) [SECONDARY]
**Purpose:** Validate new capability is real and contributes to OS maturity

**10-Dimension Evaluation:**

| # | Dimension | Documentation Required |
|---|-----------|---|
| 1 | New Capability | Describe what was added (measurable, distinct) |
| 2 | Extended Capabilities | List existing capabilities now enhanced |
| 3 | Services Affected | List Runtime services involved |
| 4 | Agent Society Gains | What new powers do Chambers/Agents gain? |
| 5 | Future Sovereign AI | How does this enable Layer 8-10? |
| 6 | Reusable Contracts | New service contracts for future WPs |
| 7 | Maturity Increase | +X (0-10 scale) |
| 8 | Debt Eliminated | Specific architectural debt removed |
| 9 | WPs Simplified | Which future WPs are now simpler? |
| 10 | Chamber Coverage | New capabilities available to all Chambers |

**RCG Scoring:**

- **Pass:** All 10 dimensions documented
- **Fail:** Any dimension missing or vague → Escalate for clarification
- **Strong:** 6+ new reusable contracts, +2 maturity, +5 future simplifications

**Cumulative Tracking:** Update `AZMA_CUMULATIVE_CAPABILITY_MATRIX.md` with WP row

**Approver:** Chief Architect (manual review of capability semantics)

---

## Complete Approval Flow

```
WP Submission
     ↓
Gate 1: Local Validation (Build)
  ├─ PASS → Continue
  └─ FAIL → Return to developer, do not proceed
     ↓
Gate 2: ASP Review (Chief Architect)
  ├─ PASS (complexity ↓) → Continue
  ├─ NEUTRAL (complexity →) → Escalate for redesign
  └─ FAIL (complexity ↑) → REJECT, redesign required
     ↓
Gate 3: PKR Validation (Build + Chief Architect)
  ├─ PASS (all prior layers working) → Continue
  └─ FAIL (any regression) → REJECT, fix regressions
     ↓
Gate 4: RCG Review (Chief Architect)
  ├─ PASS (10 dimensions documented) → Continue
  └─ FAIL (missing dimensions) → Escalate for documentation
     ↓
✅ WP APPROVED
     ↓
- Update Cumulative Capability Matrix
- Increment Runtime OS maturity score
- Begin WP+1 planning with PKR baseline established
```

---

## Priority Hierarchy When Gates Conflict

1. **ASP (Simplicity)** overrides all others
   - Even if RCG says "add contracts," if ASP says "too many contracts," ASP wins
   - Even if PKR says "backward compatible," if ASP says "removes 3 contracts," ASP wins

2. **PKR (Regression)** overrides RCG
   - New capability must not break old functionality
   - If RCG and PKR conflict, PKR is blocking

3. **RCG (Capability)** validated by Local Validation
   - Capability must be real (well-documented)
   - Capability must meet quality standards (tests pass)

4. **Local Validation** is foundation
   - Without clean TypeScript/ESLint/Tests, gates 2-4 cannot be evaluated

---

## Success Criteria by WP Phase

### Phase 1: Foundation (WP-001-008)
✅ **COMPLETE**
- Layers 1-3, 6 implemented
- Maturity: 3/10
- Services: 4 | Contracts: 6
- Ready for Phase 2

### Phase 2: Core Runtime (WP-009-015)
⏳ **PENDING** (ASP-first approach)
- Target maturity: 5/10
- Layer 4 (Memory), Layer 5 (Decision)
- Services: ≤12 (not 20+) | Contracts: ≤25 (not 60+)
- Each WP simplifies previous layers if possible

### Phase 3: Intelligence (WP-016-024)
⏳ **PENDING**
- Target maturity: 7/10
- Layers 7-9 (Agents, Observability, Security)
- Services: ≤15 | Contracts: ≤40

### Phase 4: Extended (WP-025-035)
⏳ **PENDING**
- Target maturity: 8/10
- Layer 10 begins (Chambers, Infrastructure)

### Phase 5: Sovereignty (WP-036-045)
⏳ **PENDING**
- Target maturity: 9/10

### Phase 6: Completion (WP-046-048)
⏳ **PENDING**
- Target maturity: 10/10
- Services: ≤15 (locked) | Contracts: ≤50 (locked)

---

## Decision Rule: The ASP Supremacy Principle

**When choosing architecture:**

| Choice | ASP Priority |
|--------|---|
| Simple solution vs. Complex solution (same guarantees) | Simple wins ALWAYS |
| 5 contracts vs. 2 contracts (same capability) | 2 contracts wins |
| New layer vs. extend existing layer | Extend if possible |
| Generic service vs. focused service | Focused wins (simpler to understand) |
| Add feature vs. consolidate existing logic | Consolidate wins |

**Permanent Rule:** If simpler architecture achieves same constitutional guarantees, simpler is constitutionally preferred.

---

## Escalation Path

If WP fails a gate:

1. **Gate 1 (Local Validation):** Fix code, run tests again
2. **Gate 2 (ASP):** Redesign with simpler architecture, resubmit
3. **Gate 3 (PKR):** Fix regressions, retest all prior layers
4. **Gate 4 (RCG):** Document missing capability dimensions, clarify impact

**Do NOT merge code until all four gates PASS.**

---

## Reporting Template

Every WP completion report includes:

```markdown
# WP-XXX Approval Report

## Local Validation
- TypeScript Strict: ✅ PASS (0 errors)
- ESLint: ✅ PASS (0 warnings)
- Tests: ✅ PASS (N/N tests)

## ASP (Architectural Simplicity)
- Verdict: ✅ PASS / ❌ FAIL
- Complexity trend: ↑ / → / ↓
- Score: 10/10 dimensions
- [Details per dimension]

## PKR (Regression Testing)
- Verdict: ✅ PASS / ❌ FAIL
- All prior WP tests: ✅ PASS
- Latency: +X% (target <5%)
- [10-point checklist results]

## RCG (Capability Growth)
- Verdict: ✅ PASS / ❌ FAIL
- New Capability: [Description]
- New Contracts: N added, M eliminated
- Maturity: 3/10 → 4/10 (+1)
- [10-dimension documentation]

## Executive Summary
[2-3 sentences on capability + simplicity impact]

**APPROVAL STATUS:** ✅ APPROVED FOR MERGE
```

---

## Chief Architect Authority

This framework is established by Chief Architect directive and cannot be modified without explicit new authorization.

All Work Packages WP-009 through WP-048 are subject to these four gates.

**Objective:** By WP-048, AZMA Runtime OS achieves:
- ✅ Maturity 10/10
- ✅ 40+ distinct capabilities
- ✅ ≤15 service classes (3x fewer than naive approach)
- ✅ ≤50 contracts (2x fewer than naive approach)
- ✅ McCabe complexity ≤3.0 (simplified)
- ✅ Architectural clarity at maximum
- ✅ Cognitive complexity minimized

**Success = Maximum Capability, Minimum Complexity**
