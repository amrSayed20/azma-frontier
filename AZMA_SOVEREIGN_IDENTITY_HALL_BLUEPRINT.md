# AZMA OS — Phase 10 Architectural Blueprint
# The Sovereign Identity Hall

STATUS: AWAITING CHIEF ARCHITECT APPROVAL
NO CODE IN THIS PHASE — ARCHITECTURE ONLY

========================================================
0. NAMING DISAMBIGUATION
========================================================

Two distinct concepts share the word "Identity" in AZMA OS and must never be
conflated:

- **Sovereign Identity** (`src/core/sovereign-identity/`) — the existing
  Amendment II subsystem: `FounderIdentityService`, `FounderSessionService`,
  `SovereignAuthorityService`. This is the *credential and authority engine*.
  It already exists and is not modified by this blueprint.

- **Sovereign Identity Hall** (this document) — a new Layer 1 experience
  that *consumes* the Sovereign Identity subsystem as its authentication
  backend, but is itself the living, conversational threshold the user
  walks through before that backend is ever invoked. The Hall is UX/runtime
  architecture; Sovereign Identity is auth/authority architecture.

========================================================
1. COMPLETE CONSTITUTIONAL ARCHITECTURE
========================================================

**Layer designation:** Layer 1 — The Threshold (Sovereign Identity Hall).

Layer numbers 1, 5, and 6 are unclaimed in the current kernel
(L2 SOB, L3 Scheduling, L4 Memory, L7 Agent Society, L8 Sovereign
Intelligence, L9 Sovereign Command, L10 Peripheral Adapters). Layer 1 is
constitutionally correct for the Hall: it is the first thing a user
encounters, and architecturally it sits *outside* the executive kernel —
it does not schedule, does not execute agents, does not hold platform
authority. It only welcomes, listens, remembers, and opens the door.

**The Ten Articles of the Sovereign Identity Hall:**

- **Article I — First Living Experience.** The Hall is the platform's
  first heartbeat. No chamber, page, or form may precede it in a user's
  journey.

- **Article II — Conversation Precedes Form.** No structured input field
  may be presented before the platform has held a conversation with the
  user. Authentication data is collected as the *byproduct* of dialogue,
  never as its prerequisite.

- **Article III — Memory Is Continuity, Not Storage.** Every fact the Hall
  learns is held in service of *recognition* on return, not in service of
  analytics. Memory writes must always be traceable to a future welcome.

- **Article IV — Voice Is a First-Class Citizen.** Voice input and output
  are architectural primitives of the Hall, available in every journey,
  never bolted on as an optional widget.

- **Article V — One Personality, Many Voices.** AZMA OS has exactly one
  personality (calm, wise, respectful, professional, confident). Language,
  dialect, and register adapt; identity never does.

- **Article VI — The Companion Is Never Intrusive.** Silence is a valid,
  intentional companion state. The companion must be able to say nothing
  and that absence must be understood as respect, not malfunction.

- **Article VII — Universal Inheritance.** Every chamber (present and
  future) inherits the Hall's living interaction model via the
  `ChamberCompanionContract` (§10). No chamber may present itself as bare
  software.

- **Article VIII — Founder Precedence.** Founder recognition is attempted
  before generic user recognition. The Founder is never made to perform
  the First-Time User intake.

- **Article IX — Visual Continuity.** The Hall is permanently bound to the
  Sovereign Visual Constitution: black, gold, depth, silence, luxury,
  confidence, cinematic lighting, living motion. No conventional SaaS
  affordances (no generic modal stacks, no default browser form chrome).

- **Article X — Silence Is a Valid State.** The absence of motion, sound,
  or prompt is itself a designed state (`SILENT_WAITING`, §8), not an
  error or a loading condition.

========================================================
2. EXPERIENCE BLUEPRINT
========================================================

The Hall is composed of four conceptual surfaces (presentation-layer
detail deferred to implementation phase; named here only to anchor the
service architecture):

