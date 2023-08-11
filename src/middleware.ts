import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('middleware');
  console.log(request.nextUrl);
  console.log(request.url);

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
