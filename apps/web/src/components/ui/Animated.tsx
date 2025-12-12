import React from 'react';
import { View } from 'react-native';

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
  const animationStyle = {
    animationName,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationFillMode: 'both' as const,
    animationTimingFunction: 'ease-out' as const,
  };

  // For infinite animations
  if (animation === 'glow' || animation === 'bounce' || animation === 'pulse') {
    animationStyle.animationTimingFunction = 'ease-in-out';
    Object.assign(animationStyle, {
      animationIterationCount: 'infinite',
    });
  }

  return (
    <View style={animationStyle} className={className}>
      {children}
    </View>
  );
}
