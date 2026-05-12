import { CONFIG } from '../config';

export interface RouteInfo {
  distance: string;
  duration: string;
  polyline: string;
}

export const directionsService = {
  async getRoute(origin: { lat: number, lng: number }, destination: string): Promise<RouteInfo | null> {
    if (!CONFIG.API_KEYS.GOOGLE) return null;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${encodeURIComponent(destination)}&key=${CONFIG.API_KEYS.GOOGLE}`
      );

      if (!response.ok) throw new Error('Directions API failed');

      const data = await response.json();
      const route = data.routes[0];

      if (!route) return null;

      const leg = route.legs[0];
      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: route.overview_polyline.points
      };
    } catch (error) {
      console.error('Directions Service Error:', error);
      return null;
    }
  }
};
