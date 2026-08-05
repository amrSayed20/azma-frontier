/**
 * AZMA OS — k6 Load Test: Al Hujjah Investigation Capacity
 *
 * Measures how many simultaneous knowledge investigations the
 * Empire can sustain. Investigations are I/O-bound (external APIs),
 * so they should handle concurrency better than CPU-bound operations.
 *
 * The test fires real POST requests to the investigation endpoint.
 * Each request triggers the full chain:
 *   Reception → Understanding → Investigation → Evidence → Knowledge
 *
 * RUN: k6 run scripts/k6-investigation-capacity.js
 * NOTE: Each run WILL hit external APIs (Wikipedia, Gutenberg, etc.)
 *       Use a test goal_id from a real Creator account.
 */

import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const BASE         = 'http://localhost:3000';
const SESSION_COOKIE = 'REPLACE_WITH_REAL_CREATOR_SESSION';
const GOAL_ID        = 'REPLACE_WITH_REAL_GOAL_ID';

const investigationDuration = new Trend('investigation_total_ms');

export const options = {
  stages: [
    { duration: '30s', target: 1  },
    { duration: '1m',  target: 5  },
    { duration: '1m',  target: 10 },
    { duration: '1m',  target: 15 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    // Investigation should complete within 30s (external APIs can be slow)
    'investigation_total_ms': ['p(95)<30000'],
  },
};

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    Cookie: `azma_session=${SESSION_COOKIE}`,
  };

  const start = Date.now();
  const res = http.get(
    `${BASE}/api/sovereign/entry/creator-goal/${GOAL_ID}/knowledge-investigation`,
    { headers, timeout: '60s' }
  );
  investigationDuration.add(Date.now() - start);

  check(res, {
    'Investigation completed': (r) => r.status === 200,
    'No timeout': (r) => r.timings.duration < 30000,
  });
}
