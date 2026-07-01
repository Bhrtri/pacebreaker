import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';

const TARGET_PACE = 5.9375; // 5:56 min/km (19 mins for 3.2km)
const INTERVAL_DISTANCE_KM = 0.5;

export function useVoiceCoach(
  isTracking: boolean,
  distanceKm: number,
  elapsedTimeSec: number,
  currentPace: number
) {
  const lastAnnouncedDistance = useRef(0);
  const lastPaceWarningTime = useRef(0);
  const isCurrentlyBehind = useRef(false);

  const formatPaceToSpeech = (pace: number) => {
    if (pace === 0) return '0 minutes per kilometer';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins} minutes and ${secs} seconds per kilometer`;
  };

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
    });
  };

  useEffect(() => {
    if (!isTracking) return;

    // 1. Distance Interval Updates (every 0.5km)
    if (distanceKm - lastAnnouncedDistance.current >= INTERVAL_DISTANCE_KM) {
      lastAnnouncedDistance.current += INTERVAL_DISTANCE_KM;
      
      const avgPace = (elapsedTimeSec / 60) / distanceKm;
      speak(
        `You have reached ${lastAnnouncedDistance.current.toFixed(1)} kilometers. ` +
        `Total time is ${Math.floor(elapsedTimeSec / 60)} minutes and ${elapsedTimeSec % 60} seconds. ` +
        `Average pace is ${formatPaceToSpeech(avgPace)}.`
      );
    }

    // 2. Dynamic Pace Interventions (check every 20 seconds roughly)
    // Avoid warning in the first 30 seconds to let pace stabilize
    if (elapsedTimeSec > 30 && elapsedTimeSec - lastPaceWarningTime.current > 20) {
      if (currentPace > TARGET_PACE + 0.1) { // 0.1 buffer
        speak(`Pace is dropping. Current pace is ${formatPaceToSpeech(currentPace)}. Speed up to hit your 19 minute target!`);
        lastPaceWarningTime.current = elapsedTimeSec;
        isCurrentlyBehind.current = true;
      } else if (currentPace <= TARGET_PACE && isCurrentlyBehind.current) {
        speak(`Great job! You are back on track with a pace of ${formatPaceToSpeech(currentPace)}.`);
        lastPaceWarningTime.current = elapsedTimeSec;
        isCurrentlyBehind.current = false;
      }
    }

  }, [isTracking, distanceKm, elapsedTimeSec, currentPace]);

  return {
    speak, // Expose if we want manual triggers
  };
}
