import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const adminAuthCookie = request.cookies.get('admin_auth')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  // If trying to access admin page without auth
  if (isAdminPath && adminAuthCookie !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page but already authed
  if (isLoginPage && adminAuthCookie === 'true') {
    return NextResponse.redirect(new URL('/admin/settings', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/login'],
};
