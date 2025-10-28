import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthService } from '../services/auth';
import type { UserProfile } from '../types';

interface MainAppScreenProps {
  onNavigateToChat?: () => void;
  onAccountDeleted?: () => void;
}

export default function MainAppScreen({ onNavigateToChat, onAccountDeleted }: MainAppScreenProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await AuthService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error: any) {
      Alert.alert('Error', `Sign out failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Cosmo! ✨</Text>
        <Text style={styles.subtitle}>Your personal AI astrologer</Text>
      </View>

      {userProfile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>Your Profile</Text>
          <Text style={styles.profileText}>Name: {userProfile.full_name || userProfile.fullName}</Text>
          <Text style={styles.profileText}>Email: {userProfile.email}</Text>
          <Text style={styles.profileText}>Birth Date: {userProfile.birth_date || userProfile.birthDate}</Text>
          {(userProfile.birth_time || userProfile.birthTime) && (
            <Text style={styles.profileText}>Birth Time: {userProfile.birth_time || userProfile.birthTime}</Text>
          )}
          <Text style={styles.profileText}>Birth Place: {userProfile.birth_place || userProfile.birthPlace}</Text>
          {userProfile.gender && (
            <Text style={styles.profileText}>Gender: {userProfile.gender}</Text>
          )}
          <Text style={styles.profileText}>Timezone: {userProfile.timezone}</Text>
          <Text style={styles.profileText}>Status: {userProfile.subscription_status || userProfile.subscriptionStatus}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.contentTitle}>Ready to Explore the Stars?</Text>
        <Text style={styles.contentText}>
          Chat with Luna, your AI astrologer, to get personalized readings and cosmic guidance!
        </Text>

        <TouchableOpacity 
          style={styles.chatButton} 
          onPress={onNavigateToChat}
        >
          <Text style={styles.chatButtonText}>Chat with Luna ✨</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
        
        {onAccountDeleted && (
          <TouchableOpacity 
            style={styles.deleteAccountButton} 
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'This will permanently delete your account and all data. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: onAccountDeleted
                  }
                ]
              );
            }}
          >
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  profileText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  chatButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  deleteAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});