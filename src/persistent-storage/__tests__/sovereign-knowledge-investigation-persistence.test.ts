/**
 * SOVEREIGN KNOWLEDGE INVESTIGATION PERSISTENCE — Final Launch Foundation
 *
 * Test suite for the Knowledge Investigation persistence layer.
 *
 * Tests cover:
 *   1.  KnowledgeInvestigationRecord structure (no network)
 *   2.  IKnowledgeInvestigationStore interface compliance (no network)
 *   3.  KnowledgeInvestigationRepository — save and retrieve (no network, :memory:)
 *   4.  KnowledgeInvestigationRepository — tenant isolation (no network, :memory:)
 *   5.  KnowledgeInvestigationRepository — list and latest operations (no network, :memory:)
 *   6.  Schema — knowledge_investigations table exists (no network, :memory:)
 *   7.  SOEL — conductKnowledgeInvestigation persists investigation (no network, :memory:)
 *   8.  SOEL — listKnowledgeInvestigations returns ordered history (no network, :memory:)
 *   9.  SOEL — getLatestKnowledgeInvestigation (no network, :memory:)
 *  10.  Constitutional secrecy — persisted records never contain provider names (no network)
 *
 * All sections use :memory: databases for isolation.
 * The conductKnowledgeInvestigation path in Sections 7-9 produces zero records
 * (no observations → OBSERVABLE_INTERNALLY → empty batch) but the investigation
 * is saved as a valid constitutional fact. An empty investigation is honest.
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { GoalRepository } from '../goal-repository';
import { FulfillmentAssessmentRepository } from '../fulfillment-assessment-repository';
import { KnowledgeInvestigationRepository } from '../knowledge-investigation-repository';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import { GoalStatus, GoalPriority } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalContract, SuccessCriterion } from '../../chambers/makman-al-ghayah/goal-contracts';
import { assessGoalFulfillment } from '../../chambers/makman-al-ghayah/fulfillment-assessment-engine';
import { SovereignOperationalEntryLayer } from '../../sovereign-entry/soel';
import type { MakmanGoalDistributionBridge } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary } from '../../chambers/makman-al-ghayah/consumption-boundary';
import type { PrePublishingBoundary } from '../../chambers/ras-al-amr/pre-publishing-boundary';
import type {
  IKnowledgeInvestigationStore,
  KnowledgeInvestigationRecord,
} from '../../chambers/hujjah-al-damighah/knowledge-investigation-store-contracts';
import type { KnowledgeExportRecord } from '../../chambers/hujjah-al-damighah/knowledge-export-contracts';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CRITERION_A: SuccessCriterion = {
  criterionId: 'crit-1',
  description: 'Demonstrate measurable creative output across published channels.',
  definedAtMs: 1_000,
};

function makeGoal(overrides: Partial<GoalContract> = {}): GoalContract {
  return {
    goalId: 'goal-persist-001',
    subscriberTenantId: 'creator-persist-001',
    title: 'Persistence Test Goal',
    description: 'Used to validate Knowledge Investigation persistence.',
    priority: GoalPriority.HIGH,
    status: GoalStatus.CREATED,
    dependencies: [],
    metrics: [],
    sovereignPurposeStatement: 'Build and measure a portfolio of sovereign creative works.',
    successCriteria: [CRITERION_A],
    createdAtMs: 1_000,
    updatedAtMs: 1_000,
    ...overrides,
  };
}

function makeExportRecord(overrides: Partial<KnowledgeExportRecord> = {}): KnowledgeExportRecord {
  return {
    exportId: `export-${crypto.randomUUID()}`,
    destination: 'MAKMAN_AL_GHAYAH',
    exportedAtMs: Date.now(),
    response: {
      responseId: `resp-${crypto.randomUUID()}`,
      declarationId: `decl-${crypto.randomUUID()}`,
      claim: 'What evidence demonstrates measurable creative output?',
      domain: 'fulfillment',
      declarationText:
        'Available evidence is insufficient to draw a definitive conclusion regarding creative output.',
      confidenceScore: 20,
      confidenceLevel: 'INSUFFICIENT',
      verdictId: 'rejected',
      isDefinitive: false,
      uncertaintyPresent: true,
      origin: 'SOVEREIGN',
      sovereignLineage: {
        requestId: 'req-001',
        goalId: 'goal-persist-001',
        assessmentId: 'asmt-001',
        criterionId: 'crit-1',
        criterionDescriptionSnapshot: CRITERION_A.description,
        gapClass: 'FULFILLMENT_GAP',
        gapCategory: 'FULFILLMENT_ABSENT',
        availability: 'REQUIRES_INVESTIGATION',
        requestedAtMs: 1_000,
      },
      formulatedAtMs: Date.now(),
    },
    ...overrides,
  };
}

function makeInvestigationRecord(
  overrides: Partial<KnowledgeInvestigationRecord> = {},
): KnowledgeInvestigationRecord {
  const records = [makeExportRecord()];
  return {
    investigationId: `inv-${crypto.randomUUID()}`,
    goalId: 'goal-persist-001',
    creatorId: 'creator-persist-001',
    records,
    recordCount: records.length,
    investigatedAtMs: Date.now(),
    ...overrides,
  };
}

/**
 * Constructs a local SOEL backed by a :memory: DB.
 * Registers the given goal and pre-saves an assessment so the
 * conductKnowledgeInvestigation chain can reach its conclusion
 * (goal found → latest assessment found → gap derived → requests built
 *  → empty batch (OBSERVABLE_INTERNALLY) → investigation saved with 0 records).
 */
