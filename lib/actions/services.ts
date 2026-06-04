import { supabase } from '../supabase'

export async function getServiceListings(filters?: {
  category?: string
  search?:   string
}) {
  let query = supabase
    .from('service_listings')
    .select(`
      *,
      service_providers(
        provider_id, is_verified, rating, availability,
        users(name, email)
      ),
      service_categories(category_id, category_name)
    `)
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category_id', filters.category)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getProviderDetail(providerId: string) {
  const { data, error } = await supabase
    .from('service_providers')
    .select(`
      *,
      users(name, email, phone),
      service_listings(
        *,
        service_categories(category_id, category_name)
      )
    `)
    .eq('provider_id', providerId)
    .single()
  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('category_name')
  if (error) throw error
  return data ?? []
}

export async function getProviderServices() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []

  const { data: provider } = await supabase
    .from('service_providers')
    .select('provider_id')
    .eq('user_id', session.user.id)
    .single()

  if (!provider) return []

  const { data, error } = await supabase
    .from('service_listings')
    .select('*, service_categories(category_id, category_name)')
    .eq('provider_id', provider.provider_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createService(payload: {
  category_id:  string
  title:        string
  description:  string
  price:        number
}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { data: provider } = await supabase
    .from('service_providers')
    .select('provider_id')
    .eq('user_id', session.user.id)
    .single()

  if (!provider) throw new Error('Provider profile not found')

  const { error } = await supabase.from('service_listings').insert({
    ...payload,
    provider_id: provider.provider_id,
  })
  if (error) throw error
}

export async function deleteService(listingId: string) {
  const { error } = await supabase
    .from('service_listings')
    .delete()
    .eq('listing_id', listingId)
  if (error) throw error
}
