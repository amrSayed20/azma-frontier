/**
 * AZMA OS – Qiyamah Chamber
 * File: agent-registry.ts
 *
 * Agent Registry
 * The sovereign registry responsible for exposing and managing
 * the local Genesis agent society.
 */

import { CanvasAgent } from './canvas-agent';
import { ImportAgent } from './import-agent';
import { ScriptAgent } from './script-agent';
import { PromptAgent } from './prompt-agent';
import { CharacterAgent } from './character-agent';
import { VoiceAgent } from './voice-agent';
import { StyleAgent } from './style-agent';
import { DurationAgent } from './duration-agent';
import { CostAgent } from './cost-agent';
import { BillingAgent } from './billing-agent';
import { RenderAgent } from './render-agent';
import { ProgressAgent } from './progress-agent';
import { QualityAgent } from './quality-agent';
import { MasterAgent } from './master-agent';
import { OrbitAgent } from './orbit-agent';

export interface AgentRegistry {
  readonly canvasAgent: CanvasAgent;
  readonly importAgent: ImportAgent;
  readonly scriptAgent: ScriptAgent;
  readonly promptAgent: PromptAgent;
  readonly characterAgent: CharacterAgent;
  readonly voiceAgent: VoiceAgent;
  readonly styleAgent: StyleAgent;
  readonly durationAgent: DurationAgent;
  readonly costAgent: CostAgent;
  readonly billingAgent: BillingAgent;
  readonly renderAgent: RenderAgent;
  readonly progressAgent: ProgressAgent;
  readonly qualityAgent: QualityAgent;
  readonly masterAgent: MasterAgent;
  readonly orbitAgent: OrbitAgent;
}

export function createAgentRegistry(): AgentRegistry {
  return {
    canvasAgent: new CanvasAgent(),
    importAgent: new ImportAgent(),
    scriptAgent: new ScriptAgent(),
    promptAgent: new PromptAgent(),
    characterAgent: new CharacterAgent(),
    voiceAgent: new VoiceAgent(),
    styleAgent: new StyleAgent(),
    durationAgent: new DurationAgent(),
    costAgent: new CostAgent(),
    billingAgent: new BillingAgent(),
    renderAgent: new RenderAgent(),
    progressAgent: new ProgressAgent(),
    qualityAgent: new QualityAgent(),
    masterAgent: new MasterAgent(),
    orbitAgent: new OrbitAgent(),
  };
}