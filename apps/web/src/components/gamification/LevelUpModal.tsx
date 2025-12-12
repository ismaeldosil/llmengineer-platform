import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface LevelUpModalProps {
  visible: boolean;
  oldLevel: number;
  newLevel: number;
  levelTitle?: string;
  onContinue: () => void;
}

export function LevelUpModal({
  visible,
  oldLevel,
  newLevel,
  levelTitle,
  onContinue,
}: LevelUpModalProps) {
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const oldLevelOpacity = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);
  const newLevelOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset animations
      overlayOpacity.value = 0;
      scale.value = 0.5;
      oldLevelOpacity.value = 0;
      arrowOpacity.value = 0;
      newLevelOpacity.value = 0;
      titleOpacity.value = 0;
      glowScale.value = 1;
      buttonOpacity.value = 0;

      // Overlay fade in
      overlayOpacity.value = withTiming(1, { duration: 300 });

      // Modal scale
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });

      // Old level appears
      oldLevelOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));

      // Arrow appears
      arrowOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));

      // New level appears with emphasis
      newLevelOpacity.value = withDelay(
        1200,
        withSpring(1, {
          damping: 12,
          stiffness: 150,
        })
      );

      // Glow effect pulse
      glowScale.value = withDelay(
        1200,
        withSequence(
          withTiming(1.2, { duration: 400 }),
          withTiming(1, { duration: 400 }),
          withTiming(1.1, { duration: 400 }),
          withTiming(1, { duration: 400 })
        )
      );

      // Title appears
      titleOpacity.value = withDelay(1600, withTiming(1, { duration: 400 }));

      // Button appears
      buttonOpacity.value = withDelay(2000, withTiming(1, { duration: 400 }));
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const oldLevelStyle = useAnimatedStyle(() => ({
    opacity: oldLevelOpacity.value,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
  }));

  const newLevelStyle = useAnimatedStyle(() => ({
    opacity: newLevelOpacity.value,
    transform: [{ scale: newLevelOpacity.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.6,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.modal, modalStyle]}>
          {/* Header */}
          <Text style={styles.header}>Level Up!</Text>

          {/* Level Transition */}
          <View style={styles.levelTransition}>
            {/* Old Level */}
            <Animated.View style={[styles.levelContainer, oldLevelStyle]}>
              <Text style={styles.levelLabel}>Level</Text>
              <Text style={styles.levelNumber}>{oldLevel}</Text>
            </Animated.View>

            {/* Arrow */}
            <Animated.View style={arrowStyle}>
              <Text style={styles.arrow}>→</Text>
            </Animated.View>

            {/* New Level with Glow */}
            <View style={styles.newLevelWrapper}>
              <Animated.View style={[styles.glow, glowStyle]} />
              <Animated.View
                style={[styles.levelContainer, styles.newLevelContainer, newLevelStyle]}
              >
                <Text style={[styles.levelLabel, styles.newLevelLabel]}>Level</Text>
                <Text style={[styles.levelNumber, styles.newLevelNumber]}>{newLevel}</Text>
              </Animated.View>
            </View>
          </View>

          {/* Level Title */}
          {levelTitle && (
            <Animated.View style={titleStyle}>
              <View style={styles.titleBadge}>
                <Text style={styles.titleBadgeText}>{levelTitle}</Text>
              </View>
            </Animated.View>
          )}

          {/* Continue Button */}
          <Animated.View style={buttonStyle}>
            <Pressable style={styles.button} onPress={onContinue}>
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 48,
  },
  levelTransition: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  levelContainer: {
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#374151',
    minWidth: 100,
  },
  levelLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E5E7EB',
  },
  arrow: {
    fontSize: 36,
    color: '#9CA3AF',
  },
  newLevelWrapper: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FCD34D',
    borderRadius: 24,
    opacity: 0.3,
  },
  newLevelContainer: {
    borderColor: '#FCD34D',
    backgroundColor: '#FEF3C7',
  },
  newLevelLabel: {
    color: '#92400E',
  },
  newLevelNumber: {
    color: '#92400E',
  },
  titleBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  titleBadgeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
