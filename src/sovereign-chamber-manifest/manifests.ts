/**
 * AZMA OS — SOVEREIGN CHAMBER MANIFEST
 * Constitutional Chamber Declarations
 *
 * Five honest Sovereign Chamber Manifests — one for every constitutional
 * chamber that is frozen and production-ready for the First Launch.
 *
 * Honesty rules:
 * - Capabilities are NOT declared here. Since the Sovereign Journey ruling
 *   (2026-09-21) every Manifest's capabilities are derived from Chamber
 *   Truth (src/chamber-truth) — see derive.ts. This file declares only what
 *   Truth does not: the Chamber's constitutional name, its responsibility,
 *   and its boundary prose.
 * - constitutionalResponsibility quotes the CONTEXT_ROLES declaration
 *   from src/core/tongue/constitution.ts verbatim — that is the
 *   canonical source of each chamber's constitutional identity.
 */

import type { SovereignChamberManifest } from './types';
import { deriveManifestCapabilities } from './derive';

// ── Sovereign Vault Palace ─────────────────────────────────────────────────
// The Creator's permanent storage. Guards everything that endures.
// Capabilities: derived from Chamber Truth — see derive.ts.

const SOVEREIGN_VAULT_PALACE_MANIFEST: SovereignChamberManifest = {
  chamberId: 'sovereign-vault-palace',
  constitutionalName: 'القصر السيادي — Sovereign Vault Palace',
  constitutionalResponsibility:
    'It protects. The Palace consciousness guards what endures.',
  capabilities: deriveManifestCapabilities('sovereign-vault-palace'),
  boundary: {
    canDo: [
      'Store, retrieve, and serve binary assets on behalf of a single Creator',
      'Accept uploads from the Creator directly (audio, image, subtitle, document)',
      'Guard all stored assets with Creator-scoped tenancy — one Creator cannot access another\'s',
    ],
    cannotDo: [
      'Transform or edit the content of a stored asset',
      'Generate images — image generation belongs to Qiyamah',
      'Produce cinematic direction or assembly — that belongs to Ras Al Amr',
      'Evaluate or reason about the quality of stored content',
    ],
    delegates: [
      { to: 'qiyamah-chamber', reason: 'Image generation is Qiyamah\'s constitutional responsibility' },
      { to: 'ras-amr', reason: 'Assembling stored assets into a production is Ras Al Amr\'s responsibility' },
    ],
  },
};

// ── Hujjah Al-Damighah ────────────────────────────────────────────────────
// The Empire's knowledge court. Reasons through evidence to a verdict.
// Capabilities: derived from Chamber Truth — see derive.ts.
// Constitutionally frozen after commit a2e8632.

const HUJJAH_AL_DAMIGHAH_MANIFEST: SovereignChamberManifest = {
  chamberId: 'hujjah-al-damighah',
  constitutionalName: 'حجة الدامغة — Hujjah Al-Damighah',
  constitutionalResponsibility:
    'It reasons. The Hujjah consciousness builds the argument methodically.',
  capabilities: deriveManifestCapabilities('hujjah-al-damighah'),
  boundary: {
    canDo: [
      'Accept a natural-language question and return evidence from real knowledge sources',
      'Run the full 7-stage constitutional investigation chain on every query',
      'Persist investigation results linked to a goal when invoked from Makman Al-Ghayah',
      'Support the Creator in three interaction modes: conversation, writing, and silent',
    ],
    cannotDo: [
      'Generate images or media — that belongs to Qiyamah',
      'Direct a production or manage creative assets — that belongs to Ras Al Amr',
      'Set goals or track purpose — that belongs to Makman Al-Ghayah',
      'Expose which knowledge providers or repositories supplied the evidence (Knowledge Source Abstraction Principle)',
      'Return a verdict without real evidence — honest null is returned when evidence is unavailable',
    ],
    delegates: [
      { to: 'sovereign-vault-palace', reason: 'Storing investigation results as permanent Vault assets' },
      { to: 'makman-al-ghayah', reason: 'Goal-linked investigation persistence is initiated by Makman' },
    ],
  },
};

// ── Qiyamah Chamber ────────────────────────────────────────────────────────
// The Empire's creative generation chamber. Gives form to imagination.
// Capabilities: derived from Chamber Truth — see derive.ts.

