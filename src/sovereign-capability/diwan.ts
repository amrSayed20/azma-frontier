/**
 * AZMA OS — THE SOVEREIGN CAPABILITY DIWAN
 * The Constitutional Registry (Construction ID SCD-003)
 * Campaign C — Constitutional Taxonomy, Certification & Governance
 *
 * A static, read-only, declarative list of ConstitutionalCapability
 * records. No execution, no scheduling, no orchestration, no provider
 * invocation happens here or anywhere in this module (Diwan Ch. I Art.
 * VII) — this is data, not a runtime.
 *
 * Every entry's `category` now uses the ratified taxonomy (taxonomy.ts),
 * derived from these same 30 capabilities in Campaign B — no category
 * was designed independently of the evidence. Several additional
 * `relationships` were added this campaign after re-examining all 30
 * entries against each other for evidence-supported dependencies missed
 * in Campaign B (see SCD_003_ENGINEERING_REVIEW.ts for the reasoning
 * behind each addition).
 *
 * Every capability remains lifecycleState: 'awaiting-certification' and
 * visibility.discoverable: false. Actual certification (marking a
 * capability 'certified'/'active') is a Constitutional Council act, not
 * something this or any engineering campaign self-grants — consistent
 * with this project's standing discipline that engineering proposes and
 * the Council certifies.
 *
 * NAMING NOTE (unchanged since Campaign A): this constant is
 * CAPABILITY_DIWAN, not "CapabilityRegistry" — that name already belongs
 * to two unrelated infrastructure classes elsewhere in the repository.
 */

import type { ConstitutionalCapability, CapabilityRelationship, CapabilityCategory } from './types';

/**
 * Fills in the constitutional boilerplate every discovered capability
 * shares at this stage, so each declaration below only has to state what
 * is genuinely distinct about it. Still pure data construction — no
 * execution, no defaulting based on runtime conditions.
 */
function declareCapability(entry: {
  id: string;
  name: string;
  owner: ConstitutionalCapability['owner'];
  purpose: string;
  category: CapabilityCategory;
  relationships?: readonly CapabilityRelationship[];
}): ConstitutionalCapability {
  return {
    id: entry.id,
    name: entry.name,
    owner: entry.owner,
    purpose: entry.purpose,
    category: entry.category,
    visibility: { discoverable: false, visibleTo: [] },
    lifecycleState: 'awaiting-certification',
    certification: {
      status: 'awaiting-certification',
      certifiedAt: null,
      certifyingAuthority: 'The Constitutional Council',
    },
    relationships: entry.relationships ?? [],
    retirement: null,
    constitutionalAuthority: 'The Sovereign Capability Diwan',
  };
}

