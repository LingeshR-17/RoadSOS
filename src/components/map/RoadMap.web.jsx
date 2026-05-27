import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function RoadMap({
  userLocation,
  hospital,
  route,
  bystanders = [],
  blackspots = [],
  showHospitals = true,
  showBystanders = false,
  showBlackspots = false,
}) {
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.radarBackground}>
        {/* Mock Grid Lines */}
        <View style={styles.gridLineH} />
        <View style={styles.gridLineH2} />
        <View style={styles.gridLineV} />
        <View style={styles.gridLineV2} />

        {/* Simulated Route */}
        {showHospitals && <View style={styles.fallbackRoute} />}

        {/* Mock User Node */}
        <View style={[styles.node, styles.userNode]}>
          <View style={styles.userMarkerOuter}>
            <View style={styles.userMarkerInner} />
          </View>
          <Text style={styles.nodeLabel}>You (Active)</Text>
        </View>

        {/* Mock Hospital Node */}
        {showHospitals && hospital && (
          <View style={[styles.node, styles.hospitalNode]}>
            <View style={styles.hospitalMarkerContainer}>
              <Ionicons name="medical" size={16} color={COLORS.card} />
            </View>
            <Text style={styles.nodeLabel}>{hospital.name}</Text>
          </View>
        )}

        {/* Mock Bystanders */}
        {showBystanders && bystanders.map((b, idx) => (
          <View key={b.id || idx} style={[styles.node, styles.bystanderNode, { left: `${42 + idx * 10}%`, top: `${52 + idx * 8}%` }]}>
            <View style={styles.bystanderMarkerContainer}>
              <Ionicons name="people" size={12} color={COLORS.card} />
            </View>
            <Text style={styles.nodeLabel}>{b.name}</Text>
          </View>
        ))}

        {/* Mock Blackspots */}
        {showBlackspots && blackspots.map((bs, idx) => (
          <View key={bs.id || idx} style={[styles.node, styles.blackspotNode, { left: `${25 + idx * 8}%`, top: `${42 + idx * 14}%` }]}>
            <View style={styles.blackspotMarkerContainer}>
              <Ionicons name="warning" size={12} color={COLORS.card} />
            </View>
            <Text style={styles.nodeLabel}>{bs.name}</Text>
          </View>
        ))}

        {/* Map UI Details overlay */}
        <View style={styles.gpsBanner}>
          <Ionicons name="navigate" size={12} color={COLORS.success} />
          <Text style={styles.gpsBannerText}>
            Web Emulator Active • 
            {showHospitals ? ' Hospitals' : ''}
            {showBystanders ? ' • Bystanders' : ''}
            {showBlackspots ? ' • Blackspots' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF2F6',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '30%',
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '60%',
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '35%',
    width: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  gridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '70%',
    width: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  fallbackRoute: {
    position: 'absolute',
    left: '42%',
    top: '40%',
    width: '32%',
    height: '25%',
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
    borderStyle: 'solid',
    opacity: 0.7,
  },
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNode: {
    left: '35%',
    top: '62%',
  },
  hospitalNode: {
    left: '70%',
    top: '35%',
  },
  bystanderNode: {
    zIndex: 2,
  },
  blackspotNode: {
    zIndex: 2,
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.secondary}30`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  hospitalMarkerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bystanderMarkerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    borderWidth: 1.5,
    borderColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackspotMarkerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warning,
    borderWidth: 1.5,
    borderColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
    backgroundColor: COLORS.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gpsBanner: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  gpsBannerText: {
    fontSize: 11,
    color: COLORS.card,
    fontWeight: '700',
    marginLeft: 6,
  },
});