const QIYAMAH_CHAMBER_MANIFEST: SovereignChamberManifest = {
  chamberId: 'qiyamah-chamber',
  constitutionalName: 'حجرة القيامة — Qiyamah Chamber',
  constitutionalResponsibility:
    'It creates. The Qiyamah consciousness gives form to what the citizen imagines.',
  capabilities: deriveManifestCapabilities('qiyamah-chamber'),
  boundary: {
    canDo: [
      'Generate images from natural-language prompts using the platform\'s approved image provider',
      'Record every generation in the database and deposit the result into the Creator\'s Vault',
      'Surface the Creator\'s past generations for review',
      'Gate generation behind an active subscription for Creator-role accounts',
    ],
    cannotDo: [
      'Generate video, audio, or text — only images are currently produced here',
      'Store results outside the Creator\'s own Vault tenancy',
      'Bypass the subscription gate for Creator-role accounts',
      'Perform knowledge investigation or evidence collection — that belongs to Hujjah',
    ],
    delegates: [
      { to: 'sovereign-vault-palace', reason: 'Every generated image is deposited into the Creator\'s Vault' },
    ],
  },
};

// ── Ras Al Amr ────────────────────────────────────────────────────────────
// The Sovereign Assembly Chamber. Governs cinematic direction and production.
// Capabilities: derived from Chamber Truth — see derive.ts.

const RAS_AL_AMR_MANIFEST: SovereignChamberManifest = {
  chamberId: 'ras-amr',
  constitutionalName: 'رأس الأمر — Ras Al Amr',
  constitutionalResponsibility:
    'It governs. The Ras Al-Amr consciousness speaks with sovereign authority.',
  capabilities: deriveManifestCapabilities('ras-amr'),
  boundary: {
    canDo: [
      'Create, read, and update persistent cinematic direction canvases',
      'Accept directives from both the Manual Director (Creator-driven) and the Automatic Director (AI-driven)',
      'Compile a canvas into a locked, publish-ready assembly',
      'Assign voices from the Voice Library to individual canvas nodes',
      'Verify Vault asset ownership before allowing any asset into a compiled assembly',
    ],
    cannotDo: [
      'Generate images — that belongs to Qiyamah',
      'Store raw assets — binary storage belongs to the Sovereign Vault Palace',
      'Assess creative goals or track purpose — that belongs to Makman Al-Ghayah',
      'Conduct knowledge investigation — that belongs to Hujjah Al-Damighah',
      'Publish or distribute a completed production — distribution belongs to Makman Al-Ghayah',
    ],
    delegates: [
      { to: 'sovereign-vault-palace', reason: 'All binary assets (voice, audio, image) are retrieved from the Vault' },
      { to: 'makman-al-ghayah', reason: 'Distribution and goal-fulfillment assessment after compilation' },
    ],
  },
};

// ── Makman Al-Ghayah ──────────────────────────────────────────────────────
// The Sovereign Purpose Chamber. Reads patterns, defines goals, assesses
// fulfillment, and bridges creative production to real-world impact.
// Capabilities: derived from Chamber Truth — see derive.ts.

const MAKMAN_AL_GHAYAH_MANIFEST: SovereignChamberManifest = {
  chamberId: 'makman-al-ghayah',
  constitutionalName: 'مكمن الغاية — Makman Al-Ghayah',
  constitutionalResponsibility:
    'It strategizes. The Makman consciousness reads patterns and possibilities.',
  capabilities: deriveManifestCapabilities('makman-al-ghayah'),
  boundary: {
    canDo: [
      'Record and retrieve the Creator\'s sovereign purpose',
      'Create and manage milestone goals under that purpose',
      'Define and store success criteria per goal',
      'Record reality observations linking publications to goals',
      'Run the FulfillmentAssessment engine and return honest verdicts',
      'Derive gap reports from assessment results',
      'Trigger knowledge investigation for goals with open gaps',
    ],
    cannotDo: [
      'Generate creative assets (images, audio, video) — that belongs to Qiyamah',
      'Conduct knowledge investigation directly — that is delegated to Hujjah Al-Damighah',
      'Assemble or compile productions — that belongs to Ras Al Amr',
      'Store binary assets — that belongs to the Sovereign Vault Palace',
      'Report a goal as fulfilled when real evidence of fulfillment is absent',
    ],
    delegates: [
      {
        to: 'hujjah-al-damighah',
        reason:
          'Knowledge investigation for goal gaps is conducted by Hujjah Al-Damighah via the constitutional chain (Reception → Export)',
      },
      {
        to: 'ras-amr',
        reason:
          'Production assembly for distribution is built and compiled by Ras Al Amr before Makman assesses its impact',
      },
    ],
  },
};

// ── Sovereign Chamber Registry ────────────────────────────────────────────

export const SOVEREIGN_CHAMBER_MANIFESTS: readonly SovereignChamberManifest[] = [
  SOVEREIGN_VAULT_PALACE_MANIFEST,
  HUJJAH_AL_DAMIGHAH_MANIFEST,
  QIYAMAH_CHAMBER_MANIFEST,
  RAS_AL_AMR_MANIFEST,
  MAKMAN_AL_GHAYAH_MANIFEST,
] as const;
