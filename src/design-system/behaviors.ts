/**
 * AZMA OS — Visual Identity Engine V1.1
 * Behavioral Constitution
 *
 * This layer transforms the visual system from a design language into
 * a living behavioral system. Where tokens.ts defines WHAT things look like,
 * behaviors.ts defines HOW things ACT — across time, state, and atmosphere.
 *
 * Articles I–VII of the V1.1 Constitutional Work Package.
 *
 * Import from src/design-system/index.ts — never directly.
 * The CSS must be imported separately: azma-behaviors.css
 */

import { ILLUMINATION, ELEVATION } from './tokens';
import type { MaterialName } from './tokens';

// ── Article I — Materials Have Memory ─────────────────────────────────────
// Materials are no longer static. Each material has lived experience.
// When the empire enters a state, materials respond from their nature.
// Obsidian celebrates by receiving light, not emitting it.
// Gold celebrates by radiating everything it holds.
// Stone barely changes — it has seen everything before.
// The chamber never invents these reactions. The material already knows.

export type MaterialState =
  | 'dormant'        // at rest — no activity, no demand
  | 'listening'      // aware — presence registered, waiting
  | 'working'        // active — engaged in a process
  | 'waiting'        // patient — a response is expected
  | 'celebrating'    // ceremony — something was completed
  | 'uncertain'      // doubt — unresolved tension, conflict
  | 'sovereign';     // authority — maximum imperial weight

export interface MaterialBehavior {
  description:    string;
  brightness:     number;    // CSS filter brightness() value
  glowOpacity:    number;    // gold rgba opacity (ILLUMINATION.glow scale)
  glowRadius:     number;    // px — 0 means no glow
  motionCharacter:'still' | 'slowed' | 'normal' | 'quickened' | 'irregular';
  opacityModifier: number;   // multiplied with element opacity (1 = unchanged)
}

// Material behaviors: what each material does in each state.
// The values reflect each material's inherent nature (lightBehavior, weight).
// See MATERIALS in tokens.ts for the physical rationale.

