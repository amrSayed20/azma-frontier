/**
 * AZMA OS — D-4 · THE TRUTHFUL OPERATION HISTORY, 2026-10-11.
 *
 * The rule under guard: an asset existing is not an operation having
 * succeeded, and provenance that cannot name an act must say so rather than
 * be guessed at. Nothing here writes, migrates or backfills.
 */

import {
  classifyAssetOperation, classifyOutcome, toHistoryView, historyGaps,
  type OperationHistoryEntry,
} from '../operation-history';

/** A vault row, shaped as the repository hands it out. */
const row = (o: {
  derivation?: string | null; chamber?: string | null;
  capability?: string; mutation?: string | null; provider?: string | null;
}) => ({
  derivation: (o.derivation ?? null) as never,
  creationChamber: (o.chamber ?? null) as never,
  capabilityTarget: (o.capability ?? 'VISUAL') as never,
  metadata: {
    ...(o.mutation ? { mutationProviderId: o.mutation } : {}),
    ...(o.provider ? { providerId: o.provider } : {}),
  } as never,
});

describe('1 · all six acts are named from provenance alone', () => {
  it('image — generated, visual, this chamber', () => {
    expect(classifyAssetOperation(row({ derivation: 'GENERATED', chamber: 'QIYAMAH' })).operation)
      .toBe('image');
  });

  it('infographic — only القيامة’s own style record can tell it from an image', () => {
    const r = row({ derivation: 'GENERATED', chamber: 'QIYAMAH' });
    expect(classifyAssetOperation(r, 'infographic').operation).toBe('infographic');
    expect(classifyAssetOperation(r, 'cinematic').operation).toBe('image');
  });

  it('video — generated motion', () => {
    expect(classifyAssetOperation(row({ derivation: 'GENERATED', chamber: 'QIYAMAH', capability: 'MOTION' })).operation)
      .toBe('video');
  });

  it('edit — the provider operation names it', () => {
    expect(classifyAssetOperation(row({ derivation: 'MODIFIED', mutation: 'magic-hour-image-editor' })).operation)
      .toBe('edit');
  });

  it('upscale — the provider operation names it', () => {
    expect(classifyAssetOperation(row({ derivation: 'MODIFIED', mutation: 'magic-hour-image-upscaler' })).operation)
      .toBe('upscale');
  });

  it('animate — by its provider, and by its derivation when none was recorded', () => {
    expect(classifyAssetOperation(row({ derivation: 'ANIMATED', mutation: 'magic-hour-image-to-video' })))
      .toEqual({ operation: 'animate', evidence: 'derivation-and-provider' });
    expect(classifyAssetOperation(row({ derivation: 'ANIMATED' })))
      .toEqual({ operation: 'animate', evidence: 'derivation-only' });
  });
});

describe('2 · provenance that cannot name an act does not get one', () => {
  it('MODIFIED with no provider operation is NOT guessed', () => {
    // An edit, an upscale and مكمن الغاية's reframing all write MODIFIED.
    // Naming one of the three would be the fabrication Article 5.5 forbids.
    expect(classifyAssetOperation(row({ derivation: 'MODIFIED' })))
      .toEqual({ operation: null, evidence: 'insufficient' });
  });

  it('a row that predates the provenance columns is unnamed', () => {
    expect(classifyAssetOperation(row({})).operation).toBeNull();
  });

  it('an upload is not one of the six acts', () => {
    expect(classifyAssetOperation(row({ derivation: 'UPLOADED', chamber: 'KHAZAIN' })).operation).toBeNull();
  });

  it('another chamber’s generation is not this chamber’s act', () => {
    expect(classifyAssetOperation(row({ derivation: 'GENERATED', chamber: 'HUJJAH_AL_DAMIGHAH', capability: 'WRITING' })).operation)
      .toBeNull();
  });

  it('an unrecognised mutation provider is not mapped to the nearest act', () => {
    expect(classifyAssetOperation(row({ derivation: 'MODIFIED', mutation: 'some-future-provider' })).operation)
      .toBeNull();
  });
});

