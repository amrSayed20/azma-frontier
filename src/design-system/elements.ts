/**
 * AZMA OS — Component Language Engine (ACLE) V1.0
 * The Constitutional Registry of Architectural Elements
 *
 * ARTICLE I: There are no components.
 * Every element carries an architectural identity — a constitutional purpose
 * that defines not only how it appears but what it IS and what it means.
 *
 * This file is the Imperial Library.
 * Future chambers assemble from this registry — they never invent new elements.
 * If something cannot be described using these families, the brief must
 * return to the Chief Architect for constitutional review.
 *
 * Import from src/design-system/index.ts — never directly.
 * CSS: import '@/src/design-system/azma-elements.css'
 */

import { SURFACES } from './tokens';
import type { VisualRole, AtmosphereName, LightBehaviorName, MaterialState } from './behaviors';
import type { MaterialName } from './tokens';

// ── Constitutional Type Definitions ────────────────────────────────────────

/** The ten architectural families. No element exists outside these. */
export type ElementFamily =
  | 'portal'            // passage between architectural spaces
  | 'record'            // living artifact with history and weight
  | 'verdict'           // settled conclusion of deliberation
  | 'sovereign-action'  // the primary act — constitutionally singular
  | 'guide'             // the living companion — always peripheral
  | 'indicator'         // smallest unit of meaning — rhythm carries information
  | 'seal'              // ceremonial barrier and authentication marker
  | 'vessel'            // architectural container with atmosphere and walls
  | 'path'              // directional corridor — navigation with weight
  | 'declaration';      // supreme text — title, verdict text, sovereign message

/** Constitutional authority levels — maps to visual hierarchy */
export type AuthorityLevel =
  | 1   // silent    — architecture only, not content
  | 2   // passive   — context, background
  | 3   // advisory  — guidance without demand
  | 4   // secondary — supporting presence
  | 5   // primary   — the citizen's main engagement
  | 6   // sovereign — maximum authority, singular
  | 7;  // sacred    — ceremony only, used with extreme restraint

/** How an element appears — its architectural entrance character */
export type AppearanceCharacter =
  | 'immediate'       // was always here — sovereign presence
  | 'descend'         // falls from above — judgment, weight
  | 'settle'          // comes to rest after small descent — records, vessels
  | 'emerge'          // rises from silence — guides, indicators
  | 'reveal'          // parts from obscurity — seals, declarations
  | 'corridor-enter'; // slides from the edge — portals, paths

// ── Article II — Constitutional Element Definition ─────────────────────────
// For every element: constitutional purpose, authority, visual role,
// behavioral role, interaction philosophy, material/light/atmosphere
// relationships, and inheritance rules.

export interface ElementConstitution {
  // Identity
  family:               ElementFamily;
  name:                 string;           // plain-language name for the registry
  constitutionalPurpose:string;           // single sentence: what this element IS

  // Authority
  authorityLevel:       AuthorityLevel;
  visualRole:           VisualRole;
  maxPerContext:        number | 'unlimited'; // constitutional limit

  // Material + Light + Atmosphere
  defaultMaterial:      MaterialName;
  defaultMaterialState: MaterialState;
  preferredLight:       LightBehaviorName;
  atmosphereResponse:   Partial<Record<AtmosphereName, string>>;

  // Interaction
  interactionPhilosophy:string;           // how the element responds to the citizen
  hoverCharacter:       'illuminates' | 'deepens' | 'still' | 'reveals' | 'recedes';

  // Inheritance
  inheritanceRules:     string[];         // what this element inherits from context
  compositionRules:     string[];         // what elements may appear inside this one

  // CSS
  cssClass:             string;           // primary CSS class
  cssDataAttr:          string;           // data-family="…" attribute value
}

// ── Article III — Lifecycle Definition ────────────────────────────────────
// Every architectural element defines its full existence — from before
// the citizen sees it, through interaction, to after it departs.
// No lifecycle phase may be invented by a chamber.

export interface LifecyclePhase {
  description:    string;   // what is happening architecturally
  cssClass:       string;   // applied class during this phase
  duration:       string;   // from SURFACES.timing
  easing:         string;   // from SURFACES.easing
}

export interface ElementLifecycle {
  family:        ElementFamily;
  appearing:     LifecyclePhase;   // entering the citizen's awareness
  waiting:       LifecyclePhase;   // present but idle — most elements live here
  interacting:   LifecyclePhase;   // the citizen is engaged
  completing:    LifecyclePhase;   // a purpose was fulfilled
  dissolving:    LifecyclePhase;   // departing — purposeful, not abrupt
  remembrance:   {
    description:  string;          // what trace this element leaves
    dataAttr:     string;          // data-remembrance="value"
    visualEffect: string;          // how the trace appears
  };
}

// ── Article IV — Relationship Definition ──────────────────────────────────
// Elements communicate with each other through the architecture.
// A verdict changes what a sovereign action may do.
// A record influences the guide's message.
// A portal's destination is readable from its color.
// No isolated widgets. Only a living architectural conversation.

export interface ElementRelationship {
  family:       ElementFamily;
  influences: {
    target:     ElementFamily;
    condition:  string;   // when does this influence trigger
    effect:     string;   // what changes in the target
    cssPattern: string;   // the CSS selector pattern
  }[];
  influencedBy: {
    source:     ElementFamily;
    condition:  string;
    effect:     string;
    cssPattern: string;
  }[];
}

