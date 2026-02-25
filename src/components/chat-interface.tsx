'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Markdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface CalendarSuggestion {
  species_id: string
  species_name: string
  updates: Record<string, string[]>
  summary: string
}

const MONTH_LABELS: Record<string, string> = {
  jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
  jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [calSuggestions, setCalSuggestions] = useState<Map<number, CalendarSuggestion>>(new Map())
  const [savingCal, setSavingCal] = useState<number | null>(null)
  const [savedCal, setSavedCal] = useState<Set<number>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, calSuggestions, scrollToBottom])

  const handleSaveToCalendar = async (msgIdx: number, suggestion: CalendarSuggestion) => {
    setSavingCal(msgIdx)
    try {
      const res = await fetch('/api/calendar-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ species_id: suggestion.species_id, updates: suggestion.updates }),
      })
      if (res.ok) {
        setSavedCal((prev) => new Set(prev).add(msgIdx))
      }
    } catch {
      // Silently fail — card stays visible for retry
    }
    setSavingCal(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    // Index of the assistant message we're about to add
    const assistantIdx = newMessages.length

    // Add an empty assistant message to stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, session_id: sessionId }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: `Error: ${err.error ?? 'Something went wrong.'}` }
          return updated
        })
        setStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        setStreaming(false)
        return
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                updated[updated.length - 1] = { ...last, content: last.content + parsed.content }
                return updated
              })
            }
            if (parsed.calendar_suggestion) {
              setCalSuggestions((prev) => {
                const next = new Map(prev)
                next.set(assistantIdx, parsed.calendar_suggestion)
                return next
              })
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Connection error. Please try again.' }
        return updated
      })
    }

    setStreaming(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <KodamaIcon className="mb-4 h-12 w-12 text-[var(--accent)]/40" />
            <p className="text-sm text-[var(--muted)]">
              Ask about your trees, get care advice, or just talk bonsai.
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]/60">
              Care tips from conversations can be saved to your calendar.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] rounded-br-md'
                    : 'bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' ? (
                  msg.content ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  ) : streaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1 text-[var(--muted)]">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce [animation-delay:150ms]">·</span>
                      <span className="animate-bounce [animation-delay:300ms]">·</span>
                    </span>
                  ) : null
                ) : (
                  msg.content
                )}
              </div>
            </div>

            {/* Calendar suggestion card */}
            {msg.role === 'assistant' && calSuggestions.has(i) && (
              <CalendarSuggestionCard
                suggestion={calSuggestions.get(i)!}
                saving={savingCal === i}
                saved={savedCal.has(i)}
                onSave={() => handleSaveToCalendar(i, calSuggestions.get(i)!)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-[var(--border)] p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Kodama something…"
            rows={1}
            className="field-input flex-1 resize-none py-2.5"
            disabled={streaming}
            aria-label="Chat message"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
            aria-label="Send message"
          >
            {streaming ? (
              <SpinnerIcon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Calendar suggestion card ─────────────────────────────────

function CalendarSuggestionCard({
  suggestion,
  saving,
  saved,
  onSave,
}: {
  suggestion: CalendarSuggestion
  saving: boolean
  saved: boolean
  onSave: () => void
}) {
  const monthEntries = Object.entries(suggestion.updates)
    .filter(([, tasks]) => tasks.length > 0)
    .sort((a, b) => {
      const order = Object.keys(MONTH_LABELS)
      return order.indexOf(a[0]) - order.indexOf(b[0])
    })

  return (
    <div className="ml-0 mt-2 max-w-[80%] rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3">
      <div className="flex items-start gap-2">
        <CalendarIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[var(--accent)]">
            Calendar update for {suggestion.species_name}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{suggestion.summary}</p>

          <div className="mt-2 space-y-1.5">
            {monthEntries.map(([month, tasks]) => (
              <div key={month} className="text-xs">
                <span className="font-medium text-[var(--foreground)]">{MONTH_LABELS[month]}: </span>
                <span className="text-[var(--foreground)]/70">{tasks.join(' · ')}</span>
              </div>
            ))}
          </div>

          <div className="mt-3">
            {saved ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckIcon className="h-3.5 w-3.5" />
                Added to calendar
              </span>
            ) : (
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <SpinnerIcon className="h-3 w-3 animate-spin" />
                ) : (
                  <PlusIcon className="h-3 w-3" />
                )}
                Add to calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────

function KodamaIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22V8" />
      <path d="M5 12s1-6 7-10c6 4 7 10 7 10" />
      <path d="M7 16s1-4 5-7c4 3 5 7 5 7" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
