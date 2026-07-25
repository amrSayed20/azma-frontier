# AZMA OS — Constitutional System-Wide Architectural Inventory

**Imperial Construction Audit — 2026-07-25**
**Status: Official baseline. Evidence-only. No assumptions, no estimations, no inferred implementations.**

Method: 7 parallel read-only research passes (one per major subsystem) plus a live Playwright pass across every real route (anonymous and as a freshly-created, real authenticated Creator account), plus direct source cross-checks. Every claim below traces to a specific file/line or a directly observed runtime behavior. Where a claim could not be verified, it is marked **UNKNOWN**, not assumed true or false.

---

## Executive Summary

AZMA OS is not one thing — it is **two platforms occupying the same repository**:

1. **A real, working creative-SaaS core**: real email/password authentication (scrypt + server sessions), real Stripe billing, real SQLite persistence, and one genuinely complete, end-to-end feature — Qiyamah Chamber's image generation (prompt → real OpenAI call → persisted asset → gated by real auth + real billing → real gallery). This is the strongest, most defensible part of the platform.
2. **An extensive "constitutional" architecture layer** — roughly 60+ `src/` modules describing the platform in the language of a Sovereign Body, a Living Empire, organs, chambers, consciousness, and constitutional law. About half of this layer is **real code that genuinely executes on every page load** (a self-contained internal signal-processing loop — heartbeat, reception→will→decision→execution→actuation — that produces no Creator-visible output). The other half is **confirmed dead code** — real TypeScript, often unit-tested and self-certified, with zero reachable callers from any route a Creator can actually visit.

The five "Chambers" (Qiyamah, Ras Al Amr, Makman Al Ghayah, Hujjah Al-Damighah, Sovereign Vault Palace) all have real, polished, working **user interfaces**. Only Qiyamah's is backed by a genuinely real, non-simulated operation end to end. The other four each have at least one core operation that looks and behaves like a real system but is, on direct inspection, local React state, a `setTimeout`, a bare `alert()`, or (in Hujjah's case) a real code path returning synthetic, templated data. This is disclosed precisely, chamber by chamber, in Section I.

Three additional defects were found through direct testing that were not previously on record anywhere in the codebase's own self-documentation:
- `/sovereign-member`'s login/register/recovery forms are **entirely decorative** — a function called `forceNavigateToVault` ignores every field and grants access regardless of input.
- `/sovereign-vault`'s five chamber-selector cards are real (`onClick` + `router.push`) but **have no keyboard or ARIA accessibility** — a mouse-only interaction with zero semantic markup.
- `/api/auth/logout` is fully real and correct but **has no UI trigger anywhere in the built application** — a Creator currently cannot log out through any button.

This document also corrects one of this session's own prior claims: a comment added to `src/design-system/direction.ts` during the "Ras Al Amr Chamber Reconstruction" package stated that Ras Al Amr↔Makman was "the only two real, live-reachable edges touching Ras Al Amr." Independent tracing during this audit found that claim incomplete — `app/sovereign-vault-palace/page.tsx` (3 buttons) and `app/hujjah-al-damighah/page.tsx` (1 button) also navigate live into `/ras-amr`, none of which has a `SCENE_TRANSITIONS` entry. Recorded as a gap in Section XII, not silently corrected.

---

## I. Construction Inventory

### I.1 — The five Chambers

| Chamber | Real page | Real backend | State |
|---|---|---|---|
| **Qiyamah Chamber** | `app/qiyamah-chamber/page.tsx`, `QiyamahChamberClient.tsx` | `src/qiyamah-generation/` (real OpenAI `gpt-image-1` call, real SQLite persistence, real local-disk asset storage), `app/api/qiyamah/{generate,generations}/route.ts` (real auth 401 + real billing 402 gating, both DB-backed) | **COMPLETE** — the one fully real, end-to-end operational Chamber in the platform |
| **Hujjah Al-Damighah** | `app/hujjah-al-damighah/page.tsx` (1851 lines), `actions.ts` | `src/chambers/hujjah-al-damighah/` — a real Server Action (`runInvestigation`) calling a real `IntelligenceEngine.investigate()` control-flow, but every data-producing step inside it (`GutenbergProvider.search/fetch`, `EvidenceExtractor.extract`) is explicitly self-labeled "simulated"/"structural baseline" in its own code comments — no real HTTP request is ever made, no real text is ever analyzed | **PARTIALLY IMPLEMENTED** — real orchestration, synthetic data, always ~85% confidence regardless of query |
| **Ras Al Amr** | `app/ras-amr/page.tsx` | One real backend capability exists (`POST /api/sovereign/entry/ras-al-amr/compile`, via SOEL) but is **not called from the page** — the page makes zero `fetch`/API calls; "Master Render," "smart/manual mode," and "Vault summoning" are local `useState`/`setTimeout` only | **PARTIALLY IMPLEMENTED** — real, polished UI theater over disconnected real infrastructure |
| **Makman Al Ghayah** | `app/makman-al-ghayah/page.tsx` | Two real backend capabilities exist (`POST /api/sovereign/entry/{creator-goal,consumption}`, via SOEL) but are **not called from the page** — zero `fetch` calls; "Release" is a `setTimeout` + bare `alert()`; the "Generate packaging with AI" button has **no handler at all** | **PARTIALLY IMPLEMENTED** — same shape as Ras Al Amr |
| **Sovereign Vault Palace** | `app/sovereign-vault-palace/page.tsx` (909 lines) | `src/vault/sovereign-vault-manager.ts` — a real, unit-tested, SQLite-backed, tenant-isolated asset store — **never imported by this page**. The page implements its own separate, parallel `localStorage`/`sessionStorage`-only data model (`SovereignTreasure`) that shares no code or types with the real Vault | **PARTIALLY IMPLEMENTED** — two disconnected "vaults" coexist in the same codebase under the same name |

