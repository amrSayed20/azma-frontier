/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/transport-adapter-contracts.ts
 * 
 * The Transport Adapter Contracts.
 * Establishes absolute architectural isolation between the Omni-Gateway 
 * and specific physical transport frameworks (Express, Fastify, WebSockets).
 * Ensures external servers communicate only through normalized sovereign interfaces.
 */

import { ComposedGateway } from './gateway-composition-manifest';
import { GatewayResponse } from './authentication-contracts';

// ==========================================
// 1. NORMALIZED TRANSPORT STRUCTURES
// ==========================================

export enum TransportProtocol {
  HTTP = 'HTTP',
  WEBSOCKET = 'WEBSOCKET',
  GRPC = 'GRPC'
}

/**
 * A perfectly framework-agnostic representation of an incoming client request.
 * Any physical transport layer MUST transform its specific request object 
 * (e.g., Express Request) into this pure structure before consulting the gateway.
 */
export interface NormalizedTransportRequest {
  readonly protocol: TransportProtocol;
  readonly routePath: string; // The targeted internal chamber route
  readonly payload: unknown; // The raw, untrusted JSON body
  readonly authorizationHeader: string | undefined | null; // Extracted 'Bearer <token>'
  readonly clientIp?: string; // Sourced from transport connection or edge headers
  readonly userAgent?: string;
}

/**
 * The unified framework-agnostic response instruction.
 * Instructs the physical transport layer on exactly how to reply to the client, 
 * including the mapped transport status code (e.g., HTTP 200, 401, 503) 
 * and the constitutional JSON payload.
 */
export interface NormalizedTransportResponse<T = unknown> {
  readonly transportStatusCode: number;
  readonly payload: GatewayResponse<T>;
}

// ==========================================
// 2. ADAPTER DELEGATION CONTRACTS
// ==========================================

/**
 * The standard contract that every physical transport server implementation 
 * must fulfill in order to host Bab Al-Wusul.
 */
export interface ITransportServer {
  /**
   * Mounts the strictly composed and verified gateway into the transport server.
   * This is where the framework-specific routes (e.g., Express app.post) 
   * are wired to delegate to the GatewayLifecycleManager.
   * 
   * @param gateway The composed, constitutionally active gateway.
   */
  mountGateway(gateway: ComposedGateway): void;

  /**
   * Instructs the transport layer to begin listening for external traffic 
   * (e.g., app.listen(port)).
   */
  start(): Promise<void>;

  /**
   * Instructs the transport layer to stop accepting new connections 
   * and gracefully sever existing ones. Must coordinate with the 
   * GatewayLifecycleManager's shutdown drainage.
   */
  shutdown(): Promise<void>;
}