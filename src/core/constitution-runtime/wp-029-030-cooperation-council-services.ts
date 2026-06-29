/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-029 & WP-030: Agent Cooperation & Constitutional Decision Council
 * Service Implementations
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Implement cooperative agent execution and constitutional decision councils
 * enabling multi-agent collaboration with authority preservation.
 */

import {
  CooperationType,
  CooperationStatus,
  DelegationRequest,
  AssistanceRequest,
  ResponsibilityNegotiation,
  ConstitutionalContextShare,
  SharedMemoryAccess,
  ExecutionOwnershipTransfer,
  CooperativeExecutionContext,
  CooperationStatistics,
  AgentCooperationServiceContract,
  CouncilMemberRole,
  CouncilVote,
  CouncilDecisionStatus,
  CouncilMemberVote,
  ConstitutionalVeto,
  AuthorityOverride,
  HumanEscalation,
  SovereignApproval,
  CouncilDecision,
  CouncilVotingStatistics,
  ConstitutionalDecisionCouncilServiceContract,
  CooperationCouncilLayerContract
} from './wp-029-030-cooperation-council-types';
import { ConstitutionArticleId } from './constitution-types';

// ════════════════════════════════════════════════════════════════════════════
// WP-029: AGENT COOPERATION SERVICE
// ════════════════════════════════════════════════════════════════════════════

class AgentCooperationService implements AgentCooperationServiceContract {
  private readonly delegations = new Map<string, DelegationRequest>();
  private readonly assistanceRequests = new Map<string, AssistanceRequest>();
  private readonly negotiations = new Map<string, ResponsibilityNegotiation>();
  private readonly contextShares = new Map<string, ConstitutionalContextShare>();
  private readonly memoryAccesses = new Map<string, SharedMemoryAccess>();
  private readonly ownershipTransfers = new Map<string, ExecutionOwnershipTransfer>();
  private readonly cooperativeContexts = new Map<string, CooperativeExecutionContext>();
  private readonly stats = new Map<string, CooperationStatistics>();

  async createDelegationRequest(
    delegatingAgentId: string,
    delegatedAgentId: string,
    originalDecisionId: string,
    constitutionalBasis: ConstitutionArticleId,
    work: DelegationRequest['delegatedWork']
  ): Promise<DelegationRequest> {
    const requestId = `delegation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const request: DelegationRequest = {
      requestId,
      delegatingAgentId,
      delegatedAgentId,
      originalDecisionId,
      constitutionalBasis,
      delegatedWork: work,
      createdAt: Date.now(),
      status: CooperationStatus.PENDING
    };
    this.delegations.set(requestId, request);
    this.recordCooperationStat(delegatingAgentId, 'delegationsSent');
    this.recordCooperationStat(delegatedAgentId, 'delegationsReceived');
    return request;
  }

  async acceptDelegation(requestId: string): Promise<DelegationRequest> {
    const request = this.delegations.get(requestId);
    if (!request) throw new Error(`Delegation not found: ${requestId}`);
    const updated: DelegationRequest = {
      ...request,
      status: CooperationStatus.ACCEPTED,
      acceptedAt: Date.now()
    };
    this.delegations.set(requestId, updated);
    return updated;
  }

  async rejectDelegation(requestId: string, reason?: string): Promise<DelegationRequest> {
    const request = this.delegations.get(requestId);
    if (!request) throw new Error(`Delegation not found: ${requestId}`);
    const updated: DelegationRequest = {
      ...request,
      status: CooperationStatus.REJECTED,
      error: reason
    };
    this.delegations.set(requestId, updated);
    return updated;
  }

  async completeDelegation(requestId: string, result: unknown): Promise<DelegationRequest> {
    const request = this.delegations.get(requestId);
    if (!request) throw new Error(`Delegation not found: ${requestId}`);
    const updated: DelegationRequest = {
      ...request,
      status: CooperationStatus.COMPLETED,
      completedAt: Date.now(),
      result
    };
    this.delegations.set(requestId, updated);
    return updated;
  }

  async failDelegation(requestId: string, error: string): Promise<DelegationRequest> {
    const request = this.delegations.get(requestId);
    if (!request) throw new Error(`Delegation not found: ${requestId}`);
    const updated: DelegationRequest = {
      ...request,
      status: CooperationStatus.FAILED,
      completedAt: Date.now(),
      error
    };
    this.delegations.set(requestId, updated);
    return updated;
  }

  async getDelegation(requestId: string): Promise<DelegationRequest | null> {
    return this.delegations.get(requestId) ?? null;
  }

  async requestAssistance(
    requestingAgentId: string,
    assistingAgentId: string,
    problem: string,
    context: AssistanceRequest['context']
  ): Promise<AssistanceRequest> {
    const requestId = `assist-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const request: AssistanceRequest = {
      requestId,
      requestingAgentId,
      assistingAgentId,
      problem,
      context,
      createdAt: Date.now(),
      status: CooperationStatus.PENDING
    };
    this.assistanceRequests.set(requestId, request);
    this.recordCooperationStat(requestingAgentId, 'assistanceRequested');
    this.recordCooperationStat(assistingAgentId, 'assistanceProvided');
    return request;
  }

