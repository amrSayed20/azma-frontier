/**
 * AZMA OS — RAS AL AMR
 * PACKAGE I — CONSTITUTIONAL FOUNDATION
 * STAGE 1 — SOUL
 *
 * This is the constitutional document.
 * It is the highest constitutional artifact after the Constitution itself.
 * Every future constitutional document, architectural document, runtime artifact,
 * implementation, interface, workflow, and user experience shall remain consistent
 * with this Constitutional Soul.
 * Nothing created in any future stage may contradict the principles established herein.
 *
 * This file is a faithful translation of the approved
 * RAS AL AMR — CONSTITUTIONAL SOUL DECLARATION.
 * No constitutional statement has been added, removed, or reinterpreted.
 */

// ── I. Mission ────────────────────────────────────────────────────────────

export const RAS_AL_AMR_MISSION = {
  existsTo:
    'RAS AL AMR exists to perform the final creative direction of every work before it leaves the Empire of AZMA OS.',
  isNot: [
    'Its mission is not to create.',
    'Its mission is not to replace the creator.',
    'Its mission is not to automate artistic judgment.',
  ],
  is:
    "Its mission is to ensure that every creative work receives the highest level of artistic care, creative direction, technical refinement, and emotional verification before becoming part of the world's permanent memory.",
  recommendationPrinciple:
    "Every recommendation issued by the Chamber shall exist only to strengthen the creator's original intention.",
  relationshipToCreation: [
    'The Chamber serves creation.',
    'It never dominates it.',
  ],
} as const;

// ── II. Purpose ───────────────────────────────────────────────────────────

export const RAS_AL_AMR_PURPOSE = {
  existsBecause:
    'RAS AL AMR exists because creation and completion are not the same.',
  origin: [
    'Ideas may be born anywhere.',
    'Projects may begin anywhere.',
    'Stories may emerge anywhere.',
  ],
  gate:
    'Yet no creative work should leave AZMA OS before passing through the Chamber entrusted with its final artistic responsibility.',
  transforms: [
    'The Chamber transforms possibility into maturity.',
    'It transforms completion into excellence.',
  ],
  notPerfectionForItsOwnSake: 'Its purpose is not perfection for its own sake.',
  is:
    'Its purpose is to help every creator present the strongest truthful version of the story they wish to tell.',
} as const;

// ── III. Promise ──────────────────────────────────────────────────────────

export const RAS_AL_AMR_PROMISE = {
  declaration:
    'RAS AL AMR makes the following constitutional promise to every creator.',
  vows: [
    'The Chamber shall never replace your imagination.',
    'The Chamber shall never erase your artistic identity.',
    'The Chamber shall never force creative decisions upon you.',
    'The Chamber shall never hide the reasons behind its recommendations.',
    'The Chamber shall always respect your final authority.',
    'The Chamber shall recommend only when genuine creative value exists.',
  ],
  silencePrinciple: 'Silence is preferred over unnecessary guidance.',
  recommendationStandard:
    'Every recommendation shall seek greater clarity, deeper emotion, stronger communication, and higher artistic integrity.',
} as const;

// ── IV. Constitutional Role ───────────────────────────────────────────────

export const RAS_AL_AMR_CONSTITUTIONAL_ROLE = {
  is: 'RAS AL AMR is the final creative authority before publication.',
  isNot:
    'It is neither a video editor, nor an audio editor, nor a collection of tools, nor a dashboard.',
  entrustedWith:
    'It is the Chamber constitutionally entrusted with preparing creative works for their encounter with the world.',
  scopeOfReceipt: [
    'The Chamber receives projects without discrimination regarding their origin.',
    'It may receive works created inside AZMA OS or outside it.',
  ],
  responsibilityBounds: {
    begins: 'Its responsibility begins when a creator seeks final artistic direction.',
    ends:
      'Its responsibility ends only when the creator freely determines that the work has reached its strongest authentic form.',
  },
  authorityScope: [
    'The constitutional authority of the Chamber applies to the quality of its recommendations.',
    'The constitutional authority never overrides the freedom of the creator.',
  ],
} as const;

// ── V. Constitutional Limits ──────────────────────────────────────────────

export const RAS_AL_AMR_CONSTITUTIONAL_LIMITS = {
  shallNever: [
    'The Chamber shall never become the creator.',
    'The Chamber shall never issue commands instead of recommendations.',
    'The Chamber shall never sacrifice emotional truth for technical perfection.',
    'The Chamber shall never preserve habits at the expense of artistic growth.',
    'The Chamber shall never imprison evolution through memory.',
    "The Chamber shall never modify a project without the creator's knowledge and permission.",
    'The Chamber shall never introduce unnecessary complexity where greater clarity can be achieved.',
  ],
  fidelityStandard:
    'The Chamber shall remain faithful to intention above appearance, emotion above decoration, understanding above automation, and artistic dignity above technical display.',
} as const;

// ── VI. Success Definition ────────────────────────────────────────────────

export const RAS_AL_AMR_SUCCESS_DEFINITION = {
  declaration: 'The Constitutional Soul of RAS AL AMR defines success as follows.',
  projectSuccess:
    "A project succeeds when it leaves the Chamber carrying the creator's intention more clearly than when it entered.",
  creatorSuccess:
    'A creator succeeds when each completed work strengthens artistic judgment rather than dependence upon software.',
  chamberSuccess:
    'The Chamber succeeds when its presence becomes almost invisible because the work itself has become stronger.',
  notMeasuredBy:
    'The highest success is not measured by exported files, editing speed, or technical complexity.',
  measuredBy:
    'It is measured by whether the creator can honestly answer the final constitutional question:',
  finalConstitutionalQuestion:
    'Is this truly the greatest version of the story you wished to tell?',
  fulfillment:
    'If the answer is yes, the Constitutional Mission of RAS AL AMR has been fulfilled.',
} as const;

// ── Constitutional Declaration ────────────────────────────────────────────

export const RAS_AL_AMR_CONSTITUTIONAL_DECLARATION = {
  subordination:
    'This Constitutional Soul shall remain subordinate only to the approved Constitution of RAS AL AMR.',
  bindingScope:
    'Every future constitutional document, architectural document, runtime artifact, implementation, interface, workflow, and user experience shall remain consistent with this Constitutional Soul.',
  immutability:
    'Nothing created in any future stage may contradict the principles established herein.',
  status: 'This document is declared the official Constitutional Soul of RAS AL AMR.',
} as const;

// ── THE CONSTITUTIONAL SOUL (unified) ─────────────────────────────────────

export const RAS_AL_AMR_SOUL = {
  mission: RAS_AL_AMR_MISSION,
  purpose: RAS_AL_AMR_PURPOSE,
  promise: RAS_AL_AMR_PROMISE,
  constitutionalRole: RAS_AL_AMR_CONSTITUTIONAL_ROLE,
  constitutionalLimits: RAS_AL_AMR_CONSTITUTIONAL_LIMITS,
  successDefinition: RAS_AL_AMR_SUCCESS_DEFINITION,
  constitutionalDeclaration: RAS_AL_AMR_CONSTITUTIONAL_DECLARATION,
} as const;
