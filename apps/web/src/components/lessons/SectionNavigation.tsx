import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';

interface SectionNavigationProps {
  currentSection: number;
  totalSections: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete?: () => void;
  isLastSection: boolean;
  isFirstSection: boolean;
}

export function SectionNavigation({
  currentSection,
  totalSections,
  onPrevious,
  onNext,
  onComplete,
  isLastSection,
  isFirstSection,
}: SectionNavigationProps) {
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      {/* Previous Button */}
      <Pressable
        style={[styles.button, styles.buttonPrevious, isFirstSection && styles.buttonDisabled]}
        onPress={onPrevious}
        disabled={isFirstSection}
      >
        <ChevronLeft
          size={20}
          color={isFirstSection ? '#6B7280' : '#F9FAFB'}
          style={styles.iconLeft}
        />
        <Text style={[styles.buttonText, isFirstSection && styles.buttonTextDisabled]}>
          Anterior
        </Text>
      </Pressable>

      {/* Section indicator */}
      <View style={styles.centerIndicator}>
        <Text style={styles.indicatorText}>
          {currentSection + 1} de {totalSections}
        </Text>
      </View>

      {/* Next/Complete Button */}
      {isLastSection ? (
        <Pressable style={[styles.button, styles.buttonComplete]} onPress={handleComplete}>
          <Text style={[styles.buttonText, styles.buttonCompleteText]}>Completar</Text>
          <Check size={20} color="#FFFFFF" style={styles.iconRight} />
        </Pressable>
      ) : (
        <Pressable style={[styles.button, styles.buttonNext]} onPress={onNext}>
          <Text style={styles.buttonText}>Siguiente</Text>
          <ChevronRight size={20} color="#F9FAFB" style={styles.iconRight} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonPrevious: {
    backgroundColor: '#374151',
  },
  buttonNext: {
    backgroundColor: '#3B82F6',
  },
  buttonComplete: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  buttonTextDisabled: {
    color: '#6B7280',
  },
  buttonCompleteText: {
    color: '#FFFFFF',
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
  centerIndicator: {
    flex: 1,
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});
