import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Icon } from './Icon';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {/* Icon */}
      {icon && (
        <View className="mb-4 p-4 bg-gray-800 rounded-full">
          <Icon icon={icon} size="xl" variant="muted" />
        </View>
      )}

      {/* Title */}
      <Text className="text-xl font-semibold text-gray-100 text-center mb-2">{title}</Text>

      {/* Description */}
      {description && (
        <Text className="text-base text-gray-400 text-center mb-6 max-w-sm">{description}</Text>
      )}

      {/* Action Button */}
      {action && (
        <Pressable
          onPress={action.onPress}
          className="bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-white font-semibold text-base">{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}
