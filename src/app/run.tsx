import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useVoiceCoach } from '@/hooks/useVoiceCoach';

export default function RunScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];

  const { isTracking, distanceKm, elapsedTimeSec, currentPace, startRun, stopRun } = useLocationTracker();
  
  // Initialize Voice Coach
  useVoiceCoach(isTracking, distanceKm, elapsedTimeSec, currentPace);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number) => {
    if (pace === 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Target pace is 5:56 (5.9375)
  const isPaceGood = currentPace > 0 && currentPace <= 5.9375;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.header, { color: colors.text }]}>Live Run Tracker</Text>
        <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Goal: 3.2km &lt; 19 min (5:56/km)</Text>

        <View style={styles.statsContainer}>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Distance</Text>
            <Text style={[styles.value, { color: colors.text }]}>{distanceKm.toFixed(2)} km</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Time</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatTime(elapsedTimeSec)}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundElement, 
            borderColor: isTracking && currentPace > 0 ? (isPaceGood ? '#10b981' : '#ef4444') : 'transparent',
            borderWidth: 2
          }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Current Pace</Text>
            <Text style={[styles.value, { color: isTracking && currentPace > 0 ? (isPaceGood ? '#10b981' : '#ef4444') : colors.text }]}>
              {formatPace(currentPace)} /km
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {!isTracking ? (
            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startRun}>
              <Text style={styles.buttonText}>START RUN</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRun}>
              <Text style={styles.buttonText}>STOP RUN</Text>
            </TouchableOpacity>
          )}
        </View>

        {isTracking && (
          <Text style={[styles.coachStatus, { color: colors.textSecondary }]}>
            🎙️ Voice Coach is active. Keep going!
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.one,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: Spacing.five,
  },
  statsContainer: {
    width: '100%',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing.four,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#0284c7',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  coachStatus: {
    marginTop: Spacing.four,
    fontSize: 14,
    fontWeight: '500',
  },
});
