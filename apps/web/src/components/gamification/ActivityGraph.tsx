/**
 * ActivityGraph - GitHub-style contribution graph for displaying daily XP activity
 *
 * @example
 * ```tsx
 * import { ActivityGraph, DayActivity } from '@/components/gamification';
 *
 * const activityData: DayActivity[] = [
 *   { date: '2024-12-10', xp: 150 },
 *   { date: '2024-12-11', xp: 200 },
 *   { date: '2024-12-12', xp: 50 },
 * ];
 *
 * function MyProfile() {
 *   const handleDayPress = (day: DayActivity) => {
 *     console.log(`Pressed ${day.date}: ${day.xp} XP`);
 *   };
 *
 *   return (
 *     <ActivityGraph
 *       data={activityData}
 *       onDayPress={handleDayPress}
 *     />
 *   );
 * }
 * ```
 */
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useState } from 'react';

export interface DayActivity {
  date: string; // YYYY-MM-DD
  xp: number;
}

export interface ActivityGraphProps {
  data: DayActivity[];
  onDayPress?: (day: DayActivity) => void;
}

interface TooltipData {
  day: DayActivity;
  x: number;
  y: number;
}

// Get color based on XP amount
const getColorForXP = (xp: number): string => {
  if (xp === 0) return '#1F2937'; // gray-800
  if (xp <= 50) return '#14532D'; // green-900
  if (xp <= 100) return '#15803D'; // green-700
  if (xp <= 200) return '#22C55E'; // green-500
  return '#4ADE80'; // green-400
};

// Format date for tooltip
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  return `${month || 'Unknown'} ${date.getDate()}, ${date.getFullYear()}`;
};

// Get week number (0-6, Sunday = 0)
const getDayOfWeek = (dateStr: string): number => {
  return new Date(dateStr).getDay();
};

// Get month labels for the graph
const getMonthLabels = (data: DayActivity[]): Array<{ month: string; index: number }> => {
  const labels: Array<{ month: string; index: number }> = [];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let lastMonth = -1;

  data.forEach((day, index) => {
    const date = new Date(day.date);
    const month = date.getMonth();

    if (month !== lastMonth && index > 0 && months[month]) {
      labels.push({
        month: months[month] as string,
        index: Math.floor(index / 7),
      });
      lastMonth = month;
    }
  });

  return labels;
};

// Generate last 90 days of data
const generateLast90Days = (data: DayActivity[]): DayActivity[] => {
  const days: DayActivity[] = [];
  const dataMap = new Map(data.map((d) => [d.date, d.xp]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from 89 days ago to include today (90 days total)
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    if (dateStr) {
      days.push({
        date: dateStr,
        xp: dataMap.get(dateStr) || 0,
      });
    }
  }

  return days;
};

// Organize days into a grid structure (weeks x days)
const organizeDaysIntoGrid = (days: DayActivity[]): DayActivity[][] => {
  if (days.length === 0) return [];

  // Pad the beginning with empty days to align with day of week
  const firstDay = days[0];
  if (!firstDay) return [];

  const firstDayOfWeek = getDayOfWeek(firstDay.date);
  const paddedDays: (DayActivity | null)[] = [...Array(firstDayOfWeek).fill(null), ...days];

  // Organize into columns (weeks)
  const columns: DayActivity[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    const week = paddedDays.slice(i, i + 7).filter((d): d is DayActivity => d !== null);
    if (week.length > 0) {
      columns.push(week);
    }
  }

  return columns;
};

export function ActivityGraph({ data, onDayPress }: ActivityGraphProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Generate last 90 days with provided data
  const last90Days = generateLast90Days(data);
  const columns = organizeDaysIntoGrid(last90Days);
  const monthLabels = getMonthLabels(last90Days);

  const handleDayPress = (day: DayActivity) => {
    // For mobile, show tooltip at fixed position
    setTooltip({
      day,
      x: 0,
      y: 0,
    });

    onDayPress?.(day);
  };

  const handlePressOut = () => {
    setTooltip(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity Graph</Text>
        <Text style={styles.subtitle}>Daily XP earned in the last 90 days</Text>
      </View>

      {/* Month labels */}
      <View style={styles.monthLabelsContainer}>
        {monthLabels.map((label, index) => (
          <View
            key={index}
            style={[styles.monthLabel, { left: label.index * (SQUARE_SIZE + SQUARE_GAP) + 40 }]}
          >
            <Text style={styles.monthLabelText}>{label.month}</Text>
          </View>
        ))}
      </View>

      {/* Graph container with scrolling */}
      <View style={styles.graphWrapper}>
        {/* Day labels (Sun-Sat) */}
        <View style={styles.dayLabels}>
          <Text style={styles.dayLabelText}>Sun</Text>
          <Text style={styles.dayLabelText}>Mon</Text>
          <Text style={styles.dayLabelText}>Tue</Text>
          <Text style={styles.dayLabelText}>Wed</Text>
          <Text style={styles.dayLabelText}>Thu</Text>
          <Text style={styles.dayLabelText}>Fri</Text>
          <Text style={styles.dayLabelText}>Sat</Text>
        </View>

        {/* Grid */}
        <View style={styles.graphContainer}>
          {columns.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.column}>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = week.find((d) => getDayOfWeek(d.date) === dayIndex);

                if (!day) {
                  return <View key={dayIndex} style={styles.emptySquare} />;
                }

                return (
                  <Pressable
                    key={dayIndex}
                    style={[styles.square, { backgroundColor: getColorForXP(day.xp) }]}
                    onPress={() => handleDayPress(day)}
                    onPressOut={handlePressOut}
                  >
                    {/* Invisible touchable area */}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={styles.legendSquares}>
          <View style={[styles.legendSquare, { backgroundColor: '#1F2937' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#14532D' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#15803D' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#22C55E' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#4ADE80' }]} />
        </View>
        <Text style={styles.legendLabel}>More</Text>
      </View>

      {/* Tooltip */}
      {tooltip && (
        <View
          style={[
            styles.tooltip,
            {
              position: 'absolute',
              top: 20,
              alignSelf: 'center',
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.tooltipDate}>{formatDate(tooltip.day.date)}</Text>
          <Text style={styles.tooltipXP}>
            {tooltip.day.xp === 0 ? 'No XP earned' : `${tooltip.day.xp.toLocaleString()} XP`}
          </Text>
        </View>
      )}
    </View>
  );
}

const SQUARE_SIZE = 12;
const SQUARE_GAP = 3;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  monthLabelsContainer: {
    height: 20,
    marginBottom: 4,
    marginLeft: 40,
    position: 'relative',
  },
  monthLabel: {
    position: 'absolute',
    top: 0,
  },
  monthLabelText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  graphWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayLabels: {
    width: 30,
    marginRight: 10,
    justifyContent: 'space-around',
  },
  dayLabelText: {
    fontSize: 10,
    color: '#9CA3AF',
    height: SQUARE_SIZE,
    lineHeight: SQUARE_SIZE,
  },
  graphContainer: {
    flexDirection: 'row',
    gap: SQUARE_GAP,
    flex: 1,
    overflow: 'scroll',
  },
  column: {
    gap: SQUARE_GAP,
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptySquare: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  legendSquares: {
    flexDirection: 'row',
    gap: SQUARE_GAP,
  },
  legendSquare: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tooltip: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    minWidth: 150,
    zIndex: 1000,
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
  tooltipDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  tooltipXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22C55E',
  },
});
