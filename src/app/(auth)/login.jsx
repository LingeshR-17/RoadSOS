import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/userStore';
import { api } from '../../services/api';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithOtp, loginWithGoogle } = useUserStore();
  
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Forgot Password / Recovery Modal State
  const [recoverModalVisible, setRecoverModalVisible] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  const generateOtp = () => {
    // Generate a random 4-digit OTP for demo purposes
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    return code;
  };

  const handleContinue = async () => {
    setError('');
    if (step === 1) {
      if (phoneNumber.length < 10) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }
      setLoading(true);
      try {
        await api.requestOtp(phoneNumber);
        const code = generateOtp();
        setStep(2);
      } catch (err) {
        setError('Failed to send OTP code. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (otp.length < 4) {
        setError('Please enter the 4-digit verification code');
        return;
      }
      if (otp !== generatedOtp) {
        setError('Incorrect OTP. Please check the code and try again.');
        return;
      }
      setLoading(true);
      try {
        const { isOnboarded } = await loginWithOtp(phoneNumber, otp);
        if (isOnboarded) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/onboarding');
        }
      } catch (err) {
        setError('Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // Pass a simulated oauth token
      const { isOnboarded } = await loginWithGoogle('google-oauth-identity-token-xyz');
      if (isOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/onboarding');
      }
    } catch (err) {
      setError('Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async () => {
    setRecoveryError('');
    if (!recoveryInput.trim()) {
      setRecoveryError('Please enter your phone number or email.');
      return;
    }
    setRecoveryLoading(true);
    try {
      await api.recoverAccount(recoveryInput);
      setRecoverModalVisible(false);
      setRecoveryInput('');
      Alert.alert(
        'Recovery Code Sent',
        'We have sent a verification code to reset your login PIN.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      setRecoveryError('Failed to verify account. Check your input.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Back button for OTP step */}
          {step === 2 && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setStep(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          )}

          {/* Logo & Header */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={42} color={COLORS.primary} />
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.appName}>RoadSoS</Text>
            <Text style={styles.appTagline}>Emergency Roadside Rescue Network</Text>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>
              {step === 1 ? 'Verify Phone Number' : 'Enter OTP Verification'}
            </Text>
            <Text style={styles.stepSubtitle}>
              {step === 1 
                ? 'Enter your phone number to request a secure OTP.' 
                : `We sent a 4-digit code to +91 ${phoneNumber}`}
            </Text>

            {step === 2 && (
              <View style={styles.demoBanner}>
                <Ionicons name="information-circle" size={16} color={COLORS.secondary} />
                <Text style={styles.demoBannerText}>
                  Demo OTP: <Text style={styles.demoBannerCode}>{generatedOtp}</Text>
                </Text>
              </View>
            )}

            {step === 1 ? (
              // Phase 1: Phone input
              <View style={styles.inputWrapper}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="98400 00000"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(txt) => {
                    setPhoneNumber(txt.replace(/[^0-9]/g, ''));
                    if (error) setError('');
                  }}
                  autoFocus
                />
              </View>
            ) : (
              // Phase 2: OTP input
              <View style={styles.otpInputWrapper}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="0 0 0 0"
                  placeholderTextColor={COLORS.border}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={(txt) => {
                    setOtp(txt.replace(/[^0-9]/g, ''));
                    if (error) setError('');
                  }}
                  secureTextEntry
                  autoFocus
                />
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Action button */}
            <TouchableOpacity 
              style={[styles.continueButton, loading && styles.disabledButton]} 
              activeOpacity={0.8}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.card} />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    {step === 1 ? 'Continue' : 'Verify & Sign In'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.card} style={styles.btnIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* Google Sign In Option */}
            {step === 1 && (
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            {step === 1 && (
              <TouchableOpacity
                style={styles.googleButton}
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={18} color={COLORS.primary} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Sign In with Google</Text>
              </TouchableOpacity>
            )}

            {/* Recovery / Forgot PIN links */}
            <View style={styles.recoveryRow}>
              {step === 2 ? (
                <TouchableOpacity style={styles.resendBtn} activeOpacity={0.6}>
                  <Text style={styles.resendBtnText}>Didn't receive code? Resend SMS</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.forgotBtn} 
                  activeOpacity={0.6}
                  onPress={() => setRecoverModalVisible(true)}
                >
                  <Text style={styles.forgotBtnText}>Forgot PIN / Password?</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Footer legal text */}
        <Text style={styles.footerText}>
          By signing in, you agree to our Terms of Service & Privacy Policy
        </Text>

        {/* Forgot PIN / Account Recovery Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={recoverModalVisible}
          onRequestClose={() => setRecoverModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setRecoverModalVisible(false)}
          >
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Recover Account</Text>
              <Text style={styles.modalSubtitle}>
                Enter your registered mobile number or email address and we'll send you recovery details.
              </Text>

              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 98400 00000 or name@domain.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={recoveryInput}
                  onChangeText={setRecoveryInput}
                  autoCapitalize="none"
                />
              </View>

              {recoveryError ? <Text style={styles.modalError}>{recoveryError}</Text> : null}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalCancelBtn]} 
                  onPress={() => setRecoverModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalSubmitBtn]} 
                  onPress={handleRecoverySubmit}
                  disabled={recoveryLoading}
                >
                  {recoveryLoading ? (
                    <ActivityIndicator color={COLORS.card} />
                  ) : (
                    <Text style={styles.submitText}>Recover</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    ...SHADOWS.md,
  },
  pulseDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: SPACING.md,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  countryCodeContainer: {
    paddingHorizontal: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    height: 50,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  otpInputWrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    height: 50,
    width: '100%',
    letterSpacing: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  continueButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.8,
  },
  continueButtonText: {
    color: COLORS.card,
    fontSize: 15,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: SPACING.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: SPACING.sm,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  googleButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: SPACING.sm,
  },
  googleButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  recoveryRow: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  resendBtn: {
    alignItems: 'center',
  },
  resendBtnText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  forgotBtn: {
    alignItems: 'center',
  },
  forgotBtnText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.secondary}10`,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}30`,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  demoBannerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoBannerCode: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingBottom: 25,
    paddingHorizontal: SPACING.xl,
    lineHeight: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: SPACING.md,
  },
  modalInputWrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    height: 48,
    justifyContent: 'center',
  },
  modalInput: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
  },
  modalError: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: COLORS.lightBg,
    marginRight: SPACING.sm,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primaryDark,
    marginLeft: SPACING.sm,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.card,
  },
});
