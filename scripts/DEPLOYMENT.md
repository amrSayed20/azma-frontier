# Deployment

## The approved command

```bash
./scripts/deploy.sh deploy
```

That is the entire approved path. It builds, ships one checksummed archive,
installs it as an immutable release, switches with a single atomic rename,
restarts the service, and verifies the live site in a real browser — rolling
back on its own if verification fails.

| Command | Does |
| --- | --- |
| `./scripts/deploy.sh deploy` | Full release. Rolls back automatically if live verification fails. |
| `./scripts/deploy.sh deploy --skip-build` | Ship the build already in `.next`. |
| `./scripts/deploy.sh deploy --no-auto-rollback` | Leave a failing release live for inspection. |
| `./scripts/deploy.sh rollback` | Return to the previous release. |
| `./scripts/deploy.sh rollback <release-id>` | Return to a specific release. |
| `./scripts/deploy.sh status` | What is live, what can be rolled back to. |
| `./scripts/deploy.sh verify` | Re-run live verification without deploying. |

Requires `ssh`, `scp`, `tar`, `sha256sum`, `node`, and Playwright's Chromium
(already a dev dependency).

## Not approved

```bash
scp -r .next/static root@host:/root/azma-os/.next/     # NEVER
scp -r .next/server root@host:/root/azma-os/.next/     # NEVER
```

`scp -r` **merges** into the destination and never removes what is already
there. The `.next` upload routinely outruns a command timeout, and an
interrupted transfer leaves same-named chunk files from two different builds
side by side. The client bundle then throws:

```
Module 68027 was instantiated because it was required from module 964893,
but the module factory is not available
```

React never hydrates. The page still renders from SSR and still looks correct,
and every button on it is dead. This is precisely what took the Head of Command
chamber down on 2026-09-13: fourteen cards visible and inert, with compilation,
lint, PM2 status and HTTP 200 all reporting healthy throughout. It was
misdiagnosed for an entire session as a CSS stacking-context bug, because
nothing in the usual evidence chain can distinguish a dead bundle from a live
one.

Any deployment method that writes into a live build directory can reproduce
this. Use `deploy.sh`.

## How the failure mode is eliminated

Not by being careful — structurally. There is no code path in `deploy.sh` that
can write one build's files over another's.

1. **One release is one archive.** A partial transfer is a corrupt file, not a
   half-written directory.
2. **SHA-256 on both ends.** A mismatch aborts before anything on the server is
   touched, and the live release keeps serving.
3. **Staging is validated before it can go live** — `BUILD_ID` must match what
   was built locally, and the staged build must carry client chunks.
4. **Each release lands in `releases/<id>/` and is never written into again.**
   Two builds can never share a directory.
5. **Going live is one `rename(2)`** on the `.next` symlink. There is no moment
   where `.next` is partially updated.
6. **The previous release stays on disk**, so rollback is another rename.

Staging deliberately lives at `$APP_DIR/.deploy-staging`, not `/tmp`: `/tmp` on
this host is tmpfs, so staging there would make the move into `releases/` a
cross-filesystem copy instead of the atomic rename this design depends on.

## Server layout

```
/root/azma-os/
  .next -> releases/<id>/.next    symlink; switching it is the release
  releases/<id>/.next             immutable, one per release, 5 kept
  .deploy-staging/                transient, same filesystem as releases/
  .deploy-state                   current / previous release ids
```

PM2 configuration is unchanged: it still runs `next start` with
`cwd=/root/azma-os`. Only `.next` becomes a symlink. Next.js 16.2.6 was
verified to serve correctly from a symlinked `.next` — page and static chunk
both 200 — before this path was adopted.

The service is restarted with `pm2 restart azma-os --update-env`; without
`--update-env` PM2 keeps the environment the process was first started with.

## What verification actually proves

`scripts/verify-deployment.mjs` runs a real Chromium against the live URL.
Compilation success, PM2 `online`, and HTTP 200 are explicitly **not** accepted
as evidence, because all three are true of a completely dead page. It checks:

- the page answers over HTTP
- no chunk or module-factory error was thrown
- no critical console error was logged, and no page resource failed
- React hydrated — a rendered element carries a fiber and a live `onClick`
- all 14 Head of Command cards are present and unobstructed
- each card, clicked on a freshly loaded page, actually reaches the template
  preview or the workspace

Any failure exits non-zero, which triggers the automatic rollback.

## Known limits

- `node_modules` is shared across releases rather than versioned. A deployment
  that also changes dependencies is outside what this path currently
  guarantees; install on the server first, then deploy.
- Rollback restores the previous build, not the previous database state.
- The uploads directory (`/var/www/azma-uploads`) is outside the release
  directory by design, so creator assets survive both deploys and rollbacks.
