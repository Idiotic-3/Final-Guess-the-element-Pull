import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtkxcbgnfhfhurakmjlb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10a3hjYmduZmhmaHVyYWttamxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMTYyNjYsImV4cCI6MjA1ODg5MjI2Nn0.RMAZF8TWT3_UmWwFkqN7SV9Nc06POacSLQb2hkahd-E'

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
