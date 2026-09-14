import React, { useState, useEffect } from 'react';
import { WeddingConfigProvider } from './context/WeddingConfigContext';
import { AdminPage } from './components/AdminPage';
import { EnvelopeIntro } from './components/EnvelopeIntro';
import { AudioPlayer } from './components/AudioPlayer';
import { HeroSection } from './components/HeroSection';
import { ScratchCardSection } from './components/ScratchCardSection';
import { TraditionalInviteSection } from './components/TraditionalInviteSection';
import { CountdownSection } from './components/CountdownSection';
import { TimelineSection } from './components/TimelineSection';
import { VenueSection } from './components/VenueSection';
import { DressCodeSection } from './components/DressCodeSection';
import { RsvpSection } from './components/RsvpSection';
import { FooterSection } from './components/FooterSection';
import { Settings } from 'lucide-react';

function PublicInvitation({ onNavigateAdmin }: { onNavigateAdmin: () => void }) {
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <div className="app-wrapper">
      {/* Floating Link to /admin */}
      <button
        onClick={onNavigateAdmin}
        className="admin-floating-trigger"
        aria-label="Open Admin Dashboard"
        title="Admin Dashboard (/admin)"
      >
        <Settings size={18} />
        <span>Admin</span>
      </button>

      {/* 1. Interactive Video / Envelope Intro */}
      <EnvelopeIntro onOpen={() => setHasOpened(true)} />

      {/* 2. Floating Audio Controller */}
      <AudioPlayer autoPlayTrigger={hasOpened} />

      {/* 3. Main Invitation Container */}
      <div className="invitation-frame">
        <div className="sparkle-bg" />

        <HeroSection />
        <ScratchCardSection />
        <TraditionalInviteSection />
        <CountdownSection />
        <TimelineSection />
        <VenueSection />
        <DressCodeSection />
        <RsvpSection />
        <FooterSection />
      </div>
    </div>
  );
}

export function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname.toLowerCase();
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.toLowerCase());
    window.scrollTo(0, 0);
  };

  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath === '/admin/' ||
    window.location.search.includes('admin') ||
    window.location.hash === '#admin';

  return (
    <WeddingConfigProvider>
      {isAdminRoute ? (
        <AdminPage onNavigateHome={() => navigateTo('/')} />
      ) : (
        <PublicInvitation onNavigateAdmin={() => navigateTo('/admin')} />
      )}
    </WeddingConfigProvider>
  );
}

export default App;
