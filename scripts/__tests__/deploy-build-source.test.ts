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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, readlinkSync, copyFileSync, chmodSync, rmSync } from 'fs';
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
  const realTar = sh(repo, 'command -v tar');
  const realSha = sh(repo, 'command -v sha256sum');
  const realDu = sh(repo, 'command -v du');
  write(join(bin, 'ssh'), `#!/bin/bash
last="\${@: -1}"
echo "ssh $last" | head -1 | cut -c1-200 >> "$LOG"
if [ "$last" = "bash -s" ]; then
  script="$(cat | sed "s#/tmp/azma-release#$SIM/tmp/azma-release#g")"
  REMOTE_PHASE=1 bash -c "$script"
else
  cmd="$(printf '%s' "$last" | sed "s#/tmp/azma-release#$SIM/tmp/azma-release#g")"
  REMOTE_PHASE=1 bash -c "$cmd"
fi
`, 0o755);
  // scp copies the archive to the simulated server. MUTATE_TRANSFER changes it
  // IN TRANSIT: "corrupt" appends garbage, "swap" delivers a different, valid
  // archive with one file altered.
  write(join(bin, 'scp'), `#!/bin/bash
src="\${@: -2:1}"
echo "scp $src" >> "$LOG"
cp "$src" "$SIM/tmp/azma-release.tar.gz"
chmod 600 "$SIM/tmp/azma-release.tar.gz"   # scp does not keep the sealed 0400 mode
${realSha} "$SIM/tmp/azma-release.tar.gz" | cut -d' ' -f1 > "$SIM/orig.sum"
case "$MUTATE_TRANSFER" in
  corrupt) echo garbage >> "$SIM/tmp/azma-release.tar.gz" ;;
  swap)
    w="$(mktemp -d)"; ${realTar} -xzf "$SIM/tmp/azma-release.tar.gz" -C "$w"
    echo tampered >> "$w/.next/static/chunks/a.js"
    ${realTar} -czf "$SIM/tmp/azma-release.tar.gz" -C "$w" .next package.json package-lock.json ;;
esac
`, 0o755);
  // Defence-in-depth probe: SIM_LIE_SHA makes the simulated SERVER report the
  // original archive's hash for any .tar.gz, i.e. it plays "the hash gate was
  // defeated", so the server-side manifest check is what has to catch it.
  write(join(bin, 'sha256sum'), `#!/bin/bash
if [ -n "$SIM_LIE_SHA" ] && [ "$REMOTE_PHASE" = 1 ]; then
  for a in "$@"; do case "$a" in *.tar.gz) echo "$(cat "$SIM/orig.sum")  $a"; exit 0 ;; esac; done
fi
exec ${realSha} "$@"
`, 0o755);
  // du runs right after the archive's hash is taken and before the upload, so
  // it is the hook for "archive modified after its fingerprint was computed".
  write(join(bin, 'du'), `#!/bin/bash
if [ -n "$MUTATE_AFTER_SUM" ]; then
  f="\${REPO_ROOT_FOR_TEST}/.deploy-artifact.tar.gz"
  chmod u+w "$f"; echo tampered-after-sum >> "$f"
fi
exec ${realDu} "$@"
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
  // tar wrapper. MUTATE_NEXT alters .next right before the archive is written.
  // MUTATE_ARTIFACT rewrites the finished archive: modify/add/delete/replace a
  // file, forge the manifest, or craft an unsafe archive.
  write(join(bin, 'tar'), `#!/bin/bash
create=0; art=""; prev=""
for a in "$@"; do if [ "$prev" = "-czf" ]; then create=1; art="$a"; fi; prev="$a"; done
d="\${REPO_ROOT_FOR_TEST}/.next"
if [ "$create" = 1 ] && [ -n "$MUTATE_NEXT" ] && [ -d "$d" ]; then
  case "$MUTATE_NEXT" in
    modify) echo tampered >> "$d/static/chunks/a.js" ;;
    delete) rm -f "$d/static/chunks/a.js" ;;
    add)    echo extra > "$d/static/chunks/evil.js" ;;
  esac
