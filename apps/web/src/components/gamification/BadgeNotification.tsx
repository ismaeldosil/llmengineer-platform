import { View, Text, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

export interface BadgeEarned {
  id: string;
  name: string;
  icon: string;
  xpBonus: number;
}

interface BadgeNotificationProps {
  badge: BadgeEarned | null;
  onDismiss: () => void;
}

export function BadgeNotification({ badge, onDismiss }: BadgeNotificationProps) {
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);

      // Slide in from top
      translateY.value = withSpring(-200, { damping: 20, stiffness: 100 });
      opacity.value = withTiming(0);

      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-dismiss after 4 seconds
      const dismissTimeout = setTimeout(() => {
        // Slide out
        translateY.value = withSpring(-200, {
          damping: 15,
          stiffness: 150,
        });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setIsVisible)(false);
          runOnJS(onDismiss)();
        });
      }, 4000);

      return () => {
        clearTimeout(dismissTimeout);
      };
    } else {
      setIsVisible(false);
      return undefined;
    }
  }, [badge]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isVisible || !badge) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.notification, animatedStyle]}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{badge.icon}</Text>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Badge Earned!</Text>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.xpBonus}>+{badge.xpBonus} XP</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar} />
      </Animated.View>
    </View>
  );
}

// Queue Manager Component
interface QueuedBadge extends BadgeEarned {
  timestamp: number;
}

interface BadgeNotificationQueueProps {
  badges: BadgeEarned[];
  onComplete?: () => void;
}

export function BadgeNotificationQueue({ badges, onComplete }: BadgeNotificationQueueProps) {
  const [queue, setQueue] = useState<QueuedBadge[]>([]);
  const [currentBadge, setCurrentBadge] = useState<BadgeEarned | null>(null);

  useEffect(() => {
    // Add new badges to queue
    const newBadges = badges.map((badge) => ({
      ...badge,
      timestamp: Date.now(),
    }));
    setQueue((prev) => [...prev, ...newBadges]);
  }, [badges]);

  useEffect(() => {
    // Show next badge from queue if none is currently showing
    if (!currentBadge && queue.length > 0) {
      const [nextBadge, ...remainingQueue] = queue;
      if (nextBadge) {
        setCurrentBadge(nextBadge);
        setQueue(remainingQueue);
      }
    }
  }, [currentBadge, queue]);

  const handleDismiss = () => {
    setCurrentBadge(null);

    // If queue is empty and we just dismissed the last badge, call onComplete
    if (queue.length === 0 && onComplete) {
      onComplete();
    }
  };

  return <BadgeNotification badge={currentBadge} onDismiss={handleDismiss} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  notification: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FCD34D',
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  xpBonus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#FCD34D',
  },
});
