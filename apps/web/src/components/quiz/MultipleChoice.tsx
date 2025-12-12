import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Circle, CheckCircle, XCircle } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

interface MultipleChoiceProps {
  question: string;
  options: string[];
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  correctAnswer?: number;
  showResult?: boolean;
}

export function MultipleChoice({
  question,
  options,
  selectedAnswer,
  onSelect,
  disabled = false,
  correctAnswer,
  showResult = false,
}: MultipleChoiceProps) {
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const scaleAnims = useRef(options.map(() => new Animated.Value(1))).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showResult) {
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      feedbackAnim.setValue(0);
    }
  }, [showResult, feedbackAnim]);

  const handlePress = (index: number) => {
    if (disabled) return;

    // Animate the pressed option
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(index);
  };

  const getOptionStyle = (index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = correctAnswer === index;

    if (showResult) {
      if (isCorrect) {
        return styles.correctOption;
      }
      if (isSelected && !isCorrect) {
        return styles.incorrectOption;
      }
    }

    if (isSelected) {
      return styles.selectedOption;
    }

    return null;
  };

  const getOptionTextStyle = (index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = correctAnswer === index;

    if (showResult) {
      if (isCorrect) {
        return styles.correctText;
      }
      if (isSelected && !isCorrect) {
        return styles.incorrectText;
      }
    }

    if (isSelected) {
      return styles.selectedText;
    }

    return null;
  };

  const getOptionIcon = (index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = correctAnswer === index;

    if (showResult) {
      if (isCorrect) {
        return <Icon icon={CheckCircle} size="sm" color="#10B981" />;
      }
      if (isSelected && !isCorrect) {
        return <Icon icon={XCircle} size="sm" color="#EF4444" />;
      }
    }

    if (isSelected) {
      return <Icon icon={CheckCircle} size="sm" color="#3B82F6" />;
    }

    return <Icon icon={Circle} size="sm" color="#6B7280" />;
  };

  const getLabelStyle = (index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = correctAnswer === index;

    if (showResult) {
      if (isCorrect) {
        return styles.correctLabel;
      }
      if (isSelected && !isCorrect) {
        return styles.incorrectLabel;
      }
    }

    if (isSelected) {
      return styles.selectedLabel;
    }

    return null;
  };

  const getLabelTextStyle = (index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = correctAnswer === index;

    if (showResult) {
      if (isCorrect) {
        return styles.correctLabelText;
      }
      if (isSelected && !isCorrect) {
        return styles.incorrectLabelText;
      }
    }

    if (isSelected) {
      return styles.selectedLabelText;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Animated.View
            key={index}
            style={{
              transform: [{ scale: scaleAnims[index] }],
            }}
          >
            <Pressable
              style={[styles.option, getOptionStyle(index)]}
              onPress={() => handlePress(index)}
              disabled={disabled}
            >
              <View style={styles.optionContent}>
                <View style={[styles.label, getLabelStyle(index)]}>
                  <Text style={[styles.labelText, getLabelTextStyle(index)]}>
                    {optionLabels[index]}
                  </Text>
                </View>
                <Text style={[styles.optionText, getOptionTextStyle(index)]}>{option}</Text>
                <View style={styles.iconContainer}>{getOptionIcon(index)}</View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {showResult && selectedAnswer !== null && (
        <Animated.View style={[styles.feedback, { opacity: feedbackAnim }]}>
          <View style={styles.feedbackContent}>
            {selectedAnswer === correctAnswer ? (
              <>
                <Icon icon={CheckCircle} size="md" color="#10B981" />
                <View style={styles.feedbackTextContainer}>
                  <Text style={styles.feedbackTitle}>Correct!</Text>
                  <Text style={styles.feedbackDescription}>Well done! That's the right answer.</Text>
                </View>
              </>
            ) : (
              <>
                <Icon icon={XCircle} size="md" color="#EF4444" />
                <View style={styles.feedbackTextContainer}>
                  <Text style={styles.feedbackTitle}>Incorrect</Text>
                  <Text style={styles.feedbackDescription}>
                    The correct answer is {optionLabels[correctAnswer || 0]}.
                  </Text>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  label: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLabel: {
    backgroundColor: '#3B82F6',
  },
  correctLabel: {
    backgroundColor: '#10B981',
  },
  incorrectLabel: {
    backgroundColor: '#EF4444',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  selectedLabelText: {
    color: '#FFFFFF',
  },
  correctLabelText: {
    color: '#FFFFFF',
  },
  incorrectLabelText: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    color: '#E5E7EB',
    flex: 1,
    lineHeight: 22,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F610',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  selectedText: {
    color: '#F9FAFB',
  },
  correctText: {
    color: '#10B981',
    fontWeight: '500',
  },
  incorrectText: {
    color: '#EF4444',
  },
  feedback: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
