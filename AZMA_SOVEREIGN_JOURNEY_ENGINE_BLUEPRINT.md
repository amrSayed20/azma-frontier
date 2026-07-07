# AZMA OS — Phase 10 Architectural Blueprint
# The Sovereign Journey Engine

STATUS: REVISED — AWAITING CHIEF ARCHITECT IMPLEMENTATION AUTHORIZATION
REVISION: Constitutional verification pass applied (2026-07-01)
NO CODE IN THIS PHASE — ARCHITECTURE ONLY

========================================================
0. CONSTITUTIONAL POSITION
========================================================

The Sovereign Journey Engine (SJE) is a permanent sovereign platform
asset. It is not a chamber, not the Sovereign Identity Hall, not a UI
component, not a tutorial, and not an onboarding wizard. It is the
constitutional runtime engine responsible for all living narrative
journeys across the entire lifetime of every user's relationship with
AZMA OS — not only the first one.

The SJE is **not onboarding infrastructure**. Onboarding is the first
journey it runs. The engine itself is a general-purpose platform runtime
that can host any `JourneyDefinition` — from first arrival through
milestone celebration, feature discovery, re-engagement, and Founder-
authored experiences. The First Journey is the canonical default
definition, not the architectural boundary.

The SJE owns the *orchestration* of the first living experience. The
Sovereign Identity Hall (Phase 10.a, designed separately) is the first
*surface* through which users encounter that experience. When the Hall
is implemented, it will delegate to the SJE's runtime contracts for all
journey orchestration. The SJE is the engine; the Hall is the door.

This distinction is architecturally enforced:
- The SJE has no knowledge of any UI surface.
- The SJE never directly presents anything.
- All presentation is delegated to a `JourneyExperienceAdapter`
  extension point (§7).

========================================================
1. LAYER ASSIGNMENT
========================================================

**Layer 5 — Sovereign Journey Engine (The First Story)**

Existing kernel numbering: L2 (SOB), L3 (Scheduling), L4 (Memory),
L7 (Agent Society), L8 (Sovereign Intelligence), L9 (Sovereign Command),
L10 (Peripheral Adapters). Unclaimed: L1, L5, L6.

L1 is reserved for the Sovereign Identity Hall (The Threshold), per
Phase 10.a blueprint. L5 is the correct assignment for the SJE:

- It is not a channel into the OS (L1 role).
- It is not a kernel primitive (L3, L4).
- It does not run agents or schedule work (L3, L7).
- It does not hold platform authority or executive command (L9).
- It is the first sovereign *narrative* layer — the layer that turns
  a new arrival into a citizen — and it logically follows the
  identity/threshold layers and precedes the vertical chambers (L10).

**Factory:** `createSovereignJourneyEngine(deps) → SovereignJourneyEngineContract`

**Contract identity:**
```
layerName:   'SovereignJourneyEngine'
version:     '1.0.0'
layerNumber: 5
```

**New field on `AzmaOsRuntimeContract`:**
```typescript
readonly sovereignJourney: SovereignJourneyEngineContract;
```

**New constitutional article** (addition to `ConstitutionArticleId` union,
required before any L4 persistence compiles):
```
'sovereign-journey-engine'
```

========================================================
2. RUNTIME CONTRACTS
========================================================

──────────────────────────────────────────────────────
2.1  JourneyChapterId (immutable ordered sequence)
──────────────────────────────────────────────────────

```typescript
export type JourneyChapterId =
  | 'IDEA'
  | 'KNOWLEDGE'
  | 'CREATION'
  | 'STORAGE'
  | 'PRODUCTION'
  | 'PUBLISHING'
  | 'GROWTH';

// Constitutional invariant: this order is immutable.
// No runtime may reorder it. No chamber may own it.
export const SOVEREIGN_CHAPTER_SEQUENCE: readonly JourneyChapterId[] = [
  'IDEA', 'KNOWLEDGE', 'CREATION', 'STORAGE',
  'PRODUCTION', 'PUBLISHING', 'GROWTH',
] as const;
```

──────────────────────────────────────────────────────
2.2  JourneyChapter
──────────────────────────────────────────────────────

```typescript
export interface JourneyChapter {
  readonly chapterId:      JourneyChapterId;
  readonly narrativeTitle: string;     // "The Library", "The Studio", etc.
  readonly narrativeSummary: string;   // emotional description, not feature list
  readonly chamberHint:    string | null; // e.g. 'hujjah-al-damighah' — hint only
  readonly emotionalGoal:  string;     // what the user should FEEL, not learn
}
```

`chamberHint` is a *suggestion* published as a Bus event; the SJE never
imports chamber code or calls chamber services directly. This is how
Article 12 of the Constitution of Chamber Creation is respected: if a
chapter maps to no existing chamber (`null`), the journey continues.

The seven canonical chapters:

