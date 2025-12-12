import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SectionProgress } from './SectionProgress';
import { SectionNavigation } from './SectionNavigation';

export interface Section {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'quiz';
}

export interface LessonSectionsProps {
  sections: Section[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  onComplete?: () => void;
}

export function LessonSections({
  sections,
  currentSection,
  onSectionChange,
  onComplete,
}: LessonSectionsProps) {
  const [readSections, setReadSections] = useState<Set<number>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);
  const opacity = useSharedValue(1);

  // Mark current section as read when it changes
  useEffect(() => {
    setReadSections((prev) => new Set(prev).add(currentSection));
  }, [currentSection]);

  // Animate section transitions
  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });

    // Scroll to top when section changes
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentSection]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePrevious = () => {
    if (currentSection > 0) {
      onSectionChange(currentSection - 1);
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      onSectionChange(currentSection + 1);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const currentSectionData = sections[currentSection];
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === sections.length - 1;

  if (!currentSectionData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No section data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <SectionProgress currentSection={currentSection} totalSections={sections.length} />

      {/* Section content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTypeContainer}>
              <Text style={styles.sectionType}>{getSectionTypeLabel(currentSectionData.type)}</Text>
            </View>
            <Text style={styles.sectionTitle}>{currentSectionData.title}</Text>
          </View>

          {/* Section content */}
          <View style={styles.sectionContentContainer}>
            <Text style={styles.sectionContent}>{currentSectionData.content}</Text>
          </View>

          {/* Read indicator */}
          {readSections.has(currentSection) && (
            <View style={styles.readIndicator}>
              <Text style={styles.readIndicatorText}>Sección leída</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      <SectionNavigation
        currentSection={currentSection}
        totalSections={sections.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={handleComplete}
        isFirstSection={isFirstSection}
        isLastSection={isLastSection}
      />
    </View>
  );
}

function getSectionTypeLabel(type: Section['type']): string {
  switch (type) {
    case 'text':
      return 'Lectura';
    case 'code':
      return 'Código';
    case 'quiz':
      return 'Quiz';
    default:
      return 'Sección';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTypeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sectionType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    lineHeight: 32,
  },
  sectionContentContainer: {
    marginBottom: 24,
  },
  sectionContent: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  readIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    marginTop: 16,
  },
  readIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
