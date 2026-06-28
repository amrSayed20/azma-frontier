# WP-006 Constitutional Rationale Linkage
## Pre-Implementation Pipeline: Steps 1-4

---

## STEP 1: Functional Specification

### Objective
Enable every policy decision trace (WP-004) to be linked to the constitutional article(s) and rationale that justified the decision. Provide queryable, immutable records of decision-to-constitution mapping for audit, agent learning, and memory preservation.

### Scope Boundaries
- **Included:** Linking recorded policy decisions to articles; storing decision rationale; enabling queries by article
- **Excluded:** Constitutional amendment; article reinterpretation; policy rule creation (WP-003)

### Inputs
- `PolicyDecisionTrace` (WP-004): Complete decision record with reasons and authority context
- `ConstitutionArticleId` (WP-001 types): Valid constitutional article reference
- Rationale text: Human-readable or structured explanation linking decision to article

### Outputs
- `ConstitutionalRationaleLink`: Immutable record linking decision → article(s) → rationale
- Query results: Decisions grouped by article, article-to-decisions mapping
- Audit trail: Rationale linkage itself is audited (via WP-005 correlationId)

### Key Responsibilities
1. Accept linkage requests (decision trace + article + rationale)
2. Validate article exists and is constitutional
3. Store linkage immutably in audit backbone (WP-005) via AuditEventMetadata.correlationId
4. Enable queries: by article, by decision trace, by rationale text
5. Preserve constitutional context: article definition, rationale, decision, reasoning chain
6. Support agent society: allow decisions to be grouped/analyzed by constitutional basis

### Integration Points
- **Upstream:** WP-004 (decision traces), WP-001 (articles), ConstitutionRuntime
- **Downstream:** WP-005 (audit storage), agents (rationale retrieval), WP-044 (traceability validation)
- **Consumer APIs:** Query by article ID, retrieve rationale for decision, list decisions by article

---

## STEP 2: Architectural Forecast

### Future Work Package Integration

| WP | Feature | WP-006 Dependency | Integration Pattern |
|----|---------|-------------------|-------------------|
| **WP-007** | Admission Control | Query decisions by article → rule enforcement history | "Which decisions were approved under Article X?" |
| **WP-008** | Dispatch/Priority | Tag decisions with article → prioritize by constitutional weight | Route based on article urgency level |
| **WP-009** | Canonical State | Rationale becomes state transition justification | Every state change linked to constitutional basis |
| **WP-011** | Runtime Telemetry | Tag telemetry events with article source | Categorize metrics by constitutional domain |
| **WP-012** | Alerts | Alert rationale tied to article violation | "Alert triggered due to Article X breach" |
| **WP-013-020** | Lifecycle Events | Lifecycle events inherit article linkage from decision | Request lifecycle traces article through all stages |
| **WP-021-032** | Decision Routing | Decision flow references article precedents | "Route to handler that approved similar Article X decisions" |
| **WP-044** | Traceability | Validate rationale is present for every approved decision | Constitutional completeness validation |
| **WP-048** | Recovery | Restore rationale when recovering from failure | Preserve why decision was made during rollback |

### Reusability Patterns Enabled
1. **Article-Scoped Query**: Any future WP can query "all decisions under Article X"
2. **Rationale Chaining**: Link decisions to predecessor decisions under same article
3. **Pattern Analysis**: Sovereign agents can learn "decisions under Article Y tend toward action Z"
4. **Conformance Proof**: Demonstrate decisions cluster properly around constitutional principles

### Non-Speculative Future Patterns
- Decisions can be analyzed for consistency within same article
- Rationale enables blame assignment: "Who made this decision and why?"
- Agents learn article-specific decision patterns without explicit training
- Traceability creates audit trail matching decision to constitution (no gaps)

---

## STEP 3: Agent Readiness Review

### Agent Society Consumers & Usage Patterns

#### 1. **Sovereign Agents** (Decision Execution Layer)
**Need:** Understand constitutional basis for approved/denied decisions
**Usage:**
- "Show me decisions made under Article X to learn the pattern"
- "Why was decision D approved? What article justified it?"
- "Which articles do I need to understand to handle this decision type?"

