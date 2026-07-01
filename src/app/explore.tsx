import React from 'react';
import { ScrollView, StyleSheet, Text, View, useColorScheme, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

export default function ExploreScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>📘 Sub-18 Training Guide</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            How to build endurance and speed to crush the 3.2km goal
          </Text>
        </View>

        {/* Tip 1 */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>⏱️ Pace Breakdown</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Completing <Text style={{ fontWeight: 'bold', color: colors.text }}>3.2 km (2 miles)</Text> in under <Text style={{ fontWeight: 'bold', color: colors.text }}>18 minutes</Text> requires maintaining a steady decimal pace of <Text style={{ fontWeight: 'bold', color: colors.text }}>5.61 min/km (5:37/km)</Text> or faster.
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • <Text style={{ fontWeight: '600', color: colors.text }}>400m Lap time:</Text> Target 2 minutes and 15 seconds per lap.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • <Text style={{ fontWeight: '600', color: colors.text }}>1km Split:</Text> Should be under 5:37.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • <Text style={{ fontWeight: '600', color: colors.text }}>1.6km (1 mile) Split:</Text> Should be under 9:00.
            </Text>
          </View>
        </View>

        {/* Tip 2 */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🏃 Recommended Workouts</Text>
          
          <Text style={[styles.workoutHeader, { color: colors.text }]}>1. Speed Intervals (Once a week)</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Run 4 to 6 repeats of 400 meters at a pace slightly faster than your target goal pace (~5:15/km or 2:06/lap), with a 90-second jog/walk recovery in between. This builds aerobic capacity and leg speed.
          </Text>

          <Text style={[styles.workoutHeader, { color: colors.text }]}>2. Tempo Runs (Once a week)</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Perform a continuous 4km run at a moderate hard intensity (about 6:00/km). This raises your lactate threshold, allowing you to sustain the target pace for longer periods.
          </Text>

          <Text style={[styles.workoutHeader, { color: colors.text }]}>3. Easy Long Runs (Weekend)</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Run 5km to 7km at a relaxed, conversational pace (6:30/km to 7:00/km). Long runs build the basic cardiovascular engine and muscle capillary network required for the distance.
          </Text>
        </View>

        {/* Tip 3 */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>💪 Key Tips for Success</Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • <Text style={{ fontWeight: '600', color: colors.text }}>Warm Up:</Text> Spend 5-10 minutes dynamic stretching and light jogging before starting a time trial or interval session.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • <Text style={{ fontWeight: '600', color: colors.text }}>Consistency:</Text> Run 3-4 days per week. Avoid running hard every day to prevent shin splints and injury.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • <Text style={{ fontWeight: '600', color: colors.text }}>Pacing:</Text> Do not start the first kilometer too fast! Keep a steady rhythm and push the final 800 meters.
            </Text>
          </View>
        </View>

        {/* Footer Link */}
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.runnerstribe.com/')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Explore Running Articles & Resources</Text>
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    marginVertical: Spacing.two,
  },
  title: {
    fontSize: 24,
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  workoutHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.two,
    marginBottom: Spacing.half,
  },
  bulletList: {
    marginTop: Spacing.one,
    gap: Spacing.one,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkButton: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: '#0284c7',
    fontSize: 14,
    fontWeight: '600',
  },
});
