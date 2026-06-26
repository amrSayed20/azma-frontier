import { AIProviderAdapter, AIProviderDispatchInput, RawAIProviderResponse } from './provider-contracts';

export class PromptDispatcher {
  public dispatch(provider: AIProviderAdapter, input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    return provider.dispatch(input);
  }
}
