import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import type { QuizQuestion, QuizOption } from '@llmengineer/shared';

interface MultipleChoiceProps {
  question: QuizQuestion;
  onAnswer: (selectedAnswer: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  selectedAnswer?: string;
}

export function MultipleChoice({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  selectedAnswer,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedAnswer);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const options = question.options || [];
  const optionLabels = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (showFeedback) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showFeedback, fadeAnim]);

  const handlePress = (optionId: string) => {
    if (disabled) return;
    setSelected(optionId);
    onAnswer(optionId);
  };

  const getOptionStyle = (option: QuizOption) => {
    const isSelected = selected === option.id;
    const isCorrect = option.id === question.correctAnswer;

    if (showFeedback) {
      if (isSelected && isCorrect) {
        return styles.correctOption;
      }
      if (isSelected && !isCorrect) {
        return styles.incorrectOption;
      }
      if (isCorrect) {
        return styles.correctOption;
      }
    }

    if (isSelected) {
      return styles.selectedOption;
    }

    return null;
  };

  const getOptionTextStyle = (option: QuizOption) => {
    const isSelected = selected === option.id;
    const isCorrect = option.id === question.correctAnswer;

    if (showFeedback) {
      if ((isSelected && isCorrect) || isCorrect) {
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

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Pressable
            key={option.id}
            style={[styles.option, getOptionStyle(option)]}
            onPress={() => handlePress(option.id)}
            disabled={disabled}
          >
            <View style={styles.optionContent}>
              <View style={[styles.label, selected === option.id && styles.selectedLabel]}>
                <Text
                  style={[styles.labelText, selected === option.id && styles.selectedLabelText]}
                >
                  {optionLabels[index]}
                </Text>
              </View>
              <Text style={[styles.optionText, getOptionTextStyle(option)]}>{option.text}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {showFeedback && (
        <Animated.View style={[styles.feedback, { opacity: fadeAnim }]}>
          {selected === question.correctAnswer ? (
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackIcon}>✓</Text>
              <Text style={styles.feedbackTextCorrect}>Correct!</Text>
            </View>
          ) : (
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackIcon}>✗</Text>
              <Text style={styles.feedbackTextIncorrect}>Incorrect</Text>
            </View>
          )}
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
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  selectedLabelText: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    color: '#E5E7EB',
    flex: 1,
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
  },
  incorrectText: {
    color: '#EF4444',
  },
  feedback: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1F2937',
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  feedbackIcon: {
    fontSize: 24,
  },
  feedbackTextCorrect: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  feedbackTextIncorrect: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
