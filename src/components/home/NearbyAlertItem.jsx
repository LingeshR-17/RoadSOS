import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function NearbyAlertItem({ alert, onPress }) {
  const { color, title, subtitle, time } = alert;

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        {/* Status Indicator Dot */}
        <View style={[styles.dot, { backgroundColor: color }]} />
        
        <View style={styles.textSection}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.timeText, time === 'safe' && styles.safeText]}>{time}</Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  textSection: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  safeText: {
    color: COLORS.success,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chevron: {
    marginLeft: SPACING.xs,
  },
});
