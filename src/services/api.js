const API_URL = 'https://api.roadsos.com/v1';

/**
 * Generic API helper to perform fetch operations with token headers.
 */
async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    // In production, uncomment the line below to connect to the backend server:
    // const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    // return await response.json();
    
    // For local frontend testing, we return a mock promise that mimics network latency.
    return new Promise((resolve) => setTimeout(resolve, 800));
  } catch (error) {
    console.error(`[API] Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // --- AUTHENTICATION ---
  
  /**
   * Request OTP code via SMS.
   */
  requestOtp: async (phoneNumber) => {
    await apiFetch('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber }),
    });
    // Return mock success status
    return { success: true };
  },

  /**
   * Verify OTP code and retrieve access token.
   */
  verifyOtp: async (phoneNumber, otp) => {
    await apiFetch('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber, otp }),
    });
    
    // Simulate user check. Let's say odd numbers are new users, even numbers are onboarded.
    const isNewUser = phoneNumber.endsWith('1') || phoneNumber.endsWith('3') || phoneNumber.endsWith('5') || phoneNumber.endsWith('7') || phoneNumber.endsWith('9');
    
    return {
      token: 'mock-jwt-token-12345',
      isOnboarded: !isNewUser, 
      profile: {
        name: isNewUser ? '' : 'Lingesh R.',
        phone: `+91 ${phoneNumber}`,
        city: isNewUser ? '' : 'Madurai, TN',
      },
      medicalInfo: isNewUser ? {
        bloodGroup: '',
        allergies: '',
        conditions: '',
        insurance: '',
      } : {
        bloodGroup: 'B+',
        allergies: 'Penicillin',
        conditions: 'None',
        insurance: 'Star Health',
      }
    };
  },

  /**
   * Sign in using Google OAuth Credentials.
   */
  loginWithGoogle: async (googleToken) => {
    await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken: googleToken }),
    });

    return {
      token: 'mock-jwt-token-google',
      isOnboarded: false, // Force onboarding for demo Google sign-in
      profile: {
        name: 'Google User',
        phone: '',
        city: '',
      },
      medicalInfo: {
        bloodGroup: '',
        allergies: '',
        conditions: '',
        insurance: '',
      }
    };
  },

  /**
   * Recover Account (Forgot Password/PIN) using backup authentication.
   */
  recoverAccount: async (emailOrPhone) => {
    await apiFetch('/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ identity: emailOrPhone }),
    });
    return { success: true, message: 'Recovery link sent successfully.' };
  },

  // --- PROFILE & MEDICAL DATA ---

  /**
   * Fetch current user profile.
   */
  fetchProfile: async (token) => {
    await apiFetch('/profile', { method: 'GET' }, token);
    return {
      profile: {
        initials: 'LK',
        name: 'Lingesh K.',
        phone: '+91 98400 00000',
        city: 'Madurai, TN'
      },
      medicalInfo: {
        bloodGroup: 'B+',
        allergies: 'Penicillin',
        conditions: 'None',
        insurance: 'Star Health'
      },
      emergencyContacts: [
        {
          id: '1',
          initial: 'A',
          name: 'Amma (Mother)',
          relationship: 'Primary contact',
          phone: '+91 99400 12345'
        },
        {
          id: '2',
          initial: 'N',
          name: 'Nandha (Friend)',
          relationship: 'Secondary contact',
          phone: '+91 97800 67890'
        }
      ]
    };
  },

  /**
   * Sync complete user profile changes.
   */
  updateProfile: async (token, profileData) => {
    await apiFetch('/profile/update', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }, token);
    return { success: true };
  },

  /**
   * Sync medical profile details.
   */
  updateMedicalInfo: async (token, medicalData) => {
    await apiFetch('/profile/medical', {
      method: 'PATCH',
      body: JSON.stringify(medicalData),
    }, token);
    return { success: true };
  },

  /**
   * Add emergency contact.
   */
  addEmergencyContact: async (token, contact) => {
    await apiFetch('/profile/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    }, token);
    return {
      ...contact,
      id: Date.now().toString(),
      initial: contact.name ? contact.name.charAt(0).toUpperCase() : '+',
    };
  },

  // --- SETTINGS SYNC ---

  /**
   * Sync toggle updates to the backend in background.
   */
  syncSettings: async (token, settings) => {
    await apiFetch('/profile/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, token);
    return { success: true };
  },

  // --- MAP LAYERS ---

  /**
   * Fetch active bystander coordinates based on user GPS location.
   */
  fetchNearbyBystanders: async (token, latitude, longitude) => {
    await apiFetch(`/bystanders?lat=${latitude}&lng=${longitude}`, { method: 'GET' }, token);
    return [
      { id: 'b1', name: 'Dr. Ramesh (Cardiologist)', latitude: latitude + 0.003, longitude: longitude - 0.002, role: 'Medical Responder' },
      { id: 'b2', name: 'Karthi (First Aid Certified)', latitude: latitude - 0.004, longitude: longitude + 0.004, role: 'Paramedic Partner' },
      { id: 'b3', name: 'Sneha (EMT Trainee)', latitude: latitude + 0.002, longitude: longitude + 0.003, role: 'General Helper' },
    ];
  },

  /**
   * Fetch safety road accident/pothole alerts.
   */
  fetchNearbyAlerts: async (token, latitude, longitude) => {
    await apiFetch(`/alerts?lat=${latitude}&lng=${longitude}`, { method: 'GET' }, token);
    return [
      {
        id: '1',
        type: 'accident',
        color: '#EF4444',
        title: 'Accident — NH 44, Km 312',
        subtitle: 'High severity · 2 bystanders helping',
        time: '2m ago',
        severity: 'high'
      },
      {
        id: '2',
        type: 'hazard',
        color: '#F59E0B',
        title: 'Hazard — Bypass Road',
        subtitle: 'Pothole reported · 0.8 km away',
        time: '11m ago',
        severity: 'moderate'
      },
      {
        id: '3',
        type: 'clear',
        color: '#10B981',
        title: 'All clear — Madurai Ring Road',
        subtitle: 'No incidents in last 2 hours',
        time: 'safe',
        severity: 'none'
      }
    ];
  },

  /**
   * Fetch nearby Traffic Blackspots/Hazard zones.
   */
  fetchTrafficBlackspots: async (token, latitude, longitude) => {
    await apiFetch(`/blackspots?lat=${latitude}&lng=${longitude}`, { method: 'GET' }, token);
    return [
      { id: 'bs1', name: 'High-Collision Curve', latitude: latitude + 0.006, longitude: longitude - 0.006, description: 'Frequent slip hazard during monsoons' },
      { id: 'bs2', name: 'NH-44 Bypass Junction', latitude: latitude - 0.005, longitude: longitude - 0.001, description: 'Blind intersection warning' }
    ];
  }
};
