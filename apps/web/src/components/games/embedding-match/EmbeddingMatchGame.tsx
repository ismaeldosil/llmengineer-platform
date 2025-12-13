import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { GameBoard } from './GameBoard';
import { GameHeader, DifficultyLevel } from './GameHeader';
import { GameResult } from './GameResult';
import { useEmbeddingMatch } from './useEmbeddingMatch';
import { router } from 'expo-router';
import { useSubmitGameScoreMutation } from '@/services/api';

interface EmbeddingMatchGameProps {
  onGameOver?: (score: number) => void;
}

export const EmbeddingMatchGame: React.FC<EmbeddingMatchGameProps> = ({
  onGameOver: _onGameOver,
}) => {
  const { gameState, actions } = useEmbeddingMatch();
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [submitScore, { isLoading: isSubmittingScore }] = useSubmitGameScoreMutation();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    isHighScore: boolean;
    xpEarned: number;
  } | null>(null);

  // Submit score when game is over
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0 && !scoreSubmitted) {
      handleSubmitScore();
    }
  }, [gameState.isGameOver, gameState.score, scoreSubmitted]);

  const handleSubmitScore = async () => {
    if (scoreSubmitted) return;

    try {
      const levelMap = { easy: 1, medium: 2, hard: 3 };
      const result = await submitScore({
        gameType: 'embedding-match',
        score: gameState.score,
        metadata: {
          level: levelMap[gameState.level],
          accuracy:
            gameState.attempts > 0 ? (gameState.matchedPairs / gameState.attempts) * 100 : 100,
          time:
            gameState.level === 'easy'
              ? 180 - gameState.timeRemaining
              : gameState.level === 'medium'
                ? 150 - gameState.timeRemaining
                : 120 - gameState.timeRemaining,
        },
      }).unwrap();

      setScoreSubmitted(true);
      setSubmissionResult({
        isHighScore: result.isHighScore,
        xpEarned: result.xpEarned,
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const handleLevelSelect = (level: DifficultyLevel) => {
    actions.startGame(level);
    setShowLevelSelect(false);
    setScoreSubmitted(false);
    setSubmissionResult(null);
  };

  const handlePlayAgain = () => {
    actions.startGame(gameState.level);
    setScoreSubmitted(false);
    setSubmissionResult(null);
  };

  const handleChangeLevel = () => {
    actions.resetGame();
    setShowLevelSelect(true);
    setScoreSubmitted(false);
    setSubmissionResult(null);
  };

  const handleGoHome = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push('/games' as any);
  };

  // Calculate accuracy
  const accuracy =
    gameState.attempts > 0 ? (gameState.matchedPairs / gameState.attempts) * 100 : 100;

  const timeElapsed =
    gameState.level === 'easy'
      ? 180 - gameState.timeRemaining
      : gameState.level === 'medium'
        ? 150 - gameState.timeRemaining
        : 120 - gameState.timeRemaining;

  // Level Selection Screen
  if (showLevelSelect) {
    return (
      <View style={styles.levelSelectContainer}>
        <View style={styles.levelSelectContent}>
          <Text style={styles.title}>Embedding Match</Text>
          <Text style={styles.subtitle}>Match LLM concepts with their related terms</Text>

          <View style={styles.levelCards}>
            <Pressable style={styles.levelCard} onPress={() => handleLevelSelect('easy')}>
              <Text style={styles.levelEmoji}>🟢</Text>
              <Text style={styles.levelName}>Easy</Text>
              <Text style={styles.levelDescription}>3 minutes • Basic concepts</Text>
              <View style={styles.levelStats}>
                <Text style={styles.levelStat}>8 pairs</Text>
                <Text style={styles.levelStat}>1x score</Text>
              </View>
            </Pressable>

            <Pressable style={styles.levelCard} onPress={() => handleLevelSelect('medium')}>
              <Text style={styles.levelEmoji}>🟡</Text>
              <Text style={styles.levelName}>Medium</Text>
              <Text style={styles.levelDescription}>2.5 minutes • Intermediate</Text>
              <View style={styles.levelStats}>
                <Text style={styles.levelStat}>8 pairs</Text>
                <Text style={styles.levelStat}>1.5x score</Text>
              </View>
            </Pressable>

            <Pressable style={styles.levelCard} onPress={() => handleLevelSelect('hard')}>
              <Text style={styles.levelEmoji}>🔴</Text>
              <Text style={styles.levelName}>Hard</Text>
              <Text style={styles.levelDescription}>2 minutes • Advanced</Text>
              <View style={styles.levelStats}>
                <Text style={styles.levelStat}>8 pairs</Text>
                <Text style={styles.levelStat}>2x score</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to Play:</Text>
            <Text style={styles.instructionsText}>
              • Tap cards to flip them and reveal concepts
            </Text>
            <Text style={styles.instructionsText}>• Find pairs that are semantically similar</Text>
            <Text style={styles.instructionsText}>• Match all pairs before time runs out</Text>
            <Text style={styles.instructionsText}>• Score higher with faster matches</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.gameContainer}>
        {/* Game Header */}
        <GameHeader
          score={gameState.score}
          timeRemaining={gameState.timeRemaining}
          level={gameState.level}
          matchedPairs={gameState.matchedPairs}
          totalPairs={8}
          isPaused={gameState.isPaused}
          onPauseToggle={actions.togglePause}
        />

        {/* Game Board */}
        <GameBoard
          cards={gameState.cards}
          onCardPress={actions.handleCardPress}
          disabled={gameState.isPaused}
        />

        {/* Paused Overlay */}
        {gameState.isPaused && (
          <View style={styles.pausedOverlay}>
            <Text style={styles.pausedText}>Game Paused</Text>
            <Text style={styles.pausedSubtext}>Tap the pause button to resume</Text>
          </View>
        )}

        {/* Game Result Modal */}
        {gameState.isGameOver && (
          <GameResult
            score={gameState.score}
            timeElapsed={timeElapsed}
            matchedPairs={gameState.matchedPairs}
            totalPairs={8}
            level={gameState.level}
            accuracy={accuracy}
            isVictory={gameState.isVictory}
            onPlayAgain={handlePlayAgain}
            onChangeLevel={handleChangeLevel}
            onGoHome={handleGoHome}
            isSubmittingScore={isSubmittingScore}
            submissionResult={submissionResult}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
  },
  levelSelectContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  levelSelectContent: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
    textAlign: 'center',
  },
  levelCards: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  levelCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  levelStats: {
    flexDirection: 'row',
    gap: 16,
  },
  levelStat: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  instructions: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#334155',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
    lineHeight: 20,
  },
  pausedOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  pausedText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  pausedSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
