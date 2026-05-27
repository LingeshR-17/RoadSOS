import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RoadMap from '../../components/map/RoadMap';
import { useLocation } from '../../hooks/useLocation';
import { useNearestHospital } from '../../hooks/useNearestHospital';
import { useUserStore } from '../../store/userStore';
import { api } from '../../services/api';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

export default function MapTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userToken } = useUserStore();
  const { location } = useLocation();
  const { hospital, route } = useNearestHospital();
  
  // Layer Toggles
  const [showHospitals, setShowHospitals] = useState(true);
  const [showBystanders, setShowBystanders] = useState(false);
  const [showBlackspots, setShowBlackspots] = useState(false);

  // Dynamic Markers arrays
  const [bystanders, setBystanders] = useState([]);
  const [blackspots, setBlackspots] = useState([]);

  // Card expand/minimize animations
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const cardAnim = useRef(new Animated.Value(1)).current;

  // React to deep linking parameter focus parameters
  useEffect(() => {
    if (params.focus) {
      if (params.focus === 'bystanders') {
        setShowBystanders(true);
        setShowHospitals(false);
        setShowBlackspots(false);
      } else if (params.focus === 'blackspots') {
        setShowBlackspots(true);
        setShowHospitals(false);
        setShowBystanders(false);
      } else if (params.focus === 'hospital') {
        setShowHospitals(true);
        setShowBystanders(false);
        setShowBlackspots(false);
      }
    }
  }, [params.focus]);

  // Load Bystanders dynamically when toggled active
  useEffect(() => {
    if (showBystanders && bystanders.length === 0) {
      api.fetchNearbyBystanders(userToken, location.latitude, location.longitude)
        .then(setBystanders)
        .catch((err) => console.error('[MapTab] Error fetching bystanders:', err));
    }
  }, [showBystanders, location, userToken]);

  // Load Blackspots dynamically when toggled active
  useEffect(() => {
    if (showBlackspots && blackspots.length === 0) {
      api.fetchTrafficBlackspots(userToken, location.latitude, location.longitude)
        .then(setBlackspots)
        .catch((err) => console.error('[MapTab] Error fetching blackspots:', err));
    }
  }, [showBlackspots, location, userToken]);

  const toggleCard = () => {
    const toValue = isCardMinimized ? 1 : 0;
    Animated.spring(cardAnim, {
      toValue,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start();
    setIsCardMinimized(!isCardMinimized);
  };

  // Interpolations for smooth minimize/maximize
  const cardHeight = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 220],
  });

  const contentOpacity = cardAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const chevronRotate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Dynamic Map Component */}
      <RoadMap 
        userLocation={location} 
        hospital={hospital} 
        route={route}
        bystanders={bystanders}
        blackspots={blackspots}
        showHospitals={showHospitals}
        showBystanders={showBystanders}
        showBlackspots={showBlackspots}
      />

      {/* Floating Map Layers Control Panel */}
      <View style={styles.layersPanel}>
        <Text style={styles.panelTitle}>Layers</Text>
        
        <TouchableOpacity
          style={[styles.layerBtn, showHospitals && styles.layerBtnActive]}
          onPress={() => setShowHospitals(!showHospitals)}
          activeOpacity={0.8}
        >
          <Ionicons name="medical" size={16} color={showHospitals ? COLORS.card : COLORS.primary} />
          <Text style={[styles.layerText, showHospitals && styles.layerTextActive]}>Hospitals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.layerBtn, showBystanders && styles.layerBtnActiveBlue]}
          onPress={() => setShowBystanders(!showBystanders)}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={16} color={showBystanders ? COLORS.card : COLORS.secondary} />
          <Text style={[styles.layerText, showBystanders && styles.layerTextActive]}>Bystanders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.layerBtn, showBlackspots && styles.layerBtnActiveOrange]}
          onPress={() => setShowBlackspots(!showBlackspots)}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={16} color={showBlackspots ? COLORS.card : COLORS.warning} />
          <Text style={[styles.layerText, showBlackspots && styles.layerTextActive]}>Hazards</Text>
        </TouchableOpacity>
      </View>

      {/* Hospital Routing HUD Card */}
      {showHospitals && (
        <Animated.View style={[styles.floatingCard, { height: cardHeight }]}>
          {/* Toggle Header — always visible */}
          <TouchableOpacity 
            style={styles.headerRow} 
            onPress={toggleCard} 
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="medical" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.titleInfo}>
              <Text style={styles.cardTitle}>Nearest Hospital</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{hospital.name}</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
            </Animated.View>
          </TouchableOpacity>

          {/* Expandable Content */}
          <Animated.View style={[styles.expandableContent, { opacity: contentOpacity }]}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="git-branch-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{hospital.distance}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{hospital.duration}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.navigateBtn} 
              activeOpacity={0.8}
              onPress={() => router.push('/map/hospital')}
            >
              <Text style={styles.navigateBtnText}>View Rescue Route</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.card} style={styles.btnIcon} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  layersPanel: {
    position: 'absolute',
    top: 110,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    width: 120,
    ...SHADOWS.md,
    zIndex: 99,
  },
  panelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  layerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  layerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  layerBtnActiveBlue: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  layerBtnActiveOrange: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  layerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  layerTextActive: {
    color: COLORS.card,
  },
  floatingCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 96,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.lg,
    zIndex: 99,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  expandableContent: {
    paddingBottom: SPACING.md,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  navigateBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  navigateBtnText: {
    color: COLORS.card,
    fontSize: 14,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 4,
  },
});
