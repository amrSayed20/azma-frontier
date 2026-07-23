/**
 * AZMA OS — FOUNDER ACCESS FOUNDATION
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Constructs only the Founder Access Foundation named by this Package's
 * own scope: guaranteed bootstrap, route protection, and the gateway
 * leading toward the future Command Bridge. Uses the already-certified
 * Authentication Foundation as its sole operational basis — no second
 * Founder system, no parallel tables, no parallel sessions.
 */

export { verifyFounderSession } from './founder-gate';

/** The current stand-in destination for "The Command Bridge" — not the real thing, disclosed as a First-Launch placeholder per this Package's own Boundaries. */
export const COMMAND_BRIDGE_PATH = '/sovereign-high-council' as const;

/** The Founder's own dedicated Constitutional Entry — distinct from the generic Creator-facing /login. */
export const FOUNDER_GATEWAY_PATH = '/founder' as const;
