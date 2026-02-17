import { getTrees } from '@/lib/queries'
import { CollectionGrid } from '@/components/collection-grid'

export default async function Home() {
  const trees = await getTrees()

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">
          Your Collection
        </h1>
        {trees.length === 0 ? (
          <p className="mt-2 text-[var(--muted)]">
            No trees yet. Add your first bonsai to get started.
          </p>
        ) : (
          <p className="mt-2 text-[var(--muted)]">
            {trees.length} tree{trees.length !== 1 ? 's' : ''} in your collection
          </p>
        )}
      </header>

      <CollectionGrid trees={trees} />
    </div>
  )
}
