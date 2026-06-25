 /**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/route-validation-layer.ts
 * * The Gateway Route Validation Layer.
 * Enforces the constitutional route registry against both inbound traffic
 * and internal gateway bootstrap configurations.
 * Prevents rogue routing and eliminates magic string vulnerabilities.
 */

import { ChamberRouteRegistry, ChamberRoute } from './chamber-route-registry';

export class RouteValidationLayer {
  
  /**
   * Runtime Boundary Validation.
   * Verifies if an incoming external request is targeting a constitutionally 
   * approved internal chamber route.
   * * @param routePath The untrusted destination string from the external client.
   * @throws Error if the route is not officially registered, terminating the request.
   * @returns The strictly typed ChamberRoute if validation passes.
   */
  public static validateInboundRoute(routePath: string): ChamberRoute {
    if (!ChamberRouteRegistry.isValidRoute(routePath)) {
      throw new Error(
        `Route Enforcement Violation: Target destination [${routePath}] is not a recognized internal chamber route.`
      );
    }
    
    // Once validated, the route is mathematically guaranteed to be a key 
    // within the constitutional ChamberRoute union.
    return routePath;
  }

  /**
   * Bootstrap Integrity Validation.
   * Ensures the system does not accidentally register 'magic string' handlers 
   * during the composition phase of the GatewayBootstrapper.
   * * @param routePath The route path being bound to an IChamberHandler.
   * @throws Error if the system attempts to bind an unregistered route, halting boot.
   */
  public static validateHandlerRegistration(routePath: string): void {
    if (!ChamberRouteRegistry.isValidRoute(routePath)) {
      throw new Error(
        `Bootstrap Integrity Error: Cannot register handler for unregistered route [${routePath}]. Route must be added to ChamberRouteRegistry first.`
      );
    }
  }
}