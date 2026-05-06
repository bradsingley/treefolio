import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/ai'
import { apiFetch } from '@/lib/api-client'

export async function POST(request: NextRequest) {
  const { species_id } = await request.json() as { species_id?: string }

  if (!species_id) {
    return NextResponse.json({ error: 'species_id is required' }, { status: 400 })
  }

  // Fetch the species via lab-api
  const cookieHeader = request.headers.get('cookie') ?? ''
  let species: Record<string, unknown>
  try {
    const res = await apiFetch<{ species: Record<string, unknown> }>(`/treefolio/species/${species_id}`, { cookie: cookieHeader })
    species = res.species
  } catch {
    return NextResponse.json({ error: 'Species not found' }, { status: 404 })
  }

  // Skip if care calendar already has content
  const cal = species.care_calendar as Record<string, string[]> | null
  const hasData = cal && Object.values(cal).some((v) => Array.isArray(v) && v.length > 0)
  if (hasData) {
    return NextResponse.json({ species, skipped: true })
  }

  const prompt = `You are a bonsai horticulture expert. Research the species "${species.common_name}" (${species.scientific_name}) for bonsai cultivation in the Pacific Northwest (zone 8b, mild wet winters, dry summers).

Return a JSON object with exactly this structure — no markdown, no code fences, just raw JSON:

{
  "care_calendar": {
    "jan": ["task 1", "task 2", "task 3"],
    "feb": ["task 1", "task 2", "task 3"],
    "mar": ["task 1", "task 2", "task 3"],
    "apr": ["task 1", "task 2", "task 3"],
    "may": ["task 1", "task 2", "task 3"],
    "jun": ["task 1", "task 2", "task 3"],
    "jul": ["task 1", "task 2", "task 3"],
    "aug": ["task 1", "task 2", "task 3"],
    "sep": ["task 1", "task 2", "task 3"],
    "oct": ["task 1", "task 2", "task 3"],
    "nov": ["task 1", "task 2", "task 3"],
    "dec": ["task 1", "task 2", "task 3"]
  },
  "family": "Botanical family name",
  "indoor_outdoor": "indoor" | "outdoor" | "both",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "watering": "1-2 sentence watering advice for PNW climate",
  "light": "1-2 sentence light requirements",
  "notes": "2-3 sentences about the species as bonsai, PNW-specific tips, popular cultivars"
}

Each month should have 2-4 specific, actionable tasks. Include timing for repotting, pruning, wiring, fertilizing, pest watch, and seasonal protection. Be specific to PNW conditions.`

  try {
    const response = await ai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT!,
      messages: [
        { role: 'system', content: 'You are a bonsai horticulture expert. Return only valid JSON, no markdown.' },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 3000,
    })

    const raw = response.choices[0]?.message?.content ?? ''
    // Strip any accidental code fences
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const research = JSON.parse(cleaned)

    // Validate care_calendar structure
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const careCalendar: Record<string, string[]> = {}
    for (const m of months) {
      careCalendar[m] = Array.isArray(research.care_calendar?.[m])
        ? research.care_calendar[m].map(String)
        : []
    }

    // Update the species record
    const updates: Record<string, unknown> = { care_calendar: careCalendar }
    if (research.family && !species.family) updates.family = research.family
    if (research.indoor_outdoor && !species.indoor_outdoor) updates.indoor_outdoor = research.indoor_outdoor
    if (research.difficulty && !species.difficulty) updates.difficulty = research.difficulty
    if (research.watering && !species.watering) updates.watering = research.watering
    if (research.light && !species.light) updates.light = research.light
    if (research.notes && !species.notes) updates.notes = research.notes

    const { data: updated, error: updateErr } = await (async () => {
      try {
        const res = await apiFetch<{ species: Record<string, unknown> }>(`/treefolio/species/${species_id}`, {
          method: 'PATCH',
          cookie: cookieHeader,
          body: updates,
        })
        return { data: res.species, error: null }
      } catch (e) {
        return { data: null, error: e instanceof Error ? e : new Error('Update failed') }
      }
    })()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ species: updated })
  } catch (err) {
    console.error('[species-research] LLM error:', err)
    const message = err instanceof Error ? err.message : 'Research failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
