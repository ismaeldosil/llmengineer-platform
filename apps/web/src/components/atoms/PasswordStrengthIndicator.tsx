import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPasswordStrength } from '@/utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              index <= strength.score && { backgroundColor: strength.color },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strength.color }]}>
        {strength.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
