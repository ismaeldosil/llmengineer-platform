import React from 'react';
import type { LucideIcon } from 'lucide-react-native';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const colorMap: Record<IconVariant, string> = {
  default: '#f3f4f6', // gray-100
  primary: '#3b82f6', // primary-500
  secondary: '#9ca3af', // gray-400
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  muted: '#6b7280', // gray-500
};

export interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Icon({
  icon: LucideIconComponent,
  size = 'md',
  variant = 'default',
  color,
  strokeWidth = 2,
}: IconProps) {
  const iconSize = sizeMap[size];
  const iconColor = color || colorMap[variant];

  return <LucideIconComponent size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
}
