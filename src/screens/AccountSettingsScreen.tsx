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
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';
import { AppColors } from '../theme/appTheme';
import * as Haptics from 'expo-haptics';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';
import { useUser, useUserBirthData, useUserZodiac } from '../contexts/UserContext';
import { AuthService } from '../services/auth';
import { haptics } from '../utils/haptics';

const { width, height } = Dimensions.get('window');

interface AccountSettingsScreenProps {
  userData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    zodiacSign: string;
  };
  onClose: () => void;
  onSave: (updatedData: any) => void;
  userId: string;
  onAccountDeleted: () => void;
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({ 
  userData, 
  onClose, 
  onSave,
  userId,
  onAccountDeleted
}) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  // Use personalized user data from context
  const { user, refreshUserData } = useUser();
  const { birthDate, birthTime, birthPlace, hasBirthTime } = useUserBirthData();
  const { sign: zodiacSign, symbol: zodiacSymbol } = useUserZodiac();

  const { triggerHaptic } = useSettings();

  // State for delete account dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Form state - use user context data with fallback to props
  const [formData, setFormData] = useState({
    name: user?.fullName || userData.name,
    birthDate: birthDate || userData.birthDate,
    birthTime: birthTime || userData.birthTime || '',
    birthLocation: birthPlace || userData.birthLocation,
    gender: user?.gender || '',
  });

  // Load fresh data from Supabase on mount
  useEffect(() => {
    loadUserDataFromSupabase();
  }, []);

  const loadUserDataFromSupabase = async () => {
    try {
      const profile = await AuthService.getCurrentUserProfile();
      if (profile) {
        setFormData({
          name: profile.full_name || '',
          birthDate: profile.birth_date || '',
          birthTime: profile.birth_time || '', // Handle null as empty string
          birthLocation: profile.birth_place || '',
          gender: profile.gender || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Check for changes
  useEffect(() => {
    const currentUserData = {
      name: user?.fullName || userData.name,
      birthDate: birthDate || userData.birthDate,
      birthTime: birthTime || userData.birthTime || '',
      birthLocation: birthPlace || userData.birthLocation,
      gender: user?.gender || '',
    };
    
    const hasFormChanges = 
      formData.name !== currentUserData.name ||
      formData.birthDate !== currentUserData.birthDate ||
      formData.birthTime !== currentUserData.birthTime ||
      formData.birthLocation !== currentUserData.birthLocation ||
      formData.gender !== currentUserData.gender;
    
    setHasChanges(hasFormChanges);
  }, [formData, user, birthDate, birthTime, birthPlace, userData]);

  const handleBack = () => {
    if (hasChanges && hasUserEdited) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              haptics.light();
              onClose();
            }
          }
        ]
      );
    } else {
      haptics.light();
      onClose();
    }
  };

  const handleEdit = () => {
    haptics.light();
    setIsEditing(true);
  };

  const handleCancel = () => {
    haptics.light();
    loadUserDataFromSupabase(); // Reload from Supabase
    setIsEditing(false);
    setHasUserEdited(false); // Reset user edit flag
  };

  const handleSave = async () => {
    haptics.medium();
    
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      haptics.error();
      return;
    }

    if (!formData.birthDate) {
      Alert.alert('Error', 'Birth date is required');
      haptics.error();
      return;
    }

    if (!formData.birthLocation.trim()) {
      Alert.alert('Error', 'Birth location is required');
      haptics.error();
      return;
    }

    try {
      // Save to Supabase
      const success = await AuthService.saveOnboardingData({
        fullName: formData.name,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime || null, // Convert empty string to null
        birthPlace: formData.birthLocation,
        gender: formData.gender || null, // Convert empty string to null
      });

      if (success) {
        // Also save via prop callback for compatibility
        onSave(formData);
        
        // Refresh user data from context
        await refreshUserData();
        
        setIsEditing(false);
        setHasUserEdited(false); // Reset user edit flag
        haptics.success();
        Alert.alert('Success', 'Your account information has been updated!');
      } else {
        haptics.error();
        Alert.alert('Error', 'Failed to update account information');
      }
    } catch (error) {
      console.error('Error saving account settings:', error);
      haptics.error();
      Alert.alert('Error', 'An error occurred while saving your information');
    }
  };

  const handleDeleteAccount = () => {
    haptics.heavy();
    setShowDeleteDialog(true);
  };

  const handleAccountDeleted = () => {
    // Account has been completely deleted, navigate back to landing
    onAccountDeleted();
  };

  const renderField = (
    label: string,
    value: string,
    field: keyof typeof formData,
    placeholder: string,
    multiline: boolean = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
        {label}
      </Text>
      {isEditing ? (
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, [field]: text }));
            setHasUserEdited(true); // Mark that user has made edits
            haptics.selection(); // Typing feedback
          }}
          allowFontScaling={true}
          maxFontSizeMultiplier={1.3}
          placeholder={placeholder}
          placeholderTextColor={AppColors.textSecondary}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <View style={styles.fieldDisplay}>
          <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
        </View>
      )}
    </View>
  );

  const renderGenderField = () => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
        Gender
      </Text>
      {isEditing ? (
        <View style={styles.genderSelector}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              formData.gender === 'male' && styles.genderButtonActive
            ]}
            onPress={() => {
              setFormData(prev => ({ ...prev, gender: 'male' }));
              haptics.light();
            }}
          >
            <Ionicons 
              name="male" 
              size={24} 
              color={formData.gender === 'male' ? AppColors.cosmicGold : AppColors.textSecondary} 
            />
            <Text style={[
              styles.genderButtonText,
              formData.gender === 'male' && styles.genderButtonTextActive
            ]}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              formData.gender === 'female' && styles.genderButtonActive
            ]}
            onPress={() => {
              setFormData(prev => ({ ...prev, gender: 'female' }));
              haptics.light();
            }}
          >
            <Ionicons 
              name="female" 
              size={24} 
              color={formData.gender === 'female' ? AppColors.cosmicGold : AppColors.textSecondary} 
            />
            <Text style={[
              styles.genderButtonText,
              formData.gender === 'female' && styles.genderButtonTextActive
            ]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.fieldDisplay}>
          <Text style={styles.fieldValue}>
            {formData.gender === 'male' ? 'Male' : formData.gender === 'female' ? 'Female' : 'Not set'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[AppColors.background, AppColors.surface]}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={AppColors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Account Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Profile Information
            </Text>
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(138, 79, 255, 0.08)']}
                style={styles.profileGradient}
              >
                <View style={styles.profileAvatar}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{formData.name[0] || 'U'}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                    {formData.name || 'User'}
                  </Text>
                  <Text style={styles.profileZodiac}>{zodiacSign || userData.zodiacSign}</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                Personal Details
              </Text>
              {!isEditing ? (
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Ionicons name="pencil-outline" size={16} color={AppColors.cosmicGold} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveButton, (!hasChanges || !hasUserEdited) && styles.saveButtonDisabled]} 
                    onPress={handleSave}
                    disabled={!hasChanges || !hasUserEdited}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {renderField('Full Name', formData.name, 'name', 'Enter your full name')}
            {renderGenderField()}
            {renderField('Birth Date', formData.birthDate, 'birthDate', 'YYYY-MM-DD')}
            {renderField('Birth Time', formData.birthTime, 'birthTime', 'HH:MM (optional)')}
            {renderField('Birth Location', formData.birthLocation, 'birthLocation', 'City, Country', true)}
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Danger Zone
            </Text>
            
            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
              <LinearGradient
                colors={['rgba(255, 0, 0, 0.1)', 'rgba(255, 100, 100, 0.1)']}
                style={styles.dangerGradient}
              >
                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                <View style={styles.dangerTextContainer}>
                  <Text style={styles.dangerTitle}>Delete Account</Text>
                  <Text style={styles.dangerSubtitle}>Permanently delete your account and all data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onAccountDeleted={handleAccountDeleted}
        userId={userId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    color: AppColors.cosmicGold,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: AppColors.cosmicGold,
    marginBottom: 15,
    marginLeft: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 15,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    color: AppColors.onBackground,
    marginBottom: 4,
  },
  profileZodiac: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: AppColors.cosmicGold,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: AppColors.cosmicGold,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: AppColors.onBackground,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppColors.onBackground,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fieldInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fieldValue: {
    fontSize: 16,
    color: AppColors.onBackground,
  },
  dangerButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dangerGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 100, 0.3)',
  },
  dangerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  dangerTitle: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 4,
  },
  dangerSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    borderColor: AppColors.cosmicGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  genderButtonText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: AppColors.cosmicGold,
  },
});

export default AccountSettingsScreen;
