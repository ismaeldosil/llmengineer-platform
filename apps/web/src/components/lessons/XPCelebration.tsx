import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface XPCelebrationProps {
  visible: boolean;
  xpEarned: number;
  bonusXP?: number;
  bonusReason?: string;
  newLevel?: number;
  onContinue: () => void;
}

export function XPCelebration({
  visible,
  xpEarned,
  bonusXP = 0,
  bonusReason,
  newLevel,
  onContinue,
}: XPCelebrationProps) {
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const xpProgress = useSharedValue(0);
  const bonusOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset animations
      overlayOpacity.value = 0;
      scale.value = 0.5;
      xpProgress.value = 0;
      bonusOpacity.value = 0;
      buttonOpacity.value = 0;

      // Animate overlay
      overlayOpacity.value = withTiming(1, { duration: 300 });

      // Animate modal scale
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });

      // Animate XP counter
      xpProgress.value = withDelay(
        400,
        withTiming(1, {
          duration: 1500,
          easing: Easing.out(Easing.cubic),
        })
      );

      // Animate bonus (if any)
      if (bonusXP > 0) {
        bonusOpacity.value = withDelay(1900, withTiming(1, { duration: 400 }));
      }

      // Animate button
      buttonOpacity.value = withDelay(bonusXP > 0 ? 2300 : 1900, withTiming(1, { duration: 400 }));
    }
  }, [visible, bonusXP]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const xpAnimatedStyle = useAnimatedStyle(() => {
    return {
      // This is just for the animation trigger
      opacity: 1,
    };
  });

  const bonusStyle = useAnimatedStyle(() => ({
    opacity: bonusOpacity.value,
    transform: [{ translateY: (1 - bonusOpacity.value) * 20 }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // Calculate current XP display value
  const displayXP = Math.floor(xpProgress.value * xpEarned);
  const totalXP = xpEarned + bonusXP;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.modal, modalStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>Lesson Complete!</Text>
          </View>

          {/* XP Display */}
          <View style={styles.xpContainer}>
            <Text style={styles.xpLabel}>XP Earned</Text>
            <Animated.View style={xpAnimatedStyle}>
              <Text style={styles.xpValue}>+{displayXP}</Text>
            </Animated.View>
          </View>

          {/* Bonus XP */}
          {bonusXP > 0 && (
            <Animated.View style={[styles.bonusContainer, bonusStyle]}>
              <View style={styles.bonusRow}>
                <Text style={styles.bonusLabel}>{bonusReason || 'Bonus'}</Text>
                <Text style={styles.bonusValue}>+{bonusXP} XP</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total XP</Text>
                <Text style={styles.totalValue}>+{totalXP}</Text>
              </View>
            </Animated.View>
          )}

          {/* New Level Badge */}
          {newLevel && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeEmoji}>⭐</Text>
              <Text style={styles.levelBadgeText}>Level {newLevel} Reached!</Text>
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  xpContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  xpLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  xpValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  bonusContainer: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bonusLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bonusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  levelBadgeEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  levelBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
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
