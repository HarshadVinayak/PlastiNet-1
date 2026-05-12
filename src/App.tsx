import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useRewardStore } from './stores/rewardStore';
import { useSubscriptionStore } from './stores/subscriptionStore';

import Onboarding from './components/shared/Onboarding';
import ChloeFloatingButton from './components/ui/ChloeFloatingButton';
import GlobalSearchOverlay from './components/ui/GlobalSearchOverlay';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Upload = lazy(() => import('./pages/Upload'));
const AIResult = lazy(() => import('./pages/AIResult'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Community = lazy(() => import('./pages/Community'));
const Profile = lazy(() => import('./pages/Profile'));
const HistoryPage = lazy(() => import('./pages/History'));
const OrgDashboard = lazy(() => import('./pages/OrgDashboard'));
const Competitions = lazy(() => import('./pages/Competitions'));
const EnvironmentMap = lazy(() => import('./pages/EnvironmentMap'));
const Auth = lazy(() => import('./pages/Auth'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const Premium = lazy(() => import('./pages/Premium'));
const Ambiente = lazy(() => import('./pages/Ambiente'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Redeem = lazy(() => import('./pages/Redeem'));
const QuotaDashboard = lazy(() => import('./pages/QuotaDashboard'));
const UpcycleGuide = lazy(() => import('./pages/UpcycleGuide'));
const RecycleGuide = lazy(() => import('./pages/RecycleGuide'));

function App() {
  const { initialized, initialize, isAuthenticated, profile, loading } = useAuthStore();
  const { fetchWallet } = useRewardStore();
  const { fetchSubscription } = useSubscriptionStore();
  const { theme, applyTheme } = useUIStore();
  const [hasOnboarded, setHasOnboarded] = React.useState(() => {
    return localStorage.getItem('plastinet_onboarded') === 'true';
  });

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        await initialize();
      }
      if (isAuthenticated) {
        fetchWallet();
        fetchSubscription();
      }
    };
    init();
  }, [initialized, initialize, isAuthenticated, fetchWallet, fetchSubscription]);

  // System theme change listener
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('plastinet_onboarded', 'true');
    setHasOnboarded(true);
  };

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Only show loading after onboarding, and only if still initializing session
  if (!initialized && loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-deep">
        <div className="w-12 h-12 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin"></div>
      </div>
    );
  }

  const toastOptions = {
    style: {
      background: 'var(--bg-panel)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-glass)',
      backdropFilter: 'blur(10px)',
    },
    success: {
      iconTheme: { primary: 'var(--color-primary)', secondary: '#000' },
    },
  };

  const Loader = () => (
    <div className="flex h-screen items-center justify-center bg-dark-deep">
      <div className="w-12 h-12 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin"></div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<Loader />}>
        <Toaster position="bottom-center" toastOptions={toastOptions as any} />
        <Auth />
      </Suspense>
    );
  }

  // Profile Setup Gate (Bypassed as per user request)
  /*
  if (!profile?.username) {
    return (
      <Suspense fallback={<Loader />}>
        <Toaster position="bottom-center" toastOptions={toastOptions as any} />
        <ProfileSetup />
      </Suspense>
    );
  }
  */

  return (
    <>
      <ChloeFloatingButton />
      <GlobalSearchOverlay />
      <Toaster position="bottom-center" toastOptions={toastOptions as any} />
      
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/result" element={<AIResult />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/org-dashboard" element={<OrgDashboard />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/map" element={<EnvironmentMap />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/ambiente" element={<Ambiente />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/telemetry" element={<QuotaDashboard />} />
            <Route path="/upcycle-guide" element={<UpcycleGuide />} />
            <Route path="/recycle-guide" element={<RecycleGuide />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App;
