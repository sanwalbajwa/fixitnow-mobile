import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MessageCircle, Star, CreditCard, CheckCircle2 } from 'lucide-react-native'
import { getCustomerBookings, submitRating } from '@/lib/actions/bookings'
import { Colors } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

const STATUS_COLOR: Record<string, string> = {
  pending:     Colors.amber,
  confirmed:   Colors.teal,
  in_progress: '#8b5cf6',
  completed:   Colors.emerald,
  cancelled:   Colors.rose,
}
const STATUS_LABEL: Record<string, string> = {
  pending:     'Pending',
  confirmed:   'Confirmed',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

export default function CustomerBookingsScreen() {
  const router = useRouter()
  const [bookings,   setBookings]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await getCustomerBookings()
    setBookings(data)
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function handleRate(bookingId: string) {
    Alert.prompt(
      'Rate this service',
      'Enter rating 1–5',
      async (ratingStr) => {
        const rating = Number(ratingStr)
        if (!rating || rating < 1 || rating > 5) {
          Alert.alert('Invalid', 'Please enter a number between 1 and 5.')
          return
        }
        try {
          await submitRating(bookingId, rating, '')
          await load()
        } catch {
          Alert.alert('Error', 'Could not submit rating.')
        }
      },
      'plain-text'
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <Text className="text-2xl font-bold text-black">My Bookings</Text>
        <Text className="text-slate-500 text-sm mt-0.5">
          {bookings.filter(b => !['completed','cancelled'].includes(b.status)).length} active
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.booking_id}
          contentContainerStyle={{ padding: 16, paddingBottom: 104, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-slate-400 text-sm">No bookings yet.</Text>
            </View>
          }
          renderItem={({ item: b }) => {
            const color    = STATUS_COLOR[b.status] ?? Colors.slate400
            const label    = STATUS_LABEL[b.status] ?? b.status
            const isPaid   = b.payments?.length > 0 && b.payments[0].status === 'paid'
            const hasRated = b.ratings?.length > 0

            return (
              <View className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <View className="h-1" style={{ backgroundColor: color }} />
                <View className="p-4 gap-3">
                  {/* Title + status */}
                  <View className="flex-row items-start justify-between gap-2">
                    <Text className="font-semibold text-black flex-1" numberOfLines={1}>
                      {b.service_listings?.title ?? 'Service booking'}
                    </Text>
                    <View className="shrink-0 rounded-full px-2.5 py-0.5 border" style={{ borderColor: color + '40', backgroundColor: color + '15' }}>
                      <Text className="text-xs font-semibold" style={{ color }}>{label}</Text>
                    </View>
                  </View>

                  {/* Provider + price */}
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="min-w-0 flex-1 text-xs text-slate-500" numberOfLines={1}>
                      {b.service_providers?.users?.name ?? 'Unknown provider'}
                    </Text>
                    <Text className="shrink-0 text-sm font-bold text-black">
                      PKR {Number(b.service_listings?.price ?? 0).toLocaleString()}
                    </Text>
                  </View>

                  {/* Chat button */}
                  {['confirmed', 'in_progress'].includes(b.status) && (
                    <TouchableOpacity
                      onPress={() => router.push(`/chat/${b.booking_id}`)}
                      className="flex-row items-center justify-center gap-2 h-10 rounded-xl"
                      style={{ backgroundColor: Colors.teal }}
                    >
                      <MessageCircle size={16} color={Colors.white} />
                      <Text className="text-sm font-semibold text-white">Chat with Provider</Text>
                    </TouchableOpacity>
                  )}

                  {/* Rate button */}
                  {b.status === 'completed' && !hasRated && (
                    <TouchableOpacity
                      onPress={() => handleRate(b.booking_id)}
                      className="flex-row items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <Star size={16} color={Colors.amber} />
                      <Text className="text-sm font-semibold text-black">Rate Service</Text>
                    </TouchableOpacity>
                  )}

                  {/* Rated */}
                  {hasRated && (
                    <View className="flex-row items-center gap-1.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={14} color={Colors.amber} fill={i < b.ratings[0].rating ? Colors.amber : 'transparent'} />
                      ))}
                      <Text className="text-xs text-slate-500 ml-1">{b.ratings[0].rating}/5</Text>
                    </View>
                  )}

                  {/* Payment */}
                  {b.status === 'completed' && isPaid && (
                    <View className="flex-row items-center gap-2">
                      <CheckCircle2 size={14} color={Colors.emerald} />
                      <Text className="text-xs font-medium" style={{ color: Colors.emerald }}>Payment confirmed</Text>
                    </View>
                  )}
                  {b.status === 'completed' && !isPaid && (
                    <View className="flex-row items-center gap-2">
                      <CreditCard size={14} color={Colors.coral} />
                      <Text className="text-xs font-medium" style={{ color: Colors.coral }}>Payment pending</Text>
                    </View>
                  )}
                </View>
              </View>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
