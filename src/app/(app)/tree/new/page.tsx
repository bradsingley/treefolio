import Link from 'next/link'
import { getSpecies } from '@/lib/queries'
import { createTreeAction } from '@/lib/actions'
import { TreeForm } from '@/components/tree-form'

export default async function NewTreePage() {
  const species = await getSpecies()

  return (
    <div className="animate-fade-in">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Collection
      </Link>

      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">
          Add a Tree
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Tell us about your new bonsai.
        </p>
      </header>

      <div className="max-w-xl">
        <TreeForm species={species} action={createTreeAction} />
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
