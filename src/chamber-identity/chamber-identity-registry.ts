/**
 * AZMA OS — CHAMBER IDENTITY
 * The Chamber Identity Profile Registry
 *
 * IMPERIAL CHAMBER UNIFICATION PROGRAM — CHAMBER IDENTITY (2026-07-23):
 * "The Empire shall evolve from living pages... to living Chambers."
 *
 * Every field below is grounded in an existing, evidenced constitutional
 * record — CONTEXT_ROLES (src/core/tongue/constitution.ts), TONE_PROFILES
 * (voice.ts), authority-registry.ts, organ-registry.ts, and the Sovereign
 * Capability Diwan (src/sovereign-capability/) — never invented from
 * scratch. Where a Chamber's real, live capability is partial or
 * disconnected, `whatItCanDo`/`whenToEnter`/`whatYouLeaveWith` say so
 * honestly; this registry does not describe an aspirational Chamber that
 * doesn't exist yet ("No placeholders. No mock implementations" governs
 * prose here exactly as it governs code — see organ-registry.ts's own
 * header for the same discipline stated for that sibling registry).
 *
 * NAMING NOTE: this registry is keyed by ChamberId (= ChamberContext
 * minus 'universal'), which spells the Ras Al Amr chamber 'ras-amr' —
 * consistent with ChamberContext itself and with the Sovereign Capability
 * Diwan's `owner` field. src/sovereign-body/organ-registry.ts and
 * authority-registry.ts register the same chamber under the organ id
 * 'ras-al-amr' (the extra "al") — a pre-existing drift between those two
 * files and everything else, disclosed here rather than silently
 * bridged or corrected, since correcting a registered organ id is a
 * separate decision with its own blast radius to check first.
 */

import type { ChamberIdentityProfile, ChamberId } from './types';

export const CHAMBER_IDENTITY_PROFILES: Record<ChamberId, ChamberIdentityProfile> = {
  'sovereign-vault-palace': {
    chamberId: 'sovereign-vault-palace',
    who: 'It protects. The Palace is the Empire\'s treasury — the chamber where a Creator\'s work is kept safe.',
    why: 'The Palace exists so that nothing a Creator makes is ever lost — every asset, once created, has a permanent, guarded home.',
    whatItCanDo: '11 real vault capabilities are defined (access, review, and lifecycle management of records) — ' +
      'currently backed only by browser storage, disconnected from the real backend Vault (src/vault/), whose only ' +
      'write path has zero reachable callers anywhere in the repository.',
    whenToEnter: 'When a Creator wants to review, organize, or revisit something already made — not a chamber for making something new.',
    whatYouLeaveWith: 'Today: confidence that what was made is safe and findable again, but only within the current browser session — not yet truly durable.',
    sourceCitations: [
      "CONTEXT_ROLES['sovereign-vault-palace'] (src/core/tongue/constitution.ts)",
      "organ-registry.ts id 'sovereign-vault-palace'",
      "authority-registry.ts id 'sovereign-vault-palace'",
    ],
  },

  'hujjah-al-damighah': {
    chamberId: 'hujjah-al-damighah',
    who: 'It reasons. Hujjah is the Empire\'s investigator — the chamber that builds an argument methodically, evidence by evidence.',
    why: 'Hujjah exists so a Creator\'s claims and decisions can be tested, not just asserted — the Empire\'s discipline of scrutiny.',
    whatItCanDo: 'The richest real implementation in the platform — 12 genuinely working capabilities, backed by a ' +
      'real Server Action (runInvestigation) wired to a real IntelligenceEngine.',
    whenToEnter: 'When a Creator needs to examine evidence, test a claim, or reach a considered verdict rather than a quick instinct.',
    whatYouLeaveWith: 'A methodically built argument and a verdict a Creator can stand behind — genuinely produced by the real investigation engine, not simulated.',
    sourceCitations: [
      "CONTEXT_ROLES['hujjah-al-damighah']",
      "organ-registry.ts id 'hujjah-al-damighah' (implementationStatus: 'implemented-and-live')",
      "authority-registry.ts id 'hujjah-al-damighah'",
    ],
  },

  'qiyamah-chamber': {
    chamberId: 'qiyamah-chamber',
    who: 'It creates. Qiyamah gives form to what the Creator imagines — the Empire\'s primary Creative Generation Chamber.',
    why: 'Qiyamah exists so an idea a Creator can describe in words can become a real, visible image.',
    whatItCanDo: 'A real, working generation path: describe a scene, choose a style, and receive a genuine ' +
      'OpenAI-generated image, kept in a real gallery, gated by real authentication and billing.',
    whenToEnter: 'When a Creator has an idea to describe and wants to see it made real, one generation at a time.',
    whatYouLeaveWith: 'A real generated image, saved to the Creator\'s own gallery, ready to be carried into the rest of the Empire.',
    sourceCitations: [
      "CONTEXT_ROLES['qiyamah-chamber'] (corrected, Qiyamah Chamber Package II, 2026-07-23)",
      "organ-registry.ts id 'qiyamah-chamber' (implementationStatus: 'implemented-and-live', corrected Package I)",
      "src/qiyamah-generation/",
    ],
  },

  'ras-amr': {
    chamberId: 'ras-amr',
    who: 'It governs. Ras Al Amr is the Empire\'s director — the chamber that gives sovereign, unambiguous direction to a production.',
    why: 'Ras Al Amr exists so the pieces a Creator has gathered can be assembled, with authority, into one finished production.',
    whatItCanDo: 'Today: a real director\'s-console interface for arranging and previewing a production. One real ' +
      'backend capability exists (compiling a draft into a locked assembly) but is not yet connected to the ' +
      'console, and cannot complete for a Creator\'s own generated assets until the production pipeline is unified ' +
      '— explicitly deferred by Council directive until Qiyamah, Ras Al Amr, and Makman have all completed this ' +
      'same reconstruction.',
    whenToEnter: 'Once a Creator already has material — generated elsewhere in the Empire — that needs to be directed into a single production. Not yet a chamber that can carry that direction through to a finished result.',
    whatYouLeaveWith: 'Today: a rehearsal, not a delivery — the console lets a Creator arrange and preview, but produces no locked, deliverable assembly yet.',
    sourceCitations: [
      "CONTEXT_ROLES['ras-amr']",
      "organ-registry.ts id 'ras-al-amr' (naming drift — see this file's own header note)",
      "authority-registry.ts id 'ras-al-amr'",
      "sovereign-capability Diwan owner 'ras-amr': ras-amr-compile-production-into-assembly",
    ],
  },

  'makman-al-ghayah': {
    chamberId: 'makman-al-ghayah',
    who: 'It strategizes. Makman reads patterns and possibilities — the Empire\'s chamber of commercial distribution and audience access.',
    why: 'Makman exists so a Creator\'s finished work can find its audience — the bridge from creation to reach.',
    whatItCanDo: '2 real capabilities are reachable via the Sovereign Operational Entry Layer\'s own API routes ' +
      '(submitting work for distribution, requesting access to published work) — but the live page itself is ' +
      'disconnected from both.',
    whenToEnter: 'Once a Creator has a finished, assembled production and is ready to think about who should see it and how.',
    whatYouLeaveWith: 'Today: not yet a real outcome — the real distribution capabilities exist in the backend but aren\'t reachable from the chamber itself.',
    sourceCitations: [
      "CONTEXT_ROLES['makman-al-ghayah']",
      "organ-registry.ts id 'makman-al-ghayah'",
      "authority-registry.ts id 'makman-al-ghayah'",
    ],
  },
};
