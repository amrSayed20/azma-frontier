/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-029 & WP-030: Agent Cooperation & Constitutional Decision Council
 * Type Definitions & Service Contracts
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Layer 7 Extended: From isolated agent decisions to cooperative civilization
 * 
 * Contract Imports (Dependencies):
 * - AgentIdentity, AgentRole, AgentConstitutionalAuthority (WP-021-022)
 * - AgentDecisionCapability, AgentDecisionContext (WP-023)
 * - ConstitutionArticleId (Layer 1)
 */

import { ConstitutionArticleId } from './constitution-types';

// ════════════════════════════════════════════════════════════════════════════
// WP-029: AGENT COOPERATION FRAMEWORK
// ════════════════════════════════════════════════════════════════════════════

/**
 * Cooperation request types between agents
 */
export enum CooperationType {
  DELEGATION = 'DELEGATION',           // Agent A delegates work to Agent B
  ASSISTANCE_REQUEST = 'ASSISTANCE_REQUEST',  // Agent A requests help from Agent B
  RESPONSIBILITY_NEGOTIATION = 'RESPONSIBILITY_NEGOTIATION',  // Negotiate who owns decision
  CONTEXT_SHARING = 'CONTEXT_SHARING', // Share constitutional context
  MEMORY_SHARING_REQUEST = 'MEMORY_SHARING_REQUEST',  // Request access to memory
  EXECUTION_OWNERSHIP_TRANSFER = 'EXECUTION_OWNERSHIP_TRANSFER'  // Return ownership
}

/**
 * Cooperation request status
 */
export enum CooperationStatus {
  PENDING = 'PENDING',           // Waiting for response
  ACCEPTED = 'ACCEPTED',         // Request accepted
  EXECUTING = 'EXECUTING',       // Work in progress
  COMPLETED = 'COMPLETED',       // Work finished
  FAILED = 'FAILED',             // Work failed
  REJECTED = 'REJECTED',         // Request rejected
  CANCELLED = 'CANCELLED'        // Request cancelled
}

/**
 * Delegation request: Agent A asks Agent B to execute decision/work
 */
export interface DelegationRequest {
  readonly requestId: string;
  readonly delegatingAgentId: string;    // Agent A (delegator)
  readonly delegatedAgentId: string;     // Agent B (delegatee)
  readonly originalDecisionId: string;   // Traceable to original decision
  readonly constitutionalBasis: ConstitutionArticleId;
  readonly delegatedWork: {
    readonly description: string;
    readonly expectedOutcome: string;
    readonly timeoutMs: number;
  };
  readonly createdAt: number;  // timestamp
  readonly status: CooperationStatus;
  readonly acceptedAt?: number;
  readonly startedAt?: number;
  readonly completedAt?: number;
  readonly result?: unknown;    // Execution result
  readonly error?: string;      // Failure message
}

/**
 * Assistance request: Agent A asks Agent B for help/advice
 */
export interface AssistanceRequest {
  readonly requestId: string;
  readonly requestingAgentId: string;    // Agent A (requester)
  readonly assistingAgentId: string;     // Agent B (assistant)
  readonly problem: string;              // Description of problem
  readonly context: {
    readonly currentDecisionContext: Record<string, unknown>;
    readonly constraintsFaced: readonly string[];
    readonly questionsAsked: readonly string[];
  };
  readonly createdAt: number;
  readonly status: CooperationStatus;
  readonly respondedAt?: number;
  readonly advice?: string;
  readonly recommendations?: readonly string[];
  readonly additionalContext?: Record<string, unknown>;
}

/**
 * Responsibility negotiation: Agents agree on decision ownership
 */
export interface ResponsibilityNegotiation {
  readonly negotiationId: string;
  readonly initiatingAgentId: string;    // Agent A (proposer)
  readonly targetAgentId: string;        // Agent B (respondent)
  readonly decisionType: string;         // Type of decision to negotiate
  readonly proposedAgentResponsible: string;  // Who should own it
  readonly rationale: string;
  readonly createdAt: number;
  readonly status: CooperationStatus;
  readonly respondedAt?: number;
  readonly agreedAgentResponsible?: string;
  readonly agreementRationale?: string;
  readonly accepted?: boolean;
}

/**
 * Constitutional context sharing: Common reference for decisions
 */
export interface ConstitutionalContextShare {
  readonly shareId: string;
  readonly sharingAgentId: string;
  readonly receivingAgentId: string;
  readonly articlesShared: readonly ConstitutionArticleId[];
  readonly policyChain: readonly string[];     // Linked policy decisions
  readonly constraintsSummary: string;
  readonly previousDecisionsInContext: readonly string[];
  readonly createdAt: number;
  readonly expiresAt: number;    // Context expires
  readonly accessLevel: 'FULL' | 'PARTIAL' | 'READ_ONLY';
}

