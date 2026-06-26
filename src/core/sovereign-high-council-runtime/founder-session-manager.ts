import { CouncilSession } from './council-session';
import { FounderSession } from './runtime-types';

export class FounderSessionManager {
  private activeSession?: FounderSession;

  constructor(private readonly sessionFactory: CouncilSession) {}

  public getOrCreate(founderId: string, trigger?: FounderSession['trigger']): FounderSession {
    if (!this.activeSession || this.activeSession.founderId !== founderId) {
      this.activeSession = this.sessionFactory.create(founderId, trigger);
      return this.activeSession;
    }

    this.activeSession = this.sessionFactory.touch(this.activeSession, trigger);
    return this.activeSession;
  }

  public current(): FounderSession | undefined {
    return this.activeSession;
  }
}