**WP-006 Requirement:** Decision-to-rationale mapping must be immediately queryable, not buried in logs
**Contract:** `DecisionRationaleRecord` with `articleId`, `rationale`, `decision`, `timestamp`

#### 2. **Orchestrators** (Workflow Coordination)
**Need:** Understand which decisions belong to which constitutional domains
**Usage:**
- "Route this request to the orchestrator that handles Article X decisions"
- "What's the precedent for Article X decisions in this scenario?"
- "Has anyone ever approved a similar decision under Article X?"

**WP-006 Requirement:** Fast lookup of decisions by article; grouping/aggregation
**Contract:** `queryDecisionsByArticle(articleId)` → `PolicyDecisionTrace[]` with rationale populated

#### 3. **Human Approval Flows** (Manual Gate Operations)
**Need:** Clear rationale chain showing why automation approved/denied
**Usage:**
- "Approve this exception. Here's the Article X precedent I'm overriding"
- "Review: automation denied this under Article X. Rationale: {text}"
- "Historical approvals under Article X: {list}"

**WP-006 Requirement:** Rationale must be human-readable and traceable
**Contract:** Rationale text must be structured for human parsing; precedent retrieval must be fast

#### 4. **Memory Systems** (Long-term Learning)
**Need:** Preserve not just decisions but WHY they were made
**Usage:**
- "Store this decision and its constitutional rationale permanently"
- "When we encounter similar scenarios, what rationale was used before?"
- "What constitutional principles are most frequently invoked?"

**WP-006 Requirement:** Rationale linkage must survive across system lifetime
**Contract:** `AuditedRationaleLink` immutable via WP-005; correlationId ensures preservation

#### 5. **Decision Systems** (Learning & Pattern Recognition)
**Need:** Aggregate decisions by article to find patterns
**Usage:**
- "Decisions under Article X show preference for outcome Z"
- "Historical pattern: Article Y decisions rarely happen together with Article Z"
- "This decision seems inconsistent with Article X precedents"

**WP-006 Requirement:** Bulk access to decisions grouped by article for analysis
**Contract:** `queryDecisionsByArticleRange(articleId, timeStart, timeEnd)` → paginated results

#### 6. **Future Sovereign Intelligence Layer**
**Need:** Understand constitutional coherence of decision-making
**Usage:**
- "Are we drifting from Article X principles?"
- "Which articles are under-represented in recent decisions?"
- "Decision entropy: are we consistent within each article?"

**WP-006 Requirement:** Statistical access to article-decision distributions
**Contract:** `getArticleDecisionStatistics(articleId)` → counts, patterns, anomalies

### Recommended Agent-Facing API Contract

```typescript
/**
 * Retrieve rationale linking a decision to constitutional basis.
 * Used by: Sovereign Agents, Human Approvers, Memory Systems
 */
interface DecisionRationaleRecord {
  readonly decisionId: string;
  readonly articleId: ConstitutionArticleId;
  readonly articleNumber: number;
  readonly articleTitle: string;
  readonly rationale: string;  // Human-readable
  readonly decisionTraceId: string;
  readonly linkedAt: number;
  readonly linkedBy: string;  // Actor who created linkage
}

/**
 * Query decisions by constitutional article.
 * Used by: Orchestrators, Decision Systems, Intelligence Layer
 */
interface DecisionQueryByArticle {
  articleId: ConstitutionArticleId;
  timeRange?: { start: number; end: number };
  limit?: number;
  orderBy?: 'timestamp' | 'approval-rate' | 'precedence';
}

/**
 * Get statistics on decisions within article scope.
 * Used by: Decision Systems, Intelligence Layer
 */
interface ArticleDecisionStatistics {
  articleId: ConstitutionArticleId;
  totalDecisions: number;
  approvalRate: number;  // 0-1
  uniqueRationales: string[];
  frequentPatterns: DecisionPattern[];
  inconsistencies: DecisionInconsistency[];
}
```

---

## STEP 4: Architecture Optimization

