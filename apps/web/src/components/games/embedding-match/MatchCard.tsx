import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';

export interface MatchCardProps {
  id: string;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  id,
  text,
  isFlipped,
  isMatched,
  onPress,
  disabled = false,
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, flipAnim]);

  const handlePressIn = () => {
    if (disabled || isFlipped) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || isFlipped) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  const getCardStyle = () => {
    if (isMatched) return styles.cardMatched;
    if (isFlipped) return styles.cardFlipped;
    return styles.card;
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isFlipped || isMatched}
        style={({ pressed }) => [
          styles.cardWrapper,
          (pressed && !isFlipped && !isMatched) && styles.cardPressed,
        ]}
      >
        <View style={[styles.cardInner, getCardStyle()]}>
          {/* Front of card (face down) */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              {
                transform: [{ rotateY: frontRotation }],
                opacity: frontOpacity,
              },
            ]}
          >
            <View style={styles.cardPattern}>
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
            </View>
            <Text style={styles.cardLogo}>LLM</Text>
          </Animated.View>

          {/* Back of card (face up) */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              {
                transform: [{ rotateY: backRotation }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text
              style={[
                styles.cardText,
                isMatched && styles.cardTextMatched,
              ]}
              numberOfLines={3}
            >
              {text}
            </Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 0.7,
    minWidth: 0,
  },
  cardWrapper: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardInner: {
    flex: 1,
    borderRadius: 12,
    position: 'relative',
  },
  card: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
  },
  cardFlipped: {
    backgroundColor: '#1e3a8a',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  cardMatched: {
    backgroundColor: '#065f46',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#1e293b',
  },
  cardBack: {
    backgroundColor: 'transparent',
  },
  cardPattern: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    width: 24,
  },
  patternDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  cardLogo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  cardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardTextMatched: {
    color: '#d1fae5',
  },
});
