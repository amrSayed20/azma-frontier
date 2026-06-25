/**
 * AZMA OS – Qiyamah Chamber
 * File: script-agent.ts
 *
 * Script Agent
 * Responsible for handling sovereign scripts,
 * validating them, and preparing them for generation.
 */

export interface SovereignScript {
  readonly content: string;
  readonly language: string;
  readonly createdAt: Date;
}

export class ScriptAgent {
  /**
   * Creates a new sovereign script.
   */
  public createScript(content: string): SovereignScript {
    return {
      content,
      language: 'ar',
      createdAt: new Date(),
    };
  }

  /**
   * Validates script content.
   */
  public validateScript(content: string): boolean {
    return content.trim().length > 0;
  }

  /**
   * Creates a shortened preview.
   */
  public createPreview(content: string, maxLength: number = 120): string {
    if (content.length <= maxLength) {
      return content;
    }

    return `${content.substring(0, maxLength)}...`;
  }
}