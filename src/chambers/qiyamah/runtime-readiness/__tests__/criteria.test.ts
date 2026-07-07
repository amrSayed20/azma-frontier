import { RUNTIME_COMPLETENESS_CRITERIA } from '../criteria';
import { RUNTIME_STATE_ARCHITECTURES } from '../../runtime-state/states';
import { RUNTIME_EVENT_ARCHITECTURES } from '../../runtime-event/events';
import { RUNTIME_CONTRACT_BEHAVIORS } from '../../runtime-behavior/contracts';
import { RUNTIME_VALIDATION_POINTS } from '../../runtime-validation/validation-points';
import { RUNTIME_BOUNDARY_CHECKS } from '../../runtime-validation/boundary-checks';
import * as runtimeFoundation from '../../runtime';
import * as runtimeInterfaces from '../../runtime-interfaces';
import * as runtimeBehavior from '../../runtime-behavior';
import * as runtimeState from '../../runtime-state';
import * as runtimeEvent from '../../runtime-event';
import * as runtimeValidation from '../../runtime-validation';
import * as runtimeIntegration from '../../runtime-integration';

describe('Runtime Completeness Criteria — live re-verification', () => {
  it('re-verifies every count claimed in RUNTIME_COMPLETENESS_CRITERIA against the live modules', () => {
    expect(RUNTIME_STATE_ARCHITECTURES.length).toBe(RUNTIME_COMPLETENESS_CRITERIA.countChecks.runtimeStates.expected);
    expect(RUNTIME_EVENT_ARCHITECTURES.length).toBe(RUNTIME_COMPLETENESS_CRITERIA.countChecks.runtimeEvents.expected);
    expect(RUNTIME_CONTRACT_BEHAVIORS.length).toBe(RUNTIME_COMPLETENESS_CRITERIA.countChecks.runtimeContracts.expected);
    expect(RUNTIME_VALIDATION_POINTS.length).toBe(RUNTIME_COMPLETENESS_CRITERIA.countChecks.validationPoints.expected);
    expect(RUNTIME_BOUNDARY_CHECKS.length).toBe(RUNTIME_COMPLETENESS_CRITERIA.countChecks.boundaryChecks.expected);
  });

  it('confirms every one of the seven modules exposes its declared unified export', () => {
    expect(runtimeFoundation).toHaveProperty('QIYAMAH_LIVING_RUNTIME_FOUNDATION');
    expect(runtimeInterfaces).toHaveProperty('QIYAMAH_LIVING_RUNTIME_INTERFACES');
    expect(runtimeBehavior).toHaveProperty('QIYAMAH_LIVING_RUNTIME_BEHAVIOR_MODEL');
    expect(runtimeState).toHaveProperty('QIYAMAH_LIVING_RUNTIME_STATE_MODEL');
    expect(runtimeEvent).toHaveProperty('QIYAMAH_LIVING_RUNTIME_EVENT_MODEL');
    expect(runtimeValidation).toHaveProperty('QIYAMAH_LIVING_RUNTIME_VALIDATION_MODEL');
    expect(runtimeIntegration).toHaveProperty('QIYAMAH_LIVING_RUNTIME_INTEGRATION_MODEL');
  });

  it('lists exactly the seven required modules, matching requiredModules', () => {
    expect(RUNTIME_COMPLETENESS_CRITERIA.requiredModules).toHaveLength(7);
  });
});
