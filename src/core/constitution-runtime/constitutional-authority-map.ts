import { ConflictingAuthorityResolutionError, MissingAuthorityBindingError, UnauthorizedByConstitutionError, UntraceableAuthorityRuleError } from './constitutional-authority-map-errors';
import {
  AuthorityActor,
  AuthorityDomain,
  AuthorityDomainBinding,
  AuthorityModelValidationResult,
  AuthorityQueryRequest,
  AuthorityQueryResult,
  AuthorityRuleTrace,
  AuthorityTier,
  AuthorityTransitionRule,
  AuthorityValidationRequest,
  AuthorityValidationResult,
  ConstitutionalAuthorityMapSnapshot,
} from './constitutional-authority-map-types';
import { ConstitutionActionType, ConstitutionArticleId } from './constitution-types';

function resolveTier(actor: AuthorityActor): AuthorityTier {
  if (actor === 'founder') {
    return 'founder';
  }
  if (actor === 'sovereign-high-council') {
    return 'sovereign-high-council';
  }
  if (actor === 'al-wateen') {
    return 'constitutional-intelligence';
  }
  return 'runtime-authority';
}

function buildRuleId(domain: AuthorityDomain): string {
  return `authority-rule-${domain}`;
}

function buildTraceId(ruleId: string): string {
  return `trace-${ruleId}`;
}

function defaultAnchors(domain: AuthorityDomain): readonly ConstitutionArticleId[] {
  const common: readonly ConstitutionArticleId[] = ['constitutional-structure', 'constitutional-synthesis', 'ratification-principle'];
  if (domain === 'founder-interaction') {
    return ['founder-experience', 'sovereign-high-council', ...common];
  }
  if (domain === 'policy') {
    return ['constitutional-ethics', 'constitutional-synthesis', ...common];
  }
  if (domain === 'escalation') {
    return ['sovereign-high-council', 'ratification-principle', ...common];
  }
  return common;
}

function defaultDomainBindings(): readonly AuthorityDomainBinding[] {
  const alWateen: readonly AuthorityDomain[] = ['memory', 'simulation', 'evolution', 'communication'];
  const constitutionRuntime: readonly AuthorityDomain[] = ['policy', 'security', 'provider-management', 'infrastructure', 'audit-accountability'];
  const sovereignCouncil: readonly AuthorityDomain[] = ['governance', 'approval', 'escalation', 'founder-interaction'];
  const orchestrator: readonly AuthorityDomain[] = ['chamber-interaction'];

  const allDomains: readonly AuthorityDomain[] = [
    'governance',
    'policy',
    'approval',
    'escalation',
    'audit-accountability',
    'security',
    'simulation',
    'evolution',
    'memory',
    'provider-management',
    'founder-interaction',
    'communication',
    'infrastructure',
    'chamber-interaction',
  ];

  return allDomains.map((domain) => {
    if (sovereignCouncil.includes(domain)) {
      return {
        domain,
        primaryOwner: 'sovereign-high-council',
        fallbackOwner: 'founder',
        allowedDelegates: ['al-wateen'],
        constitutionalAnchors: defaultAnchors(domain),
      };
    }

    if (alWateen.includes(domain)) {
      return {
        domain,
        primaryOwner: 'al-wateen',
        fallbackOwner: 'sovereign-high-council',
        allowedDelegates: ['constitution-runtime'],
        constitutionalAnchors: defaultAnchors(domain),
      };
    }

    if (constitutionRuntime.includes(domain)) {
      return {
        domain,
        primaryOwner: 'constitution-runtime',
        fallbackOwner: 'sovereign-high-council',
        allowedDelegates: ['al-wateen'],
        constitutionalAnchors: defaultAnchors(domain),
      };
    }

    if (orchestrator.includes(domain)) {
      return {
        domain,
        primaryOwner: 'sovereign-orchestrator',
        fallbackOwner: 'sovereign-high-council',
        allowedDelegates: ['constitution-runtime'],
        constitutionalAnchors: defaultAnchors(domain),
      };
    }

    return {
      domain,
      primaryOwner: 'constitution-runtime',
      fallbackOwner: 'sovereign-high-council',
      allowedDelegates: ['al-wateen'],
      constitutionalAnchors: defaultAnchors(domain),
    };
  });
}

