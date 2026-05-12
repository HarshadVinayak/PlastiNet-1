import { motion, AnimatePresence } from 'framer-motion';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { MapPin, PieChart, X, Navigation, Loader2, Search, Sun } from 'lucide-react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useGPS, GPSCoords } from '../hooks/useGPS';
import { CONFIG } from '../config';
import toast from 'react-hot-toast';
import { solarService } from '../services/solar';

const ImpactAnalytics = lazy(() => import('./ImpactAnalytics'));

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 }; // Chennai

// ── Overpass API: fetch dustbins / waste containers near a point ──────────────
async function fetchDustbins(lat: number, lng: number, radiusM = 2000, signal?: AbortSignal) {
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="waste_basket"](around:${radiusM},${lat},${lng});
      node["amenity"="waste_disposal"](around:${radiusM},${lat},${lng});
      node["amenity"="recycling"](around:${radiusM},${lat},${lng});
    );
    out body;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    signal
  });
  const data = await res.json();
  return (data.elements || []) as Array<{ id: number; lat: number; lon: number; tags?: Record<string, string> }>;
}

// ── OpenAQ v3: fetch nearest air quality locations ────────────────────────────
async function fetchAQStations(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://api.openaq.org/v3/locations?coordinates=${lat},${lng}&radius=25000&limit=10&order_by=distance`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();
    return (data.results || []) as Array<{
      id: number;
      name: string;
      coordinates: { latitude: number; longitude: number };
      parameters: Array<{ parameter: string; lastValue: number; unit: string }>;
    }>;
  } catch {
    return [];
  }
}

// ── AQI colour ────────────────────────────────────────────────────────────────
function aqiColor(pm25: number) {
  if (pm25 <= 12) return '#39FF14';   // Good
  if (pm25 <= 35) return '#FFD700';   // Moderate
  if (pm25 <= 55) return '#FF8C00';   // Unhealthy for sensitive
  return '#EF4444';                    // Unhealthy
}

const PlacesAutocomplete = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const options = { fields: ['geometry', 'name', 'formatted_address'] };
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted/40" size={18} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search eco-hubs or locations..."
        className="w-full bg-txt-primary/5 border border-dark-border/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-txt-primary focus:outline-none focus:border-neon-cyan/50 transition-all placeholder:text-txt-muted/20"
      />
    </div>
  );
};

const DirectionsHandler = ({ routeStr }: { routeStr: string | null }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ 
      map, 
      polylineOptions: { strokeColor: '#39FF14', strokeWeight: 5 } 
    }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !routeStr) return;
    const [originStr, destStr] = routeStr.split('|');
    const [olat, olng] = originStr.split(',');
    const [dlat, dlng] = destStr.split(',');

    directionsService.route({
      origin: { lat: parseFloat(olat), lng: parseFloat(olng) },
      destination: { lat: parseFloat(dlat), lng: parseFloat(dlng) },
      travelMode: google.maps.TravelMode.WALKING,
    }).then(response => {
      directionsRenderer.setDirections(response);
    }).catch(e => {
      toast.error('Could not fetch eco-route.');
      console.error(e);
    });
  }, [directionsService, directionsRenderer, routeStr]);

  return null;
};

