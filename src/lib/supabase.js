import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[ten-a-day] Missing Supabase env vars. Copy .env.example → .env and fill in your keys.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
