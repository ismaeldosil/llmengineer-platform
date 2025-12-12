import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  testID?: string;
}

export function Input({ label, error, style, testID, ...props }: InputProps) {
  return (
    <View style={styles.container} testID={testID ? `${testID}-container` : 'input-container'}>
      {label && (
        <Text style={styles.label} testID={testID ? `${testID}-label` : 'input-label'}>
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#6B7280"
        testID={testID}
        {...props}
      />
      {error && (
        <Text style={styles.error} testID={testID ? `${testID}-error` : 'input-error'}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
});
