/**
 * AZMA OS - Phase 6: Makman Al-Ghayah Distribution Architecture
 * File: src/chambers/makman-al-ghayah/monetization-ledger-gateway.ts
 * 
 * The Monetization & Subscription Ledger Gateway.
 * The financial and entitlement authority. Records agnostic commercial events,
 * manages consumer access rights, and generates immutable revenue lineage.
 */

import { PricingModel } from './publication-contracts';
import { ConsumerContext, ActiveRental } from './access-policy-engine';

// ==========================================
// 1. LEDGER CONTRACTS & MODELS
// ==========================================

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  RENTAL = 'RENTAL',
  SUBSCRIPTION_FEE = 'SUBSCRIPTION_FEE',
  CREATOR_GRANT = 'CREATOR_GRANT' // For manually gifted access
}

/**
 * The immutable financial record bridging a consumer, a creator, and an asset.
 */
export interface CommercialTransactionRecord {
  readonly transactionId: string;
  readonly consumerTenantId: string;
  readonly publisherTenantId: string;
  readonly publicationId?: string; // Optional for platform-wide subscriptions
  readonly transactionType: TransactionType;
  
  // Financial Data
  readonly amount: number;
  readonly currency: string;
  
  // Provider Agnostic Traceability
  readonly externalProviderId?: string; // e.g., 'STRIPE', 'PAYPAL'
  readonly externalReceiptId?: string;  // The physical receipt from the gateway
  
  readonly timestampMs: number;
}

/**
 * Internal entitlement representation for time-bound subscriptions.
 */
export interface SubscriptionEntitlement {
  readonly publisherTenantId: string;
  readonly expiryTimestampMs: number;
}

// ==========================================
// 2. THE MONETIZATION GATEWAY
// ==========================================

export class MonetizationLedgerGateway {
  
  // Note: In production, these memory structures map to secure, distributed Vault Ledgers.
  private readonly transactionLedger: CommercialTransactionRecord[] = [];
  private readonly ownedPurchases = new Map<string, Set<string>>(); // consumerTenantId -> publicationIds
  private readonly activeRentals = new Map<string, ActiveRental[]>(); // consumerTenantId -> ActiveRentals
  private readonly activeSubscriptions = new Map<string, SubscriptionEntitlement[]>(); // consumerTenantId -> Entitlements

  /**
   * Hydrates the unified ConsumerContext required by the Sovereign Access Policy Engine.
   * Traverses the ledger to build a real-time profile of the consumer's entitlements.
   */
  public async hydrateConsumerContext(
    consumerTenantId: string,
    isAgeVerified: boolean = false,
    isoCountryCode?: string
  ): Promise<ConsumerContext> {
    
    const now = Date.now();

    // 1. Resolve Purchases
    const purchases = this.ownedPurchases.get(consumerTenantId);
    const ownedPurchasesArray = purchases ? Array.from(purchases) : [];

    // 2. Resolve Rentals (Filtering out expired ones)
    const rentals = this.activeRentals.get(consumerTenantId) || [];
    const validRentals = rentals.filter(r => r.expiryTimestampMs > now);

    // 3. Resolve Subscriptions (Filtering out expired ones)
    const subscriptions = this.activeSubscriptions.get(consumerTenantId) || [];
    const validSubscriptions = subscriptions
      .filter(s => s.expiryTimestampMs > now)
      .map(s => s.publisherTenantId);

    return {
      consumerId: consumerTenantId, 
      consumerTenantId: consumerTenantId,
      isAgeVerified,
      isoCountryCode,
      ownedPurchases: ownedPurchasesArray,
      activeRentals: validRentals,
      activeSubscriptions: validSubscriptions
    };
  }

  // ==========================================
  // 3. TRANSACTION RECORDING (WRITES)
  // ==========================================

  public async recordPurchase(
    consumerTenantId: string,
    publisherTenantId: string,
    publicationId: string,
    pricing: PricingModel,
    externalReceiptId: string,
    externalProviderId: string
  ): Promise<CommercialTransactionRecord> {
    
    const transaction = this.createTransactionRecord(
      consumerTenantId, publisherTenantId, TransactionType.PURCHASE, pricing, externalReceiptId, externalProviderId, publicationId
    );

    // Apply Entitlement
    if (!this.ownedPurchases.has(consumerTenantId)) {
      this.ownedPurchases.set(consumerTenantId, new Set());
    }
    this.ownedPurchases.get(consumerTenantId)!.add(publicationId);

    return transaction;
  }

  public async recordRental(
    consumerTenantId: string,
    publisherTenantId: string,
    publicationId: string,
    pricing: PricingModel,
    externalReceiptId: string,
    externalProviderId: string
  ): Promise<CommercialTransactionRecord> {
    
    if (!pricing.rentalDurationHours) {
      throw new Error(`Ledger Error: Rental transaction for Publication [${publicationId}] is missing rentalDurationHours.`);
    }

    const transaction = this.createTransactionRecord(
      consumerTenantId, publisherTenantId, TransactionType.RENTAL, pricing, externalReceiptId, externalProviderId, publicationId
    );

    const expiryTimestampMs = Date.now() + (pricing.rentalDurationHours * 60 * 60 * 1000);

    // Apply Entitlement
    const currentRentals = this.activeRentals.get(consumerTenantId) || [];
    currentRentals.push({ publicationId, expiryTimestampMs });
    this.activeRentals.set(consumerTenantId, currentRentals);

    return transaction;
  }

  // ==========================================
  // INTERNAL LEDGER UTILITIES
  // ==========================================

  private createTransactionRecord(
    consumerTenantId: string,
    publisherTenantId: string,
    type: TransactionType,
    pricing: PricingModel,
    externalReceiptId: string,
    externalProviderId: string,
    publicationId?: string
  ): CommercialTransactionRecord {
    
    const record: CommercialTransactionRecord = {
      transactionId: `tx_${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      consumerTenantId,
      publisherTenantId,
      publicationId,
      transactionType: type,
      amount: pricing.basePrice,
      currency: pricing.currency,
      externalProviderId,
      externalReceiptId,
      timestampMs: Date.now()
    };

    // Immutably append to ledger
    this.transactionLedger.push(record);
    
    // In production, this is where the gateway emits an event to Al-Watin's OperationLedgerManager
    // e.g., this.eventBus.emit('COMMERCIAL_TRANSACTION_COMPLETED', record);

    return record;
  }
}