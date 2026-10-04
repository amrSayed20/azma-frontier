import type { NextRequest } from 'next/server';
import { completeLink } from '@/src/cloud-destinations/oauth-link-flow';
import { YOUTUBE_LINK } from '../start/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return completeLink(request, YOUTUBE_LINK);
}
