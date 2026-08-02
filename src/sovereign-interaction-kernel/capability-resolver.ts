/**
 * AZMA OS — SOVEREIGN INTERACTION KERNEL
 * Capability Resolver
 *
 * Pure function: maps a KernelIntent to a ResolverResult using only
 * SOVEREIGN_CHAMBER_MANIFESTS. No hardcoded chamber knowledge. No AI.
 * No side effects. Every resolution path is derived from manifest data.
 */

import {
  listAllChamberManifests,
  getChamberManifest,
} from '../sovereign-chamber-manifest';
import type {
  ManifestInteractionMode,
  SovereignChamberCapability,
  SovereignChamberManifest,
} from '../sovereign-chamber-manifest';
import type { KernelIntent, ResolvedCapability } from './types';

// ── Internal Resolution Result ────────────────────────────────────────────
// Not exported — consumers use InteractionSession from kernel.ts.

type ResolverResult =
  | { readonly status: 'RESOLVED'; readonly match: ResolvedCapability }
  | { readonly status: 'NEEDS_CLARIFICATION'; readonly candidates: readonly ResolvedCapability[] }
  | { readonly status: 'NO_MATCHING_CAPABILITY' };

// A confidence margin of ≥ 2 points is required to call a single winner.
// Below this threshold the Kernel declares ambiguity and returns all top candidates.
const AMBIGUITY_THRESHOLD = 2;

// ── Helpers ───────────────────────────────────────────────────────────────

function buildRequestWords(rawText: string): ReadonlySet<string> {
  const normalized = rawText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return new Set(normalized.split(' ').filter(Boolean));
}

function cleanCapabilityWord(word: string): string {
  return word.replace(/[^a-z0-9]/g, '');
}

function wordsFromText(text: string, minLength: number): ReadonlySet<string> {
  const result = new Set<string>();
  for (const raw of text.toLowerCase().split(/\s+/)) {
    const word = cleanCapabilityWord(raw);
    if (word.length > minLength) result.add(word);
  }
  return result;
}

function scoreCapability(
  capability: SovereignChamberCapability,
  requestWords: ReadonlySet<string>,
  mode: ManifestInteractionMode,
): number {
  if (!capability.interactionModes.includes(mode)) return 0;

  let score = 0;

  // displayName word match — higher weight (2 pts per unique word)
  // min length > 3 filters: a, an, to, is, in, or, of, the
  for (const word of wordsFromText(capability.displayName, 3)) {
    if (requestWords.has(word)) score += 2;
  }

  // purpose field word match — lower weight (1 pt per unique word)
  // min length > 4 also filters: from, into, have, what, when, they
  for (const word of wordsFromText(capability.purpose, 4)) {
    if (requestWords.has(word)) score += 1;
  }

  return score;
}

function toResolvedCapability(
  capability: SovereignChamberCapability,
  manifest: SovereignChamberManifest,
): ResolvedCapability {
  return {
    chamberId: manifest.chamberId,
    capabilityId: capability.capabilityId,
    capability,
    manifest,
  };
}

// ── Resolution Strategies ─────────────────────────────────────────────────

function resolveNavigate(intent: Extract<KernelIntent, { kind: 'navigate' }>): ResolverResult {
  const manifest = getChamberManifest(intent.targetChamber);
  if (!manifest) return { status: 'NO_MATCHING_CAPABILITY' };

  if (intent.capabilityId) {
    const cap = manifest.capabilities.find((c) => c.capabilityId === intent.capabilityId);
    if (!cap) return { status: 'NO_MATCHING_CAPABILITY' };
    return { status: 'RESOLVED', match: toResolvedCapability(cap, manifest) };
  }

  // No capabilityId: resolve to the primary (first declared) capability.
  const primary = manifest.capabilities[0];
  if (!primary) return { status: 'NO_MATCHING_CAPABILITY' };
  return { status: 'RESOLVED', match: toResolvedCapability(primary, manifest) };
}

function resolveByText(rawText: string, mode: ManifestInteractionMode): ResolverResult {
  const requestWords = buildRequestWords(rawText);
  if (requestWords.size === 0) return { status: 'NO_MATCHING_CAPABILITY' };

  const scored: Array<{ resolved: ResolvedCapability; score: number }> = [];

  for (const manifest of listAllChamberManifests()) {
    for (const capability of manifest.capabilities) {
      const score = scoreCapability(capability, requestWords, mode);
      if (score > 0) {
        scored.push({ resolved: toResolvedCapability(capability, manifest), score });
      }
    }
  }

  if (scored.length === 0) return { status: 'NO_MATCHING_CAPABILITY' };

  scored.sort((a, b) => b.score - a.score);

  const topScore = scored[0].score;
  const secondScore = scored.length > 1 ? scored[1].score : 0;

  if (topScore - secondScore < AMBIGUITY_THRESHOLD) {
    // Multiple capabilities scored too close together — cannot pick one confidently.
    const topTier = scored.filter((s) => s.score === topScore).map((s) => s.resolved);
    // If only one reaches top score but the margin to second is < threshold, include both.
    const candidates =
      topTier.length === 1 && scored.length > 1
        ? [...topTier, scored[1].resolved]
        : topTier;
    return { status: 'NEEDS_CLARIFICATION', candidates };
  }

  return { status: 'RESOLVED', match: scored[0].resolved };
}

// ── Public Entry Point ────────────────────────────────────────────────────

export function resolveCapability(intent: KernelIntent): ResolverResult {
  if (intent.kind === 'navigate') return resolveNavigate(intent);
  if (intent.kind === 'voice') return resolveByText(intent.transcript, 'listen');
  return resolveByText(intent.rawText, intent.preferredMode);
}
