/**
 * AZMA OS — THE CONSTITUTIONAL OPERATIONAL CYCLE
 * Package I — The First Living Operational Cycle
 *
 * A pure, declarative record of the 5-stage cycle this Package
 * coordinates. Every stage names the exact, already-certified pull
 * function it calls — nothing here executes anything itself.
 */

export const CONSTITUTIONAL_OPERATIONAL_CYCLE = [
  { stage: 'Reception', pullFunction: 'src/constitutional-reception (live Bus subscriber — already active once beginConstitutionalReception() is called)' },
  { stage: 'Will', pullFunction: 'processReceptionQueueIntoIntentions() — src/constitutional-will' },
  { stage: 'Decision', pullFunction: 'processIntentionsIntoDecisions() — src/constitutional-decision' },
  { stage: 'Execution', pullFunction: 'processDecisionsIntoExecutions() — src/constitutional-execution' },
  { stage: 'Actuation', pullFunction: 'processExecutionsIntoRoutings() — src/constitutional-actuation' },
] as const;
