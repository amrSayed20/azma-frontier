/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Constitutional Knowledge Repository
 * Construction Phase VIII
 *
 * A fourth read-only subscriber to the Nervous System's Bus, joining the
 * Heart's continuity tracker (Phase IV), the Sovereign Core's perception
 * intake (Integration Package "The First Constitutional Thought"), and
 * Consciousness's observation layer (Phase VII). On every signal, it
 * calls adviseOnOrgan() — the Sovereign Core's own unmodified, pure
 * reasoning function — and APPENDS the result to an archive, rather than
 * overwriting it as the Core's own live cache does. This is what gives
 * the Body historical depth: the Core only remembers its LATEST
 * conclusion about an organ; this Repository remembers EVERY one it has
 * ever reached. It never re-derives reasoning logic of its own — it
 * only preserves what the Core already produces.
 *
 * Deliberately NOT auto-started anywhere in this Construction Phase —
 * the same discipline already applied to the Heart, the Sovereign Core,
 * and Consciousness before their own (or, for Consciousness, still
 * pending) activation Integration Packages.
 */

import { observeAll } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import { adviseOnOrgan } from '../sovereign-core';
import type { ArchivedAdvisory } from './types';

let archive: ArchivedAdvisory[] = [];
let unsubscribe: (() => void) | null = null;
let remembering = false;

function onSignalToRemember(signal: ConstitutionalSignal): void {
  archive.push({
    organId: signal.origin,
    advisory: adviseOnOrgan(signal.origin),
    archivedAt: new Date().toISOString(),
  });
}

/** Begins archiving. Idempotent — calling while already remembering does nothing, preventing a duplicate subscription. */
export function beginConstitutionalRemembering(): void {
  if (remembering) return;
  unsubscribe = observeAll(onSignalToRemember);
  remembering = true;
}

export function endConstitutionalRemembering(): void {
  if (unsubscribe !== null) unsubscribe();
  unsubscribe = null;
  remembering = false;
}

export function isRemembering(): boolean {
  return remembering;
}

/** Every Advisory ever archived for one organ, oldest first — read-only. */
export function getKnowledgeHistoryForOrgan(organId: string): readonly ArchivedAdvisory[] {
  return archive.filter((entry) => entry.organId === organId);
}

/** The complete archive, exactly as it accumulated — read-only. */
export function getFullKnowledgeRepository(): readonly ArchivedAdvisory[] {
  return [...archive];
}

/** Test/reset utility — clears the archive without touching the Nervous System or the Sovereign Core themselves. */
export function resetKnowledgeRepository(): void {
  archive = [];
}
