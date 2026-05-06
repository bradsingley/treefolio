// Temporary diagnostic endpoint. Remove once auth flow is verified.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE, PUBLIC_ORIGIN } from '@/lib/api-client'

export async function GET() {
  const cookieStore = await cookies()
  const all = cookieStore.getAll()
  const cookieHeader = all
    .filter((c) => c.name.includes('lab.session') || c.name.includes('lab.csrf'))
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  let meStatus: number | null = null
  let meBody: unknown = null
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Cookie: cookieHeader, Origin: PUBLIC_ORIGIN },
      cache: 'no-store',
    })
    meStatus = res.status
    meBody = await res.json().catch(() => null)
  } catch (err) {
    meBody = String(err)
  }

  return NextResponse.json({
    publicOrigin: PUBLIC_ORIGIN,
    apiBase: API_BASE,
    allCookieNames: all.map((c) => c.name),
    forwardedCookieHeaderLength: cookieHeader.length,
    forwardedCookieHeaderPreview: cookieHeader.slice(0, 80),
    meStatus,
    meBody,
  })
}