  async respondToAssistance(
    requestId: string,
    advice: string,
    recommendations: readonly string[]
  ): Promise<AssistanceRequest> {
    const request = this.assistanceRequests.get(requestId);
    if (!request) throw new Error(`Assistance request not found: ${requestId}`);
    const updated: AssistanceRequest = {
      ...request,
      status: CooperationStatus.COMPLETED,
      respondedAt: Date.now(),
      advice,
      recommendations
    };
    this.assistanceRequests.set(requestId, updated);
    return updated;
  }

  async getAssistanceRequest(requestId: string): Promise<AssistanceRequest | null> {
    return this.assistanceRequests.get(requestId) ?? null;
  }

  async initiateResponsibilityNegotiation(
    initiatingAgentId: string,
    targetAgentId: string,
    decisionType: string,
    proposedResponsible: string,
    rationale: string
  ): Promise<ResponsibilityNegotiation> {
    const negotiationId = `nego-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const negotiation: ResponsibilityNegotiation = {
      negotiationId,
      initiatingAgentId,
      targetAgentId,
      decisionType,
      proposedAgentResponsible: proposedResponsible,
      rationale,
      createdAt: Date.now(),
      status: CooperationStatus.PENDING
    };
    this.negotiations.set(negotiationId, negotiation);
    this.recordCooperationStat(initiatingAgentId, 'negotiationsInitiated');
    return negotiation;
  }

  async respondToNegotiation(
    negotiationId: string,
    agreeToProposal: boolean,
    proposedAlternative?: string
  ): Promise<ResponsibilityNegotiation> {
    const negotiation = this.negotiations.get(negotiationId);
    if (!negotiation) throw new Error(`Negotiation not found: ${negotiationId}`);
    const agreed = agreeToProposal ? negotiation.proposedAgentResponsible : proposedAlternative;
    const updated: ResponsibilityNegotiation = {
      ...negotiation,
      status: agreeToProposal ? CooperationStatus.COMPLETED : CooperationStatus.EXECUTING,
      respondedAt: Date.now(),
      agreedAgentResponsible: agreed,
      agreementRationale: proposedAlternative ?? negotiation.rationale,
      accepted: agreeToProposal
    };
    this.negotiations.set(negotiationId, updated);
    if (agreeToProposal) {
      this.recordCooperationStat(negotiation.targetAgentId, 'negotiationsResolved');
    }
    return updated;
  }

  async shareConstitutionalContext(
    sharingAgentId: string,
    receivingAgentId: string,
    articles: readonly ConstitutionArticleId[],
    accessLevel: 'FULL' | 'PARTIAL' | 'READ_ONLY'
  ): Promise<ConstitutionalContextShare> {
    const shareId = `ctx-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const share: ConstitutionalContextShare = {
      shareId,
      sharingAgentId,
      receivingAgentId,
      articlesShared: articles,
      policyChain: [],
      constraintsSummary: '',
      previousDecisionsInContext: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,  // 24 hour TTL
      accessLevel
    };
    this.contextShares.set(shareId, share);
    this.recordCooperationStat(receivingAgentId, 'contextSharesReceived');
    return share;
  }

  async grantMemoryAccess(
    grantingAgentId: string,
    receivingAgentId: string,
    memoryCategory: SharedMemoryAccess['memoryCategory'],
    entryIds: readonly string[],
    authorizationBasis: ConstitutionArticleId
  ): Promise<SharedMemoryAccess> {
    const accessId = `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const access: SharedMemoryAccess = {
      accessId,
      grantingAgentId,
      receivingAgentId,
      memoryCategory,
      entriesShared: entryIds,
      authorizationBasis,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      readOnly: true,
      accessCount: 0
    };
    this.memoryAccesses.set(accessId, access);
    this.recordCooperationStat(grantingAgentId, 'memorySharesGranted');
    return access;
  }

  async transferExecutionOwnership(
    returningAgentId: string,
    receivingAgentId: string,
    delegationId: string,
    progress: ExecutionOwnershipTransfer['executionProgress'],
    currentState: Record<string, unknown>
  ): Promise<ExecutionOwnershipTransfer> {
    const transferId = `own-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const transfer: ExecutionOwnershipTransfer = {
      transferId,
      returningAgentId,
      receivingAgentId,
      originalDelegationId: delegationId,
      executionProgress: progress,
      currentState,
      createdAt: Date.now()
    };
    this.ownershipTransfers.set(transferId, transfer);
    return transfer;
  }

