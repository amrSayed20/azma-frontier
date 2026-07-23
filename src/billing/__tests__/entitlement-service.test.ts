jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  getSubscriptionByCreator: jest.fn(),
}));

import { getSubscriptionByCreator } from '../../persistent-storage';
import { hasActiveEntitlement } from '../entitlement-service';

const mockGetSubscriptionByCreator = getSubscriptionByCreator as jest.Mock;

describe('Billing Foundation — Entitlement Verification', () => {
  beforeEach(() => {
    mockGetSubscriptionByCreator.mockReset();
  });

  it('always entitles a Founder, regardless of subscription state', () => {
    mockGetSubscriptionByCreator.mockReturnValue(null);
    expect(hasActiveEntitlement('founder-1', 'founder')).toBe(true);
    expect(mockGetSubscriptionByCreator).not.toHaveBeenCalled();
  });

  it('entitles a Creator with an active subscription', () => {
    mockGetSubscriptionByCreator.mockReturnValue({ status: 'active' });
    expect(hasActiveEntitlement('creator-1', 'creator')).toBe(true);
  });

  it('denies a Creator with no subscription at all', () => {
    mockGetSubscriptionByCreator.mockReturnValue(null);
    expect(hasActiveEntitlement('creator-2', 'creator')).toBe(false);
  });

  it('denies a Creator whose subscription is past_due', () => {
    mockGetSubscriptionByCreator.mockReturnValue({ status: 'past_due' });
    expect(hasActiveEntitlement('creator-3', 'creator')).toBe(false);
  });

  it('denies a Creator whose subscription is canceled', () => {
    mockGetSubscriptionByCreator.mockReturnValue({ status: 'canceled' });
    expect(hasActiveEntitlement('creator-4', 'creator')).toBe(false);
  });
});
