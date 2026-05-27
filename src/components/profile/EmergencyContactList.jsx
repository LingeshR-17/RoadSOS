import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function EmergencyContactList({ contacts, onAddPress }) {
  // Helper to mask phone numbers (e.g., +91 99400 12345 -> +91 994**)
  const maskPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.length >= 8) {
      return `${phone.substring(0, 8)}••`;
    }
    return phone;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Emergency Contacts</Text>
      
      <View style={styles.listContainer}>
        {contacts.map((contact, index) => (
          <View 
            key={contact.id} 
            style={[
              styles.contactRow,
              index < contacts.length - 1 && styles.borderBottom
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: `${COLORS.secondary}12` }]}>
              <Text style={styles.avatarText}>{contact.initial}</Text>
            </View>
            
            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.relationship}>{contact.relationship}</Text>
            </View>
            
            <Text style={styles.phoneText}>{maskPhone(contact.phone)}</Text>
          </View>
        ))}

        {/* Add Contact Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          activeOpacity={0.7}
          onPress={onAddPress}
        >
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={18} color={COLORS.success} />
          </View>
          <Text style={styles.addText}>Add emergency contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  relationship: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'System', // Ensures uniform mono spacing if numeric
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  addText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
  },
});
