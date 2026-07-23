/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * The Constitutional Evolution Registry
 * Construction Phase X
 *
 * A pure, declarative, chronological record of every Constitutional
 * Construction Phase and Integration Package completed so far this
 * campaign — the Body's own evolutionary history, drawn directly from
 * each phase's own certified Engineering Review, not invented.
 */

import type { EvolutionPhaseRecord } from './types';

export const CONSTITUTIONAL_EVOLUTION_HISTORY: readonly EvolutionPhaseRecord[] = [
  { phaseId: 'phase-i', name: 'The Constitutional Skeleton', artifactPath: 'src/sovereign-body/', summary: 'Declarative registries: Body/Regions/Systems/Organs/Relationships/Boundaries/Authorities/Classifications.' },
  { phaseId: 'phase-ii', name: 'The Constitutional Nervous System', artifactPath: 'src/sovereign-nervous-system/', summary: 'A live Perception Bus and State Registry — the first executable mechanism this campaign built.' },
  { phaseId: 'integration-first-signals', name: 'Integration Package: The First Constitutional Signals', artifactPath: null, summary: 'Wired 4 real organs to the Perception Bus; discovered the client/server runtime-split limitation.' },
  { phaseId: 'phase-iii', name: 'The Constitutional Circulation', artifactPath: 'src/sovereign-circulation/', summary: "5 Flows over the Nervous System's Bus, plus a browser-to-server transport closing half the runtime-split gap." },
  { phaseId: 'phase-iv', name: 'The Constitutional Heart (Al-Wateen)', artifactPath: 'src/sovereign-heart/', summary: 'A Continuity Tracker and Heartbeat/Wake Cycle; resolved the Al-Watin/Al-Wateen naming collision by renaming the old orchestrator module.' },
  { phaseId: 'integration-first-heartbeat', name: 'Integration Package: The First Constitutional Heartbeat', artifactPath: null, summary: "Activated Al-Wateen in the live application (HeartPulse.tsx, mounted in app/layout.tsx)." },
  { phaseId: 'phase-v', name: 'The Sovereign Core', artifactPath: 'src/sovereign-core/', summary: 'A Knowledge Registry, Memory Integration Layer, Understanding Engine, Reasoning Layer, Planning Layer, and Advisory Layer.' },
  { phaseId: 'phase-vi', name: 'The Constitutional Identity', artifactPath: 'src/imperial-presence/', summary: 'Certified that Face/Voice/Tongue/Motion/Lighting/Typography/Color Authority/Cinematic Director/Presence already existed as one unforked identity, rather than building 9 new engines.' },
  { phaseId: 'integration-first-thought', name: 'Integration Package: The First Constitutional Thought', artifactPath: null, summary: "Activated the Sovereign Core's live perception intake." },
  { phaseId: 'phase-vii', name: 'The Constitutional Consciousness', artifactPath: 'src/sovereign-consciousness/', summary: "Completed the Skeleton's own stale 'global-ui-runtime' organ with an awareness layer: Condition, Harmony/Imbalance, and event-driven Change recognition." },
  { phaseId: 'phase-viii', name: 'The Constitutional Memory', artifactPath: 'src/sovereign-memory/', summary: 'A 4-tier Data/Information/Knowledge/Wisdom hierarchy over already-certified types; registered as its own first-class organ by Constitutional Decision.' },
  { phaseId: 'phase-ix', name: 'The Constitutional Wisdom', artifactPath: 'src/sovereign-wisdom/', summary: 'A Judgment Layer scoped to structural provenance only; ruled an emergent property of the Body, not its own organ.' },
  { phaseId: 'phase-x', name: 'The Constitutional Evolution', artifactPath: 'src/sovereign-evolution/', summary: "This phase — records how the Body's own already-certified maturity and history change over time, without altering the Skeleton's declared identity." },
] as const;
