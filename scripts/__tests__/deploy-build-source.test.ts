/**
 * scripts/deploy.sh — P0-1: the build must prove what it was built from.
 *
 * deploy.sh runs here against a throwaway git repository with FAKE ssh, scp,
 * npm, pm2 and curl on PATH. The fake ssh runs the remote script locally in a
 * scratch directory that plays the server, so the whole flow is exercised with
 * no network and no real host. Every tool call is logged, which is how the
 * refusal tests prove that nothing reached ssh or scp.
 *
 * DEPLOY_SH_UNDER_TEST can point at another copy of the script (used to show
 * these tests fail against the pre-fix script).
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, copyFileSync, chmodSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const REAL_SCRIPT = resolve(__dirname, '..', 'deploy.sh');
const SCRIPT = process.env.DEPLOY_SH_UNDER_TEST ?? REAL_SCRIPT;

const GIT_ENV = {
  GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t',
};

interface Rig { root: string; repo: string; sim: string; bin: string; log: string; env: NodeJS.ProcessEnv; head: string }

function sh(cwd: string, cmd: string, env: NodeJS.ProcessEnv = process.env) {
  const r = spawnSync('bash', ['-c', cmd], { cwd, env: { ...env, ...GIT_ENV }, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd}\n${r.stdout}\n${r.stderr}`);
  return r.stdout.trim();
}

function write(path: string, body: string, mode?: number) {
  writeFileSync(path, body);
  if (mode) chmodSync(path, mode);
}

function makeRig(): Rig {
  const root = mkdtempSync(join(tmpdir(), 'deploy-p01-'));
  const repo = join(root, 'repo');
  const sim = join(root, 'server');
  const bin = join(root, 'bin');
  const log = join(root, 'calls.log');
  for (const d of [repo, sim, bin, join(repo, 'scripts'), join(repo, 'src'), join(repo, 'public'), join(sim, 'app'), join(sim, 'tmp')]) {
    mkdirSync(d, { recursive: true });
  }
  writeFileSync(log, '');

  write(join(repo, '.gitignore'), '.next/\n.deploy-artifact.tar.gz\nnode_modules/\n');
  write(join(repo, 'package.json'), '{"name":"t","version":"1.0.0"}\n');
  write(join(repo, 'package-lock.json'), '{"lockfileVersion":3}\n');
  write(join(repo, 'next.config.ts'), 'export default {};\n');
  write(join(repo, 'public', 'a.txt'), 'a\n');
  write(join(repo, 'src', 'x.ts'), 'export const x = 1;\n');
  mkdirSync(join(repo, 'node_modules', 'next'), { recursive: true });
  write(join(repo, 'node_modules', 'next', 'package.json'), '{"version":"1.0.0"}\n');
  copyFileSync(SCRIPT, join(repo, 'scripts', 'deploy.sh'));
  chmodSync(join(repo, 'scripts', 'deploy.sh'), 0o755);
  write(join(repo, 'scripts', 'verify-deployment.mjs'), 'process.exit(0);\n');
  sh(repo, 'git init -q && git add -A && git commit -q -m init');
  const head = sh(repo, 'git rev-parse HEAD');

  // Fake tools. Each one logs its call.
  write(join(bin, 'ssh'), `#!/bin/bash
last="\${@: -1}"
echo "ssh $last" | head -c 200 | head -1 >> "$LOG"
cmd="$(printf '%s' "$last" | sed "s#/tmp/azma-release#$SIM/tmp/azma-release#g")"
bash -c "$cmd"
`, 0o755);
  write(join(bin, 'scp'), `#!/bin/bash
src="\${@: -2:1}"
echo "scp $src" >> "$LOG"
cp "$src" "$SIM/tmp/azma-release.tar.gz"
`, 0o755);
  write(join(bin, 'npm'), `#!/bin/bash
echo "npm $*" >> "$LOG"
if [ "$1" = "ci" ]; then
  mkdir -p node_modules/next
  echo '{"version":"1.0.0"}' > node_modules/next/package.json
elif [ "$1" = "run" ] && [ "$2" = "build" ]; then
  mkdir -p .next/static/chunks
  echo build-1 > .next/BUILD_ID
  echo js > .next/static/chunks/a.js
  if [ -n "$MUTATE_FILE" ]; then echo changed >> "$MUTATE_FILE"; fi
  if [ -n "$MUTATE_COMMIT" ]; then git commit -q --allow-empty -m moved; fi
fi
`, 0o755);
  write(join(bin, 'curl'), '#!/bin/bash\necho 200\n', 0o755);
  write(join(bin, 'pm2'), '#!/bin/bash\necho "pm2 $*" >> "$LOG"\necho "status online"\n', 0o755);

  const env: NodeJS.ProcessEnv = {
    ...process.env, ...GIT_ENV,
    PATH: `${bin}:${process.env.PATH}`,
    LOG: log, SIM: sim,
    AZMA_REMOTE: 'test@host', AZMA_SSH_KEY: join(root, 'key'), AZMA_APP_DIR: join(sim, 'app'),
    AZMA_LIVE_URL: 'http://localhost', HOME: root,
  };
  return { root, repo, sim, bin, log, env, head };
}

function deploy(rig: Rig, args: string[], extraEnv: NodeJS.ProcessEnv = {}) {
  const r = spawnSync('bash', [join(rig.repo, 'scripts', 'deploy.sh'), 'deploy', ...args], {
    cwd: rig.repo, env: { ...rig.env, ...extraEnv }, encoding: 'utf8', timeout: 60_000,
  });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
}

const calls = (rig: Rig) => readFileSync(rig.log, 'utf8').split('\n').filter(Boolean);
const remoteCalls = (rig: Rig) => calls(rig).filter((l) => l.startsWith('ssh ') || l.startsWith('scp '));
const sourceIdentities = (rig: Rig) => {
  const dir = join(rig.sim, 'app', 'releases');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => existsSync(join(dir, d, 'SOURCE_IDENTITY')))
    .map((d) => ({ id: d, text: readFileSync(join(dir, d, 'SOURCE_IDENTITY'), 'utf8'), dir: join(dir, d) }));
};

let rig: Rig;
beforeEach(() => { rig = makeRig(); });
afterEach(() => { rmSync(rig.root, { recursive: true, force: true }); });

describe('P0-1 — refusals happen before any ssh or scp', () => {
  it('a different SHA than HEAD is refused, and no tool is called at all', () => {
    const other = 'a'.repeat(40);
    const r = deploy(rig, ['--commit', other]);
    expect(r.status).not.toBe(0);
    expect(r.out).toContain(rig.head);
    expect(remoteCalls(rig)).toEqual([]);
    expect(calls(rig).filter((l) => l.startsWith('npm'))).toEqual([]);
  });

  it('an abbreviated SHA is refused (full 40 characters only)', () => {
    const r = deploy(rig, ['--commit', rig.head.slice(0, 7)]);
    expect(r.status).not.toBe(0);
    expect(remoteCalls(rig)).toEqual([]);
    expect(calls(rig)).toEqual([]);
  });

  it('--commit without a value is refused', () => {
    const r = deploy(rig, ['--commit']);
    expect(r.status).not.toBe(0);
    expect(calls(rig)).toEqual([]);
  });

  it('a modified tracked file (dirty tree) is refused by default', () => {
    writeFileSync(join(rig.repo, 'src', 'x.ts'), 'export const x = 2;\n');
    const r = deploy(rig, ['--commit', rig.head]);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/uncommitted/);
    expect(remoteCalls(rig)).toEqual([]);
    expect(calls(rig)).toEqual([]);
  });

  it('an untracked file (dirty tree) is refused by default', () => {
    writeFileSync(join(rig.repo, 'src', 'new.ts'), 'export const y = 1;\n');
    const r = deploy(rig, []);
    expect(r.status).not.toBe(0);
    expect(calls(rig)).toEqual([]);
  });
});

describe('P0-1 — editing anything after the build is refused before the archive', () => {
  it.each([
    ['a source file', 'src/x.ts'],
    ['the lockfile', 'package-lock.json'],
    ['next.config.ts', 'next.config.ts'],
    ['a file in public/', 'public/a.txt'],
  ])('%s changed during/after the build → refused, nothing sent', (_label, file) => {
    const r = deploy(rig, ['--commit', rig.head], { MUTATE_FILE: file });
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/source changed since the build/);
    expect(calls(rig).some((l) => l === 'npm run build')).toBe(true); // it did build
    expect(remoteCalls(rig)).toEqual([]);                              // and sent nothing
    expect(existsSync(join(rig.repo, '.deploy-artifact.tar.gz'))).toBe(false);
  });

  it('a new commit during the build (HEAD moved) → refused, nothing sent', () => {
    const r = deploy(rig, ['--commit', rig.head], { MUTATE_COMMIT: '1' });
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/source changed since the build/);
    expect(remoteCalls(rig)).toEqual([]);
  });
});

describe('P0-1 — a sound build is recorded with the right identity', () => {
  it('records the real SHA in BUILD_SOURCE and builds SOURCE_IDENTITY from it', () => {
    const r = deploy(rig, ['--commit', rig.head]);
    expect(r.status).toBe(0);
    expect(r.out).toContain('DEPLOYED');
    expect(remoteCalls(rig).length).toBeGreaterThan(0);

    const ids = sourceIdentities(rig);
    expect(ids).toHaveLength(1);
    const { text, dir, id } = ids[0];
    expect(text).toContain('source=verified');
    expect(text).toContain(`commit=${rig.head}`);
    expect(text).toContain('tree=clean');
    for (const f of ['source_fingerprint', 'lockfile_sha256', 'next_config_sha256', 'public_sha256']) {
      expect(text).toMatch(new RegExp(`${f}=[0-9a-f]{64}`));
    }
    expect(text).toContain(`deployment_id=${id}`);

    // BUILD_SOURCE travels inside the shipped build and agrees.
    const shipped = readFileSync(join(dir, '.next', 'BUILD_SOURCE'), 'utf8');
    expect(shipped).toContain(`commit=${rig.head}`);
    expect(shipped).toContain(`deployment_id=${id}`);
  });

  it('works without --commit too (the check is then dirty-tree and drift only)', () => {
    const r = deploy(rig, []);
    expect(r.status).toBe(0);
    expect(sourceIdentities(rig)[0].text).toContain(`commit=${rig.head}`);
  });

  it('--allow-dirty ships a dirty tree knowingly and says so in the identity and the name', () => {
    writeFileSync(join(rig.repo, 'src', 'x.ts'), 'export const x = 3;\n');
    const r = deploy(rig, ['--commit', rig.head, '--allow-dirty']);
    expect(r.status).toBe(0);
    const { text, id } = sourceIdentities(rig)[0];
    expect(text).toContain('tree=dirty');
    expect(id).toMatch(/-dirty$/);
  });

  it('--allow-dirty still refuses an edit made after the build', () => {
    writeFileSync(join(rig.repo, 'src', 'x.ts'), 'export const x = 3;\n');
    const r = deploy(rig, ['--allow-dirty'], { MUTATE_FILE: 'src/x.ts' });
    expect(r.status).not.toBe(0);
    expect(remoteCalls(rig)).toEqual([]);
  });
});

describe('P0-1 — reusing a build (--skip-build) does not launder its identity', () => {
  it('a reused build from an OLDER commit is refused (BUILD_SOURCE names the old SHA)', () => {
    expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
    writeFileSync(join(rig.repo, 'src', 'x.ts'), 'export const x = 9;\n');
    sh(rig.repo, 'git add -A && git commit -q -m next');
    const before = remoteCalls(rig).length;
    const r = deploy(rig, ['--skip-build']);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/source changed since the build/);
    expect(remoteCalls(rig).length).toBe(before); // no new ssh/scp
  });

  it('a reused build with no BUILD_SOURCE is shipped only as "unverified", never as clean', () => {
    mkdirSync(join(rig.repo, '.next', 'static', 'chunks'), { recursive: true });
    writeFileSync(join(rig.repo, '.next', 'BUILD_ID'), 'old-build\n');
    writeFileSync(join(rig.repo, '.next', 'static', 'chunks', 'a.js'), 'js\n');
    const r = deploy(rig, ['--skip-build']);
    expect(r.status).toBe(0);
    const { text } = sourceIdentities(rig)[0];
    expect(text).toContain('source=unverified');
    expect(text).not.toContain('tree=clean');
  });
});
