import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTreeById, getSpecies } from '@/lib/queries'
import { updateTreeAction, deleteTreeAction } from '@/lib/actions'
import { TreeForm } from '@/components/tree-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTreePage({ params }: Props) {
  const { id } = await params
  const [tree, species] = await Promise.all([getTreeById(id), getSpecies()])

  if (!tree) notFound()

  const updateWithId = updateTreeAction.bind(null, id)
  const deleteWithId = deleteTreeAction.bind(null, id)

  return (
    <div className="animate-fade-in">
      <Link
        href={`/tree/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to {tree.name}
      </Link>

      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">
          Edit {tree.name}
        </h1>
      </header>

      <div className="max-w-xl">
        <TreeForm
          species={species}
          action={updateWithId}
          defaultValues={tree}
          submitLabel="Save Changes"
        />

        {/* Delete */}
        <div className="mt-12 border-t border-[var(--border)] pt-8">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Retiring a tree removes it from your collection view. This can be undone.
          </p>
          <form action={deleteWithId} className="mt-4">
            <button
              type="submit"
              className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400 dark:border-red-400/40 dark:hover:bg-red-500/15"
            >
              Retire Tree
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}
