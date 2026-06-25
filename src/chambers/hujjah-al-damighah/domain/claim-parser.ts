/**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/domain/claim-parser.ts
 *
 * The Claim Parser.
 * Normalizes raw user input from the Qiyamah Chamber into a SovereignClaim.
 * Establishes the identity and intent of the investigation.
 */

import * as crypto from 'crypto';

import {
  SovereignClaim
} from './evidence.types';

export class ClaimParser {

  /**
   * Parses and normalizes raw input into a structured sovereign claim.
   */
  public static parse(
    input: string,
    targetCategory: string
  ): SovereignClaim {

    const trimmedInput = input.trim();

    // Prevent empty investigations
    if (trimmedInput.length < 3) {
      throw new Error(
        '[ClaimParser] Input is too short to establish a sovereign claim.'
      );
    }

    // Normalize whitespace
    const normalizedStatement =
      trimmedInput.replace(/\s+/g, ' ');

    // Extract keywords for downstream evidence scoring
    const keywords =
      this.extractKeywords(
        normalizedStatement
      );

    return {
      id:
        crypto.randomUUID(),

      originalStatement:
        input,

      normalizedStatement:
        normalizedStatement,

      targetCategory:
        targetCategory.toLowerCase(),

      timestampMs:
        Date.now(),

      keywords:
        keywords
    };
  }

  /**
   * Extracts keywords from the normalized statement.
   */
  private static extractKeywords(
    statement: string
  ): string[] {

    return statement
      .toLowerCase()
      .split(/\s+/)
      .map(
        keyword => keyword.trim()
      )
      .filter(
        keyword => keyword.length > 2
      );
  }
}