/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * Engine Layer — Public API
 *
 * Generic to every Experience; contains nothing Arrival-specific. See
 * ../experiences/arrival/ for the first Experience Pipeline built on it.
 */

export type { ExperiencePhase, ExperienceId, ExperienceDefinition } from './types';
export { EXPERIENCE_REGISTRY } from './experience-registry';
export { useExperienceLifecycle } from './use-experience-lifecycle';
export type { UseExperienceLifecycleOptions, ExperienceLifecycle } from './use-experience-lifecycle';
