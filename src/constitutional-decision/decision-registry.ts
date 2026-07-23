/**
 * AZMA OS — THE CONSTITUTIONAL DECISION
 * The Constitutional Decision Registry
 * Construction Campaign
 *
 * A pure, declarative record of this module's own pipeline stages.
 */

export const CONSTITUTIONAL_DECISION_PIPELINE = [
  { stage: 'Receive', description: "Pull, on demand, from Constitutional Will's own Intention Queue — never from the Nervous System Bus, never from any organ directly." },
  { stage: 'Consult', description: 'Read (never mutate) the Skeleton (Constitutional Law), Constitutional Wisdom, Constitutional Memory, and Constitutional Awareness — each an already-certified, pure query.' },
  { stage: 'Judge', description: 'Apply one deterministic decision tree over the 4 consultations, in a fixed priority order, to reach exactly one of 4 verdicts.' },
  { stage: 'Record', description: "Append the Decision to the Decision History — permanent, traceable, never modified once recorded." },
] as const;
