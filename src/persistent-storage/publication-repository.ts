/**
 * AZMA OS — THE DURABLE SOVEREIGN PUBLICATION
 *
 * Implements `IPublicationStore`, declared in the chamber (consumption-boundary.ts)
 * so the chamber never imports from persistent-storage — the same inversion
 * `GoalRepository` serves for `IGoalRepository`.
 *
 * ─── WHAT THIS REPLACES, AND WHY IT IS NOT A NEW ARCHITECTURE ───────────────
 *
 *   `MakmanPublicationRegistry` held `new Map<string, SovereignPublication>()`,
 *   and its own contract named the replacement: «In production, this maps to
 *   the database repository holding the master catalog». This is that
 *   repository. The registry's interface is untouched.
 *
 * ─── AND WHAT IT IS NOT ─────────────────────────────────────────────────────
 *
 *   Not the cinematic ledger. That records a production EVENT — what was made,
 *   when, with which render status. This holds the publication's current
 *   STATE: its access policy, whether it is live, and when it is due. Neither
 *   can answer the other's question, and neither is copied into the other.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { IPublicationStore } from '../chambers/makman-al-ghayah/consumption-boundary';
import type {
  SovereignPublication,
  AccessPolicy,
  DistributionTier,
} from '../chambers/makman-al-ghayah/publication-contracts';

type Row = {
  publication_id: string;
  publisher_tenant_id: string;
  source_compilation_id: string;
  title: string;
  description: string;
  cover_art_uri: string | null;
  distribution_tier: string;
  pricing_base_price: number | null;
  pricing_currency: string | null;
  pricing_rental_duration_hours: number | null;
  geo_restrictions_json: string | null;
  requires_age_verification: number;
  is_published: number;
  published_at: number | null;
  scheduled_publish_at: number | null;
  created_at: number;
  updated_at: number;
};

function rowToPublication(r: Row): SovereignPublication {
  const accessPolicy: AccessPolicy = {
    distributionTier: r.distribution_tier as DistributionTier,
    requiresAgeVerification: r.requires_age_verification === 1,
    // A price is restored only when one was recorded. A tier with no pricing
    // must not acquire a zero — zero is a price, and «no price» is not.
    ...(r.pricing_base_price !== null && r.pricing_currency !== null
      ? {
          pricing: {
            basePrice: r.pricing_base_price,
            currency: r.pricing_currency,
            ...(r.pricing_rental_duration_hours !== null
              ? { rentalDurationHours: r.pricing_rental_duration_hours }
              : {}),
          },
        }
      : {}),
    ...(r.geo_restrictions_json
      ? { geoRestrictions: JSON.parse(r.geo_restrictions_json) as string[] }
      : {}),
  };

  return {
    publicationId: r.publication_id,
    sourceCompilationId: r.source_compilation_id,
    publisherTenantId: r.publisher_tenant_id,
    title: r.title,
    description: r.description,
    ...(r.cover_art_uri !== null ? { coverArtUri: r.cover_art_uri } : {}),
    accessPolicy,
    isPublished: r.is_published === 1,
    ...(r.published_at !== null ? { publishedAt: r.published_at } : {}),
    ...(r.scheduled_publish_at !== null ? { scheduledPublishAt: r.scheduled_publish_at } : {}),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const SELECT =
  `SELECT publication_id, publisher_tenant_id, source_compilation_id, title, description,
          cover_art_uri, distribution_tier, pricing_base_price, pricing_currency,
          pricing_rental_duration_hours, geo_restrictions_json, requires_age_verification,
          is_published, published_at, scheduled_publish_at, created_at, updated_at
   FROM sovereign_publications`;

export class PublicationRepository implements IPublicationStore {
  constructor(private readonly db: DatabaseSync) {}

  public save(p: SovereignPublication): void {
    const policy = p.accessPolicy;
    this.db
      .prepare(
        `INSERT OR REPLACE INTO sovereign_publications (
           publication_id, publisher_tenant_id, source_compilation_id, title, description,
           cover_art_uri, distribution_tier, pricing_base_price, pricing_currency,
           pricing_rental_duration_hours, geo_restrictions_json, requires_age_verification,
           is_published, published_at, scheduled_publish_at, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        p.publicationId,
        p.publisherTenantId,
        p.sourceCompilationId,
        p.title,
        p.description,
        p.coverArtUri ?? null,
        policy.distributionTier,
        policy.pricing?.basePrice ?? null,
        policy.pricing?.currency ?? null,
        policy.pricing?.rentalDurationHours ?? null,
        policy.geoRestrictions ? JSON.stringify(policy.geoRestrictions) : null,
        policy.requiresAgeVerification ? 1 : 0,
        p.isPublished ? 1 : 0,
        p.publishedAt ?? null,
        p.scheduledPublishAt ?? null,
        p.createdAt,
        p.updatedAt,
      );
  }

  public findById(publicationId: string): SovereignPublication | null {
    const row = this.db.prepare(`${SELECT} WHERE publication_id = ?`).get(publicationId) as
      | unknown as Row | undefined;
    return row ? rowToPublication(row) : null;
  }

  /**
   * One owner's publications whose moment has arrived and which are not live.
   *
   * `scheduled_publish_at <= ?` rather than `= ?`: a publication whose time
   * passed while the server was down is still due, and must not be lost
   * because nobody was awake at the instant it came round.
   */
  public findDueForTenant(publisherTenantId: string, nowMs: number): readonly SovereignPublication[] {
    const rows = this.db
      .prepare(
        `${SELECT} WHERE publisher_tenant_id = ?
           AND is_published = 0
           AND scheduled_publish_at IS NOT NULL
           AND scheduled_publish_at <= ?
         ORDER BY scheduled_publish_at ASC`,
      )
      .all(publisherTenantId, nowMs) as unknown as Row[];
    return rows.map(rowToPublication);
  }

  /**
   * Make it live, exactly once.
   *
   * ─── THIS IS THE IDEMPOTENCY GUARANTEE ────────────────────────────────────
   *
   *   The condition lives in the WHERE clause, not in a read-then-write in
   *   application code. Two observers of the same due publication both issue
   *   this UPDATE; SQLite applies one, reports `changes = 1` to it and
   *   `changes = 0` to the other. The second records no event and announces
   *   nothing, with no lock and no job system.
   *
   *   `scheduled_publish_at <= ?` is re-checked HERE as well as in the query
   *   that found it: a caller must not be able to publish early by handing in
   *   an id it obtained some other way.
   */
  public markPublished(publicationId: string, nowMs: number): boolean {
    const result = this.db
      .prepare(
        `UPDATE sovereign_publications
         SET is_published = 1, published_at = ?, updated_at = ?
         WHERE publication_id = ?
           AND is_published = 0
           AND scheduled_publish_at IS NOT NULL
           AND scheduled_publish_at <= ?`,
      )
      .run(nowMs, nowMs, publicationId, nowMs);
    return Number(result.changes) > 0;
  }
}
