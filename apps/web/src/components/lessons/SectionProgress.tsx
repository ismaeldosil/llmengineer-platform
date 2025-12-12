import { View, Text, StyleSheet } from 'react-native';

interface SectionProgressProps {
  currentSection: number;
  totalSections: number;
}

export function SectionProgress({ currentSection, totalSections }: SectionProgressProps) {
  const progress = ((currentSection + 1) / totalSections) * 100;

  return (
    <View style={styles.container}>
      {/* Text indicator */}
      <Text style={styles.progressText}>
        {currentSection + 1} / {totalSections}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSections }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSection && styles.dotActive,
              index < currentSection && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
});
