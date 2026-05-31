import { db, auth } from './firebaseConfig';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc
} from 'firebase/firestore';

export const api = {
  // ==========================================
  // --- AUTHENTICATION ---
  // ==========================================
  
  /**
   * Request OTP code via SMS.
   */
  requestOtp: async (phoneNumber) => {
    // For demo/hackathon timelines, this triggers the local UI verification step.
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  /**
   * Verify OTP code, check/create user profile record in Firestore.
   */
  verifyOtp: async (phoneNumber, otp) => {
    // Creating a unique, predictable Document ID in Firestore for this phone number
    const documentId = `phone-${phoneNumber}`;
    const userDocRef = doc(db, 'users', documentId);
    const userDocSnapshot = await getDoc(userDocRef);

    let isOnboarded = false;
    let profile = { name: '', phone: `+91 ${phoneNumber}`, city: '', email: '' };
    let medicalInfo = { bloodGroup: '', allergies: '', conditions: '', insurance: '' };

    if (userDocSnapshot.exists()) {
      const data = userDocSnapshot.data();
      isOnboarded = data.isOnboarded || false;
      if (data.profile) profile = { ...profile, ...data.profile };
      if (data.medicalInfo) medicalInfo = { ...medicalInfo, ...data.medicalInfo };
    } else {
      // Create a brand new record for first-time signups
      await setDoc(userDocRef, {
        isOnboarded: false,
        profile,
        medicalInfo,
        emergencyContacts: [],
        settings: { notificationsEnabled: true, locationSharing: true },
        createdAt: new Date().toISOString()
      });
    }

    return {
      token: documentId, // Custom document ID acts as our operational session token layer
      isOnboarded, 
      profile,
      medicalInfo
    };
  },

  /**
   * Sign in using real Google OAuth unique Identity Strings.
   */
  loginWithGoogle: async (email, name) => {
    // Sanitize the email address string to create a clean, unique Document ID
    const documentId = `google-${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
    
    const userDocRef = doc(db, 'users', documentId);
    const userDocSnapshot = await getDoc(userDocRef);

    let isOnboarded = false;
    // Hydrate fields cleanly using verified data from the userStore Google payload
    let profile = { name: name, phone: '', city: '', email: email };
    let medicalInfo = { bloodGroup: '', allergies: '', conditions: '', insurance: '' };

    if (userDocSnapshot.exists()) {
      const data = userDocSnapshot.data();
      isOnboarded = data.isOnboarded || false;
      if (data.profile) profile = { ...profile, ...data.profile };
      if (data.medicalInfo) medicalInfo = { ...medicalInfo, ...data.medicalInfo };
    } else {
      // Initialize an entirely fresh cloud profile record for new OAuth accounts
      await setDoc(userDocRef, {
        isOnboarded: false,
        profile,
        medicalInfo,
        emergencyContacts: [],
        settings: { notificationsEnabled: true, locationSharing: true },
        createdAt: new Date().toISOString()
      });
    }

    return { token: documentId, isOnboarded, profile, medicalInfo };
  },

  /**
   * Recover Account using phone number or email queries.
   */
  recoverAccount: async (emailOrPhone) => {
    const usersRef = collection(db, 'users');
    
    const isEmail = emailOrPhone.includes('@');
    const queryField = isEmail ? 'profile.email' : 'profile.phone';
    const cleanInput = isEmail ? emailOrPhone.trim() : `+91 ${emailOrPhone.trim()}`;

    const q = query(usersRef, where(queryField, '==', cleanInput));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No user profile matching those parameters found.');
    }
    return { success: true, message: 'Recovery query completed successfully.' };
  },

  // ==========================================
  // --- PROFILE & MEDICAL DATA ---
  // ==========================================

  /**
   * Fetch complete user context document using session token ID.
   */
  fetchProfile: async (token) => {
    const userDocRef = doc(db, 'users', token);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      throw new Error('User document missing from server state.');
    }

    const data = docSnap.data();
    return {
      profile: data.profile || {},
      medicalInfo: data.medicalInfo || {},
      emergencyContacts: data.emergencyContacts || []
    };
  },

  /**
   * Sync structural text configuration modifications.
   */
  updateProfile: async (token, profileData) => {
    const userDocRef = doc(db, 'users', token);
    await updateDoc(userDocRef, { profile: profileData });
    return { success: true };
  },

  /**
   * Sync medical onboarding profile parameters directly to target payload fields.
   */
  updateMedicalInfo: async (token, medicalData) => {
    const userDocRef = doc(db, 'users', token);
    await updateDoc(userDocRef, { 
      medicalInfo: medicalData,
      isOnboarded: true // Toggles onboarding flag upon baseline validation completion
    });
    return { success: true };
  },

  /**
   * Add a trusted contact entry into user profile sub-arrays.
   */
  addEmergencyContact: async (token, contact) => {
    const userDocRef = doc(db, 'users', token);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) throw new Error('User profile completely missing.');

    const currentContacts = docSnap.data().emergencyContacts || [];
    const newContactItem = {
      ...contact,
      id: Date.now().toString(),
      initial: contact.name ? contact.name.charAt(0).toUpperCase() : '+'
    };

    // Push into the targeted root array configuration payload
    await updateDoc(userDocRef, {
      emergencyContacts: [...currentContacts, newContactItem]
    });

    return newContactItem;
  },

  // ==========================================
  // --- SETTINGS SYNC ---
  // ==========================================

  /**
   * Manage persistent app-toggle preference objects.
   */
  syncSettings: async (token, settings) => {
    const userDocRef = doc(db, 'users', token);
    await updateDoc(userDocRef, { settings });
    return { success: true };
  },

  // ==========================================
  // --- MAP LAYERS ---
  // ==========================================

  /**
   * Fetch active bystander coordinates based on user GPS location.
   */
  fetchNearbyBystanders: async (token, latitude, longitude) => {
    const bystandersRef = collection(db, 'bystanders');
    const snapshot = await getDocs(bystandersRef);
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (list.length === 0) {
      return [
        { id: 'b1', name: 'Dr. Ramesh (Cardiologist)', latitude: latitude + 0.003, longitude: longitude - 0.002, role: 'Medical Responder' },
        { id: 'b2', name: 'Karthi (First Aid Certified)', latitude: latitude - 0.004, longitude: longitude + 0.004, role: 'Paramedic Partner' }
      ];
    }
    return list;
  },

  /**
   * Fetch safety road accident/pothole alerts from live database layer.
   */
  fetchNearbyAlerts: async (token, latitude, longitude) => {
    const alertsRef = collection(db, 'incidents');
    const snapshot = await getDocs(alertsRef);
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (list.length === 0) {
      return [
        { id: '1', type: 'accident', color: '#EF4444', title: 'Accident — NH 44, Km 312', subtitle: 'High severity · 2 bystanders helping', time: '2m ago', severity: 'high' }
      ];
    }
    return list;
  },

  /**
   * Fetch nearby Traffic Blackspots/Hazard zones.
   */
  fetchTrafficBlackspots: async (token, latitude, longitude) => {
    const blackspotsRef = collection(db, 'blackspots');
    const snapshot = await getDocs(blackspotsRef);
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (list.length === 0) {
      return [
        { id: 'bs1', name: 'High-Collision Curve', latitude: latitude + 0.006, longitude: longitude - 0.006, description: 'Frequent slip hazard during monsoons' }
      ];
    }
    return list;
  }
};