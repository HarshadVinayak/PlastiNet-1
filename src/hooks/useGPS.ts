import { useState, useEffect, useRef } from 'react';

export type GPSStatus = 'locating' | 'ok' | 'denied';

export interface GPSCoords {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface UseGPSResult {
  coords: GPSCoords | null;
  status: GPSStatus;
  locationLabel: string; // reverse-geocoded city/district
}

// Singleton: share one permission request + one watchPosition across all consumers
let sharedCoords: GPSCoords | null = null;
let sharedStatus: GPSStatus = 'locating';
let sharedLabel: string = '';
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

let watchId: number | null = null;

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const { CONFIG } = await import('../config');
  if (!CONFIG.API_KEYS.GOOGLE) return 'Your Area';

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${CONFIG.API_KEYS.GOOGLE}`
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      // Find the most relevant address component (e.g., locality or sublocality)
      const result = data.results[0];
      const city = result.address_components.find((c: any) => 
        c.types.includes('locality') || 
        c.types.includes('sublocality_level_1') || 
        c.types.includes('administrative_area_level_2')
      );
      return city ? city.long_name : 'Your Area';
    }
    return 'Your Area';
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    return 'Your Area';
  }
}

function startGPS() {
  if (!navigator.geolocation) {
    sharedStatus = 'denied';
    notify();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      sharedCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
      sharedStatus = 'ok';
      notify();
      sharedLabel = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      notify();
    },
    () => {
      sharedStatus = 'denied';
      notify();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );

  if (watchId === null) {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        sharedCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        sharedStatus = 'ok';
        notify();
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }
}

// Boot GPS on module load
startGPS();

export function useGPS(): UseGPSResult {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    listeners.add(rerender);
    return () => { listeners.delete(rerender); };
  }, []);

  return {
    coords: sharedCoords,
    status: sharedStatus,
    locationLabel: sharedLabel,
  };
}
