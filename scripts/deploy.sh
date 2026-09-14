#!/usr/bin/env bash
#
# AZMA OS — THE SOLE APPROVED DEPLOYMENT PATH
#
#   ./scripts/deploy.sh deploy     build, ship, verify (rolls back if verification fails)
#   ./scripts/deploy.sh rollback   return to the previous release
#   ./scripts/deploy.sh status     show what is live and what can be rolled back to
#   ./scripts/deploy.sh verify     run live verification against the current release
#
# ─────────────────────────────────────────────────────────────────────────────
# NON-APPROVED:  scp -r .next/static root@host:/root/azma-os/.next/
#
# `scp -r` MERGES into the destination directory and never removes what is
# already there. The .next upload routinely outruns a command timeout, and an
# interrupted transfer leaves same-named chunk files from two different builds
# side by side. The client bundle then throws
#
#     Module <n> was instantiated because it was required from module <m>,
#     but the module factory is not available
#
# React never hydrates, and every button on the site becomes dead HTML — the
# page renders from SSR and looks perfect while nothing responds to a click.
# This is exactly what took the Head of Command chamber down: fourteen cards
# visible and inert, misdiagnosed for a whole session as a CSS stacking bug.
#
# The failure mode is eliminated structurally, not by being careful:
#   · one release is one archive, verified by SHA-256 on both ends
#   · a mismatch aborts before the live release is touched at all
#   · each release lands in its own directory and is never written into again
#   · going live is a single atomic rename of a symlink
#   · the previous release stays on disk, so rollback is another rename
#
# There is no code path here that can write one build's files over another's.
# ─────────────────────────────────────────────────────────────────────────────

set -Eeuo pipefail

# ── Target ───────────────────────────────────────────────────────────────────
SSH_KEY="${AZMA_SSH_KEY:-$HOME/.ssh/id_ed25519_azma}"
REMOTE="${AZMA_REMOTE:-root@2.28.52.180}"
APP_DIR="${AZMA_APP_DIR:-/root/azma-os}"
PM2_APP="${AZMA_PM2_APP:-azma-os}"
LIVE_URL="${AZMA_LIVE_URL:-https://azmaos.com}"
KEEP_RELEASES="${AZMA_KEEP_RELEASES:-5}"

# Staging lives on the SAME filesystem as the release directory. /tmp on this
# host is tmpfs, so staging there would make the move into releases/ a copy
# rather than the atomic rename this design depends on.
RELEASES_DIR="$APP_DIR/releases"
STAGING_DIR="$APP_DIR/.deploy-staging"
STATE_FILE="$APP_DIR/.deploy-state"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACT="$REPO_ROOT/.deploy-artifact.tar.gz"

# ── Output ───────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  B=$'\033[1m'; DIM=$'\033[2m'; R=$'\033[31m'; G=$'\033[32m'; Y=$'\033[33m'; Z=$'\033[0m'
else
  B=""; DIM=""; R=""; G=""; Y=""; Z=""
fi
step() { printf '%s==>%s %s\n' "$B" "$Z" "$*"; }
info() { printf '    %s\n' "$*"; }
ok()   { printf '    %sok%s   %s\n' "$G" "$Z" "$*"; }
warn() { printf '    %swarn%s %s\n' "$Y" "$Z" "$*"; }
die()  { printf '\n%sFAILED%s %s\n' "$R" "$Z" "$*" >&2; exit 1; }

trap 'die "aborted at line $LINENO"' ERR

remote() { ssh -n -o BatchMode=yes -i "$SSH_KEY" "$REMOTE" "$@"; }

require_tools() {
  for t in ssh scp tar sha256sum node; do
    command -v "$t" >/dev/null 2>&1 || die "required tool not found: $t"
  done
  # GNU tar reads a leading "C:" as a remote host spec on Git Bash.
  TAR_FLAGS=()
  if tar --version 2>/dev/null | grep -qi 'gnu tar'; then TAR_FLAGS+=(--force-local); fi
}