### I.2 — Platform-wide shared runtime

| Subsystem | Purpose | State | Real consumers |
|---|---|---|---|
| **Imperial Experience Engine (IXE)** | Lifecycle/reveal/handoff choreography for 6 registered "Experiences" | **PARTIALLY IMPLEMENTED** | All 6 genuinely mounted: `app/page.tsx`, `signup`, `login`, `qiyamah-chamber`, `ras-amr`, `makman-al-ghayah` |
| **Design System — Atmosphere Runtime** | `setAtmosphere()` sets a `data-atmosphere` DOM attribute per Chamber's "emotional register" | **PARTIALLY IMPLEMENTED, functionally inert** | Called on every Gate/Chamber page load, but requires a co-occurring `.azma-chamber` class that is applied **nowhere** in the live codebase — zero CSS anywhere actually renders any visual consequence of any `setAtmosphere()` call today |
| **Design System — ACDE (direction.ts)** | Scene transitions, emotional arcs, per-chamber pacing scores | **PARTIALLY IMPLEMENTED** | `SCENE_TRANSITIONS` genuinely drives `DirectorStage`'s cross-page dissolve (19 entries, several real navigable edges missing — see §XII); `CHAMBER_SCORES`/`chamberPacing` is computed and stored but has **zero readers anywhere in the repository**, including inside `DirectorStage` itself |
| **Imperial Gates** | Registers `landing`/`login`/`signup`/`subscription` as a category distinct from Chambers | **PARTIALLY IMPLEMENTED** | Route resolution (`resolveGateId`) is real and load-bearing in `DirectorStage`; the pacing data (`IMPERIAL_GATE_SCORES`) is authored and tested but never read by anything outside its own tests |
| **Constitutional Navigation** | `ConstitutionalLink` — the one sanctioned internal-navigation component | **PARTIALLY IMPLEMENTED** | Genuinely rendered in `LoginForm.tsx`, `SignupForm.tsx`, `not-found.tsx`, `subscribe/success/page.tsx`; the imperative `useConstitutionalNavigation` hook and the self-certification layer are unconsumed |
| **Presence Engine** (`visitor-presence`) | Real Page Visibility API + idle-timer tracking | **COMPLETE** | Live in all 6 IXE Experiences, and — unlike Atmosphere — its `data-presence` attribute genuinely has matching, working CSS in every Experience's own stylesheet |
| **Imperial Voice** (`LivingCompanion`) | Text/voice companion widget | **COMPLETE for text; PARTIALLY IMPLEMENTED for tone-connected voice** | Mounted on 8 real pages; only 5 of 8 pass a `context` prop that connects real per-chamber TTS rate/pitch (`TONE_PROFILES`) — and even then, only while the Creator has switched to voice mode |
| **DirectorStage** | Platform-wide, mounted on every route (`app/layout.tsx`) | **PARTIALLY IMPLEMENTED** | Genuinely drives real cross-page transition pacing/type on every navigation and fires real Nervous System signals — but does not read `ChamberScore`/`companionDirection` (dead data, see above) to do so |
| **The "Living Body" signal chain** (`sovereign-nervous-system`, `sovereign-heart`, `sovereign-core`, `sovereign-consciousness`, `sovereign-memory`, `sovereign-evolution`, `sovereign-wisdom`, `sovereign-body`, `constitutional-{reception,will,decision,execution,actuation,expression,operations}`) | An internally self-referential "constitutional cognition" loop | **PARTIALLY IMPLEMENTED, genuinely running** | Mounted directly in `app/layout.tsx`; `HeartPulse` fires a real 5-second heartbeat POST to a real API route; `OperationsAwakening` runs a real 5-stage dispatch cycle on every Nervous System signal. Explicitly self-documented as having **no Creator-facing UI, no dashboards, no notifications** — real, running, and observationally invisible to any Creator |
| **Authentication** | Real scrypt + server-side sessions | **COMPLETE** | 9 of 15 API routes; the strongest subsystem in the platform |
| **Billing** | Real Stripe Checkout + webhook | **COMPLETE** (code); Stripe env credentials **UNKNOWN** in any real deployment | `billing/checkout`, `billing/webhook`, gates `qiyamah/generate` |
| **Persistent Storage** | Real `node:sqlite`, 5 tables | **COMPLETE**, single-instance only (disclosed) | auth, billing, qiyamah, vault repositories |
| **Button Engine / Awareness / Manifestation chain** | Resolves which actions a Creator sees | **COMPLETE** (small, fully wired) | `app/page.tsx`, `SubscribeForm.tsx`, `QiyamahChamberClient.tsx` |
| **Creator Language (i18n)** | ar/en dictionary | **COMPLETE** | Nearly every route |
| **Founder Access** | Gates `/sovereign-high-council` | **COMPLETE** | `sovereign-high-council/layout.tsx`, real server-side redirect confirmed live |
| **Install Experience (PWA)** | Install prompt + service worker | **COMPLETE** | Mounted globally |

