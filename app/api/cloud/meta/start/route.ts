import { cookies } from 'next/headers';
import { beginLink, type LinkFlow } from '@/src/cloud-destinations/oauth-link-flow';
import { metaOAuthDestination } from '@/src/cloud-destinations/meta-destination';

export const dynamic = 'force-dynamic';

/** A CONSTANT, for the reason recorded in oauth-link-flow.ts. */
export const META_CALLBACK = 'https://azmaos.com/api/cloud/meta/callback';

export const META_LINK: LinkFlow = {
  key: 'meta',
  destination: metaOAuthDestination,
  redirectUri: META_CALLBACK,
  provider: 'facebook-page',
};

export async function GET() {
  return beginLink(META_LINK, (await cookies()).get('azma_session')?.value);
}
