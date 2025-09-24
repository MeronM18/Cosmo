import { Platform } from 'react-native';

// iOS 17 System Colors - Matching main app theme
export const iOS17Colors = {
  // System Background Colors - Cosmic Theme
  systemBackground: '#0B0B2F', // Deep Space
  secondarySystemBackground: '#1A0B3A', // Midnight Purple
  tertiarySystemBackground: 'rgba(255, 255, 255, 0.08)', // Glass Card Background
  
  // System Grouped Background Colors
  systemGroupedBackground: '#0B0B2F', // Deep Space
  secondarySystemGroupedBackground: 'rgba(255, 255, 255, 0.08)', // Glass Card Background
  tertiarySystemGroupedBackground: '#1A0B3A', // Midnight Purple
  
  // System Fill Colors - Cosmic Theme
  systemFill: 'rgba(255, 255, 255, 0.12)', // Glass Card Border
  secondarySystemFill: 'rgba(255, 255, 255, 0.08)', // Glass Card Background
  tertiarySystemFill: 'rgba(255, 255, 255, 0.06)', // Subtle fill
  quaternarySystemFill: 'rgba(255, 255, 255, 0.04)', // Very subtle fill
  
  // System Label Colors - Cosmic Theme
  label: '#FFFFFF', // Star White
  secondaryLabel: '#B8A9C9', // Secondary Text
  tertiaryLabel: '#8B7A9B', // Tertiary Text
  quaternaryLabel: '#6B5B7B', // Muted Text
  
  // System Separator Colors - Cosmic Theme
  separator: 'rgba(255, 255, 255, 0.12)', // Glass Card Border
  opaqueSeparator: 'rgba(255, 255, 255, 0.2)', // More visible separator
  
  // System Link Colors - Cosmic Theme
  link: '#8A4FFF', // Celestial Purple
  
  // System Accent Colors - Cosmic Theme
  systemBlue: '#6366F1', // Aurora Blue
  systemGreen: '#4FC3F7', // Info Cyan
  systemIndigo: '#6366F1', // Aurora Blue
  systemOrange: '#FFA726', // Warning Amber
  systemPink: '#FF6B9D', // Error Rose
  systemPurple: '#8A4FFF', // Celestial Purple
  systemRed: '#FF6B9D', // Error Rose
  systemTeal: '#4FC3F7', // Info Cyan
  systemYellow: '#FFD700', // Cosmic Gold
  
  // Enhanced Cosmic Theme Colors - Matching main app
  cosmicPurple: '#8A4FFF', // Celestial Purple
  cosmicPurpleLight: '#A66CFF', // Lighter Celestial Purple
  cosmicPurpleDark: '#6B46C1', // Darker Celestial Purple
  cosmicGold: '#FFD700', // Cosmic Gold
  cosmicGoldLight: '#FFE55C', // Lighter Cosmic Gold
  cosmicGoldDark: '#B8860B', // Darker Cosmic Gold
  cosmicSilver: 'rgba(255, 255, 255, 0.12)', // Glass Card Border
  cosmicSilverLight: 'rgba(255, 255, 255, 0.08)', // Glass Card Background
  cosmicSilverDark: 'rgba(255, 255, 255, 0.04)', // Very subtle fill
  cosmicBlue: '#6366F1', // Aurora Blue
  cosmicBlueLight: '#818CF8', // Lighter Aurora Blue
  cosmicBlueDark: '#4338CA', // Darker Aurora Blue
  cosmicPink: '#FF6B9D', // Error Rose
  cosmicPinkLight: '#FF8FA3', // Lighter Error Rose
  cosmicPinkDark: '#E91E63', // Darker Error Rose
  cosmicTeal: '#4FC3F7', // Info Cyan
  cosmicTealLight: '#81D4FA', // Lighter Info Cyan
  cosmicTealDark: '#0288D1', // Darker Info Cyan
  cosmicIndigo: '#6366F1', // Aurora Blue
  cosmicIndigoLight: '#818CF8', // Lighter Aurora Blue
  cosmicIndigoDark: '#4338CA', // Darker Aurora Blue
  
  // Dark Mode Colors (for future implementation)
  darkSystemBackground: Platform.OS === 'ios' ? '#000000' : '#000000',
  darkSecondarySystemBackground: Platform.OS === 'ios' ? '#1C1C1E' : '#1C1C1E',
  darkTertiarySystemBackground: Platform.OS === 'ios' ? '#2C2C2E' : '#2C2C2E',
  darkSystemGroupedBackground: Platform.OS === 'ios' ? '#000000' : '#000000',
  darkSecondarySystemGroupedBackground: Platform.OS === 'ios' ? '#1C1C1E' : '#1C1C1E',
  darkTertiarySystemGroupedBackground: Platform.OS === 'ios' ? '#2C2C2E' : '#2C2C2E',
  darkLabel: Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF',
  darkSecondaryLabel: Platform.OS === 'ios' ? 'rgba(235, 235, 245, 0.6)' : 'rgba(235, 235, 245, 0.6)',
  darkTertiaryLabel: Platform.OS === 'ios' ? 'rgba(235, 235, 245, 0.3)' : 'rgba(235, 235, 245, 0.3)',
  darkQuaternaryLabel: Platform.OS === 'ios' ? 'rgba(235, 235, 245, 0.18)' : 'rgba(235, 235, 245, 0.18)',
  darkSeparator: Platform.OS === 'ios' ? 'rgba(84, 84, 88, 0.6)' : 'rgba(84, 84, 88, 0.6)',
  darkOpaqueSeparator: Platform.OS === 'ios' ? '#38383A' : '#38383A',
};

