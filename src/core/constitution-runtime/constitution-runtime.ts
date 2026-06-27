import { createConstitutionRuntimeEngine } from './constitution-bootstrap';
import { ConstitutionActionContext, ConstitutionArticleDefinition, ConstitutionEvaluationResult, ConstitutionEventRecord, ConstitutionLoadResult, ConstitutionStateSnapshot } from './constitution-types';
import { ConstitutionEngine } from './constitution-engine';
import { createConstitutionalAuthorityMap, ConstitutionalAuthorityMap } from './constitutional-authority-map';
import { AuthorityQueryRequest, AuthorityQueryResult, AuthorityRuleTrace, AuthorityValidationRequest, AuthorityValidationResult, ConstitutionalAuthorityMapSnapshot } from './constitutional-authority-map-types';
import { createEscalationHierarchyContract, EscalationHierarchyContract } from './escalation-hierarchy-contract';
import { EscalationHierarchySnapshot, EscalationRequest, EscalationResolutionRequest, EscalationResolutionResult, EscalationRoute, EscalationTrace } from './escalation-hierarchy-contract-types';
import { createPolicyRuleBoundaryContract, PolicyRuleBoundaryContract } from './policy-rule-boundary-contract';
import { PolicyBoundaryEvaluation, PolicyBoundaryRequest, PolicyBoundarySnapshot, PolicyBoundaryTrace } from './policy-rule-boundary-contract-types';

export class ConstitutionRuntime {
  private readonly engine: ConstitutionEngine;
  private readonly authorityMap: ConstitutionalAuthorityMap;
  private readonly escalationContract: EscalationHierarchyContract;
  private readonly policyBoundaryContract: PolicyRuleBoundaryContract;

  constructor(
    engine: ConstitutionEngine = createConstitutionRuntimeEngine(),
    authorityMap: ConstitutionalAuthorityMap = createConstitutionalAuthorityMap()
  ) {
    this.engine = engine;
    this.authorityMap = authorityMap;
    this.escalationContract = createEscalationHierarchyContract(this.authorityMap);
    this.policyBoundaryContract = createPolicyRuleBoundaryContract(
      this.authorityMap,
      this.escalationContract,
      () => this.engine.getRegistry().getPolicies()
    );
  }

  public loadConstitution(): ConstitutionLoadResult {
    return this.engine.loadConstitution();
  }

  public evaluate(action: ConstitutionActionContext): ConstitutionEvaluationResult {
    return this.engine.evaluate(action);
  }

  public resolvePermissions(action: ConstitutionActionContext) {
    return this.engine.resolvePermissions(action);
  }

  public resolvePriority(action: ConstitutionActionContext) {
    return this.engine.resolvePriority(action);
  }

  public publishState(): ConstitutionStateSnapshot {
    return this.engine.publishState();
  }

  public recordHistory(action: ConstitutionActionContext, decision: ConstitutionEvaluationResult['decision'], status: ConstitutionEvaluationResult['status'], reasons: readonly string[]): void {
    this.engine.recordHistory(action, decision, status, reasons);
  }

  public getEvents(): readonly ConstitutionEventRecord[] {
    return this.engine.getEvents();
  }

  public getState(): ConstitutionStateSnapshot | undefined {
    return this.engine.getState();
  }

  public getArticle(articleId: ConstitutionArticleDefinition['articleId']): ConstitutionArticleDefinition {
    return this.engine.getArticle(articleId);
  }

  /**
   * Public interface: Authority Query Interface.
   */
  public queryAuthority(request: AuthorityQueryRequest): AuthorityQueryResult {
    return this.authorityMap.queryAuthority(request);
  }

  /**
   * Public interface: Authority Validation Interface.
   */
  public validateAuthority(request: AuthorityValidationRequest): AuthorityValidationResult {
    return this.authorityMap.validateAuthority(request);
  }

  /**
   * Public interface: Authority Trace Interface.
   */
  public traceAuthorityRule(ruleId: string): AuthorityRuleTrace {
    return this.authorityMap.traceAuthorityRule(ruleId);
  }

  public getAuthorityMapSnapshot(): ConstitutionalAuthorityMapSnapshot {
    return this.authorityMap.getSnapshot();
  }

  /**
   * Public interface: Approval and Escalation Interface.
   */
  public planEscalation(request: EscalationRequest): EscalationRoute {
    return this.escalationContract.planEscalation(request);
  }

  public resolveEscalation(request: EscalationResolutionRequest): EscalationResolutionResult {
    return this.escalationContract.resolveEscalation(request);
  }

  public traceEscalation(escalationId: string): EscalationTrace {
    return this.escalationContract.traceEscalation(escalationId);
  }

  public getEscalationSnapshot(): EscalationHierarchySnapshot {
    return this.escalationContract.getSnapshot();
  }

  /**
   * Public interface: Policy Rule Boundary Contract Interface.
   */
  public evaluatePolicyBoundary(request: PolicyBoundaryRequest): PolicyBoundaryEvaluation {
    return this.policyBoundaryContract.evaluateBoundary(request);
  }

  public tracePolicyBoundary(boundaryId: string): PolicyBoundaryTrace {
    return this.policyBoundaryContract.traceBoundary(boundaryId);
  }

  public getPolicyBoundarySnapshot(): PolicyBoundarySnapshot {
    return this.policyBoundaryContract.getSnapshot();
  }
}
