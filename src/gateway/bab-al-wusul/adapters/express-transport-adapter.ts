 /**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/adapters/express-transport-adapter.ts
 * * The Express Transport Adapter.
 * A concrete implementation of the ITransportServer contract.
 * Hosts the Omni-Gateway within a standard Node.js/Express environment,
 * strictly translating HTTP protocol requests into headless sovereign payloads.
 */

import express, { Request, Response, Application } from 'express';
import { Server } from 'http';
import { ITransportServer, TransportProtocol } from '../transport-adapter-contracts';
import { ComposedGateway } from '../gateway-composition-manifest';
import { UntrustedClientPayload } from '../authentication-contracts';

// Strictly define the expected URL parameters for the ingress pipeline
type GatewayRouteParams = { routePath: string };

export class ExpressTransportAdapter implements ITransportServer {
  private readonly app: Application;
  private serverInstance: Server | null = null;
  private gateway: ComposedGateway | null = null;

  constructor(private readonly port: number) {
    this.app = express();
    // Mount fundamental HTTP middleware
    this.app.use(express.json());
    // Disable framework fingerprinting for security
    this.app.disable('x-powered-by'); 
  }

  /**
   * Mounts the strictly verified Sovereign Gateway into the Express router.
   * establishes the master ingress pipeline.
   * * @param gateway The activated gateway output from the Composition Manifest.
   */
  public mountGateway(gateway: ComposedGateway): void {
    if (this.gateway) {
      throw new Error('Transport Error: A Sovereign Gateway is already mounted to this adapter.');
    }
    
    this.gateway = gateway;

    // The Master Ingress Pipeline
    // All traffic is routed through a single generic endpoint to preserve 
    // internal Omni-Router isolation. Explicit generics ensure strict TS compilation.
    this.app.post('/api/v1/gateway/:routePath', async (req: Request<GatewayRouteParams>, res: Response) => {
      await this.handleIncomingTraffic(req, res);
    });

    // Health/Diagnostics endpoint for infrastructure monitoring (e.g., Docker/Kubernetes)
    this.app.get('/api/v1/health', (req: Request, res: Response) => {
      const snapshot = this.gateway?.diagnostics.generateObservabilitySnapshot(
        // The transport adapter doesn't know the handlers, but it can report gateway state
        new Map() 
      );
      res.status(200).json(snapshot);
    });
  }

  /**
   * Ignites the physical HTTP server on the configured port.
   */
  public async start(): Promise<void> {
    if (!this.gateway) {
      throw new Error('Transport Error: Cannot start server. No gateway is mounted.');
    }

    return new Promise((resolve) => {
      this.serverInstance = this.app.listen(this.port, () => {
        // Operational logging would typically route to the Sovereign Ledger here
        console.log(`[Transport Adapter] Express HTTP Server listening on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Initiates the graceful shutdown sequence.
   * Coordinates the physical HTTP server closure with the gateway's internal drainage.
   */
  public async shutdown(): Promise<void> {
    if (this.gateway) {
      // Step 1: Instruct the gateway to stop accepting new traffic and drain active requests
      await this.gateway.trafficManager.executeGracefulShutdown();
    }

    // Step 2: Sever the physical HTTP listener
    if (this.serverInstance) {
      return new Promise((resolve, reject) => {
        this.serverInstance?.close((err) => {
          if (err) return reject(err);
          console.log('[Transport Adapter] Express HTTP Server securely terminated.');
          resolve();
        });
      });
    }
  }

  // ==========================================
  // INTERNAL PROTOCOL TRANSLATION
  // ==========================================

  private async handleIncomingTraffic(req: Request<GatewayRouteParams>, res: Response): Promise<void> {
    if (!this.gateway) {
      res.status(503).json({ success: false, error: { message: 'Sovereign Gateway is unmounted.' } });
      return;
    }

    // TS mathematically guarantees this is a string due to the generic Request type
    const routePath = req.params.routePath; 
    
    // Architectural Defense: Prevent HTTP Header Array Pollution
    const rawAuthHeader = req.headers.authorization;
    const authHeaderString = Array.isArray(rawAuthHeader) ? rawAuthHeader[0] : rawAuthHeader;
    
    // Construct the Untrusted Payload exactly as the gateway expects it
    const untrustedPayload: UntrustedClientPayload = {
      data: req.body,
      clientMetadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        protocol: TransportProtocol.HTTP
      }
    };

    // Delegate entirely to the Sovereign Gateway
    // Notice how the gateway never sees 'req' or 'res'
    const gatewayResponse = await this.gateway.trafficManager.processTraffic(
      routePath,
      untrustedPayload,
      authHeaderString
    );

    // Map gateway success/failure back to standard HTTP status codes
    let httpStatusCode = 200; // Default OK

    if (!gatewayResponse.success) {
      switch (gatewayResponse.error?.code) {
        case 'GATEWAY_MAINTENANCE':
        case 'GATEWAY_OFFLINE':
          httpStatusCode = 503;
          break;
        case 'PERIMETER_ENFORCEMENT_FAILED':
          httpStatusCode = 401; // Unauthorized
          break;
        case 'ROUTE_NOT_FOUND':
          httpStatusCode = 404;
          break;
        default:
          httpStatusCode = 400; // Bad Request or Internal Execution Error
      }
    }

    res.status(httpStatusCode).json(gatewayResponse);
  }
}