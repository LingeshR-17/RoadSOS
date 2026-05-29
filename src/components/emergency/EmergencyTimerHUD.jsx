import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function EmergencyTimerHUD({ countdown, maxDuration = 10, isActive, isSafeState, isBystanderMode }) {
  const pulseScale = useSharedValue(1);

  // Determine accent color theme based on app state safely
  const emergencyColor = COLORS.primary || '#E63946';
  const bystanderColor = COLORS.secondary || '#3B82F6';
  const safeColor = '#10B981';

  let accentColor = emergencyColor;
  if (isSafeState) {
    accentColor = safeColor;
  } else if (isBystanderMode) {
    accentColor = bystanderColor;
  }

  // Pure warning pulse effect for high urgency
  useEffect(() => {
    if (isActive && !isSafeState) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1.0, { duration: 200 });
    }
  }, [isActive, isSafeState]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  // Calculate percentage width for the linear tracking meter
  const progressPercent = Math.max(0, Math.min(100, (countdown / maxDuration) * 100));

  return (
    <AnimatedView style={[styles.panelContainer, animatedContainerStyle, { borderColor: `${accentColor}30` }]}>
      
      {/* Upper Status Ticker row */}
      <View style={styles.tickerRow}>
        <Text style={[styles.statusText, { color: accentColor }]}>
          {isSafeState ? '● PROTOCOL SECURED' : isActive ? '● BROADCAST LIVE T-MINUS' : '● SYSTEM STANDBY'}
        </Text>
        <Text style={styles.hzText}>144.800 MHz</Text>
      </View>

      {/* Main Digital Clock Display Area */}
      <View style={styles.clockDisplay}>
        {isSafeState ? (
          <Text style={[styles.bigTimerDigits, { color: safeColor }]}>SAFE</Text>
        ) : (
          <View style={styles.timerRow}>
            <Text style={styles.bigTimerDigits}>
              {String(Math.floor(countdown)).padStart(2, '0')}
            </Text>
            <Text style={styles.msDigits}>.{String(Math.floor((countdown % 1) * 100)).padStart(2, '0')}</Text>
            <Text style={styles.unitText}>SEC</Text>
          </View>
        )}
      </View>

      {/* Linear Track Progress Bar Meter */}
      <View style={styles.trackBackground}>
        <View 
          style={[
            styles.trackFill, 
            { 
              width: `${progressPercent}%`, 
              backgroundColor: accentColor,
              shadowColor: accentColor
            }
          ]} 
        />
      </View>

      {/* Footer System Instructions Label */}
      <Text style={styles.helperInstructions}>
        {isSafeState ? 'SOS ALARM DISARMED SUCCESSFULLY' : 'CRITICAL CRISIS LIFELINE TRANSMISSION ACTIVE'}
      </Text>
    </AnimatedView>
  );
}

// Quick fallback definitions for Reanimated views inside sub-components
const AnimatedView = Animated.View;

const styles = StyleSheet.create({
  panelContainer: {
    width: '100%',
    backgroundColor: COLORS.card || '#11141b',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md || 16,
    padding: SPACING.md || 16,
    marginVertical: SPACING.sm || 12,
  },
  tickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  hzText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clockDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bigTimerDigits: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  msDigits: {
    color: '#64748B',
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginRight: 6,
  },
  unitText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  trackBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 10,
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  helperInstructions: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});