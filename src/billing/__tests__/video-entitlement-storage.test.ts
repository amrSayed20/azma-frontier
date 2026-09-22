/**
 * AZMA OS — the video entitlement decision, against a real database.
 *
 * ─── WHY THIS EXISTS BESIDE entitlement-service.test.ts ─────────────────────
 *
 *   That suite mocks the repository and proves the RULE. This one opens a
 *   real SQLite file, writes a real subscription row through the real
 *   repository, and asks the real authority — because the Founder's ruling
 *   for generate-video (2026-09-22) turns on a distinction that lives in
 *   storage, not only in a branch:
 *
 *     Founder                    → allowed before any subscription
 *     Creator, subscription active → allowed
 *     Creator, no/inactive        → denied
 *
 *   A paid subscriber cannot be produced in production without a real
 *   payment, so this is the strongest honest proof of that case: the row a
 *   real Stripe webhook would write, read back by the real code path.
 */

import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('generate-video entitlement, read from a real database', () => {
  const previousPath = process.env.AZMA_DB_PATH;
  let hasActiveEntitlement: (creatorId: string, role: 'creator' | 'founder') => boolean;
  let db: import('node:sqlite').DatabaseSync;
  let createSubscription: typeof import('../../persistent-storage/subscription-repository').createSubscription;
  let updateSubscription: typeof import('../../persistent-storage/subscription-repository').updateSubscription;

  beforeAll(() => {
    // Set before the storage module is ever loaded: getDb reads the path at
    // call time precisely so a caller may decide it.
    process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-entitlement-')), 'entitlement.db');
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const storage = require('../../persistent-storage');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const subs = require('../../persistent-storage/subscription-repository');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ hasActiveEntitlement } = require('../entitlement-service'));
      db = storage.getDb();
      createSubscription = subs.createSubscription;
      updateSubscription = subs.updateSubscription;
    });
  });

  afterAll(() => {
    if (previousPath === undefined) delete process.env.AZMA_DB_PATH;
    else process.env.AZMA_DB_PATH = previousPath;
  });

  it('CASE A · the Founder is entitled with no subscription row at all', () => {
    expect(hasActiveEntitlement('founder-real', 'founder')).toBe(true);
  });

  it('CASE C · an authenticated Creator with no subscription row is denied', () => {
    expect(hasActiveEntitlement('creator-unpaid', 'creator')).toBe(false);
  });

  it('CASE B · a Creator with a real active subscription row is entitled', () => {
    const created = createSubscription(db, {
      subscriptionId: 'sub-proof-row',
      creatorId: 'creator-paid',
      stripeCustomerId: 'cus_proof',
      stripeSubscriptionId: 'sub_proof',
      status: 'active',
      plan: 'creator-monthly',
      currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    expect(created.status).toBe('active');
    expect(hasActiveEntitlement('creator-paid', 'creator')).toBe(true);
  });

  it('CASE C′ · the same Creator is denied the moment the subscription stops being active', () => {
    updateSubscription(db, 'sub-proof-row', { status: 'canceled' });
    expect(hasActiveEntitlement('creator-paid', 'creator')).toBe(false);
    // …and the Founder is unaffected by any of it.
    expect(hasActiveEntitlement('founder-real', 'founder')).toBe(true);
  });
});
