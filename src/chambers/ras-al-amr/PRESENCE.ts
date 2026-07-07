/**
 * AZMA OS — RAS AL AMR
 * PACKAGE I — CONSTITUTIONAL FOUNDATION
 * STAGE 5 — PRESENCE
 *
 * This is a faithful translation of the approved Constitutional Presence
 * Declaration of RAS AL AMR. No constitutional statement has been added,
 * removed, reinterpreted, or rewritten.
 */

// ── Atmosphere ────────────────────────────────────────────────────────────

export const RAS_AL_AMR_ATMOSPHERE = {
  feltBeforeUnderstood: 'RAS AL AMR shall be felt before it is understood.',
  inspires:
    'Its atmosphere shall inspire confidence, concentration, and creative dignity.',
  never: 'The Chamber shall never create anxiety.',
  creates: 'It shall create calm creative authority.',
} as const;

// ── Confidence ────────────────────────────────────────────────────────────

export const RAS_AL_AMR_CONFIDENCE = {
  never: 'The Chamber never displays arrogance.',
  comesFrom: 'Its confidence comes from consistency.',
  reassures: 'Its confidence reassures rather than intimidates.',
  creatorShallFeel: 'The creator shall always feel supported.',
} as const;

// ── Focus ─────────────────────────────────────────────────────────────────

export const RAS_AL_AMR_FOCUS = {
  protects: 'The Chamber protects attention.',
  removes: 'It removes unnecessary distraction.',
  standard:
    'Everything presented to the creator shall serve the creative objective.',
  treatment: 'Focus is treated as a constitutional responsibility.',
} as const;

// ── Calm ──────────────────────────────────────────────────────────────────

export const RAS_AL_AMR_CALM = {
  silence: 'Silence is an intentional design principle.',
  never: 'The Chamber never overwhelms the creator with activity.',
  enables: 'Calm enables better creative judgment.',
} as const;

// ── Artistic Intensity ────────────────────────────────────────────────────

export const RAS_AL_AMR_ARTISTIC_INTENSITY = {
  possesses: 'The Chamber possesses artistic depth without visual chaos.',
  directed: 'Creative energy is always directed toward the work itself.',
  strengthens: [
    'Intensity strengthens inspiration.',
    'Never confusion.',
  ],
} as const;

// ── Professionalism ───────────────────────────────────────────────────────

export const RAS_AL_AMR_PROFESSIONALISM = {
  creatorShallFeel:
    'The creator shall always feel accompanied by a master creative director.',
  expressedThrough:
    'Professionalism is expressed through clarity, consistency, restraint, and respect.',
  never: 'The Chamber shall never appear uncertain about its constitutional role.',
} as const;

// ── THE CONSTITUTIONAL PRESENCE (unified) ────────────────────────────────

export const RAS_AL_AMR_PRESENCE = {
  atmosphere: RAS_AL_AMR_ATMOSPHERE,
  confidence: RAS_AL_AMR_CONFIDENCE,
  focus: RAS_AL_AMR_FOCUS,
  calm: RAS_AL_AMR_CALM,
  artisticIntensity: RAS_AL_AMR_ARTISTIC_INTENSITY,
  professionalism: RAS_AL_AMR_PROFESSIONALISM,
} as const;
