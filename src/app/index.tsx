import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Colors, Spacing } from '@/constants/theme';
import {
  loadRuns,
  addRun,
  calculateMetrics,
  formatPace,
  formatDelta,
  Run,
  Metrics,
} from '../utils/storage';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];

  const [runs, setRuns] = useState<Run[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    latest_pace: null,
    best_pace: null,
    latest_delta: null,
  });
  const [loading, setLoading] = useState(true);

  // Form states
  const [date, setDate] = useState('');
  const [distance, setDistance] = useState('3.2');
  const [time, setTime] = useState('18.0');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Set today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await loadRuns();
      setRuns(data);
      setMetrics(calculateMetrics(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRun = async () => {
    setErrorMsg(null);
    const distNum = parseFloat(distance);
    const timeNum = parseFloat(time);

    // Form Validation
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setErrorMsg('Date must be in YYYY-MM-DD format.');
      return;
    }
    if (isNaN(distNum) || distNum <= 0) {
      setErrorMsg('Distance must be a positive number.');
      return;
    }
    if (isNaN(timeNum) || timeNum <= 0) {
      setErrorMsg('Time must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await addRun(date, distNum, timeNum);
      setRuns(updated);
      setMetrics(calculateMetrics(updated));
      
      // Reset form fields to defaults
      setDistance('3.2');
      setTime('18.0');
    } catch (e: any) {
      setErrorMsg(e.message || 'Error saving run.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  // Prepare chart data
  const chartWidth = Dimensions.get('window').width - Spacing.four * 2;
  const showChart = runs.length > 0;
  
  const chartData = {
    labels: runs.map((r) => {
      // Format YYYY-MM-DD -> MM/DD
      const parts = r.date.split('-');
      return parts.length === 3 ? `${parts[1]}/${parts[2]}` : r.date;
    }),
    datasets: [
      {
        data: runs.map((r) => r.pace_km),
        color: (opacity = 1) => `rgba(2, 132, 199, ${opacity})`, // Pace (Sky Blue)
        strokeWidth: 3,
      },
      {
        data: runs.map(() => 5.61),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Target (Red)
        strokeWidth: 2,
        withDots: false,
      },
    ],
    legend: ['Pace (min/km)', 'Target (5:37/km)'],
  };

  const isFastPace = metrics.latest_delta !== null && metrics.latest_delta <= 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.appTitle, { color: colors.text }]}>🏃 PaceBreaker</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Goal: 3.2km in &lt; 18 min (5:37/km Target Pace)
            </Text>
          </View>

          {/* 1. Data Entry Form */}
          <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>📝 Log a Run</Text>
            
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2026-07-01"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Distance (km)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="numeric"
                  placeholder="3.2"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Time (minutes)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={time}
                  onChangeText={setTime}
                  keyboardType="numeric"
                  placeholder="18.0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleAddRun}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Run</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 2. Scoreboard Section */}
          <View style={styles.scoreboardRow}>
            {/* Metric 1 */}
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Latest Pace</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatPace(metrics.latest_pace)}
              </Text>
              {metrics.latest_pace !== null && (
                <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                  {metrics.latest_pace.toFixed(2)} min/km
                </Text>
              )}
            </View>

            {/* Metric 2 */}
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Personal Best</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatPace(metrics.best_pace)}
              </Text>
              {metrics.best_pace !== null && (
                <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                  {metrics.best_pace.toFixed(2)} min/km
                </Text>
              )}
            </View>

            {/* Metric 3 */}
            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.backgroundElement },
                metrics.latest_delta !== null && {
                  borderLeftWidth: 4,
                  borderLeftColor: isFastPace ? '#10b981' : '#ef4444',
                },
              ]}
            >
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Delta to Goal</Text>
              <Text style={[styles.metricValue, { color: isFastPace ? '#10b981' : '#ef4444' }]}>
                {formatDelta(metrics.latest_delta)}
              </Text>
              {metrics.latest_delta !== null && (
                <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                  {metrics.latest_delta > 0 ? '+' : ''}
                  {metrics.latest_delta.toFixed(2)} min/km
                </Text>
              )}
            </View>
          </View>

          {/* 3. Visual Chart */}
          <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: Spacing.three }]}>
              📈 Pace Trend
            </Text>
            {showChart ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={chartData}
                  width={Math.max(chartWidth, runs.length * 70)} // Scroll horizontally if many runs
                  height={240}
                  withDots={Platform.OS !== 'web'}
                  chartConfig={{
                    backgroundColor: colors.backgroundElement,
                    backgroundGradientFrom: colors.backgroundElement,
                    backgroundGradientTo: colors.backgroundElement,
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(2, 132, 199, ${opacity})`,
                    labelColor: (opacity = 1) => colors.textSecondary,
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#0284c7',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            ) : (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: Spacing.four }}>
                Log runs to display progress chart.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.one,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: Spacing.two,
    fontWeight: '500',
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  formCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreboardRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 100,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 10,
    marginTop: Spacing.half,
    textAlign: 'center',
  },
  chart: {
    marginVertical: Spacing.one,
    borderRadius: 12,
  },
});
