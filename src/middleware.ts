import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isApiAuthRoute = pathname.startsWith('/api/auth');

  if (!token) {
    if (isAuthPage || isApiAuthRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId as string);
    headers.set('x-user-email', payload.email as string);
    headers.set('x-user-name', payload.name as string);

    const response = NextResponse.next({
      request: {
        headers: headers,
      },
    });

    if (isAuthPage) {
        return NextResponse.redirect(new URL('/', req.url));
    }
    
    return response;

  } catch (error) {
    console.error('JWT Verification Error:', error);
    // Token is invalid, redirect to login
    const response = NextResponse.redirect(new URL('/login', req.url));
    // Clear the invalid cookie
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