| # | Chapter ID | Narrative Title | Chamber Hint | Emotional Goal |
|---|---|---|---|---|
| 1 | `IDEA` | The Spark | `null` | kindle wonder, no product yet |
| 2 | `KNOWLEDGE` | The Library | `hujjah-al-damighah` | confidence through discovery |
| 3 | `CREATION` | The Studio | `qiyamah-chamber` | feel creative power |
| 4 | `STORAGE` | The Vault | `sovereign-vault` | feel secure and organized |
| 5 | `PRODUCTION` | The Arena | `ras-al-amr` | feel capability and agency |
| 6 | `PUBLISHING` | The Gate | `null` | feel ready to share |
| 7 | `GROWTH` | The Council | `sovereign-high-council` | feel part of a living empire |

──────────────────────────────────────────────────────
2.3  JourneyPhase (state machine values)
──────────────────────────────────────────────────────

```typescript
export type JourneyPhase =
  | 'NOT_STARTED'        // no record exists for this session
  | 'WELCOMED'           // first greeting delivered; intake not yet run
  | 'INTAKE_COMPLETE'    // first conversation done; UserIntentProfile sealed
  | 'CHAPTER_ACTIVE'     // user is inside a chapter narrative
  | 'CHAPTER_COMPLETE'   // chapter ended; awaiting advance or skip
  | 'JOURNEY_PAUSED'     // user left; record persisted; resumable
  | 'JOURNEY_RESUMED'    // back from pause; continues from last chapter
  | 'JOURNEY_COMPLETE'   // all seven chapters reached terminal state
  | 'JOURNEY_SKIPPED';   // user declined the journey; profile still saved
```

──────────────────────────────────────────────────────
2.4  UserIntentProfile
──────────────────────────────────────────────────────

```typescript
export interface UserIntentProfile {
  readonly profileId:          string;
  readonly language:           string;   // BCP-47, e.g. 'ar', 'en', 'fr'
  readonly dialect:            string | null;  // e.g. 'Egyptian Arabic'
  readonly communicationStyle: 'terse' | 'descriptive' | 'conversational' | 'formal';
  readonly creativeGoals:      readonly string[];
  readonly experienceLevel:    'explorer' | 'practitioner' | 'expert';
  readonly intent:             string;   // free-form summary from intake conversation
  readonly collectedAt:        Date;
}
```

──────────────────────────────────────────────────────
2.5  JourneyTypeId and JourneyDefinition
──────────────────────────────────────────────────────

```typescript
// Extensible by registration. 'FIRST_JOURNEY' is always present.
export type JourneyTypeId = 'FIRST_JOURNEY' | string;

export interface JourneyDefinition {
  readonly journeyTypeId:   JourneyTypeId;
  readonly journeyTypeName: string;
  readonly description:     string;       // emotional purpose, not feature list
  readonly chapterSequence: readonly JourneyChapterId[];
  readonly isRepeatable:    boolean;      // may this user take this journey more than once?
  readonly requiresIntake:  boolean;      // some journeys may skip the intake conversation
}

// The constitutional default — always registered; may not be deregistered.
export const FIRST_JOURNEY_DEFINITION: JourneyDefinition = {
  journeyTypeId:   'FIRST_JOURNEY',
  journeyTypeName: 'The First Journey',
  description:     'Transforms a first-time visitor into a confident citizen of the Empire.',
  chapterSequence: SOVEREIGN_CHAPTER_SEQUENCE,
  isRepeatable:    false,
  requiresIntake:  true,
} as const;
```

`JourneyDefinition` is the mechanism that makes the SJE a platform
runtime rather than an onboarding script. Any future journey type —
milestone celebration, feature discovery, re-engagement, enterprise
orientation, Founder-authored experience — is registered as a new
`JourneyDefinition`. The engine's state machine, L4 persistence, Bus
events, and Companion orchestration work identically for all definitions.
Only the `chapterSequence` and behavioral flags differ.

──────────────────────────────────────────────────────
2.6  JourneyRecord (the persisted runtime state)
──────────────────────────────────────────────────────

```typescript
export interface JourneyRecord {
  readonly journeyId:          string;
  readonly sessionId:          string;
  readonly journeyTypeId:      JourneyTypeId;   // which definition this record runs
  readonly phase:              JourneyPhase;
  readonly currentChapterId:   JourneyChapterId | null;
  readonly completedChapters:  readonly JourneyChapterId[];
  readonly skippedChapters:    readonly JourneyChapterId[];
  readonly userIntentProfile:  UserIntentProfile | null;   // null until INTAKE_COMPLETE
  readonly startedAt:          Date | null;
  readonly lastActivityAt:     Date | null;
  readonly completedAt:        Date | null;
}
```

A single user may hold **multiple** `JourneyRecord`s over their
lifetime — one per journey type attempted. Terminal state
(`JOURNEY_COMPLETE`, `JOURNEY_SKIPPED`) applies to **the record**, not
to the user. A user who completed `FIRST_JOURNEY` remains a valid input
to `beginJourney()` for any other registered journey type.

──────────────────────────────────────────────────────
2.7  SovereignJourneyEngineContract (full public surface)
──────────────────────────────────────────────────────

