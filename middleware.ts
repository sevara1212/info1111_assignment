import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const userRoleCookie = request.cookies.get('userRole');

  const path = request.nextUrl.pathname;

  const isDashboard = path.startsWith('/dashboard');
  const isAdminLogin = path === '/admin/login';
  const isAdmin = path.startsWith('/admin');

  console.log('auth:', request.cookies.get('auth')?.value);
  console.log('userRole:', request.cookies.get('userRole')?.value);

  // 🔒 Protect /dashboard/*
  if (isDashboard && !authCookie) {
    return NextResponse.redirect(new URL('/auth/resident', request.url));
  }

  // ✅ Allow /admin/login to be accessed by anyone
  if (isAdminLogin) {
    return NextResponse.next();
  }

  // 🔒 Protect /admin/* except /admin/login
  if (isAdmin && (!authCookie || userRoleCookie?.value !== 'admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
