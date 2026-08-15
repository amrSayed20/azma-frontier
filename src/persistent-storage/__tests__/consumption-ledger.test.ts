/**
 * AZMA OS — CONSUMPTION LEDGER FOUNDATION
 *
 * Tests cover:
 *   1. Cost estimator — pure functions, no network
 *   2. getCurrentMonthKey — format and determinism
 *   3. checkConsumptionCap — all three operation types, boundary conditions
 *   4. ConsumptionRepository — SQLite :memory: (no network, no filesystem)
 *      4a. record() persists correctly
 *      4b. getMonthlyUsage() aggregates by operation type
 *      4c. getMonthlyUsage() isolates by creator and by month
 *      4d. getAllCreatorsUsage() groups all creators and sorts by cost
 *      4e. zero-row case returns empty MonthlyUsage
 */

import { createDatabase } from '../db';
import { ConsumptionRepository } from '../consumption-repository';
import { OperationType } from '../../consumption-ledger/consumption-ledger-contracts';
import {
  estimateImageGenerationCost,
  estimateTtsCost,
  estimateVoiceCloneCost,
  getCurrentMonthKey,
} from '../../consumption-ledger/cost-estimator';
import {
  checkConsumptionCap,
  BETA_USAGE_CAP,
} from '../../consumption-ledger/consumption-cap-enforcer';

// ─── SECTION 1 & 2: COST ESTIMATOR ──────────────────────────────────────────

describe('Cost estimator — pure functions', () => {
  it('standard image cost is 0.040 USD', () => {
    expect(estimateImageGenerationCost('standard')).toBe(0.040);
  });

  it('HD image cost is 0.080 USD', () => {
    expect(estimateImageGenerationCost('hd')).toBe(0.080);
  });

  it('default image quality is standard', () => {
    expect(estimateImageGenerationCost()).toBe(0.040);
  });

  it('TTS cost scales linearly with character count', () => {
    expect(estimateTtsCost(1000)).toBeCloseTo(0.015);
    expect(estimateTtsCost(2000)).toBeCloseTo(0.030);
    expect(estimateTtsCost(500)).toBeCloseTo(0.0075);
  });

  it('TTS-1-HD rate is double the standard rate', () => {
    expect(estimateTtsCost(1000, 'tts-1-hd')).toBeCloseTo(0.030);
  });

  it('voice clone cost is positive', () => {
    expect(estimateVoiceCloneCost()).toBeGreaterThan(0);
  });

  it('getCurrentMonthKey returns YYYY-MM format', () => {
    expect(getCurrentMonthKey()).toMatch(/^\d{4}-(?:0[1-9]|1[0-2])$/);
  });

  it('getCurrentMonthKey is deterministic for the same timestamp', () => {
    const ts = 1700000000000; // known fixed timestamp
    expect(getCurrentMonthKey(ts)).toBe(getCurrentMonthKey(ts));
  });
});

// ─── SECTION 3: CAP ENFORCER ─────────────────────────────────────────────────