```typescript
export interface SovereignJourneyEngineContract {
  readonly layerName:   'SovereignJourneyEngine';
  readonly version:     '1.0.0';
  readonly layerNumber: 5;

  // ── Journey type registry ──────────────────────────────────────────────
  // FIRST_JOURNEY_DEFINITION is always pre-registered and cannot be removed.
  registerJourneyDefinition(definition: JourneyDefinition): void;
  getJourneyDefinition(journeyTypeId: JourneyTypeId): JourneyDefinition;
  listJourneyDefinitions(): readonly JourneyDefinition[];
  // Returns definitions available to this session (registered + not yet
  // completed if non-repeatable, or always available if repeatable).
  listAvailableJourneys(sessionId: string): readonly JourneyDefinition[];

  // ── Journey lifecycle ──────────────────────────────────────────────────
  // journeyTypeId defaults to 'FIRST_JOURNEY' when omitted.
  beginJourney(sessionId: string, journeyTypeId?: JourneyTypeId): JourneyRecord;
  sealIntakeProfile(sessionId: string, profile: UserIntentProfile): JourneyRecord;
  // advanceChapter() accepts NO user data. Advancement is an act of the
  // platform, never an act of user form submission. This is permanent.
  advanceChapter(sessionId: string): JourneyRecord;
  skipChapter(sessionId: string): JourneyRecord;
  pauseJourney(sessionId: string): JourneyRecord;
  resumeJourney(sessionId: string): JourneyRecord;
  completeJourney(sessionId: string): JourneyRecord;
  skipEntireJourney(sessionId: string): JourneyRecord;

  // ── Journey read (active journey) ─────────────────────────────────────
  // Returns the active (non-terminal) JourneyRecord for this session, or
  // null if no journey is currently in progress.
  getJourney(sessionId: string): JourneyRecord | null;
  getCurrentChapter(sessionId: string): JourneyChapter | null;

  // ── Journey history (lifetime reuse) ──────────────────────────────────
  // Returns every JourneyRecord this session has ever produced, including
  // terminal ones. A session is never "spent" — it is simply between journeys.
  getAllJourneys(sessionId: string): readonly JourneyRecord[];
  getCompletedJourneys(sessionId: string): readonly JourneyRecord[];

  // ── Chapter catalogue (definition-aware) ──────────────────────────────
  getChapter(chapterId: JourneyChapterId): JourneyChapter;
  getChapters(journeyTypeId?: JourneyTypeId): readonly JourneyChapter[];

  // ── Profile ────────────────────────────────────────────────────────────
  getUserIntentProfile(sessionId: string): UserIntentProfile | null;
  updateUserIntentProfile(
    sessionId: string,
    updates: Partial<Omit<UserIntentProfile, 'profileId' | 'collectedAt'>>
  ): JourneyRecord;

  // ── Analytics (read-only bridge; does not call L9 services directly) ──
  getJourneyMetrics(): JourneyMetrics;

  // ── Stats ──────────────────────────────────────────────────────────────
  getStats(): SovereignJourneyStats;
}

export interface JourneyMetrics {
  readonly totalStarted:    number;
  readonly totalCompleted:  number;
  readonly totalSkipped:    number;
  readonly totalPaused:     number;
  readonly completionRate:  number;  // 0–1
  readonly lastUpdated:     Date;
}

export interface SovereignJourneyStats {
  readonly activeJourneys:    number;
  readonly completedJourneys: number;
  readonly pausedJourneys:    number;
  readonly skippedJourneys:   number;
  readonly totalSessions:     number;
}
```

========================================================
3. INTERNAL SERVICES (architecture — not yet implementation)
========================================================

| Service | Single Responsibility |
|---|---|
| `JourneyDefinitionRegistry` | Stores all registered `JourneyDefinition` values; always contains `FIRST_JOURNEY_DEFINITION`; validates definitions on registration; answers `listAvailableJourneys()` by cross-referencing session history. |
| `JourneyStateManager` | Owns the `JourneyRecord` state machine; enforces valid transitions; throws on invalid advances; consults the active `JourneyDefinition` for its `chapterSequence` rather than assuming 7 chapters. |
| `JourneyNarrativeService` | Produces `JourneyChapter` objects for any registered definition's sequence; never imports chamber code; consults `JourneyDefinitionRegistry` for chapter lists. |
| `JourneyProgressService` | Reads and writes `JourneyRecord` to L4 Memory under article `sovereign-journey-engine`; the only component that touches L4 directly. |
| `JourneyAdaptationEngine` | Applies `UserIntentProfile` (language, level, style) to any narrative output; delegates to L8 `KnowledgeDomainClassifier` pattern for language inference; produces adapted `JourneyChapter` variant. |
| `JourneyCompanionOrchestrator` | Translates `JourneyPhase` transitions into Companion instructions (`welcome()`, `explain()`, `celebrate()`, `encourage()`, `staySilent()`); is the single point of contact between the SJE and the Living Companion. |
| `JourneyBusPublisher` | Publishes every SJE lifecycle event to L2 Sovereign Operations Bus; the only component that holds the bus reference; all other services are bus-unaware. |
| `JourneyConversationalGateway` | The "first dialogue" runtime contract: drives the intake conversation that produces `UserIntentProfile`; never touches a form field; delegates channel (text/voice) to the active `JourneyExperienceAdapter`. |
| `JourneyExperienceRouter` | Selects and validates the active `JourneyExperienceAdapter`; defaults to `DefaultConversationalAdapter` when no adapter is registered. |

