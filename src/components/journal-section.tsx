'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { JournalTimeline } from '@/components/journal-timeline'
import { JournalEntryForm } from '@/components/journal-entry-form'
import type { JournalEntry } from '@/lib/types'

interface JournalSectionProps {
  treeId: string
  initialEntries: JournalEntry[]
}

export function JournalSection({ treeId, initialEntries }: JournalSectionProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  const handleCreated = useCallback(() => {
    setShowForm(false)
    router.refresh()
  }, [router])

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          {showForm ? (
            <>
              <MinusIcon className="h-3.5 w-3.5" />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon className="h-3.5 w-3.5" />
              Add Entry
            </>
          )}
        </button>
        <span className="text-xs text-[var(--muted)]">
          {initialEntries.length} entr{initialEntries.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="animate-fade-in rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <JournalEntryForm treeId={treeId} onCreated={handleCreated} />
        </div>
      )}

      {/* Timeline */}
      <JournalTimeline entries={initialEntries} />
    </div>
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

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
