import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const userRoleCookie = request.cookies.get('userRole');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  // Protect dashboard routes
  if (isDashboard && !authCookie) {
    return NextResponse.redirect(new URL('/auth/resident', request.url));
  }

  // Protect admin routes
  if (isAdmin && (!authCookie || userRoleCookie?.value !== 'admin')) {
    return NextResponse.redirect(new URL('/auth/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}; 