No service holds more than one of the above responsibilities. If a
service name spans two rows, the design has violated Article 12 of the
Chamber Constitution and must be split.

========================================================
4. STATE MODEL
========================================================

```
                    ┌─────────────┐
                    │ NOT_STARTED │  (no record)
                    └──────┬──────┘
                           │ beginJourney()
                    ┌──────▼──────┐
                    │  WELCOMED   │  (greeting delivered)
                    └──────┬──────┘
                           │ sealIntakeProfile()
                    ┌──────▼──────────┐
                    │ INTAKE_COMPLETE │  (UserIntentProfile sealed)
                    └──────┬──────────┘
                           │ advanceChapter()   [enters IDEA]
                    ┌──────▼──────┐
               ┌────┤CHAPTER_ACTIVE├────┐
               │    └──────┬──────┘    │
               │           │           │ skipChapter()
               │    advanceChapter()   │
               │    ┌──────▼──────┐    │ pauseJourney()
               │    │ CHAPTER_    │    │      │
               │    │  COMPLETE   │    │      ▼
               │    └──────┬──────┘    │ ┌──────────────┐
               │           │ advanceChapter() │ JOURNEY_PAUSED│
               │           │ (next chapter)   └──────┬───────┘
               │           │           │             │ resumeJourney()
               └─ (loop for each chapter) ───────────┘
                           │
                    after GROWTH completes
                           │ completeJourney()
                    ┌──────▼──────────┐
                    │ JOURNEY_COMPLETE │  (terminal — never revisited)
                    └─────────────────┘

   From any non-terminal state:
     skipEntireJourney() → JOURNEY_SKIPPED  (terminal for this record only)

   JOURNEY_RESUMED re-enters CHAPTER_ACTIVE at lastChapterId.

   IMPORTANT: terminal state applies to the JourneyRecord, not to the user.
   After JOURNEY_COMPLETE or JOURNEY_SKIPPED on journeyTypeId 'FIRST_JOURNEY',
   the same sessionId may immediately call beginJourney(sessionId, 'OTHER_TYPE')
   and receive a fresh JourneyRecord. The engine never considers a user "done."
```

**Valid transition table** (enforced by `JourneyStateManager`):

| From | Allowed transitions |
|---|---|
| `NOT_STARTED` | `WELCOMED` |
| `WELCOMED` | `INTAKE_COMPLETE` |
| `INTAKE_COMPLETE` | `CHAPTER_ACTIVE` (IDEA), `JOURNEY_SKIPPED` |
| `CHAPTER_ACTIVE` | `CHAPTER_COMPLETE`, `JOURNEY_PAUSED`, `JOURNEY_SKIPPED` |
| `CHAPTER_COMPLETE` | `CHAPTER_ACTIVE` (next), `JOURNEY_COMPLETE` (after GROWTH), `JOURNEY_PAUSED`, `JOURNEY_SKIPPED` |
| `JOURNEY_PAUSED` | `JOURNEY_RESUMED` |
| `JOURNEY_RESUMED` | `CHAPTER_ACTIVE` |
| `JOURNEY_COMPLETE` | *(none — terminal)* |
| `JOURNEY_SKIPPED` | *(none — terminal)* |

Any transition not listed above throws `JourneyStateTransitionError`.

========================================================
5. JOURNEY LIFECYCLE (end-to-end narrative sequence)
========================================================

The complete lifecycle through all 7 chapters, from runtime's perspective:

```
beginJourney(sessionId)
  → phase: WELCOMED
  → Bus: JOURNEY_STARTED published
  → Companion: welcome()

sealIntakeProfile(sessionId, profile)
  → phase: INTAKE_COMPLETE
  → Profile persisted to L4 under 'sovereign-journey-engine'
  → Bus: USER_INTENT_PROFILED published
  → JourneyAdaptationEngine activates (adapts all subsequent output)

advanceChapter(sessionId)  [× 7, once per chapter]
  → phase: CHAPTER_ACTIVE (chapterId = IDEA → KNOWLEDGE → … → GROWTH)
  → Bus: JOURNEY_CHAPTER_ENTERED published (with chamberHint if present)
  → Companion: explain()
  → JourneyAdaptationEngine: returns adapted JourneyChapter for current language/level

  ... [chapter interaction, driven by JourneyExperienceAdapter — SJE does not know what happens]

advanceChapter(sessionId)  [chapter complete]
  → phase: CHAPTER_COMPLETE
  → Bus: JOURNEY_CHAPTER_COMPLETED published
  → Companion: celebrate() | encourage() (per chapter emotional goal)

[After GROWTH → CHAPTER_COMPLETE]:
completeJourney(sessionId)
  → phase: JOURNEY_COMPLETE
  → Bus: JOURNEY_COMPLETED published
  → Companion: celebrate() [empire citizenship granted]
  → L4 chronicle entry via Bus event (L9 EmpireChronicleService subscribes — no direct call)
```

