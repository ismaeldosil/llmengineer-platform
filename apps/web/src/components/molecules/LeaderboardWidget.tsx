import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useGetLeaderboardQuery } from '@/services/api';

interface LeaderboardWidgetProps {
  onViewMore?: () => void;
}

export function LeaderboardWidget({ onViewMore }: LeaderboardWidgetProps) {
  const { data, isLoading, error } = useGetLeaderboardQuery({ type: 'global', limit: 3 });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ranking Global</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ranking Global</Text>
        </View>
        <Text style={styles.errorText}>Error al cargar ranking</Text>
      </View>
    );
  }

  const topThree = data?.entries?.slice(0, 3) || [];
  const userRank = data?.userRank;

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking Global</Text>
        {onViewMore && (
          <Pressable onPress={onViewMore}>
            <Text style={styles.viewMoreText}>Ver más</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.topThreeContainer}>
        {topThree.map((entry, index) => (
          <View
            key={entry.userId}
            testID={`leaderboard-entry-${entry.userId}`}
            style={[styles.topEntry, entry.isCurrentUser && styles.currentUserEntry]}
          >
            <Text style={styles.rankEmoji}>{getRankEmoji(entry.rank)}</Text>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarTextSmall}>
                {entry.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.topEntryInfo}>
              <Text style={styles.topEntryName} numberOfLines={1}>
                {entry.displayName}
              </Text>
              <Text style={styles.topEntryXp}>{entry.totalXp.toLocaleString()} XP</Text>
            </View>
          </View>
        ))}
      </View>

      {userRank && userRank > 3 && (
        <View style={styles.userRankContainer}>
          <View style={styles.divider} />
          <View style={styles.userRankBadge}>
            <Text style={styles.userRankText}>Tu posición: #{userRank}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  topThreeContainer: {
    gap: 8,
  },
  topEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
  },
  currentUserEntry: {
    backgroundColor: '#3B82F610',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  rankEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topEntryInfo: {
    flex: 1,
  },
  topEntryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  topEntryXp: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  userRankContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 12,
  },
  userRankBadge: {
    backgroundColor: '#3B82F620',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  userRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
