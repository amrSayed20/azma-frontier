import { nextArrivalRecord, recordArrival, getArrivalRecord } from '../arrival-record';

describe('Visitor Presence — Arrival Record', () => {
  describe('nextArrivalRecord (pure reducer)', () => {
    it('treats a null previous record as a genuine first arrival', () => {
      const record = nextArrivalRecord(null, 1000);
      expect(record).toEqual({
        arrivalCount: 1,
        firstArrivalAt: 1000,
        lastArrivalAt: 1000,
        isReturning: false,
      });
    });

    it('advances the count and marks the visitor as returning on a second arrival', () => {
      const first = nextArrivalRecord(null, 1000);
      const second = nextArrivalRecord(first, 5000);
      expect(second).toEqual({
        arrivalCount: 2,
        firstArrivalAt: 1000,
        lastArrivalAt: 5000,
        isReturning: true,
      });
    });

    it('preserves firstArrivalAt across many arrivals', () => {
      let record = nextArrivalRecord(null, 100);
      for (let now = 200; now <= 600; now += 100) {
        record = nextArrivalRecord(record, now);
      }
      expect(record.arrivalCount).toBe(6);
      expect(record.firstArrivalAt).toBe(100);
      expect(record.lastArrivalAt).toBe(600);
      expect(record.isReturning).toBe(true);
    });
  });

  describe('server-side safety (this codebase\'s test environment has no DOM)', () => {
    it('recordArrival never throws without window, and returns a first-arrival shape', () => {
      expect(typeof window).toBe('undefined');
      const record = recordArrival(42);
      expect(record).toEqual({
        arrivalCount: 1,
        firstArrivalAt: 42,
        lastArrivalAt: 42,
        isReturning: false,
      });
    });

    it('getArrivalRecord returns null without window rather than throwing', () => {
      expect(getArrivalRecord()).toBeNull();
    });
  });
});
