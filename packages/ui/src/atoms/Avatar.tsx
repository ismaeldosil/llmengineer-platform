import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { colors, typography } from '../theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  source?: ImageSourcePropType;
  size?: AvatarSize;
}

const sizes: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizes: Record<AvatarSize, number> = {
  sm: 14,
  md: 16,
  lg: 22,
  xl: 32,
};

export function Avatar({ name, source, size = 'md' }: AvatarProps) {
  const dimension = sizes[size];
  const fontSize = fontSizes[size];
  const initial = name?.charAt(0).toUpperCase() || '?';

  const containerStyle = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
    },
  ];

  if (source) {
    return (
      <Image
        source={source}
        style={[containerStyle, styles.image]}
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
});
