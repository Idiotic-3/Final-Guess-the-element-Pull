import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { AuthContext, AuthState } from '@/lib/auth'
import { Profile, supabase } from '@/lib/supabase'
import { useToast } from './ui/use-toast'

const REDIRECT_URL = process.env.NODE_ENV === 'production' 
  ? 'https://finalguesstheelement.vercel.app/auth/callback'
  : `${window.location.origin}/auth/callback`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setSession({ user: null, profile: null, loading: false })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchProfile(session.user)
        } else {
          setSession({ user: null, profile: null, loading: false })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setSession({
        user,
        profile: data,
        loading: false,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setSession({
        user,
        profile: null,
        loading: false,
      })
    }
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
      // Create profile and initialize user data
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          created_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      // Initialize user streaks
      const { error: streakError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          last_game_date: new Date().toISOString(),
        })

      if (streakError) throw streakError
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
