import Link from 'next/link'
import { signupAction } from '@/lib/auth-actions'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <LeafIcon className="mx-auto mb-3 h-10 w-10 text-[var(--accent)]" />
          <h1 className="font-heading text-2xl font-semibold text-[var(--heading)]">
            Treefolio
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Create an account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={signupAction} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted)]">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="field-input"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted)]">Password</span>
            <input
              name="password"
              type="password"
              required
              placeholder="At least 6 characters"
              className="field-input"
              autoComplete="new-password"
              minLength={6}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C6.5 2 2 6.5 2 12c0 5 4 8 10 10 0-6 0-10 0-10S20 6 12 2Z" />
      <path d="M12 22c0-6 0-10 0-10" />
    </svg>
  )
}
