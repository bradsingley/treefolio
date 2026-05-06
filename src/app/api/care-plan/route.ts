import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/ai'
import { apiFetch } from '@/lib/api-client'
import { fetchWeather } from '@/lib/weather'
import { currentAge } from '@/lib/types'
import type { TreeWithSpecies, CareCalendar } from '@/lib/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { lat, lon } = body as { lat?: number; lon?: number }

  if (lat == null || lon == null) {
    return NextResponse.json(
      { error: 'lat and lon are required' },
      { status: 400 },
    )
  }

  // Fetch trees with species via lab-api
  const cookieHeader = request.headers.get('cookie') ?? ''
  let trees: TreeWithSpecies[]
  try {
    const res = await apiFetch<{ trees: TreeWithSpecies[] }>('/treefolio/trees', { cookie: cookieHeader })
    trees = res.trees ?? []
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trees' }, { status: 500 })
  }

  if (trees.length === 0) {
    return NextResponse.json({ error: 'No trees in collection' }, { status: 404 })
  }

  // Fetch weather
  let weather
  try {
    weather = await fetchWeather(lat, lon)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 })
  }

  // Build the current month name
  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const currentMonth = monthKeys[new Date().getMonth()] as keyof CareCalendar

  // Build tree context for the LLM
  const treeContext = (trees as TreeWithSpecies[]).map((t) => {
    const cal = t.species?.care_calendar as CareCalendar | undefined
    const monthTasks = cal?.[currentMonth] ?? []
    return {
      name: t.name,
      species: t.species?.common_name ?? 'Unknown species',
      scientific_name: t.species?.scientific_name ?? '',
      style: t.style,
      size_class: t.size_class,
      age_years: currentAge(t.age_years, t.acquired_date),
      care_this_month: monthTasks,
    }
  })

  const prompt = `You are a bonsai care expert. Generate a weekly care plan for these bonsai trees based on the current weather conditions.

## Weather (7-day forecast)
- Location: ${weather.latitude}°N, ${weather.longitude}°E
- Current temp: ${weather.current.temperature}°C, humidity: ${weather.current.humidity}%, UV: ${weather.current.uvIndex}
- Forecast:
${weather.daily.map((d) => `  ${d.date}: high ${d.tempMax}°C / low ${d.tempMin}°C, precip ${d.precipitationSum}mm, UV ${d.uvIndexMax}`).join('\n')}

## Trees
${treeContext.map((t) => `- **${t.name}** (${t.species} / ${t.scientific_name}), ${t.age_years ?? '?'} years, ${t.style ?? 'unspecified style'}, ${t.size_class ?? 'unspecified size'}
  Scheduled this month: ${t.care_this_month.length > 0 ? t.care_this_month.join(', ') : 'none specified'}`).join('\n')}

## Instructions
For each tree, provide:
1. Watering guidance (frequency, amount, adjustments for weather)
2. Any pruning, wiring, or styling tasks appropriate this week
3. Fertilization notes
4. Environmental concerns (frost protection, shade, etc.)
5. Any urgent alerts

Keep recommendations specific and actionable. Use the tree's name. Format as markdown.`

  try {
    const response = await ai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT!,
      messages: [
        { role: 'system', content: 'You are Kodama, a knowledgeable bonsai care advisor. Be concise, warm, and specific.' },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 2000,
    })

    const plan = response.choices[0]?.message?.content ?? 'No plan generated.'

    // Store in tf_care_recommendations (one per tree) via lab-api
    const weekStart = weather.daily[0]?.date ?? new Date().toISOString().slice(0, 10)
    for (const tree of trees) {
      await apiFetch(`/treefolio/trees/${tree.id}/recommendations`, {
        method: 'PUT',
        cookie: cookieHeader,
        body: {
          weekStart,
          recommendations: { plan, generated_at: new Date().toISOString() },
          weatherSnapshot: weather,
        },
      }).catch(() => {})
    }

    return NextResponse.json({ plan, weather })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LLM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
