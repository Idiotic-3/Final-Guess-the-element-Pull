import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthContext, AuthState, Profile } from '@/lib/auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({
          user: session.user,
          profile: null,
          loading: true,
        })
        fetchProfile(session.user.id)
      } else {
        setSession({
          user: null,
          profile: null,
          loading: false,
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setSession({
            user: session.user,
            profile: null,
            loading: true,
          })
          await fetchProfile(session.user.id)
        } else {
          setSession({
            user: null,
            profile: null,
            loading: false,
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
      setSession(s => ({ ...s, loading: false }))
      return
    }

    setSession(s => ({
      ...s,
      profile: data as Profile,
      loading: false,
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

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
