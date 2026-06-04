import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Link } from 'expo-router'
import { LockKeyhole, Mail, User, Wrench } from 'lucide-react-native'
import { BrandCard, BrandLogo, PrimaryButton } from '@/components/brand/Branded'
import { Colors } from '@/constants/colors'
import { signUp } from '@/lib/actions/auth'

type Role = 'customer' | 'provider'

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('customer')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), role)
    } catch (err: any) {
      Alert.alert('Registration failed', err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      label: 'Full Name',
      value: name,
      set: setName,
      placeholder: 'Ali Hassan',
      keyboardType: 'default',
      icon: <User size={16} color={Colors.slate400} />,
      secure: false,
    },
    {
      label: 'Email',
      value: email,
      set: setEmail,
      placeholder: 'you@example.com',
      keyboardType: 'email-address',
      icon: <Mail size={16} color={Colors.slate400} />,
      secure: false,
    },
    {
      label: 'Password',
      value: password,
      set: setPassword,
      placeholder: 'Password',
      keyboardType: 'default',
      icon: <LockKeyhole size={16} color={Colors.slate400} />,
      secure: true,
    },
  ]

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-5 pb-10 pt-14">
          <BrandLogo />

          <Text className="mt-6 text-4xl font-bold leading-tight text-black">
            Start with trusted help.
          </Text>
          <Text className="mt-2 text-base leading-6 text-slate-500">
            Create an account to book services or grow your professional business.
          </Text>

          <BrandCard className="mt-7 p-5">
            <View className="mb-5 flex-row overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {(['customer', 'provider'] as Role[]).map((r) => {
                const active = role === r
                const isProvider = r === 'provider'
                const activeColor = isProvider ? Colors.coral : Colors.teal
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    className="h-12 flex-1 flex-row items-center justify-center gap-1.5"
                    style={{ backgroundColor: active ? activeColor : Colors.white }}
                  >
                    {isProvider ? (
                      <Wrench size={15} color={active ? Colors.white : Colors.coral} />
                    ) : null}
                    <Text
                      className="text-sm font-semibold capitalize"
                      style={{ color: active ? Colors.white : Colors.slate600 }}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View className="gap-4">
              {fields.map((field) => (
                <View key={field.label}>
                  <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {field.label}
                  </Text>
                  <View className="h-12 flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                    {field.icon}
                    <TextInput
                      value={field.value}
                      onChangeText={field.set}
                      placeholder={field.placeholder}
                      keyboardType={field.keyboardType as any}
                      secureTextEntry={field.secure}
                      autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
                      className="flex-1 text-sm text-black"
                      placeholderTextColor={Colors.slate400}
                    />
                  </View>
                </View>
              ))}
            </View>

            <PrimaryButton
              onPress={handleRegister}
              disabled={loading}
              variant={role === 'provider' ? 'coral' : 'teal'}
              className="mt-6 h-14"
              style={{ backgroundColor: loading ? Colors.slate300 : role === 'provider' ? Colors.coral : Colors.teal }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </PrimaryButton>
          </BrandCard>

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-slate-500">Already have an account?</Text>
            <Link href="/(auth)/login">
              <Text className="text-sm font-semibold" style={{ color: Colors.teal }}>
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
