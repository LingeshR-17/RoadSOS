import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

/**
 * OnSceneToolkitScreen
 * Ported from HananLawson7/ROADSoS_Lawson — app/emergency/on-scene-toolkit.jsx
 *
 * Shown when a Bystander confirms they are responding to an incident.
 * Provides an interactive triage checklist for first-responder guidance.
 */
export default function OnSceneToolkitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checkedSteps, setCheckedSteps] = useState({});

  const toggleStep = (id) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const triageSteps = [
    {
      id: 1,
      icon: '🛑',
      title: '1. Secure the Environment',
      desc: "Ensure your vehicle's hazards are ON. Park 50 m clear of the crash to shield the area from oncoming traffic.",
    },
    {
      id: 2,
      icon: '🗣️',
      title: '2. Assess Responsiveness',
      desc: 'Speak loudly to the victim. Ask if they can hear you. Avoid moving them unless there is an immediate danger of fire.',
    },
    {
      id: 3,
      icon: '🩸',
      title: '3. Control Severe Bleeding',
      desc: 'Locate injuries. Apply firm, continuous direct pressure with a clean cloth or trauma kit. Keep them warm.',
    },
    {
      id: 4,
      icon: '📱',
      title: '4. Maintain Relay Communication',
      desc: 'Stay on the line with dispatch if connected. Report whether the victim is conscious or unconscious.',
    },
  ];

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const allDone = completedCount === triageSteps.length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0B0F19" />

      {/* Top success banner */}
      <View style={[styles.successBanner, { paddingTop: insets.top + 10 }]}>
        <View style={styles.pulseDot} />
        <View style={styles.bannerTextWrap}>
          <Text style={styles.bannerTitle}>YOU ARE ON SCENE</Text>
          <Text style={styles.bannerSubtitle}>First responders notified of your arrival.</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable triage checklist */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>CRITICAL ACTION PROTOCOL</Text>
        <Text style={styles.sectionSubtitle}>
          Complete each step in order. Tap a step to mark it done.
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(completedCount / triageSteps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {completedCount} / {triageSteps.length} steps completed
        </Text>

        {triageSteps.map((step) => {
          const done = !!checkedSteps[step.id];
          return (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepCard, done && styles.stepCardDone]}
              onPress={() => toggleStep(step.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCheckbox, done && styles.stepCheckboxDone]}>
                <Text style={styles.stepCheckmark}>{done ? '✓' : ''}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <View style={styles.stepTextBlock}>
                  <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Completion CTA */}
        {allDone && (
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>✅</Text>
            <Text style={styles.completionTitle}>Protocol Complete</Text>
            <Text style={styles.completionSubtitle}>
              Professional responders are en route. Stay with the victim until relieved.
            </Text>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.85}
            >
              <Text style={styles.completionButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    marginRight: 12,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '700',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },

  // Progress
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.round,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'right',
  },

  // Step cards
  stepCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  stepCardDone: {
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  stepCheckboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepCheckmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  stepBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 1,
  },
  stepTextBlock: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepTitleDone: {
    color: COLORS.success,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  // Completion
  completionCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.success,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  completionEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  completionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  completionButton: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.sm,
  },
  completionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
