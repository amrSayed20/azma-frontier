/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * Engine Layer — Type Definitions
 *
 * Generic to every Experience the Engine hosts — nothing here is
 * Arrival-specific. See CONSTITUTIONAL_CONTRACT.ts for the full
 * disclosure of what the Engine layer is and is not responsible for.
 */

/** The three phases every Experience Pipeline moves through — shared, not redefined per Experience. */
export type ExperiencePhase = 'entering' | 'stable' | 'exiting';

/** Identifies a registered Experience Pipeline. Extend this union when a new Experience is authorized — see engine/experience-registry.ts. */
export type ExperienceId = 'arrival' | 'signup' | 'login' | 'qiyamah-chamber' | 'ras-amr';

export interface ExperienceDefinition {
  readonly id: ExperienceId;
  readonly name: string;
  /** The route(s) this Experience is exclusive to — it must never render outside this scope. */
  readonly mountedAt: readonly string[];
  readonly description: string;
}