function makeTestSoel(
  db: DatabaseSync,
  goal: GoalContract = makeGoal(),
): { soel: SovereignOperationalEntryLayer; investigationRepo: KnowledgeInvestigationRepository } {
  const goalRepo = new GoalRepository(db);
  const goalState = new GoalState(goalRepo);
  goalState.register(goal);

  const assessRepo = new FulfillmentAssessmentRepository(db);
  // Pre-save an assessment so requestGapReport() has something to work from.
  // No observations → ASSESSMENT_NOT_POSSIBLE → EVIDENCE_AVAILABILITY →
  // OBSERVABLE_INTERNALLY → empty requests batch → no HTTP, returns [].
  const assessment = assessGoalFulfillment(goal, []);
  assessRepo.save(assessment, goal.subscriberTenantId);

  const investigationRepo = new KnowledgeInvestigationRepository(db);

  const testSoel = new SovereignOperationalEntryLayer(
    goalState,
    {} as unknown as MakmanGoalDistributionBridge,
    {} as unknown as PublicConsumptionBoundary,
    {} as unknown as PrePublishingBoundary,
    undefined,
    undefined,
    assessRepo,
    investigationRepo,
  );

  return { soel: testSoel, investigationRepo };
}

// ─── SECTION 1: RECORD STRUCTURE (NO NETWORK) ────────────────────────────────

describe('KnowledgeInvestigationRecord — structure', () => {
  it('has investigationId as a non-empty string', () => {
    const record = makeInvestigationRecord();
    expect(typeof record.investigationId).toBe('string');
    expect(record.investigationId.length).toBeGreaterThan(0);
  });

  it('has goalId field', () => {
    const record = makeInvestigationRecord();
    expect(typeof record.goalId).toBe('string');
  });

  it('has creatorId field', () => {
    const record = makeInvestigationRecord();
    expect(typeof record.creatorId).toBe('string');
  });

  it('has records as an array', () => {
    const record = makeInvestigationRecord();
    expect(Array.isArray(record.records)).toBe(true);
  });

  it('recordCount matches records.length', () => {
    const records = [makeExportRecord(), makeExportRecord()];
    const inv = makeInvestigationRecord({ records, recordCount: records.length });
    expect(inv.recordCount).toBe(inv.records.length);
  });

  it('has investigatedAtMs as a positive number', () => {
    const record = makeInvestigationRecord();
    expect(typeof record.investigatedAtMs).toBe('number');
    expect(record.investigatedAtMs).toBeGreaterThan(0);
  });

  it('accepts empty records — an empty investigation is a valid constitutional fact', () => {
    const inv = makeInvestigationRecord({ records: [], recordCount: 0 });
    expect(inv.records.length).toBe(0);
    expect(inv.recordCount).toBe(0);
  });

  it('SovereignKnowledgeResponse carries no provider field', () => {
    const record = makeExportRecord();
    const keys = Object.keys(record.response);
    expect(keys).not.toContain('provider');
    expect(keys).not.toContain('sourceProvider');
  });
});

