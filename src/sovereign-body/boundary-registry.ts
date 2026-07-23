/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Boundary Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * Every prohibition below is quoted or closely paraphrased from the
 * organ's own constitutional articles already declared in the Books and
 * Anatomy chapters — none invented here. "Enforceable" (per this
 * Construction Package's certification criteria) means clearly specified
 * enough that a future runtime enforcement mechanism could act on it —
 * the Skeleton itself owns no runtime behavior and enforces nothing by
 * executing code (per the Construction Order: "The Skeleton owns no
 * runtime behavior. It owns constitutional structure").
 */

import type { ConstitutionalBoundary } from './types';

export const CONSTITUTIONAL_BOUNDARIES: readonly ConstitutionalBoundary[] = [
  {
    organId: 'sovereign-body',
    prohibitions: [
      'Does not think (is not the Brain).',
      'Does not feel (is not Al-Wateen).',
      'Does not render (is not the Identity Layer).',
      'Does not create (is not the Chambers).',
      'Does not execute (is not Runtime).',
    ],
    sourceArticle: '"The Sovereign Body — Constitutional Vision," the five "THE BODY DOES NOT..." declarations.',
  },
  {
    organId: 'al-wateen',
    prohibitions: [
      'Shall never govern — does not rule, interpret, legislate, or create purpose.',
      'Shall never favor one organ over another (equality of Life, Phase IV Article III).',
      'Shall never seek attention or recognition (Phase IV Article V).',
    ],
    sourceArticle: 'Construction Phase IV ("The Constitutional Heart"), Articles II, III, V.',
  },
  {
    organId: 'sovereign-memory',
    prohibitions: [
      'Shall never interpret constitutional meaning — remembers, never reasons.',
      'Shall never issue recommendations or execute constitutional actions.',
      'Shall never modify constitutional history or rewrite constitutional truth — history may only grow, never be edited or reordered.',
      'Shall never replace the Sovereign Core.',
    ],
    sourceArticle: 'Construction Phase VIII ("The Constitutional Memory"), Constitutional Limits.',
  },
  {
    organId: 'sovereign-core',
    prohibitions: [
      'Shall never govern — knowledge is not authority, reasoning is not command.',
      'Shall never own knowledge (knowledge belongs to the Empire, not the Core).',
      'Shall never become the Creator — may advise and recommend, never replace the Creator\'s constitutional freedom.',
    ],
    sourceArticle: 'Construction Phase V ("The Constitutional Mind"), Articles II, IV, XI.',
  },
  {
    organId: 'global-ui-runtime',
    prohibitions: [
      'Never governs, never decides, never judges, never creates.',
      'Shall never become the Mind — perception is not judgment.',
      'Shall never become the Heart — reveals Life, does not sustain it.',
    ],
    sourceArticle: 'Construction Phase II ("The Constitutional Nervous System"), Articles I, VI, VII.',
  },
  {
    organId: 'sovereign-identity-layer',
    prohibitions: [
      'Not a UI framework, Design System, Animation Library, CSS Architecture, or Component Collection.',
      'Never owns business logic, Runtime, or Al-Wateen\'s responsibilities.',
      'No chamber may independently define its own color/typography/motion/lighting/language/cinematic direction — identity flows from this organ, not from chambers.',
    ],
    sourceArticle: '"The Sovereign Identity Layer — Constitutional Dossier," Chapter I Article IV, Chapter II Article II.',
  },
  {
    organId: 'sovereign-tongue',
    prohibitions: [
      'Never presents itself as a chatbot, assistant, AI, model, LLM, agent, feature, tool, interface, or software — it is the Empire\'s one living consciousness (Article I).',
      'Never changes personality across chambers — only tone and language adapt per chamber; identity remains singular and constant (Article II: "The Tongue Changes Its Tone... Never the identity").',
      'Never guesses or rushes when understanding is incomplete — it asks, or remains silent, rather than speak falsely.',
      'Shall never create, modify, judge, prioritize, reinterpret, exaggerate, conceal, or invent Constitutional Truth — its responsibility begins only after Constitutional Truth has already been established (Constitutional Package I, "The Imperial Tongue").',
      'Shall never become Constitutional Awareness, Constitutional Wisdom, Constitutional Conscience, Constitutional Memory, Constitutional Judgment, Constitutional Identity, or Constitutional Manifestation (Constitutional Package I, Non-Responsibilities) — it faithfully expresses; it never replaces.',
    ],
    sourceArticle: 'Tongue Constitution (ATC), src/core/tongue/constitution.ts, Articles I and II; Constitutional Package I, "The Imperial Tongue Constitutional Refoundation," Constitutional Boundaries and Non-Responsibilities.',
  },
  {
    organId: 'sovereign-capability-diwan',
    prohibitions: [
      'Shall never execute capabilities.',
      'Shall never schedule capabilities.',
      'Shall never orchestrate capabilities or invoke providers.',
    ],
    sourceArticle: '"The Sovereign Capability Diwan — Constitutional Dossier," Chapter I, Article VII.',
  },
  {
    organId: 'ras-al-amr',
    prohibitions: ['Shall not assume the responsibility of any other chamber — its constitutional role is direction/orchestration, never strategy (Makman), investigation (Hujjah), generation (Qiyamah), or safekeeping (Vault Palace).'],
    sourceArticle: 'General organ principle (Anatomy Ch. II, Article XI: "no organ shall interpret another organ\'s authority"), applied via CONTEXT_ROLES (src/core/tongue/constitution.ts).',
  },
  {
    organId: 'makman-al-ghayah',
    prohibitions: ['Shall not assume the responsibility of any other chamber — its constitutional role is strategy/distribution, never direction, investigation, generation, or safekeeping.'],
    sourceArticle: 'General organ principle, applied via CONTEXT_ROLES.',
  },
  {
    organId: 'qiyamah-chamber',
    prohibitions: ['Shall not assume the responsibility of any other chamber — its constitutional role is generative creation, never direction, strategy, investigation, or safekeeping.'],
    sourceArticle: 'General organ principle, applied via CONTEXT_ROLES.',
  },
  {
    organId: 'hujjah-al-damighah',
    prohibitions: ['Shall not assume the responsibility of any other chamber — its constitutional role is investigation/reasoning, never direction, strategy, generation, or safekeeping.'],
    sourceArticle: 'General organ principle, applied via CONTEXT_ROLES.',
  },
  {
    organId: 'sovereign-vault-palace',
    prohibitions: ['Shall not assume the responsibility of any other chamber — its constitutional role is safekeeping, never direction, strategy, investigation, or generation.'],
    sourceArticle: 'General organ principle, applied via CONTEXT_ROLES.',
  },
] as const;