# ── status ───────────────────────────────────────────────────────────────────
cmd_status() {
  step "Live release"
  remote "
    if [ -L '$APP_DIR/.next' ]; then
      echo \"    current  \$(readlink '$APP_DIR/.next')\"
    elif [ -d '$APP_DIR/.next' ]; then
      echo '    current  (unmanaged directory — not yet migrated to a release)'
    else
      echo '    current  MISSING'
    fi
    [ -f '$STATE_FILE' ] && sed 's/^/    /' '$STATE_FILE' || echo '    no deploy state recorded'
    echo ''
    echo '    releases on disk:'
    ls -1t '$RELEASES_DIR' 2>/dev/null | sed 's/^/      /' || echo '      none'
  "
  step "Service"
  remote "pm2 describe '$PM2_APP' 2>/dev/null | grep -E 'status|uptime|restarts' | sed 's/^/    /' || echo '    pm2 app not found'"
}

# ── verify ───────────────────────────────────────────────────────────────────
# Live browser verification. Compilation, PM2 status and an HTTP 200 all pass
# happily while React is dead, so none of them are accepted as evidence here.
cmd_verify() {
  step "Live verification — $LIVE_URL"
  node "$REPO_ROOT/scripts/verify-deployment.mjs" "$LIVE_URL"
}

# ── rollback ─────────────────────────────────────────────────────────────────
cmd_rollback() {
  local target="${1:-}"

  if [ -z "$target" ]; then
    target="$(remote "grep '^previous=' '$STATE_FILE' 2>/dev/null | cut -d= -f2" || true)"
    [ -n "$target" ] || die "no previous release recorded — pass a release id explicitly (see: deploy.sh status)"
  fi

  step "Rolling back to $target"
  remote "[ -d '$RELEASES_DIR/$target/.next' ]" \
    || die "release $target is not on disk"
  ok "release exists on the server"

  remote "
    set -e
    cd '$APP_DIR'
    previous_live=\$(readlink .next 2>/dev/null | sed 's|releases/||; s|/.next||' || true)
    ln -s 'releases/$target/.next' '.next.switch.\$\$'
    mv -T '.next.switch.\$\$' '.next'
    printf 'current=%s\nprevious=%s\nswitched_at=%s\n' \
      '$target' \"\$previous_live\" \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\" > '$STATE_FILE'
  "
  ok "symlink switched (atomic rename)"

  restart_service
  wait_for_http
  ok "rolled back to $target"
}

# ── service control ──────────────────────────────────────────────────────────
restart_service() {
  step "Restarting $PM2_APP"
  # --update-env re-reads the ecosystem env block; without it PM2 keeps the
  # environment the process was originally started with.
  remote "cd '$APP_DIR' && pm2 restart '$PM2_APP' --update-env >/dev/null 2>&1 && pm2 describe '$PM2_APP' | grep -E 'status' | head -1 | sed 's/^/    /'"
}

wait_for_http() {
  step "Waiting for the service to answer"
  remote "
    for i in \$(seq 1 40); do
      code=\$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ras-amr || echo 000)
      if [ \"\$code\" = '200' ]; then echo \"    ok   HTTP 200 after \${i}s\"; exit 0; fi
      sleep 1
    done
    echo '    service never returned HTTP 200'
    exit 1
  " || die "service did not come up"
}

