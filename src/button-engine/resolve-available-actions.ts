/**
 * AZMA OS — THE BUTTON ENGINE
 * The Resolver
 *
 * Migrated 2026-07-18 (Awareness & Manifestation Final Architectural
 * Ruling, Article III). Button Engine no longer decides what is
 * available — that decision now belongs exclusively to the Imperial
 * Awareness Engine. Button Engine is a Presentation Consumer: it adapts
 * its own context into the Awareness Engine's context shape, asks the
 * Imperial Manifestation Engine for the 'button' presentation of
 * whatever Plan comes back, and attaches its own button-specific
 * rendering metadata (label, href, kind) — the one responsibility that
 * remains genuinely its own.
 */

import { resolveAwareness } from '@/src/imperial-awareness-engine';
import type { AwarenessContext } from '@/src/imperial-awareness-engine';
import { manifest } from '@/src/imperial-manifestation-engine';
import { CONSTITUTIONAL_ACTIONS } from './action-registry';
import type { AvailableAction, ButtonContext } from './types';

function toAwarenessContext(context: ButtonContext): AwarenessContext {
  return {
    creator: { authenticated: context.authenticated ?? false, role: context.role ?? null },
    workflowStage: context.threshold,
    chamberState: context.threshold === 'chamber' ? context.chamberState : undefined,
  };
}

export function resolveAvailableActions(context: ButtonContext): readonly AvailableAction[] {
  const plan = resolveAwareness(toAwarenessContext(context));
  const specs = manifest(plan, 'button');
  return specs.map((spec) => ({ id: spec.id, ...CONSTITUTIONAL_ACTIONS[spec.id] }));
}
