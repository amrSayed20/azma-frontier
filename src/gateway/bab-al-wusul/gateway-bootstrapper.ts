/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/gateway-bootstrapper.ts
 * 
 * The Gateway Bootstrapper.
 * The composition root for the entire Omni-Gateway subsystem.
 * Wires cryptographic enforcers, internal chamber handlers, and dispatchers 
 * into a single, immutable transport facade.
 * 
 * Enforces Constraint 5: Strict Architectural Isolation by moving all 
 * dependency construction outside of the operational chambers.
 */

import { UntrustedClientPayload, GatewayResponse } from './authentication-contracts';
import { PerimeterEnforcer, ITokenVerifier, ITraceIdGenerator } from './perimeter-enforcer';
import { OmniRouter, IChamberHandler } from './omni-router';

// ==========================================
// 1. BOOTSTRAP CONFIGURATION CONTRACTS
// ==========================================

export interface RouteRegistration {
  readonly routePath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly handler: IChamberHandler<any, any>;
}

export interface GatewayDependencies {
  readonly tokenVerifier: ITokenVerifier;
  readonly traceIdGenerator: ITraceIdGenerator;
  readonly routes: RouteRegistration[];
}

// ==========================================
// 2. THE OMNI-GATEWAY FACADE
// ==========================================

/**
 * The unified entry point provided to physical transport layers (Express, WebSockets, etc.).
 * It coordinates the Enforcer and the Router without containing business logic.
 */
export class OmniGatewayEndpoint {
  constructor(
    private readonly enforcer: PerimeterEnforcer,
    private readonly router: OmniRouter,
    private readonly traceIdGenerator: ITraceIdGenerator
  ) {}

  /**
   * Processes raw, untrusted traffic originating from the UI or external clients.
   * 
   * @param routePath The target internal capability (e.g., 'qiyamah.materialize').
   * @param untrustedPayload The raw JSON body of the request.
   * @param rawAuthorizationHeader The raw 'Authorization: Bearer ...' header.
   * @returns A structured, standardized GatewayResponse for the Al-Mantahaa UI.
   */
  public async processRequest<TPayload, TResponseData>(
    routePath: string,
    untrustedPayload: UntrustedClientPayload<TPayload>,
    rawAuthorizationHeader: string | undefined | null
  ): Promise<GatewayResponse<TResponseData>> {
    
    try {
      // Step A: Cryptographic Boundary Enforcement (Zero-Trust Validation)
      const verifiedRequest = await this.enforcer.enforceBoundary(
        untrustedPayload,
        rawAuthorizationHeader
      );

      // Step B: Isolated Omni-Routing
      return await this.router.dispatch<TPayload, TResponseData>(
        routePath,
        verifiedRequest
      );

    } catch (error: unknown) {
      // Catch perimeter-level failures (e.g., Token expired, missing headers, tampering)
      // and standardize them so the frontend never receives a crashed connection.
      const isSystemError = error instanceof Error;
      
      // Generate a distinct trace ID for the perimeter rejection audit trail
      const rejectionTraceId = this.traceIdGenerator.generate();

      return {
        success: false,
        error: {
          code: 'PERIMETER_ENFORCEMENT_FAILED',
          message: isSystemError ? error.message : 'Access explicitly denied at the sovereign perimeter.'
        },
        meta: {
          traceId: rejectionTraceId,
          processedAtMs: Date.now()
        }
      };
    }
  }
}

// ==========================================
// 3. THE BOOTSTRAPPER COMPOSITION ROOT
// ==========================================

export class GatewayBootstrapper {
  
  /**
   * Assembles the immutable gateway infrastructure.
   * Instantiates the security enforcers, wires the routing table, and seals the perimeter.
   * 
   * @param deps The external cryptographic dependencies and chamber handlers.
   * @returns The sealed OmniGatewayEndpoint ready to be mounted to a web framework.
   */
  public static bootstrap(deps: GatewayDependencies): OmniGatewayEndpoint {
    
    // 1. Initialize the Perimeter Enforcer
    const enforcer = new PerimeterEnforcer(deps.tokenVerifier, deps.traceIdGenerator);

    // 2. Initialize the Omni Router
    const router = new OmniRouter();

    // 3. Bind Immutable Chamber Handlers
    for (const route of deps.routes) {
      router.registerRoute(route.routePath, route.handler);
    }

    // 4. Return the Unified Transport Facade
    return new OmniGatewayEndpoint(enforcer, router, deps.traceIdGenerator);
  }
}