/**
 * AZMA OS – Qiyamah Chamber
 * File: canvas-agent.ts
 *
 * Canvas Agent
 * Responsible for receiving and classifying assets dropped into
 * the Genesis Canvas and converting them into a sovereign input contract.
 */

export type CanvasAssetType = 'text' | 'image' | 'video' | 'audio';

export interface CanvasAsset {
  readonly type: CanvasAssetType;
  readonly content: string;
  readonly source: 'local' | 'hujjah' | 'manual';
  readonly importedAt: Date;
}

export class CanvasAgent {
  /**
   * Creates a sovereign asset from raw text.
   */
  public createTextAsset(text: string): CanvasAsset {
    return {
      type: 'text',
      content: text,
      source: 'manual',
      importedAt: new Date(),
    };
  }

  /**
   * Creates a sovereign asset from a local file.
   */
  public createFileAsset(
    fileName: string,
    type: CanvasAssetType
  ): CanvasAsset {
    return {
      type,
      content: fileName,
      source: 'local',
      importedAt: new Date(),
    };
  }

  /**
   * Creates a sovereign asset injected from Hujjah Al-Damighah.
   */
  public createImportedAsset(content: string): CanvasAsset {
    return {
      type: 'text',
      content,
      source: 'hujjah',
      importedAt: new Date(),
    };
  }
}