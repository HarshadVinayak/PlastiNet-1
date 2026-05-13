import { create } from 'zustand';
import { googlePlaces, EcoPlace } from '../services/google/places';

interface LocationState {
  coords: { lat: number; lng: number } | null;
  city: string;
  nearbyPlaces: EcoPlace[];
  lastUpdate: number;

  updateLocation: (lat: number, lng: number, city: string) => Promise<void>;
  fetchNearby: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  city: '',
  nearbyPlaces: [],
  lastUpdate: 0,

  updateLocation: async (lat, lng, city) => {
    set({ coords: { lat, lng }, city });
    // Fetch nearby places automatically if they haven't been updated in 30 mins
    if (Date.now() - get().lastUpdate > 1000 * 60 * 30) {
      await get().fetchNearby();
    }
  },

  fetchNearby: async () => {
    const { coords } = get();
    if (!coords) return;

    try {
      const places = await googlePlaces.findNearbyRecycling(coords.lat, coords.lng);
      set({ nearbyPlaces: places, lastUpdate: Date.now() });
    } catch (error) {
      console.error('Failed to update nearby places for AI context:', error);
    }
  }
}));
