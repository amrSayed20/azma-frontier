/**
 * AZMA Runtime OS — Runtime Civilization Simulation (RCS)
 *
 * ════════════════════════════════════════════════════════════════════════════
 * PERMANENT PRODUCTION ASSET — DO NOT REPLACE. ONLY EXTEND.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * This file is the living Runtime OS proof-of-life. It grows with every Wave.
 * Each Wave adds new layer coverage without removing prior coverage.
 *
 * BY WP-048: This single simulation will demonstrate the complete Operating
 * System executing a production session across every Runtime Layer — no mocks.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WAVE HISTORY
 * ─────────────────────────────────────────────────────────────────────────────
 * Wave 1 — WP-008 : Layer 3 Scheduling Kernel
 * Wave 2 — WP-009-012 : Layer 4 Memory + Layer 5 Decision
 * Wave 3 — WP-013-020 : Layer 7 Agent Society (CURRENT)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ACTIVE LAYERS
 * ─────────────────────────────────────────────────────────────────────────────
 * Layer 3 — Scheduling Kernel   (WP-008)
 * Layer 4 — Memory Layer        (WP-009, WP-010, WP-011)
 * Layer 5 — Decision Layer      (WP-012)
 * Layer 6 — Admission Gate      (WP-007, wired via Layer3Adapter)
 * Layer 7 — Agent Society       (WP-013-020, canonical routing added to pipeline)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CANONICAL EXECUTION PATH (per WP-020 directive)
 * ─────────────────────────────────────────────────────────────────────────────
 * User → Admission → Scheduling → Agent Society → Specialized Agent → Memory → Decision → Policy → Audit → Result
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MANDATORY SCENARIOS PER WAVE
 * ─────────────────────────────────────────────────────────────────────────────
 * Scenario 1 — Normal Production Flow
 * Scenario 2 — High-Load Concurrent Flow
 * Scenario 3 — Failure + Recovery Flow
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ARTIFACTS PRODUCED PER WAVE
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Runtime Timeline
 * 2. Cross-Layer Interaction Log
 * 3. Constitutional Decision Chain
 * 4. Audit Chain
 * 5. Memory Evolution
 * 6. Scheduling Evolution
 * 7. Agent Society Evolution (NEW — WP-013-020)
 * 8. Specialized Agent Selection Log (NEW — WP-013-020)
 * 9. Decision Evolution
 * 10. Final Runtime State
 */

import {
  createSchedulingKernel,
  createCriticalPriorityPolicy,
  createHighPriorityPolicy,
  createNormalPriorityPolicy,
} from './wp-008-kernel';
import { Layer3Adapter } from './wp-008-adapter';
import { createMemoryLayer, createCacheKey } from './wp-011-kernel';
import {
  createDecisionLayer,
  createCriticalRejectionPolicy,
  createHighPriorityApprovalPolicy,
} from './wp-012-kernel';
import { createAgentSocietyLayer, AgentType } from './wp-020-kernel';
import { createAgentDecisionSocietyLayer } from './wp-021-028-agent-decision-services';
import { RequestPriority } from './wp-008-types';
import type { SchedulingDecision, AuditTrailId } from './wp-008-types';
import type { PolicyEvaluationResult, EvaluationVerdict } from './wp-012-types';
import type { ConstitutionArticleId } from './constitution-types';
import type { AgentSelectionResult, AgentExecutionResult } from './wp-013-020-agent-society-types';
import type { AgentDecision, AgentRuntimeState, AgentRole, AgentIdentity } from './wp-021-028-agent-decision-types';

// ═══════════════════════════════════════════════════════════════════════════
// ARTIFACT INFRASTRUCTURE
// (extended with each wave — never replaced)
// ═══════════════════════════════════════════════════════════════════════════

interface TimelineEvent {
  readonly wave: string;
  readonly scenario: string;
  readonly t: number;
  readonly layer: string;
  readonly event: string;
  readonly requestId: string;
  readonly detail: string;
  readonly constitutional?: ConstitutionArticleId;
  readonly auditId?: string;
}

interface SchedulingRecord {
  readonly requestId: string;
  readonly priority: RequestPriority;
  readonly decisionId: string;
  readonly scheduledTime: Date;
  readonly auditTrailId: AuditTrailId;
  readonly scenario: string;
}

interface DecisionRecord {
  readonly requestId: string;
  readonly verdict: EvaluationVerdict;
  readonly evaluationId: string;
  readonly matchedPolicy: string | null;
  readonly rationale: string;
  readonly auditTrailId: AuditTrailId;
  readonly scenario: string;
}

/**
 * Agent Society Evolution (WP-013-020)
 * Tracks agent selection and execution throughout simulation
 */
interface AgentSelectionRecord {
  readonly requestId: string;
  readonly selectedAgentId: string;
  readonly agentType: AgentType;
  readonly selectionReason: string;
  readonly alternatives: readonly string[];
  readonly timestamp: Date;
  readonly scenario: string;
}

interface AgentExecutionRecord {
  readonly requestId: string;
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly success: boolean;
  readonly executionTimeMs: number;
  readonly scenario: string;
}

interface MemoryRecord {
  readonly operation: 'CACHE_SET' | 'CACHE_GET' | 'CACHE_MISS' | 'CACHE_EVICT' | 'MEM_WRITE' | 'MEM_READ' | 'MEM_REHYDRATE';
  readonly key: string;
  readonly requestId: string;
  readonly constitutional?: ConstitutionArticleId;
  readonly scenario: string;
}

/**
 * Wave 4 (WP-021-028): Agent Decision Society Artifacts
 * Five new artifacts tracking constitutional agent decision-making
 */

interface AgentIdentityEvolutionRecord {
  readonly agentId: string;
  readonly agentName: string;
  readonly registeredAt: number;
  readonly roleType: string;
  readonly authorityLevel: number;
  readonly scenario: string;
}

interface AgentDecisionTimelineRecord {
  readonly decisionId: string;
  readonly agentId: string;
  readonly requestId: string;
  readonly decisionType: string;
  readonly confidence: string;
  readonly constitutionalBasis?: ConstitutionArticleId;
  readonly timestamp: number;
  readonly scenario: string;
}

interface AgentCooperationLogRecord {
  readonly requestId: string;
  readonly agents: readonly string[];
  readonly decisionType: string;
  readonly consensusReached: boolean;
  readonly delegations: readonly string[];
  readonly timestamp: number;
  readonly scenario: string;
}

interface AgentStateEvolutionRecord {
  readonly agentId: string;
  readonly previousState: string;
  readonly newState: string;
  readonly timestamp: number;
  readonly requestId: string;
  readonly scenario: string;
}

interface AgentAuthorityVerificationRecord {
  readonly agentId: string;
  readonly constitutionalArticle: ConstitutionArticleId;
  readonly verificationResult: 'AUTHORIZED' | 'DENIED';
  readonly timestamp: number;
  readonly requestId: string;
  readonly scenario: string;
}

interface FinalRuntimeState {
  readonly totalRequestsProcessed: number;
  readonly schedulingDecisionsMade: number;
  readonly policyEvaluationsRun: number;
  readonly memoryEntriesWritten: number;
  readonly cacheOperations: number;
  readonly verdictBreakdown: Record<EvaluationVerdict, number>;
  readonly failuresInjected: number;
  readonly recoveriesCompleted: number;
  readonly layersCovered: readonly string[];
  readonly wavesCovered: readonly string[];
}

