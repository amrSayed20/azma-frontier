import { cookies } from 'next/headers';
import { beginLink, type LinkFlow } from '@/src/cloud-destinations/oauth-link-flow';
import { tiktokDestination } from '@/src/cloud-destinations/tiktok-destination';

export const dynamic = 'force-dynamic';

/** A CONSTANT, for the reason recorded in oauth-link-flow.ts. */
export const TIKTOK_CALLBACK = 'https://azmaos.com/api/cloud/tiktok/callback';

export const TIKTOK_LINK: LinkFlow = {
  key: 'tiktok',
  destination: tiktokDestination,
  redirectUri: TIKTOK_CALLBACK,
  provider: 'tiktok',
};

export async function GET() {
  return beginLink(TIKTOK_LINK, (await cookies()).get('azma_session')?.value);
}
