/**
 * AZMA OS — THE CONSTITUTIONAL ACTUATION (THE IMPERIAL MOTOR SYSTEM)
 * Construction Campaign — Type Definitions
 *
 * Authority: "The Constitutional Construction Campaign," THE
 * CONSTITUTIONAL ACTUATION ("The Birth of the Imperial Motor System").
 *
 * WHAT "ACTUATION PATHWAY" ACTUALLY MEANS HERE, disclosed rather than
 * invented: this Campaign's own Out of Scope forbids "AI providers,
 * External APIs, Runtime workers, Queues, Infrastructure integrations" —
 * i.e., every real mechanism an "execution pathway" could otherwise name
 * is explicitly excluded. No prior Constitutional Package has ever
 * authorized one either. Given that, there is exactly ONE
 * ConstitutionalPathwayKind ('internal-record') — the only pathway this
 * module is authorized to route toward — applied uniformly to every
 * actuation regardless of organ or content. Choosing between multiple
 * pathways based on content would itself be Constitutional Reasoning,
 * forbidden by name. "Selecting a target" means identifying WHICH
 * already-registered Skeleton organ (Phase I) an actuation concerns —
 * never an external infrastructure target, since none exists or is
 * authorized.
 */

import type { ConstitutionalExecution } from '../constitutional-execution';

export type ConstitutionalPathwayKind = 'internal-record';

export interface ConstitutionalPathway {
  readonly pathwayKind: ConstitutionalPathwayKind;
  readonly description: string;
}

export interface ConstitutionalTarget {
  readonly organId: string;
}

export interface ConstitutionalRouting {
  readonly routingId: string;
  readonly sourceExecutionId: string;
  readonly pathway: ConstitutionalPathway;
  readonly target: ConstitutionalTarget;
  readonly routedAt: string;
}

export interface RoutingRejection {
  readonly executionId: string;
  readonly reason: string;
}

export interface ConstitutionalActuationCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}

export type { ConstitutionalExecution };
