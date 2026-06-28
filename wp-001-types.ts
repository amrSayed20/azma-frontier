/**
 * WP-001: Constitutional Kernel — Type Definitions (STUB)
 * 
 * This stub file provides the minimal types needed by higher layers.
 * Complete WP-001 implementation would include full constitution definitions.
 */

/**
 * Unique identifier for a constitutional article
 * All decisions must link to constitutional authority
 */
export type ConstitutionArticleId = string & { readonly __brand: 'ConstitutionArticleId' };

/**
 * Create a branded ConstitutionArticleId
 */
export function createConstitutionArticleId(value: string): ConstitutionArticleId {
  return value as ConstitutionArticleId;
}

/**
 * Constitutional article (authority)
 * Foundation of all policy decisions
 */
export interface ConstitutionArticle {
  readonly articleId: ConstitutionArticleId;
  readonly title: string;
  readonly text: string;
  readonly applicableToLayers: number[];
  readonly precedence: number;
}

/**
 * Authority scope (which layers can enforce)
 */
export type AuthorityScope = 'GLOBAL' | 'LAYER_SCOPED' | 'SERVICE_SCOPED';
