/**
 * AZMA OS — BLOCKER A: A RENDER FAILURE THAT SURVIVES THE PROCESS THAT SAW IT
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   On production, 2026-10-18: of 71 recorded operations, 43 had failed, and
 *   33 of those carried no reason at all. The reason was being kept in a
 *   module-level Map inside the encoder, so a status poll served by a different
 *   module instance found nothing — and an EMPTY message fell through the old
 *   classifier's catch-all to «an error processing one of the files», which
 *   sends a Creator to replace an asset that was never the problem.
 *
 *   Reproduced by hand the same day: a host with no ffmpeg failed a render for
 *   `renderer-unavailable` and the chamber displayed the generic sentence.
 *
 * These tests use a real file-backed SQLite database, opened the way a restart
 * opens one, because "survives a reload" is the whole claim.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SCHEMA_STATEMENTS } from '../../persistent-storage/schema';
import { OperationLedgerManager } from '../../orchestrator/fleet-materialization/ledger/operation-ledger-manager';
import { OperationState } from '../../orchestrator/fleet-materialization/ledger/operation-ledger-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import { classifyRenderFailure, renderFailureMessageAr } from '../ras-al-amr-render';

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'azma-renderfail-'));
  file = join(dir, 'ledger.db');
});
afterEach(() => {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* reclaimed */ }
});

/** A real database on disk. Each call is a fresh connection, as a reload is. */
function open(): DatabaseSync {
  const db = new DatabaseSync(file);
  for (const s of SCHEMA_STATEMENTS) db.exec(s);
  return db;
}

async function seedOperation(db: DatabaseSync, operationId: string): Promise<OperationLedgerManager> {
  const ledger = new OperationLedgerManager(db);
  await ledger.createEntry({
    operationId,
    subscriberTenantId: 'tenant-a',
    capabilityTarget: CapabilityTarget.MOTION,
    projectContainerId: 'canvas-a',
    contextReferences: [],
  } as never);
  return ledger;
}

describe('BLOCKER A — the failure code', () => {
  it('names the engine when the engine is the thing that is missing', () => {
    // The exact text the encoder produces when spawn fails.
    expect(classifyRenderFailure('FFmpeg spawn failed — ensure ffmpeg is installed. Error: spawn ffmpeg ENOENT'))
      .toBe('renderer-unavailable');
  });

  it('names the asset when an asset is gone', () => {
    expect(classifyRenderFailure('CINEMATIC encoder: asset for node [n1] not found at [/x/y.png].'))
      .toBe('asset-file-missing');
  });

  it('keeps a provider refusal distinct from an internal exception', () => {
    expect(classifyRenderFailure('REFUSED_BY_WORKSHOP')).toBe('provider-refused');
    expect(classifyRenderFailure('Cannot read properties of undefined')).toBe('unknown');
  });

  it('names the storage boundary rather than blaming a file', () => {
    expect(classifyRenderFailure('UPLOADS_DIR is not configured, so a finished film has nowhere private'))
      .toBe('render-storage-not-configured');
  });

  it('reports an absent reason as unknown instead of inventing one', () => {
    // §2.8. The old classifier turned '' into a file-processing error.
    expect(classifyRenderFailure('')).toBe('unknown');
    expect(classifyRenderFailure('   ')).toBe('unknown');
  });

  it('gives every code a Creator sentence that names an action, never a path', () => {
    const codes = [
      'no-visual-scenes', 'asset-file-missing', 'media-unsupported', 'renderer-unavailable',
      'render-storage-not-configured', 'provider-refused', 'render-config-invalid',
      'forbidden', 'interrupted', 'unknown',
    ] as const;
    for (const c of codes) {
      const m = renderFailureMessageAr(c);
      expect(m.length).toBeGreaterThan(10);
      // No server path, no variable name, no stack frame reaches a Creator.
      expect(m).not.toMatch(/UPLOADS_DIR|ffmpeg|FFmpeg|\/var\/|C:\\|at Object|Error:/);
    }
  });
});

