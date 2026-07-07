/**
 * AZMA OS — Visual Identity Engine
 * Constitutional Architecture V1.0
 *
 * This file is the single source of truth for the entire empire.
 * Every chamber, every surface, every animation, every glyph derives
 * from these laws. No chamber may contradict these constants.
 * Chambers may extend — they may never override the constitutional values.
 *
 * Read before modifying:
 *   — Additions require Chief Architect sign-off
 *   — Removals require constitutional justification
 *   — No chamber-specific values belong here
 */

// ── Imperial Materials ─────────────────────────────────────────────────────
// Each material carries inherent behavioral properties.
// Obsidian repels light. Gold attracts it. Marble diffuses it.
// Glass transmits it. Stone absorbs it. Metal reflects it.
// These properties define HOW elements in each material behave,
// not how they look — the look is derived from the behavior.

export const MATERIALS = {
  obsidian: {
    description:   'Primary surface — absorbs all light, reflects nothing',
    lightBehavior: 'absorb',
    weight:        'absolute',
    surface:       'matte',
    brightness:    1.00,
  },
  marble: {
    description:   'Architectural surface — diffuses light in deep waves',
    lightBehavior: 'diffuse',
    weight:        'heavy',
    surface:       'smooth',
    brightness:    1.08,
  },
  brushedMetal: {
    description:   'Mechanical surface — directional light reflection',
    lightBehavior: 'reflect-directional',
    weight:        'medium',
    surface:       'textured',
    brightness:    1.14,
  },
  gold: {
    description:   'Imperial accent — the sole source of warmth in the empire',
    lightBehavior: 'emit',
    weight:        'precious',
    surface:       'polished',
    brightness:    1.35,
  },
  glass: {
    description:   'Dimensional surface — transmits and layers depth',
    lightBehavior: 'transmit',
    weight:        'light',
    surface:       'transparent',
    brightness:    1.20,
  },
  stone: {
    description:   'Ancient surface — absorbs history, darkens with time',
    lightBehavior: 'absorb-partial',
    weight:        'immovable',
    surface:       'rough',
    brightness:    0.85,
  },
} as const;

export type MaterialName = keyof typeof MATERIALS;

// ── Imperial Palette ───────────────────────────────────────────────────────
// The empire lives in near-total darkness.
// Gold is the only warmth. Everything else is obsidian shadow.

export const PALETTE = {
  // ── Void & Obsidian ──────────────────────────────────────────────
  void:         '#000000',   // absolute darkness — used only in deepest shadows
  obsidian:     '#020101',   // primary background — the palace floor and walls
  deep:         '#050302',   // deepest atmospheric layer — beneath the floor
  surface:      '#080602',   // elevated surface — panels, overlays
  surfaceHigh:  '#0D0A03',   // highest surface — modals, detail panels, ceremony

  // ── Imperial Gold Scale ───────────────────────────────────────────
  // 8 calibrated steps from near-void warmth to near-light radiance.
  // Step 6 is the constitutional "true imperial gold."
  gold: {
    1: '#3A2400',   // darkest — borders in shadow, deep recesses
    2: '#5C3A06',   // dark — borders, inactive architectural elements
    3: '#8B6508',   // mid-dark — secondary borders, ancient stone detail
    4: '#B8903A',   // mid — muted accents, worn gold, aged tone
    5: '#C9A84C',   // mid-bright — active secondary borders, accents
    6: '#D4AF37',   // TRUE IMPERIAL GOLD — primary accent, glow source
    7: '#E8C547',   // bright — highlights, hover emphasis
    8: '#F5D978',   // lightest — sacred declarations, supreme emphasis
    rgb: '212, 175, 55',   // gold-6 in RGB — for rgba() construction
  },

  // ── Text Hierarchy ────────────────────────────────────────────────
  // Text is never white. All text lives in the gold register.
  // The hierarchy expresses MEANING, not decoration.
  text: {
    sacred:   '#FFF2A8',   // highest — titles, sovereign declarations
    primary:  '#E8D595',   // primary — body, interactive labels
    muted:    '#A8955B',   // secondary — descriptions, secondary labels
    dim:      '#6B5A30',   // tertiary — metadata, timestamps, inactive
    ghost:    '#3D2E12',   // lowest — disabled states, empty whispers
  },

  // ── Semantic Colors ───────────────────────────────────────────────
  // Colors that carry meaning. Used only in the context named.
  // Semantic colors may appear in chamber-specific contexts.
  semantic: {
    certainty:  '#4A9B6A',   // settled verdicts, confirmed truth — emerald
    doubt:      '#7A5C1A',   // uncertainty, contested evidence — amber shadow
    conflict:   '#8B2525',   // tension, contradiction, opposition — deep crimson
    silence:    '#1A1410',   // rest, contemplation, the imperial pause — near-void
  },
} as const;