# ── deploy ───────────────────────────────────────────────────────────────────
cmd_deploy() {
  local skip_build=0 auto_rollback=1
  for arg in "$@"; do
    case "$arg" in
      --skip-build)      skip_build=1 ;;
      --no-auto-rollback) auto_rollback=0 ;;
      *) die "unknown option: $arg" ;;
    esac
  done

  local release_id
  release_id="$(date -u +%Y%m%d-%H%M%S)-$(cd "$REPO_ROOT" && git rev-parse --short HEAD 2>/dev/null || echo nogit)"

  step "Release $release_id"
  info "target $REMOTE:$APP_DIR"

  # 1 ── build
  if [ "$skip_build" -eq 1 ]; then
    [ -f "$REPO_ROOT/.next/BUILD_ID" ] || die "--skip-build given but .next/BUILD_ID is missing"
    warn "using the existing build (--skip-build)"
  else
    step "Building"
    # The release id becomes the deployment id, so a client left open across
    # this release is reloaded rather than broken by Server Action ids it has
    # never seen.
    ( cd "$REPO_ROOT" && NEXT_DEPLOYMENT_ID="$release_id" npm run build >/dev/null 2>&1 ) \
      || die "build failed — run 'npm run build' to see why"
    ok "build completed (deployment id $release_id)"
  fi
  local build_id
  build_id="$(cat "$REPO_ROOT/.next/BUILD_ID")"
  info "BUILD_ID $build_id"

  # 2 ── package: one archive, so a partial transfer is a broken file rather
  #      than a half-written directory
  step "Packaging one release artifact"
  rm -f "$ARTIFACT"
  tar "${TAR_FLAGS[@]}" -czf "$ARTIFACT" -C "$REPO_ROOT" \
      --exclude='.next/dev' --exclude='.next/cache' .next
  local local_sum
  local_sum="$(sha256sum "$ARTIFACT" | cut -d' ' -f1)"
  info "size   $(du -h "$ARTIFACT" | cut -f1)"
  info "sha256 $local_sum"

  # 3 ── upload
  step "Uploading"
  scp -q -o BatchMode=yes -i "$SSH_KEY" "$ARTIFACT" "$REMOTE:/tmp/azma-release.tar.gz" \
    || die "upload failed — the live release was not touched"
  ok "artifact delivered"

  # 4 ── integrity gate: nothing on the server changes until this passes
  step "Verifying integrity"
  local remote_sum
  remote_sum="$(remote "sha256sum /tmp/azma-release.tar.gz | cut -d' ' -f1")"
  info "local  $local_sum"
  info "remote $remote_sum"
  if [ "$local_sum" != "$remote_sum" ]; then
    remote "rm -f /tmp/azma-release.tar.gz" || true
    die "SHA-256 MISMATCH — transfer corrupt. The live release was not touched."
  fi
  ok "checksums match"

  # 5 ── stage on the target filesystem, then validate before it can go live
  step "Staging"
  remote "
    set -e
    rm -rf '$STAGING_DIR'
    mkdir -p '$STAGING_DIR' '$RELEASES_DIR'
    tar -xzf /tmp/azma-release.tar.gz -C '$STAGING_DIR'
    rm -f /tmp/azma-release.tar.gz
    test -f '$STAGING_DIR/.next/BUILD_ID' || { echo '    staged build has no BUILD_ID'; exit 1; }
    staged_id=\$(cat '$STAGING_DIR/.next/BUILD_ID')
    [ \"\$staged_id\" = '$build_id' ] || { echo \"    staged BUILD_ID \$staged_id != '$build_id'\"; exit 1; }
    chunks=\$(ls '$STAGING_DIR/.next/static/chunks' 2>/dev/null | wc -l)
    [ \"\$chunks\" -gt 0 ] || { echo '    staged build has no client chunks'; exit 1; }
    echo \"    ok   BUILD_ID \$staged_id, \$chunks chunks\"
  " || die "staging failed — the live release was not touched"

  # 6 ── move staged into its own immutable release directory (same
  #      filesystem, so this is a real atomic rename)
  step "Installing release"
  remote "
    set -e
    rm -rf '$RELEASES_DIR/$release_id'
    mkdir -p '$RELEASES_DIR/$release_id'
    mv -T '$STAGING_DIR/.next' '$RELEASES_DIR/$release_id/.next'
    rm -rf '$STAGING_DIR'
    echo '    ok   $RELEASES_DIR/$release_id'
  "

  # 7 ── first run migrates the unmanaged .next directory into a release so
  #      there is something to roll back to. The legacy id is computed here,
  #      locally, so the remote never has to expand anything into a directory
  #      name — a name carrying shell metacharacters is a hazard for every
  #      later command that has to handle it.
  local legacy_id="pre-managed-$(date -u +%Y%m%d-%H%M%S)"
  step "Preparing the switch"
  remote "
    set -e
    cd '$APP_DIR'
    if [ -d .next ] && [ ! -L .next ]; then
      mkdir -p '$RELEASES_DIR/$legacy_id'
      mv -T .next '$RELEASES_DIR/$legacy_id/.next'
      printf 'previous=%s\n' '$legacy_id' > '$STATE_FILE'
      echo '    ok   existing build preserved as $legacy_id'
    else
      echo '    ok   already managed by this deployment path'
    fi
  "

  # 8 ── go live: a single rename(2)
  step "Switching to the new release"
  remote "
    set -e
    cd '$APP_DIR'
    previous_live=\$(readlink .next 2>/dev/null | sed 's|releases/||; s|/.next||' || true)
    if [ -z \"\$previous_live\" ] && [ -f '$STATE_FILE' ]; then
      previous_live=\$(grep '^previous=' '$STATE_FILE' | cut -d= -f2 || true)
    fi
    ln -s 'releases/$release_id/.next' '.next.switch.\$\$'
    mv -T '.next.switch.\$\$' '.next'
    printf 'current=%s\nprevious=%s\nswitched_at=%s\n' \
      '$release_id' \"\$previous_live\" \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\" > '$STATE_FILE'
    echo \"    ok   .next -> \$(readlink .next)\"
    echo \"    ok   rollback target: \$previous_live\"
  "

  restart_service
  wait_for_http

  # 9 ── the only evidence that counts
  step "Live verification"
  local verdict=0
  node "$REPO_ROOT/scripts/verify-deployment.mjs" "$LIVE_URL" || verdict=$?

  case "$verdict" in
    0)
      ok "live verification passed"
      ;;
    2)
      # The checker could not reach the site. Rolling back here would discard
      # a release because the operator's network dropped, so it does not.
      printf '\n%sVERIFICATION INCONCLUSIVE%s\n' "$Y" "$Z" >&2
      warn "release $release_id is live but unverified — no rollback performed"
      warn "re-run when the network is stable:  ./scripts/deploy.sh verify"
      exit 2
      ;;
    *)
      printf '\n%sLIVE VERIFICATION FAILED%s\n' "$R" "$Z" >&2
      if [ "$auto_rollback" -eq 1 ]; then
        warn "rolling back automatically"
        cmd_rollback
        die "deployment rolled back — release $release_id is on disk but not live"
      fi
      die "release $release_id is live but did not verify. Roll back with: ./scripts/deploy.sh rollback"
      ;;
  esac

  # 10 ── prune, keeping rollback depth
  step "Pruning old releases"
  remote "
    cd '$RELEASES_DIR' 2>/dev/null || exit 0
    keep=$KEEP_RELEASES
    total=\$(ls -1t | wc -l)
    if [ \"\$total\" -gt \"\$keep\" ]; then
      ls -1t | tail -n +\$((keep+1)) | while read -r old; do
        rm -rf \"\$old\"; echo \"    removed \$old\"
      done
    else
      echo \"    \$total release(s) kept\"
    fi
  "

  rm -f "$ARTIFACT"
  printf '\n%sDEPLOYED%s  %s  (BUILD_ID %s)\n' "$G" "$Z" "$release_id" "$build_id"
}

# ── entry ────────────────────────────────────────────────────────────────────
require_tools
case "${1:-deploy}" in
  deploy)   shift || true; cmd_deploy "$@" ;;
  rollback) shift || true; cmd_rollback "$@" ;;
  status)   cmd_status ;;
  verify)   cmd_verify ;;
  *) die "usage: deploy.sh [deploy [--skip-build] [--no-auto-rollback] | rollback [release-id] | status | verify]" ;;
esac
