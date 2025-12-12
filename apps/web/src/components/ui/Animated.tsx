import React from 'react';
import { View, Platform, ViewStyle } from 'react-native';

export type AnimationType = 'fadeIn' | 'slideUp' | 'scaleIn' | 'glow' | 'bounce' | 'pulse';

export interface AnimatedProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
}

const animationMap: Record<AnimationType, string> = {
  fadeIn: 'fadeIn',
  slideUp: 'slideUp',
  scaleIn: 'scaleIn',
  glow: 'glow',
  bounce: 'bounceSubtle',
  pulse: 'pulse',
};

export function Animated({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.3,
  className = '',
}: AnimatedProps) {
  const animationName = animationMap[animation];

  // Web-only animation styles - not supported on native
  const getAnimationStyle = (): ViewStyle => {
    if (Platform.OS !== 'web') {
      return {};
    }

    const baseStyle = {
      animationName,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      animationFillMode: 'both',
      animationTimingFunction:
        animation === 'glow' || animation === 'bounce' || animation === 'pulse'
          ? 'ease-in-out'
          : 'ease-out',
    };

    if (animation === 'glow' || animation === 'bounce' || animation === 'pulse') {
      return {
        ...baseStyle,
        animationIterationCount: 'infinite',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return baseStyle as any;
  };

  return (
    <View style={getAnimationStyle()} className={className}>
      {children}
    </View>
  );
}
