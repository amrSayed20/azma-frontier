# AZMA OS — Environment Contract

What the Empire needs from its environment, and what it must never carry in
source control.

**No value in this file is a value.** Every entry names a variable and says what
it is for. Actual credentials live in `.env.local` on the server and nowhere
else — not in Git, not in test fixtures, not in logs, not in a report, not in a
chat message.

---

## Identity

| Variable | Required for | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Registration and sign-in | OAuth 2.0 Web application client id. Checked as the `aud` claim of every id_token — a token issued to a different application is genuine and is refused. |
| `GOOGLE_CLIENT_SECRET` | Registration and sign-in | Used only in the back-channel code exchange. Never reaches a browser. |

**Authorized redirect URIs.** TWO, both registered with Google against the one
client — `AZMA OS Production web` — and both matched exactly:

```
https://azmaos.com/api/auth/google/callback     — sign-in
https://azmaos.com/api/cloud/google/callback    — linking a Creator's Drive
```

**Each is a CONSTANT in its own route, and is derived from nothing.** An earlier
version built the sign-in one from `request.nextUrl.origin`; behind nginx that
is the private origin Next.js was proxied to, so it became
`https://localhost:3000/...` and every sign-in would have died on Google's own
screen with `redirect_uri_mismatch`. A unit test passed throughout, because it
built its request from the public URL. `X-Forwarded-Host` is not the repair:
nginx sets it, but it is client-supplied in principle, and trusting it trades a
broken flow for a redirect-poisoning hole. See
`app/api/auth/google/start/route.ts` for the full record.

The two live in separate routes deliberately. The sign-in callback states that
there is exactly one authorized redirect URI «written here as one, with no
branch at all», and a branch previously added to it was removed. Giving the
route that mints sessions a second purpose would reintroduce the shape it was
hardened against, to save one line in a console someone is already standing in.

When both variables are absent, `googleIdentityIsConfigured()` returns false,
`/api/auth/google/start` answers 503 with a spoken Arabic message, and
`/api/cloud/google/start` does the same. The door is never offered blind, and
the Creator is never shown a failure that reads like their own mistake.

### One credential, two purposes

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` serve BOTH sign-in and Drive
linking. `src/cloud-destinations/google-drive-destination.ts` reads the same two
variables by name — there is no second credential path, and no second client.

That is load-bearing rather than tidy: Google's console does not display an
existing client secret after creation, so a second client would have meant a
second secret, a second consent screen and a second verification. Adding the
Drive scope to the client that already works costs one scope and one redirect
URI.

**Scopes requested at runtime.** Sign-in asks for `openid email profile`.
Drive linking asks for `openid email https://www.googleapis.com/auth/drive.file`
— per-file access to files this application itself creates, and to nothing else
in the Creator's Drive. Verify it on the live server by following
`/api/cloud/google/start` and reading the `scope` parameter of the redirect; the
documentation is not the proof.

**Google Cloud console actions this requires, which no code can perform:**

1. `Google Drive API` enabled on the same project as the OAuth client. A scope
   in an authorization URL does not enable an API — without this the link
   succeeds and the first upload fails with 403, after the Creator has already
   granted permission.
2. `https://www.googleapis.com/auth/drive.file` declared on the OAuth consent
   screen.
3. The Drive redirect URI above added to the client's authorized list.
4. If the consent screen's publishing status is `Testing`, only listed test
   users can link at all.

---

## Capabilities

| Variable | Required for |
|---|---|
| `MAGIC_HOUR_API_KEY` | Image generation, and image editing inside an asset (Phase D) |
| `GEMINI_API_KEY` | Intent interpretation, evidence translation |
| `VOICE_CLONING_API_KEY` | Ministry III — voice cloning |
| `MONEYPRINTERTURBO_API_KEY` / `MONEYPRINTERTURBO_BASE_URL` | The isolated video provider |

## Creator grants held in trust

| Variable | Required for | Notes |
|---|---|---|
| `AZMA_TOKEN_KEY` | Linking any Creator cloud account | **32 characters or more.** The AES-256-GCM key that seals a Creator's OAuth refresh token at rest. Not from any provider — the Empire generates it. |

A refresh token is the opposite of a password: the Empire must be able to READ
it back, months later, to deliver a file to the Creator's own Drive. `scrypt` —
which is right for a password, and is what `password-hashing.ts` uses — cannot
hold it, and plaintext in a column means one backup exposes every Creator's
access to their own cloud. See `src/cloud-destinations/token-vault.ts`.

**When it is absent the Empire REFUSES to hold a token.** It does not fall back
to plaintext «for now»: a temporary plaintext store becomes permanent the moment
it works. `/api/cloud/google/start` answers 503 BEFORE sending the Creator to
Google, because a Creator who grants permission and then learns it cannot be
kept has been made to do something for nothing.

Rotating it makes every existing grant unreadable, and every Creator must link
again. There is no re-encryption path, by design — a key that can be rotated
silently is a key whose rotation nobody notices.

---

## Storage and runtime

| Variable | Required for | Notes |
|---|---|---|
| `UPLOADS_DIR` | Every Creator byte | `/var/www/azma-uploads` in production. Uploads, generated assets AND finished films live beneath it — never under `public/`, which Next.js serves statically ahead of any route and would hand files past their authorisation gate. |
| `AZMA_DB_PATH` | Tests, and any non-default database | Absent in production, where the default resolves to `data/azma-os.db`. |
| `COOKIE_SECURE` | Local HTTP development | Set to `false` only off production. |
| `FOUNDER_EMAIL` / `FOUNDER_PASSWORD` | One-time Founder bootstrap | Never used by public sign-up. |

---

## Rules that hold for every variable above

1. **Read at call time, never at module import.** A module-level
   `const X = process.env.Y` freezes the value at import and ignores anything
   set afterwards. That exact defect has produced four separate production
   failures in this repository — `db.ts`, the image-edit route, `clone-voice`,
   and the render encoder. Every environment read goes through a function.

2. **Never printed.** Not at startup, not in an error, not in a log line, not in
   a report. The Google binding's errors carry a rejection code and nothing
   else, and a test asserts that no error text contains the client id or secret.

3. **Absence is a state, not a crash.** A missing capability credential makes
   the capability unavailable and says so in the Creator's own tongue. It never
   produces a stack trace on a Creator's screen, and never a message that reads
   as though the Creator did something wrong.
