/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Classification Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * "Classification" here is the taxonomy of constitutional CONSTRUCT KINDS
 * the Skeleton itself recognizes — Body, Region, System, Organ,
 * Relationship, Boundary, Authority. No Book or Anatomy chapter names a
 * specific business classification for organs themselves (unlike, say,
 * the Sovereign Capability Diwan's taxonomy, which was deliberately
 * deferred until repository evidence existed — SCD-001/003). Guessing
 * one here would repeat the exact mistake that precedent exists to
 * prevent. This registry instead classifies the Skeleton's own
 * structure — a real, evidenced, and immediately useful meta-registry.
 */

import type { ConstitutionalClassification } from './types';
import { CONSTITUTIONAL_REGIONS } from './region-registry';
import { CONSTITUTIONAL_SYSTEMS } from './system-registry';
import { CONSTITUTIONAL_ORGANS } from './organ-registry';
import { CONSTITUTIONAL_RELATIONSHIPS } from './relationship-registry';
import { CONSTITUTIONAL_BOUNDARIES } from './boundary-registry';
import { CONSTITUTIONAL_AUTHORITIES } from './authority-registry';

export const CONSTITUTIONAL_CLASSIFICATIONS: readonly ConstitutionalClassification[] = [
  { kind: 'body', description: 'The one living organism itself. Exactly one instance ever exists.' },
  { kind: 'region', description: 'A constitutional territory grouping organs by shared purpose. Six recognized (Anatomy Ch. I).' },
  { kind: 'system', description: 'A living assembly of organs cooperating within one region (Anatomy Ch. III). Six recognized, 1:1 with regions.' },
  { kind: 'organ', description: 'An independent constitutional institution contributing directly to the life of the Body (Anatomy Ch. II).' },
  { kind: 'relationship', description: 'A bidirectional, evidence-grounded pathway of trust between two organs (Anatomy Ch. V).' },
  { kind: 'boundary', description: 'What an organ shall never do — its constitutional prohibitions.' },
  { kind: 'authority', description: 'What an organ may legitimately do — its constitutional scope.' },
] as const;

/** Current instance counts per construct kind — computed from the other registries, not hardcoded, so it never drifts out of sync with them. */
export function getClassificationCounts(): Readonly<Record<ConstitutionalClassification['kind'], number>> {
  return {
    body: 1,
    region: CONSTITUTIONAL_REGIONS.length,
    system: CONSTITUTIONAL_SYSTEMS.length,
    organ: CONSTITUTIONAL_ORGANS.length,
    relationship: CONSTITUTIONAL_RELATIONSHIPS.length,
    boundary: CONSTITUTIONAL_BOUNDARIES.length,
    authority: CONSTITUTIONAL_AUTHORITIES.length,
  };
}
