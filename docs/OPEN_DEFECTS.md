# AZMA OS — Open Defects

Defects found while doing something else, recorded rather than repaired.

Each one is out of scope for the work that found it. Recording beats fixing here
for one reason only: a repair smuggled into an unrelated closure is a repair
nobody reviewed. Each entry carries what was measured, so the next directive
starts from evidence instead of from a description.

---

## OD-001 — A new Creator is told their PIN is wrong before they have one

**Found:** 2026-09-20, during the Google Identity Gate browser journey.
**Scope:** Vault Palace entry. NOT the identity gate.

A brand-new account reaches `/sovereign-vault-palace` and is shown the PIN
keypad. It has no `vault_pin_hash`, because it has never set one. Entering
anything answers:

```
PIN غير صحيح
```

**Measured**, with Playwright against production, on a real verified Google
account created minutes earlier:

```
  textSample: "⬡ القصر السيادي  هذا مكانك  PIN  بصمتك  PIN غير صحيح  1 2 3 ..."
  creators.vault_pin_hash for that account: NULL
```

The Creator is accused of getting wrong a secret they were never invited to
create. There is no visible path from "no PIN" to "a PIN".

**Why it was not repaired here:** the Founder's closure directive named it
explicitly as out of scope, and it does not block the identity proof — the
account, the verification and the session are all correct behind the gate.

**What a repair must decide:** whether a first visit offers PIN creation, or
whether the Palace opens without one until the Creator chooses to lock it. That
is a constitutional question about what the PIN protects, not a bug fix.

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

**Why it was not repaired here:** out of scope, and it changes what the nervous
system records, which is a decision rather than a fix.

**Not masked:** `scripts/verify-creator-journey.mjs` names this exact error so
that it cannot hide a NEW console error behind itself.
