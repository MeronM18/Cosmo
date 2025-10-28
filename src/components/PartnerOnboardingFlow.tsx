import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';

const { width, height } = Dimensions.get('window');

interface PartnerOnboardingFlowProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (partnerData: any) => void;
}

interface PartnerData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  connectionType: string;
  relationshipContext: {
    howYouMet: string;
    currentStatus: string;
    relationshipLength: string;
    specialNotes: string;
  };
}

const PartnerOnboardingFlow: React.FC<PartnerOnboardingFlowProps> = ({ 
  isVisible, 
  onClose, 
  onComplete 
}) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [partnerData, setPartnerData] = useState<PartnerData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    connectionType: '',
    relationshipContext: {
      howYouMet: '',
      currentStatus: '',
      relationshipLength: '',
      specialNotes: ''
    }
  });
  const [backgroundParticles, setBackgroundParticles] = useState<any[]>([]);
  const [shootingStars, setShootingStars] = useState<any[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const constellationAnim = useRef(new Animated.Value(0)).current;
  const parallaxAnim1 = useRef(new Animated.Value(0)).current;
  const parallaxAnim2 = useRef(new Animated.Value(0)).current;
  const parallaxAnim3 = useRef(new Animated.Value(0)).current;

  const connectionTypes = [
    { 
      id: 'romantic', 
      label: 'Romantic Partner', 
      icon: '💕', 
      gradient: ['#FF6B9D', '#FF8E9B'],
      description: 'Explore romantic compatibility and love connections'
    },
    { 
      id: 'friend', 
      label: 'Close Friend', 
      icon: '🤝', 
      gradient: ['#06B6D4', '#3B82F6'],
      description: 'Understand friendship dynamics and bond strength'
    },
    { 
      id: 'family', 
      label: 'Family Member', 
      icon: '👨‍👩‍👧‍👦', 
      gradient: ['#F59E0B', '#F97316'],
      description: 'Analyze family relationships and understanding'
    },
    { 
      id: 'professional', 
      label: 'Professional', 
      icon: '💼', 
      gradient: ['#6B7280', '#9CA3AF'],
      description: 'Explore workplace dynamics and collaboration'
    },
    { 
      id: 'potential', 
      label: 'Potential Match', 
      icon: '❓', 
      gradient: ['#8B5CF6', '#A855F7'],
      description: 'Discover compatibility with someone new'
    }
  ];

  const howYouMetOptions = [
    'Dating App', 'Friend Introduction', 'Work/Professional', 'School/University',
    'Social Media', 'Mutual Friends', 'Family Introduction', 'Chance Meeting', 'Other'
  ];

  const currentStatusOptions = [
    'Dating', 'Committed Relationship', 'Married', 'Friends', 'Family',
    'Colleagues', 'Just Met', 'Long-term Friends', 'Other'
  ];

  const relationshipLengthOptions = [
    'Just met', 'Less than 1 month', '1-3 months', '3-6 months',
    '6 months - 1 year', '1-2 years', '2-5 years', '5+ years'
  ];

  // Initialize particle system with reduced count for better performance
  useEffect(() => {
    const particles = Array.from({ length: 25 }, (_, i) => ({ // Reduced from 50 to 25
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1, // Reduced max size from 3 to 2
      opacity: Math.random() * 0.4 + 0.2, // Reduced max opacity from 0.6 to 0.4
      speed: Math.random() * 0.3 + 0.1, // Reduced speed for smoother animation
      direction: Math.random() * Math.PI * 2,
    }));
    setBackgroundParticles(particles);

    // Initialize shooting stars with reduced count
    const stars = Array.from({ length: 2 }, (_, i) => ({ // Reduced from 3 to 2
      id: i,
      x: -100,
      y: Math.random() * height,
      length: Math.random() * 80 + 40, // Reduced length
      speed: Math.random() * 1.5 + 0.8, // Slightly reduced speed
      opacity: 0,
    }));
    setShootingStars(stars);
  }, []);

  // Shooting star animation
  useEffect(() => {
    const shootingStarInterval = setInterval(() => {
      setShootingStars(prev => prev.map(star => ({
        ...star,
        x: star.x + star.speed,
        opacity: star.x > -50 && star.x < width + 50 ? 1 : 0,
      })));
    }, 50);

    return () => clearInterval(shootingStarInterval);
  }, []);

  // Entrance animations - optimized timing
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300, // Reduced from 500ms
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400, // Reduced from 600ms
          useNativeDriver: true,
        }),
        Animated.timing(constellationAnim, {
          toValue: 1,
          duration: 600, // Reduced from 1000ms
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      constellationAnim.setValue(0);
    }
  }, [isVisible]);

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const completeOnboarding = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(partnerData);
    onClose();
  };

  // Starfield rendering functions - optimized for performance
  const renderParallaxStarfield = () => {
    return (
      <View style={styles.starfieldContainer}>
        {/* Background layer - reduced stars */}
        <Animated.View style={[styles.starfieldLayer, { 
          transform: [{ translateY: parallaxAnim1 }] 
        }]}>
          {Array.from({ length: 8 }, (_, i) => ( // Reduced from 20 to 8
            <View key={i} style={[styles.star, {
              left: Math.random() * width,
              top: Math.random() * height,
              opacity: 0.3,
              width: 1,
              height: 1,
            }]} />
          ))}
        </Animated.View>
        
        {/* Midground layer - reduced stars */}
        <Animated.View style={[styles.starfieldLayer, { 
          transform: [{ translateY: parallaxAnim2 }] 
        }]}>
          {Array.from({ length: 6 }, (_, i) => ( // Reduced from 15 to 6
            <View key={i} style={[styles.star, {
              left: Math.random() * width,
              top: Math.random() * height,
              opacity: 0.5, // Slightly reduced opacity
              width: 2,
              height: 2,
            }]} />
          ))}
        </Animated.View>
        
        {/* Foreground layer - reduced stars */}
        <Animated.View style={[styles.starfieldLayer, { 
          transform: [{ translateY: parallaxAnim3 }] 
        }]}>
          {Array.from({ length: 4 }, (_, i) => ( // Reduced from 10 to 4
            <View key={i} style={[styles.star, {
              left: Math.random() * width,
              top: Math.random() * height,
              opacity: 0.7, // Slightly reduced opacity
              width: 2, // Reduced from 3 to 2
              height: 2,
            }]} />
          ))}
        </Animated.View>
      </View>
    );
  };

  const renderShootingStars = () => {
    return shootingStars.map(star => (
      <Animated.View
        key={star.id}
        style={[
          styles.shootingStar,
          {
            left: star.x,
            top: star.y,
            opacity: star.opacity,
          }
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shootingStarGradient}
        />
      </Animated.View>
    ));
  };

  const renderStepIndicator = React.memo(() => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: 7 }, (_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            i + 1 <= currentStep && styles.stepDotActive
          ]}
        />
      ))}
    </View>
  ));

  const renderStep1 = React.memo(() => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
        What kind of connection are you exploring?
      </Text>
      <Text style={styles.stepSubtitle}>
        Choose the type of relationship you want to analyze
      </Text>
      
      <View style={styles.connectionTypesGrid}>
        {connectionTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.connectionTypeCard,
              partnerData.connectionType === type.id && styles.connectionTypeCardActive
            ]}
            onPress={() => {
              setPartnerData({...partnerData, connectionType: type.id});
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <LinearGradient
              colors={partnerData.connectionType === type.id ? type.gradient as [string, string] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.connectionTypeGradient}
            >
              <Text style={styles.connectionTypeIcon}>{type.icon}</Text>
              <Text style={styles.connectionTypeLabel}>{type.label}</Text>
              <Text style={styles.connectionTypeDescription}>{type.description}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ));

  const renderStep2 = React.memo(() => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
        What should we call them?
      </Text>
      <Text style={styles.stepSubtitle}>
        This helps personalize your cosmic connection
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter their name"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={partnerData.name}
          onChangeText={(text) => setPartnerData({...partnerData, name: text})}
          autoFocus
        />
        <Text style={styles.inputHint}>
          ✨ As you type, their cosmic profile begins to form
        </Text>
      </View>
    </View>
  ));

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
        When were they born?
      </Text>
      <Text style={styles.stepSubtitle}>
        We need this to create their cosmic profile
      </Text>
      
      <View style={styles.dateInputContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={partnerData.birthDate}
          onChangeText={(text) => setPartnerData({...partnerData, birthDate: text})}
        />
        <Text style={styles.dateHint}>
          📅 Their zodiac sign will appear as you enter the date
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
        Do you know their birth time?
      </Text>
      <Text style={styles.stepSubtitle}>
        This helps create a more accurate reading
      </Text>
      
      <View style={styles.timeOptionsContainer}>
        <TouchableOpacity
          style={styles.timeOption}
          onPress={() => setPartnerData({...partnerData, birthTime: 'known'})}
        >
          <Text style={styles.timeOptionText}>I know their birth time</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.timeOption}
          onPress={() => setPartnerData({...partnerData, birthTime: 'unknown'})}
        >
          <Text style={styles.timeOptionText}>I don't know their birth time</Text>
        </TouchableOpacity>
      </View>
      
      {partnerData.birthTime === 'known' && (
        <View style={styles.timeInputContainer}>
          <TextInput
            style={styles.timeInput}
            placeholder="HH:MM AM/PM"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      )}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
        Where were they born?
      </Text>
      <Text style={styles.stepSubtitle}>
        This completes their cosmic map
      </Text>
      
      <View style={styles.locationInputContainer}>
        <TextInput
          style={styles.locationInput}
          placeholder="City, Country"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={partnerData.birthLocation}
          onChangeText={(text) => setPartnerData({...partnerData, birthLocation: text})}
        />
        <Text style={styles.locationHint}>
          🌍 Location helps us calculate their rising sign
        </Text>
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
        Tell us about your connection
      </Text>
      <Text style={styles.stepSubtitle}>
        This helps us provide better insights
      </Text>
      
      <ScrollView style={styles.contextScrollView}>
        <View style={styles.contextSection}>
          <Text style={styles.contextLabel}>How did you meet?</Text>
          <View style={styles.optionsGrid}>
            {howYouMetOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.contextOption,
                  partnerData.relationshipContext.howYouMet === option && styles.contextOptionActive
                ]}
                onPress={() => setPartnerData({
                  ...partnerData,
                  relationshipContext: {...partnerData.relationshipContext, howYouMet: option}
                })}
              >
                <Text style={styles.contextOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.contextSection}>
          <Text style={styles.contextLabel}>Current relationship status</Text>
          <View style={styles.optionsGrid}>
            {currentStatusOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.contextOption,
                  partnerData.relationshipContext.currentStatus === option && styles.contextOptionActive
                ]}
                onPress={() => setPartnerData({
                  ...partnerData,
                  relationshipContext: {...partnerData.relationshipContext, currentStatus: option}
                })}
              >
                <Text style={styles.contextOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.contextSection}>
          <Text style={styles.contextLabel}>How long have you known each other?</Text>
          <View style={styles.optionsGrid}>
            {relationshipLengthOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.contextOption,
                  partnerData.relationshipContext.relationshipLength === option && styles.contextOptionActive
                ]}
                onPress={() => setPartnerData({
                  ...partnerData,
                  relationshipContext: {...partnerData.relationshipContext, relationshipLength: option}
                })}
              >
                <Text style={styles.contextOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.contextSection}>
          <Text style={styles.contextLabel}>Special notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any additional context about your relationship..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={partnerData.relationshipContext.specialNotes}
            onChangeText={(text) => setPartnerData({
              ...partnerData,
              relationshipContext: {...partnerData.relationshipContext, specialNotes: text}
            })}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
        Review & Create
      </Text>
      <Text style={styles.stepSubtitle}>
        Let's create your cosmic connection profile
      </Text>
      
      <View style={styles.reviewCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(138, 79, 255, 0.1)']}
          style={styles.reviewGradient}
        >
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Cosmic Connection Profile</Text>
            <Text style={styles.reviewSubtitle}>Ready to explore your compatibility</Text>
          </View>
          
          <View style={styles.reviewContent}>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Name:</Text>
              <Text style={styles.reviewValue}>{partnerData.name || 'Not provided'}</Text>
            </View>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Birth Date:</Text>
              <Text style={styles.reviewValue}>{partnerData.birthDate || 'Not provided'}</Text>
            </View>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Birth Time:</Text>
              <Text style={styles.reviewValue}>
                {partnerData.birthTime === 'known' ? 'Provided' : 
                 partnerData.birthTime === 'unknown' ? 'Not known' : 'Not specified'}
              </Text>
            </View>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Birth Location:</Text>
              <Text style={styles.reviewValue}>{partnerData.birthLocation || 'Not provided'}</Text>
            </View>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Connection Type:</Text>
              <Text style={styles.reviewValue}>
                {connectionTypes.find(t => t.id === partnerData.connectionType)?.label || 'Not selected'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      default: return <Step1 />;
    }
  };

  // Memoized step components
  const Step1 = renderStep1;
  const Step2 = renderStep2;
  const StepIndicator = renderStepIndicator;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return partnerData.connectionType !== '';
      case 2: return partnerData.name.trim() !== '';
      case 3: return partnerData.birthDate.trim() !== '';
      case 4: return partnerData.birthTime !== '';
      case 5: return partnerData.birthLocation.trim() !== '';
      case 6: return true; // Optional step
      case 7: return true; // Review step
      default: return false;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Starfield Background */}
        {renderParallaxStarfield()}
        {renderShootingStars()}
        
        <LinearGradient
          colors={['#0F0F23', '#1A1A2E', '#16213E']}
          style={styles.backgroundGradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Add New Connection
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Step Content */}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {renderCurrentStep()}
          </ScrollView>

          {/* Navigation */}
          <View style={styles.navigation}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.navButton} onPress={prevStep}>
                <Text style={styles.navButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.navSpacer} />
            
            {currentStep < 7 ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton, !canProceed() && styles.navButtonDisabled]} 
                onPress={nextStep}
                disabled={!canProceed()}
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.navButton, styles.createButton]} 
                onPress={completeOnboarding}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.createButtonGradient}
                >
                  <Text style={styles.createButtonText}>Explore Our Cosmic Connection</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    color: AppColors.cosmicGold,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: AppColors.cosmicGold,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  stepSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  connectionTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  connectionTypeCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  connectionTypeCardActive: {
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectionTypeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  connectionTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  connectionTypeLabel: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  connectionTypeDescription: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  inputContainer: {
    alignItems: 'center',
  },
  nameInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    color: AppColors.onBackground,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  inputHint: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dateInputContainer: {
    alignItems: 'center',
  },
  dateInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    color: AppColors.onBackground,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  dateHint: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timeOptionsContainer: {
    marginBottom: 20,
  },
  timeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeOptionText: {
    fontSize: 16,
    color: AppColors.onBackground,
    textAlign: 'center',
  },
  timeInputContainer: {
    marginTop: 20,
  },
  timeInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    color: AppColors.onBackground,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationInputContainer: {
    alignItems: 'center',
  },
  locationInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    color: AppColors.onBackground,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  locationHint: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  contextScrollView: {
    maxHeight: height * 0.5,
  },
  contextSection: {
    marginBottom: 24,
  },
  contextLabel: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contextOption: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contextOptionActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: AppColors.cosmicGold,
  },
  contextOptionText: {
    fontSize: 14,
    color: AppColors.onBackground,
    textAlign: 'center',
  },
  notesInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: AppColors.onBackground,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textAlignVertical: 'top',
  },
  reviewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
  },
  reviewGradient: {
    padding: 24,
  },
  reviewHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 20,
    color: AppColors.onBackground,
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  reviewContent: {
    gap: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reviewLabel: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: AppColors.cosmicGold,
  },
  createButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
  navButtonText: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: '600',
  },
  navSpacer: {
    flex: 1,
  },
  // Starfield Background Styles
  starfieldContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  starfieldLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  shootingStar: {
    position: 'absolute',
    width: 100,
    height: 2,
    zIndex: 1,
  },
  shootingStarGradient: {
    flex: 1,
    borderRadius: 1,
  },
});

export default PartnerOnboardingFlow;
