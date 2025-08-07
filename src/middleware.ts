import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Only protect /manager and subroutes
  if (req.nextUrl.pathname.startsWith('/manager') && !req.nextUrl.pathname.startsWith('/manager/login')) {
    const cookie = req.cookies.get('manager_auth');
    if (!cookie || cookie.value !== '1') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/manager/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/manager/:path*'],
};
