/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 7 — ARCHITECTURAL VALIDATION PACKAGE (STEP 1 OF 5: VALIDATION RULES)
 *
 * Defines the constitutional validation rules governing every approved
 * architectural artifact — Domains, Modules, Interfaces, Behaviors, and the
 * Dependency Package. These are well-formedness rules: what must be true of
 * ANY instance of a given artifact type, independent of its specific
 * content. TypeScript's structural typing already enforces field presence
 * (every interface in ARCHITECTURE.ts/SPECIFICATION.ts/INTERFACES.ts/
 * BEHAVIOR.ts requires all its fields); the rules below add the semantic
 * constraints TypeScript cannot check — constitutional grounding, not just
 * shape.
 */

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export const DOMAIN_VALIDATION_RULES = [
  { rule: 'A Domain\'s constitutionalOwnership must name at least one real constitutional article (SOUL.ts through TRANSFORMATION.ts) or an explicitly-named exception (e.g. Operating Charter Art. IV/IX/X for Integration Domain).', appliesTo: 'All 13 Domains.' },
  { rule: 'A Domain must have exactly one parentDomain, except CHAMBER_CORE, which has none (root).', appliesTo: 'All 13 Domains.' },
  { rule: 'A Domain\'s explicitConstitutionalLimits must restate, not invent, a "shall never" or equivalent prohibition already present in its constitutionalOwnership source.', appliesTo: 'All 13 Domains.' },
  { rule: 'A capability-domain (Editing, Audio, Video, Automation) must state its "never a product identity" boundary explicitly (RAS-CA-RULING-002, Ruling 1).', appliesTo: 'EDITING_DOMAIN, AUDIO_DOMAIN, VIDEO_DOMAIN, AUTOMATION_DOMAIN.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export const MODULE_VALIDATION_RULES = [
  { rule: 'Every Module must name exactly one owning Domain (the `domain` field).', appliesTo: 'All 13 Modules.' },
  { rule: 'A Module\'s responsibility must not exceed its owning Domain\'s constitutionalResponsibility.', appliesTo: 'All 13 Modules.' },
  { rule: 'A Module\'s permissions must each be traceable to a responsibility already stated for it or its Domain.', appliesTo: 'All 13 Modules.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_VALIDATION_RULES = [
  { rule: 'Every Interface must name a real provider and at least one real consumer — a Module (SPECIFICATION.ts), "The Creator (external)", or "Sovereign Core (external Shared Engine)".', appliesTo: 'All 15 Interfaces.' },
  { rule: 'A capability-reframed Interface (AutoDirector, ManualDirector, Timeline, Media, Voice, Camera, Lens) must restate its capability-not-product boundary in its own constitutionalContract field, not merely inherit it silently from its Domain.', appliesTo: 'The 7 listed Interfaces.' },
  { rule: 'An Interface whose constitutional grounding is an application rather than a direct citation (e.g. Lens) must say so explicitly in its own constitutionalPurpose field.', appliesTo: 'Lens; any future Interface in the same position.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// BEHAVIOR VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export const BEHAVIOR_VALIDATION_RULES = [
  { rule: 'Every Behavior must name exactly one Responsible Domain and at least one relatedInterface.', appliesTo: 'All 10 Behaviors.' },
  { rule: 'A Behavior whose literal name suggests an implementation-shaped concept absent from the Constitution (e.g. "Error Recovery") must reframe explicitly to a real constitutional concept in its own constitutionalPurpose field, never invent one.', appliesTo: 'ErrorRecovery; any future Behavior in the same position.' },
  { rule: 'A Behavior\'s forbiddenOutcomes must include every boundary its allowedOutcomes could otherwise be confused with.', appliesTo: 'All 10 Behaviors.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DEPENDENCY PACKAGE VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export const DEPENDENCY_PACKAGE_VALIDATION_RULES = [
  { rule: 'Every dependency edge (DEPENDENCIES.ts) must point strictly downstream — never from an upstream artifact to a downstream one.', appliesTo: 'All 10 dependency edges.' },
  { rule: 'Every ownership entry (OWNERSHIP.ts) must name exactly one Constitutional Owner; shared ownership must be explicitly declared, never implied.', appliesTo: 'All 51 ownership entries.' },
  { rule: 'No permission (PERMISSIONS.ts) may grant authority a boundary (BOUNDARIES.ts) forbids.', appliesTo: 'All permission categories.' },
  { rule: 'Every entry in the traceability chain (TRACEABILITY.ts) must resolve to a real, already-certified artifact — never a placeholder.', appliesTo: 'All 10 chain links.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const VALIDATION_RULES_DECLARATION = {
  totalRulesDefined:
    DOMAIN_VALIDATION_RULES.length + MODULE_VALIDATION_RULES.length + INTERFACE_VALIDATION_RULES.length +
    BEHAVIOR_VALIDATION_RULES.length + DEPENDENCY_PACKAGE_VALIDATION_RULES.length,
  introducesNewConstitutionalContent: false,
  status: 'PACKAGE II — STAGE 7, STEP 1 OF 5 — VALIDATION RULES, submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_VALIDATION_RULES = {
  domain: DOMAIN_VALIDATION_RULES,
  module: MODULE_VALIDATION_RULES,
  architecturalInterface: INTERFACE_VALIDATION_RULES,
  behavior: BEHAVIOR_VALIDATION_RULES,
  dependencyPackage: DEPENDENCY_PACKAGE_VALIDATION_RULES,
  declaration: VALIDATION_RULES_DECLARATION,
} as const;