describe('BLOCKER A — the reason outlives the process', () => {
  it('is readable from a connection that never saw the failure', async () => {
    const op = 'op_rasamr_survives_1';
    const writer = await seedOperation(open(), op);
    await writer.recordFailureDiagnostic(op, { code: 'renderer-unavailable', detail: 'spawn ffmpeg ENOENT' });

    // A different connection — which is what a module reload or a second
    // server instance actually is.
    const reader = new OperationLedgerManager(open());
    expect(reader.readFailureDiagnostic(op)?.code).toBe('renderer-unavailable');
  });

  it('keeps the reason closest to the failure when a later one is vaguer', async () => {
    const op = 'op_rasamr_survives_2';
    const ledger = await seedOperation(open(), op);
    await ledger.recordFailureDiagnostic(op, { code: 'renderer-unavailable' });
    await ledger.recordFailureDiagnostic(op, { code: 'unknown' });
    expect(ledger.readFailureDiagnostic(op)?.code).toBe('renderer-unavailable');
  });

  it('returns null for an operation that never failed, so success cannot inherit a message', async () => {
    const op = 'op_rasamr_survives_3';
    const ledger = await seedOperation(open(), op);
    expect(ledger.readFailureDiagnostic(op)).toBeNull();
  });

  it('adds no column and no table — the reason rides in the intent the row already holds', async () => {
    const op = 'op_rasamr_survives_4';
    const db = open();
    const before = (db.prepare("SELECT name FROM pragma_table_info('operation_ledger')").all() as { name: string }[])
      .map((r) => r.name).sort();
    const ledger = await seedOperation(db, op);
    await ledger.recordFailureDiagnostic(op, { code: 'media-unsupported', detail: 'matches no streams' });
    const after = (db.prepare("SELECT name FROM pragma_table_info('operation_ledger')").all() as { name: string }[])
      .map((r) => r.name).sort();
    expect(after).toEqual(before);
  });

  it('records the reason on a row already sealed in a terminal state', async () => {
    // updateState refuses to touch a terminal row, and the failure is only
    // known once the row is terminal. A reason that could only be written
    // before the seal would never be written at all.
    const op = 'op_rasamr_survives_5';
    const db = open();
    const ledger = await seedOperation(db, op);
    await ledger.updateState(op, OperationState.FAILED);
    await ledger.recordFailureDiagnostic(op, { code: 'provider-refused', detail: 'REFUSED_BY_ENGINE' });
    expect(ledger.readFailureDiagnostic(op)?.code).toBe('provider-refused');
    expect((await ledger.getEntry(op)).currentState).toBe(OperationState.FAILED);
  });

  it('leaves the operation and its owner exactly as they were', async () => {
    const op = 'op_rasamr_survives_6';
    const db = open();
    const ledger = await seedOperation(db, op);
    const before = await ledger.getEntry(op);
    await ledger.recordFailureDiagnostic(op, { code: 'interrupted' });
    const after = await ledger.getEntry(op);
    expect(after.subscriberTenantId).toBe(before.subscriberTenantId);
    expect(after.capabilityTarget).toBe(before.capabilityTarget);
    expect(after.createdAt).toBe(before.createdAt);
  });
});
describe('BLOCKER D §5.6 — the film keeps the identity it was made under', () => {
  it('a diagnostic write leaves compilation, profile, creator and operation untouched', async () => {
    // This file added a WRITER to source_intent_json, which is also where a
    // render's compilationId and chosen profile live. A diagnostic that
    // disturbed either would let a landscape film pass for a portrait one.
    const op = 'op_rasamr_identity_1';
    const db = open();
    const ledger = new OperationLedgerManager(db);
    await ledger.createEntry({
      operationId: op,
      subscriberTenantId: 'tenant-identity',
      capabilityTarget: CapabilityTarget.MOTION,
      projectContainerId: 'canvas-identity',
      contextReferences: [],
      structuralGraphPayload: {
        compilationId: 'comp-identity-1',
        metadata: { outputProfile: 'portrait', exportQuality: 'maximum' },
      },
    } as never);

    await ledger.recordFailureDiagnostic(op, { code: 'media-unsupported', detail: 'matches no streams' });

    const intent = (await ledger.getEntry(op)).sourceIntent as unknown as {
      operationId: string;
      subscriberTenantId: string;
      structuralGraphPayload: { compilationId: string; metadata: { outputProfile: string; exportQuality: string } };
    };
    expect(intent.operationId).toBe(op);
    expect(intent.subscriberTenantId).toBe('tenant-identity');
    expect(intent.structuralGraphPayload.compilationId).toBe('comp-identity-1');
    expect(intent.structuralGraphPayload.metadata.outputProfile).toBe('portrait');
    expect(intent.structuralGraphPayload.metadata.exportQuality).toBe('maximum');
  });
});

