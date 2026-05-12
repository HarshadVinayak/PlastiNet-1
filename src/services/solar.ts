import { CONFIG } from '../config';
import { usageService } from './usage';

export interface SolarPotentialData {
  solarPanels: number;
  sunlightHoursPerYear: number;
  carbonOffsetTonsPerYear: number;
}

export const solarService = {
  async getBuildingSolarPotential(lat: number, lng: number): Promise<SolarPotentialData | null> {
    if (!CONFIG.API_KEYS.GOOGLE) return null;
    const startTime = Date.now();

    try {
      const response = await fetch(
        `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${CONFIG.API_KEYS.GOOGLE}`
      );

      const latency = Date.now() - startTime;
      usageService.logRequest('Solar', 'Building Insights API', response.status, latency);

      if (!response.ok) {
        if (response.status === 404) {
          // No data for this specific location
          return null;
        }
        throw new Error('Solar API failed');
      }

      const data = await response.json();
      const solarPotential = data.solarPotential;

      if (!solarPotential) return null;

      return {
        solarPanels: solarPotential.maxArrayPanelsCount || 0,
        sunlightHoursPerYear: Math.round(solarPotential.maxSunlightHoursPerYear || 0),
        carbonOffsetTonsPerYear: Math.round((solarPotential.carbonOffsetFactorKgPerMwh || 0) * (solarPotential.maxArrayPanelsCount || 0) * 0.4 / 1000)
      };
    } catch (error) {
      console.error('Solar Service Error:', error);
      usageService.logRequest('Solar', 'Building Insights API', 500, Date.now() - startTime);
      return null;
    }
  }
};
