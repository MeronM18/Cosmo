import { StyleSheet, Platform } from 'react-native';

// Cosmic Color Palette
export const CosmicColors = {
  // Primary Colors
  deepSpacePurple: '#1A0B3D',
  cosmicPurple: '#6B46C1',
  stellarGold: '#F59E0B',
  darkMatter: '#0F172A',
  stardustWhite: '#F8FAFC',
  
  // Secondary Colors
  nebulaBlue: '#3B82F6',
  auroraPink: '#EC4899',
  cosmicIndigo: '#4F46E5',
  stellarSilver: '#94A3B8',
  voidBlack: '#000000',
  
  // Event Type Colors with Gradients
  eclipse: {
    primary: '#8A4FFF',
    secondary: '#A855F7',
    gradient: ['#8A4FFF', '#A855F7', '#C084FC']
  },
  retrograde: {
    primary: '#FF6B6B',
    secondary: '#F87171',
    gradient: ['#FF6B6B', '#F87171', '#FCA5A5']
  },
  station: {
    primary: '#4ECDC4',
    secondary: '#22D3EE',
    gradient: ['#4ECDC4', '#22D3EE', '#67E8F9']
  },
  seasonal: {
    primary: '#45B7D1',
    secondary: '#0EA5E9',
    gradient: ['#45B7D1', '#0EA5E9', '#38BDF8']
  },
  winterSolstice: {
    primary: '#BEE3F8',
    secondary: '#90CDF4',
    gradient: ['#1A1D2E', '#2C3E50', '#34495E'],
    // Winter Solstice specific colors
    arcticNight: '#1A1D2E',
    frostbiteBlue: '#2C3E50',
    winterStorm: '#34495E',
    freshSnow: '#FFFFFF',
    powderSnow: '#F8FAFC',
    frostCrystal: '#E2E8F0',
    iceGlaze: '#CBD5E0',
    frozenMist: '#A0AEC0',
    icicleBlue: '#BEE3F8',
    glacierMint: '#9DECF9',
    arcticCyan: '#76E4F7',
    winterSky: '#90CDF4',
    candlelight: '#FED7AA',
    hearthEmber: '#F6AD55',
    midnightFrost: '#0F1419',
    shadowIce: '#1A202C',
    winterPine: '#2D3748',
    winterBorder: '#CBD5E0',
  },
  moonPhase: {
    primary: '#9B59B6',
    secondary: '#A855F7',
    gradient: ['#9B59B6', '#A855F7', '#C084FC']
  },
  meteorShower: {
    primary: '#8B5CF6',
    secondary: '#C084FC',
    gradient: ['#0B1426', '#1A0B3D', '#2D1B69'],
    // Meteor shower specific colors
    deepSpaceNavy: '#0B1426',
    cosmicPurple: '#1A0B3D',
    stellarBlue: '#2D1B69',
    brightMeteorWhite: '#E8F4FF',
    meteorGlow: '#A5C9EA',
    cosmicIce: '#7FB3D3',
    nebulaPink: '#C084FC',
    stardustPurple: '#8B5CF6',
    galaxyRose: '#EC4899',
    milkyWayLavender: '#DDD6FE',
    spaceDust: '#6B7280',
    cosmicBorder: '#374151',
  },
  supermoon: {
    primary: '#E74C3C',
    secondary: '#EF4444',
    gradient: ['#E74C3C', '#EF4444', '#F87171']
  },
  
  // Impact Level Colors
  highImpact: {
    primary: '#FF6B6B',
    secondary: '#F87171',
    glow: '#FF6B6B40'
  },
  mediumImpact: {
    primary: '#FFA500',
    secondary: '#F59E0B',
    glow: '#FFA50040'
  },
  lowImpact: {
    primary: '#90EE90',
    secondary: '#10B981',
    glow: '#90EE9040'
  },
  
  // Glassmorphism Colors
  glassBackground: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Neumorphism Colors
  neumorphismLight: 'rgba(255, 255, 255, 0.1)',
  neumorphismDark: 'rgba(0, 0, 0, 0.3)',
  
  // Text Colors
  primaryText: '#F8FAFC',
  secondaryText: '#94A3B8',
  tertiaryText: '#64748B',
  accentText: '#F59E0B',
  
  // Background Colors
  primaryBackground: '#0F172A',
  secondaryBackground: '#1E293B',
  cardBackground: 'rgba(30, 41, 59, 0.8)',
  modalBackground: 'rgba(15, 23, 42, 0.95)',
  
  // Celestial Event Semantic Colors (unified system)
  celestial: {
    background: '#0F172A',
    card: '#111827',
    surface: '#1F2937',
    border: '#374151',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',

    // Event Types
    types: {
      eclipse: { primary: '#7C3AED', accent: '#F59E0B' },        // deep purple + gold
      retrograde: { primary: '#F59E0B', accent: '#F97316' },     // warm amber + coral
      seasonal: { primary: '#3B82F6', accent: '#CBD5E1' },       // cool blue + silver
      moonPhase: { primary: '#A78BFA', accent: '#E5E7EB' },      // lavender + pearl
      meteorShower: { primary: '#60A5FA', accent: '#F8FAFC' },   // sky blue + white
      supermoon: { primary: '#F87171', accent: '#FDE68A' },      // red + soft yellow
      default: { primary: '#64748B', accent: '#CBD5E1' },
    },

    // Impact Levels
    impact: {
      high: { bg: '#F97316', fg: '#111827' },     // energetic orange, dark text
      medium: { bg: '#F59E0B', fg: '#111827' },   // warm amber
      low: { bg: '#34D399', fg: '#0B1324' },      // sage/green
      user: { bg: '#3B82F6', fg: '#FFFFFF' },     // system blue
    },
  },
};

