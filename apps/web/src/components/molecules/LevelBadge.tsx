import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { LucideIcon } from 'lucide-react-native';

export interface Level {
  level: number;
  icon: LucideIcon;
  color: string;
}

export interface LevelBadgeProps {
  level: Level;
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    iconSize: 16,
    fontSize: 14,
    paddingX: 8,
    paddingY: 4,
    gap: 6,
  },
  md: {
    iconSize: 20,
    fontSize: 16,
    paddingX: 12,
    paddingY: 6,
    gap: 8,
  },
  lg: {
    iconSize: 24,
    fontSize: 18,
    paddingX: 16,
    paddingY: 8,
    gap: 10,
  },
} as const;

export function LevelBadge({ level, variant = 'default', size = 'md' }: LevelBadgeProps) {
  const config = sizeConfig[size];

  if (variant === 'minimal') {
    return (
      <View style={[styles.container, styles.minimal, { gap: config.gap }]}>
        <Icon icon={level.icon} size={size} color={level.color} />
        <Text style={[styles.text, { fontSize: config.fontSize, color: level.color }]}>
          {level.level}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.default,
        {
          paddingHorizontal: config.paddingX,
          paddingVertical: config.paddingY,
          gap: config.gap,
        },
      ]}
    >
      <Icon icon={level.icon} size={size} color={level.color} />
      <Text
        style={[styles.text, styles.levelText, { fontSize: config.fontSize, color: level.color }]}
      >
        Lvl {level.level}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  default: {
    borderRadius: 9999,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
  },
  minimal: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: '600',
  },
  levelText: {
    fontWeight: '600',
  },
});
