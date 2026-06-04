import { PropsWithChildren, ReactNode } from 'react'
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Wrench,
} from 'lucide-react-native'
import { Colors } from '@/constants/colors'

const logo = require('@/assets/fix-it-logo.png') as ImageSourcePropType

type StyleProp = ViewStyle | TextStyle | ImageStyle

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={logo}
        resizeMode="contain"
        style={{ width: compact ? 44 : 56, height: compact ? 44 : 56 }}
      />
      <Text className="shrink text-2xl font-bold text-slate-900" numberOfLines={1}>
        FixIt<Text style={{ color: Colors.teal }}>Now</Text>
      </Text>
    </View>
  )
}

export function GlassHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <View className="overflow-hidden border-b border-white bg-white px-5 pb-4 pt-4 shadow-sm">
      <View className="absolute inset-x-0 top-0 h-0.5 bg-teal" />
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          {eyebrow ? (
            <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              {eyebrow}
            </Text>
          ) : null}
          <Text className="text-2xl font-bold text-black" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-sm text-slate-500" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {action}
      </View>
    </View>
  )
}

export function TrustChips({ compact = false }: { compact?: boolean }) {
  const chips = compact
    ? ['Verified pros', 'Upfront pricing', 'Secure payments']
    : ['Verified pros', 'Upfront pricing', 'Same-day support', 'Secure payments']

  return (
    <View className="flex-row flex-wrap gap-2">
      {chips.map((label) => (
        <View
          key={label}
          className="flex-row items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"
        >
          <CheckCircle2 size={13} color={Colors.teal} />
          <Text className="text-xs font-semibold text-slate-600">{label}</Text>
        </View>
      ))}
    </View>
  )
}

export function HeroProviderPreview() {
  return (
    <View className="mt-5">
      <View className="self-start rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
        <View className="flex-row items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={12} color={Colors.amber} fill={Colors.amber} />
          ))}
          <Text className="text-xs font-bold text-black">4.9</Text>
          <Text className="text-xs text-slate-400">avg rating</Text>
        </View>
      </View>

      <BrandCard className="-mt-2 overflow-hidden">
        <View className="h-1 bg-teal" />
        <View className="p-5">
          <View className="flex-row items-start gap-3">
            <View className="relative h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950">
              <Text className="text-lg font-bold text-white">AH</Text>
              <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full bg-white">
                <View className="h-2.5 w-2.5 rounded-full bg-emerald" />
              </View>
            </View>

            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-lg font-bold text-black" numberOfLines={1}>
                  Ali Hassan
                </Text>
                <BadgeCheck size={17} color={Colors.teal} />
              </View>
              <View className="mt-0.5 flex-row items-center gap-1">
                <MapPin size={13} color={Colors.slate400} />
                <Text className="text-sm text-slate-400" numberOfLines={1}>
                  Master Plumber - Lahore
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-2xl bg-slate-50 px-3 py-3">
            <View className="flex-row flex-wrap items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} color={Colors.amber} fill={Colors.amber} />
              ))}
              <Text className="text-xs font-bold text-black">127 reviews</Text>
            </View>
            <View className="mt-2 self-start flex-row items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
              <Clock size={12} color={Colors.slate500} />
              <Text className="text-xs font-semibold text-slate-600">Available now</Text>
            </View>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {['Pipe Repair', 'Leak Fixing', 'Installation'].map((tag) => (
              <View key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                <Text className="text-xs font-semibold text-slate-600">{tag}</Text>
              </View>
            ))}
          </View>

          <View className="mt-4 flex-row items-center justify-between border-t border-slate-100 pt-3">
            <Text className="text-xs text-slate-400">Starting at</Text>
            <Text className="text-base font-bold text-black">PKR 1,500</Text>
          </View>
        </View>
      </BrandCard>
    </View>
  )
}

export function BrandHero({ onPrimaryPress }: { onPrimaryPress?: () => void }) {
  return (
    <View className="overflow-hidden bg-white px-5 pb-5 pt-4">
      <View
        style={{
          borderRadius: 24,
          borderWidth: 1,
          borderColor: Colors.slate100,
          backgroundColor: Colors.tealSoft,
          padding: 18,
        }}
      >
        <View className="mb-5 flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-3 py-1.5">
            <View className="flex-row items-center gap-2">
              <View className="h-1.5 w-1.5 rounded-full bg-teal" />
              <Text className="min-w-0 flex-1 text-xs font-semibold text-slate-600" numberOfLines={1}>
                Pakistan's #1 Home Services Platform
              </Text>
            </View>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">
            <Wrench size={20} color={Colors.coral} />
          </View>
        </View>

        <Text className="text-4xl font-bold leading-tight text-black">
          Book trusted home pros.{' '}
          <Text style={{ color: Colors.teal }}>Instantly.</Text>
        </Text>
        <Text className="mt-3 text-base leading-6 text-slate-500">
          Compare verified providers, see clear pricing, and book the right expert in minutes.
        </Text>

        <View className="mt-5">
          <TrustChips compact />
        </View>

        <HeroProviderPreview />

        <TouchableOpacity
          onPress={onPrimaryPress}
          activeOpacity={0.85}
          className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-teal"
        >
          <Text className="text-sm font-bold text-white">Browse providers</Text>
          <ArrowRight size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export function BrandStats({ dark = false }: { dark?: boolean }) {
  const stats = [
    { num: '1,000+', label: 'Verified providers' },
    { num: '50K+', label: 'Jobs completed' },
    { num: '4.9/5', label: 'Customer rating' },
  ]

  return (
    <View className="flex-row overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
      {stats.map((stat) => (
        <View
          key={stat.label}
          className="flex-1 items-center justify-center px-2 py-4"
          style={{ backgroundColor: dark ? Colors.slate950 : Colors.white }}
        >
          <Text className="text-xl font-bold" style={{ color: dark ? Colors.white : Colors.black }}>
            {stat.num}
          </Text>
          <Text
            className="mt-1 text-center text-[11px] font-medium"
            style={{ color: dark ? Colors.slate400 : Colors.slate400 }}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <View>
      <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">{eyebrow}</Text>
      <Text className="mt-2 text-3xl font-bold leading-tight text-black">{title}</Text>
      {subtitle ? <Text className="mt-2 text-sm leading-5 text-slate-500">{subtitle}</Text> : null}
    </View>
  )
}

export function BrandCard({
  children,
  className = '',
  style,
}: PropsWithChildren<{ className?: string; style?: StyleProp }>) {
  return (
    <View
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      style={style as ViewStyle}
    >
      {children}
    </View>
  )
}

export function PrimaryButton({
  children,
  variant = 'teal',
  className = '',
  style,
  ...props
}: PropsWithChildren<TouchableOpacityProps & { variant?: 'teal' | 'coral' | 'light'; className?: string }>) {
  const backgroundColor =
    variant === 'coral' ? Colors.coral : variant === 'light' ? Colors.white : Colors.teal
  const textColor = variant === 'light' ? Colors.teal : Colors.white

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-xl px-4 ${className}`}
      style={[{ backgroundColor }, style as ViewStyle]}
      {...props}
    >
      <Text className="text-sm font-bold" style={{ color: textColor }}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
