import { useEffect, useState } from 'react'
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native'
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react-native'
import { getNotifications } from '@/lib/actions/notifications'
import { Colors } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

const TONE: Record<string, { color: string; bg: string; Icon: any }> = {
  success: { color: Colors.emerald, bg: Colors.emerald + '15', Icon: CheckCircle2 },
  warning: { color: Colors.amber,   bg: Colors.amber   + '15', Icon: AlertTriangle },
  danger:  { color: Colors.rose,    bg: Colors.rose    + '15', Icon: XCircle },
  info:    { color: Colors.teal,    bg: Colors.teal    + '15', Icon: Info },
}

function relativeTime(date: string) {
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function NotificationsScreen() {
  const [items,      setItems]      = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await getNotifications()
    setItems(data)
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <Text className="text-2xl font-bold text-black">Notifications</Text>
        <Text className="text-slate-500 text-sm mt-0.5">
          {items.filter(n => !n.read_at).length} unread
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 104, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
          ListEmptyComponent={
            <View className="items-center py-20 gap-3">
              <Bell size={40} color={Colors.slate200} />
              <Text className="text-slate-400 text-sm">No notifications yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const t = TONE[item.tone] ?? TONE.info
            return (
              <View
                className="flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                style={!item.read_at ? { borderLeftWidth: 3, borderLeftColor: t.color } : {}}
              >
                <View className="h-9 w-9 rounded-xl items-center justify-center" style={{ backgroundColor: t.bg }}>
                  <t.Icon size={18} color={t.color} />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-semibold text-black text-sm">{item.title}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5" numberOfLines={2}>{item.description}</Text>
                  <Text className="text-slate-400 text-xs mt-1.5">{relativeTime(item.created_at)}</Text>
                </View>
              </View>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
