import { RUNTIME_EVENT_TAXONOMY, RUNTIME_EVENT_VISIBILITY_MODEL } from '../taxonomy';
import { RUNTIME_SIGNAL_KINDS } from '../../runtime-interfaces/facade';

describe('Runtime Event Taxonomy', () => {
  it('classifies exactly the sixteen named runtime events, each exactly once', () => {
    const allMembers = Object.values(RUNTIME_EVENT_TAXONOMY).flatMap((entry) => entry.members);
    expect(allMembers.length).toBe(16);
    expect(new Set(allMembers).size).toBe(16);
    expect(allMembers.slice().sort()).toEqual([...RUNTIME_SIGNAL_KINDS].sort());
  });
});

describe('Runtime Event Visibility Model', () => {
  it('classifies exactly the sixteen named runtime events, each exactly once', () => {
    const allMembers = [
      ...RUNTIME_EVENT_VISIBILITY_MODEL.INTERNAL_ONLY.members,
      ...RUNTIME_EVENT_VISIBILITY_MODEL.FELT_EFFECT_ONLY.members,
      ...RUNTIME_EVENT_VISIBILITY_MODEL.CITIZEN_ORIGINATED.members,
      ...RUNTIME_EVENT_VISIBILITY_MODEL.NOT_APPLICABLE.members,
    ];
    expect(allMembers.length).toBe(16);
    expect(new Set(allMembers).size).toBe(16);
    expect(allMembers.slice().sort()).toEqual([...RUNTIME_SIGNAL_KINDS].sort());
  });
});
