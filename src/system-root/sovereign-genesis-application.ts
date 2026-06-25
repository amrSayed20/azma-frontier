/**
 * AZMA OS - Phase 8: Sovereign Master Composition (System Wiring)
 * File: src/system-root/sovereign-genesis-application.ts
 * * The Sovereign Genesis Application.
 * The absolute root entry point of the AZMA OS backend. Orchestrates the 
 * constitutional boot sequence: validates the environment, injects root 
 * infrastructure, composes the Omni-Gateway, and ignites the transport layer.
 */

import { SovereignEnvironmentMatrix } from './sovereign-environment-matrix';
import { SovereignTokenVerifier, SovereignTraceGenerator } from './root-infrastructure-providers';
import { MasterRouteAssembler } from './master-route-assembler';
import { GatewayCompositionManifest } from '../gateway/bab-al-wusul';
import { ExpressTransportAdapter } from '../gateway/bab-al-wusul/adapters/express-transport-adapter';

// ==========================================
// THE SOVEREIGN GENESIS BOOTSTRAPPER
// ==========================================

export class SovereignGenesisApplication {
  
  /**
   * Executes the master boot sequence.
   * Assembles and ignites the sovereign operating system environment.
   */
  public static async ignite(): Promise<void> {
    try {
      console.log('\n[AZMA OS] Initiating Sovereign Genesis Sequence...');

      // STEP 1: Environment Matrix Validation & Sealing
      const config = SovereignEnvironmentMatrix.validateAndSeal();
      console.log(`[AZMA OS] Environment Matrix Sealed. Operating Mode: [${config.environment.toUpperCase()}]`);

      // STEP 2: Root Infrastructure Initialization
      const tokenVerifier = new SovereignTokenVerifier(config.cryptographicSecret);
      const traceIdGenerator = new SovereignTraceGenerator();
      console.log('[AZMA OS] Cryptographic Perimeter & Tracing Engines Armed.');

      // STEP 3: Route Assembly
      const routes = MasterRouteAssembler.assembleRoutes();
      console.log(`[AZMA OS] Master Route Assembler mapped ${routes.length} execution chambers.`);

      // STEP 4: Gateway Composition & Verification
      const gateway = GatewayCompositionManifest.composeAndActivate({
        tokenVerifier,
        traceIdGenerator,
        routes,
        lifecycleConfig: {
          maxShutdownDrainTimeMs: config.maxShutdownDrainTimeMs
        }
      });

      if (!gateway.activationRecord.isActivated) {
        throw new Error(
          `Gateway Activation Blocked: ${gateway.activationRecord.rejectionReason}`
        );
      }
      console.log('[AZMA OS] Bab Al-Wusul Gateway Constitutionally Verified & ONLINE.');

      // STEP 5: Transport Layer Ignition
      const transportAdapter = new ExpressTransportAdapter(config.gatewayPort);
      transportAdapter.mountGateway(gateway);
      
      await transportAdapter.start();
      console.log(`\n======================================================`);
      console.log(`[AZMA OS] SOVEREIGN PERIMETER ACTIVE`);
      console.log(`[AZMA OS] Listening for Al-Mantahaa Frontend Traffic`);
      console.log(`[AZMA OS] Port: ${config.gatewayPort}`);
      console.log(`======================================================\n`);

      // STEP 6: Operating System Signal Binding (Graceful Drainage)
      this.bindSystemSignals(transportAdapter);

    } catch (error: unknown) {
      console.error('\n[AZMA OS] FATAL GENESIS EXCEPTION');
      console.error(error instanceof Error ? error.message : 'An unknown exception occurred during the boot sequence.');
      console.error('[AZMA OS] Boot Sequence Aborted.\n');
      process.exit(1);
    }
  }

  // ==========================================
  // INTERNAL OS-LEVEL BINDINGS
  // ==========================================

  /**
   * Binds to physical host OS signals to guarantee graceful traffic drainage.
   */
  private static bindSystemSignals(transportAdapter: ExpressTransportAdapter): void {
    const shutdownHandler = async (signal: string) => {
      console.log(`\n[AZMA OS] Received OS Signal: ${signal}. Initiating Sovereign Drainage Protocol...`);
      try {
        await transportAdapter.shutdown();
        console.log(`[AZMA OS] Sovereign Perimeter securely closed. System exit approved.`);
        process.exit(0);
      } catch (error) {
        console.error(`[AZMA OS] Exception during drainage protocol:`, error);
        process.exit(1);
      }
    };

    // Catch termination signals from Docker, Kubernetes, or manual Ctrl+C
    process.on('SIGINT', () => shutdownHandler('SIGINT'));
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  }
}

// ==========================================
// SYSTEM IGNITION TRIGGER
// ==========================================

// If this file is executed directly by Node.js, ignite the OS.
if (require.main === module) {
  SovereignGenesisApplication.ignite();
}