describe('3 · existence is never read as success', () => {
  it('a deposited asset nobody accepted is reported as exactly that', () => {
    expect(classifyOutcome('INTERMEDIATE')).toBe('AWAITING_ACCEPTANCE');
  });

  it('only the Creator’s acceptance reads as ACCEPTED', () => {
    expect(classifyOutcome('FINAL')).toBe('ACCEPTED');
    expect(classifyOutcome('PUBLISHED')).toBe('ACCEPTED');
  });

  it('an absent lifecycle is undetermined — not a success and not a failure', () => {
    expect(classifyOutcome(null)).toBe('UNDETERMINED');
    expect(classifyOutcome(undefined)).toBe('UNDETERMINED');
  });

  it('no outcome value means «the provider answered»', () => {
    // There is no code path from a provider response to ACCEPTED: the only
    // input is the Vault's declared lifecycle.
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/qiyamah-generation/operation-history.ts'), 'utf8');
    expect(src).not.toMatch(/finishReason|providerFileId|outcome\.ok/);
  });
});

describe('4 · the ownership boundary is at the source, not re-derived', () => {
  it('the only listing used is the tenant-scoped one', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/qiyamah-generation/operation-history.ts'), 'utf8');
    expect(src).toContain('listVaultAssetsForTenant(db, creatorId)');
    // No raw SQL, so no query can forget the tenant predicate.
    expect(src).not.toMatch(/SELECT\s|db\.prepare\(/);
  });

  it('it writes nothing — no insert, update, delete or alter anywhere', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/qiyamah-generation/operation-history.ts'), 'utf8');
    expect(src).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|CREATE TABLE|DROP)\b/i);
    expect(src).not.toMatch(/recordGeneration|insertVaultAsset|recordDistribution/);
  });
});

describe('5 · the view strips what must not cross to a browser', () => {
  const entry: OperationHistoryEntry = {
    assetId: 'asset_1', operation: 'edit', outcome: 'ACCEPTED',
    evidence: 'derivation-and-provider', atMs: 1, parentAssetId: 'asset_0',
    rootAssetId: 'asset_0', version: 2, contentDigest: 'sha256:abc',
    lifecycleState: 'FINAL', providerOperationEn: 'magic-hour-image-editor',
  };

  it('no provider name and no digest reach the view', () => {
    const [v] = toHistoryView([entry]);
    expect(JSON.stringify(v)).not.toContain('magic-hour');
    expect(JSON.stringify(v)).not.toContain('sha256');
  });

  it('lineage a Creator can act on does reach it', () => {
    const [v] = toHistoryView([entry])!;
    expect(v!.parentAssetId).toBe('asset_0');
    expect(v!.version).toBe(2);
  });

  it('an unnamed act is said in Arabic, not left blank', () => {
    const [v] = toHistoryView([{ ...entry, operation: null }]);
    expect(v!.operationAr.length).toBeGreaterThan(0);
    expect(v!.operationAr).toMatch(/[؀-ۿ]/);
  });

  it('every outcome has its own Arabic sentence, and they differ', () => {
    const said = (['ACCEPTED', 'AWAITING_ACCEPTANCE', 'UNDETERMINED'] as const)
      .map((o) => toHistoryView([{ ...entry, outcome: o }])[0]!.outcomeAr);
    expect(new Set(said).size).toBe(3);
  });
});

describe('6 · gaps are counted, never concealed', () => {
  const entries = [
    { operation: 'image', outcome: 'ACCEPTED' },
    { operation: 'edit', outcome: 'AWAITING_ACCEPTANCE' },
    { operation: null, outcome: 'UNDETERMINED' },
    { operation: null, outcome: 'UNDETERMINED' },
  ].map((p) => ({ ...p, assetId: 'a', evidence: 'insufficient', atMs: 0,
    parentAssetId: null, rootAssetId: null, version: null, contentDigest: null,
    lifecycleState: null, providerOperationEn: null })) as unknown as readonly OperationHistoryEntry[];

  it('an unnamed act is counted as unnamed, not absorbed into a neighbour', () => {
    const g = historyGaps(entries);
    expect(g.total).toBe(4);
    expect(g.named).toBe(2);
    expect(g.unnamed).toBe(2);
    expect(g.undeterminedOutcome).toBe(2);
  });

  it('the per-act tally never invents an act that produced nothing', () => {
    expect(historyGaps(entries).byOperation).toEqual({ image: 1, edit: 1 });
  });
});