/**
 * Shared memory access: Controlled memory visibility between agents
 */
export interface SharedMemoryAccess {
  readonly accessId: string;
  readonly grantingAgentId: string;      // Agent A (owner)
  readonly receivingAgentId: string;     // Agent B (accessor)
  readonly memoryCategory: 'CONTEXT' | 'DECISION' | 'OBSERVATION' | 'REASONING' | 'RESULT';
  readonly entriesShared: readonly string[];  // Memory entry IDs
  readonly authorizationBasis: ConstitutionArticleId;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly readOnly: boolean;            // Can agent B modify?
  readonly accessCount: number;          // Times accessed
  readonly lastAccessedAt?: number;
}

/**
 * Execution ownership transfer: Agent B returns ownership to Agent A
 */
export interface ExecutionOwnershipTransfer {
  readonly transferId: string;
  readonly returningAgentId: string;     // Agent B (returning ownership)
  readonly receivingAgentId: string;     // Agent A (regaining ownership)
  readonly originalDelegationId?: string;
  readonly executionProgress: {
    readonly stepsCompleted: number;
    readonly totalSteps: number;
    readonly percentComplete: number;
  };
  readonly currentState: Record<string, unknown>;
  readonly decision?: {
    readonly decisionId: string;
    readonly result: unknown;
    readonly confidence: number;
  };
  readonly createdAt: number;
  readonly accepted?: boolean;
  readonly acceptedAt?: number;
  readonly finalResult?: unknown;
}

/**
 * Cooperative execution context: Full state of multi-agent cooperation
 */
export interface CooperativeExecutionContext {
  readonly executionId: string;
  readonly participatingAgentIds: readonly string[];
  readonly initiatingAgentId: string;
  readonly cooperationType: CooperationType;
  readonly originalRequestId: string;
  readonly delegationChain: readonly string[];      // [Agent1 → Agent2 → Agent3]
  readonly createdAt: number;
  readonly startedAt?: number;
  readonly completedAt?: number;
  readonly status: CooperationStatus;
  readonly sharedContexts: readonly ConstitutionalContextShare[];
  readonly sharedMemory: readonly SharedMemoryAccess[];
  readonly currentOwner: string;
  readonly result?: unknown;
  readonly error?: string;
}

/**
 * Cooperation statistics for each agent
 */
export interface CooperationStatistics {
  readonly agentId: string;
  readonly totalCooperations: number;
  readonly delegationsSent: number;
  readonly delegationsReceived: number;
  readonly assistanceRequested: number;
  readonly assistanceProvided: number;
  readonly successRate: number;  // 0-1
  readonly averageExecutionTimeMs: number;
  readonly negotiationsInitiated: number;
  readonly negotiationsResolved: number;
  readonly memorySharesGranted: number;
  readonly contextSharesReceived: number;
}

/**
 * Service contract: Agent Cooperation Orchestration
 */
export interface AgentCooperationServiceContract {
  // Delegation
  createDelegationRequest(
    delegatingAgentId: string,
    delegatedAgentId: string,
    originalDecisionId: string,
    constitutionalBasis: ConstitutionArticleId,
    work: DelegationRequest['delegatedWork']
  ): Promise<DelegationRequest>;

  acceptDelegation(requestId: string): Promise<DelegationRequest>;
  rejectDelegation(requestId: string, reason?: string): Promise<DelegationRequest>;
  completeDelegation(requestId: string, result: unknown): Promise<DelegationRequest>;
  failDelegation(requestId: string, error: string): Promise<DelegationRequest>;
  getDelegation(requestId: string): Promise<DelegationRequest | null>;

  // Assistance
  requestAssistance(
    requestingAgentId: string,
    assistingAgentId: string,
    problem: string,
    context: AssistanceRequest['context']
  ): Promise<AssistanceRequest>;

  respondToAssistance(
    requestId: string,
    advice: string,
    recommendations: readonly string[]
  ): Promise<AssistanceRequest>;

  getAssistanceRequest(requestId: string): Promise<AssistanceRequest | null>;

  // Responsibility
  initiateResponsibilityNegotiation(
    initiatingAgentId: string,
    targetAgentId: string,
    decisionType: string,
    proposedResponsible: string,
    rationale: string
  ): Promise<ResponsibilityNegotiation>;

  respondToNegotiation(
    negotiationId: string,
    agreeToProposal: boolean,
    proposedAlternative?: string
  ): Promise<ResponsibilityNegotiation>;