export const CAPABILITY_DIWAN: readonly ConstitutionalCapability[] = [
  // ── Makman Al-Ghayah ─────────────────────────────────────────────────
  declareCapability({
    id: 'makman-submit-creative-work-for-distribution',
    name: 'Submit a Creative Work for Distribution',
    owner: 'makman-al-ghayah',
    purpose:
      'Enables a Creator to submit a completed creative work, together with its commercial intent and authorization, so it can be prepared for distribution to its intended audience.',
    category: 'distribution-and-access',
    relationships: [{ kind: 'depends-on', capabilityId: 'ras-amr-compile-production-into-assembly' }],
  }),
  declareCapability({
    id: 'makman-request-access-to-published-work',
    name: 'Request Access to a Published Work',
    owner: 'makman-al-ghayah',
    purpose:
      "Enables a Creator to request access to a work another Creator has published, honoring the age and regional restrictions that apply to it.",
    category: 'distribution-and-access',
  }),

  // ── Hujjah Al-Damighah ───────────────────────────────────────────────
  declareCapability({
    id: 'hujjah-investigate-a-question',
    name: 'Investigate a Question',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to pose a question within a chosen field of knowledge and receive evidence gathered in response.',
    category: 'investigation',
  }),
  declareCapability({
    id: 'hujjah-choose-how-to-interact',
    name: 'Choose How to Interact',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to choose whether they engage the chamber by speaking, by writing, or by silently browsing, and remembers that choice for future visits.',
    category: 'engagement-mode',
  }),
  declareCapability({
    id: 'hujjah-weigh-in-before-a-verdict',
    name: 'Weigh In Before a Verdict',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to state their own stance on a question under investigation — support, objection, a request for more evidence, or a suspended judgment — and have that stance shape what happens next.',
    category: 'verdict-revision',
    relationships: [{ kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' }],
  }),
  declareCapability({
    id: 'hujjah-review-evidence-in-depth',
    name: 'Review Evidence in Depth',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to open any single piece of gathered evidence and read its full text and original context.',
    category: 'investigation',
  }),
  declareCapability({
    id: 'hujjah-start-investigation-from-evidence',
    name: 'Start a New Investigation from Evidence',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to launch a fresh investigation seeded directly from a specific piece of evidence they are reviewing.',
    category: 'investigation',
    relationships: [
      { kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' },
      { kind: 'depends-on', capabilityId: 'hujjah-review-evidence-in-depth' },
    ],
  }),
  declareCapability({
    id: 'hujjah-save-for-later',
    name: 'Save Evidence or Investigation for Later',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to keep a piece of evidence or an entire investigation so they can return to it later in the same visit.',
    category: 'investigation',
    relationships: [{ kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' }],
  }),
  declareCapability({
    id: 'hujjah-sort-evidence-into-judgment',
    name: 'Sort Evidence Into Judgment Categories',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to organize gathered evidence into their own categories of conviction, ongoing examination, or doubt, and have the chamber respond as doubt accumulates.',
    category: 'investigation',
    relationships: [{ kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' }],
  }),
  declareCapability({
    id: 'hujjah-choose-verdict-detail-level',
    name: 'Choose Verdict Detail Level',
    owner: 'hujjah-al-damighah',
    purpose:
      'Enables a Creator to switch the rendered verdict between a short, medium, or fully detailed explanation.',
    category: 'verdict-revision',
    relationships: [{ kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' }],
  }),
  declareCapability({
    id: 'hujjah-deepen-a-verdict',
    name: "Deepen a Verdict's Evidence Base",
    owner: 'hujjah-al-damighah',
    purpose: "Enables a Creator to widen the evidence considered behind a rendered verdict.",
    category: 'verdict-revision',
    relationships: [{ kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' }],
  }),
  declareCapability({
    id: 'hujjah-challenge-a-verdict',
    name: 'Challenge a Verdict',
    owner: 'hujjah-al-damighah',
    purpose: 'Enables a Creator to re-argue a rendered verdict from a different angle.',
    category: 'verdict-revision',
    relationships: [{ kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' }],
  }),
  declareCapability({
    id: 'hujjah-appeal-a-verdict',
    name: 'Appeal a Verdict',
    owner: 'hujjah-al-damighah',
    purpose: 'Enables a Creator to reopen a rendered verdict with new evidence.',
    category: 'verdict-revision',
    relationships: [{ kind: 'depends-on', capabilityId: 'hujjah-investigate-a-question' }],
  }),
  declareCapability({
    id: 'hujjah-resume-a-previous-investigation',
    name: 'Resume a Previous Investigation',
    owner: 'hujjah-al-damighah',
    purpose: 'Enables a Creator to pick up an unfinished investigation from an earlier visit.',
    category: 'investigation',
    relationships: [{ kind: 'extends', capabilityId: 'hujjah-investigate-a-question' }],
  }),

  // ── Qiyamah Chamber ──────────────────────────────────────────────────
  declareCapability({
    id: 'qiyamah-preview-generation-cost',
    name: 'Preview Generation Cost Before Committing',
    owner: 'qiyamah-chamber',
    purpose:
      'Enables a Creator to see a running cost estimate update live as they adjust their generation choices, before committing to anything.',
    category: 'generation-commitment',
  }),
  declareCapability({
    id: 'qiyamah-review-and-confirm-cost',
    name: 'Review and Confirm Generation Cost',
    owner: 'qiyamah-chamber',
    purpose:
      'Enables a Creator to review an itemized cost breakdown and explicitly confirm or cancel before any generation begins.',
    category: 'generation-commitment',
    relationships: [{ kind: 'depends-on', capabilityId: 'qiyamah-preview-generation-cost' }],
  }),
  declareCapability({
    id: 'qiyamah-stage-asset-for-generation',
    name: 'Stage an Asset for Generation',
    owner: 'qiyamah-chamber',
    purpose:
      'Enables a Creator to place a text, image, video, or audio asset onto the working canvas to prepare it for generation.',
    category: 'generation-commitment',
  }),
  declareCapability({
    id: 'qiyamah-adjust-generation-controls',
    name: 'Adjust Generation Controls',
    owner: 'qiyamah-chamber',
    purpose:
      'Enables a Creator to set voice, visual style, and duration before generating, with the cost estimate reflecting each change.',
    category: 'generation-commitment',
    relationships: [{ kind: 'supports', capabilityId: 'qiyamah-preview-generation-cost' }],
  }),

  // ── Ras Al-Amr ───────────────────────────────────────────────────────
  declareCapability({
    id: 'ras-amr-compile-production-into-assembly',
    name: 'Compile a Production into a Final Assembly',
    owner: 'ras-amr',
    purpose:
      'Enables a Creator to seal a draft production — its tracks and referenced assets — into a locked, ready-to-publish assembly, guaranteeing every referenced asset is genuinely owned by that Creator and that the production is not empty.',
    category: 'production-assembly',
  }),

  // ── Sovereign Vault Palace ───────────────────────────────────────────
  declareCapability({
    id: 'vault-unlock-the-palace',
    name: 'Unlock the Vault Palace',
    owner: 'sovereign-vault-palace',
    purpose: 'Enables a Creator to enter the Vault Palace using a personal PIN.',
    category: 'vault-record-management',
  }),
  declareCapability({
    id: 'vault-receive-incoming-treasure',
    name: 'Receive an Incoming Treasure',
    owner: 'sovereign-vault-palace',
    purpose:
      'Enables a Creator to accept an item transferred in from elsewhere and place it into a chosen vault.',
    category: 'treasure-transfer',
  }),
  declareCapability({
    id: 'vault-browse-vault-categories',
    name: 'Browse Vault Categories',
    owner: 'sovereign-vault-palace',
    purpose: 'Enables a Creator to open any themed vault and see how many items it holds.',
    category: 'vault-record-management',
  }),
  declareCapability({
    id: 'vault-review-treasury-records',
    name: 'Review Treasury Records',
    owner: 'sovereign-vault-palace',
    purpose:
      "Enables a Creator to see the list of items held in a vault, along with each item's status and origin.",
    category: 'vault-record-management',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-browse-vault-categories' }],
  }),
  declareCapability({
    id: 'vault-view-treasure-journey',
    name: "View a Treasure's Journey",
    owner: 'sovereign-vault-palace',
    purpose:
      'Enables a Creator to inspect the history of chambers and actions a specific item has passed through.',
    category: 'vault-record-management',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-review-treasury-records' }],
  }),
  declareCapability({
    id: 'vault-seal-a-treasure',
    name: 'Seal a Treasure',
    owner: 'sovereign-vault-palace',
    purpose: 'Enables a Creator to mark an item in the vault as sealed.',
    category: 'vault-record-management',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-review-treasury-records' }],
  }),
  declareCapability({
    id: 'vault-archive-a-treasure',
    name: 'Archive a Treasure',
    owner: 'sovereign-vault-palace',
    purpose: 'Enables a Creator to move an item in the vault into an archived state.',
    category: 'vault-record-management',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-review-treasury-records' }],
  }),
  declareCapability({
    id: 'vault-dispose-of-a-treasure',
    name: 'Dispose of a Treasure',
    owner: 'sovereign-vault-palace',
    purpose: 'Enables a Creator to permanently remove an item from the vault.',
    category: 'vault-record-management',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-review-treasury-records' }],
  }),
  declareCapability({
    id: 'vault-download-a-treasure-record',
    name: 'Download a Treasure Record',
    owner: 'sovereign-vault-palace',
    purpose: "Enables a Creator to export a vault item's record as a file to their own device.",
    category: 'vault-record-management',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-review-treasury-records' }],
  }),
  declareCapability({
    id: 'vault-duplicate-a-treasure',
    name: 'Duplicate a Treasure',
    owner: 'sovereign-vault-palace',
    purpose: 'Enables a Creator to create a copy of an item already held in the vault.',
    category: 'vault-record-management',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-review-treasury-records' }],
  }),
  declareCapability({
    id: 'vault-send-treasure-to-another-chamber',
    name: 'Send a Treasure to Another Chamber',
    owner: 'sovereign-vault-palace',
    purpose: 'Enables a Creator to move an item out of the vault toward another chamber for further work.',
    category: 'treasure-transfer',
    relationships: [{ kind: 'depends-on', capabilityId: 'vault-review-treasury-records' }],
  }),
] as const;
