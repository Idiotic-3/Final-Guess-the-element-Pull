import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthContext, AuthState, Profile } from '@/lib/auth-context'
import { User } from '@supabase/supabase-js'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(s => ({ ...s, user: session.user }))
        getProfile(session.user.id)
      } else {
        setSession(s => ({ ...s, loading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(s => ({ ...s, user: session.user }))
        getProfile(session.user.id)
      } else {
        setSession({
          user: null,
          profile: null,
          loading: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getProfile = async (userId: string) => {
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
    // First create the auth user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) throw signUpError
    if (!user) throw new Error('No user returned after signup')

    try {
      // Then create their profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username,
        created_at: new Date().toISOString(),
        longest_streak: 0,
      })

      if (profileError) throw profileError
    } catch (error) {
      // If profile creation fails, delete the auth user to maintain consistency
      await supabase.auth.admin.deleteUser(user.id)
      throw error
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
