import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export default function MedicalInfoCard({ medicalInfo }) {
  const items = [
    { label: 'Blood Group', value: medicalInfo.bloodGroup, isHighlight: true },
    { label: 'Allergies', value: medicalInfo.allergies },
    { label: 'Conditions', value: medicalInfo.conditions },
    { label: 'Insurance', value: medicalInfo.insurance },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Medical Profile</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View 
            key={item.label} 
            style={[
              styles.row, 
              index < items.length - 1 && styles.borderBottom
            ]}
          >
            <Text style={styles.label}>{item.label}</Text>
            <Text 
              style={[
                styles.value, 
                item.isHighlight && styles.highlightText
              ]}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
});
