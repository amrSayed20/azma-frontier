import { CHAMBER_TRUTH } from '../chamber-truth';
import type { TruthCapabilityId } from '../chamber-truth';
import type {
  ManifestChamberContext,
  ManifestInteractionMode,
  ManifestOperatingMode,
  SovereignChamberCapability,
} from './types';

/**
 * AZMA OS — SOVEREIGN CHAMBER MANIFEST
 * Derivation from Chamber Truth
 *
 * ─── THE RULING THIS FILE ENACTS ────────────────────────────────────────────
 *
 *   Sovereign Journey ruling, 2026-09-21:
 *
 *     CHAMBER TRUTH → DERIVED MANIFEST → AWARENESS / INTERACTIVE CONSUMER
 *
 *   Until this file existed the Manifest declared its own capabilities — 19
 *   of them, in prose, with no service boundary behind any — and they
 *   disagreed with Chamber Truth in every Chamber: the Vault claimed speech
 *   and voice cloning (Ras Al Amr's), Makman claimed to record observations
 *   (the boundary exports GET alone) and to request knowledge investigations
 *   from a route this repository does not have, Qiyamah did not know it
 *   could edit inside an asset. And the Interaction Kernel was resolving
 *   the Foyer's every launch against that list.
 *
 *   Now a Manifest capability IS a Truth capability. Same id. Its `purpose`
 *   is Truth's `performs`. Its precondition is Truth's `requiresExistingAsset`.
 *   What this file adds is only what the Kernel needs to DELIVER it and Truth
 *   has no reason to know: how a Creator triggers it (browse, write, listen)
 *   and in which operating mode it lives.
 *
 * ─── WHY A Record<TruthCapabilityId, …> ─────────────────────────────────────
 *
 *   The table below is typed against the closed set of Truth ids. Add a
 *   capability to Truth and forget it here — the compiler refuses. Name a
 *   capability here that Truth does not have — the compiler refuses. Two
 *   lists that could drift are now one list and a projection of it.
 *
 * ─── WHAT WAS DROPPED, AND WHY ──────────────────────────────────────────────
 *
 *   The old Manifest described requiredInputs, optionalInputs, outputType and
 *   failureConditions for each capability. Nothing reads them: the Kernel
 *   copies the inputs into a session that the Chambers read only for its
 *   `status`, and nothing reads the other two at all. Truth does not declare
 *   inputs — the boundary handler does, in code — so the Manifest may not
 *   either. Inputs are now empty by derivation, not by omission, and the two
 *   unread fields are gone from the contract.
 */

/** How the Kernel delivers one Truth capability. Nothing here restates Truth. */
interface KernelDelivery {
  /**
   * English, deliberately: the Kernel's text resolver scores on [a-z0-9]
   * words only (capability-resolver.ts, buildRequestWords). This is the
   * matching vocabulary, not a label shown to a Creator — the Creator
   * Language Experience owns what a capability is called.
   */
  readonly displayName: string;
  readonly interactionModes: readonly ManifestInteractionMode[];
  readonly operatingModes: readonly ManifestOperatingMode[];
}

/**
 * Modes preserved from the old Manifest where the capability is the same
 * one under a new id; assigned from the boundary handler where it is new.
 * `write` where the handler needs text from the Creator; `browse` where a
 * click suffices; `listen` where the old Manifest already offered voice.
 */
