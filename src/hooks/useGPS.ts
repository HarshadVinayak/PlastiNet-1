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

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; district: string; pincode: string }> {
  const { CONFIG } = await import('../config');
  const fallback = { city: 'Your Area', district: 'Unknown District', pincode: '000000' };
  if (!CONFIG.API_KEYS.GOOGLE) return fallback;

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${CONFIG.API_KEYS.GOOGLE}`
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const components = result.address_components;
      
      const cityComp = components.find((c: any) => c.types.includes('locality'));
      const districtComp = components.find((c: any) => c.types.includes('administrative_area_level_2'));
      const pinComp = components.find((c: any) => c.types.includes('postal_code'));

      return {
        city: cityComp ? cityComp.long_name : 'Your Area',
        district: districtComp ? districtComp.long_name : 'Unknown District',
        pincode: pinComp ? pinComp.long_name : '000000'
      };
    }
    return fallback;
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    return fallback;
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
      
      const details = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      sharedLabel = details.city;
      
      // Sync with Global Location Store for Chloe AI
      const { useLocationStore } = await import('../stores/locationStore');
      useLocationStore.getState().updateLocation(pos.coords.latitude, pos.coords.longitude, details);
      
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
      async (pos) => {
        sharedCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        sharedStatus = 'ok';
        
        // Background sync for moving users
        const { useLocationStore } = await import('../stores/locationStore');
        const state = useLocationStore.getState();
        if (!state.coords || Math.abs(state.coords.lat - pos.coords.latitude) > 0.01) {
           const details = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
           state.updateLocation(pos.coords.latitude, pos.coords.longitude, details);
        }

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