**Pause/Resume lifecycle:**
```
pauseJourney(sessionId)
  → phase: JOURNEY_PAUSED
  → currentChapterId preserved
  → Bus: JOURNEY_PAUSED published
  → Companion: staySilent() [or brief farewell — per adapter]

resumeJourney(sessionId)
  → phase: JOURNEY_RESUMED → immediately CHAPTER_ACTIVE (same chapter)
  → Bus: JOURNEY_RESUMED published
  → Companion: welcome() [continuation greeting, not re-introduction]
  → No re-intake; UserIntentProfile unchanged unless updateUserIntentProfile() called
```

**Skip lifecycle:**
```
skipChapter(sessionId)
  → phase: CHAPTER_COMPLETE (chapter ID added to skippedChapters)
  → Bus: JOURNEY_CHAPTER_SKIPPED published
  → immediately transitions to next chapter if sequence not exhausted

skipEntireJourney(sessionId)
  → phase: JOURNEY_SKIPPED
  → Bus: JOURNEY_ABANDONED published
  → UserIntentProfile (if already sealed) is preserved — user not forgotten
```

========================================================
6. COMPANION INTEGRATION
========================================================

The Living Companion is never called directly by most SJE services.
`JourneyCompanionOrchestrator` is the single gateway:

```typescript
export interface CompanionInstruction {
  readonly action:  'welcome' | 'explain' | 'celebrate' | 'encourage' | 'warn' | 'staySilent';
  readonly context: JourneyCompanionContext;
}

export interface JourneyCompanionContext {
  readonly phase:          JourneyPhase;
  readonly chapter:        JourneyChapter | null;
  readonly profile:        UserIntentProfile | null;
  readonly isReturn:       boolean;
}
```

`JourneyCompanionOrchestrator.instruct(sessionId): CompanionInstruction` is
called by `JourneyStateManager` after every valid state transition. This
produces a typed instruction that the active `JourneyExperienceAdapter`
passes to the Living Companion's `CompanionPresenceContract` (defined in
the Identity Hall / Phase 10.a blueprint).

The SJE **never imports** `CompanionPersonalityService` directly. It only
produces `CompanionInstruction` values. The adapter decides how to
translate those into companion behavior. This preserves the rule (Article
4, Constitution of Chamber Creation): the Companion belongs to AZMA OS,
never to a service or a chamber.

========================================================
7. EXTENSION POINTS
========================================================

`JourneyExperienceAdapter` is the single stable extension point for all
future onboarding modalities. All variants listed by the Sovereign Decree
plug in through this one interface. None require changes to the SJE core.

```typescript
export interface JourneyExperienceAdapter {
  readonly adapterId:   string;
  readonly adapterType: JourneyAdapterType;

  // Called by JourneyExperienceRouter at each narrative moment.
  // The adapter decides how to surface the moment (voice, cinematic,
  // text, AR — the SJE does not know and does not care).
  presentWelcome(context: JourneyCompanionContext): Promise<void>;
  presentChapter(chapter: JourneyChapter, context: JourneyCompanionContext): Promise<void>;
  presentChapterComplete(chapter: JourneyChapter, context: JourneyCompanionContext): Promise<void>;
  presentCompletion(record: JourneyRecord): Promise<void>;
  presentPause(record: JourneyRecord): Promise<void>;
  presentResume(record: JourneyRecord): Promise<void>;
}

export type JourneyAdapterType =
  | 'default'            // text conversational (ships with SJE)
  | 'voice'              // voice-first (future: VoiceInteractionGateway)
  | 'cinematic'          // interactive cinematic (future)
  | 'ar-vr'             // spatial computing (future)
  | 'founder-template'   // Founder-authored custom onboarding (future)
  | 'enterprise'         // org-level onboarding (future)
  | 'team'               // team/collaborative onboarding (future)
  | 'accessibility'      // screen-reader / motor-accessibility (future)
  | 'children'           // simplified register (future)
  | 'premium';           // premium curated experience (future)
```

The **DefaultConversationalAdapter** ships with Phase 10 implementation.
Every other `adapterType` is architecturally registered; implementation is
future-phased. The `JourneyExperienceRouter` can validate that a registered
adapter is well-formed (implements the full interface) without knowing what
it does at runtime.

========================================================
8. SOVEREIGN OPERATIONS BUS EVENTS
========================================================

The following new event types must be added to `SovereignEventType` and
`SovereignEventPayloadMap` in `sovereign-bus-events.ts` during
implementation (not in this architectural document):

