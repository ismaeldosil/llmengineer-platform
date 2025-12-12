import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useTokenTetris, TETROMINOS } from './useTokenTetris';
import { TetrisBoard } from './TetrisBoard';
import { TetrisPiece } from './TetrisPiece';

interface TokenTetrisGameProps {
  onGameOver?: (score: number) => void;
}

export const TokenTetrisGame: React.FC<TokenTetrisGameProps> = ({ onGameOver }) => {
  const { gameState, actions } = useTokenTetris();

  // Keyboard controls for web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver || gameState.isPaused) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          actions.moveLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          actions.moveRight();
          break;
        case 'ArrowDown':
          event.preventDefault();
          actions.moveDown();
          break;
        case 'ArrowUp':
        case ' ':
          event.preventDefault();
          actions.rotate();
          break;
        case 'Enter':
          event.preventDefault();
          actions.hardDrop();
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          actions.togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, gameState.isPaused, actions]);

  // Handle game over
  useEffect(() => {
    if (gameState.gameOver && onGameOver) {
      onGameOver(gameState.score);
    }
  }, [gameState.gameOver, gameState.score, onGameOver]);

  const handleStartGame = () => {
    actions.startGame();
  };

  const handleGameOver = () => {
    Alert.alert(
      'Game Over',
      `Final Score: ${gameState.score}\nLines: ${gameState.lines}\nLevel: ${gameState.level}`,
      [
        {
          text: 'Play Again',
          onPress: handleStartGame,
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };

  if (!gameState.currentPiece && !gameState.gameOver) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Token Tetris</Text>
        <Text style={styles.subtitle}>Stack programming tokens to clear lines!</Text>
        <Pressable style={styles.startButton} onPress={handleStartGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </Pressable>
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to Play:</Text>
          <Text style={styles.instructionsText}>• Stack tokens to form complete lines</Text>
          <Text style={styles.instructionsText}>• Clear lines to score points</Text>
          <Text style={styles.instructionsText}>• Earn bonus points for word combinations</Text>
          <Text style={styles.instructionsText}>
            • Use arrow keys (or buttons) to move and rotate
          </Text>
          <Text style={styles.instructionsText}>• Press Enter (or Hard Drop) for instant drop</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.gameContainer}>
        {/* Score Panel */}
        <View style={styles.scorePanel}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{gameState.score}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Level</Text>
            <Text style={styles.scoreValue}>{gameState.level}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Lines</Text>
            <Text style={styles.scoreValue}>{gameState.lines}</Text>
          </View>
        </View>

        {/* Main Game Area */}
        <View style={styles.mainGameArea}>
          {/* Game Board */}
          <View style={styles.boardContainer}>
            <TetrisBoard board={gameState.board} currentPiece={gameState.currentPiece} />
            {gameState.isPaused && (
              <View style={styles.pausedOverlay}>
                <Text style={styles.pausedText}>PAUSED</Text>
              </View>
            )}
            {gameState.gameOver && (
              <View style={styles.gameOverOverlay}>
                <Text style={styles.gameOverText}>GAME OVER</Text>
                <Text style={styles.finalScore}>Score: {gameState.score}</Text>
              </View>
            )}
          </View>

          {/* Next Piece Preview */}
          <View style={styles.sidePanel}>
            <View style={styles.nextPieceContainer}>
              <Text style={styles.nextPieceLabel}>Next</Text>
              {gameState.nextPiece && (
                <View style={styles.nextPiecePreview}>
                  <TetrisPiece
                    shape={gameState.nextPiece.shape}
                    color={gameState.nextPiece.color}
                    token={gameState.nextPiece.token}
                    cellSize={20}
                  />
                </View>
              )}
            </View>

            {/* Control Info */}
            <View style={styles.controlInfo}>
              <Text style={styles.controlInfoTitle}>Controls:</Text>
              <Text style={styles.controlInfoText}>← → Move</Text>
              <Text style={styles.controlInfoText}>↑ / Space Rotate</Text>
              <Text style={styles.controlInfoText}>↓ Soft Drop</Text>
              <Text style={styles.controlInfoText}>Enter Hard Drop</Text>
              <Text style={styles.controlInfoText}>P Pause</Text>
            </View>
          </View>
        </View>

        {/* Touch Controls */}
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Pressable
              style={styles.controlButton}
              onPress={actions.moveLeft}
              disabled={gameState.gameOver || gameState.isPaused}
            >
              <Text style={styles.controlButtonText}>←</Text>
            </Pressable>
            <Pressable
              style={styles.controlButton}
              onPress={actions.rotate}
              disabled={gameState.gameOver || gameState.isPaused}
            >
              <Text style={styles.controlButtonText}>↻</Text>
            </Pressable>
            <Pressable
              style={styles.controlButton}
              onPress={actions.moveRight}
              disabled={gameState.gameOver || gameState.isPaused}
            >
              <Text style={styles.controlButtonText}>→</Text>
            </Pressable>
          </View>
          <View style={styles.controlRow}>
            <Pressable
              style={[styles.controlButton, styles.wideButton]}
              onPress={actions.moveDown}
              disabled={gameState.gameOver || gameState.isPaused}
            >
              <Text style={styles.controlButtonText}>↓ Drop</Text>
            </Pressable>
            <Pressable
              style={[styles.controlButton, styles.wideButton]}
              onPress={actions.hardDrop}
              disabled={gameState.gameOver || gameState.isPaused}
            >
              <Text style={styles.controlButtonText}>Hard Drop</Text>
            </Pressable>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, styles.pauseButton]}
            onPress={actions.togglePause}
            disabled={gameState.gameOver}
          >
            <Text style={styles.actionButtonText}>{gameState.isPaused ? 'Resume' : 'Pause'}</Text>
          </Pressable>
          {gameState.gameOver ? (
            <>
              <Pressable style={styles.actionButton} onPress={handleStartGame}>
                <Text style={styles.actionButtonText}>New Game</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleGameOver}
              >
                <Text style={styles.actionButtonText}>View Score</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.actionButton} onPress={handleStartGame}>
              <Text style={styles.actionButtonText}>Restart</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111827',
  },
  gameContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginBottom: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  scorePanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 600,
    marginBottom: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  mainGameArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  boardContainer: {
    position: 'relative',
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 24,
    color: '#F9FAFB',
  },
  sidePanel: {
    gap: 16,
  },
  nextPieceContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
  },
  nextPieceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  nextPiecePreview: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  controlInfo: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
  },
  controlInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  controlInfoText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  controls: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  wideButton: {
    flex: 1,
  },
  controlButtonText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
