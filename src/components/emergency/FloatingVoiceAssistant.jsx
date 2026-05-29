import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function FloatingVoiceAssistant() {
  const segments = useSegments();
  const router = useRouter();

  // Hide the floating assistant on auth (login/onboarding) and emergency screens
  const isHidden = 
    segments.includes('(auth)') || 
    segments.includes('login') || 
    segments.includes('onboarding') ||
    segments.includes('emergency');

  if (isHidden) return null;

  const handleVoiceTriggerCall = () => {
    stopAssistant();
    // Navigate immediately to the detailed emergency route
    router.push('/emergency');
  };

  const handleVoiceStop = () => {
    // Stop event handled by hook
  };

  const {
    isListening,
    assistantMessage,
    startAssistant,
    stopAssistant,
    isSimulated,
    simulateVoiceInput,
  } = useVoiceAssistant(handleVoiceTriggerCall, handleVoiceStop);

  const pulseValue = useSharedValue(1);

  // Pulse effect when voice engine is actively listening
  useEffect(() => {
    if (isListening) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 750, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 750, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseValue.value = withTiming(1.0, { duration: 300 });
    }
  }, [isListening]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
    };
  });

  const handlePress = () => {
    if (isListening) {
      stopAssistant();
    } else {
      startAssistant('en'); // Defaults to english activation
    }
  };

  // Do not overlay anything if not listening, just show the micro button
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Sleek Glassmorphic Floating Status Card */}
      {isListening && (
        <View style={styles.overlayCard}>
          <View style={styles.cardHeader}>
            <View style={styles.pulseContainer}>
              <View style={styles.redDot} />
              <View style={styles.redDotRipple} />
            </View>
            <Text style={styles.cardTitle}>ROAD SOS AI VOICE</Text>
          </View>
          
          <Text style={styles.cardMessage} numberOfLines={2}>
            {assistantMessage}
          </Text>

          {/* Quick Simulation Chips for Expo Go environment testing */}
          {isSimulated && (
            <View style={styles.simWrapper}>
              <Text style={styles.simTitle}>Voice Command Simulator:</Text>
              <View style={styles.chipRow}>
                {[
                  { label: 'Ambulance', cmd: 'call ambulance' },
                  { label: 'Stop', cmd: 'stop emergency' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => simulateVoiceInput(item.cmd)}
                    style={styles.simChip}
                  >
                    <Text style={styles.simChipText}>🎙️ "{item.label}"</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Floating Trigger Button */}
      <AnimatedTouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[
          styles.floatingButton,
          isListening ? styles.activeButton : styles.inactiveButton,
          animatedButtonStyle,
        ]}
      >
        <Ionicons 
          name={isListening ? "mic" : "mic-outline"} 
          size={26} 
          color="#ffffff" 
        />
      </AnimatedTouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 125 : 95, // Floating cleanly above bottom tab bar
    right: 20,
    left: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff2d55',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  inactiveButton: {
    backgroundColor: '#E63946', // Vibrant safety red
    shadowColor: '#E63946',
  },
  activeButton: {
    backgroundColor: '#ff2d55', // Pulsing neon emergency pink
    shadowColor: '#ff2d55',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  overlayCard: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    width: Dimensions.get('window').width - 40,
    backgroundColor: 'rgba(9, 11, 14, 0.95)', // Midnight glass background
    borderWidth: 1.5,
    borderColor: 'rgba(255, 45, 85, 0.25)', // Glow border
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pulseContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff2d55',
  },
  redDotRipple: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 45, 85, 0.3)',
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8e8e93',
  },
  cardMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 18,
  },
  simWrapper: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  simTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  simChip: {
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 85, 0.4)',
    backgroundColor: 'rgba(255, 45, 85, 0.08)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  simChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ff2d55',
  },
});
