import { supabase } from './supabase';

export interface AccountDeletionResult {
  success: boolean;
  error?: string;
  deletedData: {
    auth: boolean;
    profile: boolean;
    horoscopes: boolean;
    chatHistory: boolean;
    preferences: boolean;
    analytics: boolean;
  };
}

/**
 * Completely deletes a user account and ALL associated data
 * This makes the user completely new if they try to sign up again
 */
export const deleteUserAccount = async (userId: string): Promise<AccountDeletionResult> => {
  const result: AccountDeletionResult = {
    success: false,
    deletedData: {
      auth: false,
      profile: false,
      horoscopes: false,
      chatHistory: false,
      preferences: false,
      analytics: false,
    }
  };

  try {
    console.log('🗑️ Starting complete account deletion for user:', userId);

    // Step 1: Delete all user data from custom tables
    await deleteUserData(userId, result);

    // Step 2: Delete the user from Supabase Auth
    await deleteAuthUser(userId, result);

    result.success = true;
    console.log('✅ Account deletion completed successfully');
    
    return result;

  } catch (error) {
    console.error('❌ Account deletion failed:', error);
    result.error = error instanceof Error ? error.message : 'Unknown error occurred';
    return result;
  }
};

/**
 * Delete all user data from custom tables
 */
const deleteUserData = async (userId: string, result: AccountDeletionResult) => {
  try {
    // Delete user profile data
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
    } else {
      result.deletedData.profile = true;
      console.log('✅ User profile deleted');
    }

    // Delete horoscope history
    const { error: horoscopeError } = await supabase
      .from('horoscope_history')
      .delete()
      .eq('user_id', userId);

    if (horoscopeError) {
      console.error('Error deleting horoscope history:', horoscopeError);
    } else {
      result.deletedData.horoscopes = true;
      console.log('✅ Horoscope history deleted');
    }

    // Delete chat history
    const { error: chatError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId);

    if (chatError) {
      console.error('Error deleting chat history:', chatError);
    } else {
      result.deletedData.chatHistory = true;
      console.log('✅ Chat history deleted');
    }

    // Delete user preferences
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    if (preferencesError) {
      console.error('Error deleting user preferences:', preferencesError);
    } else {
      result.deletedData.preferences = true;
      console.log('✅ User preferences deleted');
    }

    // Delete analytics data
    const { error: analyticsError } = await supabase
      .from('user_analytics')
      .delete()
      .eq('user_id', userId);

    if (analyticsError) {
      console.error('Error deleting analytics data:', analyticsError);
    } else {
      result.deletedData.analytics = true;
      console.log('✅ Analytics data deleted');
    }

    // Delete subscription data (if any)
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subscriptionError) {
      console.error('Error deleting subscription data:', subscriptionError);
    } else {
      console.log('✅ Subscription data deleted');
    }

    // Delete any other user-related data
    // Add more tables as needed based on your schema

  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

/**
 * Delete user from Supabase Auth
 * This removes the authentication record completely
 */
const deleteAuthUser = async (userId: string, result: AccountDeletionResult) => {
  try {
    // Note: This requires admin privileges
    // You'll need to call this from a server-side function or use the Admin API
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting auth user:', error);
      throw error;
    }

    result.deletedData.auth = true;
    console.log('✅ Auth user deleted');

  } catch (error) {
    console.error('Error deleting auth user:', error);
    throw error;
  }
};

/**
 * Alternative approach using Supabase Edge Function
 * This is more secure as it runs server-side with admin privileges
 */
export const deleteUserAccountViaFunction = async (userId: string): Promise<AccountDeletionResult> => {
  try {
    console.log('🗑️ Calling account deletion function for user:', userId);

    // Validate userId
    if (!userId || userId === 'default-user-id') {
      throw new Error('Invalid user ID provided for account deletion');
    }

    const { data, error } = await supabase.functions.invoke('delete-user-account', {
      body: { userId }
    });

    if (error) {
      console.error('Error calling deletion function:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If Edge Function fails, try direct deletion as fallback
      console.log('🔄 Edge Function failed, trying direct deletion as fallback...');
      return await deleteUserAccount(userId);
    }

    console.log('✅ Account deletion function completed');
    console.log('Deletion result:', data);
    return data;

  } catch (error) {
    console.error('❌ Account deletion function failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // If it's a function error, try to extract more details
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    // Try direct deletion as fallback
    console.log('🔄 Trying direct deletion as fallback...');
    try {
      return await deleteUserAccount(userId);
    } catch (fallbackError) {
      console.error('❌ Fallback deletion also failed:', fallbackError);
      return {
        success: false,
        error: `Edge Function failed: ${errorMessage}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
        deletedData: {
          auth: false,
          profile: false,
          horoscopes: false,
          chatHistory: false,
          preferences: false,
          analytics: false,
        }
      };
    }
  }
};

/**
 * Clear all local app data
 * This ensures no traces remain on the device
 */
export const clearLocalAppData = async () => {
  try {
    // Clear AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.clear();

    // Clear any other local storage
    // Add other storage clearing as needed

    console.log('✅ Local app data cleared');
  } catch (error) {
    console.error('Error clearing local data:', error);
  }
};
