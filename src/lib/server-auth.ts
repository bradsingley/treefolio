// Server-side auth helpers. Run in Node.js runtime so Cookie forwarding to
// the API works. Never import these from middleware.

import { cookies } from 'next/headers'
import { API_BASE, PUBLIC_ORIGIN } from './api-client'

/**
 * Look up the current user from the lab-api `/me` endpoint, forwarding only
 * the better-auth cookies.
 *
 * Returns null when the user is not logged in or the cookie is invalid.
 */
export async function getCurrentUser(): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .filter(
      (c) => c.name.includes('lab.session') || c.name.includes('lab.csrf'),
    )
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  if (!cookieHeader) return null

  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Cookie: cookieHeader, Origin: PUBLIC_ORIGIN },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.user ?? null
  } catch {
    return null
  }
}
