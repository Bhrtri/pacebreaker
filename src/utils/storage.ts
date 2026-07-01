import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Run {
  id: string;
  date: string; // YYYY-MM-DD
  distance_km: number;
  time_min: number;
  pace_km: number; // minutes per km
  delta_to_goal: number; // pace_km - 5.61
}

export interface Metrics {
  latest_pace: number | null;
  best_pace: number | null;
  latest_delta: number | null;
}

const STORAGE_KEY = '@pacebreaker_runs';
const TARGET_PACE = 5.61;

const MOCK_RUNS: Run[] = [
  {
    id: '1',
    date: '2026-06-25',
    distance_km: 3.0,
    time_min: 18.0,
    pace_km: 6.0,
    delta_to_goal: 0.39,
  },
  {
    id: '2',
    date: '2026-06-27',
    distance_km: 3.2,
    time_min: 18.5,
    pace_km: 5.78125,
    delta_to_goal: 0.17125,
  },
  {
    id: '3',
    date: '2026-06-30',
    distance_km: 3.2,
    time_min: 17.8,
    pace_km: 5.5625,
    delta_to_goal: -0.0475,
  },
];

export async function loadRuns(): Promise<Run[]> {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // Initialize with mock runs if empty
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_RUNS));
      return MOCK_RUNS;
    }
    const runs: Run[] = JSON.parse(rawData);
    // Sort runs chronologically by Date
    return runs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error loading runs:', error);
    return [];
  }
}

export async function addRun(date: string, distanceKm: number, timeMin: number): Promise<Run[]> {
  if (distanceKm <= 0 || timeMin <= 0) {
    throw new Error('Distance and time must be greater than zero.');
  }

  const pace_km = timeMin / distanceKm;
  const delta_to_goal = pace_km - TARGET_PACE;

  const newRun: Run = {
    id: Date.now().toString(),
    date,
    distance_km: distanceKm,
    time_min: timeMin,
    pace_km,
    delta_to_goal,
  };

  const currentRuns = await loadRuns();
  const updatedRuns = [...currentRuns, newRun];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRuns));
  return updatedRuns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function calculateMetrics(runs: Run[]): Metrics {
  if (runs.length === 0) {
    return {
      latest_pace: null,
      best_pace: null,
      latest_delta: null,
    };
  }

  // Sorted list is returned by loadRuns(), so last item is the latest chronologically
  const latestRun = runs[runs.length - 1];
  const latest_pace = latestRun.pace_km;
  const latest_delta = latestRun.delta_to_goal;

  // Best pace is the minimum pace_km
  const best_pace = Math.min(...runs.map((r) => r.pace_km));

  return {
    latest_pace,
    best_pace,
    latest_delta,
  };
}

// Helpers for formatted display
export function formatPace(paceDec: number | null): string {
  if (paceDec === null || isNaN(paceDec)) return 'N/A';
  const minutes = Math.floor(paceDec);
  const seconds = Math.round((paceDec - minutes) * 60);
  const correctedMinutes = seconds === 60 ? minutes + 1 : minutes;
  const correctedSeconds = seconds === 60 ? 0 : seconds;
  return `${correctedMinutes}:${correctedSeconds.toString().padStart(2, '0')}/km`;
}

export function formatDelta(delta: number | null): string {
  if (delta === null || isNaN(delta)) return 'N/A';
  const sign = delta > 0 ? '+' : '';
  const secondsDelta = Math.round(delta * 60);
  if (secondsDelta === 0) return '0s (On Goal)';

  const absSeconds = Math.abs(secondsDelta);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;

  if (mins > 0) {
    return `${sign}${mins}m ${secs}s`;
  }
  return `${sign}${secondsDelta}s`;
}
