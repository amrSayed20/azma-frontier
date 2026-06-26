import { BuiltAIContext, SovereignAIRequest } from './provider-contracts';

export class ContextBuilder {
  public build(request: SovereignAIRequest, memoryContext: readonly string[]): BuiltAIContext {
    return {
      requestId: request.requestId,
      prompt: request.prompt,
      systemContext: 'AZMA OS sovereign runtime context. DNA decides; providers answer through constitutional routing only.',
      memoryContext,
      constitutionalContext: `Capability ${request.capability}; priority ${request.priority}; purpose ${request.purpose}.`,
    };
  }
}
