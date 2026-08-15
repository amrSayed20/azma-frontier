/**
 * AZMA OS — PROVIDER SOVEREIGNTY FOUNDATION
 * OpenAI Image Generation Adapter
 *
 * Wraps the certified image-provider.ts behind the AIProviderAdapter
 * contract so AZMA OS controls provider selection rather than the route
 * hard-coding a single vendor call.
 *
 * Binary output (image bytes) is carried as base64 in RawAIProviderResponse.content
 * and decoded back to Buffer by the calling generation service.  This is
 * the minimum encoding bridge required by the text-centric orchestration
 * contract — it does not change the contract itself.
 *
 * DO NOT import provider credentials here.  Credentials remain in
 * environment variables read by the underlying image-provider.ts.
 */

import type { AIProviderAdapter, AIProviderDescriptor, AIProviderDispatchInput, RawAIProviderResponse } from '../provider-contracts';
import { generateImageViaProvider } from '../../../qiyamah-generation/image-provider';

export const OPENAI_IMAGE_PROVIDER_ID = 'openai-image' as const;
export const OPENAI_IMAGE_MODEL_ID = 'openai-gpt-image-1' as const;

const DESCRIPTOR: AIProviderDescriptor = {
  providerId: OPENAI_IMAGE_PROVIDER_ID,
  displayName: 'OpenAI Image Generation',
  providerFamily: 'managed',
  capabilities: ['image-generation'],
  modelIds: [OPENAI_IMAGE_MODEL_ID],
  maxConcurrentRequests: 5,
  costProfile: { inputUnitCost: 0, outputUnitCost: 0.04, currency: 'USD' },
  sovereign: true,
};

export class OpenAIImageAdapter implements AIProviderAdapter {
  public readonly descriptor: AIProviderDescriptor = DESCRIPTOR;

  public async dispatch(input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    const startedAt = Date.now();
    const prompt = input.request.prompt;
    const style = (input.request.context.metadata['style'] as string | null | undefined) ?? null;

    const result = await generateImageViaProvider(prompt, style);

    return {
      providerId: OPENAI_IMAGE_PROVIDER_ID,
      modelId: OPENAI_IMAGE_MODEL_ID,
      content: result.bytes.toString('base64'),
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      finishReason: 'completed',
      metadata: { mimeType: result.mimeType, encoding: 'base64' },
    };
  }
}
