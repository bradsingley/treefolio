import Link from 'next/link'
import { currentAge } from '@/lib/types'
import type { TreeWithSpecies } from '@/lib/types'

interface TreeCardProps {
  tree: TreeWithSpecies
}

export function TreeCard({ tree }: TreeCardProps) {
  const heroImage = tree.images?.find((img) => img.id === tree.thumbnail_image_id) ?? tree.images?.[0]
  const displayAge = currentAge(tree.age_years, tree.acquired_date)

  return (
    <Link
      href={`/tree/${tree.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--accent)]"
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--border)]">
        {heroImage ? (
          <img
            src={heroImage.url}
            alt={heroImage.caption ?? tree.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <TreePlaceholderIcon className="h-12 w-12 text-[var(--muted)]" />
          </div>
        )}

        {/* Species badge */}
        {tree.species && (
          <span className="absolute bottom-2 left-2 rounded-md bg-[var(--background)]/80 px-2 py-0.5 text-xs text-[var(--muted)] backdrop-blur-sm">
            {tree.species.common_name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-heading text-lg font-semibold text-[var(--heading)] transition-colors group-hover:text-[var(--accent)]">
          {tree.name}
        </h3>

        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          {displayAge != null && (
            <span>{displayAge} yr{displayAge !== 1 ? 's' : ''}</span>
          )}
          {tree.style && <span className="capitalize">{tree.style}</span>}
        </div>

        {tree.description && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)]/70">
            {tree.description}
          </p>
        )}
      </div>
    </Link>
  )
}

function TreePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22V8" />
      <path d="M5 12s1-6 7-10c6 4 7 10 7 10" />
      <path d="M7 16s1-4 5-7c4 3 5 7 5 7" />
    </svg>
  )
}
