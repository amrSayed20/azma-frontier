import { PersonalityEngine } from './personality-engine';
import { AdvisoryStyleEngine } from './advisory-style-engine';
import { CommunicationPolicy } from './communication-policy';
import { ConstitutionalConsciousness } from './constitutional-consciousness';
import { DialoguePrinciples } from './dialogue-principles';
import { FounderRelationshipEngine } from './founder-relationship-engine';
import { PersonalityMemory } from './personality-memory';
import { ResponseComposer } from './response-composer';
import { TrustModel } from './trust-model';

export function createPersonalityEngine(): PersonalityEngine {
  return new PersonalityEngine(
    new ConstitutionalConsciousness(),
    new DialoguePrinciples(),
    new FounderRelationshipEngine(),
    new AdvisoryStyleEngine(),
    new CommunicationPolicy(),
    new ResponseComposer(),
    new PersonalityMemory(),
    new TrustModel()
  );
}
