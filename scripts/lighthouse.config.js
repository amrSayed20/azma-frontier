/**
 * AZMA OS — Lighthouse CI Configuration
 *
 * Measures First Contentful Paint, Largest Contentful Paint,
 * and Time to Interactive for every constitutional page.
 *
 * RUN (after deploying to server):
 *   npm install -g @lhci/cli
 *   lhci autorun --config=scripts/lighthouse.config.js
 *
 * Or one page at a time:
 *   lighthouse https://yourdomain.com --output=json --output-path=/tmp/arrival-lh.json
 *   lighthouse https://yourdomain.com/imperial-foyer --output=json --output-path=/tmp/foyer-lh.json
 *   lighthouse https://yourdomain.com/hujjah-al-damighah --output=json --output-path=/tmp/hujjah-lh.json
 *
 * Install Lighthouse: npm install -g lighthouse
 */

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'https://REPLACE_WITH_DOMAIN/',
        'https://REPLACE_WITH_DOMAIN/imperial-foyer',
        'https://REPLACE_WITH_DOMAIN/hujjah-al-damighah',
        'https://REPLACE_WITH_DOMAIN/qiyamah-chamber',
        'https://REPLACE_WITH_DOMAIN/ras-amr',
        'https://REPLACE_WITH_DOMAIN/makman-al-ghayah',
      ],
      settings: {
        // Simulate a real device (not throttled — we want server performance)
        throttling: { cpuSlowdownMultiplier: 1 },
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1440,
          height: 900,
          deviceScaleFactor: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Constitutional dignity thresholds
        'first-contentful-paint':  ['warn', { maxNumericValue: 1500 }],  // < 1.5s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'interactive':              ['warn', { maxNumericValue: 3500 }],  // < 3.5s
        'total-blocking-time':      ['warn', { maxNumericValue: 300 }],   // < 300ms
        'cumulative-layout-shift':  ['warn', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
