import { Platform } from 'react-native';

// iOS 17 System Colors
export const iOS17Colors = {
  // System Background Colors
  systemBackground: Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF',
  secondarySystemBackground: Platform.OS === 'ios' ? '#F2F2F7' : '#F2F2F7',
  tertiarySystemBackground: Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF',
  
  // System Grouped Background Colors
  systemGroupedBackground: Platform.OS === 'ios' ? '#F2F2F7' : '#F2F2F7',
  secondarySystemGroupedBackground: Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF',
  tertiarySystemGroupedBackground: Platform.OS === 'ios' ? '#F2F2F7' : '#F2F2F7',
  
  // System Fill Colors
  systemFill: Platform.OS === 'ios' ? 'rgba(120, 120, 128, 0.2)' : 'rgba(120, 120, 128, 0.2)',
  secondarySystemFill: Platform.OS === 'ios' ? 'rgba(120, 120, 128, 0.16)' : 'rgba(120, 120, 128, 0.16)',
  tertiarySystemFill: Platform.OS === 'ios' ? 'rgba(118, 118, 128, 0.12)' : 'rgba(118, 118, 128, 0.12)',
  quaternarySystemFill: Platform.OS === 'ios' ? 'rgba(116, 116, 128, 0.08)' : 'rgba(116, 116, 128, 0.08)',
  
  // System Label Colors
  label: Platform.OS === 'ios' ? '#000000' : '#000000',
  secondaryLabel: Platform.OS === 'ios' ? 'rgba(60, 60, 67, 0.6)' : 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: Platform.OS === 'ios' ? 'rgba(60, 60, 67, 0.3)' : 'rgba(60, 60, 67, 0.3)',
  quaternaryLabel: Platform.OS === 'ios' ? 'rgba(60, 60, 67, 0.18)' : 'rgba(60, 60, 67, 0.18)',
  
  // System Separator Colors
  separator: Platform.OS === 'ios' ? 'rgba(60, 60, 67, 0.29)' : 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: Platform.OS === 'ios' ? '#C6C6C8' : '#C6C6C8',
  
  // System Link Colors
  link: Platform.OS === 'ios' ? '#007AFF' : '#007AFF',
  
  // System Accent Colors
  systemBlue: Platform.OS === 'ios' ? '#007AFF' : '#007AFF',
  systemGreen: Platform.OS === 'ios' ? '#34C759' : '#34C759',
  systemIndigo: Platform.OS === 'ios' ? '#5856D6' : '#5856D6',
  systemOrange: Platform.OS === 'ios' ? '#FF9500' : '#FF9500',
  systemPink: Platform.OS === 'ios' ? '#FF2D92' : '#FF2D92',
  systemPurple: Platform.OS === 'ios' ? '#AF52DE' : '#AF52DE',
  systemRed: Platform.OS === 'ios' ? '#FF3B30' : '#FF3B30',
  systemTeal: Platform.OS === 'ios' ? '#5AC8FA' : '#5AC8FA',
  systemYellow: Platform.OS === 'ios' ? '#FFCC00' : '#FFCC00',
  
  // Cosmic Theme Colors (used sparingly as accents)
  cosmicPurple: '#8A4FFF',
  cosmicGold: '#FFD700',
  cosmicSilver: '#E8E8E8',
  cosmicBlue: '#4FC3F7',
  
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

// iOS 17 Typography System
export const iOS17Typography = {
  // Large Title (34pt, 41pt leading)
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '400' as const,
    letterSpacing: 0.37,
  },
  
  // Title 1 (28pt, 34pt leading)
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400' as const,
    letterSpacing: 0.36,
  },
  
  // Title 2 (22pt, 28pt leading)
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400' as const,
    letterSpacing: 0.35,
  },
  
  // Title 3 (20pt, 25pt leading)
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '400' as const,
    letterSpacing: 0.38,
  },
  
  // Headline (17pt, 22pt leading)
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  
  // Body (17pt, 22pt leading)
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  
  // Callout (16pt, 21pt leading)
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  
  // Subhead (15pt, 20pt leading)
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  
  // Footnote (13pt, 18pt leading)
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  
  // Caption 1 (12pt, 16pt leading)
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  
  // Caption 2 (11pt, 13pt leading)
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400' as const,
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
};

export default iOS17Theme;
