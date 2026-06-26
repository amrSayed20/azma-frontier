import { FounderSession } from './runtime-types';

export class CouncilSession {
  public create(founderId: string, trigger?: FounderSession['trigger']): FounderSession {
    return {
      sessionId: `council-session-${Date.now().toString(36)}`,
      founderId,
      startedAt: new Date(),
      trigger,
    };
  }

  public touch(session: FounderSession, trigger?: FounderSession['trigger']): FounderSession {
    return {
      ...session,
      lastSyncedAt: new Date(),
      trigger: trigger ?? session.trigger,
    };
  }
}