// ── Gold Illumination System ───────────────────────────────────────────────
// Gold is the only light source in the empire.
// Every glow, every beam, every warmth originates from gold.
// Nothing glows in any other color.
// Light does not decorate — it reveals.

export const ILLUMINATION = {
  // ── Glow Scale ────────────────────────────────────────────────────
  // Measured in opacity of pure imperial gold.
  // Use these as the final argument in rgba(212,175,55,N).
  glow: {
    whisper:  0.04,   // barely perceptible — ambient presence in empty rooms
    dim:      0.08,   // background warmth — always present, never noticed
    ambient:  0.12,   // atmospheric warmth — felt rather than seen
    soft:     0.18,   // interactive warmth — default hover state
    medium:   0.28,   // clear presence — selected states, active borders
    bright:   0.40,   // strong emphasis — primary active states
    radiant:  0.60,   // maximum emphasis — masterpiece moments, ceremony
    sacred:   0.85,   // reserved — sovereign revelation, ceremony completion
  },

  // ── Atmospheric Layers ─────────────────────────────────────────────
  // Gold light settles in space according to architectural grammar.
  // These are template strings — replace OPACITY with a glow scale value.
  atmosphere: {
    floor:   'radial-gradient(ellipse 90% 55% at 50% 105%, rgba(212,175,55,OPACITY), transparent 65%)',
    ceiling: 'radial-gradient(ellipse 70% 40% at 50%  -5%, rgba(212,175,55,OPACITY), transparent 65%)',
    corner:  'radial-gradient(ellipse 40% 40% at 15%  20%, rgba(212,175,55,OPACITY), transparent 65%)',
    center:  'radial-gradient(ellipse 60% 60% at 50%  50%, rgba(212,175,55,OPACITY), transparent 70%)',
    edge:    'radial-gradient(ellipse 30% 80% at 0%   50%, rgba(212,175,55,OPACITY), transparent 60%)',
  },

  // ── Beam Specification ─────────────────────────────────────────────
  // Focused light ray for chamber halls and corridors.
  beam: {
    width: '1px',
    opacity: {
      rest:     0.08,
      active:   0.14,
      ceremony: 0.22,
    },
  },
} as const;

// ── Elevation System ───────────────────────────────────────────────────────
// In the empire, depth is expressed through atmosphere — not box-shadows.
// Higher elevation = closer to the gold light source above.
// Lower elevation = deeper into the obsidian below.
// The citizen senses elevation through light, not through floating cards.

