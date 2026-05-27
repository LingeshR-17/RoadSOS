import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NearbyAlertItem from './NearbyAlertItem';
import { COLORS, SPACING } from '../../constants/theme';

export default function NearbyAlertsList({ alerts, onAlertPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Nearby Alerts</Text>
      <View style={styles.listContainer}>
        {alerts.map((alert, index) => (
          <NearbyAlertItem
            key={alert.id}
            alert={alert}
            onPress={() => onAlertPress && onAlertPress(alert)}
          />
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
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  listContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
});
