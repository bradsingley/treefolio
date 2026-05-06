import { NextResponse, type NextRequest } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bradsingley.com'
const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://treefolio.vercel.app')
const publicRoutes = ['/login', '/signup', '/api/debug-auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Forward the request cookies to the API to check auth
  const cookieHeader = request.headers.get('cookie') ?? ''

  let user: { id: string; email: string } | null = null
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Cookie: cookieHeader, Origin: PUBLIC_ORIGIN },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      user = data.user ?? null
    }
  } catch {
    // API unreachable — allow through to avoid blocking the entire app
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Protect all other routes
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
