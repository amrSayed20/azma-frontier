import { QiyamahInjectionContext } from '../../../shared/contracts/bridge.types';

// Strict contract for Planner Output to be fulfilled in Phase 3
export type PlannerOutputContract = Record<string, unknown>;

export interface QiyamahProjectDraft {
  idea: string;
  basePrompt: string;
  injectedContext: QiyamahInjectionContext | null;
  plannerOutput: PlannerOutputContract | null;
  status: 'idle' | 'analyzing' | 'planned' | 'approved';
}

export type StateChangeListener = (state: Readonly<QiyamahProjectDraft>) => void;

export class QiyamahState {
  private state: QiyamahProjectDraft;
  private listeners: Set<StateChangeListener>;

  constructor() {
    this.state = this.getInitialState();
    this.listeners = new Set();
  }

  private getInitialState(): QiyamahProjectDraft {
    return {
      idea: '',
      basePrompt: '',
      injectedContext: null,
      plannerOutput: null,
      status: 'idle',
    };
  }

  public getState(): Readonly<QiyamahProjectDraft> {
    // Return an immutable clone of the state
    return Object.freeze({ ...this.state });
  }

  public setIdea(idea: string): void {
    this.state.idea = idea;
    this.notify();
  }

  public setBasePrompt(prompt: string): void {
    this.state.basePrompt = prompt;
    this.notify();
  }

  public setInjectedContext(context: QiyamahInjectionContext): void {
    this.state.injectedContext = context;
    this.notify();
  }

  public setPlannerOutput(output: PlannerOutputContract): void {
    this.state.plannerOutput = output;
    this.state.status = 'planned';
    this.notify();
  }

  public setStatus(status: QiyamahProjectDraft['status']): void {
    this.state.status = status;
    this.notify();
  }

  public reset(): void {
    this.state = this.getInitialState();
    this.notify();
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const stateSnapshot = this.getState();
    this.listeners.forEach((listener) => listener(stateSnapshot));
  }
}