// ─── SECTION 2: INTERFACE COMPLIANCE (NO NETWORK) ────────────────────────────

describe('KnowledgeInvestigationRepository — IKnowledgeInvestigationStore compliance', () => {
  it('implements save method', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    expect(typeof repo.save).toBe('function');
  });

  it('implements listForGoal method', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    expect(typeof repo.listForGoal).toBe('function');
  });

  it('implements findLatestForGoal method', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    expect(typeof repo.findLatestForGoal).toBe('function');
  });

  it('satisfies IKnowledgeInvestigationStore type', () => {
    const typed: IKnowledgeInvestigationStore =
      new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    expect(typed).toBeDefined();
  });
});

// ─── SECTION 3: SAVE AND RETRIEVE (NO NETWORK, :memory:) ─────────────────────

describe('KnowledgeInvestigationRepository — save and retrieve', () => {
  it('saved record is retrievable by findLatestForGoal', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const inv = makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-A' });
    repo.save(inv);

    const found = repo.findLatestForGoal('goal-A', 'creator-A');
    expect(found).not.toBeNull();
    expect(found!.investigationId).toBe(inv.investigationId);
  });

  it('round-trips goalId', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const inv = makeInvestigationRecord({ goalId: 'goal-roundtrip', creatorId: 'creator-A' });
    repo.save(inv);
    expect(repo.findLatestForGoal('goal-roundtrip', 'creator-A')!.goalId).toBe('goal-roundtrip');
  });

  it('round-trips creatorId', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const inv = makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-roundtrip' });
    repo.save(inv);
    expect(repo.findLatestForGoal('goal-A', 'creator-roundtrip')!.creatorId).toBe('creator-roundtrip');
  });

  it('round-trips recordCount', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const records = [makeExportRecord(), makeExportRecord()];
    const inv = makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-A', records, recordCount: 2 });
    repo.save(inv);
    expect(repo.findLatestForGoal('goal-A', 'creator-A')!.recordCount).toBe(2);
  });

  it('round-trips records array length', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const records = [makeExportRecord(), makeExportRecord(), makeExportRecord()];
    const inv = makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-A', records, recordCount: 3 });
    repo.save(inv);
    expect(repo.findLatestForGoal('goal-A', 'creator-A')!.records.length).toBe(3);
  });

  it('round-trips investigatedAtMs', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const atMs = 1700000000123;
    const inv = makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-A', investigatedAtMs: atMs });
    repo.save(inv);
    expect(repo.findLatestForGoal('goal-A', 'creator-A')!.investigatedAtMs).toBe(atMs);
  });

  it('empty records array round-trips correctly', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const inv = makeInvestigationRecord({
      goalId: 'goal-A', creatorId: 'creator-A', records: [], recordCount: 0,
    });
    repo.save(inv);
    const found = repo.findLatestForGoal('goal-A', 'creator-A');
    expect(found!.recordCount).toBe(0);
    expect(found!.records).toEqual([]);
  });

  it('findLatestForGoal returns null when no investigation exists', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    expect(repo.findLatestForGoal('nonexistent', 'creator-A')).toBeNull();
  });

  it('listForGoal returns empty array when no investigation exists', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    expect(repo.listForGoal('nonexistent', 'creator-A')).toEqual([]);
  });

  it('round-trips SovereignKnowledgeResponse declarationText', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    const inv = makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-A' });
    repo.save(inv);
    const found = repo.findLatestForGoal('goal-A', 'creator-A');
    expect(found!.records[0].response.declarationText).toBe(
      inv.records[0].response.declarationText,
    );
  });
});