fi
${realTar} "$@"; rc=$?
if [ "$create" = 1 ] && [ -n "$MUTATE_ARTIFACT" ]; then
  w="$(mktemp -d)"; ${realTar} -xzf "$art" -C "$w" 2>/dev/null; chmod -R u+w "$w"
  extra_members=""; flags=""
  case "$MUTATE_ARTIFACT" in
    modify)  echo tampered >> "$w/.next/static/chunks/a.js" ;;
    add)     echo extra > "$w/.next/static/chunks/evil.js" ;;
    delete)  rm -f "$w/.next/static/chunks/a.js" ;;
    replace) echo EVIL > "$w/.next/static/chunks/a.js" ;;
    forged)
      echo EVIL > "$w/.next/static/chunks/a.js"
      ( cd "$w/.next" && find . \\( -path ./dev -o -path ./cache \\) -prune -o \\( -type f -o -type l \\) ! -path ./BUILD_SOURCE ! -path ./BUILD_MANIFEST -print0 \
        | LC_ALL=C sort -z | while IFS= read -r -d '' f; do printf '%s  %s\\n' "$(${realSha} "$f" | cut -d' ' -f1)" "$f"; done > BUILD_MANIFEST ) ;;
    traversal) flags="--transform=s,^package.json$,../pwned.json," ;;
    absolute)  flags="-P --transform=s,^package.json$,/tmp/pwned.json," ;;
    hardlink)  ln "$w/.next/static/chunks/a.js" "$w/.next/static/chunks/b.js" ;;
    symlink)   ln -s /etc "$w/.next/link" ;;
    extra)     echo x > "$w/extra.sh"; extra_members="extra.sh" ;;
    cache)     mkdir -p "$w/.next/cache"; echo x > "$w/.next/cache/x" ;;
  esac
  rm -f "$art"
  ${realTar} -czf "$art" $flags -C "$w" .next package.json package-lock.json $extra_members
fi
exit $rc
`, 0o755);
  write(join(bin, 'curl'), '#!/bin/bash\necho 200\n', 0o755);
  write(join(bin, 'pm2'), '#!/bin/bash\necho "pm2 $*" >> "$LOG"\necho "status online"\n', 0o755);

  const env: NodeJS.ProcessEnv = {
    ...process.env, ...GIT_ENV,
    PATH: `${bin}:${process.env.PATH}`,
    LOG: log, SIM: sim, REPO_ROOT_FOR_TEST: repo,
    AZMA_REMOTE: 'test@host', AZMA_SSH_KEY: join(root, 'key'), AZMA_APP_DIR: join(sim, 'app'),
    AZMA_LIVE_URL: 'http://localhost', HOME: root,
  };
  return { root, repo, sim, bin, log, env, head };
}

function deploy(rig: Rig, args: string[], extraEnv: NodeJS.ProcessEnv = {}) {
  const r = spawnSync('bash', [join(rig.repo, 'scripts', 'deploy.sh'), 'deploy', ...args], {
    cwd: rig.repo, env: { ...rig.env, ...extraEnv }, encoding: 'utf8', timeout: Number(process.env.DEPLOY_TEST_TIMEOUT_MS ?? 60_000),
  });
  const out = `${r.stdout}\n${r.stderr}`;
  if (process.env.DEPLOY_TEST_VERBOSE) console.log(out);
  return { status: r.status, out };
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

  it('a reused build with no BUILD_SOURCE is REFUSED, never shipped (Decision B: no unverified path)', () => {
    mkdirSync(join(rig.repo, '.next', 'static', 'chunks'), { recursive: true });
    writeFileSync(join(rig.repo, '.next', 'BUILD_ID'), 'old-build\n');
    writeFileSync(join(rig.repo, '.next', 'static', 'chunks', 'a.js'), 'js\n');
    const r = deploy(rig, ['--skip-build']);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/no \.next\/BUILD_SOURCE/);
    expect(remoteCalls(rig)).toEqual([]);
    expect(sourceIdentities(rig)).toEqual([]);
  });
});

describe('P0-1 supplement — the .next output is sealed by a SHA-256 manifest', () => {
  const nextDir = () => join(rig.repo, '.next');
  const tamper: Record<string, () => void> = {
    modify: () => writeFileSync(join(nextDir(), 'static', 'chunks', 'a.js'), 'tampered\n'),
    delete: () => rmSync(join(nextDir(), 'static', 'chunks', 'a.js')),
    add: () => writeFileSync(join(nextDir(), 'static', 'chunks', 'evil.js'), 'extra\n'),
  };

  it('a sound build writes BUILD_MANIFEST, records its hash, and ships both', () => {
    const r = deploy(rig, ['--commit', rig.head]);
    expect(r.status).toBe(0);
    const manifest = readFileSync(join(nextDir(), 'BUILD_MANIFEST'), 'utf8');
    expect(manifest).toMatch(/^[0-9a-f]{64} {2}\.\/BUILD_ID$/m);
    expect(manifest).toMatch(/\.\/static\/chunks\/a\.js$/m);
    expect(manifest).not.toContain('BUILD_SOURCE');   // no circularity
    expect(manifest).not.toContain('BUILD_MANIFEST');
    const sha = spawnSync('sha256sum', [join(nextDir(), 'BUILD_MANIFEST')], { encoding: 'utf8' }).stdout.split(' ')[0];
    const { text, dir } = sourceIdentities(rig)[0];
    expect(text).toContain(`next_manifest_sha256=${sha}`);
    expect(readFileSync(join(dir, '.next', 'BUILD_SOURCE'), 'utf8')).toContain(`next_manifest_sha256=${sha}`);
    expect(existsSync(join(dir, '.next', 'BUILD_MANIFEST'))).toBe(true);
  });

  it.each(['modify', 'delete', 'add'])(
    'a file %s in .next after the manifest, before the archive (--skip-build) → refused before the archive and before ssh/scp',
    (kind) => {
      expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
      const before = calls(rig).length;
      tamper[kind]();
      const r = deploy(rig, ['--skip-build']);
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/build output changed since the build/);
      expect(calls(rig).length).toBe(before);                         // not one new call
      expect(existsSync(join(rig.repo, '.deploy-artifact.tar.gz'))).toBe(false);
    },
  );

  it.each(['modify', 'delete', 'add'])(
    'a file %s in .next while the archive is being written → refused after tar, nothing sent',
    (kind) => {
      const r = deploy(rig, ['--commit', rig.head], { MUTATE_NEXT: kind });
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/build output changed since the build/);
      expect(remoteCalls(rig)).toEqual([]);                           // zero ssh/scp
    },
  );

  it('the refusal names the files that differ', () => {
    expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
    tamper.add();
    const r = deploy(rig, ['--skip-build']);
    expect(r.out).toContain('static/chunks/evil.js');
  });

  it('editing BUILD_MANIFEST itself (to hide a change) is refused', () => {
    expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
    const before = calls(rig).length;
    tamper.modify();
    const mf = join(nextDir(), 'BUILD_MANIFEST');
    const forged = spawnSync('bash', ['-c', `cd ${nextDir()} && find . -path ./dev -prune -o -type f ! -name BUILD_SOURCE ! -name BUILD_MANIFEST -print | sort | while read f; do echo "$(sha256sum "$f" | cut -d' ' -f1)  $f"; done > BUILD_MANIFEST`]);
    expect(forged.status).toBe(0);
    expect(readFileSync(mf, 'utf8').length).toBeGreaterThan(0);
    const r = deploy(rig, ['--skip-build']);
    expect(r.status).not.toBe(0);
    expect(calls(rig).length).toBe(before);
  });

  it('a build with no manifest cannot be verified and is not shipped as verified', () => {
    expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
    const before = calls(rig).length;
    rmSync(join(nextDir(), 'BUILD_MANIFEST'));
    const r = deploy(rig, ['--skip-build']);
    expect(r.status).not.toBe(0);
    expect(calls(rig).length).toBe(before);
  });

  it('files in .next/cache and .next/dev (never shipped) do not block a sound build', () => {
    expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
    mkdirSync(join(nextDir(), 'cache'), { recursive: true });
    writeFileSync(join(nextDir(), 'cache', 'x'), 'c\n');
    expect(deploy(rig, ['--skip-build']).status).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// P0-1 REPAIR: Probe A (--skip-build without identity) and Probe B (the archive
// itself is never verified). Every refusal below must also prove that the live
// release on the (simulated) server is exactly as it was.
// ─────────────────────────────────────────────────────────────────────────────
describe('P0-1 repair — attacks on the archive, the transfer and --skip-build', () => {
  const nextDir = () => join(rig.repo, '.next');
  const app = () => join(rig.sim, 'app');
  const readLink = () => { try { return readlinkSync(join(app(), '.next')); } catch { return ''; } };
  const live = () => ({
    link: readLink(),
    releases: existsSync(join(app(), 'releases')) ? readdirSync(join(app(), 'releases')).sort() : [],
    state: existsSync(join(app(), '.deploy-state')) ? readFileSync(join(app(), '.deploy-state'), 'utf8') : '',
    liveFiles: readLink() ? readFileSync(join(app(), '.next', 'static', 'chunks', 'a.js'), 'utf8') : '',
    nodeModulesPrevious: existsSync(join(app(), 'node_modules.previous')),
  });
  /** Deploy once so a live release exists, and return its state. */
  const goodBaseline = () => {
    expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
    return live();
  };
  const noLeftovers = () => {
    expect(existsSync(join(app(), '.deploy-staging'))).toBe(false);
    expect(readdirSync(app()).filter((n) => n.startsWith('.azma-arch.'))).toEqual([]);
    expect(existsSync(join(rig.sim, 'tmp', 'azma-release.tar.gz'))).toBe(false);
  };
  const sleep = (sec: string) => spawnSync('sleep', [sec]);

  describe('Probe B: archive contents are verified before anything is sent', () => {
    it.each([
      ['1  modify a file inside the archive after it was created', 'modify'],
      ['2  add a file to the archive', 'add'],
      ['3  delete a file from the archive', 'delete'],
      ['4  replace a file with different content', 'replace'],
    ])('%s → refused locally: zero ssh/scp, archive removed, live release untouched', (_l, mode) => {
      const before = goodBaseline();
      const remoteBefore = remoteCalls(rig).length;
      const r = deploy(rig, ['--commit', rig.head], { MUTATE_ARTIFACT: mode });
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/archive content differs from BUILD_MANIFEST/);
      expect(remoteCalls(rig).length).toBe(remoteBefore);                // no new ssh/scp
      expect(existsSync(join(rig.repo, '.deploy-artifact.tar.gz'))).toBe(false);
      expect(live()).toEqual(before);                                     // live untouched
      expect(sourceIdentities(rig)).toHaveLength(1);                      // nothing new declared verified
      noLeftovers();
    });

    it('5  archive modified AFTER its fingerprint was computed → refused before the first byte is uploaded', () => {
      const before = goodBaseline();
      const remoteBefore = remoteCalls(rig).length;
      const r = deploy(rig, ['--commit', rig.head], { MUTATE_AFTER_SUM: '1' });
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/archive changed after it was verified/);
      expect(remoteCalls(rig).length).toBe(remoteBefore);
      expect(existsSync(join(rig.repo, '.deploy-artifact.tar.gz'))).toBe(false);
      expect(live()).toEqual(before);
    });

    it.each([
      ['corrupt', 'bytes appended in transit'],
      ['swap', 'a different valid archive delivered in place of the verified one'],
    ])('6  archive changed DURING TRANSFER (%s: %s) → server refuses before staging; live untouched', (mode) => {
      const before = goodBaseline();
      const r = deploy(rig, ['--commit', rig.head], { MUTATE_TRANSFER: mode });
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/SHA-256 MISMATCH/);
      expect(live()).toEqual(before);
      expect(sourceIdentities(rig)).toHaveLength(1);
      noLeftovers();
    });

    it('6b server-side defence in depth: even if the archive hash gate were defeated, the staged files are checked against BUILD_MANIFEST and nothing is activated', () => {
      const before = goodBaseline();
      const r = deploy(rig, ['--commit', rig.head], { MUTATE_TRANSFER: 'swap', SIM_LIE_SHA: '1' });
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/staged files do not match BUILD_MANIFEST/);
      expect(r.out).toMatch(/staging failed — the live release was not touched/);
      expect(live()).toEqual(before);             // .next link, releases, state, live a.js, node_modules.previous
      expect(sourceIdentities(rig)).toHaveLength(1);
      noLeftovers();
    });

    it('10 forged manifest inside the archive (file replaced AND BUILD_MANIFEST regenerated) → refused: its hash is not the recorded one', () => {
      const before = goodBaseline();
      const remoteBefore = remoteCalls(rig).length;
      const r = deploy(rig, ['--commit', rig.head], { MUTATE_ARTIFACT: 'forged' });
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/BUILD_MANIFEST is missing or is not the recorded one/);
      expect(remoteCalls(rig).length).toBe(remoteBefore);
      expect(live()).toEqual(before);
    });

    it.each([
      ['path traversal member (../pwned.json)', 'traversal', /path traversal|unexpected member/],
      ['absolute path member', 'absolute', /absolute path/],
      ['hard link member', 'hardlink', /hard link/],
      ['symlink pointing outside the release', 'symlink', /symlink that points outside/],
      ['unexpected top-level file', 'extra', /unexpected member/],
      ['member under .next/cache (never shipped)', 'cache', /never shipped/],
    ])('11 untrusted archive: %s → refused BEFORE it is unpacked, zero ssh/scp', (_l, mode, re) => {
      const before = goodBaseline();
      const remoteBefore = remoteCalls(rig).length;
      const r = deploy(rig, ['--commit', rig.head], { MUTATE_ARTIFACT: mode });
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/unsafe archive/);
      expect(r.out).toMatch(re);
      expect(remoteCalls(rig).length).toBe(remoteBefore);
      expect(existsSync(join(rig.repo, '.deploy-artifact.tar.gz'))).toBe(false);
      expect(live()).toEqual(before);
      expect(existsSync(join(rig.root, 'pwned.json'))).toBe(false);
      expect(existsSync('/tmp/pwned.json')).toBe(false);
    });
  });

  describe('Probe A: --skip-build needs a valid identity', () => {
    it('7  BUILD_SOURCE deleted → refused, zero new calls', () => {
      goodBaseline(); const before = calls(rig).length;
      writeFileSync(join(nextDir(), 'static', 'chunks', 'a.js'), 'EVIL\n');
      rmSync(join(nextDir(), 'BUILD_SOURCE'));
      const r = deploy(rig, ['--skip-build']);
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/no \.next\/BUILD_SOURCE/);
      expect(calls(rig).length).toBe(before);
    });

    it('8  BUILD_MANIFEST deleted → refused, zero new calls', () => {
      goodBaseline(); const before = calls(rig).length;
      rmSync(join(nextDir(), 'BUILD_MANIFEST'));
      const r = deploy(rig, ['--skip-build']);
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/no \.next\/BUILD_MANIFEST/);
      expect(calls(rig).length).toBe(before);
    });

    it('7+8 BOTH identity files deleted AND a file tampered (the original Probe A) → refused, nothing is shipped as "unverified"', () => {
      const base = goodBaseline(); const before = calls(rig).length;
      writeFileSync(join(nextDir(), 'static', 'chunks', 'a.js'), 'EVIL\n');
      rmSync(join(nextDir(), 'BUILD_SOURCE')); rmSync(join(nextDir(), 'BUILD_MANIFEST'));
      const r = deploy(rig, ['--skip-build']);
      expect(r.status).not.toBe(0);
      expect(calls(rig).length).toBe(before);
      expect(live()).toEqual(base);
      expect(sourceIdentities(rig).every((i) => i.text.includes('source=verified'))).toBe(true);
      expect(sourceIdentities(rig)).toHaveLength(1);
    });

    it.each(['commit', 'source_fingerprint', 'lockfile_sha256', 'next_config_sha256', 'public_sha256', 'next_manifest_sha256', 'deployment_id', 'tree', 'built_at'])(
      '9  --skip-build with an incomplete identity (BUILD_SOURCE has no %s line) → refused, zero new calls',
      (field) => {
        goodBaseline(); const before = calls(rig).length;
        const bs = join(nextDir(), 'BUILD_SOURCE');
        writeFileSync(bs, readFileSync(bs, 'utf8').split('\n').filter((l) => !l.startsWith(`${field}=`)).join('\n'));
        const r = deploy(rig, ['--skip-build']);
        expect(r.status).not.toBe(0);
        expect(calls(rig).length).toBe(before);
      });

    it('10 --skip-build with a forged on-disk manifest (regenerated after a tamper) → refused, zero new calls', () => {
      goodBaseline(); const before = calls(rig).length;
      writeFileSync(join(nextDir(), 'static', 'chunks', 'a.js'), 'EVIL\n');
      spawnSync('bash', ['-c', `cd ${nextDir()} && find . -path ./dev -prune -o -type f ! -name BUILD_SOURCE ! -name BUILD_MANIFEST -print | LC_ALL=C sort | while read f; do echo "$(sha256sum "$f" | cut -d' ' -f1)  $f"; done > BUILD_MANIFEST`]);
      const r = deploy(rig, ['--skip-build']);
      expect(r.status).not.toBe(0);
      expect(calls(rig).length).toBe(before);
    });
  });

  describe('normal paths still work', () => {
    it('successful build: archive verified locally and on the server, release activated, live link switched', () => {
      const r = deploy(rig, ['--commit', rig.head]);
      expect(r.status).toBe(0);
      expect(r.out).toMatch(/archive and every staged file verified against BUILD_MANIFEST on the server/);
      const ids = sourceIdentities(rig);
      expect(ids).toHaveLength(1);
      expect(ids[0].text).toContain('source=verified');
      expect(readLink()).toBe(`releases/${ids[0].id}/.next`);
      expect(calls(rig).some((l) => l.startsWith('pm2 '))).toBe(true);      // service restarted only after activation
    });

    it('--skip-build with a sound identity ships and activates a second release', () => {
      const first = goodBaseline();
      sleep('1.1');
      const r = deploy(rig, ['--skip-build']);
      expect(r.status).toBe(0);
      const after = live();
      expect(after.releases.length).toBe(first.releases.length + 1);
      expect(after.link).not.toBe(first.link);
      const ids = sourceIdentities(rig);
      expect(ids).toHaveLength(2);
      expect(ids.every((i) => i.text.includes('source=verified'))).toBe(true);
    });

    it('the archive that arrives is exactly what was verified: server hash equals the local hash', () => {
      expect(deploy(rig, ['--commit', rig.head]).status).toBe(0);
      const sent = readFileSync(join(rig.sim, 'orig.sum'), 'utf8').trim();
      expect(sent).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
