import { supabase } from '../supabase'

export type ChatMessage = {
  message_id: string
  booking_id: string
  sender_id: string
  receiver_id: string | null
  message: string
  created_at: string
}

async function getChatContext(bookingId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      booking_id,
      customer_id,
      provider_id,
      customers(customer_id, user_id),
      service_providers(provider_id, user_id)
    `)
    .eq('booking_id', bookingId)
    .single()

  if (error) throw error
  if (!booking) throw new Error('Booking not found')

  const customerRecord = Array.isArray(booking.customers) ? booking.customers[0] : booking.customers
  const providerRecord = Array.isArray(booking.service_providers) ? booking.service_providers[0] : booking.service_providers
  const customerUserId = customerRecord?.user_id ?? null
  const providerUserId = providerRecord?.user_id ?? null
  const currentUserId = session.user.id

  if (currentUserId !== customerUserId && currentUserId !== providerUserId) {
    throw new Error('You do not have access to this chat')
  }

  return {
    currentUserId,
    receiverId: currentUserId === customerUserId ? providerUserId : customerUserId,
  }
}

export async function getChatMessages(bookingId: string) {
  await getChatContext(bookingId)

  const { data, error } = await supabase
    .from('chat_messages')
    .select('message_id, booking_id, sender_id, receiver_id, message, created_at')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function sendChatMessage(bookingId: string, message: string) {
  const { currentUserId, receiverId } = await getChatContext(bookingId)

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message,
    })

  if (error) throw error
}
