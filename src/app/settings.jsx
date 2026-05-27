import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsToggleRow from '../components/settings/SettingsToggleRow';
import { useUserStore } from '../store/userStore';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, toggleSetting } = useUserStore();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.versionInfo}>RoadSoS v1.0.0</Text>
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Settings list */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* EMERGENCY SECTION */}
        <SettingsSection title="EMERGENCY">
          <SettingsToggleRow
            icon="shield-checkmark-outline"
            iconColor={COLORS.primary}
            title="Auto SOS Detection"
            subtitle="Crash detect via sensors"
            value={settings.autoSosDetection}
            onValueChange={() => toggleSetting('autoSosDetection')}
          />
          <SettingsToggleRow
            icon="mic-outline"
            iconColor={COLORS.secondary}
            title="Voice Wake Word"
            subtitle="&quot;RoadSoS help me&quot;"
            value={settings.voiceWakeWord}
            onValueChange={() => toggleSetting('voiceWakeWord')}
          />
          <SettingsToggleRow
            icon="chatbox-ellipses-outline"
            iconColor={COLORS.success}
            title="SMS Fallback"
            subtitle="When no internet"
            value={settings.smsFallback}
            onValueChange={() => toggleSetting('smsFallback')}
            isLast={true}
          />
        </SettingsSection>

        {/* ALERTS SECTION */}
        <SettingsSection title="ALERTS">
          <SettingsToggleRow
            icon="notifications-outline"
            iconColor={COLORS.secondary}
            title="Nearby Accident Alerts"
            subtitle="Within 5 km radius"
            value={settings.nearbyAccidentAlerts}
            onValueChange={() => toggleSetting('nearbyAccidentAlerts')}
          />
          <SettingsToggleRow
            icon="warning-outline"
            iconColor={COLORS.warning}
            title="Blackspot Warnings"
            subtitle="Dangerous road zones"
            value={settings.blackspotWarnings}
            onValueChange={() => toggleSetting('blackspotWarnings')}
            isLast={true}
          />
        </SettingsSection>

        {/* APP SECTION */}
        <SettingsSection title="APP">
          <SettingsToggleRow
            icon="globe-outline"
            iconColor={COLORS.textMuted}
            title="Language"
            subtitle="English · Tamil available"
            hasChevron={true}
            onPress={() => Alert.alert("Language Selected", "Current Language: English. Tamil support is pre-loaded.", [{ text: "OK" }])}
          />
          <SettingsToggleRow
            icon="lock-closed-outline"
            iconColor={COLORS.textMuted}
            title="Privacy"
            subtitle="Data sharing settings"
            hasChevron={true}
            onPress={() => Alert.alert("Privacy Configs", "Data sharing is encrypted and locally saved.", [{ text: "OK" }])}
            isLast={true}
          />
        </SettingsSection>

        {/* Log Out Button */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              "Sign Out",
              "Are you sure you want to sign out of RoadSoS?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: () => router.replace('/(auth)/login') }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 55,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  versionInfo: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  headerRightPlaceholder: {
    width: 40, // mirrors backbutton for symmetry
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  logoutBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  logoutIcon: {
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
