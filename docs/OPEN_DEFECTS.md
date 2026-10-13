# AZMA OS — Open Defects

Defects found while doing something else, recorded rather than repaired.

Each one is out of scope for the work that found it. Recording beats fixing here
for one reason only: a repair smuggled into an unrelated closure is a repair
nobody reviewed. Each entry carries what was measured, so the next directive
starts from evidence instead of from a description.

---

## OD-001 — WITHDRAWN. The defect was mine, not the Empire's.

**Recorded:** 2026-09-20. **Withdrawn:** 2026-09-21, on browser evidence.
**Status:** NOT A DEFECT.

I reported that a new verified account reaches the PIN gate and is told
«PIN غير صحيح» instead of being invited to create a PIN.

That did happen on my screen. It was not what I said it was.

**What I actually did:** ran the Playwright probe against `azmaeng27@gmail.com`,
which HAS a PIN — the Founder set one during their own session minutes earlier —
and typed `0000`, which is the Founder's PIN and not that account's. The Palace
refused a wrong PIN on an account that has one. That is the behaviour working.

**What the code always did**, read afterwards rather than before:

    app/api/vault/pin/verify/route.ts
      storedHash === null  ->  { status: 'no-pin' }      // NOT 'incorrect'
    app/sovereign-vault-palace/page.tsx
      case 'no-pin':  setPhase('setup')                   // invite to create

The server distinguishes NO PIN EXISTS from PIN EXISTS AND IS WRONG, and the
client already acts on the distinction. Neither needed changing.

**Proven with Playwright against production**, on the account that genuinely has
no PIN (`abomangaisme2010@gmail.com`):

    1. arrives at the Palace         "⬡ القصر السيادي … PIN"
    2. first four digits             "⬡ أنشئ رمز القصر السيادي — أدخل 4 أرقام"
    3. enters them                   "⬡ أكّد الرمز السري"
    4. confirms                      enters the Palace
    5. returns in a new context      "PIN"  (enter, not create)
    6. wrong PIN                     "PIN غير صحيح"     — correctly refused
    7. correct PIN                   enters the Palace

The account was restored to its original state afterwards: the PIN this probe
created was set back to NULL and the probe session deleted, backed up first
(azma-os.pre-od1-restore-20260920-214015.db, integrity ok). 5 accounts, 52
assets, unchanged.

**The lesson, which is the reason this entry stays instead of being deleted:**
I wrote a defect report from one observation without checking the state of the
thing I was observing. A wrong PIN and a missing PIN look identical on screen
and are opposite facts. The register is for measured defects; this one was a
measured symptom with an assumed cause.

---

## OD-002 — The entry page calls a route that refuses anonymous visitors

**Found:** 2026-09-20, same browser journey.
**Scope:** the nervous system's transport. NOT the identity gate.

```
401 https://azmaos.com/api/sovereign/nervous-system/circulate
401 https://azmaos.com/api/sovereign/nervous-system/circulate
```

Two of these in the console of every visitor who opens `/signup` without a
session.

The route was given a session requirement during the unauthenticated-DoS
closure — correctly; it was a way for a stranger to grow the Empire's memory
until the process died. The client that calls it was not told, so it still
calls for visitors who have no session.

**Consequences, both small and both real:** console noise on the first page a
new Creator ever sees, and the nervous system receives nothing at all from
anonymous arrivals — which is the population an entry page exists to observe.

**Disposition (2026-09-21): CLOSED — by fixing the call, not the refusal.**

The 401 is constitutionally correct and is unchanged. What was wrong was the
route's own assumption, written in its header: "every browser that legitimately
calls circulateFromClient() is a signed-in Creator". DirectorStage is mounted in
the root layout, so it circulates for anonymous visitors on the first page they
ever see.

`circulateFromClient` now latches on a 401 or 403: the server's refusal is
believed once and not argued with. A NETWORK failure is deliberately not a
refusal — a dropped connection says nothing about authority, and latching on it
would silence a signed-in Creator for the rest of the page's life.

A latch rather than a "am I signed in?" check, because the session cookie is
httpOnly and unreadable by design, and asking would restore the chatter this
removes. Local emission is untouched: same-tab observers still see every signal
with zero delay.

Proven in the browser: 2 x 401 before, 0 after.

---

## OD-003 — Two chambers admit an anonymous visitor, then fail in front of them

**Found:** 2026-09-21, sweeping the journey adversarially on the Founder's
instruction that no real user should ever enter and find a deficiency.
**Scope:** chamber entry guards. A constitutional question, not a bug fix.

