/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * Public API — import from here, never directly from engine/ or
 * experiences/.
 *
 * See CONSTITUTIONAL_CONTRACT.ts for the permanent architectural
 * reference — purpose, responsibilities, non-responsibilities,
 * lifecycle, public interfaces, integration boundaries, and future
 * extension rules.
 *
 * THE FIRST CONSTITUTIONAL PACKAGE (2026-07-20): after the prior
 * Welcome/Arrival Experience was reset as exploratory-prototype work,
 * the Council issued a package-by-package constitutional foundation
 * (Constitution, Vision, Encounter, Character, Visitor, Timeline,
 * Script, Storyboard) before authorizing construction again. The
 * Arrival Experience Pipeline below is built directly from that
 * foundation — see experiences/arrival/ArrivalExperience.tsx for the
 * beat-by-beat translation.
 *
 * ARRIVAL RUNTIME FOUNDATION, Package I (2026-07-21): see
 * ARRIVAL_RUNTIME_FOUNDATION_CONTRACT.ts for the full audit of ten
 * requested runtime systems against what already exists platform-wide.
 *
 * REGISTRATION GATEWAY, Package I (2026-07-23): the second real
 * Experience Pipeline — crossing from '/' to '/signup' is one
 * continuous ceremonial passage, not two independent pages. See
 * experiences/signup/SignupExperience.tsx for what continuity means
 * concretely and what was deliberately left untouched (the form
 * itself).
 *
 * RECOGNITION GATEWAY (2026-07-23): the third Experience Pipeline —
 * deliberately not a copy of the Registration Gateway. "The Returning
 * Creator is not a Visitor... recognition instead of birth, continuity
 * instead of introduction, belonging instead of arrival." See
 * experiences/login/LoginExperience.tsx for the concrete distinction.
 *
 * QIYAMAH CHAMBER, PACKAGE I (2026-07-23): the fourth Experience
 * Pipeline, and the first Chamber rather than Gate. See
 * experiences/qiyamah-chamber/QiyamahChamberExperience.tsx — a real
 * generation backend already existed; this package brought only the
 * shared runtime (lifecycle, Presence, Imperial Voice) the Chamber
 * lacked, leaving its ratified crimson identity and generation UI
 * untouched.
 *
 * Architecture: Engine (generic lifecycle + registry, see engine/) hosts
 * Experience Pipelines (see experiences/); each Pipeline owns its own
 * Presentation and runs on the Engine's shared Lifecycle; a chosen
 * action triggers the Operating System Handoff before navigation.
 */

export type { ExperiencePhase, ExperienceId, ExperienceDefinition } from './engine';
export { EXPERIENCE_REGISTRY } from './engine';

export { ArrivalExperience } from './experiences/arrival';
export { SignupExperience } from './experiences/signup';
export { LoginExperience } from './experiences/login';
export { QiyamahChamberExperience } from './experiences/qiyamah-chamber';
export { RasAmrExperience } from './experiences/ras-amr';

export type { ArrivalRuntimeMapping } from './ARRIVAL_RUNTIME_FOUNDATION_CONTRACT';
export { ARRIVAL_RUNTIME_FOUNDATION } from './ARRIVAL_RUNTIME_FOUNDATION_CONTRACT';

export {
  IXE_CONSTITUTIONAL_PURPOSE,
  IXE_RESPONSIBILITIES,
  IXE_NON_RESPONSIBILITIES,
  IXE_LIFECYCLE_DESCRIPTION,
  IXE_PUBLIC_INTERFACES,
  IXE_INTEGRATION_BOUNDARIES,
  IXE_EXTENSION_RULES,
} from './CONSTITUTIONAL_CONTRACT';