// iOS 17 Typography System with Cosmo Font Hierarchy
export const iOS17Typography = {
  // Cinzel - Primary Font (Mystical, Ancient, Headlines)
  largeTitle: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  
  title1: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  
  title2: {
    fontFamily: 'Cinzel_500Medium',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  
  title3: {
    fontFamily: 'Cinzel_500Medium',
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: 0.38,
  },
  
  // SF Pro - Secondary Font (Body Text, UI Elements)
  headline: {
    fontFamily: 'System',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  
  body: {
    fontFamily: 'System',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  
  // SF Pro - Secondary Font (Body Text, UI Elements)
  callout: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  
  subhead: {
    fontFamily: 'System',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  
  // Avenir Next - Tertiary Font (Metadata, Captions)
  footnote: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  
  caption1: {
    fontFamily: 'AvenirNext-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  
  caption2: {
    fontFamily: 'AvenirNext-Regular',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
};

// iOS 17 Spacing System
export const iOS17Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// iOS 17 Corner Radius System
export const iOS17CornerRadius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 20,
  extraExtraLarge: 24,
};

// iOS 17 Shadow System
export const iOS17Shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  extraLarge: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// iOS 17 SF Symbols (using Unicode equivalents for React Native)
export const iOS17SFSymbols = {
  // Navigation
  chevronRight: '›',
  chevronLeft: '‹',
  chevronUp: '^',
  chevronDown: 'v',
  
  // Actions
  heart: '♥',
  heartFill: '♥',
  star: '★',
  starFill: '★',
  bookmark: '🔖',
  bookmarkFill: '🔖',
  share: '↗',
  plus: '+',
  minus: '−',
  xmark: '✕',
  checkmark: '✓',
  
  // Time & Calendar
  clock: '🕐',
  calendar: '📅',
  timer: '⏱',
  
  // Communication
  message: '💬',
  phone: '📞',
  mail: '✉',
  
  // Media
  play: '▶',
  pause: '⏸',
  stop: '⏹',
  
  // System
  gear: '⚙',
  info: 'ℹ',
  warning: '⚠',
  exclamation: '!',
  
  // Weather & Nature
  sun: '☀',
  moon: '🌙',
  cloud: '☁',
  compass: '🧭',
  
  // Cosmic Symbols
  sparkles: '✨',
  comet: '☄',
  starAndCrescent: '☪',
  sunWithFace: '☀',
  moonWithFace: '🌙',
  
  // Activity & Health
  activity: '🏃',
  sleep: '😴',
  
  // Numbers & Badges
  number0: '0',
  number1: '1',
  number2: '2',
  number3: '3',
  number4: '4',
  number5: '5',
  number6: '6',
  number7: '7',
  number8: '8',
  number9: '9',
  
  // Colors
  circleFill: '●',
  circle: '○',
  squareFill: '■',
  square: '□',
};

// iOS 17 Haptic Feedback Types
export const iOS17Haptics = {
  light: 'light' as const,
  medium: 'medium' as const,
  heavy: 'heavy' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
  selection: 'selection' as const,
};

// iOS 17 Animation Durations
export const iOS17AnimationDurations = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// iOS 17 Spring Animation Configurations
export const iOS17SpringConfigs = {
  gentle: {
    tension: 120,
    friction: 14,
  },
  wobbly: {
    tension: 180,
    friction: 12,
  },
  stiff: {
    tension: 210,
    friction: 20,
  },
  slow: {
    tension: 120,
    friction: 14,
  },
  molasses: {
    tension: 280,
    friction: 60,
  },
};

// iOS 17 Blur Effects (for future implementation with expo-blur)
export const iOS17BlurEffects = {
  light: 'light' as const,
  regular: 'regular' as const,
  dark: 'dark' as const,
  extraLight: 'extraLight' as const,
  systemMaterial: 'systemMaterial' as const,
  systemMaterialLight: 'systemMaterialLight' as const,
  systemMaterialDark: 'systemMaterialDark' as const,
  systemThinMaterial: 'systemThinMaterial' as const,
  systemThinMaterialLight: 'systemThinMaterialLight' as const,
  systemThinMaterialDark: 'systemThinMaterialDark' as const,
  systemUltraThinMaterial: 'systemUltraThinMaterial' as const,
  systemUltraThinMaterialLight: 'systemUltraThinMaterialLight' as const,
  systemUltraThinMaterialDark: 'systemUltraThinMaterialDark' as const,
  systemChromeMaterial: 'systemChromeMaterial' as const,
  systemChromeMaterialLight: 'systemChromeMaterialLight' as const,
  systemChromeMaterialDark: 'systemChromeMaterialDark' as const,
};

// Standardized Button Styles
export const iOS17ButtonStyles = {
  primary: {
    backgroundColor: iOS17Colors.cosmicPurple,
    paddingHorizontal: iOS17Spacing.lg,
    paddingVertical: iOS17Spacing.md,
    borderRadius: iOS17CornerRadius.large,
    borderWidth: 1,
    borderColor: iOS17Colors.cosmicPurpleLight,
    ...iOS17Shadows.medium,
  },
  primaryText: {
    ...iOS17Typography.callout,
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 15,
  },
  secondary: {
    backgroundColor: iOS17Colors.secondarySystemFill,
    paddingHorizontal: iOS17Spacing.md,
    paddingVertical: iOS17Spacing.sm,
    borderRadius: iOS17CornerRadius.medium,
    borderWidth: 1,
    borderColor: iOS17Colors.separator,
    ...iOS17Shadows.small,
  },
  secondaryText: {
    ...iOS17Typography.callout,
    color: iOS17Colors.label,
    fontWeight: '500' as const,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: iOS17Colors.secondarySystemFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: iOS17Colors.separator,
    ...iOS17Shadows.small,
  },
  iconText: {
    fontSize: 20,
    color: iOS17Colors.cosmicPurple,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: iOS17Colors.secondarySystemFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: iOS17Colors.separator,
    ...iOS17Shadows.small,
  },
  closeText: {
    fontSize: 18,
    color: iOS17Colors.cosmicPurple,
    fontWeight: '600' as const,
  },
};

// Standardized Typography Styles
export const iOS17TextStyles = {
  sectionTitle: {
    ...iOS17Typography.title2,
    color: iOS17Colors.label,
    fontWeight: '600' as const,
    marginBottom: iOS17Spacing.md,
  },
  cardTitle: {
    ...iOS17Typography.title3,
    color: iOS17Colors.label,
    fontWeight: '600' as const,
  },
  bodyText: {
    ...iOS17Typography.body,
    color: iOS17Colors.label,
    lineHeight: 24,
  },
  secondaryText: {
    ...iOS17Typography.footnote,
    color: iOS17Colors.secondaryLabel,
  },
  tertiaryText: {
    ...iOS17Typography.caption1,
    color: iOS17Colors.tertiaryLabel,
  },
  accentText: {
    ...iOS17Typography.callout,
    color: iOS17Colors.cosmicPurple,
    fontWeight: '600' as const,
  },
  largeNumber: {
    ...iOS17Typography.largeTitle,
    fontWeight: '700' as const,
  },
  // Aliases for existing component references
  headline: {
    ...iOS17Typography.headline,
    color: iOS17Colors.label,
  },
  body: {
    ...iOS17Typography.body,
    color: iOS17Colors.label,
  },
  subheadline: {
    ...iOS17Typography.subhead,
    color: iOS17Colors.label,
  },
  caption: {
    ...iOS17Typography.caption1,
    color: iOS17Colors.secondaryLabel,
  },
  caption2: {
    ...iOS17Typography.caption2,
    color: iOS17Colors.secondaryLabel,
  },
  title2: {
    ...iOS17Typography.title2,
    color: iOS17Colors.label,
  },
  largeTitle: {
    ...iOS17Typography.largeTitle,
    color: iOS17Colors.label,
  },
  title1: {
    ...iOS17Typography.title1,
    color: iOS17Colors.label,
  },
  footnote: {
    ...iOS17Typography.footnote,
    color: iOS17Colors.secondaryLabel,
  },
};

// Combined iOS 17 Theme
export const iOS17Theme = {
  colors: iOS17Colors,
  typography: iOS17Typography,
  spacing: iOS17Spacing,
  cornerRadius: iOS17CornerRadius,
  shadows: iOS17Shadows,
  symbols: iOS17SFSymbols,
  haptics: iOS17Haptics,
  animationDurations: iOS17AnimationDurations,
  springConfigs: iOS17SpringConfigs,
  blurEffects: iOS17BlurEffects,
  buttons: iOS17ButtonStyles,
  text: iOS17TextStyles,
};

export default iOS17Theme;
