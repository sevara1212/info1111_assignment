import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Always allow access to auth routes and home page
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('auth');
  const userRole = request.cookies.get('userRole');

  // If no auth cookie, redirect to home
  if (!authCookie) {
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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 