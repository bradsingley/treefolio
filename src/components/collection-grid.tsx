'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TreeCard } from '@/components/tree-card'
import type { TreeWithSpecies } from '@/lib/types'

interface CollectionGridProps {
  trees: TreeWithSpecies[]
}

const SIZE_OPTIONS = [
  { value: 'mame', label: 'Mame' },
  { value: 'shohin', label: 'Shohin' },
  { value: 'kifu', label: 'Kifu' },
  { value: 'chuhin', label: 'Chuhin' },
  { value: 'dai', label: 'Dai' },
]

export function CollectionGrid({ trees }: CollectionGridProps) {
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')

  // Derive unique species and styles from the actual data
  const speciesOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of trees) {
      if (t.species) map.set(t.species.id, t.species.common_name)
    }
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
  }, [trees])

  const styleOptions = useMemo(() => {
    const set = new Set<string>()
    for (const t of trees) {
      if (t.style) set.add(t.style)
    }
    return [...set].sort()
  }, [trees])

  // Filter logic
  const filtered = useMemo(() => {
    return trees.filter((tree) => {
      // Search by name
      if (search) {
        const q = search.toLowerCase()
        const nameMatch = tree.name.toLowerCase().includes(q)
        const speciesMatch = tree.species?.common_name.toLowerCase().includes(q) ||
          tree.species?.scientific_name.toLowerCase().includes(q)
        if (!nameMatch && !speciesMatch) return false
      }

      // Filter by species
      if (speciesFilter && tree.species_id !== speciesFilter) return false

      // Filter by style
      if (styleFilter && tree.style !== styleFilter) return false

      // Filter by size
      if (sizeFilter && tree.size_class !== sizeFilter) return false

      return true
    })
  }, [trees, search, speciesFilter, styleFilter, sizeFilter])

  const hasActiveFilters = search || speciesFilter || styleFilter || sizeFilter

  return (
    <div>
      {/* Search & Filters */}
      {trees.length > 0 && (
        <div className="mb-8 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or species…"
              className="field-input pl-9"
              aria-label="Search trees"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Species */}
            {speciesOptions.length > 1 && (
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors focus:border-[var(--accent)] focus:outline-none"
                aria-label="Filter by species"
              >
                <option value="">All species</option>
                {speciesOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            )}

            {/* Style */}
            {styleOptions.length > 1 && (
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors focus:border-[var(--accent)] focus:outline-none"
                aria-label="Filter by style"
              >
                <option value="">All styles</option>
                {styleOptions.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            )}

            {/* Size */}
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors focus:border-[var(--accent)] focus:outline-none"
              aria-label="Filter by size"
            >
              <option value="">All sizes</option>
              {SIZE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setSpeciesFilter(''); setStyleFilter(''); setSizeFilter('') }}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                <XIcon className="h-3 w-3" />
                Clear filters
              </button>
            )}

            {/* Result count */}
            {hasActiveFilters && (
              <span className="ml-auto text-xs text-[var(--muted)]">
                {filtered.length} of {trees.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="animate-stagger grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tree) => (
          <TreeCard key={tree.id} tree={tree} />
        ))}

        {/* Empty state for filters */}
        {filtered.length === 0 && trees.length > 0 && (
          <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">No trees match your filters</p>
            <button
              onClick={() => { setSearch(''); setSpeciesFilter(''); setStyleFilter(''); setSizeFilter('') }}
              className="mt-2 text-sm text-[var(--accent)] transition-colors hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* "Add Tree" card — always last when not filtering */}
        {!hasActiveFilters && (
          <Link
            href="/tree/new"
            className="group flex min-h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] p-8 transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:shadow-md"
          >
            <PlusIcon className="mb-3 h-8 w-8 text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--muted)] transition-colors group-hover:text-[var(--foreground)]">
              Add a tree
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
