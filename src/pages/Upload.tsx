import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload as UploadIcon, X, ShieldCheck, Zap, Sparkles, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { useVerificationStore } from '../stores/verificationStore';
import { analyzeBeforeImage } from '../ai/verification/beforeAnalyzer';
import { analyzeAfterImage } from '../ai/verification/afterAnalyzer';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState<'BEFORE' | 'DURING' | 'AFTER'>('BEFORE');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const startVerificationSession = useVerificationStore(state => state.startSession);
  const setDuringAction = useVerificationStore(state => state.setDuring);
  const clearSession = useVerificationStore(state => state.clearSession);
  const isSessionValid = useVerificationStore(state => state.isSessionValid);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    const session = useVerificationStore.getState().session;
    if (session) {
      if (session.duringImage) {
        setCurrentStep('AFTER');
      } else {
        setCurrentStep('DURING');
      }
    }
  }, []);

  const openCamera = async () => {
    setIsCameraOpen(true);
    setCameraLoading(true);
    setCameraError(null);
    setSelectedImage(null);

    try {
      // 1. Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser. Please use a modern browser or try the file upload.");
      }

      // 2. Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // 3. Define constraints - using exact for facingMode on mobile often helps
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        }
      };
      
      console.log("Camera: Requesting stream with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Important: Some browsers need a manual play() call
        try {
          await videoRef.current.play();
          console.log("Camera: Stream started successfully.");
        } catch (playErr) {
          console.warn("Camera: Auto-play failed, user interaction may be required:", playErr);
        }
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      let errorMessage = "Could not access camera.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Camera permission denied. Please enable it in your browser/system settings and refresh.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "Camera is already in use by another application.";
      } else if (err.name === 'OverconstrainedError') {
        // Fallback for strict constraints
        console.warn("Camera: Overconstrained, falling back to basic video...");
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallbackStream;
          if (videoRef.current) videoRef.current.srcObject = fallbackStream;
          return;
        } catch (innerErr: any) {
          errorMessage = innerErr.message;
        }
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    console.log("Camera: Stopping stream...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Camera: Track ${track.label} stopped.`);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCameraLoading(false);
  };

  const [analyzing, setAnalyzing] = useState(false);

  const captureImage = async () => {
    if (videoRef.current && videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
      console.log("Camera: Capturing frame for analysis...");
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        stopCamera();
        
        // --- CHLOE VISION ANALYSIS ---
        setAnalyzing(true);
        const loadId = toast.loading("Chloe is analyzing the visual footprint...");
        
        try {
          const { visionService } = await import('../services/vision');
          const analysis = await visionService.analyzeImage(dataUrl);
          
          if (analysis) {
            console.log("Chloe Vision Result:", analysis);
            if (!analysis.isSafe) {
              toast.error("Visual content rejected by safety filters.", { id: loadId });
              setSelectedImage(null);
              return;
            }
            
            const labels = analysis.labels.map(l => l.description.toLowerCase());
            const hasPlastic = labels.some(l => l.includes('plastic') || l.includes('bottle') || l.includes('waste'));
            
            if (hasPlastic) {
              toast.success("Plastic waste detected! Processing rewards...", { id: loadId });
              
              // 1. Log to Unified History
              const { useHistoryStore } = await import('../stores/historyStore');
              useHistoryStore.getState().addItem({
                type: 'SCAN',
                title: labels[0] || 'Unknown Plastic Object',
                description: `Verified ${labels[0]} detection with ${Math.round(analysis.labels[0].score * 100)}% confidence. Rewards pending.`,
                metadata: { labels, confidence: analysis.labels[0].score }
              });

              // Suggest search
              setTimeout(() => {
                toast((t) => (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold">Want disposal tips for this?</p>
                    <button 
                      onClick={() => {
                        toast.dismiss(t.id);
                        const { useUIStore } = require('../stores/uiStore');
                        useUIStore.getState().setSearchOpen(true);
                        // Future: Auto-populate search with query
                      }}
                      className="bg-neon-green text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase"
                    >
                      Ask Chloe Search
                    </button>
                  </div>
                ), { duration: 6000 });
              }, 1500);
            } else {
              toast("No plastic detected, but you can still upload for review.", { id: loadId, icon: '🔍' });
              
              const { useHistoryStore } = await import('../stores/historyStore');
              useHistoryStore.getState().addItem({
                type: 'SCAN',
                title: 'Non-Plastic Scan',
                description: `Object identified as ${labels[0]}, but no plastic indicators found.`,
                metadata: { labels }
              });
            }

          } else {
            toast.dismiss(loadId);
          }
        } catch (err) {
          console.error("Vision error:", err);
          toast.dismiss(loadId);
        } finally {
          setAnalyzing(false);
        }
      }
    } else {
      toast.error("Camera not ready. Please wait a moment.");
    }
  };



  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to process image.");
    }
  };

  const startScan = async () => {
    if (!selectedImage) return;
    setIsScanning(true);
    
    try {
      if (currentStep === 'BEFORE') {
        const result = await analyzeBeforeImage(selectedImage);
        startVerificationSession(selectedImage, result);
        setIsScanning(false);
        navigate('/result', { state: { step: 'BEFORE' } });
      } else if (currentStep === 'DURING') {
        // DURING upload (Right Now)
        setDuringAction(selectedImage, { verified: true }); // Simulated analysis for now
        setIsScanning(false);
        navigate('/result', { state: { step: 'DURING' } });
      } else {
        // AFTER upload
        if (!isSessionValid()) {
          toast.error("Authenticity window: Please ensure at least 10s has passed since start.");
          setIsScanning(false);
          return;
        }
        
        const session = useVerificationStore.getState().session;
        if (!session) throw new Error("No session found");
        
        const result = await analyzeAfterImage(session.beforeData, selectedImage);
        
        setIsScanning(false);
        navigate('/result', { state: { isVerification: true, afterImage: selectedImage, afterAnalysis: result } });
      }
    } catch (error: any) {
      console.error("Scan failed", error);
      toast.error(error.message || "Failed to analyze image.");
      setIsScanning(false);
    }
  };

  const resetSession = () => {
    clearSession();
    setCurrentStep('BEFORE');
    setSelectedImage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-neon-green/10 rounded-full border border-neon-green/20 mb-4">
          <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === 'BEFORE' ? 'text-neon-green' : 'text-white/40'}`}>1. Before</span>
          <div className="w-4 h-px bg-white/10" />
          <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === 'DURING' ? 'text-neon-green' : 'text-white/40'}`}>2. Right Now</span>
          <div className="w-4 h-px bg-white/10" />
          <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === 'AFTER' ? 'text-neon-green' : 'text-white/40'}`}>3. After</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic tracking-tighter">
          {currentStep === 'BEFORE' ? 'Scan Initial Waste' : currentStep === 'DURING' ? 'Capture Action' : 'Final Result'}
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          {currentStep === 'BEFORE' 
            ? 'Phase 1: Chloe AI will detect the plastic footprint.' 
            : currentStep === 'DURING'
            ? 'Phase 2: Show people doing what Chloe instructed!'
            : 'Phase 3: The finished, cleaned environment.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div 
            className={`
              relative h-[450px] rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden
              ${dragActive ? 'border-neon-green bg-neon-green/5' : 'border-white/10 bg-white/5'}
              ${(selectedImage || isCameraOpen) ? 'border-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <AnimatePresence mode="wait">
              {isCameraOpen ? (
                <motion.div 
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black"
                >
                  <div className="absolute inset-0">
                    {cameraLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neon-green z-20 bg-black">
                        <Loader2 className="animate-spin mb-4" size={48} />
                        <span className="text-sm font-black uppercase tracking-widest animate-pulse">Initializing Chloe Vision...</span>
                      </div>
                    )}
                    
                    {cameraError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-30 bg-black/90 backdrop-blur-md">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                          <AlertTriangle className="text-red-500" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Camera Access Restricted</h3>
                        <p className="text-white/40 text-sm mb-8 max-w-xs">{cameraError}</p>
                        <div className="flex flex-col gap-3 w-full max-w-[200px]">
                          <button 
                            onClick={() => {
                              setCameraError(null);
                              openCamera();
                            }} 
                            className="btn-primary py-3 w-full"
                          >
                            Retry Access
                          </button>
                          <button 
                            onClick={stopCamera} 
                            className="btn-secondary py-3 w-full border-white/5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted
                          className="w-full h-full object-cover"
                        />
                        
                        {/* HUD Overlay */}
                        <div className="absolute inset-0 border-[2px] border-neon-green/20 pointer-events-none">
                          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-neon-green" />
                          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-neon-green" />
                          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-neon-green" />
                          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-neon-green" />
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 z-10">
                          <button 
                            onClick={stopCamera}
                            className="w-14 h-14 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <X size={28} />
                          </button>
                          <div className="relative">
                            <div className="absolute inset-0 bg-neon-green blur-xl opacity-20 animate-pulse" />
                            <button 
                              onClick={captureImage}
                              className="relative w-24 h-24 bg-neon-green rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:scale-105 active:scale-95 transition-all"
                            >
                              <Camera size={36} />
                            </button>
                          </div>
                          <div className="w-14 h-14" /> {/* Spacer */}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : !selectedImage ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 neon-border">
                    <Camera className="text-white/40" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {currentStep === 'BEFORE' ? 'Ready to Scan' : currentStep === 'DURING' ? 'Capture The Work' : 'Verify Result'}
                  </h3>
                  <p className="text-white/40 mb-8">Drag & drop image or click to choose file</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                    >
                      <UploadIcon size={20} />
                      Choose Image
                    </button>
                    <button 
                      onClick={openCamera}
                      className="btn-secondary"
                    >
                      <Camera size={20} />
                      Open Camera
                    </button>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 group"
                >
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="p-4 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {isScanning && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <motion.div 
                        animate={{ 
                          top: ['0%', '100%', '0%'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-neon-green shadow-[0_0_20px_#39FF14] z-10"
                      />
                      <Loader2 className="text-neon-green animate-spin mb-4" size={48} />
                      <p className="text-xl font-bold text-neon-green tracking-widest uppercase">Chloe AI Verifying...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-4">
            <button 
              disabled={!selectedImage || isScanning}
              onClick={startScan}
              className={`flex-1 btn-primary py-4 text-xl ${(!selectedImage || isScanning) && 'opacity-50 cursor-not-allowed grayscale'}`}
            >
              {isScanning ? 'Processing...' : currentStep === 'BEFORE' ? 'Analyze Before' : currentStep === 'DURING' ? 'Submit Right Now' : 'Analyze After'}
              {!isScanning && <ShieldCheck size={24} />}
            </button>
            {currentStep !== 'BEFORE' && (
              <button 
                onClick={resetSession}
                className="btn-secondary px-4"
              >
                <RefreshCw size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-neon-green/20">
            <h4 className="flex items-center gap-2 font-bold mb-4">
              <Zap className="text-neon-green" size={18} />
              AI Guidelines
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex gap-2">
                <span className="text-neon-green">•</span>
                Ensure lighting is clear
              </li>
              <li className="flex gap-2">
                <span className="text-neon-green">•</span>
                Show plastic labels if possible
              </li>
              <li className="flex gap-2">
                <span className="text-neon-green">•</span>
                One item per scan for 100% accuracy
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/5">
            <h4 className="flex items-center gap-2 font-bold mb-4">
              <Sparkles className="text-neon-cyan" size={18} />
              Expected Rewards
            </h4>
            <div className="space-y-4">
              <RewardItem label="Before Scan" value="+5" />
              <RewardItem label="Right Now Shot" value="+5" />
              <RewardItem label="After Verified" value="+10" />
              <div className="pt-2 border-t border-white/10">
                <RewardItem label="Total Potential" value="+20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RewardItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-white/40">{label}</span>
    <div className="flex items-center gap-1">
      <span className="text-neon-green font-mono">{value}</span>
      {value.includes('+') && (
        <img 
          src="/plasticoin.png" 
          alt="PLC" 
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/7036/7036798.png'; }}
          className="w-4 h-4 object-contain" 
        />
      )}
    </div>
  </div>
);

export default Upload;
