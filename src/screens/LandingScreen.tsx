import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
}

interface CosmoSplashScreenProps {
  onAnimationComplete?: () => void;
}

const CosmoSplashScreen: React.FC<CosmoSplashScreenProps> = ({ onAnimationComplete }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [fontsLoaded] = useFonts({ Cinzel_700Bold, Cinzel_400Regular });

  // Main animation values (stable via refs)
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(30)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const ctaGlowOpacity = useRef(new Animated.Value(0.5)).current;
  const ctaGlowScale = useRef(new Animated.Value(1)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    generateStars();
    generateShootingStars();
    startAnimationSequence();
    // Breathing glow for CTA
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ctaGlowOpacity, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
          Animated.timing(ctaGlowScale, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ctaGlowOpacity, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
          Animated.timing(ctaGlowScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const generateStars = () => {
    const newStars: Star[] = [];
    for (let i = 0; i < 25; i++) {
      newStars.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        opacity: new Animated.Value(Math.random()),
      });
    }
    setStars(newStars);

    // Start twinkling animation for stars
    newStars.forEach((star) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      setTimeout(() => twinkle(), Math.random() * 3000);
    });
  };

  const generateShootingStars = () => {
    const newShootingStars: ShootingStar[] = [];
    for (let i = 0; i < 3; i++) {
      // Start near top-right quadrant
      const startX = width * (0.82 + Math.random() * 0.15); // 82% - 97%
      const startY = height * (0.05 + Math.random() * 0.15); // 5% - 20%
      // End toward lower-left/middle area
      const endX = width * (0.12 + Math.random() * 0.2); // 12% - 32%
      const endY = height * (0.6 + Math.random() * 0.25); // 60% - 85%

      newShootingStars.push({
        id: i,
        startX,
        startY,
        endX,
        endY,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(0),
      });
    }
    setShootingStars(newShootingStars);

    // Start shooting star animations
    newShootingStars.forEach((shootingStar, index) => {
      const animate = () => {
        shootingStar.translateX.setValue(0);
        shootingStar.translateY.setValue(0);
        shootingStar.opacity.setValue(0);

        Animated.sequence([
          Animated.timing(shootingStar.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(shootingStar.translateX, {
              toValue: shootingStar.endX - shootingStar.startX,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(shootingStar.translateY, {
              toValue: shootingStar.endY - shootingStar.startY,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(shootingStar.opacity, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          setTimeout(() => animate(), Math.random() * 4000 + 2500);
        });
      };
      setTimeout(() => animate(), Math.random() * 1500 + index * 900);
    });
  };

  const startAnimationSequence = () => {
    // Background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Logo animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Title animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // Subtitle animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2200);

    // Complete animation callback
    setTimeout(() => {
      onAnimationComplete?.();
    }, 4000);
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[styles.background, { opacity: backgroundOpacity }] }>
        <LinearGradient
          colors={[ '#0B1426', '#1A1F3A', '#2D1B69', '#1A1F3A' ]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Background illustration */}
        <Animated.View style={[styles.cosmicImageContainer, { opacity: backgroundOpacity }]}> 
          <Image
            source={require('../../assets/cosmo-landing.png')}
            style={styles.cosmicImage}
            resizeMode="cover"
          />
          {/* Bottom gradient for text contrast */}
          <LinearGradient
            colors={[ 'transparent', 'rgba(4,7,20,0.6)', 'rgba(4,7,20,0.9)' ]}
            locations={[0.4, 0.75, 1]}
            style={styles.bottomFade}
          />
        </Animated.View>

        {/* Stars overlay above artwork */}
        <View style={styles.overlayStars} pointerEvents="none">
          {stars.map((star) => (
            <Animated.View
              key={`star-${star.id}`}
              style={[
                styles.star,
                {
                  left: star.x,
                  top: star.y,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}

          {shootingStars.map((shootingStar) => (
            <Animated.View
              key={`shooting-${shootingStar.id}`}
              style={[
                styles.shootingStar,
                {
                  left: shootingStar.startX,
                  top: shootingStar.startY,
                  opacity: shootingStar.opacity,
                  transform: [
                    { translateX: shootingStar.translateX },
                    { translateY: shootingStar.translateY },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Brand title + subtitle */}
        <Animated.View style={[styles.brandBlock, { opacity: logoOpacity, transform: [{ scale: logoScale }] }] }>
          <Text style={[styles.brandTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>Cosmo</Text>
          <Animated.View style={{ opacity: subtitleOpacity, transform: [{ translateY: subtitleTranslateY }] }}>
            <Text style={[styles.subtitleInline, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>Your guide through the stars, dreams, and destiny.</Text>
          </Animated.View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }] }>
          <TouchableWithoutFeedback
            onPressIn={() => {
              Animated.spring(ctaScale, { toValue: 0.92, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
              // ripple
              rippleScale.setValue(0);
              rippleOpacity.setValue(0.4);
              Animated.parallel([
                Animated.timing(rippleScale, { toValue: 2.2, duration: 600, useNativeDriver: true }),
                Animated.timing(rippleOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
              ]).start();
            }}
            onPressOut={() => {
              Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
            }}
          >
            <Animated.View style={[styles.ctaButton, { transform: [{ scale: ctaScale }] }] }>
              {/* Massive outer glow */}
              <Animated.View style={[styles.ctaOuterAura, { opacity: ctaGlowOpacity, transform: [{ scale: ctaGlowScale }] }]} pointerEvents="none" />
              {/* Inner halo */}
              <Animated.View style={[styles.ctaGlow, { opacity: ctaGlowOpacity, transform: [{ scale: ctaGlowScale }] }]} pointerEvents="none" />
              <LinearGradient
                colors={[ '#A66CFF', '#6246EA' ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                {/* Tap ripple */}
                <Animated.View style={[styles.ctaRipple, { opacity: rippleOpacity, transform: [{ scale: rippleScale }] }]} />
                <Text style={[styles.ctaText, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>Get Started</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </View>
  );
};

// Loading Dot Component
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const id = setTimeout(() => animate(), delay);
    return () => clearTimeout(id);
  }, [delay, opacity]);

  return <Animated.View style={[styles.loadingDot, { opacity }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  shootingStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 10,
  },
  overlayStars: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cosmicImageContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cosmicImage: {
    width: '100%',
    height: '100%',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Math.min(260, height * 0.35),
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  brandBlock: {
    marginTop: Math.max(80, height * 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 68,
    color: '#F3E9FF',
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleInline: {
    marginTop: 14,
    textAlign: 'center',
    color: '#D6D6E7',
    fontSize: 18,
    lineHeight: 26,
    paddingHorizontal: 24,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ctaButton: {
    width: Math.min(300, width * 0.72),
    borderRadius: 44,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
  ctaGradient: {
    paddingVertical: 20,
    borderRadius: 44,
    alignItems: 'center',
  },
  ctaHighlight: {
    // removed per user request (kept style for future reference)
    height: 0,
  },
  ctaGlow: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    bottom: -10,
    borderRadius: 54,
    backgroundColor: 'rgba(166,108,255,0.22)',
    shadowColor: '#A66CFF',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.7,
    shadowRadius: 36,
    elevation: 16,
  },
  ctaOuterAura: {
    position: 'absolute',
    left: -30,
    right: -30,
    top: -30,
    bottom: -30,
    borderRadius: 84,
    backgroundColor: 'rgba(98,70,234,0.22)',
    shadowColor: '#6246EA',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.9,
    shadowRadius: 60,
    elevation: 24,
  },
  ctaRipple: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  ctaText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
});

export default CosmoSplashScreen;