Measured with Playwright against production, anonymous browser contexts:

```
/qiyamah-chamber         -> redirects to /signup     0 failed requests
/sovereign-vault-palace  -> redirects to /signup     0 failed requests
/hujjah-al-damighah      -> redirects to /login      0 failed requests
/imperial-foyer          -> redirects to /login      0 failed requests

/makman-al-ghayah        -> STAYS                    3 x 401
    401 /api/sovereign/entry/purpose
    401 /api/sovereign/entry/creator-goal
    401 /api/sovereign/nervous-system/circulate

/ras-amr                 -> STAYS                    3 x 401
    401 /api/vault/assets
    401 /api/ras-amr/canvas
    401 /api/sovereign/nervous-system/circulate
```

Four chambers turn a visitor toward a door. Two let them in and then fetch data
they are not entitled to, fail, and render a chamber with nothing in it. The
refusals are correct — the routes are doing their job. What the visitor
experiences is a room of the Empire that is simply broken.

**Why it is recorded and not repaired:** which chambers require a session is a
decision about what the Empire offers a stranger, and the Living-city principle
(free chamber choice after Welcome and Registration) points one way while the
existence of two unguarded chambers points another. The charter is explicit that
a constitutional question is never settled unilaterally by the Chief Engineer.

**What a repair must decide:** whether Ras Al Amr and Makman Al-Ghayah join the
guarded chambers and redirect to /signup, or whether they are meant to be
enterable and must render an honest empty state instead of failing requests.
Either is defensible. Choosing is the Founder's.

**Not a stranding defect:** unlike the `/creator-access` 404 repaired in
4fe4b62, nobody is sent to a page that does not exist. The visitor is somewhere
real; it just does not work for them.

---

**Disposition (2026-09-21): CLOSED.** The Founder decided: a visitor with no
creator identity who reaches a chamber requiring one is sent to /signup, the
unified identity entry.

Both chambers now ask `/api/auth/me` and navigate on the answer, exactly as
Qiyamah and the Vault Palace already did. The server-side authorization is
untouched — all four routes still call `verifySession` and still refuse an
unauthenticated caller. This is not a suppression of 401s; it is the chamber
telling a stranger where the door is instead of leaving them in an empty room.

Proven in the browser against production:

```
anonymous  /ras-amr           -> /signup   404=0  stranded=false
anonymous  /makman-al-ghayah  -> /signup   404=0  stranded=false
creator    /ras-amr           -> /ras-amr  404=0  console errors=0
creator    /makman-al-ghayah  -> /makman…  404=0  console errors=0

no loop:   /ras-amr -> /ras-amr -> /signup -> /signup   (2 unique locations)
still protected: 401 on ras-amr/canvas, vault/assets,
                 entry/purpose, entry/creator-goal
```

Two things this uncovered, both repaired, both recorded in their own commits:

  · `deploy.sh` had skipped every dependency install since 16 Sep, because it
    compared the lockfile on the server against the staged one and never
    checked that the INSTALLED TREE matched either. node_modules held
    next@16.2.6 while every build was made by 16.3.5. It took production down
    with HTTP 500 and `Cannot read properties of undefined (reading
    'validationLevel')`. Repaired in 8751ef7 with a fingerprint written into
    the tree at install time.

  · `verify-deployment.mjs` proved hydration by finding a live onClick on a
    `.ras-intent-card` while loading /ras-amr ANONYMOUSLY — the exact thing
    this fix retires. It reported a working page as inert and would have
    blocked every future deployment. Repaired in f570bd3.

---

## OD-004 — A test bets on the wall clock and loses under load

**Found:** 2026-09-21, in the final regression for OD-003.
**Scope:** `src/core/constitution-runtime/wp-021-028-agent-decision.test.ts`.
**Unrelated to any change in this package.**

```
● WP-025: Agent Runtime State Service › should track uptime for agent
```

The assertion:

```ts
await layer.agentStateService.setState('agent-state-003', 'IDLE');
await new Promise(resolve => setTimeout(resolve, 50));
expect(state?.uptime_ms).toBeGreaterThanOrEqual(50);
```

`setTimeout(50)` guarantees *at least* 50ms of wall time before the callback is
scheduled — it does not guarantee that 50 whole milliseconds are measurable on
the other side, and under 205 suites running in parallel the margin vanishes.

Measured: **1 failure in the full run, 3 of 3 passes in isolation.**

This is the same class as the knowledge suites repaired earlier — a gate that
answers differently to identical code, which trains everyone to scroll past a
red line. It is smaller (one assertion, not fourteen) and it is not in this
package's scope, so it is recorded rather than touched.