| Event Type | Publisher | Key Payload Fields |
|---|---|---|
| `JOURNEY_STARTED` | `JourneyBusPublisher` | sessionId, journeyId |
| `JOURNEY_CHAPTER_ENTERED` | `JourneyBusPublisher` | sessionId, chapterId, chamberHint |
| `JOURNEY_CHAPTER_COMPLETED` | `JourneyBusPublisher` | sessionId, chapterId |
| `JOURNEY_CHAPTER_SKIPPED` | `JourneyBusPublisher` | sessionId, chapterId |
| `JOURNEY_PAUSED` | `JourneyBusPublisher` | sessionId, chapterId (current) |
| `JOURNEY_RESUMED` | `JourneyBusPublisher` | sessionId, chapterId (resumed at) |
| `JOURNEY_COMPLETED` | `JourneyBusPublisher` | sessionId, journeyId, durationMs |
| `JOURNEY_ABANDONED` | `JourneyBusPublisher` | sessionId, lastPhase |
| `USER_INTENT_PROFILED` | `JourneyBusPublisher` | sessionId, language, experienceLevel, intent |

**L9 analytics integration** is realized entirely through Bus subscriptions.
`EmpireChronicleService` (and any future L9 analytics service) subscribes
to `JOURNEY_COMPLETED` and `USER_INTENT_PROFILED` on L2. No SJE service
ever calls an L9 service directly. This preserves the existing
architecture rule: no layer below L9 depends on L9; L9 observes the bus.

**Companion receives** `JOURNEY_CHAPTER_ENTERED` (→ `explain()`) and
`JOURNEY_CHAPTER_COMPLETED` (→ `celebrate()` or `encourage()`) via
`CompanionEventListener`'s existing L2 subscription. The SJE does not
send instructions to the Companion over the bus — that is the
`JourneyCompanionOrchestrator`'s synchronous, in-process responsibility.
Bus events serve the rest of the platform; direct orchestrator calls serve
the active session's companion experience.

========================================================
9. MEMORY INTEGRATION
========================================================

`JourneyProgressService` is the sole component that reads/writes L4.

**Article:** `sovereign-journey-engine` (new — must be added to
`ConstitutionArticleId` union before implementation).

**Write operations:**

| Trigger | L4 operation | Article |
|---|---|---|
| `sealIntakeProfile()` | `constitutionalMemoryService.remember(UserIntentProfile)` | `sovereign-journey-engine` |
| `pauseJourney()` | `constitutionalMemoryService.remember(JourneyRecord snapshot)` | `sovereign-journey-engine` |
| `completeJourney()` | `constitutionalMemoryService.remember(completion record)` | `sovereign-journey-engine` |
| `skipEntireJourney()` | `constitutionalMemoryService.remember(profile + skip record)` | `sovereign-journey-engine` |

`stateCacheService` is used for in-session hot reads of `JourneyRecord`
(cache-first, L4 constitutional memory as durable backing store, consistent
with the pattern established in existing L4 consumers).

**Read operations:**

| Trigger | L4 operation |
|---|---|
| `getJourney(sessionId)` | cache lookup → `constitutionalMemoryService.recallByArticle('sovereign-journey-engine')` if cache miss |
| `resumeJourney(sessionId)` | as above; ensures continuity survives session restart |

**Returning user recognition:** `JourneyProgressService.getJourney()` is
the canonical check — if a `JourneyRecord` exists with a non-`NOT_STARTED`
phase, the user is a returning user. The Sovereign Identity Hall (when
built) calls this as its first act after authentication to decide whether
to present a first-time or returning welcome.

========================================================
10. RUNTIME BOOTSTRAP INTEGRATION
========================================================

The SJE is added to `initializeAzmaOs()` as **Step 14** (after all
existing steps, since it depends on L2, L4, L8, and Sovereign Identity):

```
Step  0: L2 Sovereign Operations Bus
Step  1: L3 Scheduling Kernel
Step  2: L4 Memory Layer
Step  3: L7 Agent Society
Step  4: L8 Sovereign Intelligence
Step  5: L10 Chamber Integration
Step  6: L10 Peripheral Adapters
Step  7: L9 Sovereign Command
Step  8: Sovereign Identity (Amendment II)
Steps 9–13: Chamber registration, loading, activation, Bus events
Step 14: L5 Sovereign Journey Engine  ← new
```

**Dependencies passed to `createSovereignJourneyEngine(deps)`:**
```typescript
{
  sovereignBus:           SovereignBusContract,       // L2
  memoryLayer:            MemoryLayerContract,         // L4
  sovereignIntelligence:  IntelligenceRuntimeContract, // L8
  defaultAdapter?:        JourneyExperienceAdapter,    // optional override
}
```

L9 (`sovereignCommand`) is **not** passed as a constructor dependency —
the SJE observes L9 analytics through the Bus, not through direct import.

**AzmaOsRuntimeContract addition:**
```typescript
readonly sovereignJourney: SovereignJourneyEngineContract;  // Layer 5
```

========================================================
11. FUTURE SCALABILITY
========================================================

**Multi-language narrative expansion.** `JourneyNarrativeService` returns
chapter narratives as a `JourneyChapterContent` value object (title,
summary, emotionalGoal) that is always run through `JourneyAdaptationEngine`
before delivery. Adding a new language requires only an adaptation
provider, not changes to the chapter sequence or the SJE core.

