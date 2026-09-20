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