**What a repair looks like:** assert on an injected clock, or on the ordering
the service actually guarantees, rather than on elapsed real time.

## OD-005 — A unit test reaches the public internet and fails when it is slow

**Found:** 2026-09-21, in the full regression for the Executive Construction
Mandate closure (3724 passed, 1 failed; the same suite re-run alone: 39/39).
**Scope:** `src/persistent-storage/__tests__/sovereign-knowledge-investigation-foundation.test.ts`.

`citizenChain('What is nuclear fusion?', 'physics')` calls the real
`conductInvestigation`, which asks `IntelligenceCompositionFactory` for the
real engine — and that factory attaches WikipediaProvider, HackerNewsProvider,
OpenLibraryProvider and GoogleTrendsProvider. So `outcome.ok` depends on the
network being fast enough during the run. Under the full suite's load it was
not; alone it was.

The failing assertion is `expect(outcome.ok).toBe(true)` on the origin check,
which has nothing to do with the network — the test wants to know that a
Citizen result is stamped CITIZEN, and could establish that with any provider
that answers at all.

Not caused by, and not touched by, the closure it surfaced in.

**What a repair looks like:** compose the engine for this suite from the
sovereign in-process providers only (Scripture, Hadith, Tafsir, the Library),
or attach a fixture provider — the origin stamp is decided before any
provider is consulted.

---

## OD-0?? — a background organ signal answers 401 on every page

**Recorded:** 2026-10-12, by the QIYAMAH acceptance walk.
**Status:** OPEN · pre-existing · not a blocker for any operation.

Every page load posts a Nervous System signal from the browser and gets refused:

    POST /api/sovereign/nervous-system/circulate  ->  401

`circulateFromClient()` is fire-and-forget by design and absorbs the failure, so
nothing breaks and no Creator is told anything. What it does do is write a red
error into every Creator's console on every page, which is where a REAL defect
would otherwise be noticed.

**Measured:** desktop and mobile passes of `qiyamah-acceptance-walk.mjs` against
release `20261012-145654-864a104`. It was the only console error in fifty checks.

**What is not known:** whether the route is meant to accept an unauthenticated
signal (and so should answer 204), or whether the browser should not be sending
one at all before a session exists. Both are the Chief Architect's to rule.

**Why it is recorded and not fixed:** it belongs to the Nervous System, not to
Qiyamah, and this campaign had no authorization to touch it.

---

## الحساباتُ لا تُسجَّل في مسارِ التوليد — `generation_records`

**اكتُشف:** ١٣ أكتوبر ٢٠٢٦، أثناءَ المُطابقةِ الماليّةِ الإلزاميّةِ للقيامة.

**ما هو:** جدولُ `generation_records` يَحمل `record_id`, `creator_id`, `prompt`,
`style`, `asset_url`, `generated_at`, `original_idea`, `media_type`, `asset_id`
— **ولا يَحمل معرّفَ وظيفةِ المزوّد، ولا ما خَصمه المزوّد.**

ومسارُ **التحويل** (`vault_assets.metadata`) يُسجّل كليهما:
`mutationProviderJobId` و`mutationProviderCreditsCharged`. فالمسارانِ غيرُ
متساويَين في الصدقِ الماليّ.

**الأثرُ المقيس:** لا تُمكن مطابقةٌ ماليّةٌ شاملةٌ لعُمرِ الحسابِ من سِجلّاتِ
الإمبراطوريّةِ وحدَها. فحين سُئلت الخزانةُ عن كلِّ كريديتٍ أُنفق يوماً، أجابت عن
التحويلاتِ فقط. وهذا بالضبطِ ما جعلَ فجوةَ المئةِ تَحتاج تحقيقاً بدل أن تُحسَم
بسطرٍ واحد.

**ولماذا لم يُصلَح هنا:** أمرُ القبولِ النهائيِّ نصَّ على عدمِ فتحِ معمارٍ مكتمل
ولا إدخالِ عملٍ غيرِ ذي صلة. وإصلاحُه تغييرُ مخطَّطٍ في مسارِ التوليد، وهو
للمهندسِ المعماريِّ الأوّل أن يَأمر به.

**وما يَلزم حين يُؤمَر:** عمودانِ في `generation_records` (أو مِفتاحانِ في بيانات
الأصل) يَحملان معرّفَ وظيفةِ المزوّدِ وخصمَها، يُكتبان من المكانِ الذي يَكتب فيه
مسارُ التحويلِ نظيرَيهما — بلا سلطةٍ ثانية.
