import { NextRequest } from 'next/server'
import { ai } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import { currentAge } from '@/lib/types'
import type { TreeWithSpecies, CareCalendar } from '@/lib/types'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const

export async function POST(request: NextRequest) {
  const { messages, session_id } = await request.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    session_id: string
  }

  if (!messages?.length || !session_id) {
    return new Response(JSON.stringify({ error: 'messages and session_id are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Load user's tree catalog for context
  const { data: trees } = await supabase
    .from('tf_trees')
    .select('*, species:tf_species(*)')
    .eq('is_active', true)
    .order('name')

  const treesCast = (trees ?? []) as TreeWithSpecies[]
  const currentMonth = MONTH_KEYS[new Date().getMonth()] as keyof CareCalendar

  const treeList = treesCast.map((t) => {
    const cal = t.species?.care_calendar as CareCalendar | undefined
    const monthTasks = cal?.[currentMonth] ?? []
    return `- **${t.name}** [species_id: ${t.species?.id ?? 'none'}]: ${t.species?.common_name ?? 'Unknown'} (${t.species?.scientific_name ?? ''}), ${currentAge(t.age_years, t.acquired_date) ?? '?'} years, ${t.style ?? 'unspecified style'}. This month: ${monthTasks.join(', ') || 'nothing scheduled'}`
  }).join('\n')

  // Build a species lookup so the extraction call can identify species
  const speciesMap = treesCast
    .filter((t) => t.species)
    .reduce((acc, t) => {
      acc[t.species!.id] = t.species!
      return acc
    }, {} as Record<string, TreeWithSpecies['species'] & {}>)

  const systemPrompt = `You are Kodama (木霊), a warm and knowledgeable bonsai chat companion in the Treefolio app. You're named after the tree spirits from Japanese folklore.

## Personality
- Calm, warm, encouraging. Like a wise friend who knows everything about bonsai.
- Direct but not curt. Concrete language, explain jargon when used.
- Occasionally dry humor. Never forced.
- If a tree is struggling, acknowledge concern before solutions.

## Domain Expertise
The user focuses on hands-on bonsai techniques. You are especially strong on:
- **Pruning & structure**: directional pruning, branch selection, taper, ramification
- **Wiring**: copper vs aluminum, gauge selection, timing, removal
- **Repotting**: root work, akadama/pumice mixes, pot sizing, timing by species
- **Decandling**: single-flush vs double-flush pines, timing, technique
- **Defoliating**: partial vs full, which species tolerate it, timing after new growth hardens
- **Growth patterns**: when leaves harden off, spring vs summer flush, bloom timing, bud stages
- **Seasonal timing**: everything in context of Pacific Northwest (zone 8b)

## The User's Collection (${treesCast.length} trees)
${treeList || 'No trees in collection yet.'}

## Current Date
${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Rules
- Refer to trees by their user-given names
- Don't make up data about trees not in the collection
- Keep responses concise — 2-4 short paragraphs for most answers
- Use bullet points for care instructions
- Be specific about timing: "mid-June" not "summer"
- When discussing techniques, mention which species it applies to
- When unsure about a specific tree's condition, ask clarifying questions
- For diagnoses, gather symptoms before concluding`

  // Store the user's latest message
  const lastUserMsg = messages[messages.length - 1]
  if (lastUserMsg?.role === 'user') {
    await supabase.from('tf_chat_messages').insert({
      session_id,
      role: 'user',
      content: lastUserMsg.content,
    })
  }

  try {
    const stream = await ai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT!,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      max_completion_tokens: 1500,
      stream: true,
    })

    // Collect full response to store in DB
    let fullResponse = ''

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content
            if (delta) {
              fullResponse += delta
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
            }
          }

          // Store assistant response in DB
          if (fullResponse) {
            await supabase.from('tf_chat_messages').insert({
              session_id,
              role: 'assistant',
              content: fullResponse,
            })
          }

          // Extract calendar-worthy advice from the conversation
          const calSuggestion = await extractCalendarUpdates(
            messages,
            fullResponse,
            speciesMap,
          )
          if (calSuggestion) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ calendar_suggestion: calSuggestion })}\n\n`),
            )
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[chat API] Azure OpenAI error:', err)
    const message = err instanceof Error ? err.message : 'Chat request failed'
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// ─── Calendar extraction ────────────────────────────────────────

interface CalendarSuggestion {
  species_id: string
  species_name: string
  updates: Record<string, string[]>
  summary: string
}

async function extractCalendarUpdates(
  history: { role: string; content: string }[],
  assistantReply: string,
  speciesMap: Record<string, { id: string; common_name: string; scientific_name: string; care_calendar: CareCalendar }>,
): Promise<CalendarSuggestion | null> {
  // Only attempt extraction if the assistant actually gave care advice
  const careKeywords = /\b(prune|pruning|wire|wiring|repot|repotting|decandle|decandling|defoliat|fertiliz|water|pot|soil|root|cut|branch|bud|pinch|flush|harden|bloom|dormant|protect|shade|sun)\b/i
  if (!careKeywords.test(assistantReply)) return null

  const speciesList = Object.values(speciesMap)
    .map((s) => `- id: "${s.id}", name: "${s.common_name}" (${s.scientific_name})`)
    .join('\n')

  if (!speciesList) return null

  const extractionPrompt = `Analyze this bonsai conversation and extract any specific, actionable care advice that should be added to a monthly care calendar.

## Species in the user's collection
${speciesList}

## Conversation
${history.map((m) => `${m.role}: ${m.content}`).join('\n')}
assistant: ${assistantReply}

## Instructions
If the conversation contains specific timing-based care advice for a species in the collection, return JSON:
{
  "species_id": "the species UUID this advice applies to",
  "species_name": "common name",
  "updates": {
    "mar": ["concise action item"],
    "jun": ["another action"]
  },
  "summary": "One sentence describing what's being added"
}

Rules:
- Only include months where specific advice was given
- Each task should be a short, actionable string (under 80 chars)
- Focus on: pruning, wiring, repotting, decandling, defoliating, fertilizing, bloom/flush timing, seasonal protection
- Do NOT include generic advice like "water regularly" — only specific seasonal tasks
- If the conversation is just general chat with no calendar-worthy advice, return: {"skip": true}
- Return only raw JSON, no markdown`

  try {
    const res = await ai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT!,
      messages: [
        { role: 'system', content: 'Extract structured care calendar updates from bonsai conversations. Return only valid JSON.' },
        { role: 'user', content: extractionPrompt },
      ],
      max_completion_tokens: 800,
    })

    const raw = res.choices[0]?.message?.content ?? ''
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const parsed = JSON.parse(cleaned)

    if (parsed.skip || !parsed.species_id || !parsed.updates) return null

    // Validate the species_id exists in our map
    if (!speciesMap[parsed.species_id]) return null

    // Validate updates structure
    const validUpdates: Record<string, string[]> = {}
    for (const m of MONTH_KEYS) {
      if (Array.isArray(parsed.updates[m]) && parsed.updates[m].length > 0) {
        validUpdates[m] = parsed.updates[m].map(String)
      }
    }

    if (Object.keys(validUpdates).length === 0) return null

    return {
      species_id: parsed.species_id,
      species_name: parsed.species_name ?? speciesMap[parsed.species_id].common_name,
      updates: validUpdates,
      summary: parsed.summary ?? 'Care calendar updates from conversation',
    }
  } catch (err) {
    console.error('[chat] Calendar extraction failed:', err)
    return null
  }
}
