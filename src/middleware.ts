import { NextResponse, type NextRequest } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bradsingley.com'
const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://treefolio.vercel.app')
const publicRoutes = ['/login', '/signup', '/api/debug-auth']

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
  let meStatus: number | string = 'no-fetch'
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        Cookie: cookieHeader,
        // Edge runtime fetch silently strips `Origin`, but accepts custom
        // headers. lab-api falls back to `x-forwarded-origin` when better-auth
        // CSRF rejects a missing Origin. (see auth/index.ts trust override).
        Origin: PUBLIC_ORIGIN,
        'x-forwarded-origin': PUBLIC_ORIGIN,
      },
      cache: 'no-store',
    })
    meStatus = res.status
    if (res.ok) {
      const data = await res.json()
      user = data.user ?? null
    }
  } catch (err) {
    meStatus = `err:${err instanceof Error ? err.message : String(err)}`
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

  // Diagnostic headers (will appear on every middleware response). Tells us
  // exactly what the edge runtime saw for this request.
  response.headers.set('x-tf-mw-cookie-len', String(cookieHeader.length))
  response.headers.set('x-tf-mw-raw-cookie-len', String(rawCookies.length))
  response.headers.set('x-tf-mw-user', user ? user.id : 'null')
  response.headers.set('x-tf-mw-me-status', String(meStatus))
  response.headers.set('x-tf-mw-cookie-names', rawCookies.split(/;\s*/).map((c) => c.split('=')[0]?.trim()).filter(Boolean).join(','))
  response.headers.set('x-tf-mw-pathname', pathname)

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
  // Use Node.js runtime so we can forward the Cookie header to the API.
  // Edge runtime's fetch silently strips `Cookie` (it's a forbidden header
  // name per the browser fetch spec), which broke /me lookups in this
  // middleware and bounced users to /login on every navigation.
  runtime: 'nodejs',
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
