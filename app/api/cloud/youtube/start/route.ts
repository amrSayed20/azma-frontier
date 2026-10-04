import { cookies } from 'next/headers';
import { beginLink, type LinkFlow } from '@/src/cloud-destinations/oauth-link-flow';
import { youtubeDestination } from '@/src/cloud-destinations/youtube-destination';

export const dynamic = 'force-dynamic';

/**
 * The Empire's one authorized callback FOR LINKING A YOUTUBE CHANNEL.
 *
 * Its own path, deliberately. The sign-in callback states in its own header
 * that there is «exactly ONE authorized redirect URI… with no branch at all»,
 * and a previously attempted branch was removed from it. Giving one route a
 * second purpose — «is this a sign-in, a Drive link or a YouTube link?» —
 * reintroduces exactly the shape it was hardened against. It costs one line in
 * the Google Console, once.
 */
export const YOUTUBE_CALLBACK = 'https://azmaos.com/api/cloud/youtube/callback';

export const YOUTUBE_LINK: LinkFlow = {
  key: 'youtube',
  destination: youtubeDestination,
  redirectUri: YOUTUBE_CALLBACK,
  provider: 'youtube',
};

export async function GET() {
  return beginLink(YOUTUBE_LINK, (await cookies()).get('azma_session')?.value);
}
