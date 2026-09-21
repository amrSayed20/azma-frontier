import type { ChamberId } from '@/src/chamber-identity';
import type { ChamberTruth } from './types';

/**
 * AZMA OS — CHAMBER TRUTH REGISTRY
 *
 * Every entry below was measured against the repository by reading the
 * handler and the verbs it exports — not by reading a page. First survey
 * 2026-09-21; a second survey the same day, ordered by the Sovereign Journey
 * ruling, walked 14 chamber-domain boundaries the first had not and
 * declared the thirteen that are Creator capabilities.
 *
 * A `Record<ChamberId, …>` on purpose: the compiler refuses the file if a
 * Chamber is missing, so a sixth Chamber cannot appear and a fifth cannot
 * quietly vanish.
 */
export const CHAMBER_TRUTH = {
  // ── الحُجّة الدامغة ───────────────────────────────────────────────────────
  //
  // No API routes at all. Its entire surface is three Server Actions, which a
  // route-only survey would have reported as an empty Chamber.
  'hujjah-al-damighah': {
    chamberId: 'hujjah-al-damighah',
    capabilities: [
      {
        id: 'run-investigation',
        performs: 'Runs a sovereign knowledge investigation and returns evidence with its verdict.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#runInvestigation' },
        requiresExistingAsset: false,
      },
      {
        id: 'keep-evidence',
        performs: 'Deposits a single piece of evidence into the Vault as a sovereign asset.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#depositEvidenceToVault' },
        requiresExistingAsset: false,
      },
      {
        id: 'keep-investigation',
        performs: 'Deposits a whole investigation into the Vault as a sovereign asset.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#depositInvestigationToVault' },
        requiresExistingAsset: false,
      },
    ],
    deferred: [
      {
        responsibility: 'Ideas, briefs, prompts and story structures.',
        constitutionalSource: 'Executive Construction Mandate §I.1 — the Chamber of Evidence\'s stated scope.',
        missing:
          'No service boundary. The Chamber exports exactly three Server Actions and no API route; '
          + 'nothing in the repository creates a brief, a prompt or a story structure.',
      },
    ],
  },

  // ── القيامة ──────────────────────────────────────────────────────────────
  'qiyamah-chamber': {
    chamberId: 'qiyamah-chamber',
    capabilities: [
      {
        id: 'generate-image',
        performs: 'Generates a new visual original from a described intent.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/generate', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'expand-intent',
        performs: 'Expands a Creator\'s brief description into a fuller generation intent.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/expand', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'edit-inside-asset',
        performs:
          'Edits inside an existing visual asset and deposits the result as a derived sovereign asset '
          + 'with its lineage recorded.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]/edit', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'review-generations',
        performs: 'Lists this Creator\'s own generations.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/generations', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        id: 'discard-generation',
        performs: 'Removes a generation, leaving a tombstone rather than a silent gap.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/generations/[recordId]', methods: ['DELETE'] },
        requiresExistingAsset: true,
      },
    ],
    deferred: [],
  },

  // ── الخزائن ──────────────────────────────────────────────────────────────
  'sovereign-vault-palace': {
    chamberId: 'sovereign-vault-palace',
    capabilities: [
      {
        id: 'review-assets',
        performs: 'Lists every sovereign asset this Creator owns, and nobody else\'s.',
        boundary: { kind: 'route', at: 'app/api/vault/assets', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        id: 'receive-asset',
        performs: 'Takes a file into the Vault as a sovereign asset with recorded provenance.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/upload', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'adopt-legacy-asset',
        performs:
          'Lifts the hold on an asset whose provenance predates the sovereign model, so it may be '
          + 'built upon. Invents no history: its recorded lineage begins at adoption.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]/adopt', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'publish-work',
        performs: 'Mints a revocable public link for a finished work, and withdraws it.',
        boundary: { kind: 'route', at: 'app/api/renders/[operationId]/publish', methods: ['POST', 'DELETE'] },
        requiresExistingAsset: true,
      },
      {
        id: 'discard-asset',
        performs:
          'Removes a sovereign asset the Creator owns, recording a tombstone that carries its lineage '
          + 'before the row and the file are destroyed (Constitution Article 6.3).',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]', methods: ['DELETE'] },
        requiresExistingAsset: true,
      },
      // ── Custody of identity — how the Vault opens ────────────────────────
      //
      // These are Creator actions in the Vault, not machinery: a Creator sets
      // the PIN, opens the Vault with it, enrols a device to open it with a
      // fingerprint or face, and withdraws a lost device. Identity and
      // permissions are the Vault's constitutional responsibility (Sovereign
      // Journey Mandate §VIII), so they are declared here and nowhere else.
      {
        id: 'set-pin',
        performs: 'Sets the PIN that opens this Creator\'s Vault.',
        boundary: { kind: 'route', at: 'app/api/vault/pin/setup', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'open-with-pin',
        performs: 'Opens the Vault by verifying the Creator\'s PIN.',
        boundary: { kind: 'route', at: 'app/api/vault/pin/verify', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'enrol-device',
        performs:
          'Enrols the Creator\'s own device to open the Vault with its fingerprint or face: GET issues '
          + 'the registration challenge, POST verifies what the device signed and keeps only its public key.',
        boundary: { kind: 'route', at: 'app/api/vault/biometric/enrol', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'open-with-device',
        performs:
          'Opens the Vault with an enrolled device: GET issues the authentication challenge, POST '
          + 'verifies the signed assertion.',
        boundary: { kind: 'route', at: 'app/api/vault/biometric/verify', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'review-devices',
        performs: 'Lists the devices enrolled to open this Vault, and withdraws one that is lost or no longer trusted.',
        boundary: { kind: 'route', at: 'app/api/vault/biometric/devices', methods: ['GET', 'DELETE'] },
        requiresExistingAsset: false,
      },
    ],
    deferred: [],
  },

  // ── رأس الأمر ────────────────────────────────────────────────────────────
  'ras-amr': {
    chamberId: 'ras-amr',
    capabilities: [
      {
        id: 'keep-canvas',
        performs: 'Saves and reloads the Creator\'s composition canvas.',
        // GET and POST. The first draft declared POST alone — an UNDER-claim,
        // which the boundary test of that day could not see because it only
        // asked whether declared verbs exist. Production answered GET with 401
        // during live verification; the test now demands equality, so a verb
        // the handler exports and this file omits is refused as loudly as the
        // reverse.
        boundary: { kind: 'route', at: 'app/api/ras-amr/canvas', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'direct-automatically',
        performs: 'Produces a direction decision for the assembled material.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/director', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'compile-production',
        performs: 'Compiles the canvas into a production and begins encoding it.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/ras-al-amr/compile', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'follow-production',
        performs: 'Reports whether an encoding operation has finished, failed, or is still running.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/resolution/[operationId]', methods: ['GET'] },
        requiresExistingAsset: true,
      },
      {
        id: 'give-voice',
        performs: 'Generates real speech as a sovereign audio asset.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/generate-speech', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'clone-voice',
        performs: 'Creates a cloned voice identity from a Creator\'s own reference voice asset.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/clone-voice', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'import-subtitles',
        performs: 'Takes a subtitle file into the production as a sovereign asset.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/import-subtitles', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'restore-canvas',
        performs: 'Restores one specific saved canvas by its id, for this Creator only.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/canvas/[canvasId]', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        id: 'give-cloned-voice',
        performs:
          'Generates real speech in a voice the Creator has already cloned, as a new sovereign audio '
          + 'asset with its own lineage.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/generate-cloned-speech', methods: ['POST'] },
        requiresExistingAsset: true,
      },
    ],
    deferred: [
      {
        responsibility: 'Interactive timeline editing, scene transitions, and in-chamber preview.',
        constitutionalSource: 'Executive Construction Mandate §I.3 and §IV Decision 03.',
        missing:
          'No service boundary. Encoding exists (compile + resolution), but nothing in the repository '
          + 'edits temporal order, applies a transition, or renders a preview.',
      },
      {
        responsibility: 'A real completion state for the Chamber.',
        constitutionalSource:
          'chamber-identity/entry-exit-conditions.ts — the exit condition itself records the gap: '
          + '"Today: there is no real completion state."',
        missing:
          'No sovereign state marks a production finished — there is no real completion state. '
          + 'A Creator leaves by navigating away. '
          + 'This is why the exit condition must NOT be enforced — enforcing it would seal a Chamber '
          + 'that has no exit.',
      },
    ],
  },

  // ── مكمن الغاية ──────────────────────────────────────────────────────────
  //
  // Its capabilities are real and all concern the GOAL. The publishing the
  // constitution assigns it is reachable only from the Vault's own boundary,
  // which its own exit condition already admits.
  'makman-al-ghayah': {
    chamberId: 'makman-al-ghayah',
    capabilities: [
      {
        id: 'declare-purpose',
        performs: 'Records and reads the Creator\'s sovereign purpose.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/purpose', methods: ['GET', 'PUT'] },
        requiresExistingAsset: false,
      },
      {
        id: 'set-goal',
        performs: 'Creates and lists milestone goals under guardianship.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/creator-goal', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'define-success',
        performs: 'Declares what must become true for a goal to count as met.',
        // PUT only. The first draft of this registry claimed GET and POST from
        // the shape the others had, and the boundary test refused it — which
        // is the whole reason that test asserts on exported verbs rather than
        // on the file merely existing.
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/success-criteria',
          methods: ['PUT'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'observe-reality',
        // READ only, and the wording follows the measurement: the boundary
        // exports GET alone, so a Creator READS observations here. The first
        // draft claimed GET and POST from the shape its siblings had, and the
        // boundary test refused it — which is exactly why that test asserts on
        // exported verbs and not on the file merely existing.
        performs: 'Reads the real observations recorded about a goal’s publications.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/observations',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'assess-fulfilment',
        performs: 'Compares declared success against observed reality.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/fulfillment-assessment',
          methods: ['GET', 'POST'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'find-the-gap',
        // READ only. The claim that a Creator can "send it for investigation"
        // from here was mine, not the repository's — that is a separate
        // boundary (gap-investigation) and is not declared until measured.
        performs: 'Reads the distance between what a goal declared and what reality recorded.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/fulfillment-gap',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'read-goal',
        performs: 'Reads one goal the Creator created.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/creator-goal/[goalId]', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        id: 'mark-milestone',
        performs:
          'Designates a goal as a milestone serving the Creator\'s sovereign purpose, snapshotting the '
          + 'purpose wording so the relationship survives later edits.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/creator-goal/[goalId]/milestone', methods: ['PUT'] },
        requiresExistingAsset: false,
      },
      {
        id: 'name-knowledge-requirements',
        performs:
          'Derives, from the latest fulfilment assessment, what the Empire must learn to understand '
          + 'each open gap.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/gap-investigation',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'investigate-for-goal',
        // Makman's boundary, consulting the Chamber of Evidence's engine: the
        // constitutional bridge between the two. Declared here because the
        // Creator exercises it from a goal, not from an investigation.
        performs: 'Conducts the full sovereign knowledge investigation for a milestone goal\'s open gaps.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/knowledge-investigation',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'issue-knowledge-requests',
        performs: 'Issues the formal batch of typed knowledge requests for a goal\'s active requirements.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/knowledge-requests',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      // NOT declared: app/api/sovereign/entry/consumption (GET). Real and
      // executable, but its actor is the AUDIENCE consuming a published work
      // through Makman's public boundary — not a Creator standing in the
      // Chamber. This model records what a Creator can do; an audience
      // capability belongs to a different question.
    ],
    deferred: [
      {
        responsibility: 'Publishing and distribution from within the Chamber.',
        constitutionalSource: 'Executive Construction Mandate §I.5.',
        missing:
          'The capability exists — app/api/renders/[operationId]/publish mints and revokes a real '
          + 'public link — but it is the Vault\'s boundary, not this Chamber\'s. The Chamber\'s own exit '
          + 'condition already records this: "not yet reachable from the chamber itself — the real '
          + 'distribution capabilities exist only behind a disconnected API."',
      },
    ],
  },
} as const satisfies Record<ChamberId, ChamberTruth>;

/**
 * The closed set of capability ids, one literal per declared capability.
 *
 * `as const satisfies` keeps every id a literal type while still checking
 * the whole registry against ChamberTruth. The consequence is the one that
 * matters for the Sovereign Journey ruling: any structure that must cover
 * every capability — the Manifest's delivery table, a guide — can be typed
 * `Record<TruthCapabilityId, …>`, and the compiler refuses it the moment a
 * capability is added here without it, or it names one that is not here.
 * ONE source of capability truth, ONE derivation path, enforced by the
 * type-checker rather than by discipline.
 */
export type TruthCapabilityId = (typeof CHAMBER_TRUTH)[ChamberId]['capabilities'][number]['id'];

/** The capability ids one Chamber declares. */
export type CapabilityIdOf<C extends ChamberId> = (typeof CHAMBER_TRUTH)[C]['capabilities'][number]['id'];

/** What this Chamber can genuinely do right now. */
export function getChamberTruth(chamberId: ChamberId): ChamberTruth {
  return CHAMBER_TRUTH[chamberId];
}

/**
 * The capabilities a Creator can exercise given whether they own anything yet.
 *
 * The one distinction a guide cannot get wrong: a Creator with an empty Vault
 * can generate and cannot edit. Offering them an edit is the first lie an
 * interface tells, and it is told by every interface that lists capabilities
 * without asking this question.
 */
export function getExercisableCapabilities(
  chamberId: ChamberId,
  creatorOwnsAssets: boolean,
): readonly ChamberTruth['capabilities'][number][] {
  return CHAMBER_TRUTH[chamberId].capabilities.filter(
    (capability) => creatorOwnsAssets || !capability.requiresExistingAsset,
  );
}
