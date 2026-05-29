import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

/**
 * ResponderOpenJobsScreen
 *
 * "Open Jobs" feed for drivers / professional responders.
 * Shows nearby emergency incidents that need a responder.
 * Tapping "Accept" navigates to the bystander on-scene toolkit.
 */

// Mock data — replace with real API call
const MOCK_JOBS = [
  {
    id: '1',
    type: 'Vehicle Collision',
    severity: 'HIGH',
    distance: '0.8 km',
    eta: '~2 min',
    location: 'NH-48 Junction, Madurai',
    time: 'Just now',
    victims: 2,
    icon: '🚗',
  },
  {
    id: '2',
    type: 'Motorcycle Fall',
    severity: 'MEDIUM',
    distance: '2.1 km',
    eta: '~5 min',
    location: 'Bypass Road, near KFC',
    time: '3 min ago',
    victims: 1,
    icon: '🏍️',
  },
  {
    id: '3',
    type: 'Pedestrian Hit',
    severity: 'HIGH',
    distance: '3.5 km',
    eta: '~8 min',
    location: 'Periyar Bus Stand signal',
    time: '7 min ago',
    victims: 1,
    icon: '🚶',
  },
  {
    id: '4',
    type: 'Multi-Vehicle Pileup',
    severity: 'CRITICAL',
    distance: '5.2 km',
    eta: '~12 min',
    location: 'Ring Road flyover',
    time: '12 min ago',
    victims: 4,
    icon: '💥',
  },
];

const SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  HIGH: COLORS.primary,
  MEDIUM: COLORS.warning,
  LOW: COLORS.success,
};

export default function ResponderOpenJobsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const slideAnims = useRef(MOCK_JOBS.map(() => new Animated.Value(50))).current;
  const opacityAnims = useRef(MOCK_JOBS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Staggered entrance animation
    const animations = jobs.map((_, i) =>
      Animated.parallel([
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: 400,
          delay: i * 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnims[i], {
          toValue: 1,
          duration: 400,
          delay: i * 100,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(animations).start();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate network fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleAccept = (job) => {
    Alert.alert(
      'Accept Job?',
      `Navigate to ${job.type} at ${job.location}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Navigate',
          onPress: () => router.push('/bystander/on-scene-toolkit'),
        },
      ]
    );
  };

  const handleDecline = (job) => {
    Alert.alert('Skipped', `${job.type} alert dismissed.`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Open Jobs</Text>
          <Text style={styles.headerSubtitle}>Nearby incidents awaiting response</Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {jobs.filter((j) => j.severity === 'HIGH' || j.severity === 'CRITICAL').length}
          </Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.secondary }]}>
            {jobs.reduce((sum, j) => sum + j.victims, 0)}
          </Text>
          <Text style={styles.statLabel}>Victims</Text>
        </View>
      </View>

      {/* Jobs List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {jobs.map((job, index) => (
          <Animated.View
            key={job.id}
            style={[
              styles.jobCard,
              {
                transform: [{ translateY: slideAnims[index] || new Animated.Value(0) }],
                opacity: opacityAnims[index] || new Animated.Value(1),
              },
            ]}
          >
            {/* Severity Stripe */}
            <View style={[styles.severityStripe, { backgroundColor: SEVERITY_COLORS[job.severity] || COLORS.textMuted }]} />

            <View style={styles.jobContent}>
              {/* Top Row */}
              <View style={styles.jobTopRow}>
                <Text style={styles.jobIcon}>{job.icon}</Text>
                <View style={styles.jobMeta}>
                  <Text style={styles.jobType}>{job.type}</Text>
                  <Text style={styles.jobLocation} numberOfLines={1}>{job.location}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: `${SEVERITY_COLORS[job.severity] || COLORS.textMuted}15` }]}>
                  <Text style={[styles.severityText, { color: SEVERITY_COLORS[job.severity] || COLORS.textMuted }]}>
                    {job.severity}
                  </Text>
                </View>
              </View>

              {/* Info Row */}
              <View style={styles.infoRow}>
                <View style={styles.infoChip}>
                  <Ionicons name="navigate-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.infoText}>{job.distance}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.infoText}>{job.eta}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.infoText}>{job.victims} victim{job.victims > 1 ? 's' : ''}</Text>
                </View>
                <Text style={styles.timeAgo}>{job.time}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(job)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDecline(job)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.declineBtnText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* Bottom spacer for tab bar */}
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
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOWS.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.danger,
    letterSpacing: 1,
  },

  // Stats
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginTop: -14,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },

  // Scroll
  scrollContent: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  // Job Card
  jobCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  severityStripe: {
    width: 4,
  },
  jobContent: {
    flex: 1,
    padding: SPACING.md,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  jobIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  jobMeta: {
    flex: 1,
  },
  jobType: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  jobLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Info
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBg,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  timeAgo: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  declineBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  bottomSpacer: {
    height: 110,
  },
});
