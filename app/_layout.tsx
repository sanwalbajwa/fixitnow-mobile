import '../global.css'

import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useAuth } from '@/hooks/useAuth'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { user, loading } = useAuth()
  const router   = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return
    SplashScreen.hideAsync()

    const inAuth     = segments[0] === '(auth)'
    const inCustomer = segments[0] === '(customer)'
    const inProvider = segments[0] === '(provider)'

    if (!user) {
      if (!inAuth) router.replace('/(auth)/login')
      return
    }

    if (user.role === 'customer' && !inCustomer) {
      router.replace('/(customer)')
      return
    }

    if (user.role === 'provider' && !inProvider) {
      router.replace('/(provider)')
      return
    }
  }, [user, loading])

  return (
    <>
      <StatusBar style="dark" />
      <Slot />
    </>
  )
}