1. **The Sovereign Stage** — the cinematic environment the user arrives
   into (ambient, not interactive).
2. **The Companion Presence** — the living point of contact (visual +
   voice + text).
3. **The Conversational Surface** — where dialogue and any necessary
   structured confirmation happen.
4. **The Threshold Gate** — the moment authentication completes and the
   user crosses into AZMA OS proper.

**Backing services (architecture, not implementation):**

| Service | Responsibility |
|---|---|
| `IdentityHallOrchestrator` | Owns the Hall state machine (§8); sequences every other service. |
| `CompanionPersonalityService` | Single personality definition; tone-adaptation function that changes register, never identity. |
| `LanguageSovereigntyService` | Detects language, dialect, and communication style from the first inputs; reuses the domain-classification pattern already proven in L8 (`KnowledgeDomainClassifier`). |
| `ConversationalIntakeService` | Runs the First Conversation (§4); produces a `UserIntentProfile` (language, style, creative goals, experience level, intent) instead of a submitted form. |
| `MemoryContinuityService` | Reads/writes Hall-scoped state to L4 under a new constitutional article `sovereign-identity-hall`; answers "have we met this person/session before, and where did they leave off." |
| `VoiceInteractionGateway` | Provider-agnostic STT/TTS extension point, modeled on L8's `SourceManager` pattern — voice providers are swappable without touching the Hall's state machine. |
| `ThresholdAuthenticationBridge` | Thin adapter over the existing Sovereign Identity subsystem (`FounderIdentityService`, `FounderSessionService`, `SovereignAuthorityService`). The Hall never reimplements auth; it only sequences when auth is invoked. |
| `HallEventPublisher` | Publishes every Hall lifecycle moment onto the L2 Sovereign Operations Bus (§9) so the rest of the OS — and the Living Companion elsewhere in the platform — can react. |

None of these services hold platform authority. `ThresholdAuthenticationBridge`
is the only point of contact with anything that can grant access; every
other service is purely conversational/perceptual.

========================================================
3. FOUNDER JOURNEY
========================================================

1. **Arrival** — Sovereign Stage ignites. Companion awakens silently
   (Article X) — no interrogation, no "please log in."
2. **Silent Recognition** — `ThresholdAuthenticationBridge` performs a
   non-intrusive Founder credential check in parallel with the Stage
   animation (mirrors the existing `FounderIdentityService` SHA-256
   challenge). This never blocks the cinematic — recognition either
   completes before the user would notice a delay, or falls through to
   the First-Time/Returning branch.
3. **Founder Greeting** — If recognized: the companion's tone shifts to
   its most direct, least-onboarding register (Article V — same
   personality, different register). No `ConversationalIntakeService` run
   is required; the Founder is already known.
4. **Session Establishment** — `FounderSessionService.createSession('FOUNDER')`
   is invoked via the bridge; `SovereignAuthorityService` becomes available
   for any subsequent strategic action the Founder takes.
5. **Chronicle Entry** — A Founder-arrival entry is written to the Empire
   Chronicle (existing `EmpireChronicleService`, article
   `imperial-memory-timeline`) — the Hall does not duplicate this
   capability, it triggers it.
6. **Direct Threshold Crossing** — The Founder is offered immediate entry
   to the Sovereign Command Center (L9), bypassing general chamber
   selection, since the Founder's relationship to the Empire is
   executive, not exploratory.

========================================================
4. FIRST-TIME USER JOURNEY
========================================================

1. **Arrival** — Stage ignites; companion awakens and introduces itself
   by name ("I am AZMA") — never as "the app," "the assistant," or "the
   system."
2. **Opening Conversation** — `ConversationalIntakeService` begins. This
   is dialogue, not a wizard. Across natural exchanges it gathers:
   - preferred language and communication register (via
     `LanguageSovereigntyService`)
   - creative goals
   - experience level
   - intent (what the user is here to build)
