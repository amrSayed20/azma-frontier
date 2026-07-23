/**
 * AZMA OS — THE BUTTON ENGINE
 * Public API — import from here, never directly from the individual
 * files.
 *
 * New constitutional work. Decides which constitutional actions are
 * available for a given context; never performs an action, never owns
 * copy, never touches auth or billing logic directly. See types.ts for
 * the full disclosure of what this deliberately is not.
 */

export type { Threshold, ChamberState, ButtonContext, ConstitutionalActionId, ActionDefinition, AvailableAction } from './types';
export { CONSTITUTIONAL_ACTIONS } from './action-registry';
export { resolveAvailableActions } from './resolve-available-actions';
