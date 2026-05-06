// Fetch-based client for lab-api (replaces Supabase JS SDK).
//
// The API returns camelCase keys; the frontend types expect snake_case.
// We convert automatically so existing components don't need changes.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bradsingley.com'

/**
 * Origin header to send on server-side requests to the API. The API uses
 * better-auth, which validates the Origin against `trustedOrigins`. When the
 * Next.js server makes a request, fetch doesn't include an Origin header by
 * default, which better-auth rejects with "Missing or null Origin".
 *
 * In production on Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is the canonical
 * domain (e.g. `treefolio.vercel.app`). Locally / for preview deployments we
 * fall back to the public URL env var, then to a hardcoded production URL.
 */
const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://treefolio.vercel.app')

export { API_BASE, PUBLIC_ORIGIN }

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function convertKeys<T>(obj: unknown, fn: (s: string) => string): T {
  if (Array.isArray(obj)) return obj.map((v) => convertKeys(v, fn)) as T
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [fn(k), convertKeys(v, fn)]),
    ) as T
  }
  return obj as T
}

export function toSnake<T>(obj: unknown): T {
  return convertKeys<T>(obj, camelToSnake)
}

export function toCamel<T>(obj: unknown): T {
  return convertKeys<T>(obj, snakeToCamel)
}

type FetchOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  cookie?: string // For server-side calls (pass request cookies)
}

export async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`
  const headers: Record<string, string> = {
    Origin: PUBLIC_ORIGIN,
    ...(opts.headers ?? {}),
  }
  if (opts.body) headers['Content-Type'] = 'application/json'
  if (opts.cookie) headers['Cookie'] = opts.cookie

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(toCamel(opts.body)) : undefined,
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text}`)
  }

  if (res.status === 204) return undefined as T

  const json = await res.json()
  return toSnake<T>(json)
}

/** Get the cookie header string for server-side API calls */
export async function getServerCookies(): Promise<string> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
}
