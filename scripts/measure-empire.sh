#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# AZMA OS — IMPERIAL CAPACITY MEASUREMENT PROTOCOL
#
# PURPOSE: Produce the definitive reference table for the Empire.
# RUN ON:  The actual Hetzner server, after deployment, as user azma.
# OUTPUT:  Every cell of the final capacity table, with real numbers.
#
# REQUIREMENTS:
#   apt install -y wrk
#   k6 (see install below)
#
# USAGE:
#   chmod +x scripts/measure-empire.sh
#   ./scripts/measure-empire.sh | tee /home/azma/capacity-report.txt
# ═══════════════════════════════════════════════════════════════════

BASE="http://localhost:3000"
RESULTS_FILE="/home/azma/capacity-results.txt"

echo "══════════════════════════════════════════"
echo "  AZMA OS — IMPERIAL CAPACITY MEASUREMENT"
echo "  $(date)"
echo "══════════════════════════════════════════"
echo "" | tee -a "$RESULTS_FILE"

# ── PREREQUISITE: k6 ───────────────────────────────────────────────
if ! command -v k6 &> /dev/null; then
  echo "Installing k6..."
  curl -s https://packagecloud.io/install/repositories/k6/stable/script.deb.sh | sudo bash
  sudo apt install -y k6
fi

if ! command -v wrk &> /dev/null; then
  echo "Installing wrk..."
  sudo apt install -y wrk
fi

# ── FUNCTION: measure with wrk ─────────────────────────────────────
measure_wrk() {
  local label="$1"
  local url="$2"
  local threads="${3:-4}"
  local connections="${4:-20}"
  local duration="${5:-30s}"
  local headers="${6:-}"

  echo ""
  echo "▶ $label"
  echo "  URL: $url | connections: $connections | duration: $duration"

  if [ -n "$headers" ]; then
    wrk -t"$threads" -c"$connections" -d"$duration" -H "$headers" "$url" 2>&1 | \
      grep -E "Requests/sec|Latency|99%|errors" | \
      tee -a "$RESULTS_FILE"
  else
    wrk -t"$threads" -c"$connections" -d"$duration" "$url" 2>&1 | \
      grep -E "Requests/sec|Latency|99%|errors" | \
      tee -a "$RESULTS_FILE"
  fi
}

# ══════════════════════════════════════════════════════════════════
# MEASUREMENT 1: HOME PAGE — FIRST PAINT PROXY
# Measures how fast the server delivers the first HTML byte.
# ══════════════════════════════════════════════════════════════════
echo ""
echo "━━━ MEASUREMENT 1: HOME PAGE THROUGHPUT ━━━"
measure_wrk "Arrival Page (1 connection — baseline)" "$BASE/" 1 1 30s
measure_wrk "Arrival Page (10 concurrent)" "$BASE/" 4 10 30s
measure_wrk "Arrival Page (25 concurrent)" "$BASE/" 4 25 30s
measure_wrk "Arrival Page (50 concurrent)" "$BASE/" 8 50 30s

# ══════════════════════════════════════════════════════════════════
# MEASUREMENT 2: SESSION VERIFICATION — AUTH PRESSURE
# Every authenticated request runs verifySession(). This measures
# the Empire's throughput for authenticated operations.
# ══════════════════════════════════════════════════════════════════
echo ""
echo "━━━ MEASUREMENT 2: AUTHENTICATED ENDPOINT THROUGHPUT ━━━"
# Replace SESSION_COOKIE_VALUE with a real Founder session after login
SESSION_COOKIE="azma_session=REPLACE_WITH_REAL_FOUNDER_SESSION"
measure_wrk "Auth/Me (1 connection)" "$BASE/api/auth/me" 1 1 30s "Cookie: $SESSION_COOKIE"
measure_wrk "Auth/Me (10 concurrent)" "$BASE/api/auth/me" 4 10 30s "Cookie: $SESSION_COOKIE"
measure_wrk "Auth/Me (25 concurrent)" "$BASE/api/auth/me" 4 25 30s "Cookie: $SESSION_COOKIE"
measure_wrk "Auth/Me (50 concurrent)" "$BASE/api/auth/me" 8 50 30s "Cookie: $SESSION_COOKIE"

# ══════════════════════════════════════════════════════════════════
# MEASUREMENT 3: FOYER PRESENCE — DATABASE READ PRESSURE
# presence endpoint reads from 4 tables in one request.
# This is the most common authenticated API call in the Empire.
# ══════════════════════════════════════════════════════════════════
echo ""
echo "━━━ MEASUREMENT 3: FOYER PRESENCE THROUGHPUT ━━━"
measure_wrk "Presence (10 concurrent)" "$BASE/api/sovereign/presence" 4 10 30s "Cookie: $SESSION_COOKIE"
measure_wrk "Presence (25 concurrent)" "$BASE/api/sovereign/presence" 4 25 30s "Cookie: $SESSION_COOKIE"
measure_wrk "Presence (50 concurrent)" "$BASE/api/sovereign/presence" 8 50 30s "Cookie: $SESSION_COOKIE"

# ══════════════════════════════════════════════════════════════════
# MEASUREMENT 4: HEALTH ENDPOINT — BASELINE
# ══════════════════════════════════════════════════════════════════
echo ""
echo "━━━ MEASUREMENT 4: HEALTH ENDPOINT ━━━"
measure_wrk "Health (1 connection)" "$BASE/api/health" 1 1 30s "Cookie: $SESSION_COOKIE"

# ══════════════════════════════════════════════════════════════════
# MEASUREMENT 5: MEMORY + CPU at peak
# ══════════════════════════════════════════════════════════════════
echo ""
echo "━━━ MEASUREMENT 5: SYSTEM RESOURCES AT PEAK ━━━"
echo "Run wrk in background with 50 connections:"
echo "  wrk -t8 -c50 -d60s $BASE/ &"
echo "  Then in another terminal: pm2 show azma-os"
echo ""

# ══════════════════════════════════════════════════════════════════
# SQLite PERFORMANCE
# ══════════════════════════════════════════════════════════════════
echo ""
echo "━━━ MEASUREMENT 6: SQLite JOURNAL MODE ━━━"
JOURNAL=$(sqlite3 /home/azma/azma-os/data/azma-os.db "PRAGMA journal_mode;")
echo "Current journal_mode: $JOURNAL"
echo "Note: 'delete' = reads blocked during writes. 'wal' = concurrent reads allowed."
echo "$JOURNAL" | tee -a "$RESULTS_FILE"

echo ""
echo "━━━ SQLite WRITE THROUGHPUT ━━━"
sqlite3 /home/azma/azma-os/data/azma-os.db << 'SQLEOF'
.timer on
BEGIN TRANSACTION;
SELECT COUNT(*) as baseline FROM sessions;
COMMIT;
SQLEOF

echo ""
echo "══════════════════════════════════════════"
echo "  MEASUREMENT COMPLETE"
echo "  Results saved to: $RESULTS_FILE"
echo "══════════════════════════════════════════"
