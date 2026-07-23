/**
 * AZMA OS — CHAMBER IDENTITY
 * Query Helpers
 *
 * CHAMBER IDENTITY V2 (2026-07-23): getChamberIdentityProfileV2 composes
 * V1's static profile with live reads from boundary-registry.ts,
 * relationship-registry.ts, TONE_PROFILES, and CHAMBER_SCORES — never a
 * hand-copied duplicate of any of them. If any of those sources changes,
 * V2 changes with it automatically; nothing here can go stale the way
 * organ-registry.ts's old Qiyamah entry once did.
 */

import type { ChamberId, ChamberIdentityProfile, ChamberIdentityProfileV2 } from './types';
import { CHAMBER_IDENTITY_PROFILES } from './chamber-identity-registry';
import { CHAMBER_ENTRY_EXIT_CONDITIONS } from './entry-exit-conditions';
import { getBoundaryForOrgan, listRelationshipsForOrgan } from '@/src/sovereign-body';
import { getToneProfile } from '@/src/core/tongue';
import { CHAMBER_SCORES } from '@/src/design-system';

export function getChamberIdentityProfile(chamberId: ChamberId): ChamberIdentityProfile {
  return CHAMBER_IDENTITY_PROFILES[chamberId];
}

export function listChamberIdentityProfiles(): readonly ChamberIdentityProfile[] {
  return Object.values(CHAMBER_IDENTITY_PROFILES);
}

/**
 * src/sovereign-body's two registries register Ras Al Amr under the
 * organ id 'ras-al-amr' (the extra "al") while ChamberContext — and
 * every other source this file reads — spells it 'ras-amr'. Bridged
 * here, at the one place that needs to cross between the two id spaces,
 * rather than silently renamed in either registry.
 */
function toOrganId(chamberId: ChamberId): string {
  return chamberId === 'ras-amr' ? 'ras-al-amr' : chamberId;
}

const ARC_REGISTER_DESCRIPTIONS: Record<string, string> = {
  standard: 'Open and exploratory — curiosity is welcomed, no beat demands more than a moment.',
  investigative: 'Active scrutiny — a deliberate delay sits before the verdict, not before the start.',
  ceremonial: 'Weighty and infrequent — the moment carries consequence; nothing here is casual.',
  archival: 'Quiet and unhurried — the shortest arc, built for calm return rather than event.',
};

const MODE_PACING_DESCRIPTIONS: Record<string, string> = {
  'citizen-leads': 'the Chamber responds immediately and follows the Creator\'s own pace.',
  'shared-direction': 'the Chamber and the Creator share the rhythm — neither dictates it.',
  'chamber-leads': 'the Chamber sets a slower, more deliberate pace than the Creator\'s own.',
};

export function getChamberIdentityProfileV2(chamberId: ChamberId): ChamberIdentityProfileV2 {
  const v1 = CHAMBER_IDENTITY_PROFILES[chamberId];
  const conditions = CHAMBER_ENTRY_EXIT_CONDITIONS[chamberId];
  const organId = toOrganId(chamberId);

  const boundary = getBoundaryForOrgan(organId);
  const tone = getToneProfile(chamberId);
  const score = CHAMBER_SCORES[chamberId];

  const relationships = listRelationshipsForOrgan(organId).map((relationship) => ({
    otherChamberOrOrganId: relationship.fromOrganId === organId ? relationship.toOrganId : relationship.fromOrganId,
    kind: relationship.kind,
    evidenceNote: relationship.evidenceNote,
  }));

  const arcName = score.arc.chamberId;
  const emotionalExperience =
    `${ARC_REGISTER_DESCRIPTIONS[arcName] ?? arcName} In this Chamber, ${MODE_PACING_DESCRIPTIONS[score.defaultMode]}`;

  return {
    ...v1,
    constitutionalBoundaries: boundary?.prohibitions ?? [],
    nonResponsibilities: boundary?.prohibitions ?? [],
    personality: tone.character,
    communicationStyle:
      `Vocabulary: ${tone.vocabularyChar}. Sentence rhythm: ${tone.sentenceRhythm}. Question style: ${tone.questionStyle}.`,
    relationships,
    emotionalExperience,
    entryCondition: conditions.entryCondition,
    exitCondition: conditions.exitCondition,
  };
}

export function listChamberIdentityProfilesV2(): readonly ChamberIdentityProfileV2[] {
  return (Object.keys(CHAMBER_IDENTITY_PROFILES) as ChamberId[]).map(getChamberIdentityProfileV2);
}
