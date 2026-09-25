/**
 * MoneyPrinterTurbo Adapter — Certified Tests
 *
 * global.fetch is stubbed, so no request ever leaves the test process and no
 * real credential is used. The sentinel key below is not a secret.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

process.env['MONEYPRINTERTURBO_API_KEY'] = 'mpt-test-key-sentinel';
process.env['MONEYPRINTERTURBO_BASE_URL'] = 'http://mpt.test:8080';
process.env['MONEYPRINTERTURBO_POLL_INTERVAL_MS'] = '1';
process.env['MONEYPRINTERTURBO_TASK_TIMEOUT_MS'] = '200';
process.env['MONEYPRINTERTURBO_MAX_RETRIES'] = '2';

import {
  MoneyPrinterTurboAdapter,
  MoneyPrinterTurboApiError,
  MoneyPrinterTurboConfigError,
  MoneyPrinterTurboOutputTooLargeError,
  MoneyPrinterTurboTaskFailedError,
  MoneyPrinterTurboTimeoutError,
  MONEYPRINTERTURBO_PROVIDER_ID,
  isMoneyPrinterTurboConfigured,
  resolveConfig,
} from '../moneyprinterturbo-adapter';

function envelope(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => ({ status, message: 'success', data }),
    text: async () => JSON.stringify(data),
    headers: new Map<string, string>() as unknown as Headers,
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

function binary(bytes: Buffer, declaredLength?: number) {
  const headers = new Headers();
  headers.set('content-length', String(declaredLength ?? bytes.length));
  return {
    ok: true,
    status: 200,
    headers,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    text: async () => '',
    json: async () => ({}),
  };
}

beforeEach(() => mockFetch.mockReset());

describe('configuration', () => {
  it('reports configured when the key is present', () => {
    expect(isMoneyPrinterTurboConfigured()).toBe(true);
  });

  it('refuses to build a config without a key rather than calling anonymously', () => {
    const saved = process.env['MONEYPRINTERTURBO_API_KEY'];
    delete process.env['MONEYPRINTERTURBO_API_KEY'];
    expect(() => resolveConfig()).toThrow(MoneyPrinterTurboConfigError);
    process.env['MONEYPRINTERTURBO_API_KEY'] = saved;
  });

  it('sends the api key on every request and never in the body', async () => {
    mockFetch.mockResolvedValueOnce(envelope({ task_id: 't1' }));
    await new MoneyPrinterTurboAdapter().submitProduction({ subject: 'قهوة' });

    const [, init] = mockFetch.mock.calls[0];
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('mpt-test-key-sentinel');
    expect(init.body).not.toContain('mpt-test-key-sentinel');
  });
});

describe('health check', () => {
  it('is true when the provider answers', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    await expect(new MoneyPrinterTurboAdapter().checkHealth()).resolves.toBe(true);
  });

  it('is false — not an exception — when the provider is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(new MoneyPrinterTurboAdapter().checkHealth()).resolves.toBe(false);
  });
});

describe('submission', () => {
  it('returns the provider task id', async () => {
    mockFetch.mockResolvedValueOnce(envelope({ task_id: 'task-42' }));
    await expect(
      new MoneyPrinterTurboAdapter().submitProduction({ subject: 'سيارة كهربائية' }),
    ).resolves.toBe('task-42');
  });

  it('defaults to an Arabic-capable font so subtitles cannot render as blanks', async () => {
    mockFetch.mockResolvedValueOnce(envelope({ task_id: 't' }));
    await new MoneyPrinterTurboAdapter().submitProduction({ subject: 'قهوة' });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body).font_name).toBe('NotoSansArabic-Bold.ttf');
  });

  it('surfaces a 4xx as an api error without retrying it', async () => {
    mockFetch.mockResolvedValue(envelope({ detail: 'bad request' }, false, 400));
    await expect(
      new MoneyPrinterTurboAdapter().submitProduction({ subject: 'x' }),
    ).rejects.toBeInstanceOf(MoneyPrinterTurboApiError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries a 5xx, then succeeds', async () => {
    mockFetch
      .mockResolvedValueOnce(envelope({ detail: 'upstream' }, false, 503))
      .mockResolvedValueOnce(envelope({ task_id: 'recovered' }));
    await expect(
      new MoneyPrinterTurboAdapter().submitProduction({ subject: 'x' }),
    ).resolves.toBe('recovered');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('polling', () => {
  it('resolves when the task completes', async () => {
    mockFetch.mockResolvedValueOnce(
      envelope({ task_id: 't', state: 1, progress: 100, videos: ['/tasks/t/final-1.mp4'] }),
    );
    const { status } = await new MoneyPrinterTurboAdapter().awaitCompletion('t');
    expect(status.videos[0]).toBe('/tasks/t/final-1.mp4');
  });

  it('raises a task failure with the provider reason, and does not retry it', async () => {
    mockFetch.mockResolvedValue(
      envelope({ task_id: 't', state: -1, progress: 40, error: 'pexels_api_keys is not set' }),
    );
    await expect(new MoneyPrinterTurboAdapter().awaitCompletion('t')).rejects.toThrow(
      /pexels_api_keys is not set/,
    );
  });

  it('gives up at the task ceiling rather than polling forever', async () => {
    mockFetch.mockResolvedValue(envelope({ task_id: 't', state: 4, progress: 50, videos: [] }));
    await expect(new MoneyPrinterTurboAdapter().awaitCompletion('t')).rejects.toBeInstanceOf(
      MoneyPrinterTurboTimeoutError,
    );
  });
});

describe('retrieval', () => {
  it('returns the artefact bytes', async () => {
    const payload = Buffer.from('fake-mp4-bytes');
    mockFetch.mockResolvedValueOnce(binary(payload));
    const bytes = await new MoneyPrinterTurboAdapter().retrieveOutput('/tasks/t/final-1.mp4');
    expect(bytes.toString()).toBe('fake-mp4-bytes');
  });

  it('refuses an oversized artefact from its declared length, before buffering it', async () => {
    mockFetch.mockResolvedValueOnce(binary(Buffer.from('x'), 300 * 1024 * 1024));
    await expect(
      new MoneyPrinterTurboAdapter().retrieveOutput('/tasks/t/final-1.mp4'),
    ).rejects.toBeInstanceOf(MoneyPrinterTurboOutputTooLargeError);
  });

  // The test that would have caught it. MEASURED 2026-09-25: the first real
  // storyboard film — five scenes from الحُجّة الدامغة, 137 seconds of
  // Arabic narration at 1920x1080 — was 82,314,643 bytes, and the ceiling
  // then in force was 50MB. The film was made and then refused, and the
  // Creator was told the production had failed.
  it('carries a film the size of the first real one this Empire produced', async () => {
    mockFetch.mockResolvedValueOnce(binary(Buffer.from('x'), 82_314_643));
    await expect(
      new MoneyPrinterTurboAdapter().retrieveOutput('/tasks/t/final-1.mp4'),
    ).resolves.toBeInstanceOf(Buffer);
  });
});

describe('full production', () => {
  it('submits, waits, retrieves, and reports honest usage', async () => {
    const payload = Buffer.alloc(2048, 7);
    mockFetch
      .mockResolvedValueOnce(envelope({ task_id: 'task-9' }))
      .mockResolvedValueOnce(envelope({ task_id: 'task-9', state: 1, progress: 100, videos: ['/tasks/task-9/final-1.mp4'] }))
      .mockResolvedValueOnce(binary(payload));

    const result = await new MoneyPrinterTurboAdapter().produce({ subject: 'قهوة عربية' });

    expect(result.providerId).toBe(MONEYPRINTERTURBO_PROVIDER_ID);
    expect(result.taskId).toBe('task-9');
    expect(result.providerOutputPath).toBe('/tasks/task-9/final-1.mp4');
    expect(result.bytes.length).toBe(2048);
    expect(result.usage.outputBytes).toBe(2048);
    expect(result.usage.pollCount).toBe(1);
    expect(result.usage.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it('fails loudly when a task completes with no video', async () => {
    mockFetch
      .mockResolvedValueOnce(envelope({ task_id: 't' }))
      .mockResolvedValueOnce(envelope({ task_id: 't', state: 1, progress: 100, videos: [] }));
    await expect(
      new MoneyPrinterTurboAdapter().produce({ subject: 'x' }),
    ).rejects.toBeInstanceOf(MoneyPrinterTurboTaskFailedError);
  });
});
