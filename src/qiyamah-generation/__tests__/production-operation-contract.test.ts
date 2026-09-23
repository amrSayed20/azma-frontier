/**
 * AZMA OS — PRODUCTION OPERATION API CONTRACT (Final) · conformance.
 *
 *   POST = ACCEPTANCE · GET = OBSERVATION · LEDGER = TRUTH · HTTP = TRANSPORT
 *
 * Each block below is one clause of the ratified contract, asserted against
 * the code that must honour it. Where a clause governs the shape of a
 * response, the route's source is read: a shape is a promise made to a
 * client, and a promise must be checked where it is written.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const strip = (f: string) => readFileSync(join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const GENERATE = strip('app/api/qiyamah/generate/route.ts');
const OBSERVE = strip('app/api/qiyamah/operations/[operationId]/route.ts');
const BY_INTENT = strip('app/api/qiyamah/operations/by-intent/[intentKey]/route.ts');
const LIFECYCLE = strip('src/qiyamah-generation/video-operation-lifecycle.ts');
const CLIENT = strip('app/qiyamah-chamber/QiyamahChamberClient.tsx');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { classifyFailure } = require('../video-operation-lifecycle') as typeof import('../video-operation-lifecycle');

describe('§2 · the four states, and only those, are observable', () => {
  it('the observation is scoped to video productions, so no other path’s states can surface', () => {
    expect(LIFECYCLE).toMatch(/WHERE operation_id = \? AND capability_target = \?/);
    expect(LIFECYCLE).toMatch(/CapabilityTarget\.MOTION/);
  });

  it('acceptance completes the pre-dispatch transitions before it answers, so DISPATCHED is the first state a client can see', () => {
    const accept = LIFECYCLE.slice(LIFECYCLE.indexOf('export async function acceptVideoProduction'));
    const createdAt = accept.indexOf('createEntry(intent)');
    const dispatchedAt = accept.indexOf('OperationState.DISPATCHED');
    const returnedAt = accept.indexOf('return { operationId,');
    expect(createdAt).toBeGreaterThan(-1);
    expect(dispatchedAt).toBeGreaterThan(createdAt);
    expect(returnedAt).toBeGreaterThan(dispatchedAt);
    // Both transitions are awaited — not fired and forgotten.
    expect(accept).toMatch(/await manager\.updateState\(operationId, OperationState\.AUTHORIZED\)/);
    expect(accept).toMatch(/await manager\.updateState\(operationId, OperationState\.DISPATCHED\)/);
  });

  it('MATERIALIZING, DEPOSITED and FAILED are written by the production itself', () => {
    const run = LIFECYCLE.slice(LIFECYCLE.indexOf('async function runProduction'));
    for (const state of ['MATERIALIZING', 'DEPOSITED', 'FAILED']) {
      expect(run).toContain(`OperationState.${state}`);
    }
  });
});

describe('§3 · POST is acceptance', () => {
  it('a video request answers 202 with the contract’s five fields', () => {
    const branch = GENERATE.slice(GENERATE.indexOf("if (mediaType === 'video')"));
    expect(branch).toMatch(/status: 'accepted'/);
    expect(branch).toMatch(/operationId: accepted\.operationId/);
    expect(branch).toMatch(/state: accepted\.state/);
    expect(branch).toMatch(/reused: accepted\.reused/);
    expect(branch).toMatch(/observeAt: `\/api\/qiyamah\/operations\/\$\{accepted\.operationId\}`/);
    expect(branch).toMatch(/\{ status: 202 \}/);
  });

  it('intentKey is required, and its absence is refused before any work', () => {
    const branch = GENERATE.slice(GENERATE.indexOf("if (mediaType === 'video')"));
    const refusalAt = branch.indexOf("reason: 'intent-key-required'");
    expect(refusalAt).toBeGreaterThan(-1);
    expect(branch.indexOf('acceptVideoProduction(')).toBeGreaterThan(refusalAt);
  });

  it('the request does not await the production — acceptance is all it awaits', () => {
    const branch = GENERATE.slice(GENERATE.indexOf("if (mediaType === 'video')"));
    expect(branch).not.toMatch(/await generateVideo\(/);
    expect(branch).toMatch(/await acceptVideoProduction\(/);
  });
});

describe('§4 · idempotency', () => {
  it('an existing key returns that operation with reused: true, and starts nothing', () => {
    const accept = LIFECYCLE.slice(LIFECYCLE.indexOf('export async function acceptVideoProduction'));
    const reuseBlock = accept.slice(accept.indexOf('if (existing)'), accept.indexOf('const operationId'));
    expect(reuseBlock).toMatch(/reused: true/);
    // The reuse path returns before anything can start a production.
    expect(reuseBlock).not.toContain('createEntry');
    expect(reuseBlock).not.toContain('runProduction');
  });

  it('ownership is part of the key’s scope — in SQL, not after the fact', () => {
    const find = LIFECYCLE.slice(LIFECYCLE.indexOf('export function findOperationByIntentKey'));
    expect(find).toMatch(/WHERE subscriber_tenant_id = \?/);
    expect(find).toMatch(/intentKey/);
  });
});

describe('§5 · GET is observation, owner-scoped, and says enough', () => {
  it('the operation’s fields are the response itself', () => {
    const body = OBSERVE.slice(OBSERVE.indexOf('return NextResponse.json({'));
    expect(body).toMatch(/operationId: observed\.operationId/);
    expect(body).toMatch(/state: observed\.state/);
    // Not wrapped in an envelope that hides them.
    expect(body).not.toMatch(/operation: \{/);
  });

  it('DEPOSITED carries the sovereign asset; FAILED carries an attributable reason', () => {
    const body = OBSERVE.slice(OBSERVE.indexOf('return NextResponse.json({'));
    expect(body).toMatch(/assetId: observed\.assetId/);
    expect(body).toMatch(/assetUrl: observed\.assetUrl/);
    expect(body).toMatch(/failureReason: observed\.failureReason/);
  });

  it('not-yours and not-found are the same answer', () => {
    expect(LIFECYCLE).toMatch(/if \(!row \|\| row\.subscriber_tenant_id !== creatorId\) return null;/);
    expect(OBSERVE).toMatch(/status: 404/);
  });

  it('it observes only — it can neither start nor change a production', () => {
    for (const forbidden of ['acceptVideoProduction', 'generateVideo', 'updateState', 'INSERT', 'UPDATE']) {
      expect(OBSERVE).not.toContain(forbidden);
    }
  });
});

describe('§6 · recovery by intent key', () => {
  it('it answers found/operationId/state, and says plainly when there is none', () => {
    expect(BY_INTENT).toMatch(/found: true/);
    expect(BY_INTENT).toMatch(/found: false, operationId: null, state: null/);
    expect(BY_INTENT).toMatch(/operationId: observed\.operationId/);
    expect(BY_INTENT).toMatch(/state: observed\.state/);
  });

  it('it is owner-scoped and starts nothing', () => {
    expect(BY_INTENT).toMatch(/findOperationByIntentKey\(session\.creatorId/);
    for (const forbidden of ['acceptVideoProduction', 'generateVideo', 'createEntry']) {
      expect(BY_INTENT).not.toContain(forbidden);
    }
  });
});

describe('§7 · what the client does when the connection dies', () => {
  it('it never declares failure, never re-POSTs, and keeps the intent key', () => {
    const catchBlock = CLIENT.slice(CLIENT.indexOf('const kept = rememberedOperation();', CLIENT.indexOf('} catch {')));
    expect(catchBlock).toContain('انقطع الاتصال بالعملية. نتحقق من حالة الإنتاج…');
    // The recovery path observes; it does not generate.
    const recovery = CLIENT.slice(CLIENT.indexOf('async function recoverByIntentKey'), CLIENT.indexOf('const handleEmbodyScene'));
    expect(recovery).not.toMatch(/\/api\/qiyamah\/generate/);
    expect(recovery).toMatch(/operations\/by-intent/);
  });

  it('while producing it says exactly the contract’s line', () => {
    expect(CLIENT).toContain("setProducingNotice('الإنتاج ما زال جارياً.')");
    expect(CLIENT).toMatch(/producingNotice \?\? \(inputMode === 'idea'/);
  });

  it('a failed poll is asked again, never turned into a verdict', () => {
    const observe = CLIENT.slice(CLIENT.indexOf('async function observeProduction'), CLIENT.indexOf('function spokenFailure'));
    // A poll that throws is swallowed and the loop continues; an unanswered
    // poll leaves `op` null and the loop continues. Neither ends in a verdict.
    expect(observe).toMatch(/try \{[\s\S]*?fetch\(`\/api\/qiyamah\/operations\/\$\{operationId\}`\)[\s\S]*?\} catch \{/);
    expect(observe).toMatch(/if \(!op\) continue;/);
    expect(observe).not.toMatch(/catch \{[^}]*setStage\('error'\)/);
  });

  it('DEPOSITED shows the asset; FAILED shows the real failure', () => {
    const observe = CLIENT.slice(CLIENT.indexOf('async function observeProduction'), CLIENT.indexOf('function spokenFailure'));
    expect(observe).toMatch(/op\.succeeded && op\.assetUrl/);
    expect(observe).toMatch(/spokenFailure\(op\.failureReason\)/);
  });
});

describe('§10 · forbidden behaviour', () => {
  it('no provider or model can reach the Creator through an operation', () => {
    // Precise patterns, not substrings: "observeOperation" contains "veo",
    // and a test that cannot tell a model from a verb proves nothing.
    const LEAKS = [/magic-hour/i, /kling/i, /veo3/i, /seedance/i, /ltx-/i, /providerModelId/, /generationModel/];
    for (const source of [OBSERVE, BY_INTENT]) {
      for (const leak of LEAKS) expect(source).not.toMatch(leak);
    }
    // The classification the Creator sees never carries engine words.
    for (const raw of [
      ['provider-error', 'image-to-video returned HTTP 422: Model veo3.1 does not support end_seconds'],
      ['provider-error', 'Magic Hour kling-3.0 rejected the request'],
      [undefined, 'MAGIC_HOUR_API_KEY missing'],
    ] as [string | undefined, string][]) {
      const classified = classifyFailure(raw[0], raw[1]);
      expect(classified).toMatch(/^[A-Z_]+$/);
      for (const leak of [/magic/i, /kling/i, /veo/i, /seedance/i, /ltx/i, /http/i]) {
        expect(classified).not.toMatch(leak);
      }
    }
  });

  it('classification is truthful about what failed', () => {
    expect(classifyFailure('provider-error', 'no remaining credit — 402')).toBe('CAPACITY_EXHAUSTED');
    expect(classifyFailure(undefined, 'no result within 600000ms')).toBe('TOOK_TOO_LONG');
    expect(classifyFailure('provider-error', 'returned data that is not a video')).toBe('OUTPUT_NOT_VIDEO');
    expect(classifyFailure('storage-error', 'failed to keep the generated video')).toBe('STORAGE_FAILED');
    expect(classifyFailure('provider-error', 'SUBMIT_FAILED: HTTP 422')).toBe('REFUSED_BY_ENGINE');
    expect(classifyFailure(undefined, 'something nobody predicted')).toBe('INTERNAL');
  });

  it('nothing re-generates on connection loss, anywhere in the client', () => {
    const generateCalls = (CLIENT.match(/fetch\('\/api\/qiyamah\/generate'/g) ?? []).length;
    // Exactly one: the Creator's own press. No automatic second call exists.
    expect(generateCalls).toBe(1);
  });

  it('no second state store or generation engine was introduced', () => {
    expect(LIFECYCLE).toMatch(/operation_ledger/);
    expect(LIFECYCLE).toMatch(/import \{ generateVideo \} from '\.\/generation-service'/);
    expect(LIFECYCLE).not.toMatch(/CREATE TABLE/);
  });
});
