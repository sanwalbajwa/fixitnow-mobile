import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Link } from 'expo-router'
import { CheckCircle2, LockKeyhole, Mail } from 'lucide-react-native'
import { BrandCard, BrandLogo, PrimaryButton } from '@/components/brand/Branded'
import { Colors } from '@/constants/colors'
import { signIn } from '@/lib/actions/auth'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      await signIn(email.trim().toLowerCase(), password)
    } catch (err: any) {
      Alert.alert('Login failed', err.message ?? 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-5 pb-10 pt-14">
          <View className="mb-6">
            <BrandLogo />
            <View className="mt-5 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-teal" />
                <Text className="text-xs font-semibold text-slate-600">
                  Pakistan's #1 Home Services Platform
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-4xl font-bold leading-tight text-black">Welcome back.</Text>
          <Text className="mt-2 text-base leading-6 text-slate-500">
            Sign in to book trusted home professionals instantly.
          </Text>

          <BrandCard className="mt-7 p-5">
            <View className="gap-4">
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </Text>
                <View className="h-12 flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Mail size={16} color={Colors.slate400} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="flex-1 text-sm text-black"
                    placeholderTextColor={Colors.slate400}
                  />
                </View>
              </View>

              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </Text>
                <View className="h-12 flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <LockKeyhole size={16} color={Colors.slate400} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    secureTextEntry
                    autoComplete="password"
                    className="flex-1 text-sm text-black"
                    placeholderTextColor={Colors.slate400}
                  />
                </View>
              </View>
            </View>

            <PrimaryButton
              onPress={handleLogin}
              disabled={loading}
              className="mt-6 h-14"
              style={{ backgroundColor: loading ? Colors.slate300 : Colors.teal }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </PrimaryButton>
          </BrandCard>

          <View className="mt-5 flex-row flex-wrap gap-2">
            {['Verified pros', 'Upfront pricing', 'Secure payments'].map((label) => (
              <View
                key={label}
                className="flex-row items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"
              >
                <CheckCircle2 size={13} color={Colors.teal} />
                <Text className="text-xs font-semibold text-slate-600">{label}</Text>
              </View>
            ))}
          </View>

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-slate-500">Don't have an account?</Text>
            <Link href="/(auth)/register">
              <Text className="text-sm font-semibold" style={{ color: Colors.teal }}>
                Register
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
