import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Send } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChatMessage, getChatMessages, sendChatMessage } from '@/lib/actions/chat'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/constants/colors'

export default function ChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const listRef = useRef<FlatList>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!bookingId) return

    getChatMessages(bookingId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))

    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId])

  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50)
    }
  }, [loading, messages.length])

  async function handleSend() {
    const trimmed = text.trim()
    if (!bookingId || !trimmed || sending) return

    setSending(true)
    setText('')
    try {
      await sendChatMessage(bookingId, trimmed)
    } catch {
      setText(trimmed)
    } finally {
      setSending(false)
    }
  }

  function isOwn(msg: ChatMessage) {
    return msg.sender_id === user?.id
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: Colors.slate100 }}
        >
          <ArrowLeft size={18} color={Colors.slate600} />
        </TouchableOpacity>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-black">Chat</Text>
          <Text className="text-xs text-slate-400" numberOfLines={1}>
            Booking #{bookingId?.slice(0, 8)}
          </Text>
        </View>
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: Colors.emerald }} />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.teal} size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(message) => message.message_id}
            contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 8, flexGrow: 1 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-center text-sm text-slate-400">
                  No messages yet.{'\n'}Say hello!
                </Text>
              </View>
            }
            renderItem={({ item: msg }) => {
              const own = isOwn(msg)
              return (
                <View className={`flex-row ${own ? 'justify-end' : 'justify-start'}`}>
                  <View
                    className="max-w-[80%] rounded-2xl px-4 py-2.5"
                    style={{
                      backgroundColor: own ? Colors.teal : Colors.white,
                      shadowColor: '#000',
                      shadowOpacity: 0.04,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 1 },
                      elevation: 1,
                    }}
                  >
                    <Text className="text-sm leading-5" style={{ color: own ? Colors.white : Colors.black }}>
                      {msg.message}
                    </Text>
                    <Text className="mt-1 text-xs" style={{ color: own ? Colors.white + '99' : Colors.slate400 }}>
                      {formatTime(msg.created_at)}
                    </Text>
                  </View>
                </View>
              )
            }}
          />
        )}

        <View
          className="flex-row items-end gap-3 border-t border-slate-100 bg-white px-4 py-3"
          style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 12 }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            multiline
            maxLength={500}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-black"
            placeholderTextColor={Colors.slate400}
            style={{ maxHeight: 120, textAlignVertical: 'top' }}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            className="h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: text.trim() ? Colors.teal : Colors.slate200 }}
          >
            {sending
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Send size={16} color={Colors.white} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
