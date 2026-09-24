/**
 * AZMA OS — what the Empire has actually done, counted from its own records.
 *
 * ─── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 *   SEEN on production 2026-09-24, on the Council's own screen:
 *
 *     «وعي المال»    — الإيراد والكلفة
 *                      showed «Forecast projects strategic resilience when
 *                      advisory recommendations are adopted...» while every
 *                      Stripe key was missing and no Creator could pay.
 *     «وعي الموارد»  — المعالجة والذاكرة والتخزين
 *                      showed «Recommended path maximizes constitutional
 *                      safety...» while the heap sat at 96%.
 *     «توزيع العطايا» — المكافآت والاشتراكات
 *                      showed «Strategic recommendations: 3».
 *
 *   Each hall carried a name and displayed whichever runtime sentence was
 *   nearest to hand. The name was a heading, not a promise.
 *
 *   The Founder's instruction: a report reaching the Council must be لسان صدق
 *   وبرهان — truthful speech, and proof with it. So every figure here is a
 *   count taken from the Empire's own tables at the moment of asking, and it
 *   is carried to the screen beside the claim it supports. Nothing is
 *   inferred, nothing is defaulted, and a table that cannot be read reports
 *   `null` rather than zero — because «none» and «I could not look» are
 *   different answers and a Council must not confuse them.
 */

import type { DatabaseSync } from 'node:sqlite';

export interface EmpireFacts {
  readonly creators: number | null;
  readonly activeSessions: number | null;
  /** Subscriptions whose status the billing path considers live. */
  readonly activeSubscriptions: number | null;
  readonly totalSubscriptions: number | null;
  /** Payments that actually settled, and what they came to. */
  readonly settledPayments: number | null;
  readonly settledAmountMinor: number | null;
  readonly generations: number | null;
  readonly vaultAssets: number | null;
  readonly investigations: number | null;
  readonly readFailed: boolean;
}

function count(db: DatabaseSync, sql: string, ...params: unknown[]): number | null {
  try {
    const row = db.prepare(sql).get(...params) as { c?: number } | undefined;
    return typeof row?.c === 'number' ? row.c : null;
  } catch {
    // A table this deployment does not have is not a zero.
    return null;
  }
}

export function readEmpireFacts(db: DatabaseSync, now: number = Date.now()): EmpireFacts {
  const creators = count(db, 'SELECT COUNT(*) as c FROM creators');
  const settled = (() => {
    try {
      const row = db
        .prepare("SELECT COUNT(*) as c, COALESCE(SUM(amount_minor), 0) as total FROM payment_transactions WHERE status = 'succeeded'")
        .get() as { c?: number; total?: number } | undefined;
      return { c: typeof row?.c === 'number' ? row.c : null, total: typeof row?.total === 'number' ? row.total : null };
    } catch {
      return { c: null, total: null };
    }
  })();

  return {
    creators,
    activeSessions: count(db, 'SELECT COUNT(*) as c FROM sessions WHERE expires_at > ?', now),
    activeSubscriptions: count(db, "SELECT COUNT(*) as c FROM subscriptions WHERE status = 'active'"),
    totalSubscriptions: count(db, 'SELECT COUNT(*) as c FROM subscriptions'),
    settledPayments: settled.c,
    settledAmountMinor: settled.total,
    generations: count(db, 'SELECT COUNT(*) as c FROM generation_records'),
    vaultAssets: count(db, 'SELECT COUNT(*) as c FROM vault_assets'),
    investigations: count(db, 'SELECT COUNT(*) as c FROM knowledge_investigations'),
    readFailed: creators === null,
  };
}

/** A number the Council can trust, or an admission that it could not be taken. */
export function say(value: number | null, suffix = ''): string {
  return value === null ? 'تعذّر القياس' : `${value}${suffix}`;
}
