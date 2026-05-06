import { NextResponse, type NextRequest } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bradsingley.com'
const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://treefolio.vercel.app')
const publicRoutes = ['/login', '/signup']

/**
 * Extract only the cookies that lab-api cares about. Stale Supabase cookies
 * (sb-*-auth-token) can be 3KB+ and hitting edge runtime header limits.
 */
function filterAuthCookies(cookieHeader: string): string {
  return cookieHeader
    .split(/;\s*/)
    .filter((c) => {
      const name = c.split('=')[0]?.trim() ?? ''
      // Keep better-auth cookies (any name starting with `lab.` or `__Secure-lab.`).
      return name.includes('lab.session') || name.includes('lab.csrf')
    })
    .join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const rawCookies = request.headers.get('cookie') ?? ''
  const cookieHeader = filterAuthCookies(rawCookies)

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

  // If we detect the legacy Supabase cookie, expire it. The user may have
  // signed in via the old Supabase-backed app months ago; that cookie now
  // bloats every request without serving any purpose.
  const response = (() => {
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      if (user && (pathname === '/login' || pathname === '/signup')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  })()

  // Expire any stale Supabase cookies once.
  for (const cookie of rawCookies.split(/;\s*/)) {
    const name = cookie.split('=')[0]?.trim()
    if (name?.startsWith('sb-')) {
      response.cookies.set(name, '', { maxAge: 0, path: '/' })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
