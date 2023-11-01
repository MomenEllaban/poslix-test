import { NextResponse, NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { cookies } = request;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next')) return NextResponse.next();

  const hasToken = cookies.get('next-auth.session-token')?.value ?? undefined;

  if (!hasToken) {
    if (pathname !== '/user/auth' && !pathname.includes('/api/auth')) {
      request.nextUrl.pathname = '/user/auth';
      return NextResponse.redirect(request.nextUrl);
    }
  }

  if (hasToken) {
    if (pathname === '/user/auth') {
      request.nextUrl.pathname = '/';
      return NextResponse.redirect(request.nextUrl);
    }
  }

  return NextResponse.next();
}