  // Context sharing
  shareConstitutionalContext(
    sharingAgentId: string,
    receivingAgentId: string,
    articles: readonly ConstitutionArticleId[],
    accessLevel: 'FULL' | 'PARTIAL' | 'READ_ONLY'
  ): Promise<ConstitutionalContextShare>;

  // Memory sharing
  grantMemoryAccess(
    grantingAgentId: string,
    receivingAgentId: string,
    memoryCategory: SharedMemoryAccess['memoryCategory'],
    entryIds: readonly string[],
    authorizationBasis: ConstitutionArticleId
  ): Promise<SharedMemoryAccess>;

  // Ownership transfer
  transferExecutionOwnership(
    returningAgentId: string,
    receivingAgentId: string,
    delegationId: string,
    progress: ExecutionOwnershipTransfer['executionProgress'],
    currentState: Record<string, unknown>
  ): Promise<ExecutionOwnershipTransfer>;

  // Statistics
  getCooperationStats(agentId: string): Promise<CooperationStatistics>;
}

// ════════════════════════════════════════════════════════════════════════════
// WP-030: CONSTITUTIONAL DECISION COUNCIL
// ════════════════════════════════════════════════════════════════════════════

/**
 * Council member roles in decision-making
 */
export enum CouncilMemberRole {
  VOTER = 'VOTER',               // Regular voting member
  AUTHORITY_HOLDER = 'AUTHORITY_HOLDER',  // Can veto decisions
  EXECUTOR = 'EXECUTOR',         // Will execute decision
  OBSERVER = 'OBSERVER',         // Monitor only
  FACILITATOR = 'FACILITATOR',   // Guides council process
  HUMAN_REPRESENTATIVE = 'HUMAN_REPRESENTATIVE'  // Human delegate
}

/**
 * Council voting options
 */
export enum CouncilVote {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ABSTAIN = 'ABSTAIN',
  CONDITIONAL = 'CONDITIONAL'
}

/**
 * Council decision status
 */
export enum CouncilDecisionStatus {
  FORMING = 'FORMING',             // Gathering members
  VOTING = 'VOTING',               // Members voting
  VETO_REVIEW = 'VETO_REVIEW',     // Constitutional veto under review
  APPROVED = 'APPROVED',           // Decision approved
  REJECTED = 'REJECTED',           // Decision rejected
  ESCALATED = 'ESCALATED',         // Escalated to human
  SOVEREIGN_APPROVAL_PENDING = 'SOVEREIGN_APPROVAL_PENDING',
  EXECUTED = 'EXECUTED',           // Decision executed
  OVERRIDDEN = 'OVERRIDDEN'        // Authority override applied
}

/**
 * Individual council member vote
 */
export interface CouncilMemberVote {
  readonly memberId: string;
  readonly memberRole: CouncilMemberRole;
  readonly vote: CouncilVote;
  readonly reasoning: string;
  readonly conditions?: readonly string[];  // If CONDITIONAL
  readonly timestamp: number;
  readonly weight: number;  // Voting power (1 for equal, higher for authority)
}

/**
 * Constitutional veto: Authority overrides normal voting
 */
export interface ConstitutionalVeto {
  readonly vetoId: string;
  readonly vetoingAgentId: string;
  readonly constitutionalBasis: ConstitutionArticleId;
  readonly vetoReason: string;
  readonly allowsAlternative: boolean;
  readonly suggestedAlternative?: string;
  readonly timestamp: number;
  readonly overriddenBy?: string;  // If override applied
  readonly overrideReason?: string;
}

/**
 * Authority override: Higher authority overrides council decision
 */
export interface AuthorityOverride {
  readonly overrideId: string;
  readonly overridingAgentId: string;
  readonly originalDecisionId: string;
  readonly authorityLevel: number;  // Must be higher than original decision authority
  readonly overrideReason: string;
  readonly newDecision: unknown;
  readonly timestamp: number;
  readonly auditTrailId: string;
}

/**
 * Human escalation: Issue requires human decision-making
 */
export interface HumanEscalation {
  readonly escalationId: string;
  readonly councilDecisionId: string;
  readonly escalationReason: string;
  readonly reasonCategory: 'CONSTITUTIONAL_CONFLICT' | 'AUTHORITY_INSUFFICIENT' |
                           'HUMAN_JUDGMENT_NEEDED' | 'VALUE_TRADEOFF' | 'RISK_MITIGATION';
  readonly escalatedAt: number;
  readonly escalatedToRole: string;  // "SecurityOfficer", "CTO", etc.
  readonly humanDecision?: unknown;
  readonly humanApprovedAt?: number;
  readonly humanApprovalMessage?: string;
}

