// Admin proxy: forwards delete-user requests to lab-api with the user's
// session cookie. We need this because treefolio.vercel.app cookies don't
// scope to api.bradsingley.com (different parent domain), so the browser
// can't call /admin/users/:id directly.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE, PUBLIC_ORIGIN } from '@/lib/api-client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.text()

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .filter((c) => c.name.includes('lab.session') || c.name.includes('lab.csrf'))
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
      Origin: PUBLIC_ORIGIN,
    },
    body,
  })

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  })
}
