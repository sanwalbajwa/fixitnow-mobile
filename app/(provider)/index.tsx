import { useEffect, useState } from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import { ClipboardList, CheckCircle2, Clock, TrendingUp, Users, Wrench } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { getProviderBookings } from '@/lib/actions/bookings'
import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BrandStats, SectionHeader } from '@/components/brand/Branded'

export default function ProviderDashboard() {
  const { user } = useAuth()
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

  const pending   = bookings.filter(b => b.status === 'pending').length
  const active    = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length
  const completed = bookings.filter(b => b.status === 'completed').length

  const stats = [
    { label: 'Pending',   value: pending,   color: Colors.coral,   icon: <Clock size={18} color={Colors.coral} /> },
    { label: 'Active',    value: active,    color: Colors.teal,    icon: <TrendingUp size={18} color={Colors.teal} /> },
    { label: 'Completed', value: completed, color: Colors.emerald, icon: <CheckCircle2 size={18} color={Colors.emerald} /> },
  ]

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 104 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
      >
        <View className="bg-slate-950 px-5 pb-6 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
                For Professionals
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Wrench size={20} color={Colors.coral} />
            </View>
          </View>

          <Text className="text-sm text-slate-400" numberOfLines={1}>
            Welcome back, {user?.name ?? 'Provider'}
          </Text>
          <Text className="mt-2 text-4xl font-bold leading-tight text-white">
            Grow your business with <Text style={{ color: Colors.teal }}>FixItNow.</Text>
          </Text>
          <Text className="mt-3 text-base leading-6 text-slate-400">
            Track bookings, manage services, and stay ready for customers looking for your expertise.
          </Text>

          <View className="mt-5">
            <BrandStats dark />
          </View>
        </View>

        <View className="p-4 gap-4">
          <View className="flex-row gap-3">
            {stats.map((s) => (
              <View key={s.label} className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 items-center gap-2 shadow-sm">
                {s.icon}
                <Text className="text-2xl font-bold text-black">{s.value}</Text>
                <Text className="text-xs text-slate-400">{s.label}</Text>
              </View>
            ))}
          </View>

          <View className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <SectionHeader
              eyebrow="Provider flow"
              title="Set schedule. Win jobs. Get paid."
              subtitle="The mobile dashboard mirrors the marketplace promise: simple controls, clear status, and fast follow-up."
            />
            <View className="mt-5 gap-3">
              {[
                { n: '01', title: 'Set your own schedule', desc: 'Accept jobs when you want, with clear status at a glance.' },
                { n: '02', title: 'Grow your client base', desc: 'Stay visible to customers searching for your skill.' },
                { n: '03', title: 'Fast, secure payouts', desc: 'Complete bookings and keep payment status visible.' },
              ].map((item) => (
                <View key={item.n} className="flex-row items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <Text className="text-4xl font-bold leading-none text-slate-200">{item.n}</Text>
                  <View className="min-w-0 flex-1">
                    <Text className="font-semibold text-black">{item.title}</Text>
                    <Text className="mt-1 text-sm leading-5 text-slate-500">{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <View className="px-4 py-3 border-b border-slate-100 flex-row items-center gap-2">
              <ClipboardList size={16} color={Colors.teal} />
              <Text className="font-semibold text-black">Recent Bookings</Text>
            </View>

            {loading ? (
              <View className="py-10 items-center">
                <ActivityIndicator color={Colors.teal} />
              </View>
            ) : bookings.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-slate-400 text-sm">No bookings yet.</Text>
              </View>
            ) : (
              bookings.slice(0, 5).map((b) => (
                <View key={b.booking_id} className="px-4 py-3 border-b border-slate-50 flex-row items-center justify-between">
                  <View className="flex-1 min-w-0">
                    <Text className="font-medium text-black text-sm" numberOfLines={1}>
                      {b.service_listings?.title ?? 'Booking'}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {b.customers?.users?.name ?? 'Customer'}
                    </Text>
                  </View>
                  <View
                    className="ml-2 shrink-0 rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: (Colors as any)[b.status === 'completed' ? 'emerald' : b.status === 'pending' ? 'coral' : 'teal'] + '18' }}
                  >
                    <Text className="text-xs font-semibold capitalize" style={{ color: b.status === 'completed' ? Colors.emerald : b.status === 'pending' ? Colors.coral : Colors.teal }}>
                      {b.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(provider)/services')}
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-coral"
          >
            <Users size={17} color={Colors.white} />
            <Text className="text-sm font-bold text-white">Manage service listings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
