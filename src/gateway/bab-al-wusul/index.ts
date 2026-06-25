/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/index.ts
 * 
 * The Sovereign Gateway Public Export Surface.
 * Acts as the absolute constitutional boundary for Bab Al-Wusul.
 * Exposes strictly necessary contracts, routing registries, and composition 
 * manifests while hiding internal execution logic (OmniRouter, PerimeterEnforcer) 
 * from external transport layers and internal chambers.
 */

// ==========================================
// 1. IDENTITY & ENVELOPE CONTRACTS 
// (Used by internal chambers to process requests)
// ==========================================
export { SovereignRole } from './authentication-contracts';
export type { 
  SovereignSessionContext, 
  UntrustedClientPayload, 
  VerifiedGatewayRequest, 
  GatewayResponse 
} from './authentication-contracts';

// ==========================================
// 2. ROUTING & HANDLER CONTRACTS
// (Used by internal chambers to mount themselves)
// ==========================================
export { 
  ChamberRouteRegistry, 
  QiyamahRoutes, 
  RasAlAmrRoutes, 
  MakmanAlGhayahRoutes 
} from './chamber-route-registry';
export type { ChamberRoute } from './chamber-route-registry';
export type { IChamberHandler } from './omni-router';
export { RouteValidationLayer } from './route-validation-layer';

// ==========================================
// 3. TOPOLOGY & OBSERVABILITY CONTRACTS
// (Used by System Admins & Operation Ledger)
// ==========================================
export { GatewayOperationalState } from './gateway-topology-contracts';
export type { 
  GatewayHealthMetrics, 
  GatewayTopologyReport, 
  GatewayBootstrapVerification, 
  GatewayObservabilitySnapshot,
  RouteTopologyEntry 
} from './gateway-topology-contracts';
export { GatewayDiagnosticsService } from './gateway-diagnostics-service';

// ==========================================
// 4. LIFECYCLE & ACTIVATION CONTRACTS
// (Used by Transport Server to manage state)
// ==========================================
export { GatewayLifecycleManager } from './gateway-lifecycle-manager';
export type { LifecycleConfiguration } from './gateway-lifecycle-manager';
export type { ActivationDecisionArtifact } from './gateway-activation-coordinator';

// ==========================================
// 5. BOOTSTRAP & DEPENDENCY INJECTION 
// (Used exclusively by the external transport server setup)
// ==========================================
export { GatewayCompositionManifest } from './gateway-composition-manifest';
export type { GatewayManifestConfig, ComposedGateway } from './gateway-composition-manifest';
export type { ITokenVerifier, ITraceIdGenerator } from './perimeter-enforcer';
export type { RouteRegistration } from './gateway-bootstrapper';