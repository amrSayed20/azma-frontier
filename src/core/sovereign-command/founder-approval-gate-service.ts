import { randomUUID } from 'crypto';
import type { FounderApprovalGateContract } from './sovereign-command-contract';
import type {
  ApprovalResult,
  ExecutiveRecommendation,
  PendingApproval,
} from './sovereign-command-types';
import type { SovereignAuthorityToken } from '../sovereign-identity/sovereign-identity-contract';
import type { EmpireChronicleService } from './empire-chronicle-service';
import { makeSignificance } from './empire-chronicle-service';

export class FounderApprovalGateService implements FounderApprovalGateContract {
  readonly serviceName = 'FounderApprovalGateService' as const;

  private readonly approvals = new Map<string, PendingApproval>();

  constructor(private readonly chronicle: EmpireChronicleService) {}

  async submitForApproval(
    recommendation: ExecutiveRecommendation,
  ): Promise<PendingApproval> {
    const approval: PendingApproval = {
      approvalId: randomUUID(),
      actionType: recommendation.requiredAction,
      recommendedBy: 'ExecutiveIntelligenceService',
      recommendation,
      submittedAt: new Date(),
      status: 'PENDING',
      resolvedAt: null,
      rejectionReason: null,
    };
    this.approvals.set(approval.approvalId, approval);

    this.chronicle.record({
      category: 'COMMAND',
      title: `Approval requested: ${recommendation.title}`,
      narrative: `Executive Intelligence submitted a ${recommendation.urgency} recommendation for Founder approval. Action: ${recommendation.requiredAction}. Rationale: ${recommendation.rationale}`,
      significance: makeSignificance(recommendation.urgency),
    });

    return approval;
  }

  async approve(
    approvalId: string,
    token: SovereignAuthorityToken,
  ): Promise<ApprovalResult> {
    const approval = this.approvals.get(approvalId);
    if (approval === undefined) {
      throw new Error(`Approval ${approvalId} not found`);
    }
    if (approval.status !== 'PENDING') {
      throw new Error(`Approval ${approvalId} is already ${approval.status}`);
    }

    const now = new Date();
    if (token.expiresAt.getTime() < now.getTime()) {
      throw new Error('Authority token has expired');
    }
    if (token.used) {
      throw new Error('Authority token has already been used');
    }
    if (token.action !== approval.actionType) {
      throw new Error(
        `Token action ${token.action} does not match required action ${approval.actionType}`,
      );
    }

    const executionToken = randomUUID();
    this.approvals.set(approvalId, {
      ...approval,
      status: 'APPROVED',
      resolvedAt: now,
    });

    this.chronicle.record({
      category: 'DECISION',
      title: `Founder approved: ${approval.recommendation.title}`,
      narrative: `Founder granted approval for ${approval.actionType}. Execution token issued. Impact: ${approval.recommendation.estimatedImpact}`,
      significance: makeSignificance(approval.recommendation.urgency),
    });

    return { approvalId, status: 'APPROVED', approvedAt: now, executionToken };
  }

  async reject(approvalId: string, reason: string): Promise<void> {
    const approval = this.approvals.get(approvalId);
    if (approval === undefined) {
      throw new Error(`Approval ${approvalId} not found`);
    }
    if (approval.status !== 'PENDING') {
      throw new Error(`Approval ${approvalId} is already ${approval.status}`);
    }

    this.approvals.set(approvalId, {
      ...approval,
      status: 'REJECTED',
      resolvedAt: new Date(),
      rejectionReason: reason,
    });

    this.chronicle.record({
      category: 'DECISION',
      title: `Founder rejected: ${approval.recommendation.title}`,
      narrative: `Founder rejected ${approval.actionType}. Reason: ${reason}`,
      significance: 'ROUTINE',
    });
  }

  async getPendingApprovals(): Promise<readonly PendingApproval[]> {
    return [...this.approvals.values()].filter((a) => a.status === 'PENDING');
  }

  getAllApprovals(): readonly PendingApproval[] {
    return [...this.approvals.values()];
  }
}
