export const COLORS = {
  // Brand Colors
  primary: '#E63946',       // Vibrant Safety/SOS Coral Red
  primaryDark: '#0F172A',   // Midnight Slate for Headers, text
  secondary: '#3B82F6',     // Electric Trust Blue
  background: '#F8FAFC',    // Premium Slate 50 canvas background
  card: '#FFFFFF',          // Pure white card background
  
  // Status Colors
  danger: '#EF4444',        // High hazard / accident
  warning: '#F59E0B',       // Moderate warning / bypass potholes
  success: '#10B981',       // Safe / clear road status
  
  // Neutral Greys
  text: '#1E293B',          // Midnight slate primary text
  textMuted: '#64748B',     // Cool slate secondary text
  border: '#E2E8F0',        // Premium soft grey border
  lightBg: '#F1F5F9',       // Button backgrounds / disabled tabs
  
  // Glows & Soft Gradients
  primaryGlow: 'rgba(230, 57, 70, 0.15)',
  secondaryGlow: 'rgba(59, 130, 246, 0.12)',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dangerGlow: {
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  round: 9999,
};

export const theme = {
  colors: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: '#090b0e', // Dark mode background from incoming
    backgroundLight: '#11141b',
    cardBackground: 'rgba(22, 26, 35, 0.75)',
    border: 'rgba(255, 255, 255, 0.08)',
    
    // Core accents
    emergencyRed: '#ff3b30',
    emergencyNeon: '#ff2d55',
    emergencyGlow: 'rgba(255, 45, 85, 0.45)',
    
    // Bystander (Sky Blue)
    bystanderBg: '#111b2b',
    bystanderBorder: 'rgba(0, 199, 255, 0.2)',
    bystanderNeon: '#00c7ff',
    bystanderGlow: 'rgba(0, 199, 255, 0.45)',
    
    // Safe / Terminated (Neon Green)
    safeBg: '#0f1f15',
    safeBorder: 'rgba(52, 199, 89, 0.2)',
    safeNeon: '#34c759',
    safeGlow: 'rgba(52, 199, 89, 0.45)',

    // UI Status
    success: '#34c759',
    warning: '#ff9500',
    info: '#007aff',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: '#8e8e93',
    textMuted: '#48484a',
  },
  shadows: {
    neonRed: {
      shadowColor: '#ff2d55',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 8,
    },
    neonBlue: {
      shadowColor: '#00c7ff',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 8,
    },
    neonGreen: {
      shadowColor: '#34c759',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 8,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    }
  },
  fonts: {
    heading: 'System',
    body: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 9999,
  }
};