// ─── SECTION 4: TENANT ISOLATION (NO NETWORK, :memory:) ──────────────────────

describe('KnowledgeInvestigationRepository — tenant isolation', () => {
  it('findLatestForGoal returns null for wrong creatorId', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-A' }));
    expect(repo.findLatestForGoal('goal-A', 'creator-B')).toBeNull();
  });

  it('listForGoal returns empty for wrong creatorId', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'creator-A' }));
    expect(repo.listForGoal('goal-A', 'creator-B')).toEqual([]);
  });

  it('two creators with the same goalId do not share investigations', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ goalId: 'shared', creatorId: 'creator-A', records: [makeExportRecord()], recordCount: 1 }));
    repo.save(makeInvestigationRecord({ goalId: 'shared', creatorId: 'creator-B', records: [], recordCount: 0 }));

    expect(repo.findLatestForGoal('shared', 'creator-A')!.recordCount).toBe(1);
    expect(repo.findLatestForGoal('shared', 'creator-B')!.recordCount).toBe(0);
  });
});

// ─── SECTION 5: LIST AND LATEST (NO NETWORK, :memory:) ───────────────────────

describe('KnowledgeInvestigationRepository — list and latest', () => {
  it('listForGoal returns all saved investigations', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'c', investigatedAtMs: 1000 }));
    repo.save(makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'c', investigatedAtMs: 2000 }));
    expect(repo.listForGoal('goal-A', 'c').length).toBe(2);
  });

  it('listForGoal returns most recent first', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ goalId: 'g', creatorId: 'c', investigatedAtMs: 1000 }));
    repo.save(makeInvestigationRecord({ goalId: 'g', creatorId: 'c', investigatedAtMs: 3000 }));
    repo.save(makeInvestigationRecord({ goalId: 'g', creatorId: 'c', investigatedAtMs: 2000 }));
    const list = repo.listForGoal('g', 'c');
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].investigatedAtMs).toBeGreaterThanOrEqual(list[i].investigatedAtMs);
    }
  });

  it('findLatestForGoal returns the most recent', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ goalId: 'g', creatorId: 'c', investigatedAtMs: 1000 }));
    repo.save(makeInvestigationRecord({ goalId: 'g', creatorId: 'c', investigatedAtMs: 5000 }));
    repo.save(makeInvestigationRecord({ goalId: 'g', creatorId: 'c', investigatedAtMs: 2000 }));
    expect(repo.findLatestForGoal('g', 'c')!.investigatedAtMs).toBe(5000);
  });

  it('goals do not leak into each other\'s lists', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ goalId: 'goal-A', creatorId: 'c' }));
    repo.save(makeInvestigationRecord({ goalId: 'goal-B', creatorId: 'c' }));
    expect(repo.listForGoal('goal-A', 'c').length).toBe(1);
    expect(repo.listForGoal('goal-B', 'c').length).toBe(1);
    expect(repo.listForGoal('goal-A', 'c')[0].goalId).toBe('goal-A');
  });
});

// ─── SECTION 6: SCHEMA (NO NETWORK, :memory:) ────────────────────────────────

