'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { API_BASE, PUBLIC_ORIGIN } from './api-client'

async function authFetch(path: string, body: Record<string, string>) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ')

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
      // better-auth requires a trusted Origin header. Server-side fetch
      // doesn't set one by default, so we send our public URL.
      Origin: PUBLIC_ORIGIN,
    },
    body: JSON.stringify(body),
    credentials: 'include',
  })

  // Forward Set-Cookie headers from the API to the browser. We deliberately
  // STRIP the `Domain=` attribute: the API sets cookies for `.bradsingley.com`
  // so they're shared across mudbord/connected, but treefolio runs at
  // `treefolio.vercel.app`. The browser will reject a Set-Cookie with a
  // `Domain=` that's not a parent of the responding host — so we let it
  // become a host-only cookie on `treefolio.vercel.app`. The Next.js server
  // can still forward the cookie to api.bradsingley.com via the Cookie
  // header (where the domain attribute is irrelevant).
  const setCookies = res.headers.getSetCookie()
  for (const sc of setCookies) {
    const [nameVal, ...parts] = sc.split(';')
    const [name, ...valParts] = nameVal.split('=')
    const value = valParts.join('=')
    const options: Record<string, unknown> = {}
    for (const part of parts) {
      const trimmed = part.trim().toLowerCase()
      if (trimmed === 'httponly') options.httpOnly = true
      else if (trimmed === 'secure') options.secure = true
      else if (trimmed.startsWith('path=')) options.path = trimmed.slice(5)
      // Intentionally drop domain= so the cookie is host-only here.
      else if (trimmed.startsWith('max-age=')) options.maxAge = parseInt(trimmed.slice(8))
      else if (trimmed.startsWith('samesite=')) options.sameSite = trimmed.slice(9) as 'lax' | 'strict' | 'none'
    }
    cookieStore.set(name.trim(), value, options)
  }

  return res
}

export async function loginAction(formData: FormData) {
  const res = await authFetch('/auth/sign-in/email', {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Login failed' }))
    redirect('/login?error=' + encodeURIComponent(data.message ?? 'Login failed'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signupAction(formData: FormData) {
  const res = await authFetch('/auth/sign-up/email', {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: (formData.get('name') as string) || (formData.get('email') as string).split('@')[0],
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Signup failed' }))
    redirect('/signup?error=' + encodeURIComponent(data.message ?? 'Signup failed'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ')

  await fetch(`${API_BASE}/auth/sign-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
      Origin: PUBLIC_ORIGIN,
    },
    body: '{}',
    credentials: 'include',
  })

  // Clear the better-auth cookies on this host. The Set-Cookie response from
  // the API targets `Domain=.bradsingley.com` which the browser won't accept
  // on `treefolio.vercel.app`, so we expire the host-only copies ourselves.
  for (const c of cookieStore.getAll()) {
    if (c.name.includes('lab.session') || c.name.includes('lab.csrf')) {
      cookieStore.set(c.name, '', { maxAge: 0, path: '/' })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
