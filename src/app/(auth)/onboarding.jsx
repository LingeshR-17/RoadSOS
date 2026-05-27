import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/userStore';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useUserStore();
  
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [insurance, setInsurance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!city.trim()) {
      setError('City / Region is required.');
      return;
    }
    if (!bloodGroup) {
      setError('Please select your Blood Group.');
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding(
        name.trim(),
        city.trim(),
        bloodGroup,
        allergies.trim() || 'None',
        conditions.trim() || 'None',
        insurance.trim() || 'None'
      );
      
      Alert.alert(
        'Profile Completed',
        'Your profile has been saved. Welcome to RoadSoS!',
        [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="create" size={32} color={COLORS.secondary} />
          </View>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Please enter your medical details. This information will help emergency services locate and rescue you safely.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Lingesh K."
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError('');
                }}
              />
            </View>
          </View>

          {/* City / Location Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>City / Region *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Madurai, TN"
                placeholderTextColor={COLORS.textMuted}
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  if (error) setError('');
                }}
              />
            </View>
          </View>

          {/* Blood Group Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Blood Group *</Text>
            <View style={styles.pickerGrid}>
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = bloodGroup === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    style={[
                      styles.pickerItem,
                      isSelected && styles.pickerItemActive
                    ]}
                    onPress={() => {
                      setBloodGroup(bg);
                      if (error) setError('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerText, isSelected && styles.pickerTextActive]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Allergies Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Allergies (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="warning-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Penicillin, Peanuts (or None)"
                placeholderTextColor={COLORS.textMuted}
                value={allergies}
                onChangeText={setAllergies}
              />
            </View>
          </View>

          {/* Medical Conditions */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Medical Conditions (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="heart-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Asthma, Diabetes (or None)"
                placeholderTextColor={COLORS.textMuted}
                value={conditions}
                onChangeText={setConditions}
              />
            </View>
          </View>

          {/* Insurance */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Insurance Provider (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Star Health"
                placeholderTextColor={COLORS.textMuted}
                value={insurance}
                onChangeText={setInsurance}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.card} />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Save Profile & Continue</Text>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.card} style={styles.saveBtnIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: `${COLORS.secondary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: SPACING.sm,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    height: 48,
  },
  inputIcon: {
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    paddingRight: SPACING.md,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  pickerItem: {
    width: '23%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1%',
  },
  pickerItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  pickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  pickerTextActive: {
    color: COLORS.card,
  },
  saveBtn: {
    height: 50,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.8,
  },
  saveBtnText: {
    color: COLORS.card,
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtnIcon: {
    marginLeft: 6,
  },
});
