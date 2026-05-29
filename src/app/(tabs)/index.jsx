import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoadMap from '../../components/map/RoadMap';
import { useLocation } from '../../hooks/useLocation';
import { useNearestHospital } from '../../hooks/useNearestHospital';
import { useUserStore } from '../../store/userStore';
import { api } from '../../services/api';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

export default function MapViewportScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { userToken } = useUserStore();
  const { location } = useLocation();
  const { hospital, route } = useNearestHospital();

  // ── Layer Toggles ──
  const [showHospitals, setShowHospitals] = useState(true);
  const [showBystanders, setShowBystanders] = useState(false);
  const [showBlackspots, setShowBlackspots] = useState(false);
  const [bystanders, setBystanders] = useState([]);
  const [blackspots, setBlackspots] = useState([]);

  // ── HUD Card animations ──
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const cardAnim = useRef(new Animated.Value(1)).current;

  // ── SOS Long-Press States & Scale Mechanics ──
  const [isHolding, setIsHolding] = useState(false);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef(null);

  // ── SOS Decision Modal ──
  const [isEmergencyModalVisible, setIsEmergencyModalVisible] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(3);
  const countdownIntervalRef = useRef(null);
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;

  // ── Deep-link focus params ──
  useEffect(() => {
    if (params.focus) {
      if (params.focus === 'bystanders') {
        setShowBystanders(true); setShowHospitals(false); setShowBlackspots(false);
      } else if (params.focus === 'blackspots') {
        setShowBlackspots(true); setShowHospitals(false); setShowBystanders(false);
      } else if (params.focus === 'hospital') {
        setShowHospitals(true); setShowBystanders(false); setShowBlackspots(false);
      }
    }
  }, [params.focus]);

  // ── Fetch bystanders ──
  useEffect(() => {
    if (showBystanders && bystanders.length === 0) {
      api.fetchNearbyBystanders(userToken, location.latitude, location.longitude)
        .then(setBystanders)
        .catch((err) => console.error('[MapViewport] Error fetching bystanders:', err));
    }
  }, [showBystanders, location, userToken]);

  // ── Fetch blackspots ──
  useEffect(() => {
    if (showBlackspots && blackspots.length === 0) {
      api.fetchTrafficBlackspots(userToken, location.latitude, location.longitude)
        .then(setBlackspots)
        .catch((err) => console.error('[MapViewport] Error fetching blackspots:', err));
    }
  }, [showBlackspots, location, userToken]);

  // ── HUD Card Toggle ──
  const toggleCard = () => {
    const toValue = isCardMinimized ? 1 : 0;
    Animated.spring(cardAnim, {
      toValue, friction: 8, tension: 65, useNativeDriver: false,
    }).start();
    setIsCardMinimized(!isCardMinimized);
  };

  const cardHeight = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [56, 220] });
  const contentOpacity = cardAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const chevronRotate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] });

  // ────────────────────────────────────────────────────────────────────────────
  // SOS LONG-PRESS LOGIC (Remapped to the new top panel component)
  // ────────────────────────────────────────────────────────────────────────────
  const handlePressIn = () => {
    setIsHolding(true);
    Animated.parallel([
      Animated.timing(progressAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
      Animated.timing(fillAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
    ]).start();

    holdTimer.current = setTimeout(() => {
      triggerEmergency();
    }, 2000);
  };

  const handlePressOut = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    setIsHolding(false);
    Animated.parallel([
      Animated.timing(progressAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(fillAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  const clearEmergencyTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const triggerEmergency = () => {
    handlePressOut();
    clearEmergencyTimers();
    setEmergencyCountdown(3);
    setIsEmergencyModalVisible(true);

    let timeLeft = 3;
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setEmergencyCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearEmergencyTimers();
        setIsEmergencyModalVisible(false);
        router.push('/emergency');
      }
    }, 1000);
  };

  const handleVictimPress = () => {
    clearEmergencyTimers();
    setIsEmergencyModalVisible(false);
    router.push('/emergency');
  };

  const handleBystanderPress = () => {
    clearEmergencyTimers();
    setIsEmergencyModalVisible(false);
    router.push('/bystander');
  };

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      clearEmergencyTimers();
      setIsEmergencyModalVisible(false);
      if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    });
    return () => {
      unsubscribeBlur();
      clearEmergencyTimers();
      if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    };
  }, [navigation]);

  useEffect(() => {
    if (isEmergencyModalVisible) {
      Animated.spring(modalScaleAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
    } else {
      modalScaleAnim.setValue(0.9);
    }
  }, [isEmergencyModalVisible]);

  return (
    <View style={styles.container}>
      {/* Full-screen Map remains perfectly untouched */}
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

      {/* ── NEW UNIFIED TOP DASHBOARD HEADER LAYER ── */}
      <View style={[styles.topDashboardHeader, { paddingTop: insets.top + 12 }]}>

        {/* Left Side: Image 2 Welcome Greeting */}
        <View style={styles.greetingStack}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subWelcomeText}>System armed & monitoring</Text>
        </View>

        {/* Right Side: Re-styled Image 1 Large White Pod with holding mechanics */}
        <Animated.View style={[styles.sosPodContainer, { transform: [{ scale: progressAnim }] }]}>
          <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <View style={styles.sosCardInner}>
              <View style={[styles.sosRingOuter, isHolding && styles.sosRingOuterActive]}>
                <View style={styles.sosButtonRed}>
                  <Text style={styles.sosTextLabel}>SOS</Text>
                  <Text style={styles.sosSubtextLabel}>HOLD</Text>
                </View>
              </View>
              <Text style={styles.sosInstructionHint}>Hold 2s</Text>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>

      {/* ── FLOATING LAYER TOGGLES ── */}
      <View style={[styles.layersPanel, { top: insets.top + 130 }]}>
        <Text style={styles.panelTitle}>Layers</Text>

        <TouchableOpacity
          style={[styles.layerBtn, showHospitals && styles.layerBtnActive]}
          onPress={() => setShowHospitals(!showHospitals)}
          activeOpacity={0.8}
        >
          <Ionicons name="medical" size={14} color={showHospitals ? COLORS.card : COLORS.primary} />
          <Text style={[styles.layerText, showHospitals && styles.layerTextActive]}>Hospitals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.layerBtn, showBystanders && styles.layerBtnActiveBlue]}
          onPress={() => setShowBystanders(!showBystanders)}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={14} color={showBystanders ? COLORS.card : COLORS.secondary} />
          <Text style={[styles.layerText, showBystanders && styles.layerTextActive]}>Bystanders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.layerBtn, showBlackspots && styles.layerBtnActiveOrange]}
          onPress={() => setShowBlackspots(!showBlackspots)}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={14} color={showBlackspots ? COLORS.card : COLORS.warning} />
          <Text style={[styles.layerText, showBlackspots && styles.layerTextActive]}>Hazards</Text>
        </TouchableOpacity>
      </View>

      {/* ── HOSPITAL ROUTING HUD CARD (fully unblocked at bottom) ── */}
      {showHospitals && (
        <Animated.View style={[styles.floatingCard, { height: cardHeight }]}>
          <TouchableOpacity style={styles.headerRow} onPress={toggleCard} activeOpacity={0.7}>
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

      {/* ── SOS DECISION MODAL ── */}
      <Modal
        visible={isEmergencyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleVictimPress}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContainer,
            { transform: [{ scale: modalScaleAnim }] },
          ]}>
            <Text style={styles.modalTitle}>EMERGENCY DETECTED</Text>

            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{emergencyCountdown}</Text>
              <Text style={styles.countdownSubtext}>seconds</Text>
            </View>

            <Text style={styles.modalDescription}>
              Are you the Victim or a Bystander? If you do not respond in {emergencyCountdown}s,
              we will automatically route you to Emergency Services.
            </Text>

            <TouchableOpacity
              style={styles.victimButton}
              onPress={handleVictimPress}
              activeOpacity={0.8}
            >
              <Text style={styles.victimButtonText}>🚨 I am the Victim</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bystanderButton}
              onPress={handleBystanderPress}
              activeOpacity={0.8}
            >
              <Text style={styles.bystanderButtonText}>👋 I am a Bystander</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── NEW UNIFIED DUAL HEADER SECTION ──
  topDashboardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(9, 11, 14, 0.75)', // Blur matching transparency
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    zIndex: 100,
  },
  greetingStack: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 12,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subWelcomeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  // ── IMAGE 1 STYLE RE-ENGINEERED SOS BUTTON POD ──
  sosPodContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    height: 105,
    ...SHADOWS.md,
  },
  sosCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sosRingOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFD1D4', // Outer soft danger ring placeholder matching Image 1
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosRingOuterActive: {
    backgroundColor: '#FFA3A8',
  },
  sosButtonRed: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E63946', // Primary core red button
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  sosTextLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosSubtextLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 7,
    fontWeight: '800',
    marginTop: -1,
  },
  sosInstructionHint: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // ── LAYERS PANEL ──
  layersPanel: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || '#E2E8F0',
    padding: 10,
    width: 116,
    ...SHADOWS.md,
    zIndex: 99,
  },
  panelTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textMuted || '#64748B',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  layerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  layerBtnActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  layerBtnActiveBlue: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  layerBtnActiveOrange: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  layerText: { fontSize: 10, fontWeight: '700', color: '#334155', marginLeft: 6 },
  layerTextActive: { color: '#FFFFFF' },

  // ── HUD CARD ──
  floatingCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 76,
    left: 16,
    right: 16,
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border || '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 16,
    overflow: 'hidden',
    ...SHADOWS.lg,
    zIndex: 99,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  cardSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  expandableContent: { paddingBottom: 16 },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  detailText: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginLeft: 6 },
  navigateBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  navigateBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  btnIcon: { marginLeft: 4 },

  // ── EMERGENCY DECISION MODAL ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(230, 57, 70, 0.2)',
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E63946',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  countdownContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(230, 57, 70, 0.05)',
  },
  countdownText: { fontSize: 34, fontWeight: '900', color: '#E63946' },
  countdownSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  modalDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  victimButton: {
    width: '100%',
    backgroundColor: '#E63946',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.md,
  },
  victimButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  bystanderButton: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bystanderButtonText: { color: '#1E293B', fontSize: 16, fontWeight: '700' },
});