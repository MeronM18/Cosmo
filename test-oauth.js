// Test script to verify OAuth URL generation
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adyrgavblydgdvttttwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeXJnYXZibHlkZ2R2dHR0dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODk5MjksImV4cCI6MjA3Mjk2NTkyOX0.wc5KPXufeFqWSdK4-dYsZUg6lQmEh1X4ZiS4z1L9ahI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOAuthUrlGeneration() {
  try {
    console.log('Testing OAuth URL generation...');
    
    const returnUrl = 'exp://10.1.10.244:8082/--/auth/callback';
    console.log('Return URL:', returnUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: returnUrl,
        scopes: 'email profile openid',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ OAuth URL generation failed:', error);
      return;
    }

    if (!data?.url) {
      console.error('❌ No OAuth URL received');
      return;
    }

    console.log('✅ OAuth URL generated successfully');
    console.log('OAuth URL:', data.url);
    
    // Check if the URL is valid
    try {
      new URL(data.url);
      console.log('✅ OAuth URL is valid');
    } catch (urlError) {
      console.error('❌ OAuth URL is invalid:', urlError);
    }
    
  } catch (error) {
    console.error('❌ OAuth test failed:', error);
  }
}

testOAuthUrlGeneration();
