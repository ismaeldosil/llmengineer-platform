import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { useGetLeaderboardQuery } from '@/services/api';

type LeaderboardType = 'global' | 'weekly';

export default function LeaderboardScreen() {
  const [type, setType] = useState<LeaderboardType>('global');
  const { data, isLoading, error, refetch } = useGetLeaderboardQuery({ type, limit: 50 });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return styles.goldRank;
    if (rank === 2) return styles.silverRank;
    if (rank === 3) return styles.bronzeRank;
    return {};
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const renderUserRankFooter = () => {
    if (!data?.userRank || !data?.entries) return null;

    const userInList = data.entries.some((entry) => entry.isCurrentUser);

    if (!userInList && data.userRank > 50) {
      return (
        <View style={styles.footerRankContainer}>
          <View style={styles.footerDivider} />
          <View style={styles.entry}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{data.userRank}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Tu posición</Text>
              <Text style={styles.userLevel}>Sigue mejorando</Text>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ranking' }} />
      <View style={styles.container}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, type === 'global' && styles.activeTab]}
            onPress={() => setType('global')}
          >
            <Text style={[styles.tabText, type === 'global' && styles.activeTabText]}>Global</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, type === 'weekly' && styles.activeTab]}
            onPress={() => setType('weekly')}
          >
            <Text style={[styles.tabText, type === 'weekly' && styles.activeTabText]}>Semanal</Text>
          </Pressable>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Error al cargar ranking</Text>
          </View>
        ) : (
          <FlatList
            data={data?.entries}
            keyExtractor={(item) => `${item.userId}-${item.rank}`}
            renderItem={({ item }) => (
              <View
                testID={`leaderboard-entry-${item.userId}`}
                style={[styles.entry, item.isCurrentUser && styles.currentUserEntry]}
              >
                <View style={[styles.rankBadge, getRankStyle(item.rank)]}>
                  <Text style={styles.rankText}>{getRankEmoji(item.rank)}</Text>
                </View>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.displayName}</Text>
                  <Text style={styles.userLevel}>Nivel {item.level}</Text>
                </View>
                <View style={styles.xpContainer}>
                  <Text style={styles.xpValue}>{item.totalXp.toLocaleString()}</Text>
                  <Text style={styles.xpLabel}>XP</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
                colors={['#3B82F6']}
              />
            }
            ListFooterComponent={renderUserRankFooter}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  userRankBanner: {
    backgroundColor: '#3B82F620',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  currentUserEntry: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F610',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldRank: {
    backgroundColor: '#F59E0B20',
  },
  silverRank: {
    backgroundColor: '#9CA3AF20',
  },
  bronzeRank: {
    backgroundColor: '#B4550020',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  userLevel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  xpLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerRankContainer: {
    marginTop: 16,
    paddingTop: 16,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 16,
  },
});
