import { supabase } from '../supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: 'customer' | 'provider'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  })
  if (error) throw error

  if (data.user && data.session) {
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        user_id: data.user.id,
        email,
        name,
        role,
      }, { onConflict: 'user_id' })

    if (profileError) throw profileError

    if (role === 'customer') {
      const { data: existingCustomer, error: customerLookupError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (customerLookupError) throw customerLookupError

      if (!existingCustomer) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert({ user_id: data.user.id })

        if (customerError) throw customerError
      }
    }

    if (role === 'provider') {
      const { data: existingProvider, error: providerLookupError } = await supabase
        .from('service_providers')
        .select('provider_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (providerLookupError) throw providerLookupError

      if (!existingProvider) {
        const { error: providerError } = await supabase
          .from('service_providers')
          .insert({ user_id: data.user.id, is_verified: false })

        if (providerError) throw providerError
      }
    }
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabase
    .from('users')
    .select('name, role, phone')
    .eq('user_id', session.user.id)
    .single()

  return {
    id:    session.user.id,
    email: session.user.email ?? '',
    name:  profile?.name  ?? session.user.user_metadata?.name  ?? '',
    role:  profile?.role  ?? session.user.user_metadata?.role  ?? 'customer',
    phone: profile?.phone ?? '',
  }
}