const MapInner = () => {
  const map = useMap();
  const { coords, locationLabel } = useGPS();
  const [showImpact, setShowImpact] = useState(false);
  
  const [bins, setBins] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loadingBins, setLoadingBins] = useState(false);
  
  const [routeStr, setRouteStr] = useState<string | null>(null);
  const [solarMode, setSolarMode] = useState(false);
  const [selectedSolarData, setSelectedSolarData] = useState<any>(null);
  
  const center = coords ? { lat: coords.lat, lng: coords.lng } : DEFAULT_CENTER;
  const lastFetchedCoords = useRef<GPSCoords | null>(null);

  useEffect(() => {
    if (!coords || !map) return;
    
    // Distance-based optimization
    if (lastFetchedCoords.current) {
      const distLat = Math.abs(coords.lat - lastFetchedCoords.current.lat);
      const distLng = Math.abs(coords.lng - lastFetchedCoords.current.lng);
      if (distLat < 0.001 && distLng < 0.001) {
        return; // moved very little
      }
    }
    lastFetchedCoords.current = coords;

    setLoadingBins(true);
    const controller = new AbortController();
    fetchDustbins(coords.lat, coords.lng, 2000, controller.signal).then(b => {
      setBins(b);
      setLoadingBins(false);
      if (b.length === 0) toast('No mapped dustbins found nearby.', { icon: '🗑️' });
      else toast.success(`Found ${b.length} real bin locations!`);
    }).catch(() => setLoadingBins(false));

    fetchAQStations(coords.lat, coords.lng).then(s => setStations(s));
  }, [coords, map]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (place?.geometry?.viewport && map) {
      map.fitBounds(place.geometry.viewport);
    } else if (place?.geometry?.location && map) {
      map.panTo(place.geometry.location);
      map.setZoom(15);
    }
  };

  const handleMapClick = async (e: import('@vis.gl/react-google-maps').MapMouseEvent) => {
    if (!solarMode || !e.detail.latLng) return;
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    
    const loadId = toast.loading('Analyzing building solar potential...');
    try {
      const data = await solarService.getBuildingSolarPotential(lat, lng);
      if (data) {
        toast.success('Solar analysis complete!', { id: loadId });
        setSelectedSolarData({ lat, lng, ...data });
      } else {
        toast.error('No solar data available for this specific building.', { id: loadId });
      }
    } catch (err) {
      toast.error('Failed to analyze solar potential.', { id: loadId });
    }
  };

  const handleGetRoute = (destLat: number, destLng: number) => {
    if (!coords) return toast.error('GPS not available');
    setRouteStr(`${coords.lat},${coords.lng}|${destLat},${destLng}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="flex-1 w-full">
          <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3 text-txt-primary uppercase italic">
            <MapPin className="text-neon-cyan" /> Live Impact Map
          </h1>
          <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSolarMode(!solarMode)}
            className={`btn-secondary flex items-center gap-2 py-2 px-4 border rounded-2xl transition-all ${
              solarMode ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'bg-txt-primary/5 border-dark-border/10 text-txt-muted'
            }`}
          >
            <Sun size={18} /> Solar Tool
          </button>
          <button
            onClick={() => map?.panTo(center)}
            className="btn-secondary flex items-center gap-2 py-2 px-4 bg-neon-green/10 border-neon-green/20 text-neon-green hover:bg-neon-green/20 rounded-2xl border transition-all"
          >
            <Navigation size={18} />
          </button>
          <button
            onClick={() => setShowImpact(true)}
            className="btn-secondary flex items-center gap-2 py-2 px-4 bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20 rounded-2xl border transition-all"
          >
            <PieChart size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden border-dark-border/10 relative z-0 rounded-[2.5rem] min-h-[500px]">
        <Map
          defaultZoom={14}
          defaultCenter={DEFAULT_CENTER}
          mapId="e58e653ea91cf976" // Dark map style standard ID or random string for default styling
          onClick={handleMapClick}
          disableDefaultUI={true}
          gestureHandling="greedy"
        >
          {coords && (
            <AdvancedMarker position={{ lat: coords.lat, lng: coords.lng }}>
              <Pin background="#39FF14" borderColor="#000" glyphColor="#000" />
            </AdvancedMarker>
          )}

          {bins.map(bin => {
            const isRecycling = bin.tags?.amenity === 'recycling';
            return (
              <AdvancedMarker 
                key={bin.id} 
                position={{ lat: bin.lat, lng: bin.lon }}
                onClick={() => handleGetRoute(bin.lat, bin.lon)}
              >
                <Pin background={isRecycling ? "#00FFFF" : "#39FF14"} scale={0.8} />
              </AdvancedMarker>
            );
          })}

          {stations.map(station => {
            const pm25Param = station.parameters?.find((p: any) => p.parameter === 'pm25' || p.parameter === 'PM25');
            const pm25 = pm25Param?.lastValue ?? 30;
            return (
              <AdvancedMarker key={station.id} position={{ lat: station.coordinates.latitude, lng: station.coordinates.longitude }}>
                 <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-black" style={{ backgroundColor: aqiColor(pm25) }}>
                    {pm25.toFixed(0)}
                 </div>
              </AdvancedMarker>
            );
          })}

          {selectedSolarData && (
             <AdvancedMarker position={{ lat: selectedSolarData.lat, lng: selectedSolarData.lng }}>
               <div className="bg-black/90 border border-yellow-400 text-yellow-400 p-3 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                 <div className="font-black flex items-center gap-2"><Sun size={14}/> Solar Potential</div>
                 <div className="text-xs text-white/80 mt-1">Panels: <b className="text-white">{selectedSolarData.solarPanels}</b></div>
                 <div className="text-xs text-white/80">Sunlight: <b className="text-white">{selectedSolarData.sunlightHoursPerYear} hr/yr</b></div>
                 <div className="text-xs text-white/80">Offset: <b className="text-white">{selectedSolarData.carbonOffsetTonsPerYear} tons CO2/yr</b></div>
               </div>
             </AdvancedMarker>
          )}

          <DirectionsHandler routeStr={routeStr} />
        </Map>

        {/* Loading overlay */}
        {loadingBins && (
          <div className="absolute top-6 right-6 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 text-white">
            <Loader2 size={14} className="animate-spin text-neon-green" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Fetching real locations…</span>
          </div>
        )}
      </div>

      {/* Impact Modal */}
      <AnimatePresence>
        {showImpact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-black/95 backdrop-blur-2xl p-8 overflow-y-auto custom-scrollbar rounded-[2.5rem]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                <PieChart className="text-neon-cyan" /> Regional Impact Analytics
              </h2>
              <button onClick={() => setShowImpact(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={32} />
              </button>
            </div>
            <Suspense fallback={<div className="h-96 flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">Loading Intelligence Analytics...</div>}>
              <ImpactAnalytics />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EnvironmentMap = () => {
  return (
    <APIProvider apiKey={CONFIG.API_KEYS.GOOGLE || ''}>
      <MapInner />
    </APIProvider>
  );
};

export default EnvironmentMap;