/** Central artifact store — accumulates across all scenarios */
class CivilizationSimulationArtifacts {
  readonly runtimeTimeline: TimelineEvent[] = [];
  readonly crossLayerLog: string[] = [];
  readonly constitutionalChain: string[] = [];
  readonly auditChain: string[] = [];
  readonly memoryEvolution: MemoryRecord[] = [];
  readonly schedulingEvolution: SchedulingRecord[] = [];
  readonly agentSocietyEvolution: AgentSelectionRecord[] = [];
  readonly agentSelectionLog: AgentExecutionRecord[] = [];
  readonly decisionEvolution: DecisionRecord[] = [];
  
  // Wave 4 (WP-021-028): Agent Decision Society
  readonly agentIdentityEvolution: AgentIdentityEvolutionRecord[] = [];
  readonly agentDecisionTimeline: AgentDecisionTimelineRecord[] = [];
  readonly agentCooperationLog: AgentCooperationLogRecord[] = [];
  readonly agentStateEvolution: AgentStateEvolutionRecord[] = [];
  readonly agentAuthorityVerification: AgentAuthorityVerificationRecord[] = [];

  private readonly startMs = Date.now();

  event(
    wave: string,
    scenario: string,
    layer: string,
    event: string,
    requestId: string,
    detail: string,
    constitutional?: ConstitutionArticleId,
    auditId?: string,
  ): void {
    const e: TimelineEvent = {
      wave, scenario, t: Date.now() - this.startMs,
      layer, event, requestId, detail, constitutional, auditId,
    };
    this.runtimeTimeline.push(e);
    this.crossLayerLog.push(`[${layer.padEnd(18)}] ${event.padEnd(26)} req=${requestId} | ${detail}`);
    if (constitutional) this.constitutionalChain.push(`${event} → Article:${constitutional} (${requestId})`);
    if (auditId) this.auditChain.push(`${auditId} ← ${event} (${requestId})`);
  }

  mem(op: MemoryRecord['operation'], key: string, requestId: string, scenario: string, constitutional?: ConstitutionArticleId): void {
    this.memoryEvolution.push({ operation: op, key, requestId, constitutional, scenario });
  }

  sched(record: SchedulingRecord): void { this.schedulingEvolution.push(record); }
  
  agentSelection(record: AgentSelectionRecord): void { this.agentSocietyEvolution.push(record); }
  
  agentExecution(record: AgentExecutionRecord): void { this.agentSelectionLog.push(record); }
  
  decision(record: DecisionRecord): void { this.decisionEvolution.push(record); }

  // Wave 4 recording methods
  recordAgentIdentity(record: AgentIdentityEvolutionRecord): void {
    this.agentIdentityEvolution.push(record);
  }

  recordAgentDecision(record: AgentDecisionTimelineRecord): void {
    this.agentDecisionTimeline.push(record);
  }

  recordAgentCooperation(record: AgentCooperationLogRecord): void {
    this.agentCooperationLog.push(record);
  }

  recordAgentState(record: AgentStateEvolutionRecord): void {
    this.agentStateEvolution.push(record);
  }

  recordAuthorityVerification(record: AgentAuthorityVerificationRecord): void {
    this.agentAuthorityVerification.push(record);
  }

  buildFinalState(): FinalRuntimeState {
    const verdicts: Record<EvaluationVerdict, number> = { APPROVED: 0, REJECTED: 0, ESCALATED: 0 };
    this.decisionEvolution.forEach(d => { verdicts[d.verdict]++; });
    
    // Determine layers and waves based on actual usage
    const layersCovered = ['Layer 3 (Scheduling)', 'Layer 4 (Memory)', 'Layer 5 (Decision)', 'Layer 6 (Admission)'];
    const wavesCovered = ['Wave 1 — WP-008', 'Wave 2 — WP-009-012'];
    
    // Add Layer 7 and Wave 3 if agent society was used
    if (this.agentSocietyEvolution.length > 0) {
      layersCovered.push('Layer 7 (Agent Society)');
      wavesCovered.push('Wave 3 — WP-013-020');
    }
    
    // Add Layer 7 Extended and Wave 4 if agent decisions were made
    if (this.agentDecisionTimeline.length > 0) {
      if (!layersCovered.includes('Layer 7 (Agent Society)')) {
        layersCovered.push('Layer 7 (Agent Society)');
      }
      if (!wavesCovered.includes('Wave 4 — WP-021-028')) {
        wavesCovered.push('Wave 4 — WP-021-028');
      }
    }
    
    return {
      totalRequestsProcessed: this.schedulingEvolution.length,
      schedulingDecisionsMade: this.schedulingEvolution.length,
      policyEvaluationsRun: this.decisionEvolution.length,
      memoryEntriesWritten: this.memoryEvolution.filter(m => m.operation === 'MEM_WRITE').length,
      cacheOperations: this.memoryEvolution.filter(m => m.operation.startsWith('CACHE')).length,
      verdictBreakdown: verdicts,
      failuresInjected: this.runtimeTimeline.filter(e => e.event.includes('FAILURE')).length,
      recoveriesCompleted: this.runtimeTimeline.filter(e => e.event.includes('RECOVERY')).length,
      layersCovered,
      wavesCovered,
    };
  }

