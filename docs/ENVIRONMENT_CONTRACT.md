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

**Authorized redirect URI**, registered with Google and matched exactly:

```
https://azmaos.com/api/auth/google/callback
```

The redirect URI is derived on the server from the request's own origin. It is
never read from a query parameter — a caller-supplied `redirect_uri` is how an
OAuth flow is pointed at an attacker's callback.

When both variables are absent, `googleIdentityIsConfigured()` returns false and
`/api/auth/google/start` answers 503 with a spoken Arabic message. The door is
never offered blind, and the Creator is never shown a failure that reads like
their own mistake.

---

## Capabilities

| Variable | Required for |
|---|---|
| `MAGIC_HOUR_API_KEY` | Image generation, and image editing inside an asset (Phase D) |
| `GEMINI_API_KEY` | Intent interpretation, evidence translation |
| `VOICE_CLONING_API_KEY` | Ministry III — voice cloning |
| `MONEYPRINTERTURBO_API_KEY` / `MONEYPRINTERTURBO_BASE_URL` | The isolated video provider |

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
