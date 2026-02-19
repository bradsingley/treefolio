import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

  // Fetch current care calendar
  const { data: species, error: fetchErr } = await supabase
    .from('tf_species')
    .select('care_calendar')
    .eq('id', species_id)
    .single()

  if (fetchErr || !species) {
    return NextResponse.json({ error: 'Species not found' }, { status: 404 })
  }

  const existing = (species.care_calendar ?? {}) as CareCalendar
  const merged: Record<string, string[]> = {}

  for (const m of MONTH_KEYS) {
    const curr = existing[m] ?? []
    const incoming = Array.isArray(updates[m]) ? updates[m].map(String) : []
    // Deduplicate by lowercase comparison
    const currLower = new Set(curr.map((s) => s.toLowerCase()))
    const newTasks = incoming.filter((t) => !currLower.has(t.toLowerCase()))
    merged[m] = [...curr, ...newTasks]
  }

  const { data: updated, error: updateErr } = await supabase
    .from('tf_species')
    .update({ care_calendar: merged })
    .eq('id', species_id)
    .select('id, common_name, care_calendar')
    .single()

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ species: updated })
}
