import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const headerFounderId = request.headers.get('x-founder-id');
  const founderId = headerFounderId?.trim() || 'founder-imperial';

  return NextResponse.json({
    authorized: true,
    founderId,
  });
}