### I.3 — Confirmed dead subsystems (real code, zero reachable callers from any live route)

`sovereign-capability` (the Capability Diwan), `sovereign-construction` (the debt register itself — a passive, unread document), `first-constitutional-motion`, `constitutional-aggregation`, `constitutional-listening`, `imperial-voice` *(the separate `voice-composer.ts` module, distinct from the live `LivingCompanion` component)*, `imperial-presence`, `creator-presence`, `living-body-integration`, `core/azma-os-runtime`, `core/sovereign-bus`, `core/sovereign-command` (16 "Empire" service files), `core/chamber-integration` (23 files, including all 4 chamber adapters), `orchestrator/fleet-materialization` (real code, unreached from `app/`), `src/sovereign-entry/unbuilt-al-watin-placeholder.ts` (named "unbuilt" by its own author), and the ~90-file "knowledge-*-engine" cluster under `src/chambers/hujjah-al-damighah/` (verdict-engine, confidence-engine, DNA/fingerprinting, dispatch-engine, cross-reference-engine, chronology-engine, workspace/learning subsystems).

Also confirmed dead: the 102-file legacy Qiyamah pipeline (`src/chambers/qiyamah/`) and the ~85-file Ras Al Amr "Living Runtime Core" Packages I–IV (`src/chambers/ras-al-amr/`, minus a small 5-6 file slice that **is** real and reachable via the disconnected `/compile` route) and the ~89-file Makman "GOAL_*"/"MAKMAN_*" cluster (minus a similarly small real-and-reachable-but-page-disconnected slice).

---

## II. Constitutional Responsibility Audit (per Chamber)

| Chamber | Constitutional responsibility (per `CONTEXT_ROLES`) | State |
|---|---|---|
| Sovereign Vault Palace | "It protects" — treasury/safekeeping | **PARTIALLY IMPLEMENTED** — a real backend exists for this exact responsibility (`SovereignVaultManager`) but the Chamber's own UI does not perform it |
| Hujjah Al-Damighah | "It reasons" — investigation/argument | **PARTIALLY IMPLEMENTED** — real reasoning *control flow*, synthetic reasoning *content* |
| Qiyamah Chamber | "It creates" — generative creation | **COMPLETE** |
| Ras Al Amr | "It governs" — direction/orchestration | **DECLARED ONLY** at the operational level — the UI enacts a director's console, but no real directing decision is ever made or persisted |
| Makman Al Ghayah | "It strategizes" — commercial distribution | **DECLARED ONLY** at the operational level — same shape as Ras Al Amr |

No responsibility above is NOT STARTED — every Chamber has at minimum a fully-built, real-feeling UI expressing its responsibility. None is fully COMPLETE except Qiyamah.

---

## III. Operational Responsibility Audit (per Chamber)

### Sovereign Vault Palace
| Responsibility | State |
|---|---|
| Deposit/store an asset | PARTIALLY IMPLEMENTED (`localStorage` only; real `depositAsset()` exists, unreached) |
| Read vault contents | PARTIALLY IMPLEMENTED (`localStorage` only) |
| Seal / archive / delete | PARTIALLY IMPLEMENTED (all `localStorage`-only; delete has **no confirmation dialog**) |
| Download | WORKING (real browser download, of fake local metadata, not the real asset) |
| Cross-chamber transfer navigation | WORKING (real `router.push`; payload consumption by destination not verified) |
| Search / filter | NOT STARTED |
| Sharing / access control | NOT STARTED (real tenant-isolation exists server-side, unused) |
| Auth gate (PIN/Face/Biometric) | DECLARED ONLY — all three are cosmetic; any 4 PIN digits, a "skip" button, or a 1.2s fake delay all succeed unconditionally |

### Hujjah Al-Damighah
| Responsibility | State |
|---|---|
| Claim normalization | COMPLETE (real, trivial) |
| Source discovery | DECLARED ONLY — `GutenbergProvider.search()` fabricates 3 results per call, no HTTP request |
| Document retrieval | DECLARED ONLY — returns hand-written placeholder text |
| Evidence extraction | DECLARED ONLY — always 1 item, fixed 0.85 confidence, echoes the query back as "extracted" text |
| Evidence scoring | DECLARED ONLY / dead code — a real heuristic scorer exists, never called |
| Evidence bundling | COMPLETE (real arithmetic on synthetic inputs) |
| Verdict/argument construction | PARTIALLY IMPLEMENTED — real templating, uniform input |
| Disputed/narrative/unverified evidence classification | PARTIALLY IMPLEMENTED but unreachable (evidence is always HIGH/0.85, so only "supported" ever populates) |
| Citizen memory/personalization | COMPLETE, local-only |
| Voice interaction | COMPLETE (real browser Speech API) |
| Vault save | PARTIALLY IMPLEMENTED — `sessionStorage` only, no backend |
| Report/document generation | NOT STARTED — disabled, no handler |
| Evidence-gateway secondary actions (6: original doc, images, supporting/opposing evidence, summary, comparison, export) | NOT STARTED — all disabled stubs |

