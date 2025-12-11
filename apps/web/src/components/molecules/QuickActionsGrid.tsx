import { View, Text, StyleSheet, Pressable } from 'react-native';

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
}

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          style={styles.actionButton}
          onPress={action.onPress}
          testID={`action-${action.id}`}
        >
          <Text style={styles.actionIcon}>{action.icon}</Text>
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9FAFB',
  },
});
