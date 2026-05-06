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
  let debugStatus: number | string = 'no-fetch'
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Cookie: cookieHeader, Origin: PUBLIC_ORIGIN },
      cache: 'no-store',
    })
    debugStatus = res.status
    if (res.ok) {
      const data = await res.json()
      user = data.user ?? null
    }
  } catch (err) {
    debugStatus = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  // Diagnostic: surface auth resolution as response headers so we can debug
  // without reading edge logs. Remove once verified.
  const debugHeaders = {
    'x-tf-mw-status': String(debugStatus),
    'x-tf-mw-user': user ? user.id : 'null',
    'x-tf-mw-cookie-len': String(cookieHeader.length),
    'x-tf-mw-origin': PUBLIC_ORIGIN,
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const r = NextResponse.redirect(url)
      Object.entries(debugHeaders).forEach(([k, v]) => r.headers.set(k, v))
      return r
    }
    const r = NextResponse.next()
    Object.entries(debugHeaders).forEach(([k, v]) => r.headers.set(k, v))
    return r
  }

  // Protect all other routes
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const r = NextResponse.redirect(url)
    Object.entries(debugHeaders).forEach(([k, v]) => r.headers.set(k, v))
    return r
  }

  const r = NextResponse.next()
  Object.entries(debugHeaders).forEach(([k, v]) => r.headers.set(k, v))
  return r
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
