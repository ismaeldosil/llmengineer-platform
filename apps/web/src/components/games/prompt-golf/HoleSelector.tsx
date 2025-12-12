import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

export interface PromptGolfHole {
  id: string;
  name: string;
  description: string;
  targetOutput: string;
  par: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface HoleSelectorProps {
  holes: PromptGolfHole[];
  selectedHoleId: string;
  onSelectHole: (holeId: string) => void;
  completedHoles?: Set<string>;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '#10B981';
    case 'medium':
      return '#F59E0B';
    case 'hard':
      return '#EF4444';
    default:
      return '#9CA3AF';
  }
};

export function HoleSelector({
  holes,
  selectedHoleId,
  onSelectHole,
  completedHoles = new Set(),
}: HoleSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Hole</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.holesContainer}>
          {holes.map((hole) => {
            const isSelected = hole.id === selectedHoleId;
            const isCompleted = completedHoles.has(hole.id);

            return (
              <Pressable
                key={hole.id}
                style={[styles.holeCard, isSelected && styles.holeCardSelected]}
                onPress={() => onSelectHole(hole.id)}
              >
                <View style={styles.holeHeader}>
                  <Text style={[styles.holeName, isSelected && styles.holeNameSelected]}>
                    {hole.name}
                  </Text>
                  {isCompleted && <Text style={styles.completedBadge}>✓</Text>}
                </View>

                <View style={styles.holeDetails}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(hole.difficulty) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(hole.difficulty) },
                      ]}
                    >
                      {hole.difficulty}
                    </Text>
                  </View>
                  <View style={styles.parBadge}>
                    <Text style={styles.parText}>Par {hole.par}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  scrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  holesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  holeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    padding: 16,
    minWidth: 180,
  },
  holeCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F610',
  },
  holeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  holeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    flex: 1,
  },
  holeNameSelected: {
    color: '#F9FAFB',
  },
  completedBadge: {
    fontSize: 18,
    color: '#10B981',
  },
  holeDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  parBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  parText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
