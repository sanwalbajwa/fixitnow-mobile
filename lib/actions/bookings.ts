import { supabase } from '../supabase'

export async function getCustomerBookings() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []

  const { data: customer } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('user_id', session.user.id)
    .single()

  if (!customer) return []

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service_listings(title, price, category_id, service_categories(category_name)),
      service_providers(provider_id, users(name, email)),
      payments(status),
      ratings(rating, review)
    `)
    .eq('customer_id', customer.customer_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProviderBookings() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []

  const { data: provider } = await supabase
    .from('service_providers')
    .select('provider_id')
    .eq('user_id', session.user.id)
    .single()

  if (!provider) return []

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service_listings(title, price, service_categories(category_name)),
      customers(customer_id, users(name, email, phone))
    `)
    .eq('provider_id', provider.provider_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('booking_id', bookingId)
  if (error) throw error
}

export async function createBooking(payload: {
  provider_id:      string
  listing_id:       string
  description:      string
  service_date:     string
  service_time:     string
  service_location: string
}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { data: customer } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('user_id', session.user.id)
    .single()

  if (!customer) throw new Error('Customer profile not found')

  const notePrefix = [
    payload.service_time ? `[Time] ${payload.service_time}` : null,
    payload.service_location ? `[Location] ${payload.service_location}` : null,
  ].filter(Boolean).join('\n')

  const notes = [notePrefix, payload.description ? `[Details] ${payload.description}` : null]
    .filter(Boolean)
    .join('\n\n')

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_id:      customer.customer_id,
      provider_id:      payload.provider_id,
      listing_id:       payload.listing_id,
      description:      payload.description,
      service_date:     payload.service_date,
      notes:            notes || null,
      status:           'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function submitRating(bookingId: string, rating: number, review: string) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { data: customer } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('user_id', session.user.id)
    .single()

  if (!customer) throw new Error('Customer profile not found')

  const { data: booking } = await supabase
    .from('bookings')
    .select('booking_id, customer_id, provider_id, status')
    .eq('booking_id', bookingId)
    .eq('customer_id', customer.customer_id)
    .single()

  if (!booking) throw new Error('Booking not found')
  if (booking.status !== 'completed') throw new Error('Only completed bookings can be rated')

  const { error } = await supabase.from('ratings').insert({
    booking_id:   booking.booking_id,
    customer_id:  customer.customer_id,
    provider_id:  booking.provider_id,
    rating,
    review:       review || null,
  })
  if (error) throw error

  const { data: providerRatings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('provider_id', booking.provider_id)

  const ratings = providerRatings ?? []
  const totalReviews = ratings.length
  const avgRating = totalReviews > 0
    ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / totalReviews
    : 0

  await supabase
    .from('service_providers')
    .update({ rating: Number(avgRating.toFixed(2)), total_reviews: totalReviews })
    .eq('provider_id', booking.provider_id)
}
