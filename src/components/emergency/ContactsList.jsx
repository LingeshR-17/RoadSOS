import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const dummyContacts = [
  { id: '1', name: 'Mom', relation: 'Primary', initial: 'M' },
  { id: '2', name: 'Dad', relation: 'Secondary', initial: 'D' },
  { id: '3', name: 'Alex (Friend)', relation: 'Friend', initial: 'A' },
];

export default function ContactsList({ isActiveEmergency, isBystanderMode }) {
  // Safe fallback lookups for style rules
  const neonAccent = isBystanderMode 
    ? (COLORS.secondary || '#3B82F6') 
    : (COLORS.primary || '#E63946');

  const textMutedColor = COLORS.textMuted || '#94A3B8';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Emergency SOS Contacts</Text>
        <Text style={[styles.badge, isActiveEmergency && { color: neonAccent, borderColor: neonAccent }]}>
          {isActiveEmergency ? 'ALERTING SMS...' : 'STANDBY'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dummyContacts.map((contact) => (
          <View key={contact.id} style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={[
                styles.avatarCircle, 
                isActiveEmergency && { borderColor: neonAccent }
              ]}>
                <Text style={styles.avatarText}>{contact.initial}</Text>
              </View>

              <View style={[
                styles.statusDot, 
                { backgroundColor: isActiveEmergency ? neonAccent : textMutedColor }
              ]} />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.contactName} numberOfLines={1}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relation}</Text>
            </View>

            <Text style={[
              styles.statusText,
              { color: isActiveEmergency ? neonAccent : textMutedColor }
            ]}>
              {isActiveEmergency ? 'Sending coordinates...' : 'Armed'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md || 16,
    paddingHorizontal: SPACING.sm || 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm || 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingVertical: SPACING.xs || 6,
    paddingRight: SPACING.xl || 32,
  },
  card: {
    width: 130,
    backgroundColor: COLORS.card || '#1A1D24',
    borderWidth: 1,
    borderColor: COLORS.border || 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md || 12,
    padding: SPACING.md || 16,
    marginRight: SPACING.md || 16,
    alignItems: 'center',
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm || 12,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#262930',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#090b0e',
    zIndex: 3,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xs || 6,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contactRelation: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});