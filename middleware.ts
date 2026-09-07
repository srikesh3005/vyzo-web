/**
 * Next.js Middleware
 * Route protection: redirect unauthenticated users away from protected routes,
 * and redirect authenticated users away from auth pages.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/profile',
  '/settings',
  '/wishlist',
  '/notifications',
  '/recently-viewed',
  '/saved-searches',
  '/ai-chat',
];

// Routes that authenticated users shouldn't visit
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for access token in cookies (set by API on login)
  const token = request.cookies.get('vyzo_access_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // If accessing a protected route without a token, redirect to login
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to access auth pages, redirect to home
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && token) {
    const fromParam = request.nextUrl.searchParams.get('from');
    return NextResponse.redirect(new URL(fromParam || '/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files, api routes, and _next
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)',
  ],
};
