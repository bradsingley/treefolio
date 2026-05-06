import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { API_BASE, PUBLIC_ORIGIN } from '@/lib/api-client'
import { AdminUserList } from './user-list'

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

async function getUsers(cookieHeader: string): Promise<UserRow[] | { error: string; status: number }> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Cookie: cookieHeader, Origin: PUBLIC_ORIGIN },
    cache: 'no-store',
  })
  if (!res.ok) {
    return { error: await res.text().catch(() => 'request_failed'), status: res.status }
  }
  const data = await res.json()
  return data.users as UserRow[]
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .filter((c) => c.name.includes('lab.session') || c.name.includes('lab.csrf'))
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  if (!cookieHeader) redirect('/login')

  const result = await getUsers(cookieHeader)

  if ('error' in result) {
    if (result.status === 401) redirect('/login')
    if (result.status === 403) {
      return (
        <div className="mx-auto max-w-2xl py-16 text-center">
          <h1 className="font-heading text-2xl font-semibold text-[var(--heading)]">Admin only</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Your account doesn&apos;t have admin access.
          </p>
        </div>
      )
    }
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-[var(--heading)]">Admin</h1>
        <p className="mt-3 text-sm text-red-600">Failed to load users: {result.error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">Users</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage all accounts across mudbord, connected, and treefolio.
        </p>
      </header>
      <AdminUserList users={result} />
    </div>
  )
}
