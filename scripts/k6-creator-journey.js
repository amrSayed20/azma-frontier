/**
 * AZMA OS — k6 Load Test: Complete Creator Journey
 *
 * Simulates multiple Creators completing full constitutional journeys
 * simultaneously. Each virtual user:
 *   1. Hits the Arrival page
 *   2. Authenticates (login)
 *   3. Hits the Foyer presence endpoint
 *   4. Hits the Al Hujjah investigation endpoint
 *   5. Checks Qiyamah generation history
 *   6. Hits the Ras Al Amr canvas list
 *   7. Hits the Makman goals endpoint
 *
 * RUN: k6 run scripts/k6-creator-journey.js
 *
 * The test ramps from 1 to N concurrent users and measures where
 * constitutional dignity begins to degrade (p95 > 500ms).
 *
 * BEFORE RUNNING: replace TEST_EMAIL and TEST_PASSWORD with
 * a real Creator account on the production server.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Replace before running ─────────────────────────────────────────
const BASE         = 'http://localhost:3000';
const TEST_EMAIL   = 'creator-test@azmaos.com';
const TEST_PASSWORD = 'TestCreator123!';
// ──────────────────────────────────────────────────────────────────

const degradationRate = new Rate('constitutional_degradation');
const foyer_latency   = new Trend('foyer_presence_ms');
const hujjah_latency  = new Trend('hujjah_investigation_ms');
const auth_latency    = new Trend('auth_login_ms');

export const options = {
  stages: [
    { duration: '30s', target: 1   },  // Baseline: 1 Creator
    { duration: '1m',  target: 5   },  // 5 simultaneous journeys
    { duration: '1m',  target: 10  },  // 10 simultaneous journeys
    { duration: '1m',  target: 15  },  // 15 simultaneous journeys
    { duration: '1m',  target: 20  },  // 20 simultaneous journeys
    { duration: '30s', target: 0   },  // Ramp down
  ],
  thresholds: {
    // Constitutional dignity threshold: 95% of requests under 500ms
    'http_req_duration{endpoint:presence}': ['p(95)<500'],
    'http_req_duration{endpoint:auth}':     ['p(95)<1000'],
    // Track degradation rate
    'constitutional_degradation':           ['rate<0.05'],
  },
};

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // ── STEP 1: Arrival ────────────────────────────────────────────
  const arrival = http.get(`${BASE}/`, { tags: { endpoint: 'arrival' } });
  check(arrival, {
    'Arrival page loads': (r) => r.status === 200,
    'Arrival under 300ms': (r) => r.timings.duration < 300,
  });

  sleep(0.5);

  // ── STEP 2: Authentication ─────────────────────────────────────
  const loginStart = Date.now();
  const login = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers, tags: { endpoint: 'auth' } }
  );
  auth_latency.add(Date.now() - loginStart);

  const loginOk = check(login, {
    'Login succeeds': (r) => r.status === 200 && JSON.parse(r.body).status === 'succeeded',
    'Login under 1000ms': (r) => r.timings.duration < 1000,
  });

  if (!loginOk) {
    degradationRate.add(1);
    return;
  }

  const sessionCookie = login.cookies['azma_session']?.[0]?.value;
  if (!sessionCookie) return;

  const authHeaders = { ...headers, Cookie: `azma_session=${sessionCookie}` };

  sleep(0.5);

  // ── STEP 3: Imperial Foyer — Presence ─────────────────────────
  const presenceStart = Date.now();
  const presence = http.get(
    `${BASE}/api/sovereign/presence`,
    { headers: authHeaders, tags: { endpoint: 'presence' } }
  );
  const presenceMs = Date.now() - presenceStart;
  foyer_latency.add(presenceMs);

  const presenceOk = check(presence, {
    'Presence succeeds': (r) => r.status === 200 && JSON.parse(r.body).status === 'succeeded',
    'Presence under 500ms': (r) => r.timings.duration < 500,
  });
  if (!presenceOk) degradationRate.add(1);

  sleep(1);

  // ── STEP 4: Al Hujjah — Goal list (investigation state) ───────
  const hujjahStart = Date.now();
  const goals = http.get(
    `${BASE}/api/sovereign/entry/creator-goal`,
    { headers: authHeaders, tags: { endpoint: 'hujjah' } }
  );
  hujjah_latency.add(Date.now() - hujjahStart);

  check(goals, {
    'Goals endpoint responds': (r) => r.status === 200 || r.status === 401,
    'Goals under 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // ── STEP 5: Qiyamah — Generation history ──────────────────────
  const qiyamah = http.get(
    `${BASE}/api/qiyamah/generations`,
    { headers: authHeaders, tags: { endpoint: 'qiyamah' } }
  );
  check(qiyamah, {
    'Generations history responds': (r) => r.status === 200 || r.status === 401,
    'Generations under 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // ── STEP 6: Ras Al Amr — Canvas list ──────────────────────────
  const canvas = http.get(
    `${BASE}/api/ras-amr/canvas`,
    { headers: authHeaders, tags: { endpoint: 'ras-amr' } }
  );
  check(canvas, {
    'Canvas list responds': (r) => r.status === 200 || r.status === 401,
    'Canvas under 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);

  // ── STEP 7: Vault — Asset list ─────────────────────────────────
  const vault = http.get(
    `${BASE}/api/vault/assets`,
    { headers: authHeaders, tags: { endpoint: 'vault' } }
  );
  check(vault, {
    'Vault assets responds': (r) => r.status === 200 || r.status === 401,
    'Vault under 300ms': (r) => r.timings.duration < 300,
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    '/home/azma/k6-results.json': JSON.stringify(data, null, 2),
    stdout: `
══════════════════════════════════════════════════════
  AZMA OS — CREATOR JOURNEY CAPACITY RESULTS
══════════════════════════════════════════════════════

  Auth login (p95):         ${Math.round(data.metrics['http_req_duration{endpoint:auth}']?.values?.['p(95)'] ?? 0)}ms
  Foyer presence (p95):     ${Math.round(data.metrics['http_req_duration{endpoint:presence}']?.values?.['p(95)'] ?? 0)}ms
  Al Hujjah goals (p95):   ${Math.round(data.metrics['http_req_duration{endpoint:hujjah}']?.values?.['p(95)'] ?? 0)}ms
  Qiyamah history (p95):   ${Math.round(data.metrics['http_req_duration{endpoint:qiyamah}']?.values?.['p(95)'] ?? 0)}ms
  Ras Al Amr canvas (p95): ${Math.round(data.metrics['http_req_duration{endpoint:ras-amr}']?.values?.['p(95)'] ?? 0)}ms
  Vault assets (p95):       ${Math.round(data.metrics['http_req_duration{endpoint:vault}']?.values?.['p(95)'] ?? 0)}ms

  Constitutional degradation rate: ${(data.metrics.constitutional_degradation?.values?.rate ?? 0 * 100).toFixed(2)}%
  Max concurrent users tested: (see k6 stages above)

══════════════════════════════════════════════════════
`,
  };
}
