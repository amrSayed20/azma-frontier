import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { viewJob } from '@/src/vault/creative-job-service';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * GET /api/qiyamah/jobs/[jobId]
 *
 * ─── THE ANSWER TO «WHAT HAPPENED?» ─────────────────────────────────────────
 *
 *   One job, read by its owner. Another Creator's job is NOT FOUND — the same
 *   answer an absent one gets, so a job id cannot be probed.
 *
 *   It reports five states and never invents a sixth. The one that matters
 *   most is UNKNOWN: a job whose process is gone, which this Empire will not
 *   call failed (a charge may exist) and will not call running (nobody is
 *   running it). Polling it is what turns it from PROCESSING into UNKNOWN —
 *   the truth is produced by looking, not by a timer.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;

  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const view = viewJob(getDb(), jobId, session.creatorId);
  if (!view) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا توجد عمليّةٌ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: 'succeeded',
    job: view,
    // DEPOSITED is not ACCEPTED. The asset waits in the Vault for the
    // Creator's own act, which is the only thing that makes it theirs.
    lifecycle: view.state,
  });
}
