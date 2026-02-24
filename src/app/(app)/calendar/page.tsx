import { getTrees } from '@/lib/queries'
import { CalendarView } from '@/components/calendar-view'
import type { TreeWithSpecies, CareCalendar } from '@/lib/types'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const

export default async function CalendarPage() {
  const trees = await getTrees()

  // Aggregate care calendar data grouped by month + tree
  const calendarData = MONTH_KEYS.map((key) => {
    const entries: { treeName: string; species: string; tasks: string[] }[] = []

    for (const tree of trees as TreeWithSpecies[]) {
      if (!tree.species) continue
      const cal = tree.species.care_calendar as CareCalendar | null
      const tasks = cal?.[key] ?? []
      if (tasks.length > 0) {
        entries.push({
          treeName: tree.name,
          species: tree.species.common_name,
          tasks,
        })
      }
    }

    return { key, entries }
  })

  const hasData = calendarData.some((m) => m.entries.length > 0)

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">
          Care Calendar
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {hasData
            ? 'Week-by-week tips for your collection throughout the year.'
            : 'Add trees with species to see care tips for the year.'}
        </p>
      </header>

      {hasData ? (
        <CalendarView calendarData={calendarData} />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--muted)]">
            No care calendar data yet — add species to your trees to populate this page.
          </p>
        </div>
      )}
    </div>
  )
}
