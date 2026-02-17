import type { CareCalendar } from '@/lib/types'

interface CareCalendarCardProps {
  careCalendar: CareCalendar
}

const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const
const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CareCalendarCard({ careCalendar }: CareCalendarCardProps) {
  const currentMonth = new Date().getMonth()
  const currentKey = monthKeys[currentMonth]
  const currentActions = careCalendar[currentKey] ?? []

  // Show current month + next 2 months
  const upcomingMonths = [0, 1, 2].map((offset) => {
    const idx = (currentMonth + offset) % 12
    return {
      key: monthKeys[idx],
      label: monthLabels[idx],
      actions: careCalendar[monthKeys[idx]] ?? [],
      isCurrent: offset === 0,
    }
  })

  return (
    <div className="space-y-4">
      {upcomingMonths.map((month) => (
        <div
          key={month.key}
          className={`rounded-lg border p-4 ${
            month.isCurrent
              ? 'border-[var(--accent)] bg-[var(--accent-light)]'
              : 'border-[var(--border)] bg-[var(--surface)]'
          }`}
        >
          <h4 className={`text-sm font-medium ${month.isCurrent ? 'text-[var(--heading)]' : 'text-[var(--muted)]'}`}>
            {month.label}
            {month.isCurrent && (
              <span className="ml-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                Now
              </span>
            )}
          </h4>
          {month.actions.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {month.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--muted)]" />
                  {action}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">No specific actions</p>
          )}
        </div>
      ))}
    </div>
  )
}
