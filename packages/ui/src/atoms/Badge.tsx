import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  return (
    <View style={[styles.container, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  primary: {
    backgroundColor: `${colors.primary[500]}20`,
  },
  success: {
    backgroundColor: `${colors.success[500]}20`,
  },
  warning: {
    backgroundColor: `${colors.warning[500]}20`,
  },
  error: {
    backgroundColor: `${colors.error[500]}20`,
  },
  gray: {
    backgroundColor: colors.gray[700],
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  text_primary: {
    color: colors.primary[500],
  },
  text_success: {
    color: colors.success[500],
  },
  text_warning: {
    color: colors.warning[500],
  },
  text_error: {
    color: colors.error[500],
  },
  text_gray: {
    color: colors.gray[400],
  },
});