describe('Schema — knowledge_investigations table', () => {
  it('table exists after createDatabase()', () => {
    const db = createDatabase(':memory:');
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knowledge_investigations'")
      .all() as { name: string }[];
    expect(tables.length).toBe(1);
  });

  it('has investigation_id column', () => {
    const db = createDatabase(':memory:');
    const cols = db.prepare('PRAGMA table_info(knowledge_investigations)').all() as { name: string }[];
    expect(cols.some((c) => c.name === 'investigation_id')).toBe(true);
  });

  it('has goal_id column', () => {
    const db = createDatabase(':memory:');
    const cols = db.prepare('PRAGMA table_info(knowledge_investigations)').all() as { name: string }[];
    expect(cols.some((c) => c.name === 'goal_id')).toBe(true);
  });

  it('has creator_id column', () => {
    const db = createDatabase(':memory:');
    const cols = db.prepare('PRAGMA table_info(knowledge_investigations)').all() as { name: string }[];
    expect(cols.some((c) => c.name === 'creator_id')).toBe(true);
  });

  it('has record_count column', () => {
    const db = createDatabase(':memory:');
    const cols = db.prepare('PRAGMA table_info(knowledge_investigations)').all() as { name: string }[];
    expect(cols.some((c) => c.name === 'record_count')).toBe(true);
  });

  it('has records_json column', () => {
    const db = createDatabase(':memory:');
    const cols = db.prepare('PRAGMA table_info(knowledge_investigations)').all() as { name: string }[];
    expect(cols.some((c) => c.name === 'records_json')).toBe(true);
  });

  it('has investigated_at_ms column', () => {
    const db = createDatabase(':memory:');
    const cols = db.prepare('PRAGMA table_info(knowledge_investigations)').all() as { name: string }[];
    expect(cols.some((c) => c.name === 'investigated_at_ms')).toBe(true);
  });
});

// ─── SECTION 7: SOEL PERSISTENCE (NO NETWORK, :memory:) ──────────────────────
//
// conductKnowledgeInvestigation with no observations → OBSERVABLE_INTERNALLY
// → empty batch → no HTTP → conductSovereignKnowledgeInvestigation returns [].
// The investigation is still saved (recordCount=0) — an honest constitutional fact.

describe('SOEL — conductKnowledgeInvestigation persists investigation record', () => {
  it('conductKnowledgeInvestigation returns ok:true', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    const outcome = await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    expect(outcome.ok).toBe(true);
  });

  it('listKnowledgeInvestigations returns one record after conducting', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    expect(list.length).toBe(1);
  });

  it('persisted record has correct goalId', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    expect(list[0].goalId).toBe('goal-persist-001');
  });

  it('persisted record has correct creatorId', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    expect(list[0].creatorId).toBe('creator-persist-001');
  });

  it('persisted record recordCount matches records.length', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    expect(list[0].recordCount).toBe(list[0].records.length);
  });

  it('persisted record has investigatedAtMs within the test window', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    const before = Date.now();
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const after = Date.now();
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    expect(list[0].investigatedAtMs).toBeGreaterThanOrEqual(before);
    expect(list[0].investigatedAtMs).toBeLessThanOrEqual(after);
  });

  it('each conductKnowledgeInvestigation call appends a new record', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    expect(list.length).toBe(2);
  });

  it('conductKnowledgeInvestigation returns ok:false GOAL_NOT_FOUND for nonexistent goal', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    const outcome = await soel.conductKnowledgeInvestigation('nonexistent', 'creator-persist-001');
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('listKnowledgeInvestigations returns empty for wrong creator', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    expect(soel.listKnowledgeInvestigations('goal-persist-001', 'wrong-creator')).toEqual([]);
  });

  it('SOEL without investigationStore wired still returns ok:true (backward compat)', async () => {
    const db = createDatabase(':memory:');
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    const goal = makeGoal();
    goalState.register(goal);
    const assessRepo = new FulfillmentAssessmentRepository(db);
    assessRepo.save(assessGoalFulfillment(goal, []), goal.subscriberTenantId);

    const unwiresoel = new SovereignOperationalEntryLayer(
      goalState,
      {} as unknown as MakmanGoalDistributionBridge,
      {} as unknown as PublicConsumptionBoundary,
      {} as unknown as PrePublishingBoundary,
      undefined,
      undefined,
      assessRepo,
      // no investigationStore
    );

    const outcome = await unwiresoel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    expect(outcome.ok).toBe(true);
  });
});

// ─── SECTION 8: LIST HISTORY (NO NETWORK, :memory:) ──────────────────────────

