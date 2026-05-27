import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';

export default function GreetingHeader({ onNotificationPress }) {
  const { profile } = useUserStore();
  const firstName = profile.name.split(' ')[0];

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greetingLabel}>Good morning,</Text>
        <Text style={styles.name}>{firstName} 👋</Text>
        <Text style={styles.subtitle}>Stay safe on the road today</Text>
      </View>
      <TouchableOpacity 
        style={styles.bellButton} 
        activeOpacity={0.8}
        onPress={onNotificationPress}
      >
        <Ionicons name="notifications-outline" size={24} color={COLORS.card} />
        <View style={styles.badge} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greetingLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    color: COLORS.card,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
