import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, style, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, style]}
          placeholderTextColor="#6B7280"
          secureTextEntry={!isVisible}
          {...props}
        />
        <Pressable style={styles.iconButton} onPress={toggleVisibility}>
          <Ionicons name={isVisible ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
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
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  iconButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  error: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
});
