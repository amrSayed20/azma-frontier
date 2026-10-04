/**
 * Meta's consent opens a PORTFOLIO, not one account.
 *
 * One token reaches every Page the Creator administers and every Instagram
 * professional account linked to those Pages. So this callback does what the
 * other providers' do not: it discovers the real destinations and records one
 * row per place that can actually publish.
 *
 * A Creator with no Page gets no rows and is told so. Showing «ميتا — مرتبط»
 * for an account that can publish nowhere is exactly the misleading state the
 * unified destinations surface exists to end.
 */
import type { NextRequest } from 'next/server';
import { getDb } from '@/src/persistent-storage';
import { completeLink } from '@/src/cloud-destinations/oauth-link-flow';
import { linkCloudAccount } from '@/src/cloud-destinations/cloud-account-repository';
import { discoverMetaDestinations, META_SCOPES } from '@/src/cloud-destinations/meta-destination';
import { META_LINK } from '../start/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return completeLink(request, META_LINK, async (grant, creatorId) => {
    const found = await discoverMetaDestinations(grant.refreshToken);
    if (found.length === 0) return 'meta-no-destinations';

    const db = getDb();
    for (const destination of found) {
      linkCloudAccount(db, {
        creatorId,
        provider: destination.kind,
        providerAccountId: destination.id,
        accountLabel: destination.label,
        // The PAGE token, not the user token — it is what actually authorises
        // publishing, and it does not expire when derived from a long-lived
        // user token.
        refreshToken: destination.accessToken,
        scopes: META_SCOPES,
      });
    }
    return 'linked';
  });
}
