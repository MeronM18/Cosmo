// Test script to verify network connectivity
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adyrgavblydgdvttttwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeXJnYXZibHlkZ2R2dHR0dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODk5MjksImV4cCI6MjA3Mjk2NTkyOX0.wc5KPXufeFqWSdK4-dYsZUg6lQmEh1X4ZiS4z1L9ahI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNetworkConnectivity() {
  try {
    console.log('Testing network connectivity...');
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), 5000);
    });
    
    // Create the fetch promise
    const fetchPromise = fetch('https://httpbin.org/status/200', {
      method: 'GET',
    });
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const isConnected = response.ok;
    console.log('Network connectivity check:', isConnected);
    
    if (isConnected) {
      console.log('✅ Network connectivity test passed');
      
      // Test Supabase connection
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase connection failed:', error);
      } else {
        console.log('✅ Supabase connection test passed');
      }
    } else {
      console.log('❌ Network connectivity test failed');
    }
  } catch (error) {
    console.error('❌ Network test failed:', error);
  }
}

testNetworkConnectivity();
