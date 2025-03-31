import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  profile: any | null
  isLoading: boolean
}

export const AuthContext = createContext<{
  session: AuthState
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}>({
  session: { user: null, profile: null, isLoading: true },
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({
          user: session.user,
          profile: null,
          isLoading: true,
        })
        fetchProfile(session.user.id)
      } else {
        setSession({
          user: null,
          profile: null,
          isLoading: false,
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setSession({
            user: session.user,
            profile: null,
            isLoading: true,
          })
          await fetchProfile(session.user.id)
        } else {
          setSession({
            user: null,
            profile: null,
            isLoading: false,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      setSession(s => ({ ...s, isLoading: false }))
      return
    }

    setSession(s => ({
      ...s,
      profile: data,
      isLoading: false,
    }))
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          created_at: new Date().toISOString(),
        })

      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}
