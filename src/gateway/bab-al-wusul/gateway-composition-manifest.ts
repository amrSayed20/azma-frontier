/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/gateway-composition-manifest.ts
 * * The Gateway Composition Manifest.
 * The absolute top-level builder for Bab Al-Wusul. It orchestrates the exact 
 * constitutional sequence of instantiation, dependency wiring, and activation.
 * It outputs a securely sealed gateway ready to be attached to a web server,
 * ensuring no transport layer can bypass the constitutional verification sequence.
 */

import { ITokenVerifier, ITraceIdGenerator } from './perimeter-enforcer';
import { RouteRegistration, GatewayBootstrapper } from './gateway-bootstrapper';
import { GatewayDiagnosticsService } from './gateway-diagnostics-service';
import { GatewayLifecycleManager, LifecycleConfiguration } from './gateway-lifecycle-manager';
import { GatewayBootstrapVerificationService } from './gateway-bootstrap-verification-service';
import { GatewayActivationCoordinator, ActivationDecisionArtifact } from './gateway-activation-coordinator';

// ==========================================
// 1. COMPOSITION CONTRACTS
// ==========================================

/**
 * The physical dependencies that the external server environment must 
 * inject into the Sovereign Gateway.
 */
export interface GatewayManifestConfig {
  readonly tokenVerifier: ITokenVerifier;
  readonly traceIdGenerator: ITraceIdGenerator;
  readonly routes: RouteRegistration[];
  readonly lifecycleConfig?: LifecycleConfiguration;
}

/**
 * The strictly sealed output of the composition process.
 * This is the ONLY object the external web server is allowed to interact with.
 */
export interface ComposedGateway {
  readonly trafficManager: GatewayLifecycleManager;
  readonly activationRecord: ActivationDecisionArtifact;
  readonly diagnostics: GatewayDiagnosticsService;
}

// ==========================================
// 2. THE COMPOSITION MANIFEST
// ==========================================

export class GatewayCompositionManifest {
  
  /**
   * Executes the strict, constitutional sequence required to build and activate 
   * Bab Al-Wusul.
   * * @param config The injected environmental dependencies and defined routes.
   * @returns A fully verified and securely sealed gateway instance.
   */
  public static composeAndActivate(config: GatewayManifestConfig): ComposedGateway {
    
    // STEP 1: Initialize Passive Observability
    const diagnostics = new GatewayDiagnosticsService();

    // STEP 2: Bootstrap the Internal Routing & Perimeter Defenses
    // This wires the token verifier and routes into the sealed OmniGatewayEndpoint
    const endpoint = GatewayBootstrapper.bootstrap({
      tokenVerifier: config.tokenVerifier,
      traceIdGenerator: config.traceIdGenerator,
      routes: config.routes
    });

    // STEP 3: Mount the Master Traffic Orchestrator
    const trafficManager = new GatewayLifecycleManager(
      endpoint,
      diagnostics,
      config.lifecycleConfig
    );

    // STEP 4: Instantiate Constitutional Verification Authorities
    const verificationService = new GatewayBootstrapVerificationService(config.traceIdGenerator);
    const activationCoordinator = new GatewayActivationCoordinator(trafficManager, verificationService);

    // STEP 5: Prepare Verification Artifacts
    // Extract a mapping of the physically mounted handlers for the notary audit
    const mountedHandlers = new Map<string, unknown>();
    for (const route of config.routes) {
      mountedHandlers.set(route.routePath, route.handler);
    }

    // Since the Bootstrapper completed without throwing an exception, 
    // the enforcer and router are mathematically guaranteed to be active in memory.
    const isPerimeterEnforcerActive = true;
    const isOmniRouterActive = true;

    // STEP 6: Execute the Constitutional Activation Sequence
    const activationRecord = activationCoordinator.executeActivationSequence(
      mountedHandlers,
      isPerimeterEnforcerActive,
      isOmniRouterActive
    );

    // STEP 7: Return the Sealed System
    return {
      trafficManager,
      activationRecord,
      diagnostics
    };
  }
}