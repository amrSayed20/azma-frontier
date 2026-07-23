/**
 * AZMA OS — CHAMBER VISION
 * Public API — import from here, never directly from the individual files.
 *
 * IMPERIAL VISION DOCUMENTS (2026-07-23): "The Registry defines the
 * Chamber. The Vision defines the Chamber's philosophy. These are
 * separate constitutional artifacts. They shall never be merged." This
 * module is that separation made structural — src/chamber-identity/
 * answers "who am I" with cited fact; this module answers "how do I
 * think" with philosophy grounded in that same fact, never contradicting
 * it. Schema: Chamber Philosophy, Constitutional Responsibility (its
 * philosophical register, not Identity's factual authorityScope
 * restated), Chamber Personality, Creator Experience, Production Modes
 * (null where a Chamber has one continuous mode — real for Ras Al Amr's
 * Automatic/Manual Director split, grounded in app/ras-amr/page.tsx's
 * actual directingMode state), Entry and Exit Transformation, and Unique
 * Chamber Value. Not yet consumed by any route or UI.
 */

export type { ImperialVisionDocument, ProductionMode } from './types';
export { IMPERIAL_VISION_DOCUMENTS } from './vision-registry';
export { getVisionDocument, listVisionDocuments } from './queries';
