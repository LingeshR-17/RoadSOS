import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { theme } from '../../constants/theme';

export default function ServiceCard({ title, number, icon, description, onCallPress, isBystanderMode, isSafeState }) {
  
  const handleCall = () => {
    if (onCallPress) {
      onCallPress(number);
    } else {
      Linking.openURL(`tel:${number}`);
    }
  };

  let activeColor = theme.colors.emergencyNeon;
  let activeBg = 'rgba(255, 59, 48, 0.05)';

  if (isSafeState) {
    activeColor = theme.colors.safeNeon;
    activeBg = 'rgba(52, 199, 89, 0.05)';
  } else if (isBystanderMode) {
    activeColor = theme.colors.bystanderNeon;
    activeBg = 'rgba(0, 199, 255, 0.05)';
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: activeBg, borderColor: `${activeColor}20` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} numberOfLines={1}>{description}</Text>
          <View style={styles.numberRow}>
            <Text style={[styles.number, { color: activeColor }]}>{number}</Text>
            <View style={[styles.activeDot, { backgroundColor: activeColor }]} />
            <Text style={styles.activeText}>Armed</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCall}
          activeOpacity={0.7}
          style={[
            styles.callButton,
            { 
              borderColor: activeColor,
              backgroundColor: `${activeColor}10`
            }
          ]}
        >
          <Text style={[styles.callIcon, { color: activeColor }]}>📞</Text>
          <Text style={[styles.callBtnText, { color: activeColor }]}>CALL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    elevation: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  icon: {
    fontSize: 24,
  },
  infoColumn: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  number: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: theme.spacing.sm,
    marginRight: 4,
  },
  activeText: {
    color: theme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
  },
  callIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});