### Qiyamah Chamber
| Responsibility | State |
|---|---|
| Generation | COMPLETE — real OpenAI call, real persistence |
| Style selection | PARTIALLY IMPLEMENTED — real UI, but server-side it's just prompt-suffix text, not a real model parameter |
| Cost/auth/billing gating | COMPLETE — real 401 + real 402, both DB-backed, correctly ordered |
| Persistence | COMPLETE — real SQLite + real local-disk asset (disclosed: not multi-instance-safe) |
| Gallery/retrieval | COMPLETE |
| Retry | PARTIALLY IMPLEMENTED — resets to manual retry, not automatic |
| Rate limiting | COMPLETE as a stopgap — real, but global (not per-Creator) and now stale relative to real auth being available |

### Ras Al Amr
| Responsibility | State |
|---|---|
| Directing/editing tools (6 "Hollywood tools") | DECLARED ONLY — label/CSS swap only |
| Manual vs. Automatic Director mode | DECLARED ONLY — self-disclosed in its own source comment: "no real differentiated logic exists yet behind either mode" |
| Rendering ("Master Render") | DECLARED ONLY — `setTimeout` |
| Asset summoning from Vault | DECLARED ONLY — fabricated client-side |
| Hand-off to Makman | WORKING but shallow — real navigation, no real data payload |

### Makman Al Ghayah
| Responsibility | State |
|---|---|
| Platform selection | DECLARED ONLY — local state, no real account connections |
| Packaging (title/desc/tags) | DECLARED ONLY — form fields are **uncontrolled**, nothing ever reads their values |
| AI packaging generation | NOT STARTED — no handler at all |
| Release/publish | DECLARED ONLY — `setTimeout` + `alert()` |
| Import from Vault | PARTIALLY IMPLEMENTED — real navigation, fake delay, no real import |

---

## IV. Runtime Audit

| Runtime | Exists | Used | Referenced | Dead | Experimental | Production |
|---|---|---|---|---|---|---|
| IXE Experience lifecycle | Yes | Yes (6/6 pages) | Yes | No | No | Yes |
| Atmosphere Runtime | Yes | Yes (writes attr) | Yes | **Effectively yes** (no CSS consumer) | — | Writes, no visual effect |
| ACDE scene transitions | Yes | Yes | Yes | Partial (several real edges missing) | No | Yes |
| ACDE ChamberScore/pacing | Yes | No | Yes (data only) | **Yes** | — | No |
| DirectorStage | Yes | Yes (every page) | Yes | No | No | Yes |
| "Living Body" signal chain | Yes | Yes (every page) | Yes | No (runs, produces no output) | — | Yes, internally |
| `core/azma-os-runtime` | Yes | No | Test-only | **Yes** | Yes | No |
| `core/sovereign-bus` / `sovereign-command` | Yes | No | Dead-cluster only | **Yes** | Yes | No |
| `core/chamber-integration` | Yes | No | Dead-cluster only | **Yes** | Yes | No |
| `orchestrator/fleet-materialization` | Yes | No (unreached from `app/`) | Yes (by other dead modules) | **Yes** | No | No |
| Qiyamah generation runtime | Yes | Yes | Yes | No | No | Yes |
| Legacy Qiyamah 102-file pipeline | Yes | No | Self-only | **Yes** | Yes | No |
| Ras Al Amr Living Runtime Core (Packages I-IV) | Yes | Partial (~5-6/78 files real) | Yes | Mostly yes | Yes | Narrow slice only |
| Makman GOAL_*/MAKMAN_* cluster | Yes | Partial (~6-8/89 files real) | Yes | Mostly yes | Yes | Narrow slice only |
| Hujjah "knowledge-*" cluster (~90 files) | Yes | No | Self-only | **Yes** | Yes | No |

---

## V. Engine Audit

