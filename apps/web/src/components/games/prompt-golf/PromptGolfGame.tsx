import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { HoleSelector, PromptGolfHole } from './HoleSelector';
import { PromptInput } from './PromptInput';
import { Scorecard, HoleScore } from './Scorecard';
import { useGetPromptGolfHolesQuery, useSubmitPromptGolfAttemptMutation } from '@/services/api';

interface AttemptResult {
  holeId: string;
  prompt: string;
  tokenCount: number;
  llmOutput: string;
  matchesTarget: boolean;
  score: 'eagle' | 'birdie' | 'par' | 'bogey' | 'double-bogey';
  par: number;
}

export function PromptGolfGame() {
  const { data: holes, isLoading, error } = useGetPromptGolfHolesQuery();
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitPromptGolfAttemptMutation();

  const [selectedHoleId, setSelectedHoleId] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [scores, setScores] = useState<Record<string, HoleScore>>({});

  useEffect(() => {
    if (holes && holes.length > 0 && !selectedHoleId) {
      setSelectedHoleId(holes[0].id);
    }
  }, [holes, selectedHoleId]);

  const selectedHole = holes?.find((h: PromptGolfHole) => h.id === selectedHoleId);

  const handleSelectHole = (holeId: string) => {
    setSelectedHoleId(holeId);
    setPrompt('');
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || !selectedHoleId) return;

    try {
      const response = await submitAttempt({
        holeId: selectedHoleId,
        prompt: prompt.trim(),
      }).unwrap();

      setResult(response);

      // Update scores
      if (response.matchesTarget && selectedHole) {
        setScores((prev) => ({
          ...prev,
          [selectedHoleId]: {
            holeId: selectedHoleId,
            holeName: selectedHole.name,
            par: response.par,
            tokens: response.tokenCount,
            score: response.score,
          },
        }));
      }
    } catch (err) {
      console.error('Error submitting attempt:', err);
    }
  };

  const handleTryAgain = () => {
    setPrompt('');
    setResult(null);
  };

  const handleNextHole = () => {
    if (!holes) return;
    const currentIndex = holes.findIndex((h: PromptGolfHole) => h.id === selectedHoleId);
    if (currentIndex < holes.length - 1) {
      setSelectedHoleId(holes[currentIndex + 1].id);
      setPrompt('');
      setResult(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading holes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading holes. Please try again.</Text>
      </View>
    );
  }

  if (!holes || holes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No holes available.</Text>
      </View>
    );
  }

  const completedHoles = new Set(Object.keys(scores));
  const scorecardData: HoleScore[] = holes.map((hole: PromptGolfHole) => {
    const score = scores[hole.id];
    return {
      holeId: hole.id,
      holeName: hole.name,
      par: hole.par,
      tokens: score?.tokens || 0,
      score: score?.score || null,
    };
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Prompt Golf</Text>
        <Text style={styles.subtitle}>
          Craft the shortest prompt that achieves the target output
        </Text>

        <HoleSelector
          holes={holes}
          selectedHoleId={selectedHoleId}
          onSelectHole={handleSelectHole}
          completedHoles={completedHoles}
        />

        {selectedHole && (
          <View style={styles.holeContent}>
            <View style={styles.objectiveCard}>
              <Text style={styles.objectiveTitle}>Objective</Text>
              <Text style={styles.objectiveDescription}>{selectedHole.description}</Text>
              <View style={styles.targetContainer}>
                <Text style={styles.targetLabel}>Target Output:</Text>
                <View style={styles.targetBox}>
                  <Text style={styles.targetText}>{selectedHole.targetOutput}</Text>
                </View>
              </View>
              <View style={styles.parContainer}>
                <Text style={styles.parLabel}>Par: </Text>
                <Text style={styles.parValue}>{selectedHole.par} tokens</Text>
              </View>
            </View>

            <PromptInput value={prompt} onChange={setPrompt} disabled={isSubmitting || !!result} />

            {!result && (
              <Pressable
                style={[
                  styles.submitButton,
                  (!prompt.trim() || isSubmitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!prompt.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </Pressable>
            )}

            {result && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Result</Text>

                <View style={styles.outputContainer}>
                  <Text style={styles.outputLabel}>LLM Output:</Text>
                  <View style={styles.outputBox}>
                    <Text style={styles.outputText}>{result.llmOutput}</Text>
                  </View>
                </View>

                {result.matchesTarget ? (
                  <View style={styles.successFeedback}>
                    <Text style={styles.successIcon}>✓</Text>
                    <View style={styles.successContent}>
                      <Text style={styles.successText}>Success!</Text>
                      <Text style={styles.scoreText}>
                        Score: <Text style={styles.scoreBold}>{result.score.toUpperCase()}</Text>
                      </Text>
                      <Text style={styles.tokensText}>
                        {result.tokenCount} tokens (Par {result.par})
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.failureFeedback}>
                    <Text style={styles.failureIcon}>✗</Text>
                    <View style={styles.failureContent}>
                      <Text style={styles.failureText}>Output doesn't match target</Text>
                      <Text style={styles.tryAgainText}>Try modifying your prompt</Text>
                    </View>
                  </View>
                )}

                <View style={styles.resultActions}>
                  <Pressable style={styles.tryAgainButton} onPress={handleTryAgain}>
                    <Text style={styles.tryAgainButtonText}>Try Again</Text>
                  </Pressable>
                  {result.matchesTarget && (
                    <Pressable style={styles.nextButton} onPress={handleNextHole}>
                      <Text style={styles.nextButtonText}>Next Hole</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {Object.keys(scores).length > 0 && <Scorecard scores={scorecardData} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  holeContent: {
    marginTop: 24,
  },
  objectiveCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  objectiveTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  objectiveDescription: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 16,
    lineHeight: 24,
  },
  targetContainer: {
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  targetBox: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  targetText: {
    fontSize: 14,
    color: '#F9FAFB',
    fontFamily: 'monospace',
  },
  parContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  parValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  outputContainer: {
    marginBottom: 20,
  },
  outputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  outputBox: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  outputText: {
    fontSize: 14,
    color: '#F9FAFB',
    fontFamily: 'monospace',
  },
  successFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98110',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 32,
    color: '#10B981',
    marginRight: 12,
  },
  successContent: {
    flex: 1,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 2,
  },
  scoreBold: {
    fontWeight: '600',
    color: '#10B981',
  },
  tokensText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  failureFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444410',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
    marginBottom: 20,
  },
  failureIcon: {
    fontSize: 32,
    color: '#EF4444',
    marginRight: 12,
  },
  failureContent: {
    flex: 1,
  },
  failureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  tryAgainText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tryAgainButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tryAgainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
