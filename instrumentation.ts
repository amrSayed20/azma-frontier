/**
 * AZMA OS — FOUNDER ACCESS FOUNDATION
 * Guaranteed Startup Bootstrap
 *
 * Next.js calls register() exactly once when the server process starts
 * (both `next dev` and a real `next start`). This closes the gap named
 * explicitly by the Final Pre-Launch Audit: ensureFounderAccountExists()
 * (Authentication Foundation) existed but was never actually invoked
 * anywhere in the running app — meaning a real deployment would never
 * have provisioned a Founder even with FOUNDER_EMAIL/FOUNDER_PASSWORD
 * configured. Idempotent — safe to run on every restart.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureFounderAccountExists } = await import('./src/authentication');
    await ensureFounderAccountExists();
  }
}
