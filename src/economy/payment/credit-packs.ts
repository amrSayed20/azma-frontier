// AZMA OS — Credit Pack definitions.
// EGP pricing: Creator-facing Egyptian Pounds. Never expose USD or provider pricing.
// Pack IDs are stable — used as Stripe price/product metadata keys.

export interface CreditPack {
  readonly packId: 'start' | 'create' | 'achieve';
  readonly displayName: string;
  readonly azmaUnits: number;
  readonly priceEgp: number;            // Egyptian Pounds (whole number, no fractions)
  readonly stripePriceId: string | null; // null until configured in Stripe dashboard
  readonly description: string;
}

export const CREDIT_PACKS: readonly CreditPack[] = [
  {
    packId: 'start',
    displayName: 'START',
    azmaUnits: 800,
    priceEgp: 99,
    stripePriceId: null, // Set via STRIPE_PRICE_START env var
    description: 'Begin your creative journey',
  },
  {
    packId: 'create',
    displayName: 'CREATE',
    azmaUnits: 2400,
    priceEgp: 249,
    stripePriceId: null, // Set via STRIPE_PRICE_CREATE env var
    description: 'Power your creative workflow',
  },
  {
    packId: 'achieve',
    displayName: 'ACHIEVE',
    azmaUnits: 6000,
    priceEgp: 499,
    stripePriceId: null, // Set via STRIPE_PRICE_ACHIEVE env var
    description: 'Unlock your full creative potential',
  },
] as const;

export type CreditPackId = CreditPack['packId'];

export function getCreditPack(packId: CreditPackId): CreditPack {
  const pack = CREDIT_PACKS.find((p) => p.packId === packId);
  if (!pack) throw new Error(`Unknown credit pack: ${packId}`);
  return pack;
}

// Resolve Stripe price IDs from environment at runtime.
// Returns null if the price ID is not yet configured.
export function resolveStripePriceId(packId: CreditPackId): string | null {
  const envMap: Record<CreditPackId, string> = {
    start: process.env['STRIPE_PRICE_START'] ?? '',
    create: process.env['STRIPE_PRICE_CREATE'] ?? '',
    achieve: process.env['STRIPE_PRICE_ACHIEVE'] ?? '',
  };
  return envMap[packId] || null;
}
