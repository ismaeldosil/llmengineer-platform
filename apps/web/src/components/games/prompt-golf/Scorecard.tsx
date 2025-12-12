import { View, Text, StyleSheet, ScrollView } from 'react-native';

export interface HoleScore {
  holeId: string;
  holeName: string;
  par: number;
  tokens: number;
  score: 'eagle' | 'birdie' | 'par' | 'bogey' | 'double-bogey' | null;
}

interface ScorecardProps {
  scores: HoleScore[];
}

const getScoreColor = (score: string | null) => {
  switch (score) {
    case 'eagle':
      return '#F59E0B';
    case 'birdie':
      return '#10B981';
    case 'par':
      return '#3B82F6';
    case 'bogey':
      return '#F59E0B';
    case 'double-bogey':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getScoreLabel = (score: string | null) => {
  if (!score) return '-';
  return score
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getScoreSymbol = (tokens: number, par: number) => {
  const diff = tokens - par;
  if (diff === 0) return 'E';
  if (diff < 0) return diff.toString();
  return '+' + diff;
};

export function Scorecard({ scores }: ScorecardProps) {
  const completedHoles = scores.filter((s) => s.score !== null).length;
  const totalPar = scores.reduce((sum, s) => sum + s.par, 0);
  const totalTokens = scores.reduce((sum, s) => sum + (s.tokens || 0), 0);
  const totalDiff = totalTokens - totalPar;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scorecard</Text>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Holes</Text>
          <Text style={styles.summaryValue}>
            {completedHoles}/{scores.length}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Par</Text>
          <Text style={styles.summaryValue}>{totalPar}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Tokens</Text>
          <Text style={styles.summaryValue}>{totalTokens}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Score</Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color:
                  totalDiff < 0
                    ? '#10B981'
                    : totalDiff === 0
                      ? '#3B82F6'
                      : totalDiff > 0
                        ? '#EF4444'
                        : '#F9FAFB',
              },
            ]}
          >
            {totalDiff === 0 ? 'E' : totalDiff < 0 ? totalDiff : '+' + totalDiff}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.holeColumn]}>Hole</Text>
            <Text style={[styles.tableHeaderText, styles.parColumn]}>Par</Text>
            <Text style={[styles.tableHeaderText, styles.tokensColumn]}>Tokens</Text>
            <Text style={[styles.tableHeaderText, styles.scoreColumn]}>Score</Text>
            <Text style={[styles.tableHeaderText, styles.diffColumn]}>+/-</Text>
          </View>

          {scores.map((hole) => (
            <View key={hole.holeId} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.holeColumn]}>{hole.holeName}</Text>
              <Text style={[styles.tableCell, styles.parColumn]}>{hole.par}</Text>
              <Text style={[styles.tableCell, styles.tokensColumn]}>{hole.tokens || '-'}</Text>
              <Text
                style={[styles.tableCell, styles.scoreColumn, { color: getScoreColor(hole.score) }]}
              >
                {getScoreLabel(hole.score)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.diffColumn,
                  {
                    color:
                      hole.tokens && hole.tokens < hole.par
                        ? '#10B981'
                        : hole.tokens === hole.par
                          ? '#3B82F6'
                          : hole.tokens && hole.tokens > hole.par
                            ? '#EF4444'
                            : '#6B7280',
                  },
                ]}
              >
                {hole.tokens ? getScoreSymbol(hole.tokens, hole.par) : '-'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  scrollView: {
    maxHeight: 300,
  },
  table: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tableCell: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  holeColumn: {
    flex: 2,
  },
  parColumn: {
    flex: 1,
    textAlign: 'center',
  },
  tokensColumn: {
    flex: 1,
    textAlign: 'center',
  },
  scoreColumn: {
    flex: 2,
    textAlign: 'center',
  },
  diffColumn: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
});
