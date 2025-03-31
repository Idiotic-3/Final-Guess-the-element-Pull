import { createContext } from 'react'
import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  username: string
  created_at: string
  longest_streak?: number
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export interface AuthContextType {
  session: AuthState
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  session: { user: null, profile: null, loading: true },
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})