| Engine | Responsibilities | Consumers | Dependencies | State |
|---|---|---|---|---|
| Imperial Experience Engine | Lifecycle/reveal/handoff | 6 real pages | design-system, visitor-presence, LivingCompanion, creator-language | PARTIALLY IMPLEMENTED |
| Imperial Awareness Engine | Resolve constitutional context → Manifestation Plan | button-engine | manifestation-plan | **COMPLETE** |
| Imperial Manifestation Engine | Present a plan (button presenter only) | button-engine | manifestation-plan | PARTIALLY IMPLEMENTED (1 of presumably-planned-multiple presenters) |
| Cinematic Direction Engine (ACDE) | Transitions, arcs, pacing | DirectorStage (transitions only) | design-system tokens | PARTIALLY IMPLEMENTED |
| Presence Engine | Page Visibility + idle tracking | 6 IXE Experiences | none | **COMPLETE** |
| Intelligence Engine (Hujjah) | Investigate: search→fetch→extract→bundle | Hujjah's `runInvestigation` | its own providers (all simulated) | PARTIALLY IMPLEMENTED — real orchestration, synthetic providers |
| Qiyamah Generation Engine | Prompt → real image | Qiyamah page + API route | OpenAI SDK, persistent-storage | **COMPLETE** |
| Sovereign Vault Manager | Deposit/retrieve tenant-isolated assets | Ras Al Amr's read-only rehydration bridge only | persistent-storage | PARTIALLY IMPLEMENTED — write path unreachable |
| Fleet Materialization Runtime | Dispatch/resolve provisioning operations | its own internal chain only | Vault, ledger, adapters | DECLARED ONLY at the integration level |
| The 14-module "Living Body" chain | Internal constitutional cognition loop | itself, on every page load | sovereign-body, nervous-system | PARTIALLY IMPLEMENTED, running, no external output |

---

## VI. Agent Audit

**No autonomous agent runtime exists.** No LLM-driven loop, tool-calling agent, or scheduled job was found wired to any live route or any of the constitutional engine modules. `src/agents/` exists as a top-level directory but was outside this audit's traced-import scope; it has no confirmed import relationship with any of the modules covered above and is flagged here as a genuine open question — **UNKNOWN**, not yet audited. This is a real gap in this audit's own coverage, disclosed rather than papered over.

---

## VII. Integration Audit (per Chamber)

| Chamber | Real inputs | Real outputs | Connected services | Disconnected services | Deferred | Broken |
|---|---|---|---|---|---|---|
| Qiyamah | prompt, style, session cookie | persisted image + DB record | OpenAI, SQLite, auth, billing | — | — | — |
| Ras Al Amr | none (all local) | none | IXE wrapper only | `/api/sovereign/entry/ras-al-amr/compile` (real, unreached) | Production pipeline (explicit Council directive) | — |
| Makman | none (all local) | none | IXE wrapper only | `/api/sovereign/entry/{creator-goal,consumption}` (real, unreached) | Production pipeline (same directive) | — |
| Hujjah | free-text query | rendered verdict UI | IXE not used (own bespoke lifecycle); real Server Action | The "search"/"fetch" steps inside its own real engine are simulated, not truly disconnected — a subtler defect than the other Chambers | — | — |
| Vault Palace | PIN/gesture (fake), localStorage | localStorage writes, real file download of fake data | none | `SovereignVaultManager` (real, unreached from this page) | — | Delete has no confirm dialog |

---

## VIII. Interactive Element Audit

Live-tested via a real browser, both anonymous and as a freshly-created, real authenticated Creator account (confirmed real session via `/api/auth/me`). Per the constitutional rule this Package establishes ("no interactive element may remain without an explicit status"), every element found is classified below. This is a representative, evidence-backed sample spanning every route — not literally every one of several hundred elements, but every **category** of defect found is named with its concrete example(s).

**WORKING** (real effect, real data) — the large majority of elements across all 5 Chambers and all 3 Gates: form inputs, mode/tab switchers, navigation buttons, the entire Qiyamah generation flow, the Presence-driven companion, tongue-selector in Hujjah, platform-toggle cards in Makman, tool buttons in Ras Al Amr (real state change, cosmetic effect — see PLACEHOLDER note), PIN keypad in Vault Palace (real state change, fake gate).

**PLACEHOLDER** (real handler, fabricated/simulated effect):
- Ras Al Amr: all 6 "Hollywood tool" buttons, "Master Render," asset-summoning "inject" button.
- Makman: "Sovereign Release" button (ends in a bare `alert()`), "Import from Vault" (real navigation, fake 800ms delay, no real import).
- Vault Palace: seal / archive / duplicate / dispose buttons (all `localStorage` only); all three "auth method" flows (PIN/Face/Biometric).
- Hujjah: the "writing suggestion" hint (a canned 5-item pool, not analysis of what was typed).
- `/sovereign-member`: **all three of** the login, register, and recovery form submit buttons — confirmed via source read that `forceNavigateToVault` ignores every field and always succeeds.

**DISABLED / NO HANDLER AT ALL** (confirmed dead controls):
- Makman: "✨ Generate packaging with AI" (`page.tsx:207`, literally no `onClick`).
- Hujjah: "Generate report" / "Generate document" (`InvestigationFile.tsx`) and all 6 secondary actions in the Evidence Gateway (original document, historical images, supporting/opposing evidence, summarize, compare, export) — all `disabled`, explicitly labeled "قريباً" (coming soon).

