/**
 * What the gateway is handed by the server, and nothing more.
 *
 * Both shapes are deliberately narrow: the policies arrive already filtered to
 * what is genuinely published, and the packages arrive already read from
 * `SOVEREIGN_PACKAGES`. The client restates neither, so a price or a legal
 * text cannot drift by being typed twice.
 */

export interface GatewayPolicy {
  readonly slug: string;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly version: string;
  /** The tongue the BODY is written in — not the reader's chosen one. */
  readonly language: 'ar' | 'en';
  /** The ratified text, exactly as held. Never edited in transit. */
  readonly body: string;
}

export interface GatewayPackage {
  readonly packageId: string;
  readonly nameAr: string;
  readonly priceEgp: number;
  readonly balanceUnits: number;
}

/** How ready a chamber truly is. Three states, and no fourth that flatters. */
export type ChamberState = 'ready' | 'partial' | 'closed';

export interface GatewayChamber {
  readonly id: string;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly roleAr: string;
  readonly roleEn: string;
  readonly bodyAr: string;
  readonly bodyEn: string;
  readonly relationAr: string;
  readonly relationEn: string;
  readonly state: ChamberState;
  /** The limit a visitor is owed before they rely on it. Null when there is none. */
  readonly limitAr: string | null;
  readonly limitEn: string | null;
}
