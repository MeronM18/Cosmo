export const AppColors = {
  // Primary Background Colors
  primary: '#0B0B2F', // Deep Space
  primaryVariant: '#1A0B3A', // Midnight Purple
  secondary: '#8A4FFF', // Celestial Purple
  secondaryVariant: '#6366F1', // Aurora Blue
  background: '#0B0B2F', // Deep Space
  surface: 'rgba(255, 255, 255, 0.08)', // Glass Card Background
  error: '#FF6B9D', // Error Rose
  onPrimary: '#FFFFFF', // Star White
  onSecondary: '#FFFFFF', // Star White
  onBackground: '#FFFFFF', // Star White
  onSurface: '#FFFFFF', // Star White
  overlay: '#1A0B3A', // Midnight Purple
  inactive: '#6B5B7B', // Muted Text
  textSecondary: '#B8A9C9', // Secondary Text
  textTertiary: '#8B7A9B', // Tertiary Text
  textMuted: '#6B5B7B', // Muted Text
  
  // Accent Colors
  cosmicGold: '#FFD700', // Cosmic Gold
  celestialPurple: '#8A4FFF', // Celestial Purple
  auroraBlue: '#6366F1', // Aurora Blue
  starWhite: '#FFFFFF', // Star White
  
  // Status Colors
  successGold: '#FFD700', // Success Gold
  warningAmber: '#FFA726', // Warning Amber
  errorRose: '#FF6B9D', // Error Rose
  infoCyan: '#4FC3F7', // Info Cyan
  
  // Glass Effects
  glassCardBackground: 'rgba(255, 255, 255, 0.08)',
  glassCardBorder: 'rgba(255, 255, 255, 0.12)',
  elevatedCard: 'rgba(138, 79, 255, 0.15)',
  inputFieldBackground: 'rgba(255, 255, 255, 0.10)',
  
  // Shadows & Glows
  cardShadow: 'rgba(138, 79, 255, 0.15)',
  goldGlow: 'rgba(255, 215, 0, 0.3)',
  purpleGlow: 'rgba(138, 79, 255, 0.4)',
  textShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Legacy support
  shadow: 'rgba(138,79,255,0.3)'
};

export const Typography = {
  // Cinzel - Primary Font (Mystical, Ancient, Headlines)
  display: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 36,
    color: AppColors.onBackground,
  },
  headline: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 24,
    color: AppColors.onBackground,
  },
  title: {
    fontFamily: 'Cinzel_500Medium',
    fontSize: 20,
    color: AppColors.onBackground,
  },
  zodiacTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 18,
    color: AppColors.cosmicGold,
  },
  sectionHeader: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 16,
    color: AppColors.onBackground,
  },
  
  // SF Pro - Secondary Font (Body Text, UI Elements)
  body: {
    fontFamily: 'System',
    fontSize: 16,
    color: AppColors.onBackground,
  },
  bodySecondary: {
    fontFamily: 'System',
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  button: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.onBackground,
  },
  input: {
    fontFamily: 'System',
    fontSize: 16,
    color: AppColors.onBackground,
  },
  navigation: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.onBackground,
  },
  
  // Avenir Next - Tertiary Font (Metadata, Captions)
  caption: {
    fontFamily: 'AvenirNext-Regular',
    fontSize: 12,
    color: AppColors.textTertiary,
  },
  metadata: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  timestamp: {
    fontFamily: 'AvenirNext-Regular',
    fontSize: 11,
    color: AppColors.textMuted,
  },
  dataLabel: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 12,
    color: AppColors.onBackground,
  },
  
  // Legacy support
  label: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.onBackground,
  }
};


