import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trophy, Zap } from 'lucide-react-native';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xp: number;
  level: number;
  rank: number;
  avatar?: string;
}

export interface LeaderboardWidgetProps {
  topUsers: LeaderboardEntry[]; // Top 3
  currentUser?: LeaderboardEntry;
  onViewAll?: () => void;
}

export function LeaderboardWidget({ topUsers, currentUser, onViewAll }: LeaderboardWidgetProps) {
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const topThree = topUsers.slice(0, 3);
  const showCurrentUser = currentUser && currentUser.rank > 3;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Trophy size={20} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.title}>Ranking</Text>
        </View>
        {onViewAll && (
          <Pressable onPress={onViewAll} testID="view-all-button">
            <Text style={styles.viewAllText}>Ver Ranking Completo</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.topThreeContainer}>
        {topThree.map((entry) => (
          <View
            key={entry.userId}
            testID={`leaderboard-entry-${entry.userId}`}
            style={styles.topEntry}
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
              <View style={styles.statsRow}>
                <View style={styles.xpContainer}>
                  <Zap size={12} color="#10B981" fill="#10B981" />
                  <Text style={styles.topEntryXp}>{entry.xp.toLocaleString()} XP</Text>
                </View>
                <Text style={styles.levelText}>Nivel {entry.level}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {showCurrentUser && (
        <View style={styles.userRankContainer}>
          <View style={styles.divider} />
          <View style={styles.currentUserEntry}>
            <Text style={styles.rankEmoji}>{getRankEmoji(currentUser.rank)}</Text>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarTextSmall}>
                {currentUser.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.topEntryInfo}>
              <Text style={styles.topEntryName} numberOfLines={1}>
                {currentUser.displayName} (Tú)
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.xpContainer}>
                  <Zap size={12} color="#10B981" fill="#10B981" />
                  <Text style={styles.topEntryXp}>{currentUser.xp.toLocaleString()} XP</Text>
                </View>
                <Text style={styles.levelText}>Nivel {currentUser.level}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  topThreeContainer: {
    gap: 8,
  },
  topEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
  },
  currentUserEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F615',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  rankEmoji: {
    fontSize: 20,
    marginRight: 8,
    minWidth: 24,
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
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topEntryXp: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  levelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userRankContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
});
