jest.mock('../src/authentication', () => ({
  ensureFounderAccountExists: jest.fn().mockResolvedValue(undefined),
}));

import { ensureFounderAccountExists } from '../src/authentication';
import { register } from '../instrumentation';

const mockEnsureFounderAccountExists = ensureFounderAccountExists as jest.Mock;

describe('Founder Access Foundation — Guaranteed Startup Bootstrap', () => {
  const originalRuntime = process.env.NEXT_RUNTIME;

  beforeEach(() => {
    mockEnsureFounderAccountExists.mockClear();
  });

  afterEach(() => {
    process.env.NEXT_RUNTIME = originalRuntime;
  });

  it('provisions the Founder account when running under the Node.js runtime', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    await register();
    expect(mockEnsureFounderAccountExists).toHaveBeenCalledTimes(1);
  });

  it('does nothing under a non-Node.js runtime (e.g. edge) — never attempts a SQLite call there', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    await register();
    expect(mockEnsureFounderAccountExists).not.toHaveBeenCalled();
  });
});
