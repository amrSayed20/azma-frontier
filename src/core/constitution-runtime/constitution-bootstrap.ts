import { ConstitutionEngine } from './constitution-engine';
import { ConstitutionEventManager } from './constitution-event-manager';
import { ConstitutionHistory } from './constitution-history';
import { ConstitutionPermissionEngine } from './constitution-permission-engine';
import { ConstitutionPolicyManager } from './constitution-policy-manager';
import { ConstitutionPriorityEngine } from './constitution-priority-engine';
import { createConstitutionRegistry } from './constitution-registry';
import { ConstitutionState } from './constitution-state';
import { ConstitutionValidator } from './constitution-validator';

export function createConstitutionRuntimeEngine(): ConstitutionEngine {
  const registry = createConstitutionRegistry();
  const history = new ConstitutionHistory();
  const eventManager = new ConstitutionEventManager();
  const state = new ConstitutionState();
  const policyManager = new ConstitutionPolicyManager(registry);
  const permissionEngine = new ConstitutionPermissionEngine();
  const priorityEngine = new ConstitutionPriorityEngine();
  const validator = new ConstitutionValidator(registry, policyManager, permissionEngine, priorityEngine);
  return new ConstitutionEngine(registry, policyManager, permissionEngine, priorityEngine, validator, eventManager, state, history);
}
