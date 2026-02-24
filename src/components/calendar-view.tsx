'use client'

import { useState } from 'react'

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Approximate week ranges per month (for week-level display)
const WEEKS_PER_MONTH = [
  ['Dec 30 – Jan 5', 'Jan 6 – 12', 'Jan 13 – 19', 'Jan 20 – 26'],
  ['Jan 27 – Feb 2', 'Feb 3 – 9', 'Feb 10 – 16', 'Feb 17 – 23'],
  ['Feb 24 – Mar 2', 'Mar 3 – 9', 'Mar 10 – 16', 'Mar 17 – 23', 'Mar 24 – 30'],
  ['Mar 31 – Apr 6', 'Apr 7 – 13', 'Apr 14 – 20', 'Apr 21 – 27'],
  ['Apr 28 – May 4', 'May 5 – 11', 'May 12 – 18', 'May 19 – 25'],
  ['May 26 – Jun 1', 'Jun 2 – 8', 'Jun 9 – 15', 'Jun 16 – 22', 'Jun 23 – 29'],
  ['Jun 30 – Jul 6', 'Jul 7 – 13', 'Jul 14 – 20', 'Jul 21 – 27'],
  ['Jul 28 – Aug 3', 'Aug 4 – 10', 'Aug 11 – 17', 'Aug 18 – 24', 'Aug 25 – 31'],
  ['Sep 1 – 7', 'Sep 8 – 14', 'Sep 15 – 21', 'Sep 22 – 28'],
  ['Sep 29 – Oct 5', 'Oct 6 – 12', 'Oct 13 – 19', 'Oct 20 – 26'],
  ['Oct 27 – Nov 2', 'Nov 3 – 9', 'Nov 10 – 16', 'Nov 17 – 23', 'Nov 24 – 30'],
  ['Dec 1 – 7', 'Dec 8 – 14', 'Dec 15 – 21', 'Dec 22 – 28'],
]

interface TreeEntry {
  treeName: string
  species: string
  tasks: string[]
}

interface MonthData {
  key: string
  entries: TreeEntry[]
}

interface CalendarViewProps {
  calendarData: MonthData[]
}

function getCurrentWeekInMonth(): number {
  const day = new Date().getDate()
  return Math.min(Math.floor((day - 1) / 7), 4)
}

export function CalendarView({ calendarData }: CalendarViewProps) {
  const currentMonth = new Date().getMonth()
  const [expandedMonth, setExpandedMonth] = useState<number>(currentMonth)

  // "This Week" section: tasks for current month
  const currentData = calendarData[currentMonth]
  const currentWeekIdx = getCurrentWeekInMonth()
  const currentWeekLabel = WEEKS_PER_MONTH[currentMonth]?.[currentWeekIdx] ?? 'This Week'

  return (
    <div className="space-y-8">
      {/* This Week spotlight */}
      {currentData.entries.length > 0 && (
        <section className="rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-light)] p-5">
          <div className="mb-4 flex items-center gap-3">
            <WeekIcon className="h-5 w-5 text-[var(--accent)]" />
            <div>
              <h2 className="text-lg font-semibold text-[var(--heading)]">
                {currentWeekLabel}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Focus areas for your trees right now
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {currentData.entries.map((entry) => {
              // Distribute tasks across weeks — show tasks relevant to this week
              const tasksPerWeek = Math.ceil(entry.tasks.length / (WEEKS_PER_MONTH[currentMonth]?.length ?? 4))
              const start = currentWeekIdx * tasksPerWeek
              const weekTasks = entry.tasks.slice(start, start + tasksPerWeek)
              // If no tasks for this specific week, show all (month-level guidance)
              const displayTasks = weekTasks.length > 0 ? weekTasks : entry.tasks

              return (
                <div key={entry.treeName} className="rounded-lg border border-[var(--accent)]/30 bg-[var(--background)] p-3">
                  <h3 className="text-sm font-medium text-[var(--heading)]">
                    {entry.treeName}
                    <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                      {entry.species}
                    </span>
                  </h3>
                  <ul className="mt-1.5 space-y-1">
                    {displayTasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Month timeline strip */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {MONTH_SHORT.map((label, idx) => (
          <button
            key={label}
            onClick={() => setExpandedMonth(idx === expandedMonth ? -1 : idx)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              idx === currentMonth
                ? idx === expandedMonth
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                  : 'bg-[var(--accent-light)] text-[var(--accent)]'
                : idx === expandedMonth
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : calendarData[idx].entries.length > 0
                    ? 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]'
                    : 'bg-[var(--surface)] text-[var(--muted)]'
            }`}
          >
            {label}
            {calendarData[idx].entries.length > 0 && (
              <span className="ml-1 opacity-60">·</span>
            )}
          </button>
        ))}
      </div>

      {/* Full year view */}
      <div className="space-y-3">
        {calendarData.map((month, idx) => {
          const isExpanded = idx === expandedMonth
          const isCurrent = idx === currentMonth
          const hasTasks = month.entries.length > 0

          return (
            <div
              key={month.key}
              className={`rounded-xl border transition-all ${
                isCurrent
                  ? 'border-[var(--accent)] bg-[var(--accent-light)]'
                  : isExpanded
                    ? 'border-[var(--border)] bg-[var(--surface)]'
                    : 'border-[var(--border)] bg-[var(--surface)]/50'
              }`}
            >
              <button
                onClick={() => setExpandedMonth(isExpanded ? -1 : idx)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${isCurrent ? 'text-[var(--heading)]' : 'text-[var(--foreground)]'}`}>
                    {MONTH_LABELS[idx]}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-fg)]">
                      Now
                    </span>
                  )}
                  {!hasTasks && (
                    <span className="text-xs text-[var(--muted)]">No tasks</span>
                  )}
                </div>
                <ChevronIcon className={`h-4 w-4 text-[var(--muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && hasTasks && (
                <div className="border-t border-[var(--border)]/50 px-4 pb-4 pt-3">
                  {/* Week-by-week breakdown */}
                  {WEEKS_PER_MONTH[idx]?.map((weekLabel, weekIdx) => {
                    // Collect tasks relevant to this week for each tree
                    const weekEntries = month.entries
                      .map((entry) => {
                        const weeksInMonth = WEEKS_PER_MONTH[idx]?.length ?? 4
                        const tasksPerWeek = Math.ceil(entry.tasks.length / weeksInMonth)
                        const start = weekIdx * tasksPerWeek
                        const weekTasks = entry.tasks.slice(start, start + tasksPerWeek)
                        return weekTasks.length > 0 ? { ...entry, tasks: weekTasks } : null
                      })
                      .filter(Boolean) as TreeEntry[]

                    if (weekEntries.length === 0) return null

                    const isCurrentWeek = isCurrent && weekIdx === currentWeekIdx

                    return (
                      <div key={weekLabel} className="mb-3 last:mb-0">
                        <h4 className={`mb-2 flex items-center gap-2 text-xs font-medium ${
                          isCurrentWeek ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                        }`}>
                          {isCurrentWeek && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                          )}
                          {weekLabel}
                        </h4>
                        <div className="space-y-2 pl-3 border-l-2 border-[var(--border)]">
                          {weekEntries.map((entry) => (
                            <div key={entry.treeName}>
                              <span className="text-xs font-medium text-[var(--heading)]">
                                {entry.treeName}
                              </span>
                              <ul className="mt-0.5 space-y-0.5">
                                {entry.tasks.map((task, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                                    <span className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${
                                      isCurrentWeek ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'
                                    }`} />
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Inline icons ─── */

function WeekIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
