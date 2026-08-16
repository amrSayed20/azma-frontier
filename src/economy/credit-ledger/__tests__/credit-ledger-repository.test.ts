import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../../persistent-storage/db';
import { CreatorCreditRepository } from '../credit-ledger-repository';
import {
  InsufficientBalanceError,
  ReservationNotFoundError,
  SettlementExceedsReservationError,
} from '../credit-ledger-types';

let db: DatabaseSync;
let repo: CreatorCreditRepository;

const CREATOR = 'creator-test-001';
const CREATOR_B = 'creator-test-002';

beforeEach(() => {
  db = createDatabase(':memory:');
  repo = new CreatorCreditRepository(db);
});

afterEach(() => {
  db.close();
});

// ── SCENARIO 1: Zero balance for new Creator ──────────────────────────────────
describe('getBalance', () => {
  it('returns zero balance for a Creator who has never transacted', () => {
    const bal = repo.getBalance(CREATOR);
    expect(bal.creatorId).toBe(CREATOR);
    expect(bal.availableUnits).toBe(0);
    expect(bal.reservedUnits).toBe(0);
    expect(bal.totalPurchased).toBe(0);
    expect(bal.totalSpent).toBe(0);
  });
});

// ── SCENARIO 2: Credit (purchase) ────────────────────────────────────────────
describe('creditUnits — purchase', () => {
  it('credits AZMA units to a Creator balance', () => {
    const bal = repo.creditUnits(CREATOR, 800, 'purchase', 'idem-001');
    expect(bal.availableUnits).toBe(800);
    expect(bal.totalPurchased).toBe(800);
    expect(bal.reservedUnits).toBe(0);
    expect(bal.totalSpent).toBe(0);
  });

  // SCENARIO 3: Idempotent credit
  it('is idempotent — same idempotency key grants units only once', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-002');
    const bal = repo.creditUnits(CREATOR, 800, 'purchase', 'idem-002');
    // Balance must remain 800, not 1600
    expect(bal.availableUnits).toBe(800);
    expect(bal.totalPurchased).toBe(800);
  });

  it('credits multiple times with distinct keys, accumulating balance', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-003a');
    const bal = repo.creditUnits(CREATOR, 2400, 'purchase', 'idem-003b');
    expect(bal.availableUnits).toBe(3200);
    expect(bal.totalPurchased).toBe(3200);
  });

  // SCENARIO 4: Grant (trial)
  it('records a grant transaction type correctly', () => {
    repo.creditUnits(CREATOR, 50, 'grant', 'idem-grant-001');
    const history = repo.getLedgerHistory(CREATOR);
    expect(history[0].transactionType).toBe('grant');
  });
});

// ── SCENARIO 5: Reserve ───────────────────────────────────────────────────────
describe('reserve', () => {
  beforeEach(() => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-setup-001');
  });

  it('reserves units and deducts from available balance', () => {
    const result = repo.reserve(CREATOR, 40, 'res-idem-001');
    expect(result.reservationId).toBeTruthy();
    expect(result.reservedUnits).toBe(40);
    expect(result.availableAfterReservation).toBe(760);

    const bal = repo.getBalance(CREATOR);
    expect(bal.availableUnits).toBe(760);
    expect(bal.reservedUnits).toBe(40);
  });

  // SCENARIO 6: Insufficient balance
  it('throws InsufficientBalanceError when balance is too low', () => {
    expect(() => repo.reserve(CREATOR, 1000, 'res-idem-002')).toThrow(InsufficientBalanceError);
    // Balance must not change after failed reservation
    const bal = repo.getBalance(CREATOR);
    expect(bal.availableUnits).toBe(800);
    expect(bal.reservedUnits).toBe(0);
  });

  // SCENARIO 7: Idempotent reservation
  it('is idempotent — same idempotency key returns the existing reservation', () => {
    const r1 = repo.reserve(CREATOR, 40, 'res-idem-003');
    const r2 = repo.reserve(CREATOR, 40, 'res-idem-003');
    expect(r1.reservationId).toBe(r2.reservationId);
    // Balance must not be doubly deducted
    const bal = repo.getBalance(CREATOR);
    expect(bal.availableUnits).toBe(760);
    expect(bal.reservedUnits).toBe(40);
  });

  it('allows multiple simultaneous reservations', () => {
    repo.reserve(CREATOR, 40, 'res-multi-001');
    repo.reserve(CREATOR, 40, 'res-multi-002');
    const bal = repo.getBalance(CREATOR);
    expect(bal.availableUnits).toBe(720);
    expect(bal.reservedUnits).toBe(80);
  });
});

