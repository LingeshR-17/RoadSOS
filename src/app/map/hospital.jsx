import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RoadMap from '../../components/map/RoadMap';
import { useLocation } from '../../hooks/useLocation';
import { useNearestHospital } from '../../hooks/useNearestHospital';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

export default function HospitalDetailScreen() {
  const router = useRouter();
  const { location } = useLocation();
  const { hospital, route } = useNearestHospital();

  const handleGetDirections = () => {
    Alert.alert(
      "Directions",
      `Launching map guidance for ${hospital.name} (${hospital.distance}).\nEstimated time: ${hospital.duration}`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Map Component */}
      <RoadMap 
        userLocation={location} 
        hospital={hospital} 
        route={route} 
      />

      {/* Floating Back Action Circle */}
      <TouchableOpacity 
        style={styles.backButton} 
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
      </TouchableOpacity>

      {/* Floating GPS Recenter button */}
      <TouchableOpacity 
        style={styles.recenterButton} 
        activeOpacity={0.8}
        onPress={() => Alert.alert("GPS Synced", "User coordinates aligned in center.")}
      >
        <Ionicons name="locate" size={22} color={COLORS.secondary} />
      </TouchableOpacity>

      {/* Bottom sliding info card */}
      <View style={styles.slidingCard}>
        {/* Drag handle line indicator */}
        <View style={styles.dragHandle} />

        <View style={styles.headerInfo}>
          <View style={styles.hospitalLabelContainer}>
            <Text style={styles.hospitalTag}>NEAREST RESCUE</Text>
          </View>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.hospitalAddress}>{hospital.address}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statColumn}>
            <View style={styles.statIconCircle}>
              <Ionicons name="navigate" size={18} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{hospital.distance}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statColumn}>
            <View style={[styles.statIconCircle, { backgroundColor: `${COLORS.success}12` }]}>
              <Ionicons name="time" size={18} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{hospital.duration}</Text>
            <Text style={styles.statLabel}>Est. Travel Time</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.directionsButton} 
          activeOpacity={0.8}
          onPress={handleGetDirections}
        >
          <Ionicons name="compass" size={20} color={COLORS.card} style={styles.directionsIcon} />
          <Text style={styles.directionsBtnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    zIndex: 10,
  },
  recenterButton: {
    position: 'absolute',
    top: 55,
    right: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    zIndex: 10,
  },
  slidingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  headerInfo: {
    marginBottom: SPACING.md,
  },
  hospitalLabelContainer: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  hospitalTag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '850',
    color: COLORS.text,
  },
  hospitalAddress: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.secondary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.border,
  },
  directionsButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  directionsIcon: {
    marginRight: 6,
  },
  directionsBtnText: {
    color: COLORS.card,
    fontSize: 15,
    fontWeight: '700',
  },
});
