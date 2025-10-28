import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Typography } from '../theme/appTheme';
import { deleteUserAccountViaFunction, clearLocalAppData } from '../services/accountDeletionService';

interface DeleteAccountDialogProps {
  visible: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
  userId: string;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  visible,
  onClose,
  onAccountDeleted,
  userId,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  
  // Animation for loading spinner
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleDeleteAccount = async () => {
    if (confirmationText.toLowerCase() !== 'delete') {
      Alert.alert(
        'Invalid Confirmation',
        'Please type "DELETE" exactly to confirm account deletion.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. All your data will be permanently deleted and you will be treated as a completely new user if you sign up again. Are you absolutely sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            await performAccountDeletion();
          },
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    setIsDeleting(true);
    setShowLoadingOverlay(true);

    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    try {
      console.log('🗑️ Starting account deletion process...');

      // Step 1: Delete all data from Supabase
      const deletionResult = await deleteUserAccountViaFunction(userId);

      if (!deletionResult.success) {
        throw new Error(deletionResult.error || 'Account deletion failed');
      }

      console.log('✅ Supabase data deleted:', deletionResult.deletedData);

      // Step 2: Clear all local app data
      await clearLocalAppData();

      // Step 3: Show loading animation for 1.5 seconds (same as logout)
      setTimeout(() => {
        // Close dialog and redirect to landing
        onAccountDeleted();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('❌ Account deletion failed:', error);
      
      // Stop animation and show error
      setIsDeleting(false);
      setShowLoadingOverlay(false);
      
      Alert.alert(
        'Deletion Failed',
        'There was an error deleting your account. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Delete Account</Text>
          
          <Text style={styles.warning}>
            ⚠️ This action is permanent and cannot be undone.
          </Text>

          <Text style={styles.description}>
            Deleting your account will permanently remove:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Your login information</Text>
            <Text style={styles.listItem}>• All onboarding data</Text>
            <Text style={styles.listItem}>• Horoscope history</Text>
            <Text style={styles.listItem}>• Chat conversations</Text>
            <Text style={styles.listItem}>• Preferences and settings</Text>
            <Text style={styles.listItem}>• Subscription data</Text>
          </View>

          <Text style={styles.finalWarning}>
            You will be treated as a completely new user if you sign up again.
          </Text>

          <Text style={styles.confirmationLabel}>
            Type "DELETE" to confirm:
          </Text>

          <TextInput
            style={styles.confirmationInput}
            value={confirmationText}
            onChangeText={setConfirmationText}
            placeholder="Type DELETE here"
            placeholderTextColor={AppColors.textSecondary}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.3}
            autoCapitalize="characters"
            editable={!isDeleting}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                (isDeleting || confirmationText.toLowerCase() !== 'delete') && styles.disabledButton
              ]}
              onPress={handleDeleteAccount}
              disabled={isDeleting || confirmationText.toLowerCase() !== 'delete'}
            >
              {isDeleting ? (
                <ActivityIndicator color={AppColors.onSurface} size="small" />
              ) : (
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.deleteButtonGradient}
                >
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Overlay - Same as logout */}
        {showLoadingOverlay && (
          <View style={styles.loaderOverlay}>
            <View style={styles.loaderContainer}>
              <Animated.View 
                style={[
                  styles.loaderSpinner, 
                  { 
                    transform: [{
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.loaderText}>🗑️</Text>
              </Animated.View>
              <Text style={styles.loaderMessage}>Deleting Account...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...Typography.headline,
    textAlign: 'center',
    marginBottom: 16,
    color: AppColors.onSurface,
  },
  warning: {
    ...Typography.body,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    ...Typography.body,
    color: AppColors.onSurface,
    marginBottom: 12,
  },
  listContainer: {
    marginBottom: 16,
    paddingLeft: 16,
  },
  listItem: {
    ...Typography.body,
    color: AppColors.onSurfaceVariant,
    marginBottom: 4,
  },
  finalWarning: {
    ...Typography.body,
    color: AppColors.onSurface,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  confirmationLabel: {
    ...Typography.body,
    color: AppColors.onSurface,
    marginBottom: 8,
    fontWeight: '600',
  },
  confirmationInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Typography.body,
    borderWidth: 1,
    borderColor: '#444444',
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: AppColors.surfaceVariant,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: AppColors.onSurfaceVariant,
    fontWeight: '600',
  },
  deleteButton: {
    // Gradient will be applied inside
  },
  deleteButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...Typography.body,
    color: AppColors.onSurface,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Loading overlay styles (same as logout)
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: 32,
    marginBottom: 10,
  },
  loaderMessage: {
    color: AppColors.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
});
