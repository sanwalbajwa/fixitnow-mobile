import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Switch,
} from 'react-native'
import { User, Phone, LogOut, BadgeCheck } from 'lucide-react-native'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/actions/auth'
import { supabase } from '@/lib/supabase'
import { Colors } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')
}

export default function ProviderProfileScreen() {
  const { user } = useAuth()
  const [name,      setName]      = useState(user?.name  ?? '')
  const [phone,     setPhone]     = useState(user?.phone ?? '')
  const [skills,    setSkills]    = useState('')
  const [available, setAvailable] = useState(true)
  const [saving,    setSaving]    = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await supabase
        .from('users')
        .update({ name: name.trim(), phone: phone.trim() })
        .eq('user_id', session.user.id)

      await supabase
        .from('service_providers')
        .update({ skills: skills.trim(), availability: available ? 'available' : 'busy' })
        .eq('user_id', session.user.id)

      Alert.alert('Saved', 'Profile updated successfully.')
    } catch {
      Alert.alert('Error', 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 104, gap: 16 }}>

        {/* Avatar */}
        <View className="items-center py-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <View className="h-20 w-20 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: Colors.teal }}>
            <Text className="text-3xl font-bold text-white">{initials(user?.name)}</Text>
          </View>
          <Text className="px-4 text-center text-lg font-bold text-black" numberOfLines={2}>
            {user?.name || 'Your Name'}
          </Text>
          <Text className="mt-0.5 px-4 text-center text-sm text-slate-400" numberOfLines={2}>
            {user?.email}
          </Text>
          <View className="mt-2 flex-row items-center gap-1.5 rounded-full px-3 py-1" style={{ backgroundColor: Colors.teal + '18' }}>
            <BadgeCheck size={12} color={Colors.teal} />
            <Text className="text-xs font-semibold" style={{ color: Colors.teal }}>Provider</Text>
          </View>
        </View>

        {/* Edit form */}
        <View className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <View className="px-5 py-4 border-b border-slate-100">
            <Text className="font-semibold text-black">Personal & Professional Info</Text>
          </View>
          <View className="px-5 py-4 gap-4">
            {[
              { label: 'Full Name', value: name,  set: setName,  type: 'default',  icon: <User  size={14} color={Colors.slate400} /> },
              { label: 'Phone',     value: phone, set: setPhone, type: 'phone-pad', icon: <Phone size={14} color={Colors.slate400} /> },
            ].map((f) => (
              <View key={f.label}>
                <View className="flex-row items-center gap-1.5 mb-1.5">
                  {f.icon}
                  <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">{f.label}</Text>
                </View>
                <TextInput
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.type as any}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-black"
                  placeholderTextColor={Colors.slate400}
                />
              </View>
            ))}

            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Skills</Text>
              <TextInput
                value={skills}
                onChangeText={setSkills}
                placeholder="e.g. Plumbing, Pipe repair, Fittings"
                multiline
                numberOfLines={3}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-black"
                placeholderTextColor={Colors.slate400}
                style={{ textAlignVertical: 'top', minHeight: 72 }}
              />
            </View>

            {/* Availability toggle */}
            <View className="flex-row items-center justify-between gap-4 py-2">
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-semibold text-black">Available for bookings</Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  {available ? 'Customers can book you' : 'You are set as busy'}
                </Text>
              </View>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ false: Colors.slate200, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="h-12 items-center justify-center rounded-xl mt-2"
              style={{ backgroundColor: saving ? Colors.slate200 : Colors.teal }}
            >
              {saving
                ? <ActivityIndicator color={Colors.white} />
                : <Text className="text-sm font-bold text-white">Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white"
        >
          <LogOut size={16} color={Colors.rose} />
          <Text className="text-sm font-semibold" style={{ color: Colors.rose }}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}
