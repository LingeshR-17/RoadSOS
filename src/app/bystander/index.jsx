import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

/**
 * BystanderIntakeScreen
 *
 * Localized Bystander Intake Form screen for reporting crash scene details.
 * Performs background GPS tracking, provides manual incident reporting input,
 * simulates photo capture, and triggers multi-channel dispatch broadcast simulation.
 */
export default function BystanderIntakeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State
  const [details, setDetails] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  
  // Location State
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // Dispatch overlay state
  const [isDispatching, setIsDispatching] = useState(false);

  // Fetch coordinates on mount
  useEffect(() => {
    async function getGPSLocation() {
      try {
        setLocationLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('GPS permission denied. Using fallback telemetry.');
          // Graceful fallback to simulated coordinates (e.g. near the accident)
          setLocation({
            coords: {
              latitude: 12.971598,
              longitude: 77.594566,
            }
          });
          setLocationLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
        setLocationError(null);
      } catch (err) {
        console.error('Error fetching GPS coordinates:', err);
        setLocationError('GPS Timeout. Using fallback telemetry.');
        setLocation({
          coords: {
            latitude: 12.971598,
            longitude: 77.594566,
          }
        });
      } finally {
        setLocationLoading(false);
      }
    }

    getGPSLocation();
  }, []);

  // Handle Photo simulation
  const handleSimulatePhoto = () => {
    setIsCapturingPhoto(true);
    setTimeout(() => {
      setIsCapturingPhoto(false);
      setPhotoAttached(true);
    }, 1200);
  };

  // Submit / Trigger Emergency Situation
  const handleTriggerEmergency = async () => {
    setIsDispatching(true);

    // Simulate multi-channel emergency broadcast packet transmission
    setTimeout(() => {
      setIsDispatching(false);
      // Navigate to the live toolkit page
      router.push('/bystander/on-scene-toolkit');
    }, 2500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" backgroundColor="#090b0e" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Bystander Intake Form</Text>
            <Text style={styles.headerSubtitle}>Report details to dispatch emergency support</Text>
          </View>
        </View>

        {/* 1. Live GPS Readout Panel */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Ionicons name="location" size={20} color={COLORS.secondary} style={styles.cardHeaderIcon} />
              <Text style={styles.cardTitle}>Live GPS Telemetry</Text>
            </View>
            <View style={styles.radarContainer}>
              <View style={styles.radarPulse} />
              <Text style={styles.radarLabel}>GPS LIVE</Text>
            </View>
          </View>

          {locationLoading ? (
            <View style={styles.locationLoadingArea}>
              <ActivityIndicator size="small" color={COLORS.secondary} />
              <Text style={styles.locationLoadingText}>Acquiring satellite lock...</Text>
            </View>
          ) : (
            <View style={styles.locationDataArea}>
              <View style={styles.locationRow}>
                <View style={styles.locationField}>
                  <Text style={styles.locationLabel}>LATITUDE</Text>
                  <Text style={styles.locationValue}>
                    {location?.coords?.latitude?.toFixed(6) ?? '--.------'}
                  </Text>
                </View>
                <View style={styles.locationField}>
                  <Text style={styles.locationLabel}>LONGITUDE</Text>
                  <Text style={styles.locationValue}>
                    {location?.coords?.longitude?.toFixed(6) ?? '--.------'}
                  </Text>
                </View>
              </View>
              {locationError ? (
                <View style={styles.locationWarning}>
                  <Ionicons name="warning" size={14} color={COLORS.warning} />
                  <Text style={styles.locationWarningText}>{locationError}</Text>
                </View>
              ) : (
                <Text style={styles.locationSubText}>
                  Coordinates verified via on-board mobile GPS transceiver.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* 2. Incident Details Input */}
        <View style={styles.card}>
          <View style={styles.cardHeaderTitleRow}>
            <Ionicons name="clipboard" size={20} color={COLORS.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.cardTitle}>Incident Details</Text>
            <Text style={styles.optionalTag}>(Optional)</Text>
          </View>
          <Text style={styles.cardDesc}>
            Describe visible injuries, number of victims, hazards, or crash severity.
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={details}
            onChangeText={setDetails}
            placeholder="e.g. Car collision. Two occupants conscious but trapped. Engine bay smoking."
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
          />
          
          {/* Quick chips */}
          <View style={styles.chipsRow}>
            <TouchableOpacity 
              style={styles.chip} 
              onPress={() => setDetails('Multiple-vehicle collision. Roadway partially blocked.')}
            >
              <Text style={styles.chipText}>💥 Collision</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.chip} 
              onPress={() => setDetails('Pedestrian struck by vehicle. Head trauma, breathing.')}
            >
              <Text style={styles.chipText}>🚶 Pedestrian Struck</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.chip} 
              onPress={() => setDetails('Two-wheeler accident. Minor lacerations, victim alert.')}
            >
              <Text style={styles.chipText}>🏍️ Motorcycle Down</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Mock Media Capture Node */}
        <View style={styles.card}>
          <View style={styles.cardHeaderTitleRow}>
            <Ionicons name="camera" size={20} color="#10B981" style={styles.cardHeaderIcon} />
            <Text style={styles.cardTitle}>Scene Photography</Text>
          </View>
          <Text style={styles.cardDesc}>
            Attach a photo of the incident scene to assist responders with preparation.
          </Text>

          {isCapturingPhoto ? (
            <View style={[styles.viewfinder, styles.viewfinderActive]}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.viewfinderText}>Initializing optical capture...</Text>
            </View>
          ) : photoAttached ? (
            <View style={[styles.viewfinder, styles.viewfinderSuccess]}>
              <Ionicons name="checkmark-circle" size={42} color="#10B981" />
              <Text style={styles.viewfinderTextSuccess}>Photo telemetry attached</Text>
              <TouchableOpacity onPress={() => setPhotoAttached(false)} style={styles.retakeBtn}>
                <Text style={styles.retakeBtnText}>Discard & Snap New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.viewfinder} 
              onPress={handleSimulatePhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="aperture-outline" size={48} color="rgba(255, 255, 255, 0.4)" />
              <Text style={styles.viewfinderText}>Tap to Capture Scene Photo</Text>
              <Text style={styles.viewfinderSubText}>Simulates smartphone camera view</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.triggerButton}
          onPress={handleTriggerEmergency}
          activeOpacity={0.85}
        >
          <Ionicons name="megaphone" size={22} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.triggerButtonText}>Trigger Emergency Situation</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dispatching Overlay Modal */}
      {isDispatching && (
        <View style={styles.overlayContainer}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.overlaySpinner} />
            <Text style={styles.overlayTitle}>TRANSMITTING DISTRESS SIGNAL</Text>
            <Text style={styles.overlayMessage}>
              Packaging GPS telemetry and scene reports. Broadcasting rescue payload to emergency transceivers...
            </Text>
            <View style={styles.progressBar}>
              <View style={styles.progressBarIndicator} />
            </View>
            <Text style={styles.overlayStatus}>Channel: Multi-Agency Relay (Active)</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090b0e',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  card: {
    backgroundColor: 'rgba(22, 26, 35, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  optionalTag: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  radarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  radarPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginRight: 6,
  },
  radarLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  locationLoadingArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  locationLoadingText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    marginLeft: 10,
  },
  locationDataArea: {
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  locationField: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  locationSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: 8,
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  locationWarningText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 6,
    flex: 1,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  viewfinder: {
    height: 140,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  viewfinderActive: {
    borderColor: '#10B981',
    borderStyle: 'solid',
  },
  viewfinderSuccess: {
    borderColor: '#10B981',
    borderStyle: 'solid',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  viewfinderText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.sm,
  },
  viewfinderTextSuccess: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
  },
  viewfinderSubText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  retakeBtn: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 16,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  btnIcon: {
    marginRight: 8,
  },
  triggerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9, 11, 14, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    zIndex: 9999,
  },
  overlayCard: {
    backgroundColor: '#11141b',
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.3)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.lg,
  },
  overlaySpinner: {
    marginBottom: SPACING.lg,
  },
  overlayTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  overlayMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    width: '100%',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressBarIndicator: {
    height: '100%',
    backgroundColor: COLORS.primary,
    width: '60%',
    borderRadius: 2,
  },
  overlayStatus: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