describe('SOEL — listKnowledgeInvestigations returns ordered history', () => {
  it('accumulates multiple investigations in history', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    expect(list.length).toBe(3);
  });

  it('history is ordered most recent first', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].investigatedAtMs).toBeGreaterThanOrEqual(list[i].investigatedAtMs);
    }
  });

  it('each investigation has a unique investigationId', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const list = soel.listKnowledgeInvestigations('goal-persist-001', 'creator-persist-001');
    const ids = list.map((r) => r.investigationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('listKnowledgeInvestigations returns empty for nonexistent goal', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    expect(soel.listKnowledgeInvestigations('nonexistent', 'creator-persist-001')).toEqual([]);
  });
});

// ─── SECTION 9: GET LATEST (NO NETWORK, :memory:) ────────────────────────────

describe('SOEL — getLatestKnowledgeInvestigation', () => {
  it('returns null before any investigation', () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    expect(soel.getLatestKnowledgeInvestigation('goal-persist-001', 'creator-persist-001')).toBeNull();
  });

  it('returns non-null after one investigation', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    expect(soel.getLatestKnowledgeInvestigation('goal-persist-001', 'creator-persist-001')).not.toBeNull();
  });

  it('latest has correct goalId', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const latest = soel.getLatestKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    expect(latest!.goalId).toBe('goal-persist-001');
  });

  it('latest has correct creatorId', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    const latest = soel.getLatestKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    expect(latest!.creatorId).toBe('creator-persist-001');
  });

  it('returns null for nonexistent goal', () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    expect(soel.getLatestKnowledgeInvestigation('nonexistent', 'creator-persist-001')).toBeNull();
  });

  it('returns null for wrong creator', async () => {
    const db = createDatabase(':memory:');
    const { soel } = makeTestSoel(db);
    await soel.conductKnowledgeInvestigation('goal-persist-001', 'creator-persist-001');
    expect(soel.getLatestKnowledgeInvestigation('goal-persist-001', 'wrong-creator')).toBeNull();
  });
});

// ─── SECTION 10: CONSTITUTIONAL SECRECY (NO NETWORK) ─────────────────────────
//
// The persistence layer serializes whatever KnowledgeExportRecord[] the
// constitutional chain produced. The chain already strips all provider identity.
// These tests verify the serialization does not re-introduce provider names.

describe('Constitutional secrecy — persisted records_json never contains provider names', () => {
  it('serialized investigation does not contain "wikipedia"', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord());
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    expect(JSON.stringify(found)).not.toContain('"wikipedia"');
  });

  it('serialized investigation does not contain "gutenberg"', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord());
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    expect(JSON.stringify(found)).not.toContain('"gutenberg"');
  });

  it('serialized investigation does not contain "hacker-news"', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord());
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    expect(JSON.stringify(found)).not.toContain('"hacker-news"');
  });

  it('serialized investigation does not contain "google-trends"', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord());
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    expect(JSON.stringify(found)).not.toContain('"google-trends"');
  });

  it('serialized investigation does not contain "reddit"', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord());
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    expect(JSON.stringify(found)).not.toContain('"reddit"');
  });

  it('serialized investigation does not contain external URLs', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord());
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    expect(JSON.stringify(found)).not.toMatch(/https?:\/\//);
  });

  it('persisted response carries declarationText — the sovereign conclusion, not raw provider output', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord());
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    expect(found!.records[0].response.declarationText.length).toBeGreaterThan(0);
  });

  it('empty investigation list does not contain provider names either', () => {
    const repo = new KnowledgeInvestigationRepository(createDatabase(':memory:'));
    repo.save(makeInvestigationRecord({ records: [], recordCount: 0 }));
    const found = repo.findLatestForGoal('goal-persist-001', 'creator-persist-001');
    const json = JSON.stringify(found);
    expect(json).not.toContain('"wikipedia"');
    expect(json).not.toContain('"gutenberg"');
    expect(json).not.toContain('"hacker-news"');
  });
});
