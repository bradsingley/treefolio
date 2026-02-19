import { NextRequest } from 'next/server'
import { ai } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import type { TreeWithSpecies, CareCalendar } from '@/lib/types'

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

  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const currentMonth = monthKeys[new Date().getMonth()] as keyof CareCalendar

  const treeList = ((trees ?? []) as TreeWithSpecies[]).map((t) => {
    const cal = t.species?.care_calendar as CareCalendar | undefined
    const monthTasks = cal?.[currentMonth] ?? []
    return `- **${t.name}**: ${t.species?.common_name ?? 'Unknown'} (${t.species?.scientific_name ?? ''}), ${t.age_years ?? '?'} years, ${t.style ?? 'unspecified style'}. This month: ${monthTasks.join(', ') || 'nothing scheduled'}`
  }).join('\n')

  const systemPrompt = `You are Kodama (木霊), a warm and knowledgeable bonsai chat companion in the Treefolio app. You're named after the tree spirits from Japanese folklore.

## Personality
- Calm, warm, encouraging. Like a wise friend who knows everything about bonsai.
- Direct but not curt. Concrete language, explain jargon when used.
- Occasionally dry humor. Never forced.
- If a tree is struggling, acknowledge concern before solutions.

## The User's Collection (${(trees ?? []).length} trees)
${treeList || 'No trees in collection yet.'}

## Current Date
${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Rules
- Refer to trees by their user-given names
- Don't make up data about trees not in the collection
- Keep responses concise — 2-4 short paragraphs for most answers
- Use bullet points for care instructions
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
      temperature: 0.7,
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
