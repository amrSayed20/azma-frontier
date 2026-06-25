/**
 * AZMA OS – Qiyamah Chamber
 * File: import-agent.ts
 *
 * Import Agent
 * Responsible for receiving external sovereign payloads
 * and converting them into importable Genesis assets.
 */

export interface ImportedAsset {
  readonly sourceChamber: string;
  readonly content: string;
  readonly importedAt: Date;
}

export class ImportAgent {
  /**
   * Creates an imported asset from another chamber.
   */
  public importFromChamber(
    sourceChamber: string,
    content: string
  ): ImportedAsset {
    return {
      sourceChamber,
      content,
      importedAt: new Date(),
    };
  }

  /**
   * Imports intelligence from Hujjah Al-Damighah.
   */
  public importFromHujjah(content: string): ImportedAsset {
    return {
      sourceChamber: 'hujjah-al-damighah',
      content,
      importedAt: new Date(),
    };
  }

  /**
   * Imports content from the Sovereign Vault.
   */
  public importFromVault(content: string): ImportedAsset {
    return {
      sourceChamber: 'sovereign-vault',
      content,
      importedAt: new Date(),
    };
  }
}