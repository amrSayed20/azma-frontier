/**
 * One board, one film.
 *
 * MEASURED 2026-09-25: a storyboard production commissions pictures from
 * القيامة and the provider charges credits for each one. The reuse guard
 * covered a production still running and nothing else, so a board that had
 * already produced a film would produce another — paying again for the same
 * pictures and handing back a second copy of the same work.
 */

const rows: Record<string, { operation_id: string; subscriber_tenant_id: string; current_state: string; source_intent_json: string }> = {};
let lastQuery = '';

const mockPrepare = jest.fn((sql: string) => ({
  get: (...args: unknown[]) => {
    lastQuery = sql;
    if (sql.includes('FROM operation_ledger WHERE operation_id = ?')) {
      return rows[String(args[0])];
    }
    if (sql.includes('ORDER BY created_at DESC LIMIT 1')) {
      return Object.values(rows)[0] ? { operation_id: Object.values(rows)[0].operation_id } : undefined;
    }
    return undefined;
  },
  run: () => undefined,
  all: () => [],
}));

jest.mock('../../persistent-storage', () => ({
  getDb: () => ({ prepare: mockPrepare }),
}));

const mockCreateEntry = jest.fn(async () => undefined);
const mockUpdateState = jest.fn(async () => undefined);
jest.mock('../../orchestrator/fleet-materialization/ledger/operation-ledger-manager', () => ({
  OperationLedgerManager: jest.fn().mockImplementation(() => ({
    createEntry: mockCreateEntry,
    updateState: mockUpdateState,
  })),
}));

import { acceptStoryboardProduction, classifyStoryboardFailure } from '../storyboard-operation-lifecycle';

const CREATOR = 'creator-1';
const BOARD = 'sb_one';

function seed(state: string): void {
  for (const k of Object.keys(rows)) delete rows[k];
  rows['op-1'] = {
    operation_id: 'op-1',
    subscriber_tenant_id: CREATOR,
    current_state: state,
    source_intent_json: JSON.stringify({ storyboardId: BOARD }),
  };
}

describe('one board, one film', () => {
  beforeEach(() => {
    mockCreateEntry.mockClear();
    lastQuery = '';
  });

  it('hands back the film a finished board already produced, and pays nothing again', async () => {
    seed('DEPOSITED');
    const accepted = await acceptStoryboardProduction({
      creatorId: CREATOR, storyboardId: BOARD, sceneCount: 5, run: async () => { throw new Error('must not run'); },
    });
    expect(accepted.reused).toBe(true);
    expect(accepted.operationId).toBe('op-1');
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it('hands back a production still running rather than starting a second', async () => {
    seed('MATERIALIZING');
    const accepted = await acceptStoryboardProduction({
      creatorId: CREATOR, storyboardId: BOARD, sceneCount: 5, run: async () => { throw new Error('must not run'); },
    });
    expect(accepted.reused).toBe(true);
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it('lets a board whose production failed be attempted again', async () => {
    seed('FAILED');
    const accepted = await acceptStoryboardProduction({
      creatorId: CREATOR, storyboardId: BOARD, sceneCount: 5,
      run: async () => ({ assetId: 'a', assetUrl: '/u/a.mp4' }),
    });
    expect(accepted.reused).toBe(false);
    expect(mockCreateEntry).toHaveBeenCalledTimes(1);
  });

  it('never probes another Creator\'s board', async () => {
    seed('DEPOSITED');
    rows['op-1'].subscriber_tenant_id = 'someone-else';
    const accepted = await acceptStoryboardProduction({
      creatorId: CREATOR, storyboardId: BOARD, sceneCount: 5,
      run: async () => ({ assetId: 'a', assetUrl: '/u/a.mp4' }),
    });
    // Not theirs reads as not found, so a fresh operation is theirs alone.
    expect(accepted.reused).toBe(false);
    expect(lastQuery).toContain('operation_ledger');
  });
});

describe('a success we cannot carry is not a failure to produce', () => {
  it('names an oversized film as itself', () => {
    expect(classifyStoryboardFailure('output is 82314643 bytes, above the 52428800-byte ceiling'))
      .toBe('TOO_LARGE_TO_CARRY');
  });

  it('still recognises a workshop that never answered', () => {
    expect(classifyStoryboardFailure('fetch failed')).toBe('WORKSHOP_UNREACHABLE');
  });
});