3. **Reflection** — The companion reflects its understanding back to the
   user in one sentence ("I understand you...") before proceeding. This
   is the constitutional checkpoint that proves Article II was honored —
   the user is never asked to fill a field the companion couldn't have
   already inferred from the conversation.
4. **Authentication, Folded In** — Only now does `ThresholdAuthenticationBridge`
   engage, framed conversationally ("Let's make this yours") rather than
   as a separate gate. The underlying mechanism is unchanged — real
   credential creation — only its presentation is conversational.
5. **Threshold Crossing** — The companion recommends a first chamber based
   on the stated intent (e.g., research-leaning intent → Hujjah
   Al-Damighah; production-leaning intent → Qiyamah). This is a
   *recommendation* passed as a signal to the Chamber Loader, not a hard
   routing rule (§10).
6. **Memory Seed** — `MemoryContinuityService` writes the `UserIntentProfile`
   and an Empire-entry Chronicle record. This is the first fact the
   platform will use to recognize the user on Journey 5.

========================================================
5. RETURNING USER JOURNEY
========================================================

1. **Recognition** — session or credential match resolves immediately;
   no Stage delay is introduced for this check.
2. **Continuity Recall** — `MemoryContinuityService` retrieves: last
   chamber visited, unfinished work reference, preferred language/style
   from the prior `UserIntentProfile`.
3. **Organic Welcome** — The companion's greeting is generated from the
   recalled continuity, not a generic template ("Welcome back" plus a
   specific, true reference to where the user left off). A welcome that
   could apply to any user is a constitutional violation of Article III.
4. **No Re-Intake** — `ConversationalIntakeService` does **not** run again
   unless the user explicitly asks to update their profile. Asking a
   returning user the First-Time questions is treated as the platform
   forgetting them, which Article III forbids.
5. **Resume Offer** — Companion offers to resume the unfinished journey or
   begin something new; either choice is honored without friction.
6. **Threshold Crossing** — Routes directly back into the prior context
   (same chamber, same in-progress state) when "resume" is chosen.

========================================================
6. VOICE INTERACTION JOURNEY
========================================================

- Voice is **offered**, never **forced**, at Arrival (Article IV: a
  first-class citizen of the architecture, not of every individual
  session).
- If accepted: `VoiceInteractionGateway` handles STT for all
  `ConversationalIntakeService` exchanges; companion responses are
  optionally rendered as TTS using the single calm/wise voice profile
  defined in `CompanionPersonalityService`.
- If declined or unavailable: the identical state machine (§8) runs over
  text. Voice is a *modality switch* on one experience, never a forked
  experience — this is what makes voice architectural rather than
  decorative.
- **Silence handling:** pauses in user speech are not auto-timed-out
  aggressively. The Hall distinguishes "user is thinking" from "user is
  done," consistent with Article X — the companion does not fill silence
  reflexively.
- **Provider abstraction:** `VoiceInteractionGateway` is an extension
  point (same shape as L8's `SovereignBusBackend`/`SourceManager`
  patterns already in the codebase) so STT/TTS vendors can change without
  touching Hall state logic.

========================================================
7. LIVING COMPANION ARCHITECTURE
========================================================

The Companion is **not Hall-scoped**. It is a cross-cutting presence that
the Hall instantiates first but that persists through the entire
platform. Its architecture:

- **`CompanionPersonalityService`** — single source of truth for tone,
  vocabulary register, and pacing. Exposes a pure function
  `adapt(register, language) → VoiceProfile` that never mutates the
  underlying personality, only its expression.
- **`CompanionPresenceContract`** — the interface every chamber adapter
  must expose touchpoints for: `welcome()`, `guide()`, `explain()`,
  `celebrate()`, `warn()`, `encourage()`, `staySilent()`. This is the
  formalization of Article VII.
