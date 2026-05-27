import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

export default function ChatTabScreen() {
  const activeChats = [
    {
      id: '1',
      name: 'RoadSoS Control Center',
      avatar: 'RC',
      lastMessage: 'Your rescue coordinates are shared with emergency responders.',
      time: '10:45 AM',
      unread: 1,
      isOfficial: true,
    },
    {
      id: '2',
      name: 'Amma (Mother)',
      avatar: 'A',
      lastMessage: 'Stay safe, let me know if you need anything.',
      time: 'Yesterday',
      unread: 0,
      isOfficial: false,
    },
    {
      id: '3',
      name: 'Nandha (Friend)',
      avatar: 'N',
      lastMessage: 'Are you traveling near Bypass bypass road today?',
      time: '24 May',
      unread: 0,
      isOfficial: false,
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Chat</Text>
        <TouchableOpacity 
          style={styles.newChatBtn}
          activeOpacity={0.8}
          onPress={() => Alert.alert("New Chat", "Select emergency contact to initiate secure chat.", [{ text: "OK" }])}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.card} />
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeChats.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            style={styles.chatRow} 
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                chat.name,
                `Message Log:\n"${chat.lastMessage}"`,
                [{ text: "Reply" }, { text: "Dismiss", style: "cancel" }]
              );
            }}
          >
            {/* Avatar Circle */}
            <View style={[
              styles.avatarContainer, 
              chat.isOfficial ? styles.officialAvatar : styles.defaultAvatar
            ]}>
              {chat.isOfficial ? (
                <Ionicons name="shield-checkmark" size={20} color={COLORS.card} />
              ) : (
                <Text style={[
                  styles.avatarText,
                  chat.isOfficial ? styles.officialText : styles.defaultText
                ]}>
                  {chat.avatar}
                </Text>
              )}
            </View>

            {/* Chat info */}
            <View style={styles.chatInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.timeText}>{chat.time}</Text>
              </View>
              <View style={styles.messageRow}>
                <Text style={styles.messageText} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Safety Spacer for custom bottom floating navigation bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOWS.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.card,
  },
  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  officialAvatar: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  defaultAvatar: {
    backgroundColor: `${COLORS.secondary}12`,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  officialText: {
    color: COLORS.card,
  },
  defaultText: {
    color: COLORS.secondary,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    paddingRight: SPACING.lg,
  },
  unreadBadge: {
    backgroundColor: COLORS.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: COLORS.card,
    fontSize: 10,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 110, // tab bar clearance spacer
  },
});