const KERNEL_DELIVERY: Record<TruthCapabilityId, KernelDelivery> = {
  // ── الحُجّة الدامغة ─────────────────────────────────────────────────────
  'run-investigation':   { displayName: 'Investigate a Question',            interactionModes: ['write', 'listen'], operatingModes: ['guided', 'explorer'] },
  'keep-evidence':       { displayName: 'Keep a Piece of Evidence',          interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'keep-investigation':  { displayName: 'Keep the Whole Investigation',      interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'compose-scene-structure':  { displayName: 'Compose a Scene Structure',   interactionModes: ['browse'],          operatingModes: ['guided'] },
  'compose-creation-demand': { displayName: 'Compose a Creation Demand',     interactionModes: ['browse'],          operatingModes: ['guided'] },

  // ── القيامة ─────────────────────────────────────────────────────────────
  'generate-image':      { displayName: 'Generate an Image',                 interactionModes: ['write', 'listen'], operatingModes: ['guided'] },
  'generate-video':      { displayName: 'Generate a Video',                 interactionModes: ['write', 'listen'], operatingModes: ['guided'] },
  'expand-intent':       { displayName: 'Expand the Description',            interactionModes: ['write'],           operatingModes: ['guided'] },
  'edit-inside-asset':   { displayName: 'Edit Inside an Image',              interactionModes: ['write'],           operatingModes: ['explorer'] },
  'animate-asset':       { displayName: 'Animate an Image into Video',      interactionModes: ['write'],           operatingModes: ['explorer'] },
  'review-generations':  { displayName: 'List Past Generations',             interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'discard-generation':  { displayName: 'Discard a Generation',              interactionModes: ['browse'],          operatingModes: ['explorer'] },

  // ── الخزائن ─────────────────────────────────────────────────────────────
  'review-assets':       { displayName: 'Browse Stored Assets',              interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'receive-asset':       { displayName: 'Upload an Asset',                   interactionModes: ['browse'],          operatingModes: ['guided', 'explorer'] },
  'adopt-legacy-asset':  { displayName: 'Adopt a Legacy Asset',              interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'publish-work':        { displayName: 'Publish a Finished Work',           interactionModes: ['browse'],          operatingModes: ['guided'] },
  'discard-asset':       { displayName: 'Discard an Asset',                  interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'set-pin':             { displayName: 'Set the Vault PIN',                 interactionModes: ['write'],           operatingModes: ['guided'] },
  'open-with-pin':       { displayName: 'Open the Vault with a PIN',         interactionModes: ['write'],           operatingModes: ['guided'] },
  'enrol-device':        { displayName: 'Enrol a Device',                    interactionModes: ['browse'],          operatingModes: ['guided'] },
  'open-with-device':    { displayName: 'Open the Vault with a Device',      interactionModes: ['browse'],          operatingModes: ['guided'] },
  'review-devices':      { displayName: 'Review Enrolled Devices',           interactionModes: ['browse'],          operatingModes: ['explorer'] },

  // ── رأس الأمر ───────────────────────────────────────────────────────────
  'compose-storyboard-from-brief': { displayName: 'Compose a Storyboard from a Written Brief', interactionModes: ['write'], operatingModes: ['guided'] },
  'keep-canvas':         { displayName: 'Save and Reload the Direction Canvas', interactionModes: ['browse'],       operatingModes: ['guided', 'explorer'] },
  'direct-automatically':{ displayName: 'Direct Automatically',              interactionModes: ['browse'],          operatingModes: ['guided'] },
  'compile-production':  { displayName: 'Compile the Production',            interactionModes: ['browse'],          operatingModes: ['guided'] },
  'follow-production':   { displayName: 'Follow the Production',             interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'give-voice':          { displayName: 'Generate a Speech Asset',           interactionModes: ['write'],           operatingModes: ['guided'] },
  'clone-voice':         { displayName: 'Clone a Voice',                     interactionModes: ['browse'],          operatingModes: ['guided'] },
  'import-subtitles':    { displayName: 'Import a Subtitle File',            interactionModes: ['browse'],          operatingModes: ['guided'] },
  'restore-canvas':      { displayName: 'Restore a Saved Canvas',            interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'give-cloned-voice':   { displayName: 'Speak in a Cloned Voice',           interactionModes: ['write'],           operatingModes: ['guided'] },

  // ── مكمن الغاية ─────────────────────────────────────────────────────────
  'declare-purpose':     { displayName: 'Declare Sovereign Purpose',         interactionModes: ['write', 'listen'], operatingModes: ['guided'] },
  'set-goal':            { displayName: 'Register a Goal',                   interactionModes: ['write', 'listen'], operatingModes: ['guided'] },
  'define-success':      { displayName: 'Define Success Criteria',           interactionModes: ['write', 'listen'], operatingModes: ['guided'] },
  'observe-reality':     { displayName: 'Read Reality Observations',         interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'assess-fulfilment':   { displayName: 'Assess Goal Fulfilment',            interactionModes: ['browse'],          operatingModes: ['guided'] },
  'find-the-gap':        { displayName: 'Read the Fulfilment Gap',           interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'read-goal':           { displayName: 'Read a Goal',                       interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'mark-milestone':      { displayName: 'Mark a Goal as a Milestone',        interactionModes: ['browse'],          operatingModes: ['guided'] },
  'name-knowledge-requirements': { displayName: 'Name What Must Be Learned', interactionModes: ['browse'],          operatingModes: ['explorer'] },
  'investigate-for-goal':{ displayName: 'Investigate for a Goal',            interactionModes: ['browse'],          operatingModes: ['guided'] },
  'issue-knowledge-requests': { displayName: 'Issue Knowledge Requests',    interactionModes: ['browse'],          operatingModes: ['guided'] },
};

/** The only precondition Truth declares; the Manifest may not add others. */
const NEEDS_ASSET = 'An existing sovereign asset the Creator owns';

/**
 * The Manifest's capabilities for one Chamber, projected from Chamber Truth.
 *
 * Order is Truth's order, and it is now only order. It used to carry an
 * authority nobody declared: the Kernel resolved a bare navigate intent to
 * `capabilities[0]`, so wherever a capability happened to sit in this array
 * decided where every unaddressed visit landed. Adding one to رأس الأمر
 * on 2026-09-25 moved that destination, and only a test noticed. Each Chamber
 * now states `primaryCapabilityId` in Truth and the Kernel reads that.
 */
export function deriveManifestCapabilities(chamberId: ManifestChamberContext): readonly SovereignChamberCapability[] {
  return CHAMBER_TRUTH[chamberId].capabilities.map((capability) => {
    const delivery = KERNEL_DELIVERY[capability.id];
    return {
      capabilityId: capability.id,
      displayName: delivery.displayName,
      purpose: capability.performs,
      requiredInputs: [],
      optionalInputs: [],
      preconditions: capability.requiresExistingAsset ? [NEEDS_ASSET] : [],
      interactionModes: delivery.interactionModes,
      operatingModes: delivery.operatingModes,
    };
  });
}
