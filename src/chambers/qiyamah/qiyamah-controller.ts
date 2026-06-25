import { ChamberExportPayload, QiyamahInjectionContext } from '../../shared/contracts/bridge.types';
import { QiyamahPayloadTransformer } from '../../core/chamber-integration/bridge/payload-transformer';
import { QiyamahState, PlannerOutputContract } from './store/qiyamah-state';

// Dependency Injection Contract ensuring QiyamahController never hardcodes Planner logic
export interface PlannerAnalyzer {
  analyze(idea: string, prompt: string): Promise<PlannerOutputContract>;
}

export class QiyamahController {
  private state: QiyamahState;
  private plannerAnalyzer: PlannerAnalyzer | null = null;

  constructor(state: QiyamahState) {
    this.state = state;
  }

  public injectPlannerAnalyzer(analyzer: PlannerAnalyzer): void {
    this.plannerAnalyzer = analyzer;
  }

  public updateProjectInput(idea: string, basePrompt: string = ''): void {
    if (idea) this.state.setIdea(idea);
    if (basePrompt) this.state.setBasePrompt(basePrompt);
  }

  public receiveIntelligencePayload(payload: ChamberExportPayload): QiyamahInjectionContext {
    const context = QiyamahPayloadTransformer.transform(payload);
    
    this.state.setInjectedContext(context);
    
    const currentState = this.state.getState();
    const updatedPrompt = currentState.basePrompt 
      ? `${currentState.basePrompt}\n\n${context.creativePromptEnrichment}`
      : context.creativePromptEnrichment;
      
    this.state.setBasePrompt(updatedPrompt);

    return context;
  }

  public async generateProductionPlan(): Promise<void> {
    if (!this.plannerAnalyzer) {
      throw new Error("Cannot generate plan: PlannerAnalyzer dependency has not been injected.");
    }

    const currentState = this.state.getState();
    const finalIdea = currentState.idea || currentState.injectedContext?.injectedTopic;

    if (!finalIdea) {
      throw new Error("Cannot generate plan: Project idea or injected topic is missing.");
    }

    this.state.setStatus('analyzing');

    try {
      const output = await this.plannerAnalyzer.analyze(finalIdea, currentState.basePrompt);
      this.state.setPlannerOutput(output);
    } catch (error) {
      this.state.setStatus('idle');
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public approveProject(): void {
    const currentState = this.state.getState();
    
    if (currentState.status !== 'planned' || !currentState.plannerOutput) {
      throw new Error("Cannot approve project: No production plan exists.");
    }
    
    this.state.setStatus('approved');
  }

  public getCurrentState() {
    return this.state.getState();
  }
}