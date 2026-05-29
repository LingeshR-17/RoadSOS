import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

/**
 * AIChatScreen
 *
 * AI Chatbot tab with:
 *  - Message thread with AI bot responses
 *  - Text input for typing messages
 *  - Push-to-talk voice assistant button (uses expo-speech for TTS fallback)
 */

const INITIAL_MESSAGES = [
  {
    id: '1',
    sender: 'bot',
    text: 'Hello! I\'m your RoadSoS AI assistant. I can help you with:\n\n• Emergency first-aid guidance\n• Route safety analysis\n• Nearby hospital search\n• Accident reporting help\n\nHow can I assist you today?',
    time: 'Now',
  },
];

const AI_QUICK_REPLIES = [
  { label: '🏥 Nearest Hospital', command: 'Find the nearest hospital' },
  { label: '🩹 First Aid Steps', command: 'First aid for bleeding' },
  { label: '⚠️ Report Accident', command: 'How to report an accident' },
  { label: '🛣️ Road Safety Tips', command: 'Road safety tips' },
];

// Simple AI response simulation
function generateBotReply(input) {
  const lower = input.toLowerCase();
  if (lower.includes('hospital') || lower.includes('nearest')) {
    return 'Based on your GPS location, the nearest hospital is **KMC Hospital** — 1.2 km away, ETA ~3 minutes. Should I navigate you there?';
  }
  if (lower.includes('first aid') || lower.includes('bleeding')) {
    return '**For external bleeding:**\n1. Apply firm, continuous direct pressure with a clean cloth\n2. Elevate the injured limb above heart level\n3. Do NOT remove embedded objects\n4. Keep the victim warm and calm\n\nCall 108 (Ambulance) immediately if bleeding is severe.';
  }
  if (lower.includes('report') || lower.includes('accident')) {
    return 'To report an accident:\n1. Tap the **SOS** button on the Map tab (hold 2 seconds)\n2. Select **I am a Bystander**\n3. Fill in victim details and GPS will be auto-captured\n\nAlternatively, call 112 (National Emergency) directly.';
  }
  if (lower.includes('safety') || lower.includes('tip')) {
    return '**Top Road Safety Tips:**\n• Always wear your seatbelt / helmet\n• Keep emergency contacts updated in your profile\n• Check blackspot alerts before unfamiliar routes\n• Keep a first-aid kit in your vehicle\n• Share your live location during long trips';
  }
  return 'I understand. Let me help you with that. Could you provide more details about your situation? You can also use the quick reply buttons below for common queries.';
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Typing indicator animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  // Push-to-talk pulse
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const reply = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: generateBotReply(text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickReply = (command) => {
    sendMessage(command);
  };

  const togglePushToTalk = async () => {
    if (isListening) {
      setIsListening(false);
      // Simulate captured voice input
      setTimeout(() => {
        sendMessage('Find the nearest hospital');
      }, 300);
    } else {
      setIsListening(true);
      // Speak prompt via expo-speech
      try {
        const Speech = require('expo-speech');
        Speech.speak('Listening. Say your query now.', { language: 'en' });
      } catch (e) {
        // expo-speech not available — silent fallback
      }
      // Auto-stop after 5 seconds
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botAvatar}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>RoadSoS AI</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? '● Typing...' : '● Online'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          activeOpacity={0.8}
          onPress={() => {
            setMessages(INITIAL_MESSAGES);
            Alert.alert('Chat Cleared', 'Conversation has been reset.');
          }}
        >
          <Ionicons name="refresh-outline" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            {msg.sender === 'bot' && (
              <View style={styles.botIcon}>
                <Ionicons name="sparkles" size={12} color={COLORS.secondary} />
              </View>
            )}
            <View style={[
              styles.bubbleContent,
              msg.sender === 'user' ? styles.userContent : styles.botContent,
            ]}>
              <Text style={[
                styles.messageText,
                msg.sender === 'user' ? styles.userText : styles.botText,
              ]}>
                {msg.text}
              </Text>
              <Text style={[
                styles.timeLabel,
                msg.sender === 'user' ? styles.userTimeLabel : {},
              ]}>
                {msg.time}
              </Text>
            </View>
          </View>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <View style={styles.botIcon}>
              <Ionicons name="sparkles" size={12} color={COLORS.secondary} />
            </View>
            <View style={[styles.bubbleContent, styles.botContent, styles.typingBubble]}>
              <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
              <Animated.View style={[styles.typingDot, { opacity: typingAnim, marginLeft: 4 }]} />
              <Animated.View style={[styles.typingDot, { opacity: typingAnim, marginLeft: 4 }]} />
            </View>
          </View>
        )}

        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Quick Replies */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRepliesContainer}
      >
        {AI_QUICK_REPLIES.map((qr, i) => (
          <TouchableOpacity
            key={i}
            style={styles.quickReplyChip}
            onPress={() => handleQuickReply(qr.command)}
            activeOpacity={0.8}
          >
            <Text style={styles.quickReplyText}>{qr.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input Bar with Push-to-Talk */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputBar}>
          {/* Push-to-Talk Button */}
          <TouchableOpacity
            style={[styles.pttBtn, isListening && styles.pttBtnActive]}
            onPress={togglePushToTalk}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons
                name={isListening ? 'radio' : 'mic'}
                size={20}
                color={isListening ? '#FFFFFF' : COLORS.secondary}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder={isListening ? 'Listening...' : 'Ask the AI assistant...'}
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            editable={!isListening}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : {}]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? '#FFFFFF' : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Listening Overlay Banner */}
      {isListening && (
        <View style={styles.listeningBanner}>
          <View style={styles.listeningPulse} />
          <Text style={styles.listeningText}>🎙️ Listening... Speak your query</Text>
          <TouchableOpacity onPress={() => setIsListening(false)}>
            <Text style={styles.listeningCancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerStatus: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 1,
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Messages
  messagesContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  botBubble: {
    justifyContent: 'flex-start',
  },
  botIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.secondary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  bubbleContent: {
    maxWidth: '78%',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  userContent: {
    backgroundColor: COLORS.secondary,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  botContent: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: COLORS.text,
  },
  timeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  userTimeLabel: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },

  // Typing
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },

  // Quick Replies
  quickRepliesContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  quickReplyChip: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.sm,
  },
  pttBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.secondary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  pttBtnActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.dangerGlow,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.lightBg,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendBtnActive: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.sm,
  },

  // Listening banner
  listeningBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 96,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.lg,
    zIndex: 200,
  },
  listeningPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  listeningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listeningCancel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
