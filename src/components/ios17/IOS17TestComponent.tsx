import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { iOS17Theme } from '../../theme/ios17Theme';

const IOS17TestComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS 17 Test Component</Text>
      <Text style={styles.subtitle}>This component is working!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: iOS17Theme.colors.systemBackground,
    padding: iOS17Theme.spacing.lg,
  },
  title: {
    ...iOS17Theme.typography.title1,
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.md,
  },
  subtitle: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.secondaryLabel,
  },
});

export default IOS17TestComponent;
