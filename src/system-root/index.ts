/**
 * AZMA OS - Phase 8: Sovereign Master Composition (System Wiring)
 * File: src/system-root/index.ts
 * * The Sovereign Root Public Export Surface.
 * Seals the system-root architecture. Exposes only the absolute genesis 
 * orchestrator and constitutional environment configurations. Hides the 
 * internal route assemblers and physical cryptographic providers from 
 * the rest of the application tree.
 */

// ==========================================
// 1. GENESIS ENTRY POINT
// ==========================================
export { SovereignGenesisApplication } from './sovereign-genesis-application';

// ==========================================
// 2. ENVIRONMENT CONTRACTS
// ==========================================
export { SovereignEnvironmentMatrix, RuntimeEnvironment } from './sovereign-environment-matrix';
export type { SovereignConfig } from './sovereign-environment-matrix';

// Note: MasterRouteAssembler, SovereignTokenVerifier, and SovereignTraceGenerator 
// are deliberately EXCLUDED from this export surface to enforce Strict Architectural Isolation.