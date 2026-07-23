/**
 * AZMA OS — THE IMPERIAL GATES
 * Type Definitions
 *
 * Authority: "The Law of Cinematic Continuity" + "The Founder Identity
 * Resolution" naming clarifications. A third Constitutional category,
 * distinct from Chambers (creator workspaces) and distinct from the
 * separate Founder journey: the constitutional entrances of the Living
 * Empire, through which a Creator passes before entering a Chamber.
 *
 * 'imperial-gate' is reserved here as a recognized identity but has no
 * live route yet — no page exists to give it real content, and
 * inventing one would mean authoring Constitutional content (what the
 * page says, shows, means) without direction. Disclosed, not built.
 */

export type ImperialGateId = 'landing' | 'imperial-gate' | 'login' | 'signup' | 'subscription';

/** Mirrors ChamberScore's shape (src/design-system/direction.ts) — a Gate's complete cinematic definition. */
export interface ImperialGateScore {
  readonly gateId: ImperialGateId;
  readonly arc: import('../design-system').EmotionalCurve;
  readonly companionDirection: import('../design-system').CompanionDirection;
  readonly defaultMode: import('../design-system').CitizenMode;
  readonly transitionIn: import('../design-system').SceneTransitionType;
  readonly transitionOut: import('../design-system').SceneTransitionType;
}

export function isImperialGateId(value: string): value is ImperialGateId {
  return value === 'landing' || value === 'imperial-gate' || value === 'login' || value === 'signup' || value === 'subscription';
}
