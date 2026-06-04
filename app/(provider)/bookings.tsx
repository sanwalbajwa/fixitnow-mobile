import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MessageCircle, CheckCircle2, XCircle, PlayCircle } from 'lucide-react-native'
import { getProviderBookings, updateBookingStatus } from '@/lib/actions/bookings'
import { Colors } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

const STATUS_COLOR: Record<string, string> = {
  pending:     Colors.coral,
  confirmed:   Colors.teal,
  in_progress: '#8b5cf6',
  completed:   Colors.emerald,
  cancelled:   Colors.rose,
}

export default function ProviderBookingsScreen() {
  const router = useRouter()
  const [bookings,   setBookings]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await getProviderBookings()
    setBookings(data)
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function changeStatus(bookingId: string, status: string, label: string) {
    Alert.alert('Confirm', `Mark this booking as "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await updateBookingStatus(bookingId, status)
            await load()
          } catch {
            Alert.alert('Error', 'Could not update status.')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <Text className="text-2xl font-bold text-black">Bookings</Text>
        <Text className="text-slate-500 text-sm mt-0.5">
          {bookings.filter(b => b.status === 'pending').length} pending action
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
            const color = STATUS_COLOR[b.status] ?? Colors.slate400
            return (
              <View className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <View className="h-1" style={{ backgroundColor: color }} />
                <View className="p-4 gap-3">
                  {/* Title + status */}
                  <View className="flex-row items-start justify-between gap-2">
                    <Text className="font-semibold text-black flex-1" numberOfLines={1}>
                      {b.service_listings?.title ?? 'Booking'}
                    </Text>
                    <View className="shrink-0 rounded-full px-2.5 py-0.5 border" style={{ borderColor: color + '40', backgroundColor: color + '15' }}>
                      <Text className="text-xs font-semibold capitalize" style={{ color }}>{b.status.replace('_', ' ')}</Text>
                    </View>
                  </View>

                  {/* Customer info */}
                  <Text className="text-xs text-slate-500" numberOfLines={1}>
                    Customer: {b.customers?.users?.name ?? 'Unknown'}
                  </Text>

                  {b.description && (
                    <Text className="text-xs text-slate-400" numberOfLines={2}>{b.description}</Text>
                  )}

                  {/* Action buttons */}
                  <View className="flex-row gap-2 flex-wrap">
                    {b.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          onPress={() => changeStatus(b.booking_id, 'confirmed', 'Confirmed')}
                          className="flex-1 h-9 flex-row items-center justify-center gap-1.5 rounded-xl"
                          style={{ backgroundColor: Colors.teal }}
                        >
                          <CheckCircle2 size={14} color={Colors.white} />
                          <Text className="text-xs font-bold text-white">Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => changeStatus(b.booking_id, 'cancelled', 'Cancelled')}
                          className="flex-1 h-9 flex-row items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50"
                        >
                          <XCircle size={14} color={Colors.rose} />
                          <Text className="text-xs font-bold" style={{ color: Colors.rose }}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {b.status === 'confirmed' && (
                      <TouchableOpacity
                        onPress={() => changeStatus(b.booking_id, 'in_progress', 'In Progress')}
                        className="flex-1 h-9 flex-row items-center justify-center gap-1.5 rounded-xl"
                        style={{ backgroundColor: '#8b5cf6' }}
                      >
                        <PlayCircle size={14} color={Colors.white} />
                        <Text className="text-xs font-bold text-white">Start Job</Text>
                      </TouchableOpacity>
                    )}

                    {b.status === 'in_progress' && (
                      <TouchableOpacity
                        onPress={() => changeStatus(b.booking_id, 'completed', 'Completed')}
                        className="flex-1 h-9 flex-row items-center justify-center gap-1.5 rounded-xl"
                        style={{ backgroundColor: Colors.emerald }}
                      >
                        <CheckCircle2 size={14} color={Colors.white} />
                        <Text className="text-xs font-bold text-white">Mark Complete</Text>
                      </TouchableOpacity>
                    )}

                    {['confirmed', 'in_progress'].includes(b.status) && (
                      <TouchableOpacity
                        onPress={() => router.push(`/chat/${b.booking_id}`)}
                        className="flex-1 h-9 flex-row items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <MessageCircle size={14} color={Colors.teal} />
                        <Text className="text-xs font-bold" style={{ color: Colors.teal }}>Chat</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