- **`CompanionMemoryBridge`** — the Companion never holds its own
  duplicate state. Every fact it uses is sourced live from L4 Memory and,
  where relevant, L8 Sovereign Intelligence. This prevents the Companion
  from drifting out of sync with the platform's actual constitutional
  memory.
- **`CompanionEventListener`** — subscribes on the L2 Sovereign Operations
  Bus to platform-wide events and turns them into Companion behavior
  without any chamber needing to call the Companion directly:
  - `INCIDENT_DETECTED` → `warn()`
  - `CREATIVE_ASSET_GENERATED` → `celebrate()`
  - `QUEUE_CONGESTED` → `encourage()` (calm reassurance, not alarm)
  - absence of relevant events → `staySilent()` is the default, not an
    edge case
- **Restraint Doctrine** — an explicit, enumerable rule set (to be
  authored in full during implementation) governing when `staySilent()`
  is the correct response. This doctrine is what operationalizes Article
  VI; "never intrusive" must be a checkable rule set, not a vibe.

This is the architectural reason the Hall and the platform-wide Companion
are described together: the Hall is where the Companion is *born* in a
session, but `CompanionEventListener`'s subscription to L2 is what keeps
it alive in every chamber afterward.

========================================================
8. STATE DIAGRAM
========================================================

```
                     ┌───────────┐
                     │  DORMANT  │  (pre-arrival; nothing rendered)
                     └─────┬─────┘
                           │ user arrives
                     ┌─────▼─────┐
                     │ AWAKENING │  (Stage ignition, Companion awakens)
                     └─────┬─────┘
                           │
                     ┌─────▼─────┐
                     │ GREETING  │
                     └─────┬─────┘
                           │
                    ┌──────▼───────┐
                    │ RECOGNIZING  │  (silent: Founder / Returning / New)
                    └──┬────┬───┬──┘
           Founder ────┘    │   └──── New User
                              │ Returning
        ┌─────────────┐      │      ┌─────────────┐
        │ FOUNDER_     │      │      │ CONVERSING  │  (Intake, §4)
        │ RECOGNIZED   │      │      └──────┬──────┘
        └──────┬───────┘      │             │
               │       ┌──────▼───────┐     │
               │       │ CONTINUITY_  │     │
               │       │ RESTORED     │     │
               │       └──────┬───────┘     │
               │              │      ┌──────▼───────┐
               │              │      │UNDERSTANDING │  (reflection/confirm)
               │              │      └──────┬───────┘
               │              │             │
               └──────┬───────┴─────────────┘
                       │
                ┌──────▼───────┐
                │AUTHENTICATING│  (ThresholdAuthenticationBridge)
                └──────┬───────┘
                       │
              ┌────────▼─────────┐
              │ THRESHOLD_       │
              │ CROSSING         │  (recommend/resume chamber)
              └────────┬─────────┘
                       │
                 ┌─────▼─────┐
                 │ DEPARTED  │  (Hall closes; chamber opens)
                 └───────────┘

   Parallel / orthogonal states (overlay on any state above):
     VOICE_LISTENING  ──┐
     VOICE_SPEAKING   ──┼── modality states, not a separate journey
     SILENT_WAITING   ──┘   (Article X — explicit, not a timeout artifact)
     ERROR_RECOVERY        (calm, non-alarming; companion never panics)
```

========================================================
9. RUNTIME INTEGRATION
========================================================

**Contract surface.** A new `SovereignIdentityHallContract` is added to
`AzmaOsRuntimeContract` as `identityHall`, alongside the existing
`sovereignBus`, `kernelLayer3`, `kernelLayer4`, `agentSociety`,
`sovereignIntelligence`, `sovereignCommand`, `sovereignIdentity`,
`chamberIntegration`.

**Dependency graph.** The Hall depends on:
- **L2 Sovereign Operations Bus** — for `HallEventPublisher` and for
  `CompanionEventListener`'s platform-wide subscriptions.
