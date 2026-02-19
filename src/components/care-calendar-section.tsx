'use client'

import { useEffect, useState, useCallback } from 'react'
import { CareCalendarCard } from './care-calendar-card'
import type { CareCalendar, Species } from '@/lib/types'

interface CareCalendarSectionProps {
  species: Species
}

function isEmpty(cal: CareCalendar): boolean {
  return !Object.values(cal).some((v) => Array.isArray(v) && v.length > 0)
}

export function CareCalendarSection({ species }: CareCalendarSectionProps) {
  const [careCalendar, setCareCalendar] = useState<CareCalendar>(species.care_calendar)
  const [researching, setResearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runResearch = useCallback(async () => {
    setResearching(true)
    setError(null)
    try {
      const res = await fetch('/api/species-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ species_id: species.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Research failed')
        return
      }
      if (data.species?.care_calendar) {
        setCareCalendar(data.species.care_calendar)
      }
    } catch {
      setError('Failed to connect')
    } finally {
      setResearching(false)
    }
  }, [species.id])

  useEffect(() => {
    if (isEmpty(careCalendar)) {
      runResearch()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (researching) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--accent)]/40 bg-[var(--accent)]/5 p-8">
        <ResearchingSpinner />
        <p className="text-sm font-medium text-[var(--accent)]">
          Researching care info for {species.common_name}…
        </p>
        <p className="text-xs text-[var(--muted)]">
          Our AI is building a care calendar for your tree
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={runResearch}
          className="mt-2 text-xs font-medium text-red-600 underline hover:no-underline dark:text-red-400"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isEmpty(careCalendar)) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)]">
        <p className="text-sm text-[var(--muted)]">No care calendar data</p>
      </div>
    )
  }

  return <CareCalendarCard careCalendar={careCalendar} />
}

function ResearchingSpinner() {
  return (
    <svg className="h-8 w-8 animate-spin text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
