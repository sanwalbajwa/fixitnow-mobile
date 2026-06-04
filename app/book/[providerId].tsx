import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Calendar, Clock, FileText, MapPin } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createBooking } from '@/lib/actions/bookings'
import { Colors } from '@/constants/colors'

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM',
]

function dateLabel(dateStr: string) {
  if (!dateStr) return 'Select a date'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function BookingFormScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    providerId: string
    listingId: string
    title: string
    price: string
  }>()

  const providerId = params.providerId ?? ''
  const listingId = params.listingId ?? ''
  const title = params.title ? decodeURIComponent(params.title) : 'Service'
  const price = params.price ?? '0'

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [booking, setBooking] = useState(false)

  const nextDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return date.toISOString().split('T')[0]
  })

  async function handleBook() {
    if (!date) return Alert.alert('Required', 'Please select a date.')
    if (!time) return Alert.alert('Required', 'Please select a time slot.')
    if (!location.trim()) return Alert.alert('Required', 'Please enter your service address.')

    setBooking(true)
    try {
      await createBooking({
        provider_id: providerId,
        listing_id: listingId,
        description: description.trim(),
        service_date: date,
        service_time: time,
        service_location: location.trim(),
      })
      Alert.alert(
        'Booking Submitted',
        'Your booking request has been sent to the provider.',
        [{ text: 'OK', onPress: () => router.replace('/(customer)/bookings') }]
      )
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not create booking.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: Colors.slate100 }}
        >
          <ArrowLeft size={18} color={Colors.slate600} />
        </TouchableOpacity>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-black" numberOfLines={1}>Book Service</Text>
          <Text className="text-xs text-slate-400" numberOfLines={1}>{title}</Text>
        </View>
        <View className="shrink-0 rounded-xl px-3 py-1.5" style={{ backgroundColor: Colors.teal + '18' }}>
          <Text className="text-sm font-bold" style={{ color: Colors.teal }} numberOfLines={1}>
            PKR {Number(price).toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
        <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <View className="flex-row items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Calendar size={15} color={Colors.teal} />
            <Text className="text-sm font-semibold text-black">Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 8 }}>
            {nextDays.map((day) => {
              const selected = day === date
              const dayObj = new Date(day + 'T00:00:00')
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setDate(day)}
                  className="items-center rounded-2xl border px-3.5 py-3"
                  style={{
                    backgroundColor: selected ? Colors.teal : Colors.white,
                    borderColor: selected ? Colors.teal : Colors.slate200,
                    minWidth: 56,
                  }}
                >
                  <Text className="mb-1 text-xs font-semibold" style={{ color: selected ? Colors.white + 'cc' : Colors.slate400 }}>
                    {dayObj.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text className="text-base font-bold" style={{ color: selected ? Colors.white : Colors.black }}>
                    {dayObj.getDate()}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <View className="flex-row items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Clock size={15} color={Colors.teal} />
            <Text className="text-sm font-semibold text-black">Select Time</Text>
          </View>
          <View className="flex-row flex-wrap gap-2 p-3">
            {TIME_SLOTS.map((slot) => {
              const selected = slot === time
              return (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setTime(slot)}
                  className="rounded-xl border px-3.5 py-2"
                  style={{
                    backgroundColor: selected ? Colors.teal : Colors.white,
                    borderColor: selected ? Colors.teal : Colors.slate200,
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: selected ? Colors.white : Colors.slate600 }}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <View className="flex-row items-center gap-2 border-b border-slate-100 px-4 py-3">
            <MapPin size={15} color={Colors.teal} />
            <Text className="text-sm font-semibold text-black">Service Address</Text>
          </View>
          <View className="p-4">
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your full address..."
              multiline
              numberOfLines={3}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-black"
              placeholderTextColor={Colors.slate400}
              style={{ textAlignVertical: 'top', minHeight: 80 }}
            />
          </View>
        </View>

        <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <View className="flex-row items-center gap-2 border-b border-slate-100 px-4 py-3">
            <FileText size={15} color={Colors.teal} />
            <Text className="text-sm font-semibold text-black">Problem Description</Text>
            <Text className="ml-auto text-xs text-slate-400">Optional</Text>
          </View>
          <View className="p-4">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the issue or what you need done..."
              multiline
              numberOfLines={4}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-black"
              placeholderTextColor={Colors.slate400}
              style={{ textAlignVertical: 'top', minHeight: 96 }}
            />
          </View>
        </View>

        {date || time ? (
          <View className="gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Booking Summary</Text>
            {date ? (
              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm text-slate-500">Date</Text>
                <Text className="min-w-0 flex-1 text-right text-sm font-semibold text-black" numberOfLines={1}>
                  {dateLabel(date)}
                </Text>
              </View>
            ) : null}
            {time ? (
              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm text-slate-500">Time</Text>
                <Text className="text-sm font-semibold text-black">{time}</Text>
              </View>
            ) : null}
            <View className="mt-1 flex-row items-center justify-between gap-3 border-t border-slate-100 pt-2">
              <Text className="text-sm font-semibold text-black">Total</Text>
              <Text className="text-sm font-bold" style={{ color: Colors.teal }}>
                PKR {Number(price).toLocaleString()}
              </Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleBook}
          disabled={booking}
          className="h-13 items-center justify-center rounded-2xl"
          style={{ backgroundColor: booking ? Colors.slate200 : Colors.teal }}
        >
          {booking
            ? <ActivityIndicator color={Colors.white} />
            : <Text className="text-sm font-bold text-white">Confirm Booking</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