**Founder-authored templates.** The `founder-template` adapter type
allows a Founder (using L9 Sovereign Command authority) to publish a
custom `JourneyExperienceAdapter` at runtime. This requires a future
`JourneyAdapterRegistry` service that accepts registered adapters and
makes them selectable per-session. The registry is an extension of
`JourneyExperienceRouter` — no SJE core changes required.

**Enterprise/team onboarding.** A `JourneySessionScope` property
on `JourneyRecord` distinguishes `individual` from `team` and
`enterprise`. Multi-user journeys (team onboarding) are future
implementations of `JourneyExperienceAdapter`; the `JourneyRecord`
structure supports a `scope` field without migration.

**Voice-first onboarding.** The `VoiceInteractionGateway` (Phase 10.a
Identity Hall architecture) becomes the backing channel for the `voice`
adapter type. No SJE changes are required — the voice adapter wraps
the gateway and implements `JourneyExperienceAdapter`. The SJE's
`presentChapter()` call is identical regardless of whether the channel
is text or voice.

**AR/VR.** Same adapter pattern. The SJE contract is stable; the spatial
adapter handles the spatial rendering. The 7-chapter sequence and state
machine are unchanged.

========================================================
12. TESTING STRATEGY
========================================================

**Unit tests per service:**
- `JourneyStateManager`: every valid transition succeeds; every invalid
  transition throws `JourneyStateTransitionError`.
- `JourneyNarrativeService`: `SOVEREIGN_CHAPTER_SEQUENCE` is exactly 7
  chapters in exactly the specified order; no chapter is missing or
  duplicated; each chapter has a non-null `narrativeTitle` and
  `emotionalGoal`.
- `JourneyProgressService`: write → L4 remember; read-back via
  `recallByArticle('sovereign-journey-engine')` returns equal record;
  cache-first reads do not hit L4 on second call.
- `JourneyAdaptationEngine`: for each `experienceLevel × language` pair,
  output changes but chapter order does not.
- `JourneyBusPublisher`: after every lifecycle call, the correct Bus
  event type is published exactly once; event payload contains sessionId.

**Integration tests (full lifecycle):**
- `beginJourney → sealIntakeProfile → [advanceChapter × 7] → completeJourney`
  — phase sequence matches `SOVEREIGN_CHAPTER_SEQUENCE`; `JourneyComplete`
  Bus event fires; L4 record is terminal.
- **Pause/resume round-trip:** begin → advance 3 chapters → pause →
  simulate new process start (cold read from L4) → resume → verify
  `currentChapterId` is the same chapter as before pause; no data lost.
- **Skip chapter:** advance to CREATION → skip → verify CREATION in
  `skippedChapters`; `currentChapterId` advances to STORAGE.
- **Skip entire journey:** in CHAPTER_ACTIVE → `skipEntireJourney()` →
  `JOURNEY_SKIPPED`; `UserIntentProfile` (if sealed) is still readable.
- **Profile update propagation:** seal profile → update `language` →
  verify `JourneyAdaptationEngine` uses updated language on next chapter
  output.

**Constitutional invariant tests:**
- `SOVEREIGN_CHAPTER_SEQUENCE.length === 7`.
- Chapters appear in exactly this order: IDEA, KNOWLEDGE, CREATION,
  STORAGE, PRODUCTION, PUBLISHING, GROWTH — no substitution.
- A completed chapter may never re-enter `CHAPTER_ACTIVE`.
- `JourneyRecord` with phase `JOURNEY_COMPLETE` cannot be transitioned
  by any method.
- `JourneyBusPublisher` is the only SJE component that calls
  `sovereignBus.publish()`; no other SJE service holds a bus reference.
- `JourneyProgressService` is the only SJE component that calls L4
  services; no other SJE service holds an L4 reference.

**Extension-point conformance test:**
- Any registered `JourneyExperienceAdapter` must implement all six
  `present*()` methods; an adapter missing any method is rejected by
  `JourneyExperienceRouter` with `JourneyAdapterConformanceError`.

========================================================
13. CONSTITUTIONAL INVARIANTS
========================================================

These are permanent laws. Violations are architectural failures, not bugs.

1. **Sequence immutability.** The seven-chapter sequence is fixed in
   source code as `as const`. No runtime, Founder, adapter, or future
   developer may reorder, insert, or remove chapters without a formal
   Chief Architect Constitutional Amendment.

2. **Terminal state finality.** `JOURNEY_COMPLETE` and `JOURNEY_SKIPPED`
   are terminal phases. No method may transition out of them.
   `JourneyStateManager` throws on any such attempt.

3. **L4 durability.** Every `JourneyRecord` in a non-`NOT_STARTED` phase
   must be persisted to L4 before the calling method returns. In-memory
   state may not be the only copy once the journey has begun.

4. **L9 read-only coupling.** The SJE publishes to L2; L9 observes via
   L2. No SJE service may import or call any L9 service. The SJE
   `getJourneyMetrics()` method reads from its own internal counters, not
   from L9.

