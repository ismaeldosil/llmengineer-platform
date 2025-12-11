import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.gray[500]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[300],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  inputError: {
    borderColor: colors.error[500],
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
});
