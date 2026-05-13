import { CONFIG } from '../../config';

export interface EcoPlace {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number;
  placeId: string;
}

class GooglePlacesService {
  private static instance: GooglePlacesService;
  private cache: Map<string, { data: EcoPlace[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  private constructor() {}

  static getInstance(): GooglePlacesService {
    if (!GooglePlacesService.instance) {
      GooglePlacesService.instance = new GooglePlacesService();
    }
    return GooglePlacesService.instance;
  }

  async findNearbyRecycling(lat: number, lng: number, radius: number = 6000): Promise<EcoPlace[]> {
    const cacheKey = `${lat},${lng},${radius}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    if (!CONFIG.API_KEYS.GOOGLE_MAPS) {
      console.warn('Google Maps API key missing');
      return [];
    }

    try {
      // Use the Google Places Nearby Search
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=recycling+center&key=${CONFIG.API_KEYS.GOOGLE_MAPS}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const places: EcoPlace[] = data.results.map((item: any) => ({
        name: item.name,
        address: item.vicinity,
        location: item.geometry.location,
        rating: item.rating,
        placeId: item.place_id
      }));

      this.cache.set(cacheKey, { data: places, timestamp: Date.now() });
      return places;
    } catch (error) {
      console.error('Failed to fetch nearby recycling:', error);
      return [];
    }
  }
}

export const googlePlaces = GooglePlacesService.getInstance();
