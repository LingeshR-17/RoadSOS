import { useState, useEffect, useRef, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import * as Speech from 'expo-speech';

// Safe dynamic require to prevent fatal NativeEventEmitter crashes in Expo Go
let Voice = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (err) {
  console.warn('Voice recognition native module not found. Falling back to simulation mode.', err);
}

export const useVoiceAssistant = (onTriggerCall, onStopEmergency) => {
  const [isListening, setIsListening] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('Assistant ready.');
  const [lastCommand, setLastCommand] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // 'en', 'ta', 'hi'

  const activeRef = useRef(false);
  const languageRef = useRef('en');

  // Sync ref with state for callbacks
  useEffect(() => {
    languageRef.current = currentLanguage;
  }, [currentLanguage]);

  // Check if Native Voice Recognition is available in this environment (e.g. not Expo Go)
  const checkVoiceSupport = useCallback(() => {
    const isSupported = Voice && typeof Voice.start === 'function';
    setIsSimulated(!isSupported);
    return isSupported;
  }, []);

  useEffect(() => {
    checkVoiceSupport();

    // Bind Voice listeners if supported
    if (Voice && typeof Voice.start === 'function') {
      Voice.onSpeechStart = () => {
        setAssistantMessage('Listening...');
      };
      
      Voice.onSpeechEnd = () => {
        // Continuous listening: restart after a short delay if still active
        if (activeRef.current) {
          setTimeout(restartVoiceListening, 800);
        }
      };

      Voice.onSpeechError = (e) => {
        console.log('Speech error:', e);
        // Avoid crashing, log and silently restart
        if (activeRef.current && e.error?.code !== '7') { // 7 is usually no match, common in loops
          setAssistantMessage('Listening... (Adapting to silence)');
        }
        if (activeRef.current) {
          setTimeout(restartVoiceListening, 1000);
        }
      };

      Voice.onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
          const spokenText = e.value[0];
          setAssistantMessage(`Processed: "${spokenText}"`);
          handleTextCommand(spokenText);
        }
      };
    }

    return () => {
      if (Voice && typeof Voice.destroy === 'function') {
        Voice.destroy().then(Voice.removeAllListeners);
      }
      Speech.stop();
    };
  }, [checkVoiceSupport]);

  // Restart voice session
  const restartVoiceListening = async () => {
    if (!activeRef.current) return;
    try {
      const langCode = getLanguageCode(languageRef.current);
      await Voice.start(langCode);
    } catch (e) {
      console.log('Error restarting voice:', e);
    }
  };

  // Resolve language code for TTS and Speech Recognition
  const getLanguageCode = (lang) => {
    switch (lang) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'en':
      default:
        return 'en-US';
    }
  };

  // Get activation vocal prompt in selected language
  const getActivationSpeechText = (lang) => {
    switch (lang) {
      case 'ta':
        return 'அவசர உதவி முறை செயல்படுத்தப்பட்டது. ஆம்புலன்ஸ் அல்லது கால் என்று கூறவும். நிறுத்த ஸ்டாப் என்று கூறவும்.';
      case 'hi':
        return 'आपातकालीन मोड सक्रिय है। एम्बुलेंस या कॉल कहें। रोकने के लिए स्टॉप कहें।';
      case 'en':
      default:
        return 'Emergency mode activated. Say ambulance or call for emergency services. Say stop to terminate.';
    }
  };

  // Get termination vocal prompt
  const getTerminationSpeechText = (lang) => {
    switch (lang) {
      case 'ta':
        return 'அவசர உதவி முறை நிறுத்தப்பட்டது.';
      case 'hi':
        return 'आपातकालीन मोड समाप्त कर दिया गया है।';
      case 'en':
      default:
        return 'Emergency mode terminated.';
    }
  };

  // Speak text using expo-speech
  const speakText = async (text, lang) => {
    try {
      await Speech.stop();
      const langCode = getLanguageCode(lang);
      Speech.speak(text, {
        language: langCode,
        pitch: 1.0,
        rate: 0.95,
      });
    } catch (err) {
      console.log('Speech playback error:', err);
    }
  };

  // Fuzzy match voice input against emergency intents
  const handleTextCommand = (text) => {
    if (!text) return;
    const lowerText = text.toLowerCase().trim();

    // Check "stop" emergency triggers (supports EN, TA, HI)
    const isStopTrigger = 
      lowerText.includes('stop') ||
      lowerText.includes('terminate') ||
      lowerText.includes('cancel') ||
      lowerText.includes('நிறுத்து') || // Tamil "stop"
      lowerText.includes('ஸ்டாப்') ||   // Tamil transliterated "stop"
      lowerText.includes('ருகோ') ||     // Hindi "stop"
      lowerText.includes('बढ़ना बंद') || // Hindi "stop"
      lowerText.includes('बंद') ||       // Hindi "close/stop"
      lowerText.includes('स्टॉप');       // Hindi transliterated "stop"

    if (isStopTrigger) {
      setLastCommand('stop');
      stopAssistant();
      if (onStopEmergency) onStopEmergency();
      return;
    }

    // Check "call" or "ambulance" emergency triggers (supports EN, TA, HI)
    const isEmergencyTrigger = 
      lowerText.includes('ambulance') ||
      lowerText.includes('hospital') ||
      lowerText.includes('medical') ||
      lowerText.includes('emergency') ||
      lowerText.includes('help') ||
      lowerText.includes('call') ||
      lowerText.includes('dial') ||
      lowerText.includes('ஆம்புலன்ஸ்') || // Tamil "ambulance"
      lowerText.includes('கூப்பிடு') ||   // Tamil "call"
      lowerText.includes('அழைக்கவும்') || // Tamil "call/dial"
      lowerText.includes('உதவி') ||      // Tamil "help"
      lowerText.includes('एम्बुलेंस') ||  // Hindi "ambulance"
      lowerText.includes('कॉल') ||       // Hindi "call"
      lowerText.includes('मदद') ||       // Hindi "help"
      lowerText.includes('बचाओ');       // Hindi "save me"

    if (isEmergencyTrigger) {
      setLastCommand('ambulance');
      setAssistantMessage('Emergency call triggered!');
      if (onTriggerCall) onTriggerCall();
    }
  };

  // Start the voice assistant system
  const startAssistant = async (lang = 'en') => {
    setCurrentLanguage(lang);
    activeRef.current = true;
    setIsListening(true);
    
    const isSupported = checkVoiceSupport();
    const promptText = getActivationSpeechText(lang);
    
    setAssistantMessage(isSupported ? 'Initializing microphone...' : 'Simulation mode active.');
    
    // 1. Speak activation instruction aloud
    await speakText(promptText, lang);

    // 2. Start listening (or simulate listening)
    if (isSupported) {
      try {
        const langCode = getLanguageCode(lang);
        await Voice.stop();
        await Voice.start(langCode);
        setAssistantMessage('Listening...');
      } catch (err) {
        console.log('Failed to start Voice listener. Falling back to simulation.', err);
        setIsSimulated(true);
        setAssistantMessage('Listening (Simulation mode)...');
      }
    } else {
      setAssistantMessage('Listening (Simulation mode)...');
    }
  };

  // Terminate voice assistant system
  const stopAssistant = async () => {
    activeRef.current = false;
    setIsListening(false);
    
    const promptText = getTerminationSpeechText(languageRef.current);
    setAssistantMessage('Emergency terminated.');
    
    // Speak termination instruction
    await speakText(promptText, languageRef.current);

    if (Voice && typeof Voice.stop === 'function') {
      try {
        await Voice.stop();
      } catch (err) {
        // Safe to ignore
      }
    }
  };

  // Function to simulate voice input manually (especially useful in Expo Go environment)
  const simulateVoiceInput = (text) => {
    if (!activeRef.current) return;
    setAssistantMessage(`Simulating: "${text}"`);
    setTimeout(() => {
      handleTextCommand(text);
    }, 500);
  };

  return {
    isListening,
    assistantMessage,
    startAssistant,
    stopAssistant,
    lastCommand,
    isSimulated,
    simulateVoiceInput,
    currentLanguage,
    setCurrentLanguage
  };
};