export const ELEVATION = {
  // ── Z-Index Constitutional Scale ──────────────────────────────────
  // Every layer has a name. No magic numbers.
  zIndex: {
    floor:     0,      // atmospheric background — behind everything
    surface:   1,      // primary content surface
    raised:    10,     // interactive elements (portals, treasury records)
    overlay:   100,    // vault interiors, detail panels
    gate:      200,    // authentication screens
    ceremony:  500,    // deposit ceremonies, confirmations
    sovereign: 1000,   // highest — sovereign declarations, critical overlays
  },

  // ── Atmospheric Depth ──────────────────────────────────────────────
  // How much closer to the gold light an element appears.
  // Applied via filter: brightness() on the element or its container.
  depth: {
    buried:    'brightness(0.45)',   // deep in the obsidian — archive, recessed
    embedded:  'brightness(0.62)',   // embedded in the palace walls
    recessed:  'brightness(0.78)',   // below the primary surface
    flush:     'brightness(1.00)',   // at the primary surface — default
    elevated:  'brightness(1.14)',   // slightly above — active, interactive
    radiant:   'brightness(1.28)',   // clearly elevated — selected, emphasized
    sovereign: 'brightness(1.45)',   // maximum — ceremony, revelation
  },
} as const;

// ── Shadow System ──────────────────────────────────────────────────────────
// Shadows in the empire are gold-tinted darkness.
// A shadow is obsidian blocking gold light.
// Pure black shadows do not exist — there is always residual gold warmth.

export const SHADOWS = {
  none:         'none',
  inset:        'inset 0 1px 0 rgba(212,175,55,0.06)',     // subtle top edge
  soft:         '0  2px  8px rgba(2,1,0,0.60)',            // gentle presence
  medium:       '0  4px 20px rgba(2,1,0,0.80)',            // clear separation
  heavy:        '0  8px 40px rgba(2,1,0,0.90)',            // massive elements
  sovereign:    '0 16px 60px rgba(2,1,0,0.95)',            // throne-weight
  glowWhisper:  '0  0   6px rgba(212,175,55,0.08)',        // ILLUMINATION.glow.whisper
  glowSoft:     '0  0  12px rgba(212,175,55,0.18)',        // ILLUMINATION.glow.soft
  glowMedium:   '0  0  24px rgba(212,175,55,0.28)',        // ILLUMINATION.glow.medium
  glowBright:   '0  0  36px rgba(212,175,55,0.40)',        // ILLUMINATION.glow.bright
  glowRadiant:  '0  0  60px rgba(212,175,55,0.60)',        // ILLUMINATION.glow.radiant
} as const;

// ── Surface Behavior ───────────────────────────────────────────────────────
// How surfaces respond to the citizen's presence.
// Nothing in the palace responds instantly to the human scale.
// The palace responds to weight, not to speed.

export const SURFACES = {
  // ── Response Timing ────────────────────────────────────────────────
  timing: {
    instant:       '80ms',      // mechanical confirmation (key press, gem fill)
    swift:         '180ms',     // quick UI feedback (button active)
    deliberate:    '280ms',     // standard interaction (hover, focus)
    architectural: '400ms',     // structural changes (panels opening)
    ceremonial:    '600ms',     // significant state changes (vault reveals)
    imperial:      '950ms',     // vault doors, sovereign transitions
    atmospheric:   '2400ms',    // ambient atmospheric shifts
    geological:    '5000ms',    // legacy, memory, long accumulation
  },

  // ── Easing Functions ───────────────────────────────────────────────
  // All movements carry the weight of stone and gold.
  // Nothing accelerates without reason. Nothing stops abruptly.
  easing: {
    instant:       'linear',
    swift:         'ease-out',
    deliberate:    'cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // weighted ease-out
    architectural: 'cubic-bezier(0.23, 1, 0.32, 1.0)',      // expo-out — door opening
    heavy:         'cubic-bezier(0.78, 0, 0.96, 0.30)',     // vault closing — falls with gravity
    breath:        'ease-in-out',                            // ambient — no direction preference
    marble:        'cubic-bezier(0.45, 0, 0.55, 1)',        // symmetric weight
  },

  // ── Hover Philosophy ────────────────────────────────────────────────
  // In the palace, surfaces do not "lift" or "raise" on hover.
  // They illuminate — gold light falls more directly on what is approached.
  hover: {
    brightening: 'brightness(1.10)',   // approaching gold light
    dimming:     'brightness(0.88)',   // retreating from gold light
    neutral:     'brightness(1.00)',   // unchanged — current position
  },
} as const;

// ── Typography Hierarchy ───────────────────────────────────────────────────
// The imperial script is Arabic (RTL) by constitutional decree.
// Latin text appears in chamber-specific technical contexts only.
// Scale is proportional — each step is a deliberate musical interval.
// Weight is gravitational — heavier text carries more meaning.
// Silence between letters (tracking) is earned by importance.

export const TYPOGRAPHY = {
  // ── Font Stack ─────────────────────────────────────────────────────
  family: "system-ui, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",

  // ── Type Scale ─────────────────────────────────────────────────────
  // Base: 16px (1rem). Scale is non-linear — large steps between levels.
  scale: {
    nano:     '0.625rem',    //  10px — watermarks, legal fine print
    micro:    '0.6875rem',   //  11px — timestamps, ghost labels
    tiny:     '0.75rem',     //  12px — secondary metadata, chips, badges
    small:    '0.8125rem',   //  13px — companion messages, descriptions
    body:     '0.875rem',    //  14px — primary body text, lists
    base:     '1rem',        //  16px — interactive labels, buttons
    medium:   '1.125rem',    //  18px — section headings
    large:    '1.25rem',     //  20px — major section headings
    grand:    '1.5rem',      //  24px — chamber titles, vault names
    imperial: '2rem',        //  32px — sovereign declarations
    throne:   '2.5rem',      //  40px — the palace name, the emperor
  },

  // ── Weight ─────────────────────────────────────────────────────────
  weight: {
    ghost:    300,    // fading text, whispered content
    regular:  400,    // standard reading weight
    medium:   500,    // gentle emphasis
    bold:     600,    // headings, labels, interactive
    heavy:    700,    // titles, declarations
    imperial: 900,    // supreme — used with extreme restraint
  },

  // ── Letter Spacing ─────────────────────────────────────────────────
  // Arabic text has different tracking conventions than Latin.
  // These values are calibrated for the AZMA imperial Arabic typography.
  tracking: {
    compressed: '-0.01em',   // tight, packed — body text in dense layouts
    normal:      '0em',      // default — body text
    open:        '0.04em',   // metadata, secondary labels
    wide:        '0.08em',   // imperial headings
    sovereign:   '0.12em',   // supreme declarations, the throne
    sacred:      '0.20em',   // sacred titles — used alone
  },

  // ── Line Height ────────────────────────────────────────────────────
  leading: {
    tight:   1.2,    // headings, single-line declarations
    body:    1.5,    // standard reading
    relaxed: 1.7,    // long passages, companion messages
    sacred:  2.0,    // supreme declarations — maximum breathing room
  },
} as const;

// ── Spatial Rhythm ─────────────────────────────────────────────────────────
// Space is architecture. Emptiness is not absence — it is weight.
// Every gap between elements carries gravitational meaning.
// The empire does not crowd. It breathes.

export const SPACING = {
  // ── Base Scale ─────────────────────────────────────────────────────
  // Base unit: 4px. All spacing is a multiple.
  px0:   '0px',
  px1:   '4px',
  px2:   '8px',
  px3:   '12px',
  px4:   '16px',
  px5:   '20px',
  px6:   '24px',
  px7:   '28px',
  px8:   '32px',
  px10:  '40px',
  px12:  '48px',
  px16:  '64px',
  px20:  '80px',
  px24:  '96px',
  px32:  '128px',

  // ── Named Gaps ─────────────────────────────────────────────────────
  gap: {
    jewel:       '4px',    // between jewels, dots, small markers
    compact:     '8px',    // within a single component
    base:        '12px',   // standard spacing between related elements
    comfortable: '16px',   // panel padding, section-to-section
    generous:    '24px',   // between major sections
    grand:       '40px',   // sovereign-level sections
    imperial:    '64px',   // full-screen sovereign moments
  },

  // ── Border Radius ──────────────────────────────────────────────────
  // The palace has no sharp consumer corners and no pill shapes.
  // Architecture uses none or slight radius only.
  radius: {
    none:   '0px',    // gold borders, cards, panels — architectural precision
    slight: '2px',    // most architectural elements — barely softened
    panel:  '4px',    // panels, overlays — perceptible but dignified
    circle: '50%',    // jewels, orbs, living dots — natural curvature only
  },
} as const;