/**
 * Sovereign approval: Final authorization from sovereign entity
 */
export interface SovereignApproval {
  readonly approvalId: string;
  readonly councilDecisionId: string;
  readonly sovereignId: string;  // Ultimate authority
  readonly approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'APPROVED_WITH_CONDITIONS';
  readonly requestedAt: number;
  readonly respondedAt?: number;
  readonly approvalReason?: string;
  readonly conditions?: readonly string[];
}

/**
 * Complete council decision record
 */
export interface CouncilDecision {
  readonly decisionId: string;
  readonly councilMembers: readonly CouncilMemberRole[];
  readonly participatingAgentIds: readonly string[];
  readonly decisionTopic: string;
  readonly constitutionalBasis: ConstitutionArticleId;
  readonly proposedOutcome: unknown;
  readonly createdAt: number;
  readonly votingStartedAt?: number;
  readonly votingEndedAt?: number;
  readonly votes: readonly CouncilMemberVote[];
  readonly status: CouncilDecisionStatus;
  readonly majorityVotesNeeded: number;
  readonly approvalVotes: number;
  readonly rejectionVotes: number;
  readonly abstentions: number;
  readonly vetoes: readonly ConstitutionalVeto[];
  readonly override?: AuthorityOverride;
  readonly humanEscalation?: HumanEscalation;
  readonly sovereignApproval?: SovereignApproval;
  readonly finalDecision?: unknown;
  readonly executedAt?: number;
  readonly auditTrailId: string;
}

/**
 * Council voting statistics
 */
export interface CouncilVotingStatistics {
  readonly councilMemberId: string;
  readonly totalVotes: number;
  readonly approvalsGiven: number;
  readonly rejectionsGiven: number;
  readonly abstentions: number;
  readonly vetosIssued: number;
  readonly vetoesOverridden: number;
  readonly averageDecisionTimeMs: number;
  readonly preferredCouncilTopics: readonly string[];
}

/**
 * Service contract: Constitutional Decision Council Orchestration
 */
export interface ConstitutionalDecisionCouncilServiceContract {
  // Council formation
  formCouncil(
    decisionTopic: string,
    constitutionalBasis: ConstitutionArticleId,
    proposedOutcome: unknown,
    memberRoles: readonly CouncilMemberRole[]
  ): Promise<CouncilDecision>;

  addCouncilMember(
    decisionId: string,
    memberId: string,
    memberRole: CouncilMemberRole,
    votingWeight?: number
  ): Promise<CouncilDecision>;

  // Voting
  castCouncilVote(
    decisionId: string,
    memberId: string,
    vote: CouncilVote,
    reasoning: string,
    conditions?: readonly string[]
  ): Promise<CouncilMemberVote>;

  closeVoting(decisionId: string): Promise<CouncilDecision>;

  // Constitutional veto
  issueConstitutionalVeto(
    decisionId: string,
    vetoingAgentId: string,
    constitutionalBasis: ConstitutionArticleId,
    reason: string
  ): Promise<ConstitutionalVeto>;

  overrideVeto(vetoId: string, overridingAgentId: string, reason: string): Promise<ConstitutionalVeto>;

  // Authority override
  applyAuthorityOverride(
    decisionId: string,
    overridingAgentId: string,
    authorityLevel: number,
    newDecision: unknown,
    reason: string
  ): Promise<AuthorityOverride>;

  // Human escalation
  escalateToHuman(
    decisionId: string,
    reason: string,
    category: HumanEscalation['reasonCategory'],
    escalatedToRole: string
  ): Promise<HumanEscalation>;

  recordHumanDecision(
    escalationId: string,
    decision: unknown,
    approvalMessage?: string
  ): Promise<HumanEscalation>;

  // Sovereign approval
  requestSovereignApproval(
    decisionId: string,
    sovereignId: string
  ): Promise<SovereignApproval>;

  approveSovereignly(
    approvalId: string,
    approvalStatus: 'APPROVED' | 'REJECTED',
    reason?: string,
    conditions?: readonly string[]
  ): Promise<SovereignApproval>;

  // Statistics
  getCouncilVotingStats(memberId: string): Promise<CouncilVotingStatistics>;

  // Retrieval
  getCouncilDecision(decisionId: string): Promise<CouncilDecision | null>;
  getAllCouncilDecisions(): Promise<readonly CouncilDecision[]>;
}

/**
 * Unified cooperation & council layer contract
 */
export interface CooperationCouncilLayerContract {
  readonly cooperation: AgentCooperationServiceContract;
  readonly council: ConstitutionalDecisionCouncilServiceContract;
}