// Cosmic Spacing System
export const CosmicSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Cosmic Typography
export const CosmicTypography = {
  // Mystical Headers
  cosmicTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Cinzel-Bold' : 'serif',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
  },
  constellationHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Cinzel-SemiBold' : 'serif',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
  },
  stellarSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Cinzel-Medium' : 'serif',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  
  // Body Text
  cosmicBody: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  stellarCaption: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  cosmicLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  
  // Special Text
  impactText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  countdownText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
};

// Cosmic Corner Radius
export const CosmicCornerRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  round: 50,
};

// Cosmic Shadows
export const CosmicShadows = {
  // Glassmorphism Shadows
  glass: {
    shadowColor: CosmicColors.glassShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Neumorphism Shadows
  neumorphism: {
    shadowColor: CosmicColors.neumorphismDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Glow Effects
  glow: {
    shadowColor: CosmicColors.stellarGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // Card Shadows
  card: {
    shadowColor: CosmicColors.voidBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // Floating Shadows
  floating: {
    shadowColor: CosmicColors.voidBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Cosmic Gradients
export const CosmicGradients = {
  primary: ['#1A0B3D', '#6B46C1', '#EC4899'],
  secondary: ['#0F172A', '#1E293B', '#334155'],
  aurora: ['#3B82F6', '#8B5CF6', '#EC4899'],
  stellar: ['#F59E0B', '#F97316', '#EF4444'],
  cosmic: ['#4F46E5', '#7C3AED', '#DB2777'],
  nebula: ['#0EA5E9', '#3B82F6', '#8B5CF6'],
  // Meteor Shower Gradients
  meteorShower: {
    cardBackground: ['#0B1426', '#1A0B3D', '#2D1B69'],
    meteorTrail: ['#E8F4FF', '#A5C9EA', '#7FB3D3'],
    galaxyGlow: ['#C084FC', '#8B5CF6', '#EC4899'],
    deepSpace: ['#0B1426', '#1A0B3D'],
    cosmicNebula: ['#2D1B69', '#8B5CF6', '#C084FC'],
  },
  // Winter Solstice Gradients
  winterSolstice: {
    cardBackground: ['#1A1D2E', '#2C3E50', '#34495E'],
    snowShimmer: ['#FFFFFF', '#F8FAFC', '#E2E8F0'],
    icyAccent: ['#BEE3F8', '#90CDF4', '#76E4F7'],
    frostyOverlay: ['#FFFFFF10', '#BEE3F820', 'transparent'],
    winterGradient: ['#1A1D2E', '#2C3E50'],
    frostGlow: ['#BEE3F8', '#9DECF9', '#76E4F7'],
  },
};

// Cosmic Animation Durations
export const CosmicAnimations = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 800,
  slowest: 1200,
};

// Cosmic Spring Configs
export const CosmicSprings = {
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
    tension: 280,
    friction: 60,
  },
};

// Glassmorphism Styles
export const GlassmorphismStyles = StyleSheet.create({
  glassCard: {
    backgroundColor: CosmicColors.glassBackground,
    borderWidth: 1,
    borderColor: CosmicColors.glassBorder,
    borderRadius: CosmicCornerRadius.large,
    ...CosmicShadows.glass,
  },
  
  glassButton: {
    backgroundColor: CosmicColors.glassBackground,
    borderWidth: 1,
    borderColor: CosmicColors.glassBorder,
    borderRadius: CosmicCornerRadius.medium,
    ...CosmicShadows.neumorphism,
  },
  
  glassModal: {
    backgroundColor: CosmicColors.modalBackground,
    borderTopLeftRadius: CosmicCornerRadius.xlarge,
    borderTopRightRadius: CosmicCornerRadius.xlarge,
    ...CosmicShadows.floating,
  },
});

// Neumorphism Styles
export const NeumorphismStyles = StyleSheet.create({
  neumorphicButton: {
    backgroundColor: CosmicColors.secondaryBackground,
    borderRadius: CosmicCornerRadius.medium,
    ...CosmicShadows.neumorphism,
  },
  
  neumorphicCard: {
    backgroundColor: CosmicColors.cardBackground,
    borderRadius: CosmicCornerRadius.large,
    ...CosmicShadows.card,
  },
});

// Cosmic Theme Object
export const CosmicTheme = {
  colors: CosmicColors,
  spacing: CosmicSpacing,
  typography: CosmicTypography,
  cornerRadius: CosmicCornerRadius,
  shadows: CosmicShadows,
  gradients: CosmicGradients,
  animations: CosmicAnimations,
  springs: CosmicSprings,
  glassmorphism: GlassmorphismStyles,
  neumorphism: NeumorphismStyles,
};

export default CosmicTheme;
