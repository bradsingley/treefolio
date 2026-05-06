'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  counts: {
    mudbordBoards: number
    mudbordImages: number
    connectedBoards: number
    activeSessions: number
  }
}

export function AdminUserList({ users }: { users: UserRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const target = users.find((u) => u.id === confirmingId) ?? null

  function startDelete(user: UserRow) {
    setConfirmingId(user.id)
    setConfirmText('')
    setError(null)
  }

  function cancel() {
    setConfirmingId(null)
    setConfirmText('')
    setError(null)
  }

  async function confirmDelete() {
    if (!target) return
    if (confirmText !== target.email) {
      setError('Email does not match.')
      return
    }
    setError(null)
    const res = await fetch(`/api/admin/users/${target.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmEmail: confirmText }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => 'request_failed')
      setError(`Delete failed: ${text}`)
      return
    }
    setConfirmingId(null)
    setConfirmText('')
    startTransition(() => router.refresh())
  }

  if (users.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No users.</p>
  }

  return (
    <div className="space-y-3">
      {users.map((u) => {
        const total =
          u.counts.mudbordBoards +
          u.counts.mudbordImages +
          u.counts.connectedBoards
        return (
          <div
            key={u.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-heading text-lg font-semibold text-[var(--heading)]">
                    {u.name}
                  </h2>
                  {u.role === 'admin' && (
                    <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-xs font-medium text-[var(--heading)]">
                      admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)]">{u.email}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Joined {new Date(u.createdAt).toLocaleDateString()} ·{' '}
                  {u.counts.mudbordBoards} mudbord boards ·{' '}
                  {u.counts.mudbordImages} mudbord images ·{' '}
                  {u.counts.connectedBoards} connected boards ·{' '}
                  {u.counts.activeSessions} active session
                  {u.counts.activeSessions === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startDelete(u)}
                className="shrink-0 rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-700/40 dark:hover:bg-red-950/30"
              >
                Delete
              </button>
            </div>

            {confirmingId === u.id && (
              <div className="mt-4 rounded-lg border border-red-300/40 bg-red-50/50 p-3 dark:border-red-700/40 dark:bg-red-950/20">
                <p className="text-sm text-[var(--foreground)]">
                  This will permanently delete <strong>{u.email}</strong>. Their
                  mudbord/connected boards will be orphaned (still visible to
                  others, but with no owner). To confirm, type the user&apos;s
                  email below.
                </p>
                {total > 0 && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Will orphan: {u.counts.mudbordBoards} mudbord boards,{' '}
                    {u.counts.mudbordImages} mudbord images,{' '}
                    {u.counts.connectedBoards} connected boards.
                  </p>
                )}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={u.email}
                    autoComplete="off"
                    className="field-input flex-1"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancel}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={confirmText !== u.email}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Permanently delete
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="mt-2 text-xs text-red-600">{error}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
