import { randomUUID } from 'crypto';
import type { SovereignGrantContract } from './sovereign-command-contract';
import type { GrantParams, SovereignGrant } from './sovereign-command-types';
import type { EmpireChronicleService } from './empire-chronicle-service';

export class SovereignGrantService implements SovereignGrantContract {
  readonly serviceName = 'SovereignGrantService' as const;

  private readonly grants = new Map<string, SovereignGrant>();

  constructor(private readonly chronicle: EmpireChronicleService) {}

  issueGrant(params: GrantParams): SovereignGrant {
    const grant: SovereignGrant = {
      grantId: randomUUID(),
      grantType: params.grantType,
      targetUserId: params.targetUserId,
      grantedBy: 'FOUNDER',
      value: params.value,
      reason: params.reason,
      grantedAt: new Date(),
      expiresAt: params.expiresAt,
      status: 'ACTIVE',
    };
    this.grants.set(grant.grantId, grant);

    this.chronicle.record({
      category: 'GRANT',
      title: `${params.grantType} granted to user ${params.targetUserId}`,
      narrative: `Founder issued a ${params.grantType} grant (value: ${params.value}) to user ${params.targetUserId}. Reason: ${params.reason}`,
      significance: 'NOTABLE',
    });

    return grant;
  }

  revokeGrant(grantId: string): void {
    const grant = this.grants.get(grantId);
    if (grant === undefined) return;
    this.grants.set(grantId, { ...grant, status: 'REVOKED' });

    this.chronicle.record({
      category: 'GRANT',
      title: `Grant revoked: ${grantId}`,
      narrative: `Founder revoked a ${grant.grantType} grant for user ${grant.targetUserId}`,
      significance: 'ROUTINE',
    });
  }

  getGrants(targetUserId?: string): readonly SovereignGrant[] {
    const all = [...this.grants.values()];
    if (targetUserId !== undefined) {
      return all.filter((g) => g.targetUserId === targetUserId);
    }
    return all;
  }

  getActiveGrants(): readonly SovereignGrant[] {
    return [...this.grants.values()].filter((g) => g.status === 'ACTIVE');
  }
}
