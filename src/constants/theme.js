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
