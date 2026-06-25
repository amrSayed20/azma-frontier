/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/ledger/operation-ledger-types.ts
 * 
 * The Operation Ledger Contracts.
 * Governs how Al-Watin Al-Siyadi tracks, authorizes, and accounts for 
 * isolated materialization operations across the multi-tenant ecosystem.
 * 
 * Preserves:
 * - Operation-Centric Accounting (No project dependencies)
 * - Multi-Tenant Isolation (Strict tenant binding)
 * - Asynchronous Lifecycle Tracking
 */

import { AZMAPolymorphicIntent, CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';

/**
 * Defines the immutable lifecycle states of a sovereign operation.
 */
export enum OperationState {
  PENDING_AUTHORIZATION = 'PENDING_AUTHORIZATION', // Ledger entry created, awaiting quota check
  AUTHORIZED = 'AUTHORIZED',                       // Quota cleared, ready for fleet routing
  REJECTED_QUOTA = 'REJECTED_QUOTA',               // Failed due to insufficient tenant resources
  REJECTED_POLICY = 'REJECTED_POLICY',             // Failed constitutional policy check
  DISPATCHED = 'DISPATCHED',                       // Sent to the Fleet Gateway
  MATERIALIZING = 'MATERIALIZING',                 // Acknowledged by external provider, generation in progress
  DEPOSITED = 'DEPOSITED',                         // Asset successfully returned to Sovereign Vault
  FAILED = 'FAILED'                                // Provider or systemic failure
}

/**
 * The definitive record of a materialization transaction.
 * Al-Watin Al-Siyadi maintains this ledger independently of any project.
 */
export interface OperationLedgerEntry {
  operationId: string;
  subscriberTenantId: string;
  capabilityTarget: CapabilityTarget;
  
  // The exact immutable intent that triggered this operation
  sourceIntent: AZMAPolymorphicIntent;
  
  // Lifecycle tracking
  currentState: OperationState;
  
  // Accounting and Resource Consumption
  estimatedResourceCost: number;
  actualResourceCost?: number;
  
  // Routing Metadata
  allocatedProviderId?: string;    // Populated once the Fleet Router selects a provider
  externalJobId?: string;          // The async tracking ID from the external provider
  
  // Timestamps for SLA and timeout monitoring
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
}

/**
 * The payload used by Al-Watin to request authorization from the commercial billing/quota engine.
 */
export interface AuthorizationRequest {
  operationId: string;
  subscriberTenantId: string;
  capabilityTarget: CapabilityTarget;
  requiredCredits: number;
}

/**
 * The definitive response from the authorization layer.
 * If approved, the operation proceeds to the Fleet Gateway.
 */
export interface AuthorizationReceipt {
  operationId: string;
  isAuthorized: boolean;
  state: OperationState;
  reason?: string;
}