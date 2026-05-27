import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { api } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState({
    initials: '',
    name: '',
    phone: '',
    city: ''
  });

  const [medicalInfo, setMedicalInfo] = useState({
    bloodGroup: '',
    allergies: '',
    conditions: '',
    insurance: ''
  });

  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const [settings, setSettings] = useState({
    autoSosDetection: true,
    voiceWakeWord: true,
    smsFallback: true,
    nearbyAccidentAlerts: true,
    blackspotWarnings: true,
    language: 'English',
    privacy: 'Data sharing'
  });

  // Load persistent authentication status and profile on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const token = await storage.getItem('user_token');
        const onboardedStr = await storage.getItem('user_onboarded');
        
        if (token) {
          setUserToken(token);
          setIsOnboarded(onboardedStr === 'true');
          
          // Fetch dynamic profile details from API
          const response = await api.fetchProfile(token);
          if (response) {
            setProfile({
              ...response.profile,
              initials: response.profile.name ? getInitials(response.profile.name) : ''
            });
            setMedicalInfo(response.medicalInfo);
            setEmergencyContacts(response.emergencyContacts);
          }
        }
      } catch (err) {
        console.error('[UserStore] Error initializing session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [userToken]);

  // Utility to generate Initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // --- ACTIONS ---

  /**
   * Complete OTP login flow and store credentials.
   */
  const loginWithOtp = async (phoneNumber, otpCode) => {
    setIsLoading(true);
    try {
      const data = await api.verifyOtp(phoneNumber, otpCode);
      if (data.token) {
        await storage.setItem('user_token', data.token);
        await storage.setItem('user_onboarded', String(data.isOnboarded));
        
        setUserToken(data.token);
        setIsOnboarded(data.isOnboarded);
        
        setProfile({
          ...data.profile,
          initials: data.profile.name ? getInitials(data.profile.name) : ''
        });
        setMedicalInfo(data.medicalInfo);
        return { success: true, isOnboarded: data.isOnboarded };
      }
      throw new Error('Authentication failed');
    } catch (err) {
      console.error('[UserStore] Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete Google Sign-in flow.
   */
  const loginWithGoogle = async (googleToken) => {
    setIsLoading(true);
    try {
      const data = await api.loginWithGoogle(googleToken);
      if (data.token) {
        await storage.setItem('user_token', data.token);
        await storage.setItem('user_onboarded', String(data.isOnboarded));
        
        setUserToken(data.token);
        setIsOnboarded(data.isOnboarded);
        
        setProfile(data.profile);
        setMedicalInfo(data.medicalInfo);
        return { success: true, isOnboarded: data.isOnboarded };
      }
      throw new Error('Google authentication failed');
    } catch (err) {
      console.error('[UserStore] Google login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete user onboarding profile entries.
   */
  const completeOnboarding = async (name, city, bloodGroup, allergies, conditions, insurance) => {
    setIsLoading(true);
    try {
      const updatedProfile = { name, city, phone: profile.phone };
      const updatedMedical = { bloodGroup, allergies, conditions, insurance };

      await api.updateProfile(userToken, updatedProfile);
      await api.updateMedicalInfo(userToken, updatedMedical);
      
      await storage.setItem('user_onboarded', 'true');
      
      setProfile({
        ...updatedProfile,
        initials: getInitials(name)
      });
      setMedicalInfo(updatedMedical);
      setIsOnboarded(true);
      
      return { success: true };
    } catch (err) {
      console.error('[UserStore] Onboarding completion failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out and flush authentication stores.
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await storage.removeItem('user_token');
      await storage.removeItem('user_onboarded');
      
      setUserToken(null);
      setIsOnboarded(false);
      setProfile({ initials: '', name: '', phone: '', city: '' });
      setMedicalInfo({ bloodGroup: '', allergies: '', conditions: '', insurance: '' });
      setEmergencyContacts([]);
    } catch (err) {
      console.error('[UserStore] Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update profile details.
   */
  const updateProfile = async (updatedFields) => {
    try {
      await api.updateProfile(userToken, updatedFields);
      setProfile((prev) => {
        const next = { ...prev, ...updatedFields };
        return {
          ...next,
          initials: next.name ? getInitials(next.name) : prev.initials
        };
      });
    } catch (err) {
      console.error('[UserStore] Update profile error:', err);
      throw err;
    }
  };

  /**
   * Update medical history card.
   */
  const updateMedicalInfo = async (updatedMedical) => {
    try {
      await api.updateMedicalInfo(userToken, updatedMedical);
      setMedicalInfo((prev) => ({
        ...prev,
        ...updatedMedical
      }));
    } catch (err) {
      console.error('[UserStore] Update medical info error:', err);
      throw err;
    }
  };

  /**
   * Add emergency contact and sync to backend.
   */
  const addEmergencyContact = async (contact) => {
    try {
      const savedContact = await api.addEmergencyContact(userToken, contact);
      setEmergencyContacts((prev) => [...prev, savedContact]);
    } catch (err) {
      console.error('[UserStore] Add emergency contact error:', err);
      throw err;
    }
  };

  /**
   * Toggle settings values and push background preferences patches.
   */
  const toggleSetting = async (key) => {
    const nextValue = !settings[key];
    const nextSettings = { ...settings, [key]: nextValue };
    
    // Optimistic UI update
    setSettings(nextSettings);

    try {
      // Background patch syncing settings preferences
      await api.syncSettings(userToken, nextSettings);
    } catch (err) {
      console.error('[UserStore] Settings sync error:', err);
      // Revert on failure
      setSettings(settings);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userToken,
        isOnboarded,
        isLoading,
        profile,
        medicalInfo,
        emergencyContacts,
        settings,
        loginWithOtp,
        loginWithGoogle,
        completeOnboarding,
        logout,
        toggleSetting,
        addEmergencyContact,
        updateProfile,
        updateMedicalInfo
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserProvider');
  }
  return context;
};
