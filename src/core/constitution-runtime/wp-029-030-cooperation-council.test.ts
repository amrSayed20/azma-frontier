/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-029 & WP-030: Cooperation & Constitutional Council Tests
 * ════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  CooperationType,
  CooperationStatus,
  CouncilVote,
  CouncilDecisionStatus,
  CouncilMemberRole
} from './wp-029-030-cooperation-council-types';
import { createCooperationCouncilLayer } from './wp-029-030-cooperation-council-services';

describe('WP-029-030: Agent Cooperation & Constitutional Council', () => {
  let layer: ReturnType<typeof createCooperationCouncilLayer>;

  beforeEach(() => {
    layer = createCooperationCouncilLayer();
  });

  // ════════════════════════════════════════════════════════════════════════
  // WP-029: AGENT COOPERATION TESTS
  // ════════════════════════════════════════════════════════════════════════

  describe('WP-029: Agent Cooperation Framework', () => {
    describe('Delegation', () => {
      it('should create a delegation request', async () => {
        const delegation = await layer.cooperation.createDelegationRequest(
          'agent-1',
          'agent-2',
          'decision-123',
          'article-1' as any,
          {
            description: 'Process payment',
            expectedOutcome: 'Payment confirmed',
            timeoutMs: 5000
          }
        );

        expect(delegation.requestId).toBeDefined();
        expect(delegation.delegatingAgentId).toBe('agent-1');
        expect(delegation.delegatedAgentId).toBe('agent-2');
        expect(delegation.status).toBe(CooperationStatus.PENDING);
      });

      it('should accept a delegation', async () => {
        const delegation = await layer.cooperation.createDelegationRequest(
          'agent-1',
          'agent-2',
          'decision-123',
          'article-1' as any,
          { description: 'Test', expectedOutcome: 'Result', timeoutMs: 5000 }
        );

        const accepted = await layer.cooperation.acceptDelegation(delegation.requestId);
        expect(accepted.status).toBe(CooperationStatus.ACCEPTED);
        expect(accepted.acceptedAt).toBeDefined();
      });

      it('should complete a delegation with result', async () => {
        const delegation = await layer.cooperation.createDelegationRequest(
          'agent-1',
          'agent-2',
          'decision-123',
          'article-1' as any,
          { description: 'Test', expectedOutcome: 'Result', timeoutMs: 5000 }
        );

        const completed = await layer.cooperation.completeDelegation(
          delegation.requestId,
          { success: true, paymentId: 'pay-456' }
        );

        expect(completed.status).toBe(CooperationStatus.COMPLETED);
        expect(completed.result).toEqual({ success: true, paymentId: 'pay-456' });
        expect(completed.completedAt).toBeDefined();
      });

      it('should reject a delegation', async () => {
        const delegation = await layer.cooperation.createDelegationRequest(
          'agent-1',
          'agent-2',
          'decision-123',
          'article-1' as any,
          { description: 'Test', expectedOutcome: 'Result', timeoutMs: 5000 }
        );

        const rejected = await layer.cooperation.rejectDelegation(
          delegation.requestId,
          'Agent 2 is busy'
        );

        expect(rejected.status).toBe(CooperationStatus.REJECTED);
        expect(rejected.error).toBe('Agent 2 is busy');
      });

      it('should fail a delegation with error', async () => {
        const delegation = await layer.cooperation.createDelegationRequest(
          'agent-1',
          'agent-2',
          'decision-123',
          'article-1' as any,
          { description: 'Test', expectedOutcome: 'Result', timeoutMs: 5000 }
        );

        const failed = await layer.cooperation.failDelegation(
          delegation.requestId,
          'Payment gateway timeout'
        );

        expect(failed.status).toBe(CooperationStatus.FAILED);
        expect(failed.error).toBe('Payment gateway timeout');
      });

      it('should retrieve a delegation', async () => {
        const delegation = await layer.cooperation.createDelegationRequest(
          'agent-1',
          'agent-2',
          'decision-123',
          'article-1' as any,
          { description: 'Test', expectedOutcome: 'Result', timeoutMs: 5000 }
        );

        const retrieved = await layer.cooperation.getDelegation(delegation.requestId);
        expect(retrieved).toEqual(delegation);
      });
    });

    describe('Assistance', () => {
      it('should request assistance', async () => {
        const request = await layer.cooperation.requestAssistance(
          'agent-1',
          'expert-agent',
          'How to validate credit card?',
          {
            currentDecisionContext: { amount: 100 },
            constraintsFaced: ['PCI compliance'],
            questionsAsked: ['Validation method']
          }
        );

        expect(request.requestId).toBeDefined();
        expect(request.requestingAgentId).toBe('agent-1');
        expect(request.assistingAgentId).toBe('expert-agent');
        expect(request.status).toBe(CooperationStatus.PENDING);
      });

      it('should respond to assistance request', async () => {
        const request = await layer.cooperation.requestAssistance(
          'agent-1',
          'expert-agent',
          'How to validate?',
          {
            currentDecisionContext: {},
            constraintsFaced: [],
            questionsAsked: []
          }
        );

        const response = await layer.cooperation.respondToAssistance(
          request.requestId,
          'Use Luhn algorithm',
          ['Implement checksum', 'Test edge cases']
        );

        expect(response.status).toBe(CooperationStatus.COMPLETED);
        expect(response.advice).toBe('Use Luhn algorithm');
        expect(response.recommendations).toHaveLength(2);
      });
    });

    describe('Responsibility Negotiation', () => {
      it('should initiate responsibility negotiation', async () => {
        const negotiation = await layer.cooperation.initiateResponsibilityNegotiation(
          'agent-1',
          'agent-2',
          'PAYMENT_APPROVAL',
          'agent-2',
          'Agent 2 has authority'
        );

        expect(negotiation.negotiationId).toBeDefined();
        expect(negotiation.initiatingAgentId).toBe('agent-1');
        expect(negotiation.targetAgentId).toBe('agent-2');
        expect(negotiation.status).toBe(CooperationStatus.PENDING);
      });

      it('should accept responsibility negotiation', async () => {
        const negotiation = await layer.cooperation.initiateResponsibilityNegotiation(
          'agent-1',
          'agent-2',
          'PAYMENT_APPROVAL',
          'agent-2',
          'Agent 2 has authority'
        );

        const response = await layer.cooperation.respondToNegotiation(
          negotiation.negotiationId,
          true
        );

        expect(response.status).toBe(CooperationStatus.COMPLETED);
        expect(response.accepted).toBe(true);
        expect(response.agreedAgentResponsible).toBe('agent-2');
      });

      it('should propose alternative in negotiation', async () => {
        const negotiation = await layer.cooperation.initiateResponsibilityNegotiation(
          'agent-1',
          'agent-2',
          'PAYMENT_APPROVAL',
          'agent-2',
          'Agent 2 has authority'
        );

        const response = await layer.cooperation.respondToNegotiation(
          negotiation.negotiationId,
          false,
          'agent-3'
        );

        expect(response.accepted).toBe(false);
        expect(response.agreedAgentResponsible).toBe('agent-3');
      });
    });

    describe('Context & Memory Sharing', () => {
      it('should share constitutional context', async () => {
        const share = await layer.cooperation.shareConstitutionalContext(
          'agent-1',
          'agent-2',
          ['article-1', 'article-2'] as any,
          'FULL'
        );

        expect(share.shareId).toBeDefined();
        expect(share.sharingAgentId).toBe('agent-1');
        expect(share.receivingAgentId).toBe('agent-2');
        expect(share.accessLevel).toBe('FULL');
      });

      it('should grant memory access', async () => {
        const access = await layer.cooperation.grantMemoryAccess(
          'agent-1',
          'agent-2',
          'DECISION',
          ['mem-1', 'mem-2'],
          'article-1' as any
        );

        expect(access.accessId).toBeDefined();
        expect(access.grantingAgentId).toBe('agent-1');
        expect(access.receivingAgentId).toBe('agent-2');
        expect(access.readOnly).toBe(true);
      });
    });

    describe('Execution Ownership', () => {
      it('should transfer execution ownership', async () => {
        const transfer = await layer.cooperation.transferExecutionOwnership(
          'agent-2',
          'agent-1',
          'delegation-123',
          { stepsCompleted: 7, totalSteps: 10, percentComplete: 70 },
          { lastPaymentId: 'pay-456' }
        );

        expect(transfer.transferId).toBeDefined();
        expect(transfer.returningAgentId).toBe('agent-2');
        expect(transfer.receivingAgentId).toBe('agent-1');
        expect(transfer.executionProgress.percentComplete).toBe(70);
      });
    });

    describe('Cooperation Statistics', () => {
      it('should track cooperation statistics', async () => {
        await layer.cooperation.createDelegationRequest(
          'agent-1',
          'agent-2',
          'decision-1',
          'article-1' as any,
          { description: 'Test', expectedOutcome: 'Result', timeoutMs: 5000 }
        );

        const stats = await layer.cooperation.getCooperationStats('agent-1');
        expect(stats.agentId).toBe('agent-1');
        expect(stats.delegationsSent).toBe(1);
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // WP-030: CONSTITUTIONAL DECISION COUNCIL TESTS
  // ════════════════════════════════════════════════════════════════════════

  describe('WP-030: Constitutional Decision Council', () => {
    describe('Council Formation', () => {
      it('should form a council', async () => {
        const council = await layer.council.formCouncil(
          'Large payment approval',
          'article-3' as any,
          { approve: true, amount: 50000 },
          [CouncilMemberRole.VOTER, CouncilMemberRole.AUTHORITY_HOLDER, CouncilMemberRole.VOTER]
        );

        expect(council.decisionId).toBeDefined();
        expect(council.decisionTopic).toBe('Large payment approval');
        expect(council.status).toBe(CouncilDecisionStatus.FORMING);
        expect(council.majorityVotesNeeded).toBe(2);
      });

      it('should add council member', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER]
        );

        const updated = await layer.council.addCouncilMember(
          council.decisionId,
          'member-1',
          CouncilMemberRole.VOTER
        );

        expect(updated.participatingAgentIds).toContain('member-1');
      });
    });

    describe('Voting', () => {
      it('should cast approval vote', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER, CouncilMemberRole.VOTER, CouncilMemberRole.VOTER]
        );

        const vote = await layer.council.castCouncilVote(
          council.decisionId,
          'member-1',
          CouncilVote.APPROVE,
          'I agree with this decision'
        );

        expect(vote.memberId).toBe('member-1');
        expect(vote.vote).toBe(CouncilVote.APPROVE);
      });

      it('should track vote counts', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER, CouncilMemberRole.VOTER, CouncilMemberRole.VOTER]
        );

        await layer.council.castCouncilVote(
          council.decisionId,
          'member-1',
          CouncilVote.APPROVE,
          'Yes'
        );

        await layer.council.castCouncilVote(
          council.decisionId,
          'member-2',
          CouncilVote.APPROVE,
          'Yes'
        );

        const updated = await layer.council.getCouncilDecision(council.decisionId);
        expect(updated?.approvalVotes).toBe(2);
        expect(updated?.votes).toHaveLength(2);
      });

      it('should close voting with approval', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER, CouncilMemberRole.VOTER]
        );

        await layer.council.castCouncilVote(
          council.decisionId,
          'member-1',
          CouncilVote.APPROVE,
          'Yes'
        );

        await layer.council.castCouncilVote(
          council.decisionId,
          'member-2',
          CouncilVote.APPROVE,
          'Yes'
        );

        const closed = await layer.council.closeVoting(council.decisionId);
        expect(closed.status).toBe(CouncilDecisionStatus.APPROVED);
        expect(closed.finalDecision).toEqual({ approve: true });
      });

      it('should close voting with rejection', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER, CouncilMemberRole.VOTER]
        );

        await layer.council.castCouncilVote(
          council.decisionId,
          'member-1',
          CouncilVote.REJECT,
          'No'
        );

        await layer.council.castCouncilVote(
          council.decisionId,
          'member-2',
          CouncilVote.REJECT,
          'No'
        );

        const closed = await layer.council.closeVoting(council.decisionId);
        expect(closed.status).toBe(CouncilDecisionStatus.REJECTED);
      });
    });

    describe('Constitutional Veto', () => {
      it('should issue constitutional veto', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.AUTHORITY_HOLDER]
        );

        const veto = await layer.council.issueConstitutionalVeto(
          council.decisionId,
          'authority-agent',
          'article-5' as any,
          'This violates policy 5.2'
        );

        expect(veto.vetoId).toBeDefined();
        expect(veto.vetoingAgentId).toBe('authority-agent');
        expect(veto.vetoReason).toBe('This violates policy 5.2');
      });

      it('should override a veto', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.AUTHORITY_HOLDER]
        );

        const veto = await layer.council.issueConstitutionalVeto(
          council.decisionId,
          'authority-agent',
          'article-5' as any,
          'This violates policy'
        );

        const overridden = await layer.council.overrideVeto(
          veto.vetoId,
          'sovereign-agent',
          'Emergency override'
        );

        expect(overridden.overriddenBy).toBe('sovereign-agent');
      });
    });

    describe('Authority Override', () => {
      it('should apply authority override', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: false },
          [CouncilMemberRole.VOTER]
        );

        const override = await layer.council.applyAuthorityOverride(
          council.decisionId,
          'cto',
          10,
          { approve: true },
          'Security-critical override'
        );

        expect(override.overrideId).toBeDefined();
        expect(override.overridingAgentId).toBe('cto');
        expect(override.authorityLevel).toBe(10);
        expect(override.newDecision).toEqual({ approve: true });
      });
    });

    describe('Human Escalation', () => {
      it('should escalate to human', async () => {
        const council = await layer.council.formCouncil(
          'Ethical decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER]
        );

        const escalation = await layer.council.escalateToHuman(
          council.decisionId,
          'Requires human judgment on ethics',
          'VALUE_TRADEOFF',
          'SecurityOfficer'
        );

        expect(escalation.escalationId).toBeDefined();
        expect(escalation.escalatedToRole).toBe('SecurityOfficer');
        expect(escalation.reasonCategory).toBe('VALUE_TRADEOFF');
      });

      it('should record human decision', async () => {
        const council = await layer.council.formCouncil(
          'Ethical decision',
          'article-1' as any,
          { approve: false },
          [CouncilMemberRole.VOTER]
        );

        const escalation = await layer.council.escalateToHuman(
          council.decisionId,
          'Needs human review',
          'HUMAN_JUDGMENT_NEEDED',
          'CTO'
        );

        const decision = await layer.council.recordHumanDecision(
          escalation.escalationId,
          { approve: true, reason: 'Approved by CTO' },
          'Human approved'
        );

        expect(decision.humanDecision).toEqual({ approve: true, reason: 'Approved by CTO' });
        expect(decision.humanApprovedAt).toBeDefined();
      });
    });

    describe('Sovereign Approval', () => {
      it('should request sovereign approval', async () => {
        const council = await layer.council.formCouncil(
          'Critical decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER]
        );

        const approval = await layer.council.requestSovereignApproval(
          council.decisionId,
          'sovereign-ai'
        );

        expect(approval.approvalId).toBeDefined();
        expect(approval.sovereignId).toBe('sovereign-ai');
        expect(approval.approvalStatus).toBe('PENDING');
      });

      it('should approve sovereignly', async () => {
        const council = await layer.council.formCouncil(
          'Critical decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER]
        );

        const approval = await layer.council.requestSovereignApproval(
          council.decisionId,
          'sovereign-ai'
        );

        const approved = await layer.council.approveSovereignly(
          approval.approvalId,
          'APPROVED',
          'Approved by sovereign'
        );

        expect(approved.approvalStatus).toBe('APPROVED');
        expect(approved.respondedAt).toBeDefined();
      });
    });

    describe('Voting Statistics', () => {
      it('should track council voting statistics', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER]
        );

        await layer.council.castCouncilVote(
          council.decisionId,
          'member-1',
          CouncilVote.APPROVE,
          'Yes'
        );

        const stats = await layer.council.getCouncilVotingStats('member-1');
        expect(stats.councilMemberId).toBe('member-1');
        expect(stats.totalVotes).toBe(1);
        expect(stats.approvalsGiven).toBe(1);
      });
    });

    describe('Retrieval', () => {
      it('should retrieve council decision', async () => {
        const council = await layer.council.formCouncil(
          'Decision',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER]
        );

        const retrieved = await layer.council.getCouncilDecision(council.decisionId);
        expect(retrieved).toEqual(council);
      });

      it('should retrieve all council decisions', async () => {
        await layer.council.formCouncil(
          'Decision 1',
          'article-1' as any,
          { approve: true },
          [CouncilMemberRole.VOTER]
        );

        await layer.council.formCouncil(
          'Decision 2',
          'article-1' as any,
          { approve: false },
          [CouncilMemberRole.VOTER]
        );

        const all = await layer.council.getAllCouncilDecisions();
        expect(all).toHaveLength(2);
      });
    });
  });
});