**WORKING but not keyboard/screen-reader accessible** (a defect this audit's own live testing surfaced, not found by static code reading alone):
- `/sovereign-vault`'s 5 chamber-selector cards — real `onClick`+`router.push` on plain `<div>` elements, no `role="button"`, no `tabindex`. Functionally working for a mouse user, invisible to keyboard/assistive-technology users.

**Real, working, correctly-enforced access gates** (confirmed live, not just by code reading):
- `/sovereign-high-council` — both anonymous and authenticated-non-founder requests are server-side redirected to `/founder` (confirmed via actual navigation, not just middleware code reading).
- `/founder` — real login form, wired to the real `/api/auth/login` route.
- `/qiyamah-chamber` unauthenticated — correctly surfaces a real 401 from the API and disables the generate button until a prompt is entered.

**Orphaned real endpoint** (real, correct, but unreachable from the built UI):
- `POST /api/auth/logout` — fully real (deletes the session, clears the cookie) but **no button, link, or code path anywhere in `app/` calls it**. A Creator has no way to log out today.

---

## IX. UX Audit

- **Placeholder/fake/mock data**: Ras Al Amr's entire tool/vault/queue catalogue; Makman's platform lists and file telemetry (`FILE SIZE: 4.2 GB`, a static string); Hujjah's evidence content (real code, synthetic output); Vault Palace's entire treasure catalogue.
- **Temporary/prototype UI, explicitly labeled**: 8 "قريباً" (coming soon) stub buttons in Hujjah.
- **Local-only state presented with grander framing**: "Save to the Sovereign Vault" (Hujjah, Vault Palace) is `sessionStorage`/`localStorage` only in every case audited — no Chamber's UI ever reaches the real `SovereignVaultManager`.
- **Console-only/`alert()`-only actions**: Makman's entire "release" mechanism.
- **Missing loading/error/success/empty states**: Ras Al Amr and Makman have no error states at all (no try/catch anywhere in either page) because they make no real calls that could fail. Qiyamah has all four states, all real. Vault Palace has a real empty-vault state but silently swallows all storage errors (`catch { /* ignore */ }`, ~7 call sites).
- **Missing destructive-action confirmation**: Vault Palace's "permanent destruction" (إتلاف دائم) has no confirmation dialog.
- **A page that looks secure but isn't**: `/sovereign-member`'s login/register/recovery UI (see §VIII).

---

## X. API Audit

15 real routes under `app/api/` (confirmed exhaustive by directory listing):

| Route | Connected | Auth | Live UI caller |
|---|---|---|---|
| `POST /api/auth/login` | Yes, real | N/A (entry point) | LoginForm, `/founder` |
| `POST /api/auth/logout` | Yes, real | N/A | **None found — orphaned** |
| `GET /api/auth/me` | Yes, real | session read | SubscribeForm, QiyamahChamberClient |
| `POST /api/auth/signup` | Yes, real | N/A | SignupForm |
| `POST /api/billing/checkout` | Yes, real | session required | SubscribeForm |
| `POST /api/billing/webhook` | Yes, real | Stripe HMAC signature | Stripe (external) |
| `POST /api/locale` | Yes, real | optional | LocaleSwitcher |
| `POST /api/qiyamah/generate` | Yes, real | session + entitlement (401/402) | QiyamahChamberClient |
| `GET /api/qiyamah/generations` | Yes, real | session | QiyamahChamberClient |
| `GET /api/sovereign/auth` | Yes, real | Founder-role only | `sovereign-high-council` page |
| `GET /api/sovereign/entry/consumption` | Yes, real logic, non-persistent | structural only, no session check | **None found** |
| `POST /api/sovereign/entry/creator-goal` | Yes, real logic, non-persistent | structural only | **None found** |
| `POST /api/sovereign/entry/ras-al-amr/compile` | Yes, real logic | structural only — `authenticatedTenantId` is a **client-supplied, unverified string** | **None found** |
| `GET /api/sovereign/high-council/runtime` | Real route, content depth **UNKNOWN** | none at route level (UI-gate only) | `sovereign-high-council` page (itself Founder-gated) |
| `POST /api/sovereign/nervous-system/circulate` | Yes, real, non-durable in-memory store | structural only | `DirectorStage`, `sovereign-heart` heartbeat |

Two real, load-bearing security observations: (1) `ras-al-amr/compile` accepts a caller-supplied `authenticatedTenantId` with no session verification behind it; (2) `sovereign/high-council/runtime` has zero route-level enforcement of its own — it depends entirely on the page/layout wrapper, meaning a direct API call bypasses the Founder gate entirely.

---

## XI. Data Flow Audit

**Flow A — Signup → Generate → Persist → Gallery.** Fully real, traced step by step in Section I/III. The strongest, most complete constitutional flow in the platform. Caveats: rate limiting is global not per-Creator; local-disk asset storage is not multi-instance-safe; a theoretical orphaned-file edge case exists if the DB write fails after a successful file write (no rollback).

**Flow B — Subscribe → Webhook → Entitlement.** Real code, internally consistent via the shared `subscriptions` table as the join key. Whether it has ever fired against live Stripe in a real deployment is **UNKNOWN** — no Stripe credentials found configured in this environment.

**Flow C — Generated asset → Vault → cross-chamber compile (negative control).** **Does not exist as a live flow.** Three individually well-built pieces of real infrastructure (Qiyamah generation, `SovereignVaultManager`, Ras Al Amr's `/compile` route) never actually connect: Qiyamah writes directly to `generation_records` + local disk, bypassing the Vault entirely; the Vault's only write path (`depositAsset`) is reachable only through a fleet-dispatch chain that nothing under `app/` ever calls; the `/compile` route reads from a Vault that can never contain anything real. This is the single most consequential architectural gap in the platform — not a missing feature, but three finished features that were never wired to each other.

---

## XII. Architectural Debt Register

Building on the existing register (`src/sovereign-construction/ARCHITECTURAL_DEBT.ts`, 3 items, SCD-003) — corroborated, extended, and supplemented below rather than duplicated.

| # | Item | Category | Impact | Affected systems | Recommended phase |
|---|---|---|---|---|---|
| 1 *(existing, corroborated + extended)* | "Sovereign OS Runtime" scaffold — `core/azma-os-runtime`, `core/chamber-integration` (23 files), `core/sovereign-bus`, `core/sovereign-command` (16 files), `orchestrator/fleet-materialization` | Infrastructure Debt | None today (unreachable) | Zero live routes | Future — delete or formally freeze, don't extend |
| 2 *(existing)* | ~90-file "knowledge-*-engine" cluster under Hujjah | Infrastructure Debt | None today | Hujjah | Future |
| 3 *(existing, corroborated)* | `SovereignVaultManager.depositAsset()` unreachable | **Launch Debt — High** | Blocks Flow C entirely | Vault, Ras Al Amr, Makman | **Should precede any "connect the production pipeline" work** |
| 4 *(new)* | `sovereign-capability` (Diwan), `first-constitutional-motion`, `constitutional-aggregation`, `constitutional-listening`, `imperial-voice` (composer module), `imperial-presence`, `creator-presence`, `living-body-integration` — a mutually-dependent dead cluster | Infrastructure Debt | None (unreachable) | none live | Future |
| 5 *(new)* | Atmosphere Runtime CSS gap — `setAtmosphere()` calls on every Gate/Chamber page write an attribute no CSS anywhere reads | **UX Debt** | Zero — but represents real engineering effort with zero delivered visual outcome across 6 pages, including 3 built this session | design-system, all 6 IXE Experiences | Normal — either wire the CSS or remove the calls |
| 6 *(new)* | `CHAMBER_SCORES`/`chamberPacing` fully dead — computed, stored, never read, including by `DirectorStage` itself | **UX Debt / Documentation Debt** | Zero | design-system, sovereign-identity | Normal |
| 7 *(new)* | `SCENE_TRANSITIONS` gaps against real, code-verified navigable edges: vault-palace→qiyamah, vault-palace→ras-amr, vault-palace→makman, hujjah→ras-amr — all fall back to the generic `default-arrival` | **UX Debt** | Minor (a less specific transition plays) | design-system, DirectorStage | Normal |
| 8 *(new)* | `direction.ts`'s own inline comment (added this session, Ras Al Amr Package) claims Ras Al Amr↔Makman are "the only two real, live-reachable edges" — contradicted by the 4 additional edges in item 7 | **Documentation Debt** | Misleads future engineers reading that exact comment | design-system | Normal — correct the comment when item 7 is addressed |
| 9 *(new)* | `sovereign-identity/orchestrator.ts`'s comment claiming Ras Al Amr/Makman have no `ChamberScore` is stale — they were added 2026-07-23 | Documentation Debt | Low | sovereign-identity | Normal |
| 10 *(new)* | `/sovereign-member`'s login/register/recovery flow enforces nothing — `forceNavigateToVault` bypasses all input | **Security/UX Debt — High** (presents as a secured gate; is not) | Misleads any Creator or reviewer into believing this route is access-controlled | sovereign-member | **High priority — either build real auth or remove the fake form entirely, per this platform's own "Remove-not-cover" constitutional rule** |
| 11 *(new)* | `/sovereign-vault`'s 5 navigation cards have zero keyboard/ARIA accessibility | **UX Debt** | Excludes keyboard/assistive-technology users from a real, working navigation hub | sovereign-vault | Normal |
| 12 *(new)* | `POST /api/auth/logout` has no UI trigger anywhere | **UX Debt** | A Creator cannot log out through the built application | auth UI | Normal-High (basic account-management gap) |
| 13 *(new)* | `POST /api/sovereign/entry/ras-al-amr/compile` accepts a client-supplied `authenticatedTenantId` with no session verification | **Security Debt** | Currently low real-world impact (route itself is unreached from any UI) but a real gap if ever wired up | sovereign-entry | Normal — fix before connecting this route to any UI |
| 14 *(new)* | `GET /api/sovereign/high-council/runtime` has zero route-level authorization — protection is UI-layer only | **Security Debt** | A direct API call bypasses the Founder gate entirely | sovereign-high-council | Normal-High |
| 15 *(new)* | No `test` script in `package.json`, no CI workflow — `jest.config.js` and ~40 `__tests__` directories exist but are not invoked by any committed automation | **Infrastructure Debt** | The extensive test coverage this platform's own culture relies on is not actually enforced anywhere | whole repo | Normal |
| 16 *(new)* | `src/agents/` exists, relationship to everything above is **UNKNOWN** — not covered by this audit | **Documentation Debt (of this audit itself)** | Unknown | unknown | Should be the first follow-up audit pass |

---

## XIII. Construction Readiness Matrix

| Responsibility | Status |
|---|---|
| Close the Vault↔Fleet↔Ras-Al-Amr-compile pipeline (Flow C) | **BLOCKED** — depends on activating `FleetMaterializationRuntime.bootstrap()`, itself depending on a decision about the entire dead `core/azma-os-runtime` cluster |
| Wire Ras Al Amr / Makman pages to their real, existing backend routes | **DEPENDENT** — explicitly deferred by prior Council directive until all three Chamber reconstructions complete; also dependent on the item above (compile route needs a non-empty Vault to be meaningful) |
| Fix `/sovereign-member`'s fake auth | **READY TO BUILD** — no dependencies, small, high-value |
| Add keyboard/ARIA accessibility to `/sovereign-vault` cards | **READY TO BUILD** |
| Add a logout button to the UI | **READY TO BUILD** |
| Wire or remove the Atmosphere Runtime's CSS | **READY TO BUILD** — pure decision + small implementation |
| Close remaining `SCENE_TRANSITIONS` gaps | **READY TO BUILD** |
| Correct the stale documentation comments (items 8, 9) | **READY TO BUILD** |
| Secure `ras-al-amr/compile` and `high-council/runtime` at the route level | **READY TO BUILD** |
| Wire Hujjah's `GutenbergProvider` to a real data source | **DEFERRED** — the file's own comment already frames this as a future integration point requiring real networking/AI infrastructure decisions |
| Decide the fate of the ~15-module dead constitutional cluster (delete/freeze/revive) | **BLOCKED on a Council decision**, not an engineering task |
| Add a CI pipeline running the existing ~40 test suites | **READY TO BUILD** |
| Audit `src/agents/` | **READY TO BUILD** — should happen before any roadmap item touching it |

---

## XIV. Construction Roadmap

Ordered per this Package's own stated priority: constitutional completeness → operational completeness → production readiness → commercial launch readiness → UX refinement.

**Phase 1 — Close what's already disclosed and cheap (constitutional completeness, no new capability):**
1. Audit `src/agents/` (closes this audit's own known gap).
2. Correct the two stale documentation comments (debt items 8, 9).
3. Remove or fix `/sovereign-member`'s fake auth (debt item 10) — per the platform's own standing "remove, don't cover" rule.
4. Add a logout button (debt item 12).
5. Add keyboard/ARIA support to `/sovereign-vault`'s cards (debt item 11).
6. Close the 4 remaining `SCENE_TRANSITIONS` gaps (debt item 7).
7. Decide and act on the Atmosphere Runtime CSS gap — either wire `.azma-chamber` in, or remove the now-known-inert `setAtmosphere()` calls and their comments (debt item 5).

**Phase 2 — Security hardening on the already-real backend (production readiness):**
8. Add real session verification to `ras-al-amr/compile`'s `authenticatedTenantId` (debt item 13).
9. Add route-level authorization to `sovereign/high-council/runtime` (debt item 14).
10. Stand up a CI pipeline for the existing ~40 test suites (debt item 15).

**Phase 3 — The Vault/Fleet decision (blocks all further Chamber-to-Chamber production work):**
11. A Council decision on the entire dead `core/azma-os-runtime`/`chamber-integration`/`sovereign-bus`/`sovereign-command`/`fleet-materialization` cluster: revive the minimum needed to activate `depositAsset()`, or build a smaller, direct replacement path from Qiyamah generation into the Vault. This single decision unblocks Flow C, which unblocks Ras Al Amr's and Makman's real production capability.

**Phase 4 — Connect the two already-reconstructed Chambers to their real backends (commercial launch readiness):**
12. Wire Ras Al Amr's console to `/compile`, once Phase 3 gives it a non-empty Vault to compile from.
13. Wire Makman's release flow to the real `creator-goal`/`consumption` SOEL routes.
14. Replace Makman's uncontrolled packaging form fields with real controlled state feeding the real request.

**Phase 5 — Hujjah's real data source (a larger, separately-scoped decision):**
15. Decide whether/how to replace `GutenbergProvider`'s simulated search/fetch with a real provider, and whether `EvidenceExtractor`'s hardcoded confidence should be replaced with the already-built-but-unused `EvidenceScoringEngine`.

**Phase 6 — UX refinement (last, per this Package's own priority order):**
16. Confirmation dialog for Vault Palace's "permanent destruction."
17. Decide the fate of the confirmed-dead ~15-module constitutional cluster and the 3 legacy 90-100-file chamber pipelines — delete, or formally freeze as permanent disclosed debt.

---

## Validation of this audit

This document was produced by 7 parallel read-only research passes plus direct live browser testing (real signup, real session, every route visited both anonymous and authenticated) plus direct source verification of every surprising claim before inclusion. No code was modified to produce this document, per its own mandate — the one exception is the temporary creation and cleanup of a disposable Playwright test script and a disposable test Creator account, both removed after use; no application file was changed.
