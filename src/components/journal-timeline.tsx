import type { JournalEntry } from '@/lib/types'

interface JournalTimelineProps {
  entries: JournalEntry[]
}

const entryTypeConfig: Record<JournalEntry['entry_type'], { label: string; color: string; icon: string }> = {
  prune:     { label: 'Pruned',      color: 'text-moss-500',  icon: '✂' },
  repot:     { label: 'Repotted',    color: 'text-sand-500',  icon: '🪴' },
  water:     { label: 'Watered',     color: 'text-blue-500',  icon: '💧' },
  fertilize: { label: 'Fertilized',  color: 'text-moss-700',  icon: '🌱' },
  wire:      { label: 'Wired',       color: 'text-stone-600', icon: '🔧' },
  defoliate: { label: 'Defoliated',  color: 'text-sand-500',  icon: '🍂' },
  style:     { label: 'Styled',      color: 'text-stone-600', icon: '🎨' },
  photo:     { label: 'Photo',       color: 'text-stone-400', icon: '📷' },
  health:    { label: 'Health Check', color: 'text-clay-500', icon: '🩺' },
  note:      { label: 'Note',        color: 'text-stone-400', icon: '📝' },
}

export function JournalTimeline({ entries }: JournalTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)]">
        <p className="text-sm text-[var(--muted)]">No journal entries yet</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute top-0 bottom-0 left-4 w-px bg-[var(--border)]" />

      <ul className="space-y-6">
        {entries.map((entry) => {
          const config = entryTypeConfig[entry.entry_type]
          return (
            <li key={entry.id} className="relative pl-10">
              {/* Dot on timeline */}
              <div className="absolute left-2.5 top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--background)]" />

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm" aria-hidden="true">{config.icon}</span>
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  <span className="ml-auto text-xs text-[var(--muted)]">
                    {formatDate(entry.created_at)}
                  </span>
                </div>

                {entry.content && (
                  <p className="mt-2 text-sm text-[var(--foreground)]/80 leading-relaxed">
                    {entry.content}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
