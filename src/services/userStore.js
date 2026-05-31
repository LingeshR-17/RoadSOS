// src/store/userStore.js
import { create } from 'zustand';
import { api } from '../services/api'; // Adjust path if needed

export const useUserStore = create((set) => ({
  user: null,
  token: null,
  loading: false,

  // Connects Login Screen to Firebase verifyOtp
  loginWithOtp: async (phoneNumber, otp) => {
    set({ loading: true });
    try {
      const response = await api.verifyOtp(phoneNumber, otp);
      
      // Save the user data and token into global state
      set({ 
        user: { profile: response.profile, medicalInfo: response.medicalInfo }, 
        token: response.token 
      });

      return { isOnboarded: response.isOnboarded };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Connects Onboarding Screen to Firebase updateMedicalInfo
  completeOnboarding: async (name, city, bloodGroup, allergies, conditions, insurance) => {
    set({ loading: true });
    try {
      // Get the current token from state
      const token = useUserStore.getState().token; 
      
      const profileData = { name, city, phone: useUserStore.getState().user?.profile?.phone || '', email: useUserStore.getState().user?.profile?.email || '' };
      const medicalData = { bloodGroup, allergies, conditions, insurance };

      // Sync both to Firestore
      await api.updateProfile(token, profileData);
      await api.updateMedicalInfo(token, medicalData);

      // Update local state so the UI updates immediately
      set((state) => ({
        user: {
          profile: profileData,
          medicalInfo: medicalData
        }
      }));

      return true;
    } catch (error) {
      console.error("Onboarding sync failed:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Connects Google Login with Real Profile Data Fetching
  loginWithGoogle: async (googleToken) => {
    set({ loading: true });
    try {
      // 1. Fetch real user information directly from Google's User Info API using the token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
      
      const googleUser = await userInfoResponse.json();
      
      if (!googleUser.email) {
        throw new Error("Could not retrieve email identity from Google authorization provider.");
      }

      // 2. Package real profile parameters and pass them to our updated api layer
      const response = await api.loginWithGoogle(googleUser.email, googleUser.name || 'Google User');
      
      // 3. Save the user data and token into global state
      set({ 
        user: { profile: response.profile, medicalInfo: response.medicalInfo }, 
        token: response.token 
      });
      return { isOnboarded: response.isOnboarded };
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));