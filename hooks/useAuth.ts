import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type AuthUser = {
  id:    string
  email: string
  name:  string
  role:  string
  phone: string
} | null

export function useAuth() {
  const [user,    setUser]    = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)

  async function loadUser(userId: string, email: string, metadata: Record<string, string>) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, role, phone')
      .eq('user_id', userId)
      .single()

    setUser({
      id:    userId,
      email,
      name:  profile?.name  ?? metadata?.name  ?? '',
      role:  profile?.role  ?? metadata?.role  ?? 'customer',
      phone: profile?.phone ?? '',
    })
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await loadUser(session.user.id, session.user.email ?? '', session.user.user_metadata)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadUser(session.user.id, session.user.email ?? '', session.user.user_metadata)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
