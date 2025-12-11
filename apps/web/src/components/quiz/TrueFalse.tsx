import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import type { QuizQuestion } from '@llmengineer/shared';

interface TrueFalseProps {
  question: QuizQuestion;
  onAnswer: (selectedAnswer: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  selectedAnswer?: string;
}

export function TrueFalse({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  selectedAnswer,
}: TrueFalseProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedAnswer);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handlePress = (answer: string) => {
    if (disabled) return;
    setSelected(answer);
    onAnswer(answer);
  };

  const getButtonStyle = (answer: string) => {
    const isSelected = selected === answer;
    const isCorrect = answer === question.correctAnswer;

    if (showFeedback) {
      if (isSelected && isCorrect) {
        return styles.correctButton;
      }
      if (isSelected && !isCorrect) {
        return styles.incorrectButton;
      }
      if (isCorrect) {
        return styles.correctButton;
      }
    }

    if (isSelected) {
      return styles.selectedButton;
    }

    return null;
  };

  const getButtonTextStyle = (answer: string) => {
    const isSelected = selected === answer;
    const isCorrect = answer === question.correctAnswer;

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

      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, styles.trueButton, getButtonStyle('true')]}
          onPress={() => handlePress('true')}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, getButtonTextStyle('true')]}>
            True
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.falseButton, getButtonStyle('false')]}
          onPress={() => handlePress('false')}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, getButtonTextStyle('false')]}>
            False
          </Text>
        </Pressable>
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trueButton: {
    // Base style for true button
  },
  falseButton: {
    // Base style for false button
  },
  selectedButton: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F610',
  },
  correctButton: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  incorrectButton: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5E7EB',
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