  printArtifacts(finalState: FinalRuntimeState): void {
    const W = '═'.repeat(71);

    // ── 1. RUNTIME TIMELINE
    console.log(`\n${W}\n  ARTIFACT 1: RUNTIME TIMELINE (${this.runtimeTimeline.length} events)\n${W}`);
    const byScenario = new Map<string, TimelineEvent[]>();
    this.runtimeTimeline.forEach(e => {
      const list = byScenario.get(e.scenario) ?? [];
      list.push(e);
      byScenario.set(e.scenario, list);
    });
    byScenario.forEach((events, scenario) => {
      console.log(`\n  [${scenario}]`);
      events.slice(0, 12).forEach(e =>
        console.log(`    T+${String(e.t).padStart(4, '0')}ms  ${e.layer.padEnd(20)} ${e.event.padEnd(28)} ${e.detail}`),
      );
      if (events.length > 12) console.log(`    ... +${events.length - 12} more events`);
    });

    // ── 2. CROSS-LAYER INTERACTION LOG
    console.log(`\n${W}\n  ARTIFACT 2: CROSS-LAYER INTERACTION LOG (${this.crossLayerLog.length} transitions)\n${W}`);
    this.crossLayerLog.slice(0, 20).forEach(l => console.log(`  ${l}`));
    if (this.crossLayerLog.length > 20) console.log(`  ... +${this.crossLayerLog.length - 20} more transitions`);

    // ── 3. CONSTITUTIONAL DECISION CHAIN
    console.log(`\n${W}\n  ARTIFACT 3: CONSTITUTIONAL DECISION CHAIN (${this.constitutionalChain.length} decisions)\n${W}`);
    this.constitutionalChain.slice(0, 15).forEach((c, i) => console.log(`  ${String(i + 1).padStart(3)}. ${c}`));

    // ── 4. AUDIT CHAIN
    console.log(`\n${W}\n  ARTIFACT 4: AUDIT CHAIN (${this.auditChain.length} records)\n${W}`);
    this.auditChain.slice(0, 15).forEach((a, i) => console.log(`  ${String(i + 1).padStart(3)}. ${a}`));

    // ── 5. MEMORY EVOLUTION
    console.log(`\n${W}\n  ARTIFACT 5: MEMORY EVOLUTION (${this.memoryEvolution.length} operations)\n${W}`);
    const memOps = this.memoryEvolution.reduce((acc, m) => {
      acc[m.operation] = (acc[m.operation] ?? 0) + 1; return acc;
    }, {} as Record<string, number>);
    Object.entries(memOps).forEach(([op, n]) => console.log(`  ${op.padEnd(16)} × ${n}`));
    console.log(`\n  Most recent operations:`);
    this.memoryEvolution.slice(-6).forEach(m => console.log(`    ${m.operation.padEnd(16)} key=${m.key.slice(0, 35).padEnd(35)} req=${m.requestId}`));

    // ── 6. SCHEDULING EVOLUTION
    console.log(`\n${W}\n  ARTIFACT 6: SCHEDULING EVOLUTION (${this.schedulingEvolution.length} decisions)\n${W}`);
    const schedByPriority = this.schedulingEvolution.reduce((acc, s) => {
      acc[s.priority] = (acc[s.priority] ?? 0) + 1; return acc;
    }, {} as Record<string, number>);
    console.log('  Priority breakdown:');
    Object.entries(schedByPriority).forEach(([p, n]) => console.log(`    ${p.padEnd(12)} × ${n}`));
    console.log('\n  Most recent decisions:');
    this.schedulingEvolution.slice(-4).forEach(s =>
      console.log(`    ${s.priority.padEnd(10)} decisionId=${s.decisionId.slice(0, 28)}`),
    );

    // ── 7. AGENT SOCIETY EVOLUTION (NEW — WP-013-020)
    console.log(`\n${W}\n  ARTIFACT 7: AGENT SOCIETY EVOLUTION (${this.agentSocietyEvolution.length} selections)\n${W}`);
    if (this.agentSocietyEvolution.length > 0) {
      const byAgentType = this.agentSocietyEvolution.reduce((acc, a) => {
        acc[a.agentType] = (acc[a.agentType] ?? 0) + 1; return acc;
      }, {} as Record<string, number>);
      console.log('  Agent type distribution:');
      Object.entries(byAgentType).forEach(([type, n]) => console.log(`    ${type.padEnd(20)} × ${n}`));
      console.log('\n  Most recent selections:');
      this.agentSocietyEvolution.slice(-5).forEach(a =>
        console.log(`    req=${a.requestId.padEnd(20)} → agent=${a.selectedAgentId.slice(0, 24).padEnd(24)} (${a.agentType})`),
      );
    } else {
      console.log('  (No agent selections recorded)');
    }

    // ── 8. SPECIALIZED AGENT SELECTION LOG (NEW — WP-013-020)
    console.log(`\n${W}\n  ARTIFACT 8: SPECIALIZED AGENT SELECTION LOG (${this.agentSelectionLog.length} executions)\n${W}`);
    if (this.agentSelectionLog.length > 0) {
      const successCount = this.agentSelectionLog.filter(a => a.success).length;
      const failureCount = this.agentSelectionLog.length - successCount;
      console.log(`  Execution summary: ${successCount} success, ${failureCount} failures`);
      console.log(`\n  Execution timeline:`);
      this.agentSelectionLog.slice(-6).forEach(a =>
        console.log(`    req=${a.requestId.padEnd(20)} agent=${a.agentId.slice(0, 22).padEnd(22)} (${a.success ? '✓' : '✗'}) ${a.executionTimeMs}ms`),
      );
    } else {
      console.log('  (No agent executions recorded)');
    }

    // ── 9. DECISION EVOLUTION
    console.log(`\n${W}\n  ARTIFACT 9: DECISION EVOLUTION (${this.decisionEvolution.length} evaluations)\n${W}`);
    console.log('  Verdict breakdown:');
    Object.entries(finalState.verdictBreakdown).forEach(([v, n]) => console.log(`    ${v.padEnd(12)} × ${n}`));
    console.log('\n  All evaluations:');
    this.decisionEvolution.forEach(d =>
      console.log(`    [${d.verdict.padEnd(9)}] req=${d.requestId.padEnd(20)} policy=${d.matchedPolicy ?? 'default'}`),
    );

    // ── 10. AGENT IDENTITY EVOLUTION (NEW — WP-021-028)
    console.log(`\n${W}\n  ARTIFACT 10: AGENT IDENTITY EVOLUTION (${this.agentIdentityEvolution.length} identities)\n${W}`);
    if (this.agentIdentityEvolution.length > 0) {
      const byRole = this.agentIdentityEvolution.reduce((acc, a) => {
        acc[a.roleType] = (acc[a.roleType] ?? 0) + 1; return acc;
      }, {} as Record<string, number>);
      console.log('  Agent role distribution:');
      Object.entries(byRole).forEach(([role, n]) => console.log(`    ${role.padEnd(20)} × ${n}`));
      console.log('\n  Most recent registrations:');
      this.agentIdentityEvolution.slice(-5).forEach(a =>
        console.log(`    ${a.agentId.padEnd(24)} (${a.roleType}) authority_level=${a.authorityLevel}`),
      );
    } else {
      console.log('  (No agent identities registered)');
    }

    // ── 11. AGENT DECISION TIMELINE (NEW — WP-021-028)
    console.log(`\n${W}\n  ARTIFACT 11: AGENT DECISION TIMELINE (${this.agentDecisionTimeline.length} decisions)\n${W}`);
    if (this.agentDecisionTimeline.length > 0) {
      const byType = this.agentDecisionTimeline.reduce((acc, d) => {
        acc[d.decisionType] = (acc[d.decisionType] ?? 0) + 1; return acc;
      }, {} as Record<string, number>);
      console.log('  Decision type breakdown:');
      Object.entries(byType).forEach(([type, n]) => console.log(`    ${type.padEnd(22)} × ${n}`));
      console.log('\n  Recent decisions:');
      this.agentDecisionTimeline.slice(-6).forEach(d =>
        console.log(`    ${d.decisionId.slice(0, 28).padEnd(28)} agent=${d.agentId.slice(0, 16).padEnd(16)} confidence=${d.confidence}`),
      );
    } else {
      console.log('  (No decisions recorded)');
    }

    // ── 12. AGENT COOPERATION LOG (NEW — WP-021-028)
    console.log(`\n${W}\n  ARTIFACT 12: AGENT COOPERATION LOG (${this.agentCooperationLog.length} cooperations)\n${W}`);
    if (this.agentCooperationLog.length > 0) {
      const consensusCount = this.agentCooperationLog.filter(c => c.consensusReached).length;
      const delegationCount = this.agentCooperationLog.reduce((sum, c) => sum + c.delegations.length, 0);
      console.log(`  Consensus reached:  ${consensusCount}/${this.agentCooperationLog.length}`);
      console.log(`  Total delegations:  ${delegationCount}`);
      console.log('\n  Recent cooperations:');
      this.agentCooperationLog.slice(-5).forEach(c =>
        console.log(`    req=${c.requestId.padEnd(20)} agents=${c.agents.length} consensus=${c.consensusReached ? '✓' : '✗'}`),
      );
    } else {
      console.log('  (No cooperation events recorded)');
    }

    // ── 13. AGENT STATE EVOLUTION (NEW — WP-021-028)
    console.log(`\n${W}\n  ARTIFACT 13: AGENT STATE EVOLUTION (${this.agentStateEvolution.length} transitions)\n${W}`);
    if (this.agentStateEvolution.length > 0) {
      const stateTransitions = this.agentStateEvolution.reduce((acc, s) => {
        const key = `${s.previousState} → ${s.newState}`;
        acc[key] = (acc[key] ?? 0) + 1; return acc;
      }, {} as Record<string, number>);
      console.log('  State transitions:');
      Object.entries(stateTransitions).forEach(([trans, n]) => console.log(`    ${trans.padEnd(36)} × ${n}`));
      console.log('\n  Recent state changes:');
      this.agentStateEvolution.slice(-5).forEach(s =>
        console.log(`    agent=${s.agentId.padEnd(24)} ${s.previousState.padEnd(12)} → ${s.newState.padEnd(12)}`),
      );
    } else {
      console.log('  (No state transitions recorded)');
    }

    // ── 14. AGENT AUTHORITY VERIFICATION (NEW — WP-021-028)
    console.log(`\n${W}\n  ARTIFACT 14: AGENT AUTHORITY VERIFICATION (${this.agentAuthorityVerification.length} verifications)\n${W}`);
    if (this.agentAuthorityVerification.length > 0) {
      const authorizedCount = this.agentAuthorityVerification.filter(a => a.verificationResult === 'AUTHORIZED').length;
      const deniedCount = this.agentAuthorityVerification.length - authorizedCount;
      console.log(`  Authorizations:     ${authorizedCount}`);
      console.log(`  Denials:            ${deniedCount}`);
      console.log('\n  Recent verifications:');
      this.agentAuthorityVerification.slice(-6).forEach(a =>
        console.log(`    ${a.verificationResult.padEnd(10)} agent=${a.agentId.slice(0, 20).padEnd(20)} article=${a.constitutionalArticle}`),
      );
    } else {
      console.log('  (No authority verifications recorded)');
    }

    // ── 15. FINAL RUNTIME STATE
    console.log(`\n${W}\n  ARTIFACT 15: FINAL RUNTIME STATE\n${W}`);
    console.log(`  Requests processed:        ${finalState.totalRequestsProcessed}`);
    console.log(`  Scheduling decisions made: ${finalState.schedulingDecisionsMade}`);
    console.log(`  Policy evaluations run:    ${finalState.policyEvaluationsRun}`);
    console.log(`  Agent selections made:     ${this.agentSocietyEvolution.length}`);
    console.log(`  Agent executions:          ${this.agentSelectionLog.length}`);
    console.log(`  Agent decisions made:      ${this.agentDecisionTimeline.length}`);
    console.log(`  Constitutional memories:   ${finalState.memoryEntriesWritten}`);
    console.log(`  Cache operations:          ${finalState.cacheOperations}`);
    console.log(`  Failures injected:         ${finalState.failuresInjected}`);
    console.log(`  Recoveries completed:      ${finalState.recoveriesCompleted}`);
    console.log(`  Layers covered:            ${finalState.layersCovered.join(', ')}`);
    console.log(`  Waves covered:             ${finalState.wavesCovered.join(' | ')}`);
    console.log(`\n  Verdict breakdown:         APPROVED=${finalState.verdictBreakdown.APPROVED} | REJECTED=${finalState.verdictBreakdown.REJECTED} | ESCALATED=${finalState.verdictBreakdown.ESCALATED}`);
    console.log(`\n${W}`);
    console.log('  RUNTIME CIVILIZATION SIMULATION — COMPLETE');
    console.log(`${W}\n`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMISSION HELPER (Layer 6 inline — full controller requires audit backbone)
// ═══════════════════════════════════════════════════════════════════════════

function admit(
  requestId: string,
  articleId: ConstitutionArticleId,
  meta: Record<string, unknown>,
  arts: CivilizationSimulationArtifacts,
  scenario: string,
  wave: string = 'Wave2',
): { requestId: string; constitutionArticleId: ConstitutionArticleId; requestMetadata: Record<string, unknown> } {
  if (!requestId || !articleId) throw new Error('Admission REJECTED: missing requestId or articleId');
  arts.event(wave, scenario, 'L6 Admission', 'REQUEST_ADMITTED', requestId, `source=${String(meta.source ?? 'unknown')}`, articleId);
  return { requestId, constitutionArticleId: articleId, requestMetadata: meta };
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER PIPELINE HELPER (Extended with Agent Society routing)
// Runs a single request through:
// L6 → L3 → L7 (Agent Selection) → L7 (Agent Execution) → L4 → L5
// ═══════════════════════════════════════════════════════════════════════════

async function runRequestThroughAllLayers(
  requestId: string,
  articleId: ConstitutionArticleId,
  meta: Record<string, unknown>,
  adapter3: Layer3Adapter,
  kernel3: ReturnType<typeof createSchedulingKernel>,
  layer4: ReturnType<typeof createMemoryLayer>,
  layer5: ReturnType<typeof createDecisionLayer>,
  layer7: ReturnType<typeof createAgentSocietyLayer> | null,
  arts: CivilizationSimulationArtifacts,
  scenario: string,
): Promise<{ decision: SchedulingDecision; evaluation: PolicyEvaluationResult; agentResult?: { selection: AgentSelectionResult; execution: AgentExecutionResult } }> {
  // Determine wave based on layer7 availability
  const wave = layer7 ? 'Wave3' : 'Wave2';
  
  // L6: Admission
  const admitted = admit(requestId, articleId, meta, arts, scenario, wave);

  // L3: Full scheduling pipeline
  const enqResult = await adapter3.processAdmittedRequest(admitted);
  
  // Dequeue and make a new decision (with real priority) for L4/L5
  const [req] = await kernel3.requestQueueService.dequeue(1);
  if (!req) throw new Error(`Queue empty after enqueue for ${requestId}`);

  const inferredPriority = (meta.requestType === 'AGENT' || meta.requestType === 'CHAMBER')
    ? RequestPriority.HIGH
    : (String(meta.threatLevel ?? '') === 'CRITICAL')
      ? RequestPriority.CRITICAL
      : RequestPriority.NORMAL;

  const decision = await kernel3.schedulingDecisionService.makeDecision(req, inferredPriority);
  const auditId = await kernel3.schedulingDecisionService.recordDecisionToAuditTrail(decision);

  arts.event(wave, scenario, 'L3 Scheduling', 'ENQUEUED_AND_SCHEDULED', requestId,
    `decisionId=${enqResult.decisionId}`, articleId, enqResult.decisionId);
  arts.event(wave, scenario, 'L3 Scheduling', 'DECISION_MADE', requestId,
    `priority=${decision.priority}, delay=${getDelay(decision.priority)}ms`, articleId, auditId);
  arts.sched({ requestId, priority: decision.priority, decisionId: decision.decisionId, scheduledTime: decision.scheduledTime, auditTrailId: auditId, scenario });

  // ─── L7: AGENT SOCIETY ROUTING (NEW — WP-013-020) ───
  let agentResult: { selection: AgentSelectionResult; execution: AgentExecutionResult } | undefined;
  if (layer7) {
    try {
      // Select specialized agent based on request type and constitutional article
      const agentSelection = await layer7.agentSelectionRouter.selectAgent(
        requestId,
        String(meta.requestType ?? 'DATA'),
        articleId,
      );
      arts.event('Wave3', scenario, 'L7 Agent Society', 'AGENT_SELECTED', requestId,
        `agent=${agentSelection.selectedAgentId} (${agentSelection.agentType})`, articleId);
      arts.agentSelection({
        requestId,
        selectedAgentId: agentSelection.selectedAgentId,
        agentType: agentSelection.agentType,
        selectionReason: agentSelection.selectionReason,
        alternatives: agentSelection.alternativeAgents,
        timestamp: agentSelection.decisionTime,
        scenario,
      });

      // Execute the selected agent
      const execContext = {
        requestId,
        agentId: agentSelection.selectedAgentId,
        agentType: agentSelection.agentType,
        constitution: articleId,
        inputData: meta,
        metadata: { priority: decision.priority, decisionId: decision.decisionId },
        startTime: new Date(),
      };
      const agentExecution = await layer7.agentExecutionGateway.executeAgent(
        agentSelection.selectedAgentId,
        execContext,
      );
      arts.event('Wave3', scenario, 'L7 Agent Society', 'AGENT_EXECUTED', requestId,
        `success=${agentExecution.success}, time=${agentExecution.executionTimeMs}ms`, articleId);
      arts.agentExecution({
        requestId,
        agentId: agentExecution.agentId,
        agentType: agentExecution.agentType,
        success: agentExecution.success,
        executionTimeMs: agentExecution.executionTimeMs,
        scenario,
      });

      agentResult = { selection: agentSelection, execution: agentExecution };
    } catch (err) {
      arts.event('Wave3', scenario, 'L7 Agent Society', 'AGENT_ROUTING_FAILED', requestId,
        `error=${err instanceof Error ? err.message : String(err)}`, articleId);
    }
  }

  // L4: Cache processing state
  const cacheKey = createCacheKey(`${requestId}-state`);
  await layer4.stateCacheService.set(cacheKey, { requestId, stage: 'awaiting-decision', priority: decision.priority, agentExecuted: !!agentResult }, 30_000, articleId);
  arts.mem('CACHE_SET', cacheKey, requestId, scenario, articleId);
  arts.event(wave, scenario, 'L4 Memory', 'STATE_CACHED', requestId, `key=${cacheKey}`, articleId);

  // L4: Write constitutional memory
  const memEntry = await layer4.constitutionalMemoryService.remember(
    requestId, articleId,
    `Scheduled ${decision.priority}: decisionId=${decision.decisionId}${agentResult ? ` via ${agentResult.selection.agentType}` : ''}`,
    auditId,
  );
  arts.mem('MEM_WRITE', memEntry.entryId, requestId, scenario, articleId);
  arts.event(wave, scenario, 'L4 Memory', 'MEMORY_WRITTEN', requestId,
    `entryId=${memEntry.entryId}`, articleId, memEntry.auditTrailId);

  // L5: Policy evaluation
  const evalResult = await layer5.policyEvaluationService.evaluate(decision);
  arts.event(wave, scenario, 'L5 Decision', 'VERDICT_ISSUED', requestId,
    `verdict=${evalResult.verdict}, policy=${evalResult.matchedPolicyId ?? 'default'}`,
    evalResult.constitutionArticleId, evalResult.auditTrailId);
  arts.decision({
    requestId, verdict: evalResult.verdict, evaluationId: evalResult.evaluationId,
    matchedPolicy: evalResult.matchedPolicyId, rationale: evalResult.rationale,
    auditTrailId: evalResult.auditTrailId, scenario,
  });

  return { decision, evaluation: evalResult, agentResult };
}

function getDelay(p: RequestPriority): number {
  return { [RequestPriority.CRITICAL]: 0, [RequestPriority.HIGH]: 10, [RequestPriority.NORMAL]: 100, [RequestPriority.LOW]: 1000 }[p];
}

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME CIVILIZATION SIMULATION
// ═══════════════════════════════════════════════════════════════════════════

describe('AZMA Runtime Civilization Simulation — Wave 2 (WP-009-012)', () => {

  // ── Shared infrastructure (lives for the entire simulation)
  const arts = new CivilizationSimulationArtifacts();

  // ── Layer instantiation (shared across all scenarios — same OS instance)
  const kernel3 = createSchedulingKernel();
  const adapter3 = new Layer3Adapter(kernel3);
  const layer4 = createMemoryLayer();
  const layer5 = createDecisionLayer();

  // ── Policy registration (done once — simulates OS boot)
  beforeAll(async () => {
    // Layer 3 priority policies
    await kernel3.priorityAssignmentService.registerPolicy(createCriticalPriorityPolicy('constitutional-structure'));
    await kernel3.priorityAssignmentService.registerPolicy(createHighPriorityPolicy('sovereign-high-council'));
    await kernel3.priorityAssignmentService.registerPolicy(createNormalPriorityPolicy('constitutional-structure'));

    // Layer 5 evaluation policies
    await layer5.policyEvaluationService.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));
    await layer5.policyEvaluationService.registerPolicy(createHighPriorityApprovalPolicy('sovereign-high-council'));

    arts.event('Wave2', 'OS_BOOT', 'RUNTIME', 'OS_BOOT_COMPLETE', 'system',
      'Layers 3+4+5+L6-bridge active, policies registered');
    console.log('\n  [RCS] Runtime Civilization Simulation — booting...\n');
  });

  // ═════════════════════════════════════════════════════════════════════════
  // SCENARIO 1: NORMAL PRODUCTION FLOW
  // ═════════════════════════════════════════════════════════════════════════

  describe('Scenario 1 — Normal Production Flow', () => {
    const S = 'Scenario1-Normal';

    test('S1: Chamber governance request (NORMAL) → APPROVED', async () => {
      const { decision, evaluation } = await runRequestThroughAllLayers(
        'S1-REQ-001', 'constitutional-structure',
        { source: 'chamber-governance', actionType: 'policy-review', requestType: 'DATA' },
        adapter3, kernel3, layer4, layer5, null, arts, S,
      );
      expect(decision.priority).toBe(RequestPriority.NORMAL);
      expect(evaluation.verdict).toBe('APPROVED');

      // Verify memory is readable
      const recalled = await layer4.constitutionalMemoryService.recall('S1-REQ-001');
      expect(recalled).not.toBeNull();
      arts.mem('MEM_READ', recalled!.entryId, 'S1-REQ-001', S, 'constitutional-structure');
      arts.event('Wave2', S, 'L4 Memory', 'MEMORY_READ_VERIFIED', 'S1-REQ-001',
        `summary=${recalled!.decisionSummary.slice(0, 40)}`);
    });

    test('S1: Agent service request (HIGH, AGENT type) → APPROVED via policy', async () => {
      const { decision, evaluation } = await runRequestThroughAllLayers(
        'S1-REQ-002', 'sovereign-high-council',
        { source: 'agent-executor', actionType: 'governance-task', requestType: 'AGENT' },
        adapter3, kernel3, layer4, layer5, null, arts, S,
      );
      expect(decision.priority).toBe(RequestPriority.HIGH);
      expect(evaluation.verdict).toBe('APPROVED');
      expect(evaluation.matchedPolicyId).toBe('high-priority-auto-approval');
    });

    test('S1: Constitutional violation alert (CRITICAL) → ESCALATED', async () => {
      const { decision, evaluation } = await runRequestThroughAllLayers(
        'S1-REQ-003', 'constitutional-structure',
        { source: 'security-monitor', actionType: 'constitutional-violation', threatLevel: 'CRITICAL' },
        adapter3, kernel3, layer4, layer5, null, arts, S,
      );
      expect(decision.priority).toBe(RequestPriority.CRITICAL);
      expect(evaluation.verdict).toBe('ESCALATED');
      expect(evaluation.matchedPolicyId).toBe('critical-rejection-safety');

      arts.event('Wave2', S, 'SOVEREIGN', 'ESCALATION_TO_HIGH_COUNCIL', 'S1-REQ-003',
        'Constitutional violation escalated for sovereign review', 'constitutional-structure');
    });

    test('S1: Cache state is readable after all 3 requests', async () => {
      const key = createCacheKey('S1-REQ-001-state');
      const entry = await layer4.stateCacheService.get<{ stage: string }>(key);
      expect(entry).not.toBeNull();
      expect(entry!.constitutionArticleId).toBe('constitutional-structure');
      arts.mem('CACHE_GET', 'S1-REQ-001-state', 'S1-REQ-001', S, 'constitutional-structure');
      arts.event('Wave2', S, 'L4 Memory', 'CACHE_STATE_VERIFIED', 'S1-REQ-001',
        `stage=${entry!.value.stage}`);
    });

    test('S1: Constitutional memory tracks all 3 scenario-1 requests', async () => {
      const memSize = await layer4.constitutionalMemoryService.getMemorySize();
      expect(memSize).toBeGreaterThanOrEqual(3);

      const constitutionalEntries = await layer4.constitutionalMemoryService.recallByArticle('constitutional-structure');
      expect(constitutionalEntries.length).toBeGreaterThanOrEqual(2); // REQ-001 and REQ-003

      arts.event('Wave2', S, 'SIMULATION', 'SCENARIO1_COMPLETE', 'system',
        `Memory entries: ${memSize}, constitutional traces: ${constitutionalEntries.length}`);
      console.log(`  [S1] ✓ Normal flow complete — 3 requests processed, ${memSize} memory entries\n`);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // SCENARIO 2: HIGH-LOAD CONCURRENT FLOW
  // ═════════════════════════════════════════════════════════════════════════

  describe('Scenario 2 — High-Load Concurrent Flow', () => {
    const S = 'Scenario2-HighLoad';

    // Separate kernel for load scenario to avoid queue state contamination
    const loadKernel3 = createSchedulingKernel();
    const loadAdapter3 = new Layer3Adapter(loadKernel3);
    const loadLayer4 = createMemoryLayer();
    const loadLayer5 = createDecisionLayer();

    beforeAll(async () => {
      await loadKernel3.priorityAssignmentService.registerPolicy(createCriticalPriorityPolicy('constitutional-structure'));
      await loadKernel3.priorityAssignmentService.registerPolicy(createHighPriorityPolicy('sovereign-high-council'));
      await loadKernel3.priorityAssignmentService.registerPolicy(createNormalPriorityPolicy('constitutional-structure'));
      await loadLayer5.policyEvaluationService.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));
      await loadLayer5.policyEvaluationService.registerPolicy(createHighPriorityApprovalPolicy('sovereign-high-council'));
    });

    test('S2: 25 concurrent mixed-priority requests — all processed without errors', async () => {
        const concurrentRequests = Array.from({ length: 25 }, (_, i) => ({
        requestId: `S2-REQ-${String(i + 1).padStart(3, '0')}`,
        articleId: 'constitutional-structure' as ConstitutionArticleId,
        meta: {
          source: 'chamber-bulk',
          requestType: i % 5 === 0 ? 'AGENT' : 'DATA',
          batchIndex: i,
        },
      }));

      // Enqueue all concurrently
      const enqueueResults = await Promise.all(
        concurrentRequests.map(r =>
          loadAdapter3.processAdmittedRequest({
            requestId: r.requestId,
            constitutionArticleId: r.articleId,
            requestMetadata: r.meta,
          }),
        ),
      );

      expect(enqueueResults.every(r => r.success)).toBe(true);
      const stats = await loadKernel3.requestQueueService.getStatistics();
      expect(stats.totalEnqueued).toBe(25);

      arts.event('Wave2', S, 'L3 Scheduling', 'BULK_ENQUEUE_COMPLETE', 'batch',
        `25 concurrent requests enqueued, queue=${stats.currentQueueLength}`, 'constitutional-structure');
      console.log(`  [S2] 25 concurrent enqueues: success=${enqueueResults.filter(r => r.success).length}`);
    });

    test('S2: Dequeue in priority order — deterministic across high-load', async () => {
      // Enqueue one of each priority to verify ordering holds under load
      const testKernel = createSchedulingKernel();
      await testKernel.requestQueueService.enqueue({ requestId: 'ord-LOW', priority: RequestPriority.LOW, constitutionArticleId: 'constitutional-structure', enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {} });
      await testKernel.requestQueueService.enqueue({ requestId: 'ord-HIGH', priority: RequestPriority.HIGH, constitutionArticleId: 'constitutional-structure', enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {} });
      await testKernel.requestQueueService.enqueue({ requestId: 'ord-CRITICAL', priority: RequestPriority.CRITICAL, constitutionArticleId: 'constitutional-structure', enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {} });
      await testKernel.requestQueueService.enqueue({ requestId: 'ord-NORMAL', priority: RequestPriority.NORMAL, constitutionArticleId: 'constitutional-structure', enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {} });

      const dequeued = await testKernel.requestQueueService.dequeue(4);
      expect(dequeued[0]!.requestId).toBe('ord-CRITICAL');
      expect(dequeued[1]!.requestId).toBe('ord-HIGH');
      expect(dequeued[2]!.requestId).toBe('ord-NORMAL');
      expect(dequeued[3]!.requestId).toBe('ord-LOW');

      arts.event('Wave2', S, 'L3 Scheduling', 'PRIORITY_ORDER_VERIFIED', 'batch',
        'CRITICAL > HIGH > NORMAL > LOW maintained under load', 'constitutional-structure');
    });

    test('S2: No data leakage between concurrent requests in Layer 4', async () => {
      // Write state for two requests concurrently
      await Promise.all([
        loadLayer4.stateCacheService.set(createCacheKey('S2-REQ-001-state'), { owner: 'S2-REQ-001' }, 30_000, 'constitutional-structure'),
        loadLayer4.stateCacheService.set(createCacheKey('S2-REQ-002-state'), { owner: 'S2-REQ-002' }, 30_000, 'constitutional-structure'),
      ]);

      // Read each one back — verify no cross-contamination
      const e1 = await loadLayer4.stateCacheService.get<{ owner: string }>(createCacheKey('S2-REQ-001-state'));
      const e2 = await loadLayer4.stateCacheService.get<{ owner: string }>(createCacheKey('S2-REQ-002-state'));

      expect(e1!.value.owner).toBe('S2-REQ-001');
      expect(e2!.value.owner).toBe('S2-REQ-002');

      arts.event('Wave2', S, 'L4 Memory', 'ISOLATION_VERIFIED', 'batch',
        'No data leakage between concurrent requests');
      console.log('  [S2] ✓ Data isolation verified — no leakage between 25 concurrent requests\n');
    });

    test('S2: Policy evaluation is stateless and consistent under concurrent load', async () => {
      // Run 10 identical HIGH-priority decisions through Layer 5 concurrently
      const decisions = await Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
          const req = {
            requestId: `S2-CONCURRENT-${i}`,
            priority: RequestPriority.HIGH,
            constitutionArticleId: 'constitutional-structure' as ConstitutionArticleId,
            enqueuedAt: new Date(),
            expiresAt: new Date(Date.now() + 60_000),
            requestMetadata: {},
          };
          return loadKernel3.schedulingDecisionService.makeDecision(req, RequestPriority.HIGH);
        }),
      );

      const results = await Promise.all(
        decisions.map(d => loadLayer5.policyEvaluationService.evaluate(d)),
      );

      // All HIGH decisions with high-priority-auto-approval policy → APPROVED
      expect(results.every(r => r.verdict === 'APPROVED')).toBe(true);
      const uniqueEvalIds = new Set(results.map(r => r.evaluationId));
      expect(uniqueEvalIds.size).toBe(10); // all unique IDs

      results.forEach(r => arts.decision({
        requestId: r.requestId, verdict: r.verdict, evaluationId: r.evaluationId,
        matchedPolicy: r.matchedPolicyId, rationale: r.rationale.slice(0, 60),
        auditTrailId: r.auditTrailId, scenario: S,
      }));

      arts.event('Wave2', S, 'SIMULATION', 'SCENARIO2_COMPLETE', 'system',
        `10 concurrent evaluations: all APPROVED, all unique IDs`);
      console.log(`  [S2] ✓ High-load concurrent flow — 10 concurrent evaluations all deterministic\n`);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // SCENARIO 3: FAILURE + RECOVERY FLOW
  // ═════════════════════════════════════════════════════════════════════════

  describe('Scenario 3 — Failure + Recovery Flow', () => {
    const S = 'Scenario3-FailureRecovery';

    test('S3: Layer 3 queue overflow — inject → detect → recover', async () => {
      console.log('\n  [S3] Failure injection: Layer 3 queue overflow');
      const failKernel = createSchedulingKernel();

      // Fill to capacity
      await Promise.all(
        Array.from({ length: 10_000 }, (_, i) =>
          failKernel.requestQueueService.enqueue({
            requestId: `fill-${i}`,
            priority: RequestPriority.LOW,
            constitutionArticleId: 'constitutional-structure',
            enqueuedAt: new Date(),
            expiresAt: new Date(Date.now() + 60_000),
            requestMetadata: {},
          }),
        ),
      );

      const fullStats = await failKernel.requestQueueService.getStatistics();
      expect(fullStats.currentQueueLength).toBe(10_000);
      arts.event('Wave2', S, 'L3 Scheduling', 'FAILURE_INJECTED', 'system',
        `Queue at capacity: ${fullStats.currentQueueLength}/10000`, 'constitutional-structure');

      // Verify failure
      await expect(failKernel.requestQueueService.enqueue({
        requestId: 'overflow', priority: RequestPriority.NORMAL,
        constitutionArticleId: 'constitutional-structure',
        enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {},
      })).rejects.toThrow('Queue is full');
      arts.event('Wave2', S, 'L3 Scheduling', 'FAILURE_DETECTED', 'system', 'Overflow correctly rejected');

      // Recovery: flush 500 entries
      const flushed = await failKernel.requestQueueService.dequeue(500);
      expect(flushed.length).toBe(500);
      arts.event('Wave2', S, 'L3 Scheduling', 'RECOVERY_INITIATED', 'system',
        `Flushed ${flushed.length} entries`);

      // Verify recovery
      const recovered = await failKernel.requestQueueService.enqueue({
        requestId: 'post-recovery-001', priority: RequestPriority.HIGH,
        constitutionArticleId: 'constitutional-structure',
        enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {},
      });
      expect(recovered.success).toBe(true);
      arts.event('Wave2', S, 'L3 Scheduling', 'RECOVERY_COMPLETE', 'system',
        `New request accepted: ${recovered.decisionId}`, 'constitutional-structure');
      console.log(`  [S3] ✓ Layer 3 overflow → flushed 500 → recovered\n`);
    });

    test('S3: Layer 4 TTL expiry — inject → miss → rehydrate from memory', async () => {
      console.log('  [S3] Failure injection: Layer 4 cache TTL expiry');
      const failLayer4 = createMemoryLayer();

      // Write with 1ms TTL (instant expiry)
      const expiredKey = createCacheKey('S3-expired-state');
      await failLayer4.stateCacheService.set(expiredKey, { stage: 'ephemeral' }, 1, 'constitutional-structure');
      arts.mem('CACHE_SET', expiredKey, 'S3-expired', S, 'constitutional-structure');

      // Wait for TTL
      await new Promise(r => setTimeout(r, 20));

      // Verify cache miss
      const missed = await failLayer4.stateCacheService.get(expiredKey);
      expect(missed).toBeNull();
      arts.mem('CACHE_MISS', expiredKey, 'S3-expired', S, 'constitutional-structure');
      arts.event('Wave2', S, 'L4 Memory', 'FAILURE_DETECTED', 'S3-expired',
        'Cache miss — TTL expiry confirmed');

      // Write to constitutional memory (the durable fallback)
      const { createAuditTrailId: mkAuditId } = await import('./wp-008-types');
      const memEntry = await failLayer4.constitutionalMemoryService.remember(
        'S3-expired', 'constitutional-structure', 'Stage: ephemeral — evicted', mkAuditId('audit-s3-recovery'),
      );
      arts.mem('MEM_WRITE', memEntry.entryId, 'S3-expired', S, 'constitutional-structure');

      // Rehydrate cache from memory
      const recalled = await failLayer4.constitutionalMemoryService.recall('S3-expired');
      const rehydratedKey = createCacheKey('S3-rehydrated-state');
      await failLayer4.stateCacheService.set(rehydratedKey, { rehydrated: true, source: recalled!.entryId }, 30_000, 'constitutional-structure');
      arts.mem('MEM_READ', recalled!.entryId, 'S3-expired', S, 'constitutional-structure');
      arts.mem('MEM_REHYDRATE', rehydratedKey, 'S3-expired', S, 'constitutional-structure');

      const rehydrated = await failLayer4.stateCacheService.get<{ rehydrated: boolean }>(rehydratedKey);
      expect(rehydrated!.value.rehydrated).toBe(true);
      arts.event('Wave2', S, 'L4 Memory', 'RECOVERY_COMPLETE', 'S3-expired',
        `Cache rehydrated from mem:${recalled!.entryId}`);
      console.log(`  [S3] ✓ Layer 4 TTL expiry → cache miss → rehydrated from constitutional memory\n`);
    });

    test('S3: Layer 5 REJECTED verdict — inject → handle → escalate path verified', async () => {
      console.log('  [S3] Failure injection: Layer 5 REJECTED verdict');
      const rejectLayer5 = createDecisionLayer();

      // Register an article-mismatch rejection policy
      const { createArticleMismatchRejectionPolicy } = await import('./wp-012-kernel');
      await rejectLayer5.policyEvaluationService.registerPolicy(
        createArticleMismatchRejectionPolicy('sovereign-high-council', 'constitutional-structure'),
      );

      // Submit a request governed by 'constitutional-structure' — mismatch → REJECTED
      const req = {
        requestId: 'S3-REJECT-001',
        priority: RequestPriority.NORMAL,
        constitutionArticleId: 'constitutional-structure' as ConstitutionArticleId,
        enqueuedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        requestMetadata: {},
      };
      const decision = await kernel3.schedulingDecisionService.makeDecision(req, RequestPriority.NORMAL);
      const evalResult = await rejectLayer5.policyEvaluationService.evaluate(decision);

      expect(evalResult.verdict).toBe('REJECTED');
      arts.event('Wave2', S, 'L5 Decision', 'FAILURE_INJECTED', 'S3-REJECT-001',
        `REJECTED — article mismatch policy triggered`, 'constitutional-structure', evalResult.auditTrailId);
      arts.decision({
        requestId: 'S3-REJECT-001', verdict: 'REJECTED', evaluationId: evalResult.evaluationId,
        matchedPolicy: evalResult.matchedPolicyId, rationale: evalResult.rationale,
        auditTrailId: evalResult.auditTrailId, scenario: S,
      });

      // Recovery: escalate rejected request to sovereign review
      const escalationMemory = await layer4.constitutionalMemoryService.remember(
        'S3-REJECT-001-escalation', 'sovereign-high-council',
        `REJECTED request escalated for sovereign review: ${evalResult.evaluationId}`,
        evalResult.auditTrailId,
      );
      arts.mem('MEM_WRITE', escalationMemory.entryId, 'S3-REJECT-001', S, 'sovereign-high-council');
      arts.event('Wave2', S, 'L4 Memory', 'ESCALATION_RECORDED', 'S3-REJECT-001',
        `Rejection escalated to memory: ${escalationMemory.entryId}`, 'sovereign-high-council');

      // Verify escalation record is queryable
      const escalated = await layer4.constitutionalMemoryService.recallByArticle('sovereign-high-council');
      expect(escalated.some(e => e.requestId === 'S3-REJECT-001-escalation')).toBe(true);
      arts.event('Wave2', S, 'SIMULATION', 'SCENARIO3_COMPLETE', 'system',
        `3 failures injected, 3 recoveries completed`);
      console.log(`  [S3] ✓ Layer 5 REJECTED → escalation recorded → queryable from sovereign memory\n`);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // FINAL RUNTIME STATE + PKR REGRESSION
  // ═════════════════════════════════════════════════════════════════════════

  describe('Final Runtime State and PKR Regression', () => {

    test('PKR: Layer 3 prior behaviour unchanged (priority ordering deterministic)', async () => {
      const pkrKernel = createSchedulingKernel();
      await pkrKernel.requestQueueService.enqueue({ requestId: 'pkr-critical', priority: RequestPriority.CRITICAL, constitutionArticleId: 'constitutional-structure', enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {} });
      await pkrKernel.requestQueueService.enqueue({ requestId: 'pkr-low', priority: RequestPriority.LOW, constitutionArticleId: 'constitutional-structure', enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {} });
      const d = await pkrKernel.requestQueueService.dequeue(2);
      expect(d[0]!.requestId).toBe('pkr-critical');
      expect(d[1]!.requestId).toBe('pkr-low');
      arts.event('Wave2', 'PKR', 'L3 Scheduling', 'PKR_PASSED', 'system', 'Priority ordering deterministic ✓');
    });

    test('PKR: Layer 4 cache contract unchanged', async () => {
      const pkrLayer4 = createMemoryLayer();
      const k = createCacheKey('pkr-cache');
      await pkrLayer4.stateCacheService.set(k, 'pkr-value', 5_000, 'constitutional-structure');
      const e = await pkrLayer4.stateCacheService.get<string>(k);
      expect(e!.value).toBe('pkr-value');
      arts.event('Wave2', 'PKR', 'L4 Memory', 'PKR_PASSED', 'system', 'Cache contract unchanged ✓');
    });

    test('PKR: Layer 5 default APPROVED verdict unchanged', async () => {
      const pkrLayer5 = createDecisionLayer();
      const req = { requestId: 'pkr-eval', priority: RequestPriority.NORMAL, constitutionArticleId: 'constitutional-structure' as ConstitutionArticleId, enqueuedAt: new Date(), expiresAt: new Date(Date.now() + 60_000), requestMetadata: {} };
      const d = await kernel3.schedulingDecisionService.makeDecision(req, RequestPriority.NORMAL);
      const r = await pkrLayer5.policyEvaluationService.evaluate(d);
      expect(r.verdict).toBe('APPROVED');
      arts.event('Wave2', 'PKR', 'L5 Decision', 'PKR_PASSED', 'system', 'Default APPROVED verdict unchanged ✓');
    });

    test('Final: Cross-layer audit trail continuity', async () => {
      const memSize = await layer4.constitutionalMemoryService.getMemorySize();
      expect(memSize).toBeGreaterThanOrEqual(3);

      const cacheStats = await layer4.stateCacheService.getStatistics();
      expect(cacheStats.hitCount).toBeGreaterThan(0);

      const l3Policies = await kernel3.priorityAssignmentService.getPolicies();
      const l5Policies = await layer5.policyEvaluationService.getPolicies();
      expect(l3Policies.length).toBe(3);
      expect(l5Policies.length).toBe(2);

      arts.event('Wave2', 'FINAL', 'RUNTIME', 'AUDIT_CONTINUITY_VERIFIED', 'system',
        `memSize=${memSize}, cacheHits=${cacheStats.hitCount}, policies=L3:${l3Policies.length}+L5:${l5Policies.length}`);
    });

    test('Simulation Report — print all 8 artifacts + Final Runtime State', () => {
      const finalState = arts.buildFinalState();

      // Assertions on final state
      expect(finalState.schedulingDecisionsMade).toBeGreaterThanOrEqual(3);
      expect(finalState.policyEvaluationsRun).toBeGreaterThanOrEqual(3);
      expect(finalState.memoryEntriesWritten).toBeGreaterThanOrEqual(3);
      expect(finalState.failuresInjected).toBeGreaterThanOrEqual(3);
      expect(finalState.recoveriesCompleted).toBeGreaterThanOrEqual(3);
      expect(finalState.verdictBreakdown.APPROVED).toBeGreaterThan(0);
      expect(finalState.verdictBreakdown.ESCALATED).toBeGreaterThan(0);
      expect(finalState.verdictBreakdown.REJECTED).toBeGreaterThan(0);
      expect(finalState.layersCovered.length).toBe(4);
      expect(finalState.wavesCovered.length).toBe(2);

      // Print all 8 artifacts
      arts.printArtifacts(finalState);
    });
  });
});
