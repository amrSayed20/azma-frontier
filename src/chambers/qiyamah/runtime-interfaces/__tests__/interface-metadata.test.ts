import {
  RUNTIME_INTERFACE_LIFECYCLE_WINDOWS,
  RUNTIME_INTERFACE_CITIZEN,
  RUNTIME_INTERFACE_COMPANION,
  RUNTIME_INTERFACE_GHOST_GUIDE,
  RUNTIME_INTERFACE_INVISIBLE_DIRECTOR,
  RUNTIME_INTERFACE_CREATIVE_RUNTIME,
  RUNTIME_INTERFACE_FUTURE_AI_ENGINE,
  RUNTIME_INTERFACE_LIFECYCLE_AND_SIGNAL_QUERY_SURFACE,
} from '../interface-metadata';
import { RUNTIME_LIFECYCLE_STAGES, type RuntimeLifecycleStage } from '../../runtime/lifecycle';

const ALL_CONTRACTS = [
  RUNTIME_INTERFACE_CITIZEN,
  RUNTIME_INTERFACE_COMPANION,
  RUNTIME_INTERFACE_GHOST_GUIDE,
  RUNTIME_INTERFACE_INVISIBLE_DIRECTOR,
  RUNTIME_INTERFACE_CREATIVE_RUNTIME,
  RUNTIME_INTERFACE_FUTURE_AI_ENGINE,
  RUNTIME_INTERFACE_LIFECYCLE_AND_SIGNAL_QUERY_SURFACE,
];

const REQUIRED_FIELDS = [
  'name', 'ownership', 'public_contracts', 'internal_contracts', 'responsibilities',
  'permissions', 'visibility', 'invariants', 'guards', 'lifecycle',
  'dependency_boundaries', 'traceability',
] as const;

describe('Runtime Interface Metadata', () => {
  it('defines all eleven required elements for every one of the seven interface entries', () => {
    for (const contract of ALL_CONTRACTS) {
      for (const field of REQUIRED_FIELDS) {
        expect(contract).toHaveProperty(field);
      }
    }
  });

  it('gives every contract a non-empty public_contracts and invariants list', () => {
    for (const contract of ALL_CONTRACTS) {
      expect(contract.public_contracts.length).toBeGreaterThan(0);
      expect(contract.invariants.length).toBeGreaterThan(0);
    }
  });

  it('restricts every lifecycle window to valid runtime lifecycle stages', () => {
    const validStages = new Set<string>(RUNTIME_LIFECYCLE_STAGES);
    for (const [name, window] of Object.entries(RUNTIME_INTERFACE_LIFECYCLE_WINDOWS)) {
      for (const stage of window) {
        expect({ name, stage, valid: validStages.has(stage) }).toEqual({ name, stage, valid: true });
      }
    }
  });

  it('restricts the Future AI Engine contract to exactly Creating and Directing', () => {
    expect(RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.FutureAIEngineContract).toEqual(['Creating', 'Directing']);
  });

  it('permits the Citizen contract only before an imagination has been identified', () => {
    const window: readonly RuntimeLifecycleStage[] = RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.CitizenContract;
    expect(window).not.toContain('Creating');
    expect(window).not.toContain('Rendering');
  });

  it('excludes Rendering from the Invisible Director\'s rhythm-change window', () => {
    expect(RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.InvisibleDirectorContract).not.toContain('Rendering');
  });
});
