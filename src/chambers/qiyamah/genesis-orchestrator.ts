/**
 * AZMA OS – Qiyamah Chamber
 * File: genesis-orchestrator.ts
 *
 * Genesis Orchestrator
 * The local sovereign conductor of the Qiyamah Chamber.
 * Coordinates all agents participating in the Genesis process.
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

export class GenesisOrchestrator {
  public readonly canvasAgent: CanvasAgent;
  public readonly importAgent: ImportAgent;
  public readonly scriptAgent: ScriptAgent;
  public readonly promptAgent: PromptAgent;
  public readonly characterAgent: CharacterAgent;
  public readonly voiceAgent: VoiceAgent;
  public readonly styleAgent: StyleAgent;
  public readonly durationAgent: DurationAgent;
  public readonly costAgent: CostAgent;
  public readonly billingAgent: BillingAgent;
  public readonly renderAgent: RenderAgent;
  public readonly progressAgent: ProgressAgent;
  public readonly qualityAgent: QualityAgent;
  public readonly masterAgent: MasterAgent;
  public readonly orbitAgent: OrbitAgent;

  constructor() {
    this.canvasAgent = new CanvasAgent();
    this.importAgent = new ImportAgent();
    this.scriptAgent = new ScriptAgent();
    this.promptAgent = new PromptAgent();
    this.characterAgent = new CharacterAgent();
    this.voiceAgent = new VoiceAgent();
    this.styleAgent = new StyleAgent();
    this.durationAgent = new DurationAgent();
    this.costAgent = new CostAgent();
    this.billingAgent = new BillingAgent();
    this.renderAgent = new RenderAgent();
    this.progressAgent = new ProgressAgent();
    this.qualityAgent = new QualityAgent();
    this.masterAgent = new MasterAgent();
    this.orbitAgent = new OrbitAgent();
  }
}