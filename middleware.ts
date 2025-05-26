import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const userRoleCookie = request.cookies.get('userRole');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLogin = request.nextUrl.pathname === '/admin/login';

  // Protect dashboard routes
  if (isDashboard && !authCookie) {
    return NextResponse.redirect(new URL('/auth/resident', request.url));
  }

  // Never protect /admin/login itself
  if (isAdminLogin) {
    return NextResponse.next();
  }

  // Protect admin routes (except /admin/login)
  if (isAdmin && (!authCookie || userRoleCookie?.value !== 'admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}; 