// ── SCENARIO 8: Settle ───────────────────────────────────────────────────────
describe('settle', () => {
  it('settles a reservation exactly — no surplus release', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-s-001');
    const { reservationId } = repo.reserve(CREATOR, 40, 'res-s-001');
    const result = repo.settle(reservationId, 40);
    expect(result.settledUnits).toBe(40);
    expect(result.releasedUnits).toBe(0);

    const bal = repo.getBalance(CREATOR);
    expect(bal.availableUnits).toBe(760);
    expect(bal.reservedUnits).toBe(0);
    expect(bal.totalSpent).toBe(40);
  });

  // SCENARIO 9: Partial settlement — surplus returned
  it('settles less than reserved — returns surplus to available', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-s-002');
    const { reservationId } = repo.reserve(CREATOR, 40, 'res-s-002');
    const result = repo.settle(reservationId, 30);
    expect(result.settledUnits).toBe(30);
    expect(result.releasedUnits).toBe(10);

    const bal = repo.getBalance(CREATOR);
    // 800 - 40 reserved + 10 released = 770
    expect(bal.availableUnits).toBe(770);
    expect(bal.reservedUnits).toBe(0);
    expect(bal.totalSpent).toBe(30);
  });

  // SCENARIO 10: Settlement exceeds reservation
  it('throws SettlementExceedsReservationError when actual > reserved', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-s-003');
    const { reservationId } = repo.reserve(CREATOR, 40, 'res-s-003');
    expect(() => repo.settle(reservationId, 41)).toThrow(SettlementExceedsReservationError);
  });

  // SCENARIO 11: Settle non-existent reservation
  it('throws ReservationNotFoundError for an unknown reservation ID', () => {
    expect(() => repo.settle('non-existent-id', 10)).toThrow(ReservationNotFoundError);
  });
});

// ── SCENARIO 12: Release ─────────────────────────────────────────────────────
describe('release', () => {
  it('releases a pending reservation — units return to available', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-r-001');
    const { reservationId } = repo.reserve(CREATOR, 40, 'res-r-001');
    repo.release(reservationId, 'test_release');

    const bal = repo.getBalance(CREATOR);
    expect(bal.availableUnits).toBe(800);
    expect(bal.reservedUnits).toBe(0);
    expect(bal.totalSpent).toBe(0);
  });

  // SCENARIO 13: Idempotent release
  it('is idempotent — releasing the same reservation twice is a no-op', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-r-002');
    const { reservationId } = repo.reserve(CREATOR, 40, 'res-r-002');
    repo.release(reservationId);
    repo.release(reservationId); // second call must not throw or corrupt balance
    const bal = repo.getBalance(CREATOR);
    expect(bal.availableUnits).toBe(800);
  });

  it('releasing a non-existent reservation is a silent no-op', () => {
    expect(() => repo.release('totally-unknown-id')).not.toThrow();
  });
});

// ── SCENARIO 14: Ledger history ───────────────────────────────────────────────
describe('getLedgerHistory', () => {
  it('returns all transactions for a Creator in descending order', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-h-001');
    const { reservationId } = repo.reserve(CREATOR, 40, 'res-h-001');
    repo.settle(reservationId, 40);

    const history = repo.getLedgerHistory(CREATOR);
    expect(history.length).toBeGreaterThanOrEqual(2);
    // Most recent first
    expect(history[0].createdAt).toBeGreaterThanOrEqual(history[1].createdAt);
  });

  // SCENARIO 15: Tenant isolation
  it('does not return transactions from other Creators', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-iso-001');
    repo.creditUnits(CREATOR_B, 2400, 'purchase', 'idem-iso-002');

    const histA = repo.getLedgerHistory(CREATOR);
    const histB = repo.getLedgerHistory(CREATOR_B);

    expect(histA.every((e) => e.creatorId === CREATOR)).toBe(true);
    expect(histB.every((e) => e.creatorId === CREATOR_B)).toBe(true);
  });
});

// ── SCENARIO 16: Atomic race protection ──────────────────────────────────────
describe('atomic race protection', () => {
  it('cannot overdraw: sequential reservations that total exactly the balance succeed; the overdrawing one fails', () => {
    repo.creditUnits(CREATOR, 80, 'purchase', 'idem-race-001');
    const r1 = repo.reserve(CREATOR, 40, 'res-race-001');
    const r2 = repo.reserve(CREATOR, 40, 'res-race-002');
    expect(r1.reservationId).toBeTruthy();
    expect(r2.reservationId).toBeTruthy();

    // Third reservation must fail — balance is fully reserved
    expect(() => repo.reserve(CREATOR, 1, 'res-race-003')).toThrow(InsufficientBalanceError);
  });
});

// ── SCENARIO 17: Ledger immutability ─────────────────────────────────────────
describe('ledger immutability', () => {
  it('ledger entry balance_after snapshots are preserved independent of later transactions', () => {
    repo.creditUnits(CREATOR, 800, 'purchase', 'idem-imm-001');
    const { reservationId } = repo.reserve(CREATOR, 40, 'res-imm-001');
    repo.settle(reservationId, 40);
    repo.creditUnits(CREATOR, 200, 'purchase', 'idem-imm-002');

    // The first purchase entry must still show balance_after=800, not affected by later ops
    const history = repo.getLedgerHistory(CREATOR, 50);
    const purchaseEntry = history.find(
      (e) => e.transactionType === 'purchase' && e.idempotencyKey === 'idem-imm-001',
    );
    expect(purchaseEntry?.balanceAfter).toBe(800);
  });
});
