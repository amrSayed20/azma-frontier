// AZMA Cost Engine — type contracts.
// The Creator sees AZMA Units. Provider costs and USD amounts never surface here.

export type CapabilityTarget =
  | 'image-generation'
  | 'image-editing'
  | 'image-upscaling'
  | 'video-generation'
  | 'text-to-speech'
  | 'voice-cloning';

export type CostAvailability = 'available' | 'pending-discovery' | 'unavailable';

// One entry in the provider cost catalog for a capability × gateway combination.
export interface ProviderCostEntry {
  readonly gatewayId: string;               // e.g. 'magic-hour'
  readonly capabilityTarget: CapabilityTarget;
  readonly azmaUnitsPerUnit: number;        // AZMA Units per creation unit
  readonly unitDescription: string;         // e.g. '1 image', '4-second video clip'
  readonly availability: CostAvailability;
  readonly catalogVersion: string;          // semver — bump whenever costs change
  readonly effectiveFrom: number;           // Unix ms
  // Provider-internal credit cost (audit only — never exposed to Creator).
  // For Magic Hour: Magic Hour credits per unit. Used to reconcile after completion.
  // Null = not yet discovered.
  readonly providerCreditCost?: number | null;
  readonly providerCreditUnit?: string;     // e.g. 'magic-hour-credits', 'openai-usd'
  readonly notes?: string;
}

// Versioned catalog — replaces the whole catalog on update.
export interface ProviderCostCatalog {
  readonly catalogVersion: string;
  readonly publishedAt: number;
  readonly entries: readonly ProviderCostEntry[];
}

// What callers get when they request a cost estimate.
export interface CostEstimate {
  readonly capabilityTarget: CapabilityTarget;
  readonly gatewayId: string;
  readonly estimatedAzmaUnits: number;
  readonly availability: CostAvailability;
  readonly unitDescription: string;
  readonly catalogVersion: string;
}

// What callers get when they request the cost to be reserved.
export interface ReservableEstimate extends CostEstimate {
  readonly canProceed: boolean; // false if availability !== 'available' or balance < cost
  readonly blockerReason?: string;
}

export class CostUnavailableError extends Error {
  constructor(
    readonly capabilityTarget: CapabilityTarget,
    readonly gatewayId: string,
    readonly availability: CostAvailability,
  ) {
    super(
      `Cost unavailable for ${capabilityTarget} via ${gatewayId}: ${availability}. ` +
      'Cannot proceed without prior cost knowledge (NO COST WITHOUT PRIOR KNOWLEDGE).',
    );
    this.name = 'CostUnavailableError';
  }
}

export class GatewayNotFoundError extends Error {
  constructor(readonly gatewayId: string, readonly capabilityTarget: CapabilityTarget) {
    super(`No cost catalog entry found for gateway '${gatewayId}' capability '${capabilityTarget}'`);
    this.name = 'GatewayNotFoundError';
  }
}
