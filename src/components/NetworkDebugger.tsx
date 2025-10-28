import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SupabaseService } from '../services/supabase';
import { AuthService } from '../services/auth';

interface NetworkDebuggerProps {
  visible?: boolean;
}

export default function NetworkDebugger({ visible = false }: NetworkDebuggerProps) {
  const [networkStatus, setNetworkStatus] = useState<string>('Checking...');
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');
  const [authStatus, setAuthStatus] = useState<string>('Checking...');

  const runDiagnostics = async () => {
    setNetworkStatus('Testing...');
    setSupabaseStatus('Testing...');
    setAuthStatus('Testing...');

    try {
      // Test network connectivity
      const networkOk = await SupabaseService.checkNetworkConnectivity();
      setNetworkStatus(networkOk ? '✅ Connected' : '❌ Failed');

      // Test Supabase connection
      const supabaseOk = await SupabaseService.testConnection();
      setSupabaseStatus(supabaseOk ? '✅ Connected' : '❌ Failed');

      // Test auth service
      const user = await AuthService.getCurrentUser();
      setAuthStatus(user ? `✅ User: ${user.email}` : 'ℹ️ No user');

    } catch (error) {
      setNetworkStatus('❌ Error');
      setSupabaseStatus('❌ Error');
      setAuthStatus('❌ Error');
    }
  };

  useEffect(() => {
    if (visible) {
      runDiagnostics();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Diagnostics</Text>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>Network:</Text>
        <Text style={styles.status}>{networkStatus}</Text>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>Supabase:</Text>
        <Text style={styles.status}>{supabaseStatus}</Text>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>Auth:</Text>
        <Text style={styles.status}>{authStatus}</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={runDiagnostics}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: 'white',
    fontSize: 14,
  },
  status: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