function defaultTransitionRules(): readonly AuthorityTransitionRule[] {
  return [
    {
      fromTier: 'founder',
      toTier: 'sovereign-high-council',
      mode: 'allowed',
      rationale: 'Founder may route strategic authority to sovereign council runtime pathways.',
    },
    {
      fromTier: 'sovereign-high-council',
      toTier: 'constitutional-intelligence',
      mode: 'allowed',
      rationale: 'Council can delegate bounded intelligence execution to constitutional intelligence.',
    },
    {
      fromTier: 'constitutional-intelligence',
      toTier: 'runtime-authority',
      mode: 'conditional',
      rationale: 'Constitutional intelligence may delegate only for domain-bound execution with traceability.',
    },
    {
      fromTier: 'runtime-authority',
      toTier: 'constitutional-intelligence',
      mode: 'conditional',
      rationale: 'Runtime authority can request escalation back to constitutional intelligence.',
    },
    {
      fromTier: 'runtime-authority',
      toTier: 'sovereign-high-council',
      mode: 'conditional',
      rationale: 'High-impact and unresolved conflicts must escalate to sovereign council.',
    },
    {
      fromTier: 'runtime-authority',
      toTier: 'founder',
      mode: 'forbidden',
      rationale: 'Runtime authority cannot bypass sovereign council to reach founder directly.',
    },
  ];
}

function transitionAllowed(from: AuthorityTier, to: AuthorityTier, highImpact: boolean): boolean {
  if (from === to) {
    return true;
  }

  const transitions = defaultTransitionRules().filter((rule) => rule.fromTier === from && rule.toTier === to);
  if (transitions.length === 0) {
    return false;
  }

  return transitions.some((rule) => {
    if (rule.mode === 'allowed') {
      return true;
    }
    if (rule.mode === 'conditional') {
      return !highImpact || to === 'sovereign-high-council' || to === 'founder';
    }
    return false;
  });
}

function actionTypeToDomain(actionType: ConstitutionActionType): AuthorityDomain {
  switch (actionType) {
    case 'governance':
      return 'governance';
    case 'security':
      return 'security';
    case 'memory':
      return 'memory';
    case 'simulation':
      return 'simulation';
    case 'evolution':
      return 'evolution';
    case 'provider-management':
      return 'provider-management';
    case 'communication':
      return 'communication';
    case 'infrastructure':
      return 'infrastructure';
    case 'chamber-interaction':
      return 'chamber-interaction';
    case 'founder-interaction':
      return 'founder-interaction';
    case 'compliance-check':
      return 'audit-accountability';
    default:
      return 'approval';
  }
}

/**
 * Public interface: authority query and validation surface for the constitutional authority map.
 */
export class ConstitutionalAuthorityMap {
  private readonly domainMatrix: readonly AuthorityDomainBinding[];
  private readonly transitionMatrix: readonly AuthorityTransitionRule[];
  private readonly traceabilityMatrix: readonly AuthorityRuleTrace[];

  constructor(
    domainMatrix: readonly AuthorityDomainBinding[] = defaultDomainBindings(),
    transitionMatrix: readonly AuthorityTransitionRule[] = defaultTransitionRules()
  ) {
    this.domainMatrix = domainMatrix;
    this.transitionMatrix = transitionMatrix;
    this.traceabilityMatrix = this.buildTraceability(domainMatrix);
  }

  public getSnapshot(): ConstitutionalAuthorityMapSnapshot {
    return {
      domainMatrix: this.domainMatrix,
      transitionMatrix: this.transitionMatrix,
      traceabilityMatrix: this.traceabilityMatrix,
    };
  }

  public queryAuthority(request: AuthorityQueryRequest): AuthorityQueryResult {
    const binding = this.findBinding(request.domain);
    const ruleId = buildRuleId(binding.domain);
    const traceId = buildTraceId(ruleId);

    this.ensureTraceability(ruleId);

    const tier = resolveTier(binding.primaryOwner);

    return {
      domain: binding.domain,
      effectiveOwner: binding.primaryOwner,
      effectiveTier: tier,
      fallbackOwner: binding.fallbackOwner,
      ruleId,
      traceId,
      rationale: `Authority resolved for ${request.contextClass} in ${binding.domain} using constitutional binding.`,
    };
  }

