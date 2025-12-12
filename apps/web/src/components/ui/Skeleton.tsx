import React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-lg';
    }
  };

  const getDimensions = (): ViewStyle => {
    const style: ViewStyle = {};

    if (width !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style.width = width as any;
    }

    if (height !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style.height = height as any;
    }

    // Default dimensions based on variant
    if (variant === 'circular' && !width && !height) {
      style.width = 40;
      style.height = 40;
    } else if (variant === 'text' && !height) {
      style.height = 16;
    } else if (variant === 'rectangular' && !height) {
      style.height = 100;
    }

    return style;
  };

  return (
    <View
      style={getDimensions()}
      className={`bg-gray-700 animate-shimmer overflow-hidden ${getVariantStyles()} ${className}`}
    />
  );
}
