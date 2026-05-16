import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, ChevronRight, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import toast from 'react-hot-toast';

// Simplified Location Data for demonstration (Focused on India)
const LOCATION_DATA: any = {
  "India": {
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"]
  },
  "USA": {
    "California": ["Los Angeles", "San Francisco", "San Diego"],
    "New York": ["New York City", "Buffalo", "Rochester"],
    "Texas": ["Houston", "Austin", "Dallas"]
  }
};

interface LocationSettingsProps {
  onClose: () => void;
}

const LocationSettings = ({ onClose }: LocationSettingsProps) => {
  const { profile, updateProfile } = useAuthStore();
  const { updateLocation, coords, city } = useLocationStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || '');
  const [selectedState, setSelectedState] = useState(profile?.state || '');
  const [selectedDistrict, setSelectedDistrict] = useState(profile?.district || '');
  const [pincode, setPincode] = useState(profile?.pincode || '');

  const countries = Object.keys(LOCATION_DATA);
  const states = selectedCountry ? Object.keys(LOCATION_DATA[selectedCountry] || {}) : [];
  const districts = (selectedCountry && selectedState) ? LOCATION_DATA[selectedCountry][selectedState] || [] : [];

  const handleSave = async () => {
    if (!selectedCountry || !selectedState || !selectedDistrict || !pincode) {
      return toast.error("Please fill all location fields.");
    }

    setLoading(true);
    try {
      await updateProfile({
        country: selectedCountry,
        state: selectedState,
        district: selectedDistrict,
        pincode: pincode
      });

      // Sync with global location store
      await updateLocation(
        coords?.lat || 0,
        coords?.lng || 0,
        {
          city: selectedDistrict,
          district: selectedDistrict,
          pincode: pincode
        }
      );

      toast.success("Location identity updated!");
      onClose();
    } catch (error) {
      toast.error("Failed to update location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-dark-deep/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full mx-auto shadow-[0_0_100px_rgba(0,255,255,0.1)]"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Globe className="text-neon-cyan" /> Add Location
          </h2>
          <p className="text-txt-muted text-sm mt-1 uppercase tracking-widest">Regional Identity & Analysis Setup</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Country Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-txt-muted ml-1">Country</label>
          <div className="relative">
            <select 
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState('');
                setSelectedDistrict('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-txt-primary appearance-none focus:outline-none focus:border-neon-cyan transition-all"
            >
              <option value="" className="bg-dark-deep">Select Country</option>
              {countries.map(c => <option key={c} value={c} className="bg-dark-deep">{c}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none rotate-90" size={18} />
          </div>
        </div>

        {/* State Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-txt-muted ml-1">State / Province</label>
          <div className="relative">
            <select 
              disabled={!selectedCountry}
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-txt-primary appearance-none focus:outline-none focus:border-neon-cyan transition-all disabled:opacity-30"
            >
              <option value="" className="bg-dark-deep">Select State</option>
              {states.map(s => <option key={s} value={s} className="bg-dark-deep">{s}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none rotate-90" size={18} />
          </div>
        </div>

        {/* District Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-txt-muted ml-1">District / City</label>
          <div className="relative">
            <select 
              disabled={!selectedState}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-txt-primary appearance-none focus:outline-none focus:border-neon-cyan transition-all disabled:opacity-30"
            >
              <option value="" className="bg-dark-deep">Select District</option>
              {districts.map((d: string) => <option key={d} value={d} className="bg-dark-deep">{d}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none rotate-90" size={18} />
          </div>
        </div>

        {/* Pincode Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-txt-muted ml-1">Pincode / Zip Code</label>
          <input 
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g. 600001"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-txt-primary focus:outline-none focus:border-neon-cyan transition-all placeholder:text-txt-muted/20 font-bold"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,255,255,0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className="w-full btn-primary py-5 mt-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-black uppercase italic shadow-[0_0_20px_rgba(0,255,255,0.2)]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Check />}
          {loading ? 'Securing Identity...' : 'Confirm Regional Identity'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LocationSettings;
