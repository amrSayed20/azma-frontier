/**
 * AZMA OS — THE IMPERIAL MANIFESTATION ENGINE (IME)
 * CONSTITUTIONAL ARCHITECTURAL CONTRACT
 *
 * Ratified 2026-07-18 (Awareness & Manifestation Final Architectural
 * Ruling). This is the permanent architectural reference for IME — any
 * future IME mission must be measured against this contract before
 * implementation begins.
 */

export const IME_CONSTITUTIONAL_PURPOSE =
  'IME is the Runtime Presentation Engine of AZMA OS and the sole constitutional presentation ' +
  'coordinator — it transforms the Imperial Awareness Engine\'s Manifestation Plan into the shape each ' +
  'Presentation Family (button, and future siblings) needs, without deciding availability and without ' +
  'owning any consumer\'s own rendering detail (label, style, href).';

export const IME_RESPONSIBILITIES = [
  'Hosting the Presenter Registry — one Presenter per Presentation Family (see presenter-registry.ts).',
  'Shaping a Manifestation Plan into a family-specific PresentationSpec[] via manifest(plan, family).',
] as const;

export const IME_NON_RESPONSIBILITIES = [
  'Deciding what is available — exclusively the Imperial Awareness Engine\'s responsibility. IME never reasons about Creator identity, permissions, or workflow state.',
  'Copy, style, href, or any other consumer-specific rendering detail — owned by each Presentation Consumer (Button Engine and its future siblings).',
  'Communicating directly with any Presentation Consumer\'s own internal state — consumers call IME, never the reverse.',
] as const;

export const IME_PRESENTATION_CONSUMERS = [
  'Button Engine (src/button-engine/) — the only Presentation Consumer that exists today.',
  'Future: Field Engine, Panel Engine, Card Engine, Section Engine, Navigation Engine, Timeline Engine — added one at a time, only when a real consumer needs one, never speculatively.',
] as const;

export const IME_EXTENSION_RULE =
  'A Presentation Consumer may never call the Imperial Awareness Engine directly. Its only constitutional ' +
  'input is the shape returned by IME.manifest(). Adding a new Presentation Family means adding one ' +
  'Presenter and one Presenter Registry entry — never a change to the Imperial Awareness Engine, the ' +
  'Manifestation Plan contract, or any existing Presenter.';
