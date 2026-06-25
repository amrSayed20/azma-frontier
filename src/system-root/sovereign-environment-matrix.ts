/**
 * AZMA OS - Phase 8: Sovereign Master Composition (System Wiring)
 * File: src/system-root/sovereign-environment-matrix.ts
 * * The Sovereign Environment Matrix.
 * The absolute first layer of the root application. Intercepts physical 
 * OS environment variables, strictly validates them, and seals them into 
 * an immutable configuration object for the boot sequence.
 */

// ==========================================
// 1. ENVIRONMENT CONTRACTS
// ==========================================

export enum RuntimeEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  MAINTENANCE = 'maintenance'
}

export interface SovereignConfig {
  readonly gatewayPort: number;
  readonly environment: RuntimeEnvironment;
  readonly cryptographicSecret: string;
  readonly vaultMountPath: string;
  readonly maxShutdownDrainTimeMs: number;
}

// ==========================================
// 2. THE ENVIRONMENT MATRIX
// ==========================================

export class SovereignEnvironmentMatrix {
  private static sealedConfig: SovereignConfig | null = null;

  /**
   * Executes the genesis environment validation.
   * Scans the physical process environment and constructs the immutable configuration.
   * * @throws Error if any required variable is missing or malformed, triggering a fatal genesis crash.
   * @returns The mathematically guaranteed SovereignConfig.
   */
  public static validateAndSeal(): SovereignConfig {
    if (this.sealedConfig) {
      return this.sealedConfig;
    }

    // 1. Port Validation
    const portString = process.env.AZMA_GATEWAY_PORT || '3000';
    const port = parseInt(portString, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      this.triggerFatalCrash('AZMA_GATEWAY_PORT must be a valid network port number.');
    }

    // 2. Runtime Environment Validation
    const rawEnv = (process.env.NODE_ENV || 'development').toLowerCase();
    const environment = this.parseEnvironment(rawEnv);

    // 3. Cryptographic Secret Validation (Zero-Trust Identity Prerequisite)
    const cryptographicSecret = process.env.AZMA_JWT_SECRET;
    if (!cryptographicSecret || cryptographicSecret.length < 32) {
      this.triggerFatalCrash('AZMA_JWT_SECRET is missing or constitutionally weak (must be >= 32 characters).');
    }

    // 4. Vault Mount Path Validation
    const vaultMountPath = process.env.AZMA_VAULT_MOUNT_POINT;
    if (!vaultMountPath) {
      this.triggerFatalCrash('AZMA_VAULT_MOUNT_POINT is required to establish the physical storage boundary.');
    }

    // 5. Lifecycle Drainage Configuration
    const drainTimeStr = process.env.AZMA_MAX_DRAIN_TIME_MS || '30000';
    const maxShutdownDrainTimeMs = parseInt(drainTimeStr, 10);
    if (isNaN(maxShutdownDrainTimeMs) || maxShutdownDrainTimeMs < 0) {
      this.triggerFatalCrash('AZMA_MAX_DRAIN_TIME_MS must be a valid positive integer.');
    }

    // Seal the configuration
    this.sealedConfig = {
      gatewayPort: port,
      environment,
      cryptographicSecret,
      vaultMountPath,
      maxShutdownDrainTimeMs
    };

    return this.sealedConfig;
  }

  /**
   * Retrieves the sealed configuration.
   * @throws Error if called before validateAndSeal().
   */
  public static getConfig(): SovereignConfig {
    if (!this.sealedConfig) {
      throw new Error('Architectural Violation: Attempted to access SovereignConfig before environment was sealed.');
    }
    return this.sealedConfig;
  }

  // ==========================================
  // INTERNAL UTILITIES
  // ==========================================

  private static parseEnvironment(env: string): RuntimeEnvironment {
    switch (env) {
      case 'production': return RuntimeEnvironment.PRODUCTION;
      case 'maintenance': return RuntimeEnvironment.MAINTENANCE;
      case 'development':
      default:
        return RuntimeEnvironment.DEVELOPMENT;
    }
  }

  private static triggerFatalCrash(reason: string): never {
    console.error('\n[AZMA OS GENESIS FAILURE]');
    console.error(`Reason: ${reason}`);
    console.error('Action: System boot sequence aborted to prevent unconstitutional operational state.\n');
    process.exit(1);
  }
}