export const MATERIAL_BEHAVIORS: Record<MaterialName, Record<MaterialState, MaterialBehavior>> = {

  obsidian: {
    dormant:    { description: 'Silent stone. Absorbs all, reflects nothing.',    brightness: 0.82, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    listening:  { description: 'Darkened surface. Aware of what approaches.',     brightness: 0.95, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'normal',    opacityModifier: 1.00 },
    working:    { description: 'Internal activity illuminated from within.',       brightness: 1.05, glowOpacity: 0.10, glowRadius: 10, motionCharacter: 'normal',    opacityModifier: 1.00 },
    waiting:    { description: 'Patient darkness. Not yet revealed.',              brightness: 0.88, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 0.95 },
    celebrating:{ description: 'Obsidian lit — rare. Gold pours through.',        brightness: 1.25, glowOpacity: 0.35, glowRadius: 24, motionCharacter: 'quickened', opacityModifier: 1.00 },
    uncertain:  { description: 'The surface wavers. Light does not settle.',       brightness: 0.82, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'irregular', opacityModifier: 1.00 },
    sovereign:  { description: 'Maximum authority. Gold falls upon the obsidian.', brightness: 1.42, glowOpacity: 0.55, glowRadius: 48, motionCharacter: 'still',     opacityModifier: 1.00 },
  },

  marble: {
    dormant:    { description: 'Pale and quiet. Architecture at rest.',            brightness: 0.85, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    listening:  { description: 'Marble awaits. The hall is ready.',               brightness: 1.00, glowOpacity: 0.04, glowRadius:  8, motionCharacter: 'normal',    opacityModifier: 1.00 },
    working:    { description: 'The deliberation hall is active.',                 brightness: 1.10, glowOpacity: 0.08, glowRadius: 12, motionCharacter: 'normal',    opacityModifier: 1.00 },
    waiting:    { description: 'Still columns. Patient architecture.',             brightness: 0.92, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    celebrating:{ description: 'The hall celebrates. Gold diffuses through stone.',brightness: 1.30, glowOpacity: 0.30, glowRadius: 28, motionCharacter: 'quickened', opacityModifier: 1.00 },
    uncertain:  { description: 'Marble cracks do not resolve. Doubt in the hall.', brightness: 0.88, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'irregular', opacityModifier: 0.92 },
    sovereign:  { description: 'The throne room awakened. Gold fills the hall.',   brightness: 1.40, glowOpacity: 0.45, glowRadius: 40, motionCharacter: 'still',     opacityModifier: 1.00 },
  },

  brushedMetal: {
    dormant:    { description: 'Mechanism at rest. Gears still.',                  brightness: 0.88, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    listening:  { description: 'Mechanism primed. Ready to engage.',              brightness: 1.05, glowOpacity: 0.05, glowRadius:  8, motionCharacter: 'normal',    opacityModifier: 1.00 },
    working:    { description: 'The mechanism turns. Directional light flares.',   brightness: 1.18, glowOpacity: 0.15, glowRadius: 12, motionCharacter: 'quickened', opacityModifier: 1.00 },
    waiting:    { description: 'Mechanism suspended. Waiting for the signal.',     brightness: 0.95, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'normal',    opacityModifier: 0.95 },
    celebrating:{ description: 'Metal reflects the celebration fully.',            brightness: 1.38, glowOpacity: 0.38, glowRadius: 28, motionCharacter: 'quickened', opacityModifier: 1.00 },
    uncertain:  { description: 'Mechanism jams. Light reflects erratically.',      brightness: 0.88, glowOpacity: 0.05, glowRadius:  6, motionCharacter: 'irregular', opacityModifier: 0.90 },
    sovereign:  { description: 'The imperial seal mechanism. Maximum authority.',  brightness: 1.48, glowOpacity: 0.60, glowRadius: 55, motionCharacter: 'still',     opacityModifier: 1.00 },
  },

  gold: {
    dormant:    { description: 'Gold at rest. Still holds warmth.',                brightness: 0.90, glowOpacity: 0.08, glowRadius:  8, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    listening:  { description: 'Gold attends. It warms toward what approaches.',   brightness: 1.00, glowOpacity: 0.12, glowRadius: 12, motionCharacter: 'normal',    opacityModifier: 1.00 },
    working:    { description: 'Gold pours. The light intensifies with purpose.',  brightness: 1.12, glowOpacity: 0.22, glowRadius: 18, motionCharacter: 'quickened', opacityModifier: 1.00 },
    waiting:    { description: 'Gold dims. Patient. The light waits.',             brightness: 0.95, glowOpacity: 0.08, glowRadius:  8, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    celebrating:{ description: 'Gold radiates. The source becomes the celebration.',brightness:1.45, glowOpacity: 0.65, glowRadius: 48, motionCharacter: 'quickened', opacityModifier: 1.00 },
    uncertain:  { description: 'Even gold wavers. The light is unsure of itself.', brightness: 0.85, glowOpacity: 0.08, glowRadius:  8, motionCharacter: 'irregular', opacityModifier: 1.00 },
    sovereign:  { description: 'Gold at maximum. This is the source of all light.', brightness:1.60, glowOpacity: 0.80, glowRadius: 80, motionCharacter: 'still',     opacityModifier: 1.00 },
  },

  glass: {
    dormant:    { description: 'Glass fogs. The depth below is hidden.',           brightness: 0.78, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 0.80 },
    listening:  { description: 'Glass clears. The depth begins to show.',          brightness: 1.00, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'normal',    opacityModifier: 0.88 },
    working:    { description: 'Glass reveals. Layers visible beneath.',           brightness: 1.15, glowOpacity: 0.08, glowRadius: 10, motionCharacter: 'normal',    opacityModifier: 0.95 },
    waiting:    { description: 'Glass holds. A window to what comes.',             brightness: 0.90, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 0.82 },
    celebrating:{ description: 'Glass at full clarity. Nothing withheld.',         brightness: 1.35, glowOpacity: 0.40, glowRadius: 40, motionCharacter: 'quickened', opacityModifier: 1.00 },
    uncertain:  { description: 'Glass clouds. The depth is unclear.',              brightness: 0.85, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'irregular', opacityModifier: 0.75 },
    sovereign:  { description: 'Glass as portal. Everything visible. Nothing hidden.',brightness:1.50,glowOpacity:1.00,glowRadius: 60, motionCharacter: 'still',     opacityModifier: 1.00 },
  },

  stone: {
    dormant:    { description: 'Stone has always been here. Nothing changes.',     brightness: 0.72, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    listening:  { description: 'Ancient stone notices, but does not show it.',     brightness: 0.85, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'slowed',    opacityModifier: 1.00 },
    working:    { description: 'Stone channels the work. Barely visible shift.',   brightness: 0.95, glowOpacity: 0.04, glowRadius:  6, motionCharacter: 'normal',    opacityModifier: 1.00 },
    waiting:    { description: 'Stone waits as it always has — eternally.',        brightness: 0.78, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'still',     opacityModifier: 1.00 },
    celebrating:{ description: 'Even stone feels it. Ancient walls warm slightly.', brightness:1.10, glowOpacity: 0.25, glowRadius: 20, motionCharacter: 'normal',    opacityModifier: 1.00 },
    uncertain:  { description: 'The ancient stone feels the tension.',             brightness: 0.70, glowOpacity: 0.00, glowRadius:  0, motionCharacter: 'irregular', opacityModifier: 0.95 },
    sovereign:  { description: 'The oldest stone recognizes authority.',           brightness: 1.20, glowOpacity: 0.35, glowRadius: 28, motionCharacter: 'still',     opacityModifier: 1.00 },
  },
} as const;

// ── Article II — Light Is a Living System ─────────────────────────────────
// Gold is no longer a color — it is the empire's nervous system.
// Light behaves. It remembers. It responds to what the chamber is doing.
// No chamber may invent its own glow philosophy.
// Every glow is derived from one of these behaviors.

export type LightBehaviorName =
  | 'resting'        // ambient warmth — the palace at peace
  | 'guiding'        // directional — attention has a destination
  | 'investigative'  // precise — every detail matters
  | 'judgment'       // decisive — final, sharp, certain
  | 'celebration'    // radiant — the empire acknowledges completion
  | 'legacy';        // settled — history has accumulated warmth

export interface LightBehavior {
  description:    string;
  primarySource:  keyof typeof ILLUMINATION['atmosphere'];  // where gold originates
  glowIntensity:  keyof typeof ILLUMINATION['glow'];        // base intensity
  gridOpacity:  { from: number; to: number };               // ambient grid animation
  depthOpacity: { from: number; to: number };               // depth glow animation
  temperature:  'warm' | 'cool' | 'sharp' | 'ancient';     // qualitative character
  cssAtmVar:      string;                                   // --azma-atm-light value
}

export const LIGHT_BEHAVIORS: Record<LightBehaviorName, LightBehavior> = {
  resting: {
    description:   'The palace at peace. Gold settles at the floor. Warmth exists but makes no demands.',
    primarySource: 'floor',
    glowIntensity: 'ambient',
    gridOpacity:   { from: 0.38, to: 0.56 },
    depthOpacity:  { from: 0.32, to: 0.50 },
    temperature:   'warm',
    cssAtmVar:     'resting',
  },
  guiding: {
    description:   'Gold concentrates along a path. The eye knows where to go.',
    primarySource: 'edge',
    glowIntensity: 'soft',
    gridOpacity:   { from: 0.32, to: 0.50 },
    depthOpacity:  { from: 0.28, to: 0.44 },
    temperature:   'warm',
    cssAtmVar:     'guiding',
  },
  investigative: {
    description:   'Light becomes precise. Shadows deepen. Every detail revealed.',
    primarySource: 'center',
    glowIntensity: 'medium',
    gridOpacity:   { from: 0.55, to: 0.78 },
    depthOpacity:  { from: 0.42, to: 0.68 },
    temperature:   'cool',
    cssAtmVar:     'investigative',
  },
  judgment: {
    description:   'Light descends from above. Decisive. Final. The verdict falls.',
    primarySource: 'ceiling',
    glowIntensity: 'bright',
    gridOpacity:   { from: 0.60, to: 0.82 },
    depthOpacity:  { from: 0.48, to: 0.75 },
    temperature:   'sharp',
    cssAtmVar:     'judgment',
  },
  celebration: {
    description:   'Gold radiates in all directions. The empire acknowledges what was accomplished.',
    primarySource: 'center',
    glowIntensity: 'radiant',
    gridOpacity:   { from: 0.65, to: 0.88 },
    depthOpacity:  { from: 0.55, to: 0.80 },
    temperature:   'warm',
    cssAtmVar:     'celebration',
  },
  legacy: {
    description:   'Gold has settled into the walls. History radiates from beneath the surface.',
    primarySource: 'floor',
    glowIntensity: 'soft',
    gridOpacity:   { from: 0.44, to: 0.64 },
    depthOpacity:  { from: 0.40, to: 0.62 },
    temperature:   'ancient',
    cssAtmVar:     'legacy',
  },
} as const;

// ── Article III — Every Element Has a Visual Role ─────────────────────────
// Every interactive or visible element belongs to one constitutional role.
// The role determines everything: brightness, hierarchy, interaction, motion.
// Not by manual CSS — by constitutional assignment.

export type VisualRole =
  | 'sovereign'   // maximum authority — the palace itself speaks
  | 'primary'     // the element the citizen is meant to engage
  | 'secondary'   // supporting — present but not dominant
  | 'advisory'    // guidance without demand
  | 'passive'     // context — background, structural
  | 'silent'      // architecture only — not content
  | 'forbidden';  // sealed — the citizen may not proceed

export interface RoleBehavior {
  description:    string;
  brightness:     string;    // CSS filter brightness()
  zIndex:         number;    // from ELEVATION.zIndex
  glowIntensity:  keyof typeof ILLUMINATION['glow'] | 'none';
  interaction:   'none' | 'brightening' | 'dimming' | 'neutral';
  motionCharacter:'still' | 'immovable' | 'deliberate' | 'swift' | 'breath' | 'geological' | 'none';
  emphasis:       'absolute' | 'high' | 'medium' | 'low' | 'minimal' | 'none' | 'locked';
  pointerEvents:  'auto' | 'none';
  cssClass:       string;
}

export const VISUAL_ROLES: Record<VisualRole, RoleBehavior> = {
  sovereign: {
    description:    'Maximum authority. Commands attention without asking. Does not animate — stillness IS the authority.',
    brightness:     ELEVATION.depth.sovereign,
    zIndex:         ELEVATION.zIndex.sovereign,
    glowIntensity:  'sacred',
    interaction:    'none',
    motionCharacter:'still',
    emphasis:       'absolute',
    pointerEvents:  'auto',
    cssClass:       'role-sovereign',
  },
  primary: {
    description:    'The primary actor. The element the citizen came here to engage.',
    brightness:     ELEVATION.depth.radiant,
    zIndex:         ELEVATION.zIndex.raised,
    glowIntensity:  'medium',
    interaction:    'brightening',
    motionCharacter:'deliberate',
    emphasis:       'high',
    pointerEvents:  'auto',
    cssClass:       'role-primary',
  },
  secondary: {
    description:    'Supporting presence. Available, but not demanding.',
    brightness:     ELEVATION.depth.flush,
    zIndex:         ELEVATION.zIndex.surface,
    glowIntensity:  'soft',
    interaction:    'brightening',
    motionCharacter:'swift',
    emphasis:       'medium',
    pointerEvents:  'auto',
    cssClass:       'role-secondary',
  },
  advisory: {
    description:    'Offers information without demanding action. Guidance in the margins.',
    brightness:     ELEVATION.depth.recessed,
    zIndex:         ELEVATION.zIndex.surface,
    glowIntensity:  'ambient',
    interaction:    'neutral',
    motionCharacter:'breath',
    emphasis:       'low',
    pointerEvents:  'auto',
    cssClass:       'role-advisory',
  },
  passive: {
    description:    'Background presence. Context without content. The citizen does not interact here.',
    brightness:     ELEVATION.depth.embedded,
    zIndex:         ELEVATION.zIndex.floor,
    glowIntensity:  'whisper',
    interaction:    'none',
    motionCharacter:'geological',
    emphasis:       'minimal',
    pointerEvents:  'none',
    cssClass:       'role-passive',
  },
  silent: {
    description:    'Architecture. The wall itself. Exists as structure, not as content.',
    brightness:     ELEVATION.depth.buried,
    zIndex:         ELEVATION.zIndex.floor,
    glowIntensity:  'none',
    interaction:    'none',
    motionCharacter:'immovable',
    emphasis:       'none',
    pointerEvents:  'none',
    cssClass:       'role-silent',
  },
  forbidden: {
    description:    'Sealed. The citizen knows they cannot proceed. No cursor. No hover. Just the sealed stone.',
    brightness:     'brightness(0.35)',
    zIndex:         ELEVATION.zIndex.raised,
    glowIntensity:  'none',
    interaction:    'dimming',
    motionCharacter:'none',
    emphasis:       'locked',
    pointerEvents:  'none',
    cssClass:       'role-forbidden',
  },
} as const;

// ── Articles IV + V — Emotional Atmospheres + Semantic Visual Grammar ──────
// A chamber selects an atmosphere. The engine changes everything else.
// Atmosphere is not decoration — it is information about what is happening.
// The visual properties are MEANINGS, not aesthetics.
//
// SEMANTIC GRAMMAR — what each property means:
//   brightness < 0.85 → receding, historical, inaccessible
//   brightness = 1.00 → present, at the primary surface
//   brightness > 1.10 → elevated, closer to gold light
//   brightness > 1.30 → sovereign, maximum presence
//
//   opacity < 0.50    → ghost, ancient memory, disabled
//   opacity 0.50–0.75 → advisory, secondary content
//   opacity > 0.90    → full presence, primary content
//
//   glow radius 0      → sealed, embedded, dormant
//   glow radius < 15   → ambient warmth, passive
//   glow radius < 35   → active, approached
//   glow radius ≥ 35   → ceremony, sovereign, masterpiece

export type AtmosphereName =
  | 'calm'          // peace — nothing demands, everything settles
  | 'curious'       // exploration — attention reaches outward
  | 'investigating' // analysis — the court assembles, every detail
  | 'deliberating'  // decision — silence before judgment
  | 'creating'      // making — the citizen builds, palace participates
  | 'victorious'    // completion — the empire acknowledges
  | 'reflective';   // after — the palace holds memory

export interface AtmosphericProfile {
  description:     string;
  lightBehavior:   LightBehaviorName;
  ambientFilter:   string;       // filter applied to the depth layer
  breathingPace:  'slow' | 'normal' | 'quickened' | 'tense';  // qualitative
  dominantMaterial: MaterialName;
  semanticMeaning: string;       // what this atmosphere communicates to the citizen
  dataAttr:        AtmosphereName;
  cssVars: {
    gridFrom:  number;
    gridTo:    number;
    depthFrom: number;
    depthTo:   number;
    glowFloor: number;   // rgba opacity of floor atmospheric glow
  };
}

export const ATMOSPHERES: Record<AtmosphereName, AtmosphericProfile> = {
  calm: {
    description:      'The palace at peace. Nothing demands. Everything has settled.',
    lightBehavior:    'resting',
    ambientFilter:    ELEVATION.depth.embedded,
    breathingPace:    'slow',
    dominantMaterial: 'obsidian',
    semanticMeaning:  'Nothing urgent. The citizen may move without pressure.',
    dataAttr:         'calm',
    cssVars:          { gridFrom: 0.35, gridTo: 0.50, depthFrom: 0.28, depthTo: 0.45, glowFloor: 0.03 },
  },
  curious: {
    description:      'Exploration begins. Light leans toward possibility.',
    lightBehavior:    'guiding',
    ambientFilter:    ELEVATION.depth.flush,
    breathingPace:    'normal',
    dominantMaterial: 'glass',
    semanticMeaning:  'The citizen is oriented. There is a path. Follow the light.',
    dataAttr:         'curious',
    cssVars:          { gridFrom: 0.40, gridTo: 0.58, depthFrom: 0.32, depthTo: 0.50, glowFloor: 0.04 },
  },
  investigating: {
    description:      'The court assembles. Every detail is subject to scrutiny.',
    lightBehavior:    'investigative',
    ambientFilter:    ELEVATION.depth.elevated,
    breathingPace:    'normal',
    dominantMaterial: 'marble',
    semanticMeaning:  'Precision is required. The palace holds the citizen accountable to truth.',
    dataAttr:         'investigating',
    cssVars:          { gridFrom: 0.55, gridTo: 0.78, depthFrom: 0.42, depthTo: 0.68, glowFloor: 0.06 },
  },
  deliberating: {
    description:      'The moment before judgment. Silence before the verdict falls.',
    lightBehavior:    'judgment',
    ambientFilter:    ELEVATION.depth.radiant,
    breathingPace:    'tense',
    dominantMaterial: 'brushedMetal',
    semanticMeaning:  'Weight. Consequence. This moment matters.',
    dataAttr:         'deliberating',
    cssVars:          { gridFrom: 0.60, gridTo: 0.82, depthFrom: 0.48, depthTo: 0.75, glowFloor: 0.08 },
  },
  creating: {
    description:      'The citizen makes something. The palace participates in the act of creation.',
    lightBehavior:    'guiding',
    ambientFilter:    ELEVATION.depth.elevated,
    breathingPace:    'quickened',
    dominantMaterial: 'gold',
    semanticMeaning:  'Agency. The citizen is the author. The palace provides the materials.',
    dataAttr:         'creating',
    cssVars:          { gridFrom: 0.45, gridTo: 0.65, depthFrom: 0.38, depthTo: 0.60, glowFloor: 0.05 },
  },
  victorious: {
    description:      'Completion. The empire acknowledges what the citizen has accomplished.',
    lightBehavior:    'celebration',
    ambientFilter:    ELEVATION.depth.sovereign,
    breathingPace:    'quickened',
    dominantMaterial: 'gold',
    semanticMeaning:  'This is done. It is permanent. The palace holds it forever.',
    dataAttr:         'victorious',
    cssVars:          { gridFrom: 0.65, gridTo: 0.88, depthFrom: 0.55, depthTo: 0.80, glowFloor: 0.10 },
  },
  reflective: {
    description:      'After action. The palace is warm with what just happened.',
    lightBehavior:    'legacy',
    ambientFilter:    ELEVATION.depth.flush,
    breathingPace:    'slow',
    dominantMaterial: 'stone',
    semanticMeaning:  'Rest is earned. What was done is now part of the palace.',
    dataAttr:         'reflective',
    cssVars:          { gridFrom: 0.42, gridTo: 0.62, depthFrom: 0.38, depthTo: 0.58, glowFloor: 0.05 },
  },
} as const;

// ── Article V — Semantic Visual Grammar (Codified) ────────────────────────
// Every visual decision must answer "What does this mean?" — not "How does it look?"
// This table is the constitutional decoder ring.
// When observing any AZMA element, use this grammar to understand it.

export const VISUAL_GRAMMAR = {
  brightness: {
    below0_55:  'Buried. Ancient history. Sealed or deeply inaccessible.',
    at0_62:     'Embedded. Part of the architecture — not content.',
    at0_78:     'Recessed. Secondary. Supporting the primary.',
    at1_00:     'Flush. Present. At the primary surface.',
    at1_14:     'Elevated. Active. Gold light falls here directly.',
    at1_28:     'Radiant. Emphasized. Selected or sovereign in context.',
    above1_35:  'Sovereign. Maximum presence. The gold pours here.',
  },
  opacity: {
    below0_35:  'Ghost. Disabled or ancient memory.',
    at0_55:     'Advisory. Passive or structural presence.',
    at0_75:     'Muted. Secondary content without demand.',
    at1_00:     'Full presence. Primary content or active state.',
  },
  glowRadius: {
    none:       'Sealed, dormant, or embedded in obsidian.',
    under10px:  'Ambient warmth. Passive or advisory presence.',
    under25px:  'Active. The citizen approaches or has selected.',
    under50px:  'Sovereign or celebratory. High emphasis.',
    over50px:   'Sacred. Ceremony. The maximum the empire expresses.',
  },
  motion: {
    still:      'Authority or immovable history. Power needs no movement.',
    slowed:     'Weight and contemplation. Legacy. The heaviness of time.',
    normal:     'Present and responsive. Standard engagement.',
    quickened:  'Active process. Creation. The palace is working.',
    irregular:  'Tension. Unresolved doubt. The system is uncertain.',
    geological: 'The slowest possible change. Ambient, background, ancient.',
  },
  depth: {
    buried:     'Archival. Sealed. Ancient. Does not participate.',
    recessed:   'Secondary. The wall behind the primary surface.',
    flush:      'The primary surface. Where the citizen stands.',
    elevated:   'Closer to gold. Active. Selected. Engaged.',
    sovereign:  'Sovereign level. The gold falls directly here.',
  },
  spacing: {
    jewel:      'Mechanical precision. Dots, jewels, small markers.',
    compact:    'Within a single component. Related elements.',
    comfortable:'Standard. The breathing room between thoughts.',
    generous:   'Major sections. Sovereign-level breathing room.',
    imperial:   'Full-screen moment. The palace opens fully.',
  },
} as const;

// ── Article VI — Future-Proof Extension Utilities ─────────────────────────
// These utilities make the engine self-demonstrating.
// A new chamber author reads the code — not documentation — to understand the system.

/**
 * Sets the atmosphere on a chamber element via data-attribute.
 * Call this inside useEffect or a browser-only context.
 *
 * Example:
 *   useEffect(() => setAtmosphere(ref.current, 'investigating'), [phase]);
 */
export function setAtmosphere(element: HTMLElement | null, atmosphere: AtmosphereName): void {
  if (!element) return;
  element.setAttribute('data-atmosphere', atmosphere);
}

/**
 * Removes the atmosphere attribute, returning the chamber to its default state.
 */
export function clearAtmosphere(element: HTMLElement | null): void {
  if (!element) return;
  element.removeAttribute('data-atmosphere');
}

/**
 * Applies a material + behavioral state to an element via data-attributes.
 * The CSS (azma-behaviors.css) handles all visual translation automatically.
 *
 * Example:
 *   setMaterialState(buttonRef.current, 'gold', 'working');
 */
export function setMaterialState(
  element: HTMLElement | null,
  material: MaterialName,
  state:    MaterialState,
): void {
  if (!element) return;
  element.setAttribute('data-material', material);
  element.setAttribute('data-state',    state);
}

/**
 * Returns the CSS class string for a visual role.
 * Apply to any element to assign it constitutional visual authority.
 *
 * Example:
 *   <button className={roleClass('primary')}>…</button>
 */
export function roleClass(role: VisualRole): string {
  return VISUAL_ROLES[role].cssClass;
}

/**
 * Returns all atmosphere CSS variable declarations for a given atmosphere.
 * Useful for server-side rendering or inline style injection.
 */
export function atmosphereCssVars(atmosphere: AtmosphereName): Record<string, string> {
  const { cssVars } = ATMOSPHERES[atmosphere];
  return {
    '--azma-atm-grid-from':  String(cssVars.gridFrom),
    '--azma-atm-grid-to':    String(cssVars.gridTo),
    '--azma-atm-depth-from': String(cssVars.depthFrom),
    '--azma-atm-depth-to':   String(cssVars.depthTo),
    '--azma-atm-glow-floor': String(cssVars.glowFloor),
  };
}

/**
 * Returns a material's behavior profile for a given state.
 * Use to understand what the CSS will express before applying data-attributes.
 *
 * Example:
 *   const profile = getMaterialBehavior('gold', 'celebrating');
 *   // → { brightness: 1.45, glowOpacity: 0.65, ... }
 */
export function getMaterialBehavior(
  material: MaterialName,
  state:    MaterialState,
): MaterialBehavior {
  return MATERIAL_BEHAVIORS[material][state];
}
