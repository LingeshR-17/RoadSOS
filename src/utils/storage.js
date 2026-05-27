import { Platform } from 'react-native';

let AsyncStorage;
try {
  // Attempt dynamic resolution of react-native-async-storage
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // AsyncStorage not installed; fall back to localStorage/memory
}

const memoryStore = {};

/**
 * Universal Storage utility that works seamlessly across:
 * - Web (using localStorage)
 * - Native with AsyncStorage (if installed)
 * - Native Simulator/Fallback (using in-memory store)
 */
export const storage = {
  getItem: async (key) => {
    if (AsyncStorage) {
      try {
        return await AsyncStorage.getItem(key);
      } catch (e) {
        console.error('[Storage] Error reading from AsyncStorage:', e);
      }
    }
    
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        // Fallback to memory store if cookies/storage are blocked
      }
    }
    
    return memoryStore[key] || null;
  },

  setItem: async (key, value) => {
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(key, value);
        return;
      } catch (e) {
        console.error('[Storage] Error writing to AsyncStorage:', e);
      }
    }

    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (e) {
        // Fallback to memory store
      }
    }

    memoryStore[key] = value;
  },

  removeItem: async (key) => {
    if (AsyncStorage) {
      try {
        await AsyncStorage.removeItem(key);
        return;
      } catch (e) {
        console.error('[Storage] Error removing from AsyncStorage:', e);
      }
    }

    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
        return;
      } catch (e) {
        // Fallback to memory store
      }
    }

    delete memoryStore[key];
  }
};
