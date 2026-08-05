/**
 * AZMA OS — Imperial Health Endpoint
 *
 * Founder-only. Returns the Empire's complete operational truth
 * at the moment of request. No engineering complexity — only
 * what is constitutionally observable from the running process.
 *
 * Every check is real. No fabricated values. No green lights
 * unless the actual system confirms them.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../src/authentication';
import { getDb } from '../../../src/persistent-storage';
import { statSync, readdirSync, statfsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

// ── Directory size (non-recursive — one level only, sufficient for vault) ──
function dirSizeBytes(dirPath: string): number {
  try {
    return readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => e.isFile())
      .reduce((sum, e) => {
        try { return sum + statSync(join(dirPath, e.name)).size; } catch { return sum; }
      }, 0);
  } catch {
    return -1; // directory does not exist yet
  }
}

function humanBytes(bytes: number): string {
  if (bytes < 0)        return 'not created yet';
  if (bytes < 1024)     return `${bytes} B`;
  if (bytes < 1048576)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function uptimeHuman(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${Math.floor(seconds % 60)}s`;
}

export async function GET(request: NextRequest) {
  // ── Founder-only gate ──────────────────────────────────────────────────
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session   = sessionId ? verifySession(sessionId) : null;

  if (!session || session.role !== 'founder') {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
  }

  const now = Date.now();

  // ── Database ───────────────────────────────────────────────────────────
  type DbHealth = 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  let dbHealth: DbHealth = 'DOWN';
  let creatorCount = 0;
  let activeSessionCount = 0;
  let generationCount = 0;
  let vaultAssetCount = 0;
  let goalCount = 0;
  let investigationCount = 0;
  let productionCount = 0;

  try {
    const db = getDb();
    const q  = <T>(sql: string, ...params: unknown[]) =>
      (db.prepare(sql).get(...params) as { c: number }).c as T;

    creatorCount       = q<number>('SELECT COUNT(*) as c FROM creators');
    activeSessionCount = q<number>('SELECT COUNT(*) as c FROM sessions WHERE expires_at > ?', now);
    generationCount    = q<number>('SELECT COUNT(*) as c FROM generation_records');
    vaultAssetCount    = q<number>('SELECT COUNT(*) as c FROM vault_assets');
    goalCount          = q<number>('SELECT COUNT(*) as c FROM goals');
    investigationCount = q<number>('SELECT COUNT(*) as c FROM knowledge_investigations');
    productionCount    = q<number>('SELECT COUNT(*) as c FROM cinematic_ledger');
    dbHealth           = 'OPERATIONAL';
  } catch (err) {
    dbHealth = 'DOWN';
    // Non-fatal — health check continues; DOWN is the honest report.
    console.error('[health] database check failed:', err);
  }

  // ── Vault / storage ────────────────────────────────────────────────────
  const cwd = process.cwd();
  const dbFileBytes        = (() => { try { return statSync(join(cwd, 'data', 'azma-os.db')).size; } catch { return -1; } })();
  const generatedAssetBytes = dirSizeBytes(join(cwd, 'public', 'generated-assets'));
  const uploadsBytes        = dirSizeBytes(join(cwd, 'public', 'uploads'));

  // ── Disk (root filesystem) ─────────────────────────────────────────────
  let diskFreeBytes  = -1;
  let diskTotalBytes = -1;
  try {
    const fs       = statfsSync(cwd);
    diskFreeBytes  = fs.bfree  * fs.bsize;
    diskTotalBytes = fs.blocks * fs.bsize;
  } catch { /* statfsSync unavailable on some builds */ }

  // ── Memory ────────────────────────────────────────────────────────────
  const mem = process.memoryUsage();

  // ── Provider configuration (presence only — never expose key values) ───
  const providers = {
    openai:         !!process.env.OPENAI_API_KEY        ? 'CONFIGURED' : 'MISSING',
    stripeSecret:   !!process.env.STRIPE_SECRET_KEY     ? 'CONFIGURED' : 'MISSING',
    stripeWebhook:  !!process.env.STRIPE_WEBHOOK_SECRET ? 'CONFIGURED' : 'MISSING',
    stripePrice:    !!process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY ? 'CONFIGURED' : 'MISSING',
    voiceCloning:   !!process.env.VOICE_CLONING_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
    founderAccount: !!process.env.FOUNDER_EMAIL         ? 'CONFIGURED' : 'MISSING',
  };

  const allProvidersReady =
    providers.openai        === 'CONFIGURED' &&
    providers.stripeSecret  === 'CONFIGURED' &&
    providers.stripeWebhook === 'CONFIGURED' &&
    providers.stripePrice   === 'CONFIGURED' &&
    providers.founderAccount === 'CONFIGURED';

  // ── Overall status ─────────────────────────────────────────────────────
  type EmpireStatus = 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  const empireStatus: EmpireStatus =
    dbHealth === 'DOWN'       ? 'DOWN'      :
    !allProvidersReady        ? 'DEGRADED'  :
                                'OPERATIONAL';

  return NextResponse.json({
    status: 'succeeded',

    empire: {
      status:       empireStatus,
      uptime:       uptimeHuman(Math.floor(process.uptime())),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion:  process.version,
      environment:  process.env.NODE_ENV ?? 'unknown',
      checkedAt:    new Date(now).toISOString(),
    },

    database: {
      status:             dbHealth,
      creators:           creatorCount,
      activeSessions:     activeSessionCount,
      generationRecords:  generationCount,
      vaultAssets:        vaultAssetCount,
      goals:              goalCount,
      investigations:     investigationCount,
      productions:        productionCount,
      dbFileSize:         humanBytes(dbFileBytes),
    },

    vault: {
      generatedAssets: humanBytes(generatedAssetBytes),
      uploads:         humanBytes(uploadsBytes),
      total:           humanBytes(
        Math.max(generatedAssetBytes, 0) + Math.max(uploadsBytes, 0)
      ),
    },

    disk: {
      free:    diskFreeBytes  >= 0 ? humanBytes(diskFreeBytes)  : 'unavailable',
      total:   diskTotalBytes >= 0 ? humanBytes(diskTotalBytes) : 'unavailable',
      usedPct: diskTotalBytes > 0
        ? `${Math.round(((diskTotalBytes - diskFreeBytes) / diskTotalBytes) * 100)}%`
        : 'unavailable',
    },

    memory: {
      heapUsed:         humanBytes(mem.heapUsed),
      heapTotal:        humanBytes(mem.heapTotal),
      rss:              humanBytes(mem.rss),
      heapUtilizationPct: `${Math.round((mem.heapUsed / mem.heapTotal) * 100)}%`,
    },

    providers,
  });
}
