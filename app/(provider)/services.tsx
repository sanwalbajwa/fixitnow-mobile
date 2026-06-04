import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, Alert, Modal, ScrollView,
} from 'react-native'
import { Plus, Trash2, Layers } from 'lucide-react-native'
import { getProviderServices, createService, deleteService, getCategories } from '@/lib/actions/services'
import { Colors } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProviderServicesScreen() {
  const [services,    setServices]    = useState<any[]>([])
  const [categories,  setCategories]  = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [showModal,   setShowModal]   = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [form, setForm] = useState({ category_id: '', title: '', description: '', price: '' })

  useEffect(() => {
    load()
    getCategories().then(setCategories)
  }, [])

  async function load() {
    setLoading(true)
    const data = await getProviderServices()
    setServices(data)
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function handleCreate() {
    if (!form.category_id || !form.title || !form.price) {
      Alert.alert('Error', 'Category, title, and price are required.')
      return
    }
    setSaving(true)
    try {
      await createService({
        category_id:  form.category_id,
        title:        form.title.trim(),
        description:  form.description.trim(),
        price:        Number(form.price),
      })
      setShowModal(false)
      setForm({ category_id: '', title: '', description: '', price: '' })
      await load()
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not create service.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(listingId: string) {
    Alert.alert('Delete', 'Remove this service listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteService(listingId)
          await load()
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-black">My Services</Text>
          <Text className="text-slate-500 text-sm mt-0.5">{services.length} listings</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="h-9 w-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: Colors.teal }}
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(s) => s.listing_id}
          contentContainerStyle={{ padding: 16, paddingBottom: 104, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
          ListEmptyComponent={
            <View className="items-center py-20 gap-3">
              <Layers size={40} color={Colors.slate200} />
              <Text className="text-slate-400 text-sm">No services yet. Tap + to add one.</Text>
            </View>
          }
          renderItem={({ item: s }) => (
            <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1">
                  <Text className="font-semibold text-black" numberOfLines={2}>{s.title}</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {s.service_categories?.category_name ?? 'Uncategorized'}
                  </Text>
                  {s.description && (
                    <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>{s.description}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(s.listing_id)}>
                  <Trash2 size={18} color={Colors.rose} />
                </TouchableOpacity>
              </View>
              <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Text className="text-sm font-bold text-black" numberOfLines={1}>
                  PKR {Number(s.price ?? 0).toLocaleString()}
                </Text>
                <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: Colors.teal + '18' }}>
                  <Text className="text-xs font-semibold" style={{ color: Colors.teal }}>
                    Listed
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Add service modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-black">New Service</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text className="text-sm font-semibold" style={{ color: Colors.rose }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
            {/* Category picker */}
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {categories.map((c) => {
                  const active = form.category_id === c.category_id
                  return (
                    <TouchableOpacity
                      key={c.category_id}
                      onPress={() => setForm(f => ({ ...f, category_id: c.category_id }))}
                      className="rounded-full px-4 py-2 border"
                      style={{ backgroundColor: active ? Colors.teal : Colors.white, borderColor: active ? Colors.teal : Colors.slate200 }}
                    >
                      <Text className="text-sm font-semibold" style={{ color: active ? Colors.white : Colors.slate600 }}>
                        {c.category_name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>

            {[
              { label: 'Title',       key: 'title',       placeholder: 'e.g. Pipe Repair',           type: 'default',  multi: false },
              { label: 'Description', key: 'description', placeholder: 'Describe what you offer…',   type: 'default',  multi: true  },
              { label: 'Price (PKR)', key: 'price',       placeholder: 'e.g. 1500',                  type: 'numeric',  multi: false },
            ].map((f) => (
              <View key={f.key}>
                <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{f.label}</Text>
                <TextInput
                  value={(form as any)[f.key]}
                  onChangeText={(v) => setForm(p => ({ ...p, [f.key]: v }))}
                  placeholder={f.placeholder}
                  keyboardType={f.type as any}
                  multiline={f.multi}
                  numberOfLines={f.multi ? 3 : 1}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-black"
                  placeholderTextColor={Colors.slate400}
                  style={f.multi ? { textAlignVertical: 'top', minHeight: 80 } : { height: 44 }}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={handleCreate}
              disabled={saving}
              className="h-13 items-center justify-center rounded-xl mt-2"
              style={{ backgroundColor: saving ? Colors.slate200 : Colors.teal }}
            >
              {saving
                ? <ActivityIndicator color={Colors.white} />
                : <Text className="text-sm font-bold text-white">Create Service</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}
