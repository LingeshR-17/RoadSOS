import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import GreetingHeader from '../../components/home/GreetingHeader';
import QuickActionCard from '../../components/home/QuickActionCard';
import NearbyAlertsList from '../../components/home/NearbyAlertsList';
import { useNearbyAlerts } from '../../hooks/useNearbyAlerts';
import { useLocation } from '../../hooks/useLocation';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { alerts } = useNearbyAlerts();
  const { location } = useLocation();
  
  const [isHolding, setIsHolding] = useState(false);
  const [progressText, setProgressText] = useState('Hold 2 sec to trigger emergency');
  
  const progressAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef(null);

  const handlePressIn = () => {
    setIsHolding(true);
    setProgressText('Holding... keep pressing');
    
    // Scale and pulsate animation
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: 1.15,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ]).start();

    // Start timer for 2 seconds emergency navigation
    holdTimer.current = setTimeout(() => {
      triggerEmergency();
    }, 2000);
  };

  const handlePressOut = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }
    
    setIsHolding(false);
    setProgressText('Hold 2 sec to trigger emergency');
    
    // Animate returning to normal
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fillAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  const triggerEmergency = () => {
    handlePressOut();
    // Route to friend's emergency page, using router.push
    try {
      router.push('/emergency');
    } catch (err) {
      // In case they don't have /emergency route configured yet, alert.
      Alert.alert(
        "SOS Triggered",
        "Navigating to Emergency Alert room...",
        [{ text: "OK" }]
      );
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'hospital') {
      router.push('/(tabs)/map?focus=hospital');
    } else if (action === 'bystanders') {
      router.push('/(tabs)/map?focus=bystanders');
    } else if (action === 'blackspots') {
      router.push('/(tabs)/map?focus=blackspots');
    }
  };

  const handleAlertPress = (alert) => {
    Alert.alert(
      alert.title,
      `${alert.subtitle}\nTime: ${alert.time}`,
      [{ text: "OK" }]
    );
  };

  // Interpolate progress circle fill color
  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header section */}
        <GreetingHeader onNotificationPress={() => Alert.alert("Notifications", "You have no unread safety alerts.", [{ text: "OK" }])} />

        {/* SOS Panic Trigger Card */}
        <View style={styles.sosCard}>
          <TouchableWithoutFeedback 
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View style={[
              styles.sosCircleOuter,
              { transform: [{ scale: progressAnim }] },
              isHolding && styles.sosCircleHolding
            ]}>
              {/* Inner glowing pulse */}
              <View style={styles.sosCircleInner}>
                {/* Simulated circle fill progress */}
                <Animated.View style={[styles.progressOverlay, { height: fillWidth, width: fillWidth }]} />
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSubtext}>HOLD</Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
          <Text style={[styles.progressLabel, isHolding && styles.holdingLabel]}>
            {progressText}
          </Text>
        </View>

        {/* Quick Action Widget Grid */}
        <View style={styles.gridContainer}>
          <QuickActionCard
            icon="medical"
            title="Nearest Hospital"
            value="1.2 km"
            iconColor={COLORS.primary}
            textColor={COLORS.primary}
            onPress={() => handleQuickAction('hospital')}
          />
          <QuickActionCard
            icon="people"
            title="Bystanders Near"
            value="3 active"
            iconColor={COLORS.secondary}
            textColor={COLORS.secondary}
            onPress={() => handleQuickAction('bystanders')}
          />
          <QuickActionCard
            icon="warning"
            title="Blackspot Alerts"
            value="2 nearby"
            iconColor={COLORS.warning}
            textColor={COLORS.warning}
            onPress={() => handleQuickAction('blackspots')}
          />
        </View>

        {/* Nearby Feed Alerts list */}
        <NearbyAlertsList 
          alerts={alerts} 
          onAlertPress={handleAlertPress} 
        />
        
        {/* Safety Spacer for custom bottom floating navigation bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sosCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    marginHorizontal: SPACING.lg,
    marginTop: -15, // overlapping slate header beautifully
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  sosCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  sosCircleHolding: {
    backgroundColor: `${COLORS.primary}25`,
  },
  sosCircleInner: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // clips the progress overlay
    position: 'relative',
    ...SHADOWS.dangerGlow,
  },
  progressOverlay: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(15, 23, 42, 0.25)', // deep contrast slate progress circle overlay
  },
  sosText: {
    color: COLORS.card,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    zIndex: 2,
  },
  sosSubtext: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
    zIndex: 2,
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  holdingLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg - 4,
    marginTop: SPACING.lg,
  },
  bottomSpacer: {
    height: 110, // accounts for the suspended active floating tab layout
  },
});
