import type { ChamberId } from '@/src/chamber-identity';
import type { ChamberTruth } from './types';

/**
 * AZMA OS — CHAMBER TRUTH REGISTRY
 *
 * Every entry below was measured against the repository on 2026-09-21 by
 * reading the handler and the verbs it exports — not by reading a page.
 *
 * A `Record<ChamberId, …>` on purpose: the compiler refuses the file if a
 * Chamber is missing, so a sixth Chamber cannot appear and a fifth cannot
 * quietly vanish.
 */
export const CHAMBER_TRUTH: Record<ChamberId, ChamberTruth> = {
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
};

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
