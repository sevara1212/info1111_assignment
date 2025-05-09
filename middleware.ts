import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Always allow access to auth routes and home page
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const authToken = request.cookies.get('auth');
  const userRole = request.cookies.get('userRole');

  // If no auth token, redirect to home
  if (!authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (userRole?.value !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (userRole?.value !== 'resident') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/'
  ]
}; 