  async getCooperationStats(agentId: string): Promise<CooperationStatistics> {
    const stats = this.stats.get(agentId);
    if (!stats) {
      const newStats: CooperationStatistics = {
        agentId,
        totalCooperations: 0,
        delegationsSent: 0,
        delegationsReceived: 0,
        assistanceRequested: 0,
        assistanceProvided: 0,
        successRate: 1.0,
        averageExecutionTimeMs: 0,
        negotiationsInitiated: 0,
        negotiationsResolved: 0,
        memorySharesGranted: 0,
        contextSharesReceived: 0
      };
      this.stats.set(agentId, newStats);
      return newStats;
    }
    return stats;
  }

  private recordCooperationStat(agentId: string, field: keyof Omit<CooperationStatistics, 'agentId' | 'successRate' | 'averageExecutionTimeMs' | 'totalCooperations'>): void {
    const stats = this.stats.get(agentId) ?? {
      agentId,
      totalCooperations: 0,
      delegationsSent: 0,
      delegationsReceived: 0,
      assistanceRequested: 0,
      assistanceProvided: 0,
      successRate: 1.0,
      averageExecutionTimeMs: 0,
      negotiationsInitiated: 0,
      negotiationsResolved: 0,
      memorySharesGranted: 0,
      contextSharesReceived: 0
    };
    const updated: CooperationStatistics = {
      ...stats,
      [field]: (stats[field] as number) + 1,
      totalCooperations: stats.totalCooperations + 1
    };
    this.stats.set(agentId, updated);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// WP-030: CONSTITUTIONAL DECISION COUNCIL SERVICE
// ════════════════════════════════════════════════════════════════════════════

class ConstitutionalDecisionCouncilService implements ConstitutionalDecisionCouncilServiceContract {
  private readonly councils = new Map<string, CouncilDecision>();
  private readonly vetoes = new Map<string, ConstitutionalVeto>();
  private readonly overrides = new Map<string, AuthorityOverride>();
  private readonly escalations = new Map<string, HumanEscalation>();
  private readonly approvals = new Map<string, SovereignApproval>();
  private readonly votingStats = new Map<string, CouncilVotingStatistics>();

  async formCouncil(
    decisionTopic: string,
    constitutionalBasis: ConstitutionArticleId,
    proposedOutcome: unknown,
    memberRoles: readonly CouncilMemberRole[]
  ): Promise<CouncilDecision> {
    const decisionId = `council-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const decision: CouncilDecision = {
      decisionId,
      councilMembers: memberRoles,
      participatingAgentIds: [],
      decisionTopic,
      constitutionalBasis,
      proposedOutcome,
      createdAt: Date.now(),
      votes: [],
      status: CouncilDecisionStatus.FORMING,
      majorityVotesNeeded: Math.ceil(memberRoles.length / 2),
      approvalVotes: 0,
      rejectionVotes: 0,
      abstentions: 0,
      vetoes: [],
      auditTrailId: `audit-${decisionId}`
    };
    this.councils.set(decisionId, decision);
    return decision;
  }

  async addCouncilMember(
    decisionId: string,
    memberId: string,
    memberRole: CouncilMemberRole,
    votingWeight: number = 1
  ): Promise<CouncilDecision> {
    const council = this.councils.get(decisionId);
    if (!council) throw new Error(`Council not found: ${decisionId}`);
    const updated: CouncilDecision = {
      ...council,
      participatingAgentIds: [...council.participatingAgentIds, memberId]
    };
    this.councils.set(decisionId, updated);
    return updated;
  }

  async castCouncilVote(
    decisionId: string,
    memberId: string,
    vote: CouncilVote,
    reasoning: string,
    conditions?: readonly string[]
  ): Promise<CouncilMemberVote> {
    const council = this.councils.get(decisionId);
    if (!council) throw new Error(`Council not found: ${decisionId}`);

    const memberVote: CouncilMemberVote = {
      memberId,
      memberRole: council.councilMembers[0] ?? CouncilMemberRole.VOTER,
      vote,
      reasoning,
      conditions,
      timestamp: Date.now(),
      weight: 1
    };

    const updatedVotes = [...council.votes, memberVote];
    const approvals = updatedVotes.filter(v => v.vote === CouncilVote.APPROVE).length;
    const rejections = updatedVotes.filter(v => v.vote === CouncilVote.REJECT).length;
    const abstains = updatedVotes.filter(v => v.vote === CouncilVote.ABSTAIN).length;

    const updated: CouncilDecision = {
      ...council,
      votes: updatedVotes,
      approvalVotes: approvals,
      rejectionVotes: rejections,
      abstentions: abstains,
      status: CouncilDecisionStatus.VOTING
    };
    this.councils.set(decisionId, updated);
    this.recordVotingStat(memberId, vote);
    return memberVote;
  }

  async closeVoting(decisionId: string): Promise<CouncilDecision> {
    const council = this.councils.get(decisionId);
    if (!council) throw new Error(`Council not found: ${decisionId}`);

    const approved = council.approvalVotes >= council.majorityVotesNeeded;
    const status = approved ? CouncilDecisionStatus.APPROVED : CouncilDecisionStatus.REJECTED;

    const updated: CouncilDecision = {
      ...council,
      status,
      votingEndedAt: Date.now(),
      finalDecision: approved ? council.proposedOutcome : null
    };
    this.councils.set(decisionId, updated);
    return updated;
  }

  async issueConstitutionalVeto(
    decisionId: string,
    vetoingAgentId: string,
    constitutionalBasis: ConstitutionArticleId,
    reason: string
  ): Promise<ConstitutionalVeto> {
    const vetoId = `veto-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const veto: ConstitutionalVeto = {
      vetoId,
      vetoingAgentId,
      constitutionalBasis,
      vetoReason: reason,
      allowsAlternative: false,
      timestamp: Date.now()
    };
    this.vetoes.set(vetoId, veto);

    const council = this.councils.get(decisionId);
    if (council) {
      const updated: CouncilDecision = {
        ...council,
        vetoes: [...council.vetoes, veto],
        status: CouncilDecisionStatus.VETO_REVIEW
      };
      this.councils.set(decisionId, updated);
    }

    this.recordVotingStat(vetoingAgentId, CouncilVote.REJECT);
    return veto;
  }

  async overrideVeto(vetoId: string, overridingAgentId: string, reason: string): Promise<ConstitutionalVeto> {
    const veto = this.vetoes.get(vetoId);
    if (!veto) throw new Error(`Veto not found: ${vetoId}`);
    const updated: ConstitutionalVeto = {
      ...veto,
      overriddenBy: overridingAgentId,
      overrideReason: reason
    };
    this.vetoes.set(vetoId, updated);
    return updated;
  }

  async applyAuthorityOverride(
    decisionId: string,
    overridingAgentId: string,
    authorityLevel: number,
    newDecision: unknown,
    reason: string
  ): Promise<AuthorityOverride> {
    const overrideId = `override-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const override: AuthorityOverride = {
      overrideId,
      overridingAgentId,
      originalDecisionId: decisionId,
      authorityLevel,
      overrideReason: reason,
      newDecision,
      timestamp: Date.now(),
      auditTrailId: `audit-${overrideId}`
    };
    this.overrides.set(overrideId, override);

    const council = this.councils.get(decisionId);
    if (council) {
      const updated: CouncilDecision = {
        ...council,
        override,
        status: CouncilDecisionStatus.OVERRIDDEN,
        finalDecision: newDecision
      };
      this.councils.set(decisionId, updated);
    }
    return override;
  }

  async escalateToHuman(
    decisionId: string,
    reason: string,
    category: HumanEscalation['reasonCategory'],
    escalatedToRole: string
  ): Promise<HumanEscalation> {
    const escalationId = `esc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const escalation: HumanEscalation = {
      escalationId,
      councilDecisionId: decisionId,
      escalationReason: reason,
      reasonCategory: category,
      escalatedAt: Date.now(),
      escalatedToRole
    };
    this.escalations.set(escalationId, escalation);

    const council = this.councils.get(decisionId);
    if (council) {
      const updated: CouncilDecision = {
        ...council,
        humanEscalation: escalation,
        status: CouncilDecisionStatus.ESCALATED
      };
      this.councils.set(decisionId, updated);
    }
    return escalation;
  }

  async recordHumanDecision(
    escalationId: string,
    decision: unknown,
    approvalMessage?: string
  ): Promise<HumanEscalation> {
    const escalation = this.escalations.get(escalationId);
    if (!escalation) throw new Error(`Escalation not found: ${escalationId}`);
    const updated: HumanEscalation = {
      ...escalation,
      humanDecision: decision,
      humanApprovedAt: Date.now(),
      humanApprovalMessage: approvalMessage
    };
    this.escalations.set(escalationId, updated);

    const council = this.councils.get(escalation.councilDecisionId);
    if (council) {
      const councilUpdated: CouncilDecision = {
        ...council,
        humanEscalation: updated,
        status: CouncilDecisionStatus.APPROVED,
        finalDecision: decision
      };
      this.councils.set(escalation.councilDecisionId, councilUpdated);
    }
    return updated;
  }

  async requestSovereignApproval(decisionId: string, sovereignId: string): Promise<SovereignApproval> {
    const approvalId = `sovereign-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const approval: SovereignApproval = {
      approvalId,
      councilDecisionId: decisionId,
      sovereignId,
      approvalStatus: 'PENDING',
      requestedAt: Date.now()
    };
    this.approvals.set(approvalId, approval);

    const council = this.councils.get(decisionId);
    if (council) {
      const updated: CouncilDecision = {
        ...council,
        sovereignApproval: approval,
        status: CouncilDecisionStatus.SOVEREIGN_APPROVAL_PENDING
      };
      this.councils.set(decisionId, updated);
    }
    return approval;
  }

  async approveSovereignly(
    approvalId: string,
    approvalStatus: 'APPROVED' | 'REJECTED',
    reason?: string,
    conditions?: readonly string[]
  ): Promise<SovereignApproval> {
    const approval = this.approvals.get(approvalId);
    if (!approval) throw new Error(`Approval not found: ${approvalId}`);
    const updated: SovereignApproval = {
      ...approval,
      approvalStatus,
      respondedAt: Date.now(),
      approvalReason: reason,
      conditions
    };
    this.approvals.set(approvalId, updated);

    const council = this.councils.get(approval.councilDecisionId);
    if (council) {
      const councilUpdated: CouncilDecision = {
        ...council,
        sovereignApproval: updated,
        status: approvalStatus === 'APPROVED' ? CouncilDecisionStatus.EXECUTED : CouncilDecisionStatus.REJECTED
      };
      this.councils.set(approval.councilDecisionId, councilUpdated);
    }
    return updated;
  }

  async getCouncilVotingStats(memberId: string): Promise<CouncilVotingStatistics> {
    const stats = this.votingStats.get(memberId);
    if (!stats) {
      const newStats: CouncilVotingStatistics = {
        councilMemberId: memberId,
        totalVotes: 0,
        approvalsGiven: 0,
        rejectionsGiven: 0,
        abstentions: 0,
        vetosIssued: 0,
        vetoesOverridden: 0,
        averageDecisionTimeMs: 0,
        preferredCouncilTopics: []
      };
      this.votingStats.set(memberId, newStats);
      return newStats;
    }
    return stats;
  }

  async getCouncilDecision(decisionId: string): Promise<CouncilDecision | null> {
    return this.councils.get(decisionId) ?? null;
  }

  async getAllCouncilDecisions(): Promise<readonly CouncilDecision[]> {
    return Array.from(this.councils.values());
  }

  private recordVotingStat(memberId: string, vote: CouncilVote): void {
    const stats = this.votingStats.get(memberId) ?? {
      councilMemberId: memberId,
      totalVotes: 0,
      approvalsGiven: 0,
      rejectionsGiven: 0,
      abstentions: 0,
      vetosIssued: 0,
      vetoesOverridden: 0,
      averageDecisionTimeMs: 0,
      preferredCouncilTopics: []
    };

    let updated: CouncilVotingStatistics;
    if (vote === CouncilVote.APPROVE) {
      updated = { ...stats, totalVotes: stats.totalVotes + 1, approvalsGiven: stats.approvalsGiven + 1 };
    } else if (vote === CouncilVote.REJECT) {
      updated = { ...stats, totalVotes: stats.totalVotes + 1, rejectionsGiven: stats.rejectionsGiven + 1, vetosIssued: stats.vetosIssued + 1 };
    } else {
      updated = { ...stats, totalVotes: stats.totalVotes + 1, abstentions: stats.abstentions + 1 };
    }
    this.votingStats.set(memberId, updated);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// FACTORY & LAYER CONTRACT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create unified Cooperation & Council layer
 */
export function createCooperationCouncilLayer(): CooperationCouncilLayerContract {
  return {
    cooperation: new AgentCooperationService(),
    council: new ConstitutionalDecisionCouncilService()
  };
}
