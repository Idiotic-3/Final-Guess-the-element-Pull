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
    console.log('Starting signup process...')
    
    try {
      // First create the auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username // Store username in auth metadata
          }
        }
      })

      if (signUpError) {
        console.error('Signup error:', signUpError)
        throw signUpError
      }

      if (!data.user) {
        console.error('No user returned after signup')
        throw new Error('No user returned after signup')
      }

      console.log('Auth user created, creating profile...')

      // Then create their profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          created_at: new Date().toISOString(),
          longest_streak: 0
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(data.user.id)
        throw profileError
      }

      console.log('Profile created successfully')
    } catch (error) {
      console.error('Signup process error:', error)
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