5. **Chamber isolation.** No `JourneyChapter.chamberHint` causes a direct
   service call or import of chamber code. Chamber hints are informational
   values published in Bus events; they do not create architectural
   coupling.

6. **Companion indirection.** The SJE may never call
   `CompanionPersonalityService`, `CompanionPresenceContract`, or any
   companion service directly except through
   `JourneyCompanionOrchestrator`. One gateway, one contract.

7. **Profile immutability after sealing.** Once `sealIntakeProfile()` is
   called, `collectedAt` and `profileId` may never be changed.
   `updateUserIntentProfile()` may update language, style, goals, and
   level, but not provenance fields.

8. **Adapter isolation.** The `JourneyExperienceAdapter` interface is a
   pure async boundary. The SJE core is synchronous in its state machine
   logic; async surface is exposed only through the adapter interface.
   The SJE never `await`s anything except adapter calls and L4 writes.

9. **Silence is a state, not an absence.** `JourneyCompanionOrchestrator`
   must always produce a `CompanionInstruction`, including when the
   correct instruction is `staySilent`. No code path may produce a
   `void` companion outcome by accident.

10. **Single bus publisher.** `JourneyBusPublisher` is the only reference
    to `SovereignBusContract` inside the SJE module. This is enforced at
    architecture review time by confirming that no other internal service
    file imports from `sovereign-bus`.

11. **Platform runtime, not onboarding script.** The SJE hosts any
    registered `JourneyDefinition`. `FIRST_JOURNEY_DEFINITION` is the
    canonical default, not the architectural ceiling. Future journey types
    (milestone, re-engagement, feature discovery, Founder-authored,
    enterprise) require zero changes to the engine core — only a new
    `JourneyDefinition` registered via `registerJourneyDefinition()`.
    Any implementation that makes the engine structurally incapable of
    hosting a second journey type is an architectural violation.

12. **Multiple journey types through one runtime.** The `JourneyDefinition`
    abstraction is the sole mechanism for introducing new journey types.
    `JourneyAdapterType` variants govern *how* a journey is presented;
    `JourneyDefinition` governs *what* the journey is. These are
    independent axes. A voice adapter running a milestone journey is a
    valid combination; the engine supports all combinations without
    modification.

13. **Advancement is never form-gated.** `advanceChapter(sessionId)`
    accepts exactly one argument: `sessionId`. This signature is
    permanent. It may never be extended with form data, validation tokens,
    user input confirmations, or any argument that would make chapter
    advancement contingent on user submission. What happens *within* a
    chapter is entirely owned by the `JourneyExperienceAdapter`. The SJE
    tracks only chapter entry and exit — never chapter content. This is
    the architectural guarantee that the engine can never degrade into a
    linear wizard at the implementation level.

14. **Terminal state applies to a record, not to a user.** A `JourneyRecord`
    in `JOURNEY_COMPLETE` or `JOURNEY_SKIPPED` is permanently sealed.
    The *user* (sessionId) is never sealed. `getAllJourneys(sessionId)`
    always returns the full history; `listAvailableJourneys(sessionId)`
    always returns what is available next. A user who has completed every
    registered journey on the day it is called may begin a new journey
    the day a new definition is registered. The SJE serves every user
    for the complete lifetime of the platform, not only until first
    journey completion.

========================================================
14. CONSTITUTIONAL VERIFICATION REPORT
========================================================

Verification date: 2026-07-01
Requested by: Chief Architect Conditional Approval Decision
Performed against: Original blueprint (pre-revision)

| # | Invariant | Original Status | Action Taken |
|---|---|---|---|
| 1 | Reusable platform runtime, not merely onboarding | ❌ MISSING | Added §2.5 JourneyDefinition; updated §2.7 contract; updated §3 JourneyDefinitionRegistry; added Constitutional Invariant 11 |
| 2 | Independent from all chambers | ✅ PASS | No change required |
| 3 | Companion is external, never owned | ✅ PASS | No change required |
| 4 | Multiple journey types through one runtime | ❌ MISSING | Added JourneyTypeId + JourneyDefinition abstraction; updated contract with registerJourneyDefinition(), listAvailableJourneys(), getAllJourneys(); added Constitutional Invariant 12 |
| 5 | Voice-first is a first-class extension point | ✅ PASS | No change required |
| 6 | Platform personality belongs to AZMA OS | ✅ PASS | No change required |
| 7 | Never degrade into linear wizard | ⚠️ PARTIAL | Added explicit no-data-argument rule to advanceChapter() docstring in contract; added Constitutional Invariant 13 |
| 8 | Reusable throughout complete lifetime of user | ❌ MISSING | Added getAllJourneys() + getCompletedJourneys() to contract; clarified terminal state in §4; added Constitutional Invariant 14 |

Post-revision status: All 8 invariants now explicitly guaranteed.
Blueprint is ready for Chief Architect implementation authorization.

========================================================
END OF BLUEPRINT — REVISED 2026-07-01
========================================================
