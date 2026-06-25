/**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/index.ts
 * * The Chamber Public Export Surface.
 * Structurally seals the Hujjah Al-Damighah module. It strictly limits 
 * external access to the Composition Factory and immutable domain contracts, 
 * preventing other chambers from bypassing the dependency injection lifecycle.
 */

// ==========================================
// 1. OPERATIONAL ENTRY POINT
// ==========================================
export { IntelligenceCompositionFactory } from './intelligence-composition-factory';

// ==========================================
// 2. CONSTITUTIONAL DOMAIN CONTRACTS
// ==========================================
export { ConfidenceLevel } from './domain/evidence.types';
export type { 
  SovereignClaim, 
  Evidence, 
  EvidenceBundle,
  RepositorySearchResult 
} from './domain/evidence.types';

// NOTE: The IntelligenceEngine, RepositoryManager, ClaimParser, EvidenceExtractor, 
// and physical providers are deliberately EXCLUDED from this export surface 
// to enforce strict encapsulation and zero-trust module boundaries.