// ── Motion System ──────────────────────────────────────────────────────────
// The palace is alive — but it has never hurried.
// Animations serve atmosphere and meaning. Never entertainment.
// The citizen should not notice animations — only feel their absence if removed.

export const MOTION = {
  // ── Ambient Breathing Periods ──────────────────────────────────────
  // The palace breathes as one organism.
  // All ambient animations derive from these periods.
  // The primary and secondary periods are incommensurable (80:90 = 8:9)
  // — they never fully sync, creating infinite living variation.
  ambient: {
    primary:   '80s',    // main atmospheric cycle — palace-grid, palace-depth
    secondary: '90s',    // offset companion — never fully syncs with primary
    accent:     '8s',    // interactive details — orbs, seals, gate elements
    fine:       '5s',    // fine details — living dots, jewels
    echo:       '4.5s',  // echo and kinship elements
  },

  // ── Constitutional Principles ──────────────────────────────────────
  // These are laws, not suggestions. No exception without justification.
  principles: {
    neverFlash:     'No element may flash at a rate exceeding 3Hz',
    neverSpin:      'Continuous rotation only with architectural purpose',
    neverJump:      'All transitions carry momentum — no linear except instant',
    neverRandom:    'Variation is living, not random — seeded by citizen context',
    alwaysSettle:   'Every animation ends in a defined resting state',
    weightMatters:  'Heavier architectural elements move slower and arrive later',
    silenceIsLuxury:'Stillness is the highest expression. The palace may pause.',
  },

  // ── Reduced Motion Protocol ────────────────────────────────────────
  // The palace respects the citizen's body above all else.
  // prefers-reduced-motion: reduce — imperial law.
  reducedMotion: {
    pauseAllAmbient:     true,   // all background breathing stops
    pauseDecorativeAnim: true,   // all non-functional animations stop
    keepOpacityFades:    true,   // gentle opacity transitions remain
    keepStructuralTiming: false, // structural transitions become instant
  },
} as const;

// ── Accessibility Constitution ─────────────────────────────────────────────
// The empire serves all citizens without exception.
// Visual identity is maintained through gold.
// Legibility is maintained through contrast.
// These are constitutional minimums. Exceeding them is encouraged.
// Falling below them is prohibited.

export const ACCESSIBILITY = {
  // ── Contrast Ratios (WCAG 2.1) ────────────────────────────────────
  contrast: {
    aa:       4.5,   // minimum for normal text
    aaLarge:  3.0,   // minimum for large text (18px+ or 14px+ bold)
    aaa:      7.0,   // enhanced — sovereign declarations, sacred text
    ui:       3.0,   // minimum for UI components and icons
  },

  // ── Focus Indication ──────────────────────────────────────────────
  // The citizen must always know where they stand.
  // Focus rings are gold — matching the imperial palette.
  focus: {
    ring:        '2px solid rgba(212,175,55,0.70)',
    ringOffset:  '2px',
    style:       'outline',
  },

  // ── Minimum Touch Targets ──────────────────────────────────────────
  // Physical interaction deserves physical dignity.
  touch: {
    minimum:   '44px',    // WCAG 2.5.5 AA
    preferred: '48px',    // constitutional preference
  },

  // ── Text Legibility Minimums ───────────────────────────────────────
  text: {
    minimumBodySize:   '14px',   // 0.875rem
    minimumMetaSize:   '11px',   // 0.6875rem
    maximumLineLength: '75ch',   // no wider — reading comfort
  },
} as const;

