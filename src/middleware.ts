import { NextResponse, NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { cookies } = request;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next')) return NextResponse.next();

  const KEY_COOKIES_TOKE =
    process.env.NODE_ENV !== 'production'
      ? 'next-auth.session-token'
      : '__Secure-next-auth.session-token';

  const KEY_LANG = 'lang';
  const DEFAULT_LANG = 'en';

  const hasToken = cookies.get(KEY_COOKIES_TOKE)?.value ?? undefined;
  const hasLang = cookies.get(KEY_LANG)?.value ?? DEFAULT_LANG;

  if (!hasToken) {
    if (pathname !== '/user/auth' && !pathname.includes('/api/auth')) {
      request.nextUrl.pathname = `/${hasLang}/user/auth`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  if (hasToken) {
    if (pathname === '/user/auth') {
      request.nextUrl.pathname = `/`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  return NextResponse.next();
}
