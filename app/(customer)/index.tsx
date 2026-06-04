import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  ArrowRight,
  BadgeCheck,
  Hammer,
  Paintbrush,
  Plug,
  Search,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BrandHero, BrandStats, SectionHeader } from '@/components/brand/Branded'
import { Colors } from '@/constants/colors'
import { getCategories, getServiceListings } from '@/lib/actions/services'

const SERVICE_ICONS: Record<string, any> = {
  plumbing: Wrench,
  electrical: Zap,
  cleaning: Sparkles,
  carpentry: Hammer,
  painting: Paintbrush,
  appliances: Plug,
}

export default function BrowseScreen() {
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    load()
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    load()
  }, [activeCategory])

  async function load() {
    setLoading(true)
    const data = await getServiceListings({ category: activeCategory || undefined })
    setListings(data)
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const filtered = listings.filter(
    (listing) =>
      search === '' ||
      listing.title?.toLowerCase().includes(search.toLowerCase()) ||
      listing.service_providers?.users?.name?.toLowerCase().includes(search.toLowerCase())
  )

  function initials(name = '') {
    return name
      .split(' ')
      .slice(0, 2)
      .map((word: string) => word[0]?.toUpperCase() ?? '')
      .join('')
  }

  const header = (
    <View>
      <BrandHero />

      <View className="bg-white px-5 py-4">
        <BrandStats />
      </View>

      <View className="bg-surface px-5 pb-3 pt-6">
        <SectionHeader
          eyebrow="What we fix"
          title="Everything your home needs"
          subtitle="Hundreds of verified providers across categories, ready to help today."
        />
      </View>

      <FlatList
        horizontal
        data={[{ category_id: '', category_name: 'All' }, ...categories]}
        keyExtractor={(category) => category.category_id || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14, gap: 10 }}
        renderItem={({ item }) => {
          const active = activeCategory === item.category_id
          const categoryName = item.category_name ?? 'All'
          const Icon = SERVICE_ICONS[String(categoryName).toLowerCase()] ?? Wrench

          return (
            <TouchableOpacity
              onPress={() => setActiveCategory(item.category_id)}
              className="w-36 rounded-2xl border bg-white p-4 shadow-sm"
              style={{
                borderColor: active ? Colors.teal : Colors.slate200,
                backgroundColor: active ? Colors.tealSoft : Colors.white,
              }}
              activeOpacity={0.85}
            >
              <View
                className="mb-3 h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: active ? Colors.teal : Colors.slate100 }}
              >
                <Icon size={20} color={active ? Colors.white : Colors.slate700} />
              </View>
              <Text className="font-semibold text-black" numberOfLines={1}>
                {categoryName}
              </Text>
              <View className="mt-2 flex-row items-center gap-1">
                <Text className="text-xs font-semibold" style={{ color: Colors.teal }}>
                  View providers
                </Text>
                <ArrowRight size={12} color={Colors.teal} />
              </View>
            </TouchableOpacity>
          )
        }}
      />

      <View className="bg-white px-5 pb-4 pt-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-2xl font-bold text-black">Browse Services</Text>
            <Text className="mt-0.5 text-sm text-slate-500">Find verified professionals near you</Text>
          </View>
          <View className="shrink-0 rounded-full bg-tealSoft px-3 py-1">
            <Text className="text-xs font-bold" style={{ color: Colors.teal }}>
              {filtered.length} found
            </Text>
          </View>
        </View>

        <View className="mt-3 h-12 flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search size={16} color={Colors.slate400} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search services or providers..."
            placeholderTextColor={Colors.slate400}
            className="flex-1 text-sm text-black"
          />
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(listing) => listing.listing_id}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: 104, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-sm text-slate-400">No services found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const provider = item.service_providers
            const name = provider?.users?.name ?? 'Provider'
            const rating = Number(provider?.rating ?? 0).toFixed(1)

            return (
              <TouchableOpacity
                onPress={() => router.push(`/provider/${provider?.provider_id}`)}
                className="mx-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                activeOpacity={0.8}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: Colors.teal + '18' }}
                  >
                    <Text className="text-base font-bold" style={{ color: Colors.teal }}>
                      {initials(name)}
                    </Text>
                  </View>

                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-base font-semibold text-black" numberOfLines={1}>
                        {item.title}
                      </Text>
                      {provider?.is_verified ? <BadgeCheck size={14} color={Colors.teal} /> : null}
                    </View>
                    <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={1}>
                      {name}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-400" numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <View className="flex-row items-center gap-1">
                    <Star size={13} color={Colors.amber} fill={Colors.amber} />
                    <Text className="text-xs font-semibold text-black">{rating}</Text>
                  </View>
                  <Text className="text-sm font-bold text-black" numberOfLines={1}>
                    PKR {Number(item.price ?? 0).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
