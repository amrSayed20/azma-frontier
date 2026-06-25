/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/omni-router.ts
 * * The Omni-Router (Intent & Execution Delegation).
 * Acts as the centralized dispatch mechanism. Routes verified envelopes 
 * to isolated internal chambers without containing any business logic.
 * * Enforces Constraint 5: Strict Architectural Isolation.
 * Enforces Constraint 4: Sovereign Context Enforcement (Accepts only VerifiedGatewayRequest).
 */

import { VerifiedGatewayRequest, GatewayResponse } from './authentication-contracts';

// ==========================================
// 1. ISOLATION DELEGATION CONTRACTS
// ==========================================

/**
 * The standard interface that every internal chamber (Qiyamah, Ras Al-Amr, etc.) 
 * must implement to receive traffic from Bab Al-Wusul.
 * This guarantees the Gateway never touches business logic directly.
 */
export interface IChamberHandler<TPayload, TResponseData> {
  /**
   * Executes the internal chamber logic using a secure, verified envelope.
   * @param request The cryptographically verified perimeter request.
   * @returns The raw response data specific to the chamber's operation.
   */
  execute(request: VerifiedGatewayRequest<TPayload>): Promise<TResponseData>;
}

// ==========================================
// 2. THE OMNI-ROUTER
// ==========================================

export class OmniRouter {
  // A memory registry mapping external route names to internal chamber handlers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly handlerRegistry = new Map<string, IChamberHandler<any, any>>();

  /**
   * Registers an internal execution handler to a specific API route.
   * Typically called during application bootstrap/wiring.
   * * @param routePath The unique string identifier for the action (e.g., 'qiyamah.materialize').
   * @param handler The isolated execution module.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerRoute(routePath: string, handler: IChamberHandler<any, any>): void {
    if (this.handlerRegistry.has(routePath)) {
      throw new Error(`Gateway Configuration Error: Handler for route [${routePath}] is already registered.`);
    }
    this.handlerRegistry.set(routePath, handler);
  }

  /**
   * Dispatches a verified request to the appropriate internal chamber 
   * and standardizes the response for the frontend UI.
   * * @param routePath The target internal capability.
   * @param verifiedRequest The mathematically proven envelope from the Perimeter Enforcer.
   * @returns A structured GatewayResponse ready for the Al-Mantahaa frontend.
   */
  public async dispatch<TPayload, TResponseData>(
    routePath: string,
    verifiedRequest: VerifiedGatewayRequest<TPayload>
  ): Promise<GatewayResponse<TResponseData>> {
    
    const handler = this.handlerRegistry.get(routePath);

    if (!handler) {
      return {
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `Bab Al-Wusul: No internal chamber registered for destination [${routePath}].`
        },
        meta: {
          traceId: verifiedRequest.traceId,
          processedAtMs: Date.now()
        }
      };
    }

    try {
      // Execute the request within the isolated chamber.
      // Bab Al-Wusul awaits the result blindly.
      const responseData = await handler.execute(verifiedRequest);
      
      return {
        success: true,
        data: responseData,
        meta: {
          traceId: verifiedRequest.traceId,
          processedAtMs: Date.now()
        }
      };

    } catch (error: unknown) {
      // Global boundary error catcher: Standardizes exceptions so the client 
      // always receives a predictable JSON payload rather than a crashed socket.
      const isSystemError = error instanceof Error;
      
      // In production, you would conditionally log `error` to the Operation Ledger here 
      // using the `verifiedRequest.traceId` to maintain the audit trail.
      
      return {
        success: false,
        error: {
          code: (error as any)?.code || 'INTERNAL_CHAMBER_ERROR',
          message: isSystemError ? error.message : 'An unexpected error occurred within the isolated execution chamber.'
        },
        meta: {
          traceId: verifiedRequest.traceId,
          processedAtMs: Date.now()
        }
      };
    }
  }
}