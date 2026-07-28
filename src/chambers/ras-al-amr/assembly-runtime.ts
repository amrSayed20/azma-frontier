/**
 * AZMA OS — Ras Al-Amr: The Sovereign Assembly Runtime
 *
 * PACKAGE XXIV — SOVEREIGN ASSEMBLY RUNTIME (2026-07-28): the first real
 * execution consumer of a `DirectionDecision` (direction-workspace-
 * constitution.ts, Package XXIII). Until this package, a `DirectionDecision`
 * was a real, tested, but purely constitutional object — nothing in the
 * Empire actually consumed one to change the Sovereign Direction State.
 * `AssemblyRuntime.execute()` closes that gap.
 *
 * WHY THIS DOES NOT DUPLICATE RasAlAmrStateManager: it does not. Every
 * "synchronize AssemblyNodes / AssemblyTracks / RasAlAmrStateManager"
 * responsibility this package was authorized to fulfill is already
 * satisfied atomically by `RasAlAmrStateManager.applyMutation()` — that
 * method already updates nodes, tracks, and its own canvas state together
 * in one immutable transition. `AssemblyRuntime` introduces exactly one
 * new capability: consuming the `DirectionDecision` WRAPPER itself (not
 * just its inner `mutation`) as the Empire's single execution entry point.
 * Its own implementation is pure delegation — one line, no new mutation
 * logic, no branching on `operator`, no reasoning of any kind.
 *
 * WHY THIS IS SUFFICIENT FOR A FUTURE AUTOMATIC DIRECTOR, WITHOUT BUILDING
 * IT NOW: because `execute()` takes a `DirectionDecision` (which already
 * carries `operator: DirectionOperator`), a future Automatic Director
 * integration requires ONLY producing a `DirectionDecision` via the
 * already-real `toDirectionDecision('automatic-director', ...)` and
 * calling this same `execute()` — zero new Runtime code. Per the Chief
 * Architect's own ruling ("the Empire does not permit producers without
 * consumers"), that integration is explicitly NOT authorized in this
 * package; this file exists so it requires no redesign when it is.
 */

import type { SovereignCanvas } from './assembly-contracts';
import type { DirectionDecision } from './direction-workspace-constitution';
import { RasAlAmrStateManager } from './ras-al-amr-state-manager';

export class AssemblyRuntime {
  constructor(private readonly stateManager: RasAlAmrStateManager) {}

  /**
   * The Empire's single constitutional execution consumer: applies a
   * DirectionDecision's real mutation to the Sovereign Direction Workspace.
   * Performs no reasoning — it does not inspect `decision.operator` to
   * decide anything; every operator's decisions execute identically.
   */
  public execute(canvas: SovereignCanvas, decision: DirectionDecision): SovereignCanvas {
    return this.stateManager.applyMutation(canvas, decision.mutation);
  }
}