// ── Article V — Semantic Identity ─────────────────────────────────────────
// Elements are identified by meaning, never by appearance.
// The same constitutional element expresses differently per chamber
// while remaining the same architectural object.
// A Portal in Hujjah looks different from a Portal in the Palace —
// but both possess identical constitutional DNA.

export interface SemanticIdentity {
  family:             ElementFamily;
  recognitionMarkers: string[];   // what makes this recognizable without labels
  chambersPresent:    string[];   // which chambers currently use this element
  variants:           Record<string, string>;  // named semantic variants
}

// ═══════════════════════════════════════════════════════════════════════════
// THE IMPERIAL LIBRARY — All Ten Architectural Element Families
// ═══════════════════════════════════════════════════════════════════════════

// ── I. THE PORTAL ─────────────────────────────────────────────────────────
// A passage between architectural spaces.
// The Portal does not describe its destination — it embodies it.
// Its accent color, weight, and rhythm carry the character of where it leads.
// Portals may lead to chambers, vaults, states, or layers.

export const ELEMENT_PORTAL: ElementConstitution = {
  family:               'portal',
  name:                 'The Portal',
  constitutionalPurpose:'A passage between architectural spaces — carries the character of its destination.',
  authorityLevel:       5,          // primary — the citizen's main navigation act
  visualRole:           'primary',
  maxPerContext:        'unlimited', // portals may coexist — they are not rivals
  defaultMaterial:      'glass',    // transmits what lies beyond
  defaultMaterialState: 'listening',
  preferredLight:       'guiding',  // light leads through portals
  atmosphereResponse: {
    investigating: 'Portal to related investigations brightens — it offers a path forward.',
    victorious:    'Portals open slightly — passage is celebrated, not guarded.',
    calm:          'Portal dims slightly — no urgency, the passage waits.',
  },
  interactionPhilosophy:
    'The portal illuminates as the citizen approaches. The border accent traces the destination color. ' +
    'The citizen feels where they are going before they arrive.',
  hoverCharacter: 'reveals',
  inheritanceRules: [
    'Inherits --azma-accent from the chamber — the accent is the destination',
    'Inherits atmosphere from the vessel it lives inside',
  ],
  compositionRules: [
    'May contain: path-icon (glyph), path-name (primary text), path-desc (secondary text)',
    'May contain: indicator (living dot showing destination availability)',
  ],
  cssClass:    'azma-el-portal',
  cssDataAttr: 'portal',
};