describe('checkConsumptionCap — image generation', () => {
  const emptyUsage = { imageGenerations: 0, ttsCharacters: 0, voiceClones: 0, totalCostUsdEstimate: 0 };

  it('allows first image when under cap', () => {
    const result = checkConsumptionCap(emptyUsage, BETA_USAGE_CAP, OperationType.IMAGE_GENERATION, 1);
    expect(result.allowed).toBe(true);
  });

  it('allows exactly at cap limit', () => {
    const usage = { ...emptyUsage, imageGenerations: BETA_USAGE_CAP.imageGenerations - 1 };
    const result = checkConsumptionCap(usage, BETA_USAGE_CAP, OperationType.IMAGE_GENERATION, 1);
    expect(result.allowed).toBe(true);
  });

  it('blocks when at cap', () => {
    const usage = { ...emptyUsage, imageGenerations: BETA_USAGE_CAP.imageGenerations };
    const result = checkConsumptionCap(usage, BETA_USAGE_CAP, OperationType.IMAGE_GENERATION, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('image');
  });

  it('blocks when exceeding cap by 1', () => {
    const usage = { ...emptyUsage, imageGenerations: BETA_USAGE_CAP.imageGenerations + 1 };
    const result = checkConsumptionCap(usage, BETA_USAGE_CAP, OperationType.IMAGE_GENERATION, 1);
    expect(result.allowed).toBe(false);
  });
});

describe('checkConsumptionCap — TTS', () => {
  const emptyUsage = { imageGenerations: 0, ttsCharacters: 0, voiceClones: 0, totalCostUsdEstimate: 0 };

  it('allows TTS within cap', () => {
    const result = checkConsumptionCap(emptyUsage, BETA_USAGE_CAP, OperationType.TEXT_TO_SPEECH, 1000);
    expect(result.allowed).toBe(true);
  });

  it('blocks TTS that would exceed cap', () => {
    const usage = { ...emptyUsage, ttsCharacters: BETA_USAGE_CAP.ttsCharacters - 100 };
    const result = checkConsumptionCap(usage, BETA_USAGE_CAP, OperationType.TEXT_TO_SPEECH, 101);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });
});

describe('checkConsumptionCap — voice clone', () => {
  const emptyUsage = { imageGenerations: 0, ttsCharacters: 0, voiceClones: 0, totalCostUsdEstimate: 0 };

  it('allows first clone', () => {
    const result = checkConsumptionCap(emptyUsage, BETA_USAGE_CAP, OperationType.VOICE_CLONE, 1);
    expect(result.allowed).toBe(true);
  });

  it('blocks when clone cap exhausted', () => {
    const usage = { ...emptyUsage, voiceClones: BETA_USAGE_CAP.voiceClones };
    const result = checkConsumptionCap(usage, BETA_USAGE_CAP, OperationType.VOICE_CLONE, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('clone');
  });
});

// ─── SECTION 4: CONSUMPTION REPOSITORY ───────────────────────────────────────

function makeRepo() {
  const db = createDatabase(':memory:');
  return new ConsumptionRepository(db);
}

const MONTH = '2026-08';
const OTHER_MONTH = '2026-07';
const CREATOR_A = 'creator-aaa';
const CREATOR_B = 'creator-bbb';

describe('ConsumptionRepository — record and getMonthlyUsage', () => {
  it('returns zero usage when no records exist', () => {
    const repo = makeRepo();
    const usage = repo.getMonthlyUsage(CREATOR_A, MONTH);
    expect(usage.imageGenerations).toBe(0);
    expect(usage.ttsCharacters).toBe(0);
    expect(usage.voiceClones).toBe(0);
    expect(usage.totalCostUsdEstimate).toBe(0);
  });

  it('records one image generation and reads it back', () => {
    const repo = makeRepo();
    repo.record({
      creatorId: CREATOR_A,
      operationType: OperationType.IMAGE_GENERATION,
      costUsdEstimate: 0.04,
      units: 1,
      monthKey: MONTH,
      recordedAt: Date.now(),
    });
    const usage = repo.getMonthlyUsage(CREATOR_A, MONTH);
    expect(usage.imageGenerations).toBe(1);
    expect(usage.totalCostUsdEstimate).toBeCloseTo(0.04);
  });

  it('accumulates multiple image records', () => {
    const repo = makeRepo();
    for (let i = 0; i < 3; i++) {
      repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    }
    const usage = repo.getMonthlyUsage(CREATOR_A, MONTH);
    expect(usage.imageGenerations).toBe(3);
    expect(usage.totalCostUsdEstimate).toBeCloseTo(0.12);
  });

  it('sums TTS characters correctly', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.TEXT_TO_SPEECH, costUsdEstimate: 0.015, units: 1000, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.TEXT_TO_SPEECH, costUsdEstimate: 0.0075, units: 500, monthKey: MONTH, recordedAt: Date.now() });
    const usage = repo.getMonthlyUsage(CREATOR_A, MONTH);
    expect(usage.ttsCharacters).toBe(1500);
  });

  it('counts voice clones', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.VOICE_CLONE, costUsdEstimate: 0.3, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.VOICE_CLONE, costUsdEstimate: 0.3, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    const usage = repo.getMonthlyUsage(CREATOR_A, MONTH);
    expect(usage.voiceClones).toBe(2);
  });

  it('isolates usage by creator', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_B, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: MONTH, recordedAt: Date.now() });

    expect(repo.getMonthlyUsage(CREATOR_A, MONTH).imageGenerations).toBe(1);
    expect(repo.getMonthlyUsage(CREATOR_B, MONTH).imageGenerations).toBe(1);
  });

  it('isolates usage by month', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: OTHER_MONTH, recordedAt: Date.now() });

    expect(repo.getMonthlyUsage(CREATOR_A, MONTH).imageGenerations).toBe(1);
    expect(repo.getMonthlyUsage(CREATOR_A, OTHER_MONTH).imageGenerations).toBe(1);
  });

  it('totalCostUsdEstimate sums across all operation types', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.TEXT_TO_SPEECH, costUsdEstimate: 0.015, units: 1000, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.VOICE_CLONE, costUsdEstimate: 0.30, units: 1, monthKey: MONTH, recordedAt: Date.now() });

    const usage = repo.getMonthlyUsage(CREATOR_A, MONTH);
    expect(usage.totalCostUsdEstimate).toBeCloseTo(0.355);
  });
});

describe('ConsumptionRepository — getAllCreatorsUsage', () => {
  it('returns empty array when no records exist', () => {
    const repo = makeRepo();
    expect(repo.getAllCreatorsUsage(MONTH)).toHaveLength(0);
  });

  it('returns one row per creator', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_B, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.08, units: 1, monthKey: MONTH, recordedAt: Date.now() });

    const all = repo.getAllCreatorsUsage(MONTH);
    expect(all).toHaveLength(2);
    const ids = all.map((r) => r.creatorId);
    expect(ids).toContain(CREATOR_A);
    expect(ids).toContain(CREATOR_B);
  });

  it('sorts by total cost descending', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: MONTH, recordedAt: Date.now() });
    repo.record({ creatorId: CREATOR_B, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.08, units: 1, monthKey: MONTH, recordedAt: Date.now() });

    const all = repo.getAllCreatorsUsage(MONTH);
    expect(all[0].creatorId).toBe(CREATOR_B);
    expect(all[1].creatorId).toBe(CREATOR_A);
  });

  it('does not include records from other months', () => {
    const repo = makeRepo();
    repo.record({ creatorId: CREATOR_A, operationType: OperationType.IMAGE_GENERATION, costUsdEstimate: 0.04, units: 1, monthKey: OTHER_MONTH, recordedAt: Date.now() });

    expect(repo.getAllCreatorsUsage(MONTH)).toHaveLength(0);
  });
});
