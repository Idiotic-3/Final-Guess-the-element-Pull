import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type GameHistory = {
  id: string
  user_id: string
  score: number
  total_questions: number
  created_at: string
}

export type Profile = {
  id: string
  username: string
  avatar_url?: string
  created_at: string
}