// ── Extension Mechanism ────────────────────────────────────────────────────
// How chambers inherit and extend the Visual Identity Engine.
//
// THE LAW:
//   — Every chamber viewport MUST carry the class `azma-chamber`
//   — Every chamber MAY override only the listed extension points
//   — Every chamber MUST NOT redefine the immutable properties
//   — Every chamber MUST import azma-identity.css before its own CSS
//
// PATTERN:
//   In chamber CSS:
//     .hujjah-viewport {
//       --azma-accent:       180, 40, 40;    (RGB triplet — no #)
//       --azma-accent-color: #B42828;
//       --azma-surface:      rgba(8,2,2,0.96);
//     }

export const EXTENSION = {
  // ── Required Class ─────────────────────────────────────────────────
  // Every chamber viewport must carry this class.
  chamberClass: 'azma-chamber',

  // ── Permitted Chamber Overrides ────────────────────────────────────
  // ONLY these CSS custom properties may be overridden per chamber.
  overridable: [
    '--azma-accent',           // chamber accent (RGB triplet for rgba use)
    '--azma-accent-color',     // chamber accent as hex (for direct use)
    '--azma-surface',          // chamber base surface color
    '--azma-surface-high',     // chamber elevated surface color
    '--azma-depth-glow',       // chamber-specific atmospheric glow
  ] as const,

  // ── Immutable Properties ────────────────────────────────────────────
  // These may NEVER be overridden. They define imperial identity.
  immutable: [
    '--azma-void',
    '--azma-obsidian',
    '--azma-deep',
    '--azma-gold-1',
    '--azma-gold-2',
    '--azma-gold-3',
    '--azma-gold-4',
    '--azma-gold-5',
    '--azma-gold-6',
    '--azma-gold-7',
    '--azma-gold-8',
    '--azma-gold-rgb',
    '--azma-text-sacred',
    '--azma-text-primary',
    '--azma-breath',
    '--azma-breath-alt',
  ] as const,
} as const;

// ── Utility Functions ──────────────────────────────────────────────────────
// Code-time helpers for generating values from the constitutional tokens.
// Use these in TSX and TS files instead of hardcoding values.

/**
 * Constructs a gold rgba() string from a named glow intensity.
 * Example: goldGlow('soft') → 'rgba(212,175,55,0.18)'
 */
export function goldGlow(intensity: keyof typeof ILLUMINATION['glow']): string {
  return `rgba(${PALETTE.gold.rgb},${ILLUMINATION.glow[intensity]})`;
}

/**
 * Constructs a gold rgba() string from a numeric opacity (0–1).
 * Example: goldAt(0.35) → 'rgba(212,175,55,0.35)'
 */
export function goldAt(opacity: number): string {
  return `rgba(${PALETTE.gold.rgb},${opacity})`;
}

/**
 * Returns the CSS box-shadow value for a named shadow token.
 * Example: shadow('glowSoft') → '0 0 12px rgba(212,175,55,0.18)'
 */
export function shadow(name: keyof typeof SHADOWS): string {
  return SHADOWS[name];
}

/**
 * Returns the CSS transition shorthand for a named timing + property.
 * Example: transition('background', 'deliberate') → 'background 280ms cubic-bezier(...)'
 */
export function transition(
  property: string,
  timing:   keyof typeof SURFACES['timing'],
  easing?:  keyof typeof SURFACES['easing'],
): string {
  const duration = SURFACES.timing[timing];
  const curve    = SURFACES.easing[easing ?? 'deliberate'];
  return `${property} ${duration} ${curve}`;
}

/**
 * Returns the z-index value for a named elevation layer.
 * Example: zIndex('ceremony') → 500
 */
export function zLayer(name: keyof typeof ELEVATION['zIndex']): number {
  return ELEVATION.zIndex[name];
}
