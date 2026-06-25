/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/fleet/fleet-types.ts
 * 
 * The Agnostic Fleet & Adapter Contracts.
 * Governs the abstraction layer between Al-Watin Al-Siyadi's routing intelligence
 * and the external generative AI providers.
 * 
 * Preserves:
 * - Fleet Agnosticism (Zero vendor lock-in)
 * - Capability-Oriented Architecture (WRITING, DIRECTORIAL, VISUAL, MOTION, AUDIO)
 * - Operation-Centric Execution (Receives the authorized Ledger Entry)
 * - Asynchronous Handoff
 */

import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { OperationLedgerEntry } from '../ledger/operation-ledger-types';

// ==========================================
// 1. FLEET CAPABILITY CONTRACTS
// ==========================================

/**
 * Defines the operational boundaries and current health of a specific external provider.
 * Used by the Fleet Router to make dynamic, cost-aware, and latency-aware routing decisions.
 */
export interface ProviderCapabilities {
  supportedTargets: CapabilityTarget[];
  maxConcurrentOperations: number;
  unitCostMultiplier: number;     // Multiplier for tenant quota calculation
  averageLatencyMs: number;       // Used for SLA tracking and timeout thresholds
  isAvailable: boolean;           // Circuit breaker status
}

// ==========================================
// 2. PROVIDER RESPONSE CONTRACTS
// ==========================================

/**
 * The immediate synchronous response when an operation is dispatched to a provider.
 * This establishes the async tracking handshake.
 */
export interface ProviderDispatchResponse {
  externalJobId: string;
  status: 'ACCEPTED' | 'REJECTED' | 'FAILED';
  rawError?: string;
}

/**
 * The asynchronous resolution response polled or received via webhook.
 * Contains the materialized payload ready for Sovereign Vault deposition.
 */
export interface ProviderResolutionResponse {
  externalJobId: string;
  isComplete: boolean;
  isError: boolean;
  assetUrl?: string;              // Secure cloud URL or raw text/JSON block
  rawMetadata?: Record<string, unknown>; // Dimensions, generation seeds, exact durations
  errorMessage?: string;
}

// ==========================================
// 3. PROVIDER ADAPTER INTERFACE
// ==========================================

/**
 * The Universal Provider Adapter Contract.
 * Every external AI model MUST implement this interface to participate in the AZMA OS Fleet.
 * The adapter translates the AZMAPolymorphicIntent into vendor-specific API payloads.
 */
export interface IProviderAdapter {
  readonly providerId: string; // e.g., 'veo-v1', 'elevenlabs-v2', 'internal-llm'
  
  /**
   * Returns the current capabilities and health of the provider.
   */
  getCapabilities(): Promise<ProviderCapabilities>;
  
  /**
   * Translates the pure AZMA intent and triggers the external generation job.
   * Consumes the full OperationLedgerEntry to ensure multi-tenant headers can be passed if needed.
   */
  dispatchOperation(ledgerEntry: OperationLedgerEntry): Promise<ProviderDispatchResponse>;
  
  /**
   * Checks the status of an ongoing operation, returning the finalized asset upon completion.
   */
  checkOperationStatus(externalJobId: string): Promise<ProviderResolutionResponse>;
}

// ==========================================
// 4. FLEET ROUTING STRUCTURES
// ==========================================

/**
 * The internal decision matrix output by Al-Watin Al-Siyadi's routing logic.
 */
export interface RoutingDecision {
  operationId: string;
  selectedProviderId: string;
  estimatedLatencyMs: number;
  routingReason: string; // e.g., 'Lowest Cost', 'Fastest Available', 'Only Capable Provider'
}

/**
 * The structural registry holding all active adapters grouped by CapabilityTarget.
 */
export interface IFleetRegistry {
  getAdaptersForCapability(target: CapabilityTarget): IProviderAdapter[];
  registerAdapter(adapter: IProviderAdapter): void;
  removeAdapter(providerId: string): void;
}