/**
 * AZMA OS — OD-002: the Empire stops knocking on a door it locked itself.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   Walking the Creator journey with Playwright against production, every
 *   visitor opening /signup without a session saw this in their console:
 *
 *       401 https://azmaos.com/api/sovereign/nervous-system/circulate
 *       401 https://azmaos.com/api/sovereign/nervous-system/circulate
 *
 *   The 401 is correct and is NOT changed by any of this. That route was given
 *   a session requirement because an unauthenticated caller could push entries
 *   into the live process's Perception Bus until it ran out of memory.
 *
 *   The defect was the calling side. The route's own comment asserted that
 *   "every browser that legitimately calls circulateFromClient() is a signed-in
 *   Creator" — untrue, since DirectorStage is mounted in the root layout and
 *   therefore circulates for anonymous visitors on the first page they see.
 *
 *   What these tests hold: the refusal is believed once, local emission never
 *   stops, and nothing here can be mistaken for a way to make the endpoint
 *   public.
 */

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

import { circulateFromClient, resetCirculationRefusalForTests } from '../transport';
import { getSignalLog } from '../../sovereign-nervous-system';

const ORIGIN = 'hujjah-al-damighah';

function draft(purpose: string) {
  return {
    origin: ORIGIN,
    signalType: 'Health' as const,
    relatedEvent: null,
    reportingAuthority: ORIGIN,
    purpose,
    content: null,
  };
}

/** A browser runtime, since the transport only circulates in one. */
const asBrowser = () => {
  if (typeof globalThis.window === 'undefined') {
    Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
  }
};

beforeEach(() => {
  asBrowser();
  resetCirculationRefusalForTests();
  fetchMock.mockReset();
});

describe('a refusal is believed once', () => {
  it('stops circulating after the server answers 401', async () => {
    fetchMock.mockResolvedValue({ status: 401 });

    circulateFromClient(draft('first'));
    // The latch is set by the fetch's own resolution, so let it settle.
    await Promise.resolve(); await Promise.resolve();

    circulateFromClient(draft('second'));
    circulateFromClient(draft('third'));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('stops on 403 as well', async () => {
    fetchMock.mockResolvedValue({ status: 403 });
    circulateFromClient(draft('a'));
    await Promise.resolve(); await Promise.resolve();
    circulateFromClient(draft('b'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps circulating for a Creator the server accepts', async () => {
    fetchMock.mockResolvedValue({ status: 200 });
    circulateFromClient(draft('one'));
    await Promise.resolve(); await Promise.resolve();
    circulateFromClient(draft('two'));
    await Promise.resolve(); await Promise.resolve();
    circulateFromClient(draft('three'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('a network failure is NOT a refusal — the Empire tries again', async () => {
    // A dropped connection says nothing about authority. Latching on it would
    // silence a signed-in Creator's signals for the rest of the page's life.
    fetchMock.mockRejectedValue(new Error('offline'));
    circulateFromClient(draft('x'));
    await Promise.resolve(); await Promise.resolve();
    circulateFromClient(draft('y'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('local emission is untouched', () => {
  it('records the signal locally even when the server refuses', async () => {
    fetchMock.mockResolvedValue({ status: 401 });

    const before = getSignalLog().length;
    const signal = circulateFromClient(draft('seen locally'));
    await Promise.resolve(); await Promise.resolve();
    circulateFromClient(draft('also seen locally'));

    expect(signal.purpose).toBe('seen locally');
    expect(getSignalLog().length).toBe(before + 2);
  });

  it('returns a real signal to its caller, refused or not', async () => {
    fetchMock.mockResolvedValue({ status: 401 });
    const first = circulateFromClient(draft('p'));
    await Promise.resolve(); await Promise.resolve();
    const second = circulateFromClient(draft('q'));

    for (const s of [first, second]) {
      expect(s.origin).toBe(ORIGIN);
      expect(s.signalId).toBeTruthy();
    }
  });
});
