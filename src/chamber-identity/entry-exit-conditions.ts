/**
 * AZMA OS — CHAMBER IDENTITY
 * Entry & Exit Conditions
 *
 * CHAMBER IDENTITY V2 (2026-07-23): the two genuinely new fields — every
 * other V2 field is derived at query time from an already-existing
 * registry (see queries.ts's getChamberIdentityProfileV2), not
 * duplicated here. An entry condition is the real circumstance that
 * makes this Chamber the right next step; an exit condition is the real
 * circumstance under which a Creator's visit concludes — distinct from
 * V1's `whatYouLeaveWith` (the outcome itself), and honest about
 * Chambers with no real completion state yet.
 */

import type { ChamberId } from './types';

export interface ChamberEntryExitConditions {
  readonly entryCondition: string;
  readonly exitCondition: string;
}

export const CHAMBER_ENTRY_EXIT_CONDITIONS: Record<ChamberId, ChamberEntryExitConditions> = {
  'sovereign-vault-palace': {
    entryCondition: 'A Creator has something already made that needs to be kept, reviewed, or organized.',
    exitCondition: 'The Creator has confirmed a record is safe, or decided nothing here needs to change.',
  },
  'hujjah-al-damighah': {
    entryCondition: 'A Creator has a claim, decision, or piece of evidence that needs to be tested before it\'s trusted.',
    exitCondition: 'The investigation reaches a verdict the Creator can act on.',
  },
  'qiyamah-chamber': {
    entryCondition: 'A Creator has an idea they can describe and wants it made visible.',
    exitCondition: 'A real image has been generated and saved to the gallery — or the Creator chooses to leave without generating.',
  },
  'ras-amr': {
    entryCondition: 'A Creator has gathered material elsewhere in the Empire and needs it directed into one production.',
    exitCondition: 'Today: there is no real completion state — the console has no locked, deliverable output yet; a Creator leaves by navigating away, not by finishing.',
  },
  'makman-al-ghayah': {
    entryCondition: 'A Creator has a finished, assembled production and wants to reach an audience.',
    exitCondition: 'Today: not yet reachable from the chamber itself — the real distribution capabilities exist only behind a disconnected API.',
  },
};
