/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION
 * The Constitutional Flow Registry
 * Construction Phase III
 */

import type { ConstitutionalFlow } from './types';

export const CONSTITUTIONAL_FLOWS: readonly ConstitutionalFlow[] = [
  {
    id: 'state-flow',
    name: 'The Constitutional State Flow',
    purpose: 'Carries "State" signals — an organ reporting what is currently true of it — across every runtime.',
    filter: 'signalType === "State"',
  },
  {
    id: 'context-flow',
    name: 'The Constitutional Context Flow',
    purpose:
      "Carries signals related to the Creator's journey context — which chamber or organ context is presently active (relatedEvent: Creator Arrived / Entered Chamber / Leaving).",
    filter: 'relatedEvent is a journey-context Constitutional Event',
  },
  {
    id: 'capability-flow',
    name: 'The Constitutional Capability Flow',
    purpose:
      'Carries signals originating from, or concerning, the Sovereign Capability Diwan. Ready infrastructure for when the Diwan gains a real consumer (SCD-004 found none exist yet) — this flow does not fabricate activity that is not real.',
    filter: 'origin === "sovereign-capability-diwan" || signalType === "Purpose"',
  },
  {
    id: 'authority-flow',
    name: 'The Constitutional Authority Flow',
    purpose: 'Carries "Authority" signals — which constitutional authority reported a given fact — across every runtime.',
    filter: 'signalType === "Authority"',
  },
  {
    id: 'health-flow',
    name: 'The Constitutional Health Flow',
    purpose: 'Carries "Health" signals — an organ reporting weakness or failure — across every runtime.',
    filter: 'signalType === "Health"',
  },
] as const;
