import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

interface TrueFalseProps {
  question: string;
  selectedAnswer: boolean | null;
  onSelect: (answer: boolean) => void;
  disabled?: boolean;
  correctAnswer?: boolean; // For showing result
  showResult?: boolean;
}

export function TrueFalse({
  question,
  selectedAnswer,
  onSelect,
  disabled = false,
  correctAnswer,
  showResult = false,
}: TrueFalseProps) {
  const scaleAnimTrue = useRef(new Animated.Value(1)).current;
  const scaleAnimFalse = useRef(new Animated.Value(1)).current;
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

  const handlePress = (answer: boolean) => {
    if (disabled) return;

    const scaleAnim = answer ? scaleAnimTrue : scaleAnimFalse;

    // Animate the pressed button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(answer);
  };

  const getButtonStyle = (answer: boolean) => {
    const isSelected = selectedAnswer === answer;
    const isCorrect = correctAnswer === answer;

    if (showResult) {
      if (isCorrect) {
        return styles.correctButton;
      }
      if (isSelected && !isCorrect) {
        return styles.incorrectButton;
      }
    }

    if (isSelected) {
      return styles.selectedButton;
    }

    return null;
  };

  const getIconColor = (answer: boolean) => {
    const isSelected = selectedAnswer === answer;
    const isCorrect = correctAnswer === answer;

    if (showResult) {
      if (isCorrect) {
        return '#10B981'; // Green
      }
      if (isSelected && !isCorrect) {
        return '#EF4444'; // Red
      }
    }

    if (isSelected) {
      return '#3B82F6'; // Blue
    }

    return '#9CA3AF'; // Gray
  };

  const getTextStyle = (answer: boolean) => {
    const isSelected = selectedAnswer === answer;
    const isCorrect = correctAnswer === answer;

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

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.buttonsContainer}>
        <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnimTrue }] }}>
          <Pressable
            style={[styles.button, styles.trueButton, getButtonStyle(true)]}
            onPress={() => handlePress(true)}
            disabled={disabled}
          >
            <Icon icon={Check} size="lg" color={getIconColor(true)} />
            <Text style={[styles.buttonText, getTextStyle(true)]}>Verdadero</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnimFalse }] }}>
          <Pressable
            style={[styles.button, styles.falseButton, getButtonStyle(false)]}
            onPress={() => handlePress(false)}
            disabled={disabled}
          >
            <Icon icon={X} size="lg" color={getIconColor(false)} />
            <Text style={[styles.buttonText, getTextStyle(false)]}>Falso</Text>
          </Pressable>
        </Animated.View>
      </View>

      {showResult && correctAnswer !== undefined && (
        <Animated.View style={[styles.feedback, { opacity: feedbackAnim }]}>
          {selectedAnswer === correctAnswer ? (
            <View style={styles.feedbackContent}>
              <Icon icon={Check} size="md" variant="success" />
              <Text style={styles.feedbackTextCorrect}>¡Correcto!</Text>
            </View>
          ) : (
            <View style={styles.feedbackContent}>
              <Icon icon={X} size="md" variant="error" />
              <Text style={styles.feedbackTextIncorrect}>Incorrecto</Text>
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
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    fontSize: 16,
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
