import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/api-client'
import type { CareCalendar } from '@/lib/types'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const

export async function POST(request: NextRequest) {
  const { species_id, updates } = await request.json() as {
    species_id?: string
    updates?: Record<string, string[]>
  }

  if (!species_id || !updates) {
    return NextResponse.json({ error: 'species_id and updates required' }, { status: 400 })
  }

  const cookieHeader = request.headers.get('cookie') ?? ''

  // Fetch current care calendar via lab-api
  let species: { care_calendar?: CareCalendar }
  try {
    const res = await apiFetch<{ species: { care_calendar?: CareCalendar } }>(`/treefolio/species/${species_id}`, { cookie: cookieHeader })
    species = res.species
  } catch {
    return NextResponse.json({ error: 'Species not found' }, { status: 404 })
  }

  const existing = (species.care_calendar ?? {}) as CareCalendar
  const merged: Record<string, string[]> = {}

  for (const m of MONTH_KEYS) {
    const curr = existing[m] ?? []
    const incoming = Array.isArray(updates[m]) ? updates[m].map(String) : []
    const currLower = new Set(curr.map((s) => s.toLowerCase()))
    const newTasks = incoming.filter((t) => !currLower.has(t.toLowerCase()))
    merged[m] = [...curr, ...newTasks]
  }

  try {
    const res = await apiFetch<{ species: Record<string, unknown> }>(`/treefolio/species/${species_id}`, {
      method: 'PATCH',
      cookie: cookieHeader,
      body: { care_calendar: merged },
    })
    return NextResponse.json({ species: res.species })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
