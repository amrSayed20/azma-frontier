import { ConstitutionPriority } from '../constitution-runtime';
import { SovereignBusMessage } from './intelligence-message-contracts';

export class AuthorityBoundaryGuard {
  private blockedCount = 0;

  public assert(message: SovereignBusMessage): void {
    if (message.immutable !== true) {
      this.blockedCount += 1;
      throw new Error('SIB authority guard blocked mutable message contract.');
    }

    if (message.source === message.target) {
      this.blockedCount += 1;
      throw new Error('SIB authority guard blocked self-targeted route.');
    }

    if (message.authorityLevel === 'constitutional' && message.priority !== 'constitutional') {
      this.blockedCount += 1;
      throw new Error('SIB authority guard requires constitutional authority messages to use constitutional priority.');
    }

    if (message.priority === 'constitutional' && message.authorityLevel === 'simulation') {
      this.blockedCount += 1;
      throw new Error('SIB authority guard blocked simulation authority from constitutional-priority routing.');
    }
  }

  public normalizePriority(priority: ConstitutionPriority, authorityLevel: SovereignBusMessage['authorityLevel']): ConstitutionPriority {
    if (authorityLevel === 'constitutional') {
      return 'constitutional';
    }

    return priority;
  }

  public getBlockedCount(): number {
    return this.blockedCount;
  }
}
