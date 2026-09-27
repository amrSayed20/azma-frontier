// AZMA OS — the packages a Creator can buy, and their prices.
//
// ─── ONE PRICE RECORD, AND IT IS THIS ONE ───────────────────────────────────
//
//   The webhook derives the amount it expects, and the Balance it grants,
//   from this file. If a second price record existed anywhere, a payment
//   could be taken at one price and honoured at another, and both records
//   would look correct in isolation.
//
//   FINAL FOUNDER DECISION, 2026-09-27. These superseded START/CREATE/ACHIEVE
//   (800 / 2,400 / 6,000 units at 99 / 249 / 499 EGP), which were never sold:
//   no payment gateway has ever been configured on this server.
//
//   The four definitions live in the pricing layer, which owns the sovereign
//   unit. This file adapts them to the payment boundary's shape rather than
//   restating the numbers — a price written twice is a price that will
//   eventually disagree with itself.

import { SOVEREIGN_PACKAGES, type SovereignPackage } from '../pricing/sovereign-value-balance';

export interface CreditPack {
  readonly packId: string;
  readonly displayName: string;
  /** Units of ميزان القيمة السيادي granted on payment. */
  readonly azmaUnits: number;
  readonly priceEgp: number;
  readonly description: string;
  /** Only الريادة expires; see the Balance policy. */
  readonly validity: SovereignPackage['validity'];
}

const DESCRIPTION: Readonly<Record<string, string>> = {
  asas: 'بداية الطريق',
  irtiqaa: 'خطوة أوسع',
  ihtiraf: 'للعمل المتّصل',
  riyada: 'باقة ستّة أشهر',
};

export const CREDIT_PACKS: readonly CreditPack[] = SOVEREIGN_PACKAGES.map((p) => ({
  packId: p.packageId,
  displayName: p.nameAr,
  azmaUnits: p.balanceUnits,
  priceEgp: p.priceEgp,
  description: DESCRIPTION[p.packageId] ?? p.nameAr,
  validity: p.validity,
}));

export type CreditPackId = string;

export function getCreditPack(packId: CreditPackId): CreditPack {
  const pack = CREDIT_PACKS.find((p) => p.packId === packId);
  if (!pack) throw new Error(`Unknown package: ${packId}`);
  return pack;
}

export const VALID_PACK_IDS: readonly string[] = CREDIT_PACKS.map((p) => p.packId);
