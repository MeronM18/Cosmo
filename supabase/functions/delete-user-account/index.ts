import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key (admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🗑️ Starting account deletion for user:', userId)

    const deletionResult = {
      success: false,
      deletedData: {
        auth: false,
        profile: false,
        horoscopes: false,
        chatHistory: false,
        preferences: false,
        analytics: false,
      }
    }

    // Step 1: Delete all user data from custom tables
    try {
      // Delete user profile data
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('user_id', userId)

      if (!profileError) {
        deletionResult.deletedData.profile = true
        console.log('✅ User profile deleted')
      }

      // Delete horoscope history
      const { error: horoscopeError } = await supabaseAdmin
        .from('horoscope_history')
        .delete()
        .eq('user_id', userId)

      if (!horoscopeError) {
        deletionResult.deletedData.horoscopes = true
        console.log('✅ Horoscope history deleted')
      }

      // Delete chat history
      const { error: chatError } = await supabaseAdmin
        .from('chat_conversations')
        .delete()
        .eq('user_id', userId)

      if (!chatError) {
        deletionResult.deletedData.chatHistory = true
        console.log('✅ Chat history deleted')
      }

      // Delete user preferences
      const { error: preferencesError } = await supabaseAdmin
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)

      if (!preferencesError) {
        deletionResult.deletedData.preferences = true
        console.log('✅ User preferences deleted')
      }

      // Delete analytics data
      const { error: analyticsError } = await supabaseAdmin
        .from('user_analytics')
        .delete()
        .eq('user_id', userId)

      if (!analyticsError) {
        deletionResult.deletedData.analytics = true
        console.log('✅ Analytics data deleted')
      }

      // Delete subscription data
      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)

      if (!subscriptionError) {
        console.log('✅ Subscription data deleted')
      }

      // Add more table deletions as needed based on your schema

    } catch (error) {
      console.error('Error deleting user data:', error)
      throw error
    }

    // Step 2: Delete the user from Supabase Auth
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (authError) {
        console.error('Error deleting auth user:', authError)
        throw authError
      }

      deletionResult.deletedData.auth = true
      console.log('✅ Auth user deleted')

    } catch (error) {
      console.error('Error deleting auth user:', error)
      throw error
    }

    deletionResult.success = true
    console.log('✅ Complete account deletion successful')

    return new Response(
      JSON.stringify(deletionResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Account deletion failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
