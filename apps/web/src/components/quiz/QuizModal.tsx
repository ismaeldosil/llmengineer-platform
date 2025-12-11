import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useMemo } from 'react';
import type { QuizQuestion } from '@llmengineer/shared';
import { MultipleChoice } from './MultipleChoice';
import { TrueFalse } from './TrueFalse';

interface QuizModalProps {
  visible: boolean;
  questions: QuizQuestion[];
  onComplete: (score: number, answers: Array<{ questionId: string; selectedAnswer: string }>) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
}

export function QuizModal({
  visible,
  questions,
  onComplete,
  onClose,
  isSubmitting = false,
}: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const currentAnswer = useMemo(
    () => answers.find((a) => a.questionId === currentQuestion?.id),
    [answers, currentQuestion]
  );

  const allQuestionsAnswered = useMemo(
    () => answers.length === totalQuestions,
    [answers.length, totalQuestions]
  );

  const score = useMemo(() => {
    return answers.filter((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      return question && answer.selectedAnswer === question.correctAnswer;
    }).length;
  }, [answers, questions]);

  const handleAnswer = (selectedAnswer: string) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer,
    };

    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) =>
          a.questionId === currentQuestion.id ? newAnswer : a
        );
      }
      return [...prev, newAnswer];
    });

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowFeedback(false);
    }
  };

  const handleSubmit = () => {
    if (allQuestionsAnswered) {
      onComplete(score, answers);
    }
  };

  const handleClose = () => {
    // Reset state
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowFeedback(false);
    onClose();
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const commonProps = {
      question: currentQuestion,
      onAnswer: handleAnswer,
      disabled: showFeedback || isSubmitting,
      showFeedback,
      selectedAnswer: currentAnswer?.selectedAnswer,
    };

    if (currentQuestion.type === 'multiple-choice') {
      return <MultipleChoice {...commonProps} />;
    }

    if (currentQuestion.type === 'true-false') {
      return <TrueFalse {...commonProps} />;
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Quiz</Text>
            <Pressable onPress={handleClose} disabled={isSubmitting}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {renderQuestion()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.navigationButtons}>
            <Pressable
              style={[
                styles.navButton,
                currentQuestionIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentQuestionIndex === 0 && styles.navButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </Pressable>

            {!isLastQuestion ? (
              <Pressable
                style={[
                  styles.navButton,
                  styles.nextButton,
                  !currentAnswer && styles.navButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={!currentAnswer || isSubmitting}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    styles.nextButtonText,
                    !currentAnswer && styles.navButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.navButton,
                  styles.submitButton,
                  !allQuestionsAnswered && styles.navButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!allQuestionsAnswered || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.navButtonText,
                      styles.submitButtonText,
                      !allQuestionsAnswered && styles.navButtonTextDisabled,
                    ]}
                  >
                    Submit Quiz
                  </Text>
                )}
              </Pressable>
            )}
          </View>

          {allQuestionsAnswered && (
            <View style={styles.scorePreview}>
              <Text style={styles.scorePreviewText}>
                Current Score: {score} / {totalQuestions}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  closeButton: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  footer: {
    backgroundColor: '#1F2937',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 12,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  navButtonDisabled: {
    backgroundColor: '#1F2937',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#6B7280',
  },
  scorePreview: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  scorePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
  },
});
