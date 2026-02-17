import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Simple client for non-auth operations (API routes, etc.) */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export the auth-aware clients
export { createClient as createServerClient } from './supabase-server'
export { createClient as createBrowserClient } from './supabase-browser'
