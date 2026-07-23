jest.mock('../../authentication', () => ({
  verifySession: jest.fn(),
}));

import { verifySession } from '../../authentication';
import { verifyFounderSession } from '../founder-gate';

const mockVerifySession = verifySession as jest.Mock;

describe('Founder Access Foundation — The Founder Gate', () => {
  beforeEach(() => {
    mockVerifySession.mockReset();
  });

  it('returns null when no session id is supplied', () => {
    expect(verifyFounderSession(undefined)).toBeNull();
    expect(verifyFounderSession(null)).toBeNull();
    expect(mockVerifySession).not.toHaveBeenCalled();
  });

  it('returns null when the session does not exist', () => {
    mockVerifySession.mockReturnValue(null);
    expect(verifyFounderSession('no-such-session')).toBeNull();
  });

  it('returns null for a valid session belonging to a Creator, not a Founder', () => {
    mockVerifySession.mockReturnValue({ creatorId: 'creator-1', role: 'creator' });
    expect(verifyFounderSession('creator-session')).toBeNull();
  });

  it('returns the session for a valid Founder session', () => {
    mockVerifySession.mockReturnValue({ creatorId: 'founder-1', role: 'founder' });
    expect(verifyFounderSession('founder-session')).toEqual({ creatorId: 'founder-1', role: 'founder' });
  });
});