export const LIFECYCLE_PORTAL: ElementLifecycle = {
  family:    'portal',
  appearing: {
    description: 'The portal slides in from the corridor edge. The destination is already implied.',
    cssClass:    'is-appearing',
    duration:    SURFACES.timing.architectural,
    easing:      SURFACES.easing.architectural,
  },
  waiting: {
    description: 'The portal breathes with ambient rhythm. Its indicator pulses slowly.',
    cssClass:    'is-waiting',
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  interacting: {
    description: 'Gold traces the border. The glass clears. The destination becomes visible.',
    cssClass:    'is-active',
    duration:    SURFACES.timing.deliberate,
    easing:      SURFACES.easing.deliberate,
  },
  completing: {
    description: 'The portal has been passed. It collapses toward the destination.',
    cssClass:    'is-completing',
    duration:    SURFACES.timing.imperial,
    easing:      SURFACES.easing.heavy,
  },
  dissolving: {
    description: 'The passage closes behind the citizen.',
    cssClass:    'is-dissolving',
    duration:    SURFACES.timing.imperial,
    easing:      SURFACES.easing.heavy,
  },
  remembrance: {
    description:  'A visited portal carries a trace of warmth — the citizen has been here.',
    dataAttr:     'visited',
    visualEffect: 'Permanent faint border accent — the corridor is known.',
  },
};

export const RELATIONSHIP_PORTAL: ElementRelationship = {
  family: 'portal',
  influences: [
    {
      target:    'indicator',
      condition: 'When the portal is active (is-active class)',
      effect:    'Nearby indicators quicken their pulse — the destination is live.',
      cssPattern:'.azma-el-portal.is-active ~ .azma-el-indicator',
    },
  ],
  influencedBy: [
    {
      source:    'verdict',
      condition: 'When a certain verdict exists in the same vessel',
      effect:    'The portal brightens — a path forward is now open.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict--certain) .azma-el-portal',
    },
    {
      source:    'verdict',
      condition: 'When an uncertain verdict exists in the same vessel',
      effect:    'The portal dims — the path is not yet clear.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict--uncertain) .azma-el-portal',
    },
  ],
};

// ── II. THE RECORD ────────────────────────────────────────────────────────
// A living artifact with identity, memory, and weight.
// Every Record has an age, a journey depth, and a status.
// Records do not just store — they accumulate meaning over time.
// The older and more-traveled a Record, the more it weighs.

export const ELEMENT_RECORD: ElementConstitution = {
  family:               'record',
  name:                 'The Record',
  constitutionalPurpose:'A living artifact that carries its own age, journey, and status.',
  authorityLevel:       4,          // secondary — selected records become primary
  visualRole:           'secondary',
  maxPerContext:        'unlimited',
  defaultMaterial:      'stone',    // young records; marble for established; gold for ancient
  defaultMaterialState: 'listening',
  preferredLight:       'legacy',   // records are lit by legacy light
  atmosphereResponse: {
    investigating: 'Records gain slight brightness — every artifact is under examination.',
    victorious:    'Records that contributed to the victory glow with acknowledgment.',
    reflective:    'All records are equally present — the archive is open.',
  },
  interactionPhilosophy:
    'A Record reveals its identity when selected. It does not announce its contents — ' +
    'it offers them when the citizen asks. Selection elevates a Record to primary role.',
  hoverCharacter: 'illuminates',
  inheritanceRules: [
    'Inherits age class from getTreasureClasses (tr-fresh → tr-ancient)',
    'Inherits depth class from journey length (tr-nascent → tr-deep)',
    'Inherits status class from record.status (tr-living → tr-sealed → tr-archived)',
  ],
  compositionRules: [
    'May contain: record-title (primary text), record-meta (secondary text)',
    'May contain: indicator (showing living status)',
  ],
  cssClass:    'azma-el-record',
  cssDataAttr: 'record',
};

export const LIFECYCLE_RECORD: ElementLifecycle = {
  family:    'record',
  appearing: {
    description: 'The record settles into its place. It arrives from above with the weight of stone.',
    cssClass:    'is-appearing',
    duration:    SURFACES.timing.deliberate,
    easing:      SURFACES.easing.deliberate,
  },
  waiting: {
    description: 'The living record breathes through its box-shadow. Sealed records are still.',
    cssClass:    'is-waiting',
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  interacting: {
    description: 'The record is selected. It elevates to primary role.',
    cssClass:    'is-active',
    duration:    SURFACES.timing.swift,
    easing:      'ease-out',
  },
  completing: {
    description: 'The record is sealed. Its journey is complete.',
    cssClass:    'is-completing',
    duration:    SURFACES.timing.ceremonial,
    easing:      SURFACES.easing.architectural,
  },
  dissolving: {
    description: 'The record retires to the archive. It slides away.',
    cssClass:    'is-dissolving',
    duration:    SURFACES.timing.architectural,
    easing:      SURFACES.easing.heavy,
  },
  remembrance: {
    description:  'Archived records leave a permanent cool trace — they existed here.',
    dataAttr:     'archived',
    visualEffect: 'Brightness 0.72, permanent left border at gold-2 intensity.',
  },
};

export const RELATIONSHIP_RECORD: ElementRelationship = {
  family: 'record',
  influences: [
    {
      target:    'guide',
      condition: 'When a record is selected (has .is-active)',
      effect:    'The guide updates its message to reflect the selected record.',
      cssPattern:'.azma-el-vessel:has(.azma-el-record.is-active) .azma-el-guide',
    },
  ],
  influencedBy: [
    {
      source:    'verdict',
      condition: 'When a certain verdict exists, records associated with it acknowledge',
      effect:    'Slight brightening — these records contributed to certainty.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict--certain) .azma-el-record',
    },
  ],
};

// ── III. THE VERDICT ──────────────────────────────────────────────────────
// The settled conclusion of a deliberation.
// A Verdict descends with weight. It is not presented — it arrives.
// The architecture around a Verdict responds immediately.
// Certain verdicts illuminate the space. Uncertain verdicts create tension.
// Conflicted verdicts introduce an irregular rhythm in all surrounding elements.

export const ELEMENT_VERDICT: ElementConstitution = {
  family:               'verdict',
  name:                 'The Verdict',
  constitutionalPurpose:'The settled conclusion of deliberation — changes surrounding architecture.',
  authorityLevel:       6,          // sovereign — a verdict is law
  visualRole:           'sovereign',
  maxPerContext:        1,           // only one verdict per deliberation context
  defaultMaterial:      'gold',     // certain; brushedMetal for uncertain; marble for conflicted
  defaultMaterialState: 'sovereign',
  preferredLight:       'judgment',
  atmosphereResponse: {
    deliberating: 'Verdict element brightens — this is the moment for which it exists.',
    investigating: 'Verdict that emerges during investigation is highlighted against the examination light.',
  },
  interactionPhilosophy:
    'A Verdict does not respond to hover — it has already decided. ' +
    'Interaction with a Verdict means deepening investigation, never changing the verdict itself.',
  hoverCharacter: 'still',
  inheritanceRules: [
    'Inherits atmosphere — the verdict is the apex of whatever atmosphere preceded it',
    'Does not inherit accent — a verdict expresses only gold (certain) or muted (uncertain)',
  ],
  compositionRules: [
    'May contain: declaration (the verdict text)',
    'May contain: indicator (the confidence level)',
    'May NOT contain: sovereign-action (a verdict is the action — it contains none)',
  ],
  cssClass:    'azma-el-verdict',
  cssDataAttr: 'verdict',
};

export const LIFECYCLE_VERDICT: ElementLifecycle = {
  family:    'verdict',
  appearing: {
    description: 'The verdict descends from above. Gold falls with the weight of finality.',
    cssClass:    'is-appearing',
    duration:    SURFACES.timing.ceremonial,
    easing:      SURFACES.easing.heavy,
  },
  waiting: {
    description: 'The verdict rests. It is permanent. It does not breathe — it has settled.',
    cssClass:    'is-waiting',
    duration:    'none',
    easing:      'none',
  },
  interacting: {
    description: 'The citizen examines the verdict more deeply. No brightening — only deepening.',
    cssClass:    'is-active',
    duration:    SURFACES.timing.deliberate,
    easing:      SURFACES.easing.deliberate,
  },
  completing: {
    description: 'The verdict becomes part of the permanent record. It seals itself.',
    cssClass:    'is-completing',
    duration:    SURFACES.timing.imperial,
    easing:      SURFACES.easing.heavy,
  },
  dissolving: {
    description: 'Verdicts do not dissolve — they are archived. They leave permanently.',
    cssClass:    'is-dissolving',
    duration:    SURFACES.timing.geological,
    easing:      SURFACES.easing.breath,
  },
  remembrance: {
    description:  'A past verdict marks the space permanently. The question was asked here.',
    dataAttr:     'decided',
    visualEffect: 'Left border at gold-3 intensity, brightness at 0.85 — sealed in stone.',
  },
};

export const RELATIONSHIP_VERDICT: ElementRelationship = {
  family: 'verdict',
  influences: [
    {
      target:    'sovereign-action',
      condition: 'When verdict is certain — path forward is clear',
      effect:    'Sovereign action brightens — the citizen may now act decisively.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict--certain) .azma-el-sovereign-action',
    },
    {
      target:    'sovereign-action',
      condition: 'When verdict is uncertain — deliberation must continue',
      effect:    'Sovereign action dims — premature conclusion is architecturally discouraged.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict--uncertain) .azma-el-sovereign-action',
    },
    {
      target:    'portal',
      condition: 'When verdict is certain — the path forward opens',
      effect:    'Portals brighten — the citizen has somewhere to go now.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict--certain) .azma-el-portal',
    },
    {
      target:    'guide',
      condition: 'After any verdict',
      effect:    'Guide brightens slightly — it has something to say about the conclusion.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict) .azma-el-guide',
    },
  ],
  influencedBy: [],
};

// ── IV. THE SOVEREIGN ACTION ──────────────────────────────────────────────
// The primary act. What the citizen came to do.
// Constitutionally singular — only one per deliberative context.
// The Sovereign Action does not compete for attention.
// It simply exists at the highest authority. The citizen finds it.
// It never shouts. It never animates. It is simply there.

export const ELEMENT_SOVEREIGN_ACTION: ElementConstitution = {
  family:               'sovereign-action',
  name:                 'The Sovereign Action',
  constitutionalPurpose:'The singular primary act — the citizen\'s decisive engagement point.',
  authorityLevel:       6,
  visualRole:           'sovereign',
  maxPerContext:        1,           // constitutional law — only one per context
  defaultMaterial:      'gold',
  defaultMaterialState: 'sovereign',
  preferredLight:       'judgment',
  atmosphereResponse: {
    investigating: 'Dims slightly — the investigation is not yet complete.',
    deliberating:  'Remains at full authority — the moment of decision.',
    victorious:    'Brief celebration state, then settles to completion.',
    calm:          'Dims to primary level — no urgency presses.',
  },
  interactionPhilosophy:
    'The Sovereign Action does not animate on hover — it has no need to. ' +
    'It brightens when the citizen presses, confirming the weight of the act. ' +
    'It never spins. It never transforms. It simply is, and then it is done.',
  hoverCharacter: 'still',
  inheritanceRules: [
    'Inherits context atmosphere — responds to chamber emotional state',
    'Inherits verdict influence — certain verdict elevates it, uncertain dims it',
  ],
  compositionRules: [
    'Contains text only — no icons, no decorations, no loading spinners',
    'May contain: indicator (showing completion state after the act)',
  ],
  cssClass:    'azma-el-sovereign-action',
  cssDataAttr: 'sovereign-action',
};

export const LIFECYCLE_SOVEREIGN_ACTION: ElementLifecycle = {
  family:    'sovereign-action',
  appearing: {
    description: 'The Sovereign Action was always here. It fades in with ceremony.',
    cssClass:    'is-appearing',
    duration:    SURFACES.timing.ceremonial,
    easing:      SURFACES.easing.architectural,
  },
  waiting: {
    description: 'It holds its authority in stillness. No animation. No beckoning.',
    cssClass:    'is-waiting',
    duration:    'none',
    easing:      'none',
  },
  interacting: {
    description: 'The citizen acts. A brief deepening, then expansion.',
    cssClass:    'is-active',
    duration:    SURFACES.timing.instant,
    easing:      SURFACES.easing.swift,
  },
  completing: {
    description: 'The act is done. A brief golden ceremony, then it settles into permanence.',
    cssClass:    'is-completing',
    duration:    SURFACES.timing.ceremonial,
    easing:      SURFACES.easing.architectural,
  },
  dissolving: {
    description: 'Sovereign actions do not dissolve — they complete and become memory.',
    cssClass:    'is-dissolving',
    duration:    SURFACES.timing.imperial,
    easing:      SURFACES.easing.heavy,
  },
  remembrance: {
    description:  'A completed act leaves a trace — gold border at ambient intensity.',
    dataAttr:     'completed',
    visualEffect: 'Gold border at glow-ambient opacity, brightness at 1.10.',
  },
};

export const RELATIONSHIP_SOVEREIGN_ACTION: ElementRelationship = {
  family: 'sovereign-action',
  influences: [
    {
      target:    'guide',
      condition: 'After completing',
      effect:    'Guide delivers the completion message — the act is acknowledged.',
      cssPattern:'.azma-el-sovereign-action[data-remembrance="completed"] ~ .azma-el-guide',
    },
  ],
  influencedBy: [
    {
      source:    'verdict',
      condition: 'When a certain verdict exists',
      effect:    'Full sovereign brightness — the citizen may act.',
      cssPattern:'documented in RELATIONSHIP_VERDICT',
    },
  ],
};

// ── V. THE GUIDE ──────────────────────────────────────────────────────────
// The living companion of the chamber.
// The Guide is never a chatbot. Never a notification. Never a status bar.
// It is an architectural presence that offers interpretation, never instruction.
// The Guide lives at the periphery — always present, never in the way.
// Its message changes, but its position never surprises.

export const ELEMENT_GUIDE: ElementConstitution = {
  family:               'guide',
  name:                 'The Guide',
  constitutionalPurpose:'The living companion — interprets chamber events from the periphery.',
  authorityLevel:       3,          // advisory — guidance without demand
  visualRole:           'advisory',
  maxPerContext:        1,           // one voice per chamber
  defaultMaterial:      'glass',    // peripheral, transparent, present not dominant
  defaultMaterialState: 'listening',
  preferredLight:       'resting',  // guide exists in ambient resting light
  atmosphereResponse: {
    calm:          'Guide is whisper-quiet — almost architectural.',
    investigating: 'Guide is slightly brighter — it has something relevant to offer.',
    victorious:    'Guide offers the acknowledgment — its message is warmest.',
    reflective:    'Guide settles — after the act, it becomes the memorial.',
  },
  interactionPhilosophy:
    'The Guide does not respond to clicks. It does not hover-brighten. ' +
    'It breathes. Its message changes based on what the chamber has done, ' +
    'not what the citizen has asked.',
  hoverCharacter: 'still',
  inheritanceRules: [
    'Inherits atmosphere — the guide reads the room',
    'Influenced by: record selection, verdict arrival, sovereign action completion',
  ],
  compositionRules: [
    'Contains text only — the message is the entire element',
    'May NOT contain: buttons, links, interactive elements',
  ],
  cssClass:    'azma-el-guide',
  cssDataAttr: 'guide',
};

export const LIFECYCLE_GUIDE: ElementLifecycle = {
  family:    'guide',
  appearing: {
    description: 'The guide emerges from silence. It was always at the edge.',
    cssClass:    'is-appearing',
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  waiting: {
    description: 'The guide breathes with the chamber. Its opacity follows the atmosphere.',
    cssClass:    'is-waiting',
    duration:    SURFACES.timing.geological,
    easing:      SURFACES.easing.breath,
  },
  interacting: {
    description: 'No interaction — the guide does not respond to the citizen directly.',
    cssClass:    'is-waiting',  // same as waiting — no interaction state
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  completing: {
    description: 'The guide has delivered its message. Brief brightening.',
    cssClass:    'is-completing',
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  dissolving: {
    description: 'The guide fades back into the architecture.',
    cssClass:    'is-dissolving',
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  remembrance: {
    description:  'The guide\'s last message lingers at ghost opacity.',
    dataAttr:     'echoing',
    visualEffect: 'Opacity 0.35, brightness 0.72 — a whisper of what was said.',
  },
};

export const RELATIONSHIP_GUIDE: ElementRelationship = {
  family: 'guide',
  influences: [],
  influencedBy: [
    {
      source:    'verdict',
      condition: 'After a verdict arrives',
      effect:    'Guide brightens — it has context to offer.',
      cssPattern:'.azma-el-vessel:has(.azma-el-verdict) .azma-el-guide',
    },
    {
      source:    'record',
      condition: 'When a record is actively selected',
      effect:    'Guide is fully present — it interprets the selected artifact.',
      cssPattern:'.azma-el-vessel:has(.azma-el-record.is-active) .azma-el-guide',
    },
  ],
};

// ── VI. THE INDICATOR ─────────────────────────────────────────────────────
// The smallest unit of meaning in the empire.
// A single dot that carries information through rhythm alone.
// Slow pulse = ambient, alive, waiting.
// Fast pulse = active, working, processing.
// Solid = complete, settled, permanent.
// Irregular = uncertain, unresolved.
// The citizen reads the indicator without being told how.

export const ELEMENT_INDICATOR: ElementConstitution = {
  family:               'indicator',
  name:                 'The Indicator',
  constitutionalPurpose:'The living dot — carries meaning through rhythm alone, never through labels.',
  authorityLevel:       2,          // passive — it does not demand, it informs
  visualRole:           'passive',
  maxPerContext:        'unlimited',
  defaultMaterial:      'gold',     // always gold — the source of all information
  defaultMaterialState: 'waiting',
  preferredLight:       'resting',
  atmosphereResponse: {
    creating:      'Indicator quickens — something is being made.',
    victorious:    'Indicator becomes solid — completion is absolute.',
    investigating: 'Indicator pulses at investigation rhythm.',
  },
  interactionPhilosophy: 'The Indicator does not interact. It is read, not touched.',
  hoverCharacter: 'still',
  inheritanceRules: [
    'Inherits color from parent element\'s accent (--azma-accent)',
    'Inherits rhythm from chamber atmosphere',
  ],
  compositionRules: [
    'Contains nothing — it IS the element',
    'May NOT contain text, icons, or other elements',
  ],
  cssClass:    'azma-el-indicator',
  cssDataAttr: 'indicator',
};

export const LIFECYCLE_INDICATOR: ElementLifecycle = {
  family:    'indicator',
  appearing: {
    description: 'The dot scales from nothing into presence.',
    cssClass:    'is-appearing',
    duration:    SURFACES.timing.swift,
    easing:      SURFACES.easing.architectural,
  },
  waiting: {
    description: 'Slow ambient pulse — alive, aware, patient.',
    cssClass:    'is-waiting',
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  interacting: {
    description: 'The indicator quickens — something is being processed.',
    cssClass:    'is-active',
    duration:    SURFACES.timing.deliberate,
    easing:      SURFACES.easing.breath,
  },
  completing: {
    description: 'The indicator becomes solid. No more pulse — the thing is done.',
    cssClass:    'is-completing',
    duration:    SURFACES.timing.swift,
    easing:      SURFACES.easing.deliberate,
  },
  dissolving: {
    description: 'The dot scales back to nothing.',
    cssClass:    'is-dissolving',
    duration:    SURFACES.timing.swift,
    easing:      SURFACES.easing.deliberate,
  },
  remembrance: { description: 'none', dataAttr: 'none', visualEffect: 'none' },
};

// ── VII. THE SEAL ─────────────────────────────────────────────────────────
// The ceremonial barrier. Authentication. The gate between states.
// The Seal announces nothing. It simply blocks, or it opens.
// When it opens, the doors part. The architecture makes way.

export const ELEMENT_SEAL: ElementConstitution = {
  family:               'seal',
  name:                 'The Seal',
  constitutionalPurpose:'Ceremonial barrier — the gate between states, authentication, and completion marker.',
  authorityLevel:       7,          // sacred — ceremony only
  visualRole:           'sovereign',
  maxPerContext:        1,
  defaultMaterial:      'gold',
  defaultMaterialState: 'waiting',
  preferredLight:       'judgment',
  atmosphereResponse:   {},
  interactionPhilosophy:
    'The Seal does not invite — it requires. The citizen approaches it with weight. ' +
    'When the Seal opens, the architecture makes way entirely.',
  hoverCharacter: 'still',
  inheritanceRules: [
    'Inherits nothing — the seal is the beginning, before the chamber speaks',
  ],
  compositionRules: [
    'Contains a glyph only (the imperial symbol)',
    'May NOT contain text — the seal speaks in form, not words',
  ],
  cssClass:    'azma-el-seal',
  cssDataAttr: 'seal',
};

export const LIFECYCLE_SEAL: ElementLifecycle = {
  family:    'seal',
  appearing: {
    description: 'The seal reveals itself from the void. Scales from nothing into authority.',
    cssClass:    'is-appearing',
    duration:    SURFACES.timing.ceremonial,
    easing:      SURFACES.easing.architectural,
  },
  waiting: {
    description: 'The seal breathes slowly. It holds the space.',
    cssClass:    'is-waiting',
    duration:    SURFACES.timing.atmospheric,
    easing:      SURFACES.easing.breath,
  },
  interacting: {
    description: 'The citizen engages. The seal holds firm — it will decide, not the citizen.',
    cssClass:    'is-active',
    duration:    SURFACES.timing.deliberate,
    easing:      SURFACES.easing.deliberate,
  },
  completing: {
    description: 'The seal is satisfied. The doors part. The architecture makes way.',
    cssClass:    'is-completing',
    duration:    SURFACES.timing.imperial,
    easing:      SURFACES.easing.architectural,
  },
  dissolving: {
    description: 'The seal closes. The clip-path seals from center outward.',
    cssClass:    'is-dissolving',
    duration:    SURFACES.timing.imperial,
    easing:      SURFACES.easing.heavy,
  },
  remembrance: {
    description:  'The seal does not leave traces — it simply opens or closes.',
    dataAttr:     'none',
    visualEffect: 'none',
  },
};

// ── VIII. THE VESSEL ──────────────────────────────────────────────────────
// The architectural container with atmosphere and walls.
// A Vessel is not a card or a panel — it is a room.
// It has atmosphere, light, and personality.
// Everything inside a Vessel is shaped by the Vessel's character.
// The Vessel grows with what it contains.

export const ELEMENT_VESSEL: ElementConstitution = {
  family:               'vessel',
  name:                 'The Vessel',
  constitutionalPurpose:'Architectural container — a room with atmosphere that shapes everything inside.',
  authorityLevel:       1,          // silent — the vessel enables, it does not perform
  visualRole:           'silent',
  maxPerContext:        'unlimited',
  defaultMaterial:      'marble',   // the vessel is always marble — the hall itself
  defaultMaterialState: 'listening',
  preferredLight:       'resting',
  atmosphereResponse: {
    investigating: 'Vessel walls become slightly more present — the room tightens.',
    victorious:    'Vessel fills with warmth — the room celebrates.',
    calm:          'Vessel recedes — barely visible, fully supportive.',
  },
  interactionPhilosophy:
    'The Vessel does not interact. The citizen interacts with what is inside it. ' +
    'The Vessel only reveals itself when things inside change.',
  hoverCharacter: 'still',
  inheritanceRules: [
    'Receives atmosphere from chamber — passes it to all children',
    'Receives data-atmosphere attribute — propagates to child elements',
  ],
  compositionRules: [
    'May contain: any element family',
    'Structural elements (portals, paths) live at the vessel\'s edges',
    'Content elements (records, verdicts) live at the vessel\'s center',
    'The guide always lives at the vessel\'s bottom periphery',
  ],
  cssClass:    'azma-el-vessel',
  cssDataAttr: 'vessel',
};

// ── IX. THE PATH ──────────────────────────────────────────────────────────
// Navigation with directional character — a corridor.
// A Path is different from a Portal: a Portal leads to a space,
// a Path is the act of moving through space.
// Paths have direction. They remember where they started.

export const ELEMENT_PATH: ElementConstitution = {
  family:               'path',
  name:                 'The Path',
  constitutionalPurpose:'Directional corridor — navigation that remembers its origin and destination.',
  authorityLevel:       4,
  visualRole:           'secondary',
  maxPerContext:        'unlimited',
  defaultMaterial:      'obsidian', // the corridor is darkness with gold at its edge
  defaultMaterialState: 'listening',
  preferredLight:       'guiding',
  atmosphereResponse: {
    curious:    'Paths brighten — exploration is encouraged.',
    reflective: 'Paths dim — the citizen has already traveled; rest now.',
  },
  interactionPhilosophy:
    'The path reveals its destination color on approach. ' +
    'The border accent traces where it leads. ' +
    'A traveled path carries warmth — the citizen has been through this corridor.',
  hoverCharacter: 'reveals',
  inheritanceRules: [
    'Inherits --azma-accent from the destination chamber',
    'May carry data-remembrance="traveled" for visited paths',
  ],
  compositionRules: [
    'Contains: path-icon (directional glyph), path-label (destination name)',
    'May contain: indicator (showing destination availability)',
  ],
  cssClass:    'azma-el-path',
  cssDataAttr: 'path',
};

// ── X. THE DECLARATION ───────────────────────────────────────────────────
// Supreme text. The title, the verdict, the sovereign message.
// A Declaration is never decorative. It carries meaning.
// It does not animate. It does not hover. It is the word itself.
// Nothing is more authoritative than a Declaration — it needs no decoration.

export const ELEMENT_DECLARATION: ElementConstitution = {
  family:               'declaration',
  name:                 'The Declaration',
  constitutionalPurpose:'Supreme text — the word itself. Title, verdict text, or sovereign message.',
  authorityLevel:       6,
  visualRole:           'sovereign',
  maxPerContext:        3,           // maximum 3 declarations per view context
  defaultMaterial:      'gold',
  defaultMaterialState: 'sovereign',
  preferredLight:       'judgment',
  atmosphereResponse: {
    investigating: 'Declaration gains slight crispness — every word is under examination.',
    victorious:    'Declaration at maximum warmth — these words mean something.',
  },
  interactionPhilosophy:
    'The Declaration does not interact. It is read. ' +
    'Animation would diminish it. Movement would suggest uncertainty. ' +
    'It is still because it is certain.',
  hoverCharacter: 'still',
  inheritanceRules: [
    'Inherits typography scale from context (grand for titles, imperial for sovereign)',
    'Never inherits animation from parent — declarations are always still',
  ],
  compositionRules: [
    'Contains text only — the word is the element',
    'May NOT contain icons, indicators, or interactive elements',
  ],
  cssClass:    'azma-el-declaration',
  cssDataAttr: 'declaration',
};

// ═══════════════════════════════════════════════════════════════════════════
// ARTICLE VI — THE IMPERIAL LIBRARY
// The complete registry. Future chambers consult this before building.
// ═══════════════════════════════════════════════════════════════════════════

export const IMPERIAL_LIBRARY: Record<ElementFamily, ElementConstitution> = {
  'portal':           ELEMENT_PORTAL,
  'record':           ELEMENT_RECORD,
  'verdict':          ELEMENT_VERDICT,
  'sovereign-action': ELEMENT_SOVEREIGN_ACTION,
  'guide':            ELEMENT_GUIDE,
  'indicator':        ELEMENT_INDICATOR,
  'seal':             ELEMENT_SEAL,
  'vessel':           ELEMENT_VESSEL,
  'path':             ELEMENT_PATH,
  'declaration':      ELEMENT_DECLARATION,
} as const;

export const IMPERIAL_LIFECYCLES: Partial<Record<ElementFamily, ElementLifecycle>> = {
  'portal':           LIFECYCLE_PORTAL,
  'record':           LIFECYCLE_RECORD,
  'verdict':          LIFECYCLE_VERDICT,
  'sovereign-action': LIFECYCLE_SOVEREIGN_ACTION,
  'guide':            LIFECYCLE_GUIDE,
  'indicator':        LIFECYCLE_INDICATOR,
  'seal':             LIFECYCLE_SEAL,
} as const;

export const IMPERIAL_RELATIONSHIPS: Partial<Record<ElementFamily, ElementRelationship>> = {
  'portal':           RELATIONSHIP_PORTAL,
  'record':           RELATIONSHIP_RECORD,
  'verdict':          RELATIONSHIP_VERDICT,
  'sovereign-action': RELATIONSHIP_SOVEREIGN_ACTION,
  'guide':            RELATIONSHIP_GUIDE,
} as const;

// ── Article VII — Semantic Identity Registry ──────────────────────────────
// What makes each element recognizable WITHOUT labels, icons, or colors.
// This is the architectural fingerprint of each element family.

export const SEMANTIC_IDENTITIES: Record<ElementFamily, SemanticIdentity> = {
  'portal': {
    family:             'portal',
    recognitionMarkers: [
      'Right-border accent traces the destination (RTL: left-side visual border)',
      'Inset corridor depth — slightly recessed from the surface',
      'Glyph space on the leading edge — the destination speaks before the name does',
      'On hover: the corridor opens — the border intensifies, depth reveals',
    ],
    chambersPresent: ['sovereign-vault-palace', 'hujjah-al-damighah'],
    variants:        { corridor: 'Internal navigation', sealed: 'Access denied', active: 'Currently traversing' },
  },
  'record': {
    family:             'record',
    recognitionMarkers: [
      'Settles from above on appearance — arrives with weight',
      'Breathing box-shadow (living records only) — the artifact lives',
      'Left-border indicates sealed status — a permanent gold trace',
      'Dimming increases with age — the deeper in the archive, the cooler the stone',
    ],
    chambersPresent: ['sovereign-vault-palace'],
    variants:        { living: 'Active artifact', sealed: 'Completed journey', archived: 'Historical record' },
  },
  'verdict': {
    family:             'verdict',
    recognitionMarkers: [
      'Descends from above with ceremonial weight — judgment falls',
      'Surrounded by breathing room — the verdict changes the spatial rhythm',
      'Certain verdict has gold border — the light has settled',
      'Uncertain verdict has irregular pulse — the light wavers',
      'All neighboring elements respond — nothing is unchanged after a verdict',
    ],
    chambersPresent: ['hujjah-al-damighah'],
    variants:        { certain: 'Settled truth', uncertain: 'Unresolved', conflicted: 'Tension remains' },
  },
  'sovereign-action': {
    family:             'sovereign-action',
    recognitionMarkers: [
      'Single in its context — no competition, no hierarchy needed',
      'Full gold border — not a hover state, a permanent presence',
      'Larger than surrounding elements — not padded, genuinely larger',
      'Does not animate on hover — stillness is the authority',
      'When complete, leaves a permanent gold trace — the act is history',
    ],
    chambersPresent: ['hujjah-al-damighah', 'sovereign-vault-palace'],
    variants:        { active: 'Awaiting the citizen', completing: 'The act is done', disabled: 'Not yet time' },
  },
  'guide': {
    family:             'guide',
    recognitionMarkers: [
      'Always at the bottom edge — never central, never intrusive',
      'Ghost-to-muted opacity range — barely there, but present',
      'Breathes with the atmosphere — its pace follows the chamber',
      'Does not react to hover — it is read, not touched',
      'Its message changes without being called — it reads the room',
    ],
    chambersPresent: ['sovereign-vault-palace', 'hujjah-al-damighah'],
    variants:        { present: 'Active companion', echoing: 'Last message lingers', silent: 'The chamber speaks' },
  },
  'indicator': {
    family:             'indicator',
    recognitionMarkers: [
      '6px dot maximum — never larger than a jewel',
      'Pulse rhythm carries meaning: slow = ambient, quick = active, stopped = complete, irregular = uncertain',
      'Gold only — it is the smallest unit of the light system',
      'Never labeled — rhythm alone communicates',
    ],
    chambersPresent: ['sovereign-vault-palace', 'hujjah-al-damighah'],
    variants:        { ambient: 'Alive and waiting', active: 'Working', complete: 'Done', uncertain: 'Wavering' },
  },
  'seal': {
    family:             'seal',
    recognitionMarkers: [
      'Always centered — the seal is the axis of its space',
      'Slow ceremonial pulse — not interactive, not anxious',
      'When it opens: the architecture moves away from it (doors part)',
      'No label — the form carries all authority',
    ],
    chambersPresent: ['sovereign-vault-palace'],
    variants:        { waiting: 'Holding the gate', opening: 'The passage parts', complete: 'Sealed closed' },
  },
  'vessel': {
    family:             'vessel',
    recognitionMarkers: [
      'Everything inside it shares its atmosphere — the room shapes its contents',
      'Taller than wide — architectural proportion, not dashboard proportion',
      'Its walls are barely visible — the vessel exists to contain, not to be seen',
      'When contents change, the vessel responds — the room breathes with its inhabitants',
    ],
    chambersPresent: ['sovereign-vault-palace', 'hujjah-al-damighah', 'qiyamah-chamber'],
    variants:        { chamber: 'Full chamber space', vault: 'Focused collection', panel: 'Detail focus space' },
  },
  'path': {
    family:             'path',
    recognitionMarkers: [
      'Corridor character — recessed from the portal, suggesting the walk',
      'Destination color in the border accent',
      'No box — no borders on top/bottom/left, only the leading edge',
      'Traveled paths carry warmth — the citizen has been here before',
    ],
    chambersPresent: ['sovereign-vault-palace'],
    variants:        { open: 'Traversable corridor', traveled: 'This way has been taken', blocked: 'Not yet passable' },
  },
  'declaration': {
    family:             'declaration',
    recognitionMarkers: [
      'Largest text in its context — no competition for the eye',
      'Never moves — declaration is certainty expressed in stillness',
      'Letter-spacing increases with authority — the more sovereign, the more space between words',
      'Gold text only — no other color carries this authority',
      'Surrounded by significantly more space than any other text element',
    ],
    chambersPresent: ['sovereign-vault-palace', 'hujjah-al-damighah', 'qiyamah-chamber'],
    variants:        { title: 'Chamber title', verdict: 'Verdict text', sovereign: 'Supreme declaration' },
  },
} as const;

// ── Constitutional Validation Helpers ────────────────────────────────────
// Development-time utilities to verify ACLE compliance.

/** Checks if a container has at most one sovereign action (constitutional law). */
export function validateSovereignAction(container: Element): boolean {
  return container.querySelectorAll('[data-family="sovereign-action"]').length <= 1;
}

/** Checks if a container has at most one verdict (constitutional law). */
export function validateVerdict(container: Element): boolean {
  return container.querySelectorAll('[data-family="verdict"]').length <= 1;
}

/** Checks if an element carries its constitutional data-family attribute. */
export function hasConstitutionalIdentity(element: Element): boolean {
  return element.hasAttribute('data-family');
}

/** Returns the element's constitutional family, or null if unregistered. */
export function getElementFamily(element: Element): ElementFamily | null {
  const family = element.getAttribute('data-family') as ElementFamily | null;
  if (!family || !(family in IMPERIAL_LIBRARY)) return null;
  return family;
}

/** Returns the constitutional element definition for a given CSS class. */
export function getElementByClass(cssClass: string): ElementConstitution | null {
  return Object.values(IMPERIAL_LIBRARY).find(e => e.cssClass === cssClass) ?? null;
}

