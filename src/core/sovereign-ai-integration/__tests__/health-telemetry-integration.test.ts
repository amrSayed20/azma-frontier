/**
 * AZMA OS — PROVIDER SOVEREIGNTY FOUNDATION
 * Health Telemetry Integration Tests
 *
 * Verifies that real dispatch outcomes are reflected in ProviderHealthMonitor
 * telemetry after the MultiProviderOrchestrator executes requests.
 *
 * Before this integration, health values remained at their optimistic
 * initialization defaults (successRate: 1, averageLatencyMs: 0, status:
 * 'available') regardless of what happened during actual provider calls.
 *
 * Tests use a lightweight in-process adapter — no external network calls.
 */

import { createSovereignAIIntegrationRuntime } from '../bootstrap';
import { ConstitutionRuntime } from '../../constitution-runtime';
import type {
  AIProviderAdapter,
  AIProviderDescriptor,
  AIProviderDispatchInput,
  RawAIProviderResponse,
  SovereignAIRequest,
} from '../provider-contracts';

// ─── TEST ADAPTER ─────────────────────────────────────────────────────────────

class TestAdapter implements AIProviderAdapter {
  private _shouldFail = false;
  private _reportedLatencyMs = 300;

  readonly descriptor: AIProviderDescriptor = {
    providerId: 'test-provider-telemetry',
    displayName: 'Test Telemetry Provider',
    providerFamily: 'test',
    capabilities: ['image-generation'],
    modelIds: ['test-telemetry-model-v1'],
    maxConcurrentRequests: 5,
    costProfile: { inputUnitCost: 0, outputUnitCost: 0.01, currency: 'USD' },
    sovereign: true,
  };

  setShouldFail(fail: boolean): void { this._shouldFail = fail; }
  setReportedLatency(ms: number): void { this._reportedLatencyMs = ms; }

