import { createContext } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from './supabase'

export type AuthState = {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export type AuthContextType = {
  session: AuthState
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  session: { user: null, profile: null, loading: true },
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})