### Minimal Reusable Contracts (No Speculative Features)

Identified during Agent Readiness Review:

1. **DecisionRationaleRecord** (Export for agent consumption)
   - `decisionId`: Link to WP-004 trace
   - `articleId`: Link to WP-001 article
   - `rationale`: Structured text
   - `linkedAt`, `linkedBy`: Audit fields
   - **Justification:** Agents universally need this tuple

2. **ArticleDecisionIndex** (Internal, enables queries)
   - Map: `articleId` → `Set<decisionId>`
   - Enables O(1) lookup: "what decisions apply to Article X"
   - **Justification:** All downstream WPs need fast article-scoped queries

3. **RationaleValidator** (Ensure constitutional coherence)
   - Validates: article exists, rationale is non-empty, decision trace exists
   - Prevents: orphaned linkages, invalid articles, broken chains
   - **Justification:** Audit integrity prerequisite

4. **DecisionArticleQueryInterface** (Exported for downstream)
   - `queryByArticle(articleId)` → `DecisionRationaleRecord[]`
   - `queryByArticleRange(articleId, timeStart, timeEnd)` → paginated
   - `getArticleStats(articleId)` → decision statistics
   - **Justification:** Every downstream WP needs article-scoped queries

### Design Principles (Agent-Ready)

1. **Fast Article Lookup:** Agents can't wait for full trace scans
   - Pre-index by article ID
   - Enable O(1) article → decisions
   
2. **Rationale Clarity:** Humans read and rely on rationale text
   - Validate rationale non-empty and meaningful
   - Store rationale readable by non-technical reviewers
   
3. **Immutable Linkage:** Once created, rationale-decision link cannot change
   - Stored in WP-005 audit backbone
   - Preserved across all agent scenarios
   
4. **Upstream Consistency:** Respect WP-001 authority, WP-004 trace structure
   - Use existing correlationId mechanism (WP-005)
   - Don't duplicate authority validation
   
5. **Downstream Preparedness:** Enable WP-007+ without rework
   - Expose ArticleDecisionIndex publicly
   - QueryInterface becomes standard pattern
   - Statistics become derivable

### Implementation Constraints (Scope-Preserving)

- No new error types beyond WP-005 existing types
- Rationale validation uses WP-001 article registry (no article creation)
- All storage via WP-005 audit backbone (no new persistence layer)
- No decision replay/modification (WP-004 traces immutable)
- No agent decision-making logic (that's WP-021+)

### Architectural Decisions

1. **Rationale Storage:** WP-005 audit backbone with `correlationId` pointing to article
   - Reason: Immutability, audit trail, no new infrastructure
   - Alternative rejected: Separate rationale database (violates runtime-first, adds storage layer)

2. **Article Indexing:** In-memory Map<articleId, Set<decisionId>>
   - Reason: Fast agent queries, small memory footprint
   - Alternative rejected: Database queries (adds latency, violates responsive runtime)

3. **Rationale Format:** Structured text (not free-form, not binary)
   - Reason: Human-readable, agent-parseable, searchable
   - Alternative rejected: Templates (over-constrains human rationale)

4. **Query Model:** Article-centric (group by article, not by decision properties)
   - Reason: Matches agent mental model, enables pattern analysis
   - Alternative rejected: Decision-centric (agents don't think that way)

---

## Pre-Implementation Summary

### Step 1 Completion ✅
Functional scope: Accept policy decision + constitutional article + rationale → link immutably → enable queries by article

### Step 2 Completion ✅
Forecast: 9 downstream WPs identified; 3 reusability patterns enabled; no speculative features

### Step 3 Completion ✅
Agent Review: 6 consumer types identified; 4 reusable runtime contracts defined; no over-engineering

### Step 4 Completion ✅
Optimization: 4 minimal contracts identified; 5 design principles established; 4 architectural decisions locked

### Ready for Implementation ✅
All pre-implementation steps complete. Scope is bounded. Agents are prepared. Downstream integration paths clear.

---

**Document Status:** Complete & Ready for Steps 5-16 Execution
