import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Star, Phone, BadgeCheck, Calendar } from 'lucide-react-native'
import { getProviderDetail } from '@/lib/actions/services'
import { Colors } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')
}

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router  = useRouter()
  const [provider, setProvider] = useState<any>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (id) {
      getProviderDetail(id).then(data => {
        setProvider(data)
        setLoading(false)
      })
    }
  }, [id])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator color={Colors.teal} size="large" />
      </SafeAreaView>
    )
  }

  if (!provider) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-slate-400 text-center">Provider not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-sm font-semibold" style={{ color: Colors.teal }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const name       = provider.users?.name ?? 'Provider'
  const phone      = provider.users?.phone ?? ''
  const rating     = Number(provider.rating ?? 0).toFixed(1)
  const skills     = provider.skills ?? ''
  const listings: any[] = provider.service_listings ?? []
  const isVerified = provider.is_verified

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Back button */}
      <View className="bg-white px-4 py-3 flex-row items-center gap-3 border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-9 w-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: Colors.slate100 }}
        >
          <ArrowLeft size={18} color={Colors.slate600} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-black flex-1" numberOfLines={1}>{name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Profile card */}
        <View className="rounded-2xl bg-white border border-slate-200 p-5 items-center shadow-sm gap-3">
          <View
            className="h-20 w-20 rounded-2xl items-center justify-center"
            style={{ backgroundColor: Colors.teal }}
          >
            <Text className="text-3xl font-bold text-white">{initials(name)}</Text>
          </View>

          <View className="items-center gap-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xl font-bold text-black">{name}</Text>
              {isVerified && <BadgeCheck size={18} color={Colors.teal} />}
            </View>

            {phone ? (
              <View className="flex-row items-center gap-1">
                <Phone size={12} color={Colors.slate400} />
                <Text className="text-sm text-slate-500">{phone}</Text>
              </View>
            ) : null}
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: Colors.amber + '20' }}>
            <Star size={14} color={Colors.amber} fill={Colors.amber} />
            <Text className="text-sm font-bold" style={{ color: Colors.amber }}>{rating}</Text>
          </View>

          {/* Skills */}
          {skills ? (
            <View className="w-full pt-3 border-t border-slate-100">
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Skills</Text>
              <View className="flex-row flex-wrap gap-2">
                {skills.split(',').map((s: string, i: number) => (
                  <View key={i} className="rounded-full px-3 py-1" style={{ backgroundColor: Colors.teal + '15' }}>
                    <Text className="text-xs font-semibold" style={{ color: Colors.teal }}>{s.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Services */}
        <View className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-slate-100">
            <Text className="font-semibold text-black">Services Offered</Text>
            <Text className="text-xs text-slate-400 mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''}</Text>
          </View>

          {listings.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-slate-400 text-sm">No services listed yet.</Text>
            </View>
          ) : (
            listings.map((listing: any, i: number) => (
              <View
                key={listing.listing_id}
                className="px-4 py-4 flex-row items-start justify-between gap-3"
                style={{ borderBottomWidth: i < listings.length - 1 ? 1 : 0, borderBottomColor: Colors.slate100 }}
              >
                <View className="flex-1">
                  <Text className="font-semibold text-black text-sm">{listing.title}</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {listing.service_categories?.category_name ?? 'Uncategorized'}
                  </Text>
                  {listing.description ? (
                    <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>{listing.description}</Text>
                  ) : null}
                </View>
                <View className="items-end gap-2">
                  <Text className="text-sm font-bold text-black">
                    PKR {Number(listing.price ?? 0).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/book/${id}?listingId=${listing.listing_id}&title=${encodeURIComponent(listing.title)}&price=${listing.price}`)}
                    className="rounded-xl px-3 py-1.5"
                    style={{ backgroundColor: Colors.teal }}
                  >
                    <Text className="text-xs font-bold text-white">Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Availability */}
        <View className="rounded-2xl bg-white border border-slate-200 p-4 flex-row items-center gap-3 shadow-sm">
          <View
            className="h-9 w-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: provider.availability === 'available' ? Colors.emerald + '18' : Colors.slate100 }}
          >
            <Calendar size={18} color={provider.availability === 'available' ? Colors.emerald : Colors.slate400} />
          </View>
          <View>
            <Text className="font-semibold text-black text-sm">Availability</Text>
            <Text className="text-xs capitalize" style={{ color: provider.availability === 'available' ? Colors.emerald : Colors.slate400 }}>
              {provider.availability ?? 'unknown'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
