import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTreeById } from '@/lib/queries'
import { currentAge } from '@/lib/types'
import { PhotosSection } from '@/components/photos-section'
import { JournalSection } from '@/components/journal-section'
import { CareCalendarSection } from '@/components/care-calendar-section'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TreeDetailPage({ params }: Props) {
  const { id } = await params
  const tree = await getTreeById(id)

  if (!tree) notFound()

  const heroImage = tree.images?.find((img) => img.id === tree.thumbnail_image_id) ?? tree.images?.[0]
  const treeAge = currentAge(tree.age_years, tree.acquired_date)

  return (
    <div className="animate-fade-in">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Collection
        </Link>
        <Link
          href={`/tree/${id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          <EditIcon className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      {/* Hero section */}
      <div className="mb-10 grid gap-6 lg:gap-8 lg:grid-cols-[1fr_320px]">
        {/* Hero image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {heroImage ? (
            <img
              src={heroImage.url}
              alt={heroImage.caption ?? tree.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <TreePlaceholderIcon className="h-16 w-16 text-[var(--muted)]" />
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">
              {tree.name}
            </h1>
            {tree.species && (
              <p className="mt-1 text-sm italic text-[var(--muted)]">
                {tree.species.scientific_name}
                <span className="ml-2 not-italic">· {tree.species.common_name}</span>
              </p>
            )}
          </div>

          {tree.description && (
            <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
              {tree.description}
            </p>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {treeAge != null && (
              <MetaField label="Age" value={`${treeAge} year${treeAge !== 1 ? 's' : ''}`} />
            )}
            {tree.style && <MetaField label="Style" value={tree.style} />}
            {tree.acquired_date && (
              <MetaField label="Acquired" value={formatDate(tree.acquired_date)} />
            )}
            {tree.source && <MetaField label="Source" value={tree.source} />}
            {tree.pot_type && <MetaField label="Pot" value={tree.pot_type} />}
            {tree.soil_mix && <MetaField label="Soil" value={tree.soil_mix} />}
            {tree.species?.difficulty && (
              <MetaField label="Difficulty" value={tree.species.difficulty} />
            )}
            {tree.species?.indoor_outdoor && (
              <MetaField label="Environment" value={tree.species.indoor_outdoor} />
            )}
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="grid gap-10 lg:gap-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          {/* Image gallery */}
          <section>
            <SectionHeading>Photos</SectionHeading>
            <PhotosSection
              treeId={id}
              treeName={tree.name}
              initialImages={tree.images ?? []}
              thumbnailId={tree.thumbnail_image_id}
            />
          </section>

          {/* Journal timeline */}
          <section>
            <SectionHeading>Journal</SectionHeading>
            <JournalSection
              treeId={id}
              initialEntries={tree.journal ?? []}
            />
          </section>
        </div>

        {/* Sidebar — care calendar */}
        <aside>
          <SectionHeading>Care Calendar</SectionHeading>
          {tree.species ? (
            <CareCalendarSection species={tree.species} />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)]">
              <p className="text-sm text-[var(--muted)]">No species assigned</p>
            </div>
          )}

          {/* Species notes */}
          {tree.species?.notes && (
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Species Notes</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/80">
                {tree.species.notes}
              </p>
            </div>
          )}

          {/* Watering & light */}
          {tree.species && (tree.species.watering || tree.species.light) && (
            <div className="mt-4 space-y-3">
              {tree.species.watering && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Watering</h3>
                  <p className="mt-1 text-sm text-[var(--foreground)]/80">{tree.species.watering}</p>
                </div>
              )}
              {tree.species.light && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Light</h3>
                  <p className="mt-1 text-sm text-[var(--foreground)]/80">{tree.species.light}</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-heading text-xl font-semibold text-[var(--heading)]">
      {children}
    </h2>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <dl>
      <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 capitalize text-[var(--foreground)]">{value}</dd>
    </dl>
  )
}

function formatDate(dateStr: string): string {
  // Dates stored as YYYY-MM; append -01 so Date can parse
  const d = dateStr.length === 7 ? new Date(dateStr + '-01') : new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function TreePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22V8" />
      <path d="M5 12s1-6 7-10c6 4 7 10 7 10" />
      <path d="M7 16s1-4 5-7c4 3 5 7 5 7" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}