- **L4 Memory** — for `MemoryContinuityService` (continuity) and a new
  constitutional article `sovereign-identity-hall` (profile/continuity
  records, distinct from `imperial-memory-timeline`).
- **L8 Sovereign Intelligence** — `LanguageSovereigntyService` reuses the
  existing domain-classification pattern; no new intelligence layer is
  introduced.
- **Sovereign Identity subsystem** — `ThresholdAuthenticationBridge` wraps
  `FounderIdentityService`, `FounderSessionService`,
  `SovereignAuthorityService` unmodified.

The Hall explicitly does **not** depend on L9 Sovereign Command directly —
there is no executive coupling. L9 only learns of Hall activity by
subscribing to L2 events, preserving the existing rule that no chamber
owns Sovereign Command.

**Construction order.** Despite being "first" to the user, the Hall is
constructed *last* in `initializeAzmaOs()`, after L2–L10 and Sovereign
Identity exist — it is a consumer of every other layer, never a
prerequisite for them. This mirrors how the four existing chamber
adapters are already constructed after their dependencies.

**New Bus event types required (implementation-phase addition to
`SovereignEventType`, not introduced by this document):**
`HALL_ENTERED`, `HALL_INTAKE_COMPLETED`, `HALL_LANGUAGE_DETECTED`,
`HALL_RETURNING_USER_RECOGNIZED`, `HALL_THRESHOLD_CROSSED`,
`COMPANION_SPOKE`, `COMPANION_SILENT`.

**New constitutional article required:** `sovereign-identity-hall`, added
to the `ConstitutionArticleId` union before any `MemoryContinuityService`
code can compile.

========================================================
10. CHAMBER INTEGRATION STRATEGY
========================================================

- The Hall is **not** a fifth production chamber. It precedes the four
  existing chambers (`hujjah-al-damighah`, `qiyamah-chamber`, `ras-al-amr`,
  `sovereign-high-council`) in every user journey and is not listed in
  `AZMA_OS_CHAMBER_MANIFESTS`.
- **`ChamberCompanionContract`** (formalized in §7) is the inheritance
  mechanism required by Article VII. Each `ChamberAdapter` will need to
  expose Companion touchpoints so the living interaction model continues
  past the Hall.
- **Migration note:** retrofitting the four existing chamber adapters to
  implement `ChamberCompanionContract` is explicitly **out of scope for
  Phase 10 implementation** and is flagged as a Phase 11 candidate. Phase
  10 implementation only needs to prove the contract shape, not retrofit
  every adapter.
- **Threshold routing.** The Hall does not replace `ChamberLoader` /
  `runtime.communicate()` routing. `THRESHOLD_CROSSING` passes an intent
  signal (from `UserIntentProfile` or resume continuity) that *informs*
  which chamber is suggested first; it never bypasses or duplicates
  existing chamber activation logic.

========================================================
SUCCESS CRITERIA (RESTATED AS ARCHITECTURAL ACCEPTANCE TESTS)
========================================================

Implementation will not be considered complete unless each of the
following is mechanically true, not just visually true:

1. No form field is rendered before `ConversationalIntakeService` has
   produced at least one reflected understanding (Article II).
2. A returning user's greeting string is provably derived from their
   stored `UserIntentProfile` / continuity record, not a static template
   (Article III).
3. `VoiceInteractionGateway` can be exercised with voice declined and
   produce an identical state sequence to voice accepted (Article IV).
4. `CompanionPersonalityService.adapt()` changes register/language output
   while the underlying personality identifier never changes (Article V).
5. `staySilent()` is a reachable, tested state — not merely the absence
   of a call (Article VI, X).
6. The Founder journey never invokes `ConversationalIntakeService`
   (Article VIII).

========================================================
END OF BLUEPRINT — AWAITING CHIEF ARCHITECT APPROVAL
========================================================
