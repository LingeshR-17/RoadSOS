// src/services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCvzy-dOOFdrsmCX2xyr2RgQzq27eYtgtg",
  authDomain: "road-sos-1b051.firebaseapp.com",
  projectId: "road-sos-1b051",
  storageBucket: "road-sos-1b051.firebasestorage.app",
  messagingSenderId: "617297950462",
  appId: "1:617297950462:web:b700e2146b243d5391d7af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistent session storage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };