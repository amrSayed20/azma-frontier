/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME INTERFACES — Unified Export
 * Construction Package: Living Runtime — Stage 6 of 13
 *
 * Composes boundary.ts, facade.ts, and interface-metadata.ts into the single
 * Living Runtime Interfaces layer this stage's directive requires: the only
 * seam through which any future Application Runtime, Presentation Runtime, UI
 * Runtime, AI Runtime, Engine Runtime, Workflow Runtime, or Execution Runtime
 * may reach the Living Runtime Foundation.
 *
 * This layer implements no execution, no business logic, no AI, no
 * presentation. Every re-export, guard, and accessor here is copied forward
 * from runtime/lifecycle.ts, runtime/states.ts, runtime/signals.ts, or
 * runtime/contracts.ts (Stage 5) — nothing here originates new authority or
 * behavior.
 */

export * from './facade';
export * from './boundary';
export * from './interface-metadata';

import { RUNTIME_INTERFACE_BOUNDARY, RUNTIME_INTERFACE_CONSUMERS } from './boundary';
import {
  RUNTIME_INTERFACE_CITIZEN,
  RUNTIME_INTERFACE_COMPANION,
  RUNTIME_INTERFACE_GHOST_GUIDE,
  RUNTIME_INTERFACE_INVISIBLE_DIRECTOR,
  RUNTIME_INTERFACE_CREATIVE_RUNTIME,
  RUNTIME_INTERFACE_FUTURE_AI_ENGINE,
  RUNTIME_INTERFACE_LIFECYCLE_AND_SIGNAL_QUERY_SURFACE,
} from './interface-metadata';

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME INTERFACE TRACEABILITY MATRIX
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_INTERFACE_TRACEABILITY_MATRIX = {
  CitizenContractInterface:                       'runtime/contracts.ts:CitizenContract → EVENT_CITIZEN_EXPRESSION (events.ts)',
  CompanionContractInterface:                     'runtime/contracts.ts:CompanionContract → ENTITY_PARTICIPANT_ORCHESTRATOR (specification.ts)',
  GhostGuideContractInterface:                    'runtime/contracts.ts:GhostGuideContract → CharacterAuthority.owns (specification.ts)',
  InvisibleDirectorContractInterface:             'runtime/contracts.ts:InvisibleDirectorContract → CharacterAuthority.owns (specification.ts)',
  CreativeRuntimeContractInterface:                'runtime/contracts.ts:CreativeRuntimeContract → ENTITY_QIYAMAH_CHAMBER (specification.ts)',
  FutureAIEngineContractInterface:                'runtime/contracts.ts:FutureAIEngineContract → VALIDATION_3_PRE_PRESENTATION_MARKERS (validation.ts)',
  LifecycleAndSignalQuerySurfaceInterface:        'runtime/lifecycle.ts + runtime/signals.ts + runtime/states.ts',
  chain: [
    'Constitution (Soul → Transformation)',
    'Constitutional Architecture (architecture.ts)',
    'Architectural Specification (specification.ts)',
    'Architectural Interfaces (interfaces.ts)',
    'Architectural Behavior Model (behavior.ts)',
    'Architectural State Model (state.ts)',
    'Architectural Event Model (events.ts)',
    'Architectural Validation Model (validation.ts)',
    'Architectural Integration Model (integration.ts)',
    'Architectural Readiness Model (readiness.ts)',
    'Architectural Certification (certification.ts)',
    'Living Runtime Foundation (runtime/)',
    'Living Runtime Interfaces (this directory)',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THE LIVING RUNTIME INTERFACES (unified)
// ═══════════════════════════════════════════════════════════════════════════

export const QIYAMAH_LIVING_RUNTIME_INTERFACES = {
  boundary:  RUNTIME_INTERFACE_BOUNDARY,
  consumers: RUNTIME_INTERFACE_CONSUMERS,

  contracts: {
    citizen:                          RUNTIME_INTERFACE_CITIZEN,
    companion:                        RUNTIME_INTERFACE_COMPANION,
    ghostGuide:                       RUNTIME_INTERFACE_GHOST_GUIDE,
    invisibleDirector:                RUNTIME_INTERFACE_INVISIBLE_DIRECTOR,
    creativeRuntime:                  RUNTIME_INTERFACE_CREATIVE_RUNTIME,
    futureAIEngine:                   RUNTIME_INTERFACE_FUTURE_AI_ENGINE,
    lifecycleAndSignalQuerySurface:   RUNTIME_INTERFACE_LIFECYCLE_AND_SIGNAL_QUERY_SURFACE,
  },

  traceability: RUNTIME_INTERFACE_TRACEABILITY_MATRIX,

  final_imperial_test:
    'If the Living Runtime Foundation were hidden, another Chief Engineer must be able to ' +
    'understand every runtime interaction exclusively through these Runtime Interfaces — the ' +
    'seven contracts in interface-metadata.ts, the guarded surface in facade.ts, and the ' +
    'public/internal partition in boundary.ts — without bypassing the approved architectural chain.',

  decree:
    'This Living Runtime Interfaces layer exposes exactly the operational surface a future ' +
    'runtime layer needs — no more, no less — while keeping every decision-bearing raw table ' +
    'internal to the Foundation, reachable only through its guard functions. It introduces no ' +
    'new authority, no new behavior, no execution, and no implementation. It is, together with ' +
    'the Foundation it wraps, the exclusive constitutional boundary between Architecture and ' +
    'Implementation.',
} as const;
