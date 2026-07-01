import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export function useLocationTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedTimeSec, setElapsedTimeSec] = useState(0);
  const [currentPace, setCurrentPace] = useState(0); // min/km
  
  const lastLocation = useRef<LocationData | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Haversine formula to calculate distance between two coordinates in km
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI/180);

  useEffect(() => {
    if (isTracking) {
      // Start Timer
      timerInterval.current = setInterval(() => {
        setElapsedTimeSec((prev) => prev + 1);
      }, 1000);

      // Start Location Tracking
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          setIsTracking(false);
          return;
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            const timestamp = location.timestamp;
            
            if (lastLocation.current) {
              const dist = getDistanceFromLatLonInKm(
                lastLocation.current.latitude,
                lastLocation.current.longitude,
                latitude,
                longitude
              );
              
              const timeDiffSec = (timestamp - lastLocation.current.timestamp) / 1000;
              
              if (dist > 0 && timeDiffSec > 0) {
                setDistanceKm((prev) => prev + dist);
                // Calculate moving pace for this segment in min/km
                const segmentPace = (timeDiffSec / 60) / dist;
                // Simple smoothing for current pace
                setCurrentPace((prev) => prev === 0 ? segmentPace : (prev * 0.7 + segmentPace * 0.3));
              }
            }
            
            lastLocation.current = { latitude, longitude, timestamp };
          }
        );
      })();
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (locationSubscription.current) locationSubscription.current.remove();
    };
  }, [isTracking]);

  const startRun = () => {
    setDistanceKm(0);
    setElapsedTimeSec(0);
    setCurrentPace(0);
    lastLocation.current = null;
    setIsTracking(true);
  };

  const stopRun = () => {
    setIsTracking(false);
  };

  return {
    isTracking,
    distanceKm,
    elapsedTimeSec,
    currentPace,
    startRun,
    stopRun,
  };
}