  public validateAuthority(request: AuthorityValidationRequest): AuthorityValidationResult {
    const binding = this.findBinding(request.domain);
    const ruleId = buildRuleId(binding.domain);
    const traceId = buildTraceId(ruleId);
    const reasons: string[] = [];

    this.ensureTraceability(ruleId);

    const primaryTier = resolveTier(binding.primaryOwner);
    const actorTier = resolveTier(request.actor);

    if (request.actor === binding.primaryOwner) {
      reasons.push('Actor is the primary constitutional owner for this domain.');
      if (request.highImpact && primaryTier !== 'founder' && primaryTier !== 'sovereign-high-council') {
        reasons.push('High-impact action requires sovereign human gate escalation.');
        return {
          decision: 'escalate-required',
          ruleId,
          traceId,
          reasons,
          conflicts: [],
        };
      }
      return {
        decision: 'pass',
        ruleId,
        traceId,
        reasons,
        conflicts: [],
      };
    }

    if (request.actor === binding.fallbackOwner) {
      reasons.push('Actor is constitutional fallback owner.');
      return {
        decision: 'escalate-required',
        ruleId,
        traceId,
        reasons,
        conflicts: [binding.primaryOwner],
      };
    }

    if (binding.allowedDelegates.includes(request.actor)) {
      const allowed = transitionAllowed(actorTier, primaryTier, request.highImpact ?? false);
      if (!allowed) {
        throw new UnauthorizedByConstitutionError(request.actor, request.domain);
      }

      reasons.push('Actor is an allowed delegate and transition is constitutionally admissible.');
      if (request.highImpact) {
        reasons.push('High-impact delegate action requires escalation before grant.');
        return {
          decision: 'escalate-required',
          ruleId,
          traceId,
          reasons,
          conflicts: [binding.primaryOwner],
        };
      }

      return {
        decision: 'pass',
        ruleId,
        traceId,
        reasons,
        conflicts: [],
      };
    }

    throw new UnauthorizedByConstitutionError(request.actor, request.domain);
  }

  public traceAuthorityRule(ruleId: string): AuthorityRuleTrace {
    this.ensureTraceability(ruleId);
    const trace = this.traceabilityMatrix.find((current) => current.ruleId === ruleId);
    if (!trace) {
      throw new UntraceableAuthorityRuleError(ruleId);
    }
    return trace;
  }

  public validateModel(): AuthorityModelValidationResult {
    const allDomains = this.domainMatrix.map((entry) => entry.domain);
    const domainSet = new Set<AuthorityDomain>();
    const duplicateDomains: AuthorityDomain[] = [];

    for (const domain of allDomains) {
      if (domainSet.has(domain)) {
        duplicateDomains.push(domain);
      }
      domainSet.add(domain);
    }

    const expected: readonly AuthorityDomain[] = [
      'governance',
      'policy',
      'approval',
      'escalation',
      'audit-accountability',
      'security',
      'simulation',
      'evolution',
      'memory',
      'provider-management',
      'founder-interaction',
      'communication',
      'infrastructure',
      'chamber-interaction',
    ];

    const missingDomains = expected.filter((domain) => !domainSet.has(domain));
    const untraceableRules = this.traceabilityMatrix.filter((trace) => trace.constitutionalAnchors.length === 0).map((trace) => trace.ruleId);

    return {
      valid: missingDomains.length === 0 && duplicateDomains.length === 0 && untraceableRules.length === 0,
      missingDomains,
      duplicateDomains,
      untraceableRules,
    };
  }

  public inferDomain(actionType: ConstitutionActionType): AuthorityDomain {
    return actionTypeToDomain(actionType);
  }

  private findBinding(domain: AuthorityDomain): AuthorityDomainBinding {
    const candidates = this.domainMatrix.filter((entry) => entry.domain === domain);
    if (candidates.length === 0) {
      throw new MissingAuthorityBindingError(domain);
    }
    if (candidates.length > 1) {
      throw new ConflictingAuthorityResolutionError(
        domain,
        candidates.map((current) => current.primaryOwner)
      );
    }
    return candidates[0];
  }

  private ensureTraceability(ruleId: string): void {
    const exists = this.traceabilityMatrix.some((trace) => trace.ruleId === ruleId && trace.constitutionalAnchors.length > 0);
    if (!exists) {
      throw new UntraceableAuthorityRuleError(ruleId);
    }
  }

  private buildTraceability(domainMatrix: readonly AuthorityDomainBinding[]): readonly AuthorityRuleTrace[] {
    return domainMatrix.map((binding) => ({
      ruleId: buildRuleId(binding.domain),
      domain: binding.domain,
      constitutionalAnchors: binding.constitutionalAnchors,
      rationale: `Primary owner ${binding.primaryOwner} with fallback ${binding.fallbackOwner} for domain ${binding.domain}.`,
    }));
  }
}

export function createConstitutionalAuthorityMap(): ConstitutionalAuthorityMap {
  return new ConstitutionalAuthorityMap();
}
