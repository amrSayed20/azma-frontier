/**
 * AZMA OS – Qiyamah Chamber
 * File: prompt-agent.ts
 *
 * Prompt Agent
 * Responsible for constructing, enriching, and optimizing
 * sovereign prompts before they enter the Genesis pipeline.
 */

export interface SovereignPrompt {
  readonly originalPrompt: string;
  readonly enrichedPrompt: string;
  readonly generatedAt: Date;
}

export class PromptAgent {
  /**
   * Creates a sovereign prompt.
   */
  public createPrompt(prompt: string): SovereignPrompt {
    return {
      originalPrompt: prompt,
      enrichedPrompt: prompt,
      generatedAt: new Date(),
    };
  }

  /**
   * Enriches a prompt with additional context.
   */
  public enrichPrompt(
    basePrompt: string,
    context: string
  ): SovereignPrompt {
    return {
      originalPrompt: basePrompt,
      enrichedPrompt: `${basePrompt}\n\n${context}`,
      generatedAt: new Date(),
    };
  }

  /**
   * Creates a preview version of the prompt.
   */
  public createPreview(
    prompt: string,
    maxLength: number = 200
  ): string {
    if (prompt.length <= maxLength) {
      return prompt;
    }

    return `${prompt.substring(0, maxLength)}...`;
  }
}