  async dispatch(_input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    if (this._shouldFail) throw new Error('test-adapter: simulated provider failure');
    return {
      providerId: this.descriptor.providerId,
      modelId: 'test-telemetry-model-v1',
      content: 'dGVzdA==',
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: this._reportedLatencyMs,
      finishReason: 'completed',
      metadata: {},
    };
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function makeRequest(): SovereignAIRequest {
  return {
    requestId: `req-${Math.random().toString(36).slice(2)}`,
    requestedAt: new Date(),
    requestedBy: 'test-creator',
    purpose: 'health telemetry integration test',
    prompt: 'a sovereign mountain',
    capability: 'image-generation',
    priority: 'normal',
    context: { memoryRefs: [], metadata: {} },
  };
}

const PROVIDER_ID = 'test-provider-telemetry';
const EMA_ALPHA = 0.2;

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('Health Telemetry Integration — MultiProviderOrchestrator', () => {
  let runtime: ReturnType<typeof createSovereignAIIntegrationRuntime>;
  let adapter: TestAdapter;

  beforeEach(() => {
    const constitution = new ConstitutionRuntime();
    constitution.loadConstitution();
    runtime = createSovereignAIIntegrationRuntime(constitution);
    adapter = new TestAdapter();
    runtime.registerProvider(adapter);
  });

  it('initial telemetry is at optimistic defaults immediately after registerProvider', () => {
    const health = runtime.health().find((t) => t.providerId === PROVIDER_ID);
    expect(health).toBeDefined();
    expect(health!.successRate).toBe(1);
    expect(health!.status).toBe('available');
    expect(health!.averageLatencyMs).toBe(0);
    expect(health!.availabilityScore).toBe(1);
  });

  it('records a successful dispatch: status stays available and latency EMA is updated', async () => {
    adapter.setReportedLatency(400);
    await runtime.execute(makeRequest());

    const health = runtime.health().find((t) => t.providerId === PROVIDER_ID)!;
    expect(health.status).toBe('available');
    expect(health.availabilityScore).toBe(1);
    // EMA: 0.2 * 400 + 0.8 * 0 = 80
    expect(health.averageLatencyMs).toBeCloseTo(EMA_ALPHA * 400, 5);
    // successRate from 1.0 after success: 0.2*1 + 0.8*1 = 1.0 (no decay)
    expect(health.successRate).toBe(1);
  });

  it('records a failed dispatch: status becomes degraded and successRate decays', async () => {
    adapter.setShouldFail(true);
    await runtime.execute(makeRequest());

    const health = runtime.health().find((t) => t.providerId === PROVIDER_ID)!;
    expect(health.status).toBe('degraded');
    expect(health.availabilityScore).toBe(0.5);
    // EMA for failure (sample=0): 0.8 * 1.0 = 0.8
    expect(health.successRate).toBeCloseTo((1 - EMA_ALPHA) * 1, 5);
  });

  it('successRate decays further on repeated failures', async () => {
    adapter.setShouldFail(true);

    await runtime.execute(makeRequest());
    const after1 = runtime.health().find((t) => t.providerId === PROVIDER_ID)!.successRate;

    await runtime.execute(makeRequest());
    const after2 = runtime.health().find((t) => t.providerId === PROVIDER_ID)!.successRate;

    expect(after2).toBeLessThan(after1);
    // after1 = 0.8, after2 = 0.8 * 0.8 = 0.64
    expect(after2).toBeCloseTo((1 - EMA_ALPHA) * after1, 5);
  });

  it('successRate recovers toward 1 when a success follows a failure', async () => {
    adapter.setShouldFail(true);
    await runtime.execute(makeRequest());
    const afterFailure = runtime.health().find((t) => t.providerId === PROVIDER_ID)!.successRate;

    adapter.setShouldFail(false);
    await runtime.execute(makeRequest());
    const afterRecovery = runtime.health().find((t) => t.providerId === PROVIDER_ID)!.successRate;

    expect(afterRecovery).toBeGreaterThan(afterFailure);
    // EMA for success: 0.2*1 + 0.8*afterFailure
    expect(afterRecovery).toBeCloseTo(EMA_ALPHA + (1 - EMA_ALPHA) * afterFailure, 5);
  });

  it('latency EMA converges toward new actual latency across multiple successes', async () => {
    adapter.setReportedLatency(1000);
    await runtime.execute(makeRequest());
    const after1000 = runtime.health().find((t) => t.providerId === PROVIDER_ID)!.averageLatencyMs;

    adapter.setReportedLatency(100);
    await runtime.execute(makeRequest());
    const after100 = runtime.health().find((t) => t.providerId === PROVIDER_ID)!.averageLatencyMs;

    // EMA: 0.2*100 + 0.8*after1000 — should be lower than after1000
    expect(after100).toBeLessThan(after1000);
    expect(after100).toBeCloseTo(EMA_ALPHA * 100 + (1 - EMA_ALPHA) * after1000, 5);
  });

  it('status returns to available after a recovery success follows a degraded failure', async () => {
    adapter.setShouldFail(true);
    await runtime.execute(makeRequest());
    expect(runtime.health().find((t) => t.providerId === PROVIDER_ID)!.status).toBe('degraded');

    adapter.setShouldFail(false);
    await runtime.execute(makeRequest());
    expect(runtime.health().find((t) => t.providerId === PROVIDER_ID)!.status).toBe('available');
  });

  it('lastCheckedAt is a real date updated after each dispatch', async () => {
    const beforeDispatch = Date.now();
    await runtime.execute(makeRequest());
    const health = runtime.health().find((t) => t.providerId === PROVIDER_ID)!;
    expect(health.lastCheckedAt.getTime()).toBeGreaterThanOrEqual(beforeDispatch);
  });

  it('a degraded provider is still selected (degraded ≠ unavailable)', async () => {
    adapter.setShouldFail(true);
    await runtime.execute(makeRequest());
    expect(runtime.health().find((t) => t.providerId === PROVIDER_ID)!.status).toBe('degraded');

    // Even degraded, the adapter should be tried again on the next request
    adapter.setShouldFail(false);
    const result = await runtime.execute(makeRequest());
    expect(result.finishReason).toBe